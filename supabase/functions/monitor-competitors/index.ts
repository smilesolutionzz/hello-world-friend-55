import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, competitorId, competitorData } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error('Firecrawl API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Competitor monitoring action:', action);

    if (action === 'add') {
      // Add new competitor to monitor
      const { error } = await supabase
        .from('competitor_monitoring')
        .insert({
          competitor_name: competitorData.name,
          website_url: competitorData.url,
          category: competitorData.category,
          is_active: true,
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: '경쟁사가 추가되었습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check') {
      // Get active competitors
      const { data: competitors, error: fetchError } = await supabase
        .from('competitor_monitoring')
        .select('*')
        .eq('is_active', true)
        .order('last_checked_at', { ascending: true, nullsFirst: true })
        .limit(5);

      if (fetchError) throw fetchError;
      if (!competitors || competitors.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: '모니터링할 경쟁사가 없습니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const results = [];

      for (const competitor of competitors) {
        try {
          console.log('Checking competitor:', competitor.competitor_name);

          const crawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: competitor.website_url,
              formats: ['markdown', 'html'],
              onlyMainContent: true,
            }),
          });

          if (crawlResponse.ok) {
            const data = await crawlResponse.json();
            
            if (data.success && data.data) {
              const newData = {
                title: data.data.metadata?.title || '',
                content: data.data.markdown?.substring(0, 2000) || '',
                lastChecked: new Date().toISOString(),
              };

              // Detect changes
              const changes = [];
              const oldData = competitor.monitoring_data as any;
              
              if (oldData?.title && oldData.title !== newData.title) {
                changes.push({
                  type: 'title_change',
                  old: oldData.title,
                  new: newData.title,
                  detectedAt: new Date().toISOString(),
                });
              }

              // Update database
              await supabase
                .from('competitor_monitoring')
                .update({
                  monitoring_data: newData,
                  changes_detected: changes.length > 0 ? [...(competitor.changes_detected || []), ...changes] : competitor.changes_detected,
                  last_checked_at: new Date().toISOString(),
                })
                .eq('id', competitor.id);

              results.push({
                name: competitor.competitor_name,
                changes: changes.length,
                status: 'checked',
              });
            }
          }
        } catch (error) {
          console.error(`Error checking ${competitor.competitor_name}:`, error);
          results.push({
            name: competitor.competitor_name,
            status: 'error',
            error: error.message,
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          checked: results.length,
          results,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (action === 'list') {
      const { data, error } = await supabase
        .from('competitor_monitoring')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, competitors: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Competitor monitoring error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
