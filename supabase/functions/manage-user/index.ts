import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the request and check for admin role
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Authentication failed");
    if (user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Not an admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Create a service role client to perform admin actions
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await req.json();

    // 3. Handle different actions based on the 'action' field in the body
    switch (body.action) {
      case 'CREATE_USER': {
        const { email, password, first_name, last_name } = body.payload;
        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers: corsHeaders });
        }
        const { data, error } = await serviceClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm user
          user_metadata: {
            first_name,
            last_name,
            role: 'user' // Default role
          }
        });
        if (error) throw error;
        return new Response(JSON.stringify({ user: data.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'DELETE_USER': {
        const { userId } = body.payload;
        if (!userId) {
          return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400, headers: corsHeaders });
        }
        // Prevent admin from deleting themselves
        if (userId === user.id) {
            return new Response(JSON.stringify({ error: 'Admins cannot delete themselves' }), { status: 400, headers: corsHeaders });
        }
        const { data, error } = await serviceClient.auth.admin.deleteUser(userId);
        if (error) throw error;
        return new Response(JSON.stringify({ message: 'User deleted successfully' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});