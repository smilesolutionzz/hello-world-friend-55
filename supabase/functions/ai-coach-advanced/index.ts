import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId } = await req.json();
    
    if (!profileId) {
      return new Response(JSON.stringify({ error: 'Profile ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic response for now
    const response = {
      coaching: {
        strategy: "현재 상황에 적합한 맞춤형 코칭을 제공하겠습니다.",
        techniques: ["인지행동치료", "마음챙김", "감정조절"],
        nextSteps: ["일일 감정 일기 작성", "호흡 운동 실시", "전문가 상담 고려"]
      },
      analysis: {
        emotionalState: "안정적",
        recommendedActions: ["꾸준한 자기관리", "사회적 지지 체계 구축"],
        riskLevel: "low"
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in ai-coach-advanced function:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});