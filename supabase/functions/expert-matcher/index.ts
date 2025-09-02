import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { 
      specializations, 
      consultationType, 
      urgencyLevel = 'normal',
      preferredLanguage = 'Korean'
    } = await req.json();

    console.log('Expert matching request:', {
      specializations,
      consultationType,
      urgencyLevel,
      preferredLanguage
    });

    // 기본 쿼리 - 검증되고 사용 가능한 전문가들
    let query = supabaseClient
      .from('experts')
      .select(`
        *,
        expert_availability (*)
      `)
      .eq('is_verified', true)
      .eq('is_available', true);

    // 전문 분야로 필터링
    if (specializations && specializations.length > 0) {
      query = query.overlaps('specializations', specializations);
    }

    // 상담 방식으로 필터링
    if (consultationType) {
      query = query.contains('consultation_methods', [consultationType]);
    }

    // 언어로 필터링
    if (preferredLanguage) {
      query = query.contains('languages', [preferredLanguage]);
    }

    const { data: experts, error } = await query;

    if (error) {
      console.error('Expert query error:', error);
      throw error;
    }

    if (!experts || experts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: '조건에 맞는 전문가를 찾을 수 없습니다.',
          experts: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 현재 시간대 기준으로 사용 가능한 전문가 필터링
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const availableExperts = experts.filter(expert => {
      // 긴급한 경우 시간 무관하게 모든 전문가 포함
      if (urgencyLevel === 'urgent') {
        return true;
      }

      // 일반적인 경우 현재 시간에 사용 가능한 전문가만
      const todayAvailability = expert.expert_availability?.find(
        (avail: any) => avail.day_of_week === currentDay && avail.is_active
      );

      if (!todayAvailability) {
        return false;
      }

      return currentTime >= todayAvailability.start_time && 
             currentTime <= todayAvailability.end_time;
    });

    // 매칭 점수 계산 및 정렬
    const scoredExperts = availableExperts.map(expert => {
      let score = 0;

      // 기본 점수 (평점)
      score += expert.average_rating * 20;

      // 경력 점수
      score += Math.min(expert.years_experience * 2, 20);

      // 세션 수 점수 (신뢰도)
      score += Math.min(expert.total_sessions * 0.5, 30);

      // 전문 분야 일치도
      if (specializations && specializations.length > 0) {
        const matchingSpecs = expert.specializations.filter(
          (spec: string) => specializations.includes(spec)
        ).length;
        score += (matchingSpecs / specializations.length) * 30;
      }

      // 현재 시간 사용 가능성 보너스
      const todayAvailability = expert.expert_availability?.find(
        (avail: any) => avail.day_of_week === currentDay && avail.is_active
      );
      
      if (todayAvailability) {
        score += 20;
      }

      // 상담 방식 일치 보너스
      if (consultationType && expert.consultation_methods.includes(consultationType)) {
        score += 15;
      }

      return {
        ...expert,
        matching_score: Math.round(score)
      };
    });

    // 점수 순으로 정렬
    const sortedExperts = scoredExperts.sort((a, b) => b.matching_score - a.matching_score);

    // 상위 5명 추천
    const recommendedExperts = sortedExperts.slice(0, 5);

    console.log(`Found ${recommendedExperts.length} matching experts`);

    return new Response(
      JSON.stringify({
        success: true,
        experts: recommendedExperts,
        total_available: availableExperts.length,
        matching_criteria: {
          specializations,
          consultationType,
          urgencyLevel,
          preferredLanguage
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Expert matching error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});