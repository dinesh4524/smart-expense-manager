import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the request and verify the user is an admin
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

    // 2. Get the target user's ID from the request body
    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400, headers: corsHeaders });
    }

    // 3. Create a service role client to bypass RLS
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 4. Fetch all data for the target user in parallel
    const [
        categoriesRes, 
        peopleRes, 
        paymentModesRes, 
        expensesRes, 
        debtsRes, 
        chitFundsRes
    ] = await Promise.all([
        serviceClient.from('categories').select('*').eq('user_id', userId),
        serviceClient.from('household_members').select('*').eq('user_id', userId),
        serviceClient.from('payment_modes').select('*').eq('user_id', userId),
        serviceClient.from('expenses').select('*').eq('user_id', userId),
        serviceClient.from('debts').select('*').eq('user_id', userId),
        serviceClient.from('chit_funds').select('*').eq('user_id', userId),
    ]);

    // 5. Check for errors
    const errors = [categoriesRes.error, peopleRes.error, paymentModesRes.error, expensesRes.error, debtsRes.error, chitFundsRes.error].filter(Boolean);
    if (errors.length > 0) {
        throw new Error(errors.map(e => e.message).join(', '));
    }

    // 6. Map snake_case from DB to camelCase for the frontend
    const mappedExpenses = expensesRes.data.map((e) => ({
        id: e.id, date: e.date, description: e.description, amount: e.amount,
        categoryId: e.category_id, personId: e.household_member_id, paymentModeId: e.payment_mode_id, receiptUrl: e.receipt_url,
    }));
    const mappedDebts = debtsRes.data.map((d) => ({
        id: d.id, personId: d.person_id, amount: d.amount, type: d.type, description: d.description,
        issueDate: d.issue_date, dueDate: d.due_date, status: d.status,
    }));
    const mappedChitFunds = chitFundsRes.data.map((c) => ({
        id: c.id, name: c.name, totalAmount: c.total_amount, monthlyInstallment: c.monthly_installment,
        durationMonths: c.duration_months, startDate: c.start_date, status: c.status,
    }));

    const responsePayload = {
        categories: categoriesRes.data,
        people: peopleRes.data,
        paymentModes: paymentModesRes.data,
        expenses: mappedExpenses,
        debts: mappedDebts,
        chitFunds: mappedChitFunds,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});