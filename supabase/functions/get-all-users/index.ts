import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function can only be called by authenticated users who have the 'admin' role.
// It uses the SERVICE_ROLE_KEY to bypass RLS and fetch all users and their profiles.

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's auth token to verify they are an admin
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user from the token
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError) throw userError;

    // Check if the user has the 'admin' role in their metadata
    if (user?.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If the user is an admin, create a client with the service role key to bypass RLS
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch all users from the auth.users table
    const { data: { users }, error: adminError } = await serviceClient.auth.admin.listUsers();
    if (adminError) throw adminError;

    // Fetch all profiles from public.profiles
    const { data: profiles, error: profilesError } = await serviceClient
      .from('profiles')
      .select('id, first_name, last_name');
    if (profilesError) throw profilesError;

    // Create a map of profiles for easy lookup
    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    // Combine user data with profile data
    const combinedUsers = users.map(u => ({
      ...u,
      first_name: profilesMap.get(u.id)?.first_name || null,
      last_name: profilesMap.get(u.id)?.last_name || null,
    }));

    return new Response(JSON.stringify({ users: combinedUsers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});