import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, tokens } = await req.json();

    console.log('Adding tokens:', { email, tokens });

    // Find user by email
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }

    const targetUser = user.users.find(u => u.email === email);
    
    if (!targetUser) {
      throw new Error(`User with email ${email} not found`);
    }

    console.log('Found user:', targetUser.id);

    // Add tokens using the admin function
    const { data: result, error: tokenError } = await supabase.rpc('admin_add_tokens', {
      target_user_id: targetUser.id,
      token_amount: tokens
    });

    if (tokenError) {
      throw new Error(`Failed to add tokens: ${tokenError.message}`);
    }

    console.log('Tokens added successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully added ${tokens} tokens to ${email}`,
        user_id: targetUser.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});