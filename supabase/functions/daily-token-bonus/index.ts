import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🎁 Daily token bonus task started');

    // Call the database function to add daily tokens
    const { data, error } = await supabase.rpc('add_daily_tokens');

    if (error) {
      console.error('❌ Error adding daily tokens:', error);
      throw error;
    }

    // Get count of users who received tokens today
    const { data: bonusRecords, error: countError } = await supabase
      .from('usage_tracking')
      .select('count', { count: 'exact' })
      .eq('feature_type', 'daily_bonus')
      .eq('usage_date', new Date().toISOString().split('T')[0]);

    if (countError) {
      console.warn('⚠️ Could not get bonus count:', countError);
    }

    const usersCount = bonusRecords?.length || 0;
    console.log(`✅ Daily token bonus completed. ${usersCount} users received 3 tokens each.`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Daily token bonus completed for ${usersCount} users`,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Daily token bonus error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});