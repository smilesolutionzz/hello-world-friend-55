import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  concernText: string;
  triggerSource?: 'crisis_detected' | 'post_report' | 'subscription_d7' | 'manual';
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  depression: ['우울', '무기력', '의욕', '슬픔', '눈물', '죽고싶', '극단'],
  anxiety: ['불안', '걱정', '두려움', '공황', '긴장', '초조'],
  stress: ['스트레스', '번아웃', '직장', '업무', '피로'],
  relationship: ['관계', '연애', '이별', '부부', '가족', '친구', '갈등'],
  parenting: ['아이', '자녀', '육아', '훈육', 'ADHD', '자폐', '발달'],
  trauma: ['트라우마', '학대', '폭력', '사고', '상실'],
  sleep: ['불면', '잠', '수면', '악몽'],
  career: ['진로', '취업', '커리어', '이직'],
};

const SEVERITY_KEYWORDS = {
  high: ['죽고싶', '극단', '자살', '못살', '끝내', '사라지'],
  mid: ['힘들', '괴로', '버겁', '못견디', '심각'],
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'general';
}

function detectSeverity(text: string): 'low' | 'mid' | 'high' {
  if (SEVERITY_KEYWORDS.high.some(k => text.includes(k))) return 'high';
  if (SEVERITY_KEYWORDS.mid.some(k => text.includes(k))) return 'mid';
  return 'low';
}

function recommendOffering(severity: string, category: string): string {
  if (severity === 'high') return 'urgent_zoom_15';
  if (category === 'parenting' || category === 'relationship') return 'report_review_30';
  return 'kakao_async';
}

const CATEGORY_SPEC_MAP: Record<string, string[]> = {
  depression: ['우울', '심리상담', '정서', '인지치료'],
  anxiety: ['불안', '심리상담', '인지치료'],
  stress: ['스트레스', '번아웃', '직장'],
  relationship: ['관계', '부부', '가족', '심리상담'],
  parenting: ['아동발달', '육아', 'ADHD', '자폐', '발달재활'],
  trauma: ['트라우마', 'PTSD', '심리상담'],
  sleep: ['수면', '심리상담'],
  career: ['진로', '커리어', '직장'],
  general: ['심리상담', '상담'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const { concernText, triggerSource = 'manual' }: MatchRequest = await req.json();
    if (!concernText || concernText.trim().length < 3) {
      throw new Error('고민 내용을 더 자세히 입력해주세요');
    }

    const category = detectCategory(concernText);
    const severity = detectSeverity(concernText);
    const recommendedOffering = recommendOffering(severity, category);
    const relevantSpecs = CATEGORY_SPEC_MAP[category] || CATEGORY_SPEC_MAP.general;

    // 검증된 전문가 조회
    const { data: experts } = await supabase
      .from('experts')
      .select('id, full_name, professional_title, specializations, years_experience, average_rating, hourly_rate, profile_image_url, kakao_link, consultation_methods')
      .eq('is_verified', true)
      .eq('is_available', true)
      .limit(20);

    // 적합도 스코어링
    const scored = (experts || []).map((e: any) => {
      let score = 50;
      const matched = (e.specializations || []).filter((s: string) =>
        relevantSpecs.some(r => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase()))
      );
      score += matched.length * 12;
      if (e.years_experience >= 10) score += 15;
      else if (e.years_experience >= 5) score += 10;
      else if (e.years_experience >= 3) score += 5;
      if (e.average_rating >= 4.5) score += 8;
      else if (e.average_rating >= 4.0) score += 5;
      if (severity === 'high' && e.years_experience >= 10) score += 10;
      return { ...e, matchScore: Math.min(score, 99), matchedSpecs: matched };
    }).sort((a: any, b: any) => b.matchScore - a.matchScore);

    const top3 = scored.slice(0, 3);

    // 매칭 기록 저장
    const { data: matchRecord } = await supabase
      .from('ai_consultation_matches')
      .insert({
        user_id: userId,
        concern_text: concernText,
        detected_category: category,
        detected_severity: severity,
        recommended_expert_ids: top3.map((e: any) => e.id),
        recommended_offering_key: recommendedOffering,
        trigger_source: triggerSource,
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      success: true,
      matchId: matchRecord?.id,
      category,
      severity,
      recommendedOffering,
      experts: top3,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[match-consultation-expert] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || '매칭 실패',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
