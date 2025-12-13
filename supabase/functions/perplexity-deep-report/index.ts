import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessments, concerns, additionalContext, userInput } = await req.json();
    
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    console.log('Perplexity Deep Report 생성 시작:', { 
      assessmentsCount: assessments?.length,
      concernsLength: concerns?.length 
    });

    // 검사 데이터 요약
    const assessmentSummary = assessments?.map((a: any) => 
      `- ${a.age_group || ''}그룹 검사 (${new Date(a.created_at).toLocaleDateString('ko-KR')}): 위험도 ${a.risk_level || '미분류'}, 분석: ${a.analysis?.substring(0, 200) || '없음'}`
    ).join('\n') || '검사 기록 없음';

    const searchQuery = `
아동 발달 심리 ${concerns || ''} 
최신 연구 논문 치료 방법 전문가 조언 
발달 지연 조기 개입 증거 기반 치료
    `.trim();

    // Perplexity로 실시간 웹 검색 + 분석
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `당신은 아동 발달 및 심리 전문가입니다. 실시간 웹 검색을 통해 최신 연구와 논문, 전문가 조언을 기반으로 심층적인 분석 리포트를 작성합니다.
            
반드시 다음 9가지 섹션으로 구성된 종합 리포트를 작성하세요:

1. 📋 종합 진단 요약 (Executive Summary)
2. 🔬 심층 분석 결과 (Deep Analysis)  
3. 📚 최신 연구/논문 기반 인사이트 (Research Insights)
4. 🎯 맞춤형 개입 전략 (Intervention Strategies)
5. 📅 단계별 발달 로드맵 (Development Roadmap)
6. 👨‍👩‍👧 가정 내 실천 가이드 (Home Practice Guide)
7. 🏥 전문가 상담 필요성 평가 (Professional Consultation)
8. 📈 예후 및 발달 예측 (Prognosis)
9. 📖 추천 자료 및 리소스 (Recommended Resources)

각 섹션은 구체적이고 실행 가능한 내용으로 작성하세요.`
          },
          {
            role: 'user',
            content: `다음 정보를 바탕으로 종합 발달 심리 분석 리포트를 작성해주세요:

## 대상자 정보
- 이름: ${userInput?.name || '미입력'}
- 생년월일: ${userInput?.birthDate || '미입력'}
- 성별: ${userInput?.gender || '미입력'}

## 주요 고민/걱정
${concerns || '입력된 고민 없음'}

## 검사 기록 요약
${assessmentSummary}

## 추가 맥락
${additionalContext || '추가 정보 없음'}

## 관찰된 발달/심리적 특징
${userInput?.developmentalNotes || '기록 없음'}

---

위 정보를 분석하고, 실시간 웹 검색을 통해 최신 연구와 전문가 조언을 반영하여 9가지 섹션의 종합 리포트를 작성해주세요.
각 섹션에는 구체적인 예시, 수치, 참고 자료를 포함해주세요.`
          }
        ],
        search_recency_filter: 'month',
        return_citations: true,
        max_tokens: 4000,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const reportContent = perplexityData.choices?.[0]?.message?.content || '';
    const citations = perplexityData.citations || [];

    console.log('Perplexity 리포트 생성 완료, 길이:', reportContent.length);

    // 리포트를 섹션별로 파싱
    const sections = parseReportSections(reportContent);

    return new Response(JSON.stringify({
      success: true,
      report: {
        content: reportContent,
        sections,
        citations,
        generatedAt: new Date().toISOString(),
        model: 'perplexity-sonar-pro',
        searchBased: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Perplexity Deep Report error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseReportSections(content: string) {
  const sectionTitles = [
    '종합 진단 요약',
    '심층 분석 결과',
    '최신 연구/논문 기반 인사이트',
    '맞춤형 개입 전략',
    '단계별 발달 로드맵',
    '가정 내 실천 가이드',
    '전문가 상담 필요성 평가',
    '예후 및 발달 예측',
    '추천 자료 및 리소스'
  ];

  const sections: Record<string, string> = {};
  
  sectionTitles.forEach((title, index) => {
    const regex = new RegExp(`(?:#{1,3}\\s*)?(?:\\d+\\.?\\s*)?(?:[📋🔬📚🎯📅👨‍👩‍👧🏥📈📖]\\s*)?${title.replace(/[\/\(\)]/g, '\\$&')}[^\\n]*\\n([\\s\\S]*?)(?=(?:#{1,3}\\s*)?(?:\\d+\\.?\\s*)?(?:[📋🔬📚🎯📅👨‍👩‍👧🏥📈📖]\\s*)?(?:${sectionTitles.slice(index + 1).map(t => t.replace(/[\/\(\)]/g, '\\$&')).join('|')})|$)`, 'i');
    
    const match = content.match(regex);
    if (match) {
      sections[title] = match[1].trim();
    }
  });

  return sections;
}
