import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { analysisResult, inputText, language = 'ko' } = await req.json();
    const isEnglish = language === 'en';

    if (!analysisResult) {
      throw new Error('analysisResult is required');
    }

    console.log('[VISUAL-NOTE] Generating visual note infographic');

    const reports = analysisResult.comprehensiveReports || {};
    const deepAnalysis = analysisResult.deepAnalysis || {};

    const prompt = isEnglish
      ? `Generate a single-page, premium medical-tech style visual note infographic as an image.

ANALYSIS DATA:
- Concern: ${analysisResult.type || 'General'}
- Severity: ${analysisResult.severity || 'Medium'}
- Overall Score: ${reports.developmentAssessment?.overall || analysisResult.confidence || 75}/100
- Cognitive: ${reports.developmentAssessment?.cognitive || 65}, Language: ${reports.developmentAssessment?.language || 65}, Motor: ${reports.developmentAssessment?.motor || 65}, Social: ${reports.developmentAssessment?.social || 65}, Emotional: ${reports.psychologicalAnalysis?.emotionalStability || 65}
- Root Cause: ${deepAnalysis.rootCauseAnalysis || 'N/A'}
- Strengths: ${reports.strengthsWeaknesses?.strengths?.join(', ') || 'N/A'}
- Areas to Improve: ${reports.strengthsWeaknesses?.weaknesses?.join(', ') || 'N/A'}
- Key Recommendations: ${analysisResult.recommendations?.slice(0, 3).join(', ') || 'N/A'}
- User's concern: ${inputText?.substring(0, 150) || ''}

DESIGN REQUIREMENTS:
- Professional medical/clinical infographic style
- Dark navy/slate background with vibrant accent colors
- Include: central score gauge, 5-domain radar chart area, risk level indicator
- Sections: Overview, Key Findings, Strengths/Weaknesses, Action Items
- Use icons and visual hierarchy, minimal text
- Color coding: green (good), amber (caution), red (concern)
- Premium, polished look like a medical dashboard report
- Single page, portrait orientation
- Brand: "HiLight Pro" small watermark at bottom
- NO placeholder text - use the actual data provided above`
      : `1장짜리 프리미엄 메디컬 테크 스타일의 비주얼 노트 인포그래픽 이미지를 생성해주세요.

분석 데이터:
- 고민 유형: ${analysisResult.type || '일반'}
- 심각도: ${analysisResult.severity || '중간'}
- 종합 점수: ${reports.developmentAssessment?.overall || analysisResult.confidence || 75}/100
- 인지: ${reports.developmentAssessment?.cognitive || 65}, 언어: ${reports.developmentAssessment?.language || 65}, 운동: ${reports.developmentAssessment?.motor || 65}, 사회성: ${reports.developmentAssessment?.social || 65}, 정서: ${reports.psychologicalAnalysis?.emotionalStability || 65}
- 근본 원인: ${deepAnalysis.rootCauseAnalysis || 'N/A'}
- 강점: ${reports.strengthsWeaknesses?.strengths?.join(', ') || 'N/A'}
- 개선점: ${reports.strengthsWeaknesses?.weaknesses?.join(', ') || 'N/A'}
- 핵심 추천: ${analysisResult.recommendations?.slice(0, 3).join(', ') || 'N/A'}
- 사용자 고민: ${inputText?.substring(0, 150) || ''}

디자인 요구사항:
- 전문 의료/임상 인포그래픽 스타일
- 다크 네이비/슬레이트 배경에 선명한 액센트 컬러
- 포함: 중앙 점수 게이지, 5개 영역 레이더 차트, 위험도 표시기
- 섹션: 개요, 핵심 발견, 강점/약점, 실행 항목
- 아이콘과 시각적 계층 사용, 최소한의 텍스트
- 색상 코딩: 초록(양호), 노랑(주의), 빨강(위험)
- 의료 대시보드 리포트처럼 프리미엄하고 세련된 디자인
- 1장, 세로 방향
- 브랜드: 하단에 작게 "HiLight Pro" 워터마크
- 플레이스홀더 텍스트 없이 위 실제 데이터 사용`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VISUAL-NOTE] AI error:', response.status, errorText);
      throw new Error(`AI image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('[VISUAL-NOTE] Image generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[VISUAL-NOTE] Error:', message);

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
