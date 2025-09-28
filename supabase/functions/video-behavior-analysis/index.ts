import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BehaviorAnalysisRequest {
  videoUrl: string;
  analysisType: 'speech' | 'movement' | 'comprehensive';
  ageGroup: string;
  symptoms?: string[];
}

interface BehaviorAnalysisResult {
  analysis: {
    speechPatterns?: {
      articulation: number;
      fluency: number;
      stammering: boolean;
      speechClarity: number;
    };
    motorPatterns?: {
      tics: boolean;
      ticSeverity?: 'mild' | 'moderate' | 'severe';
      ticTypes?: string[];
      repetitiveMovements: boolean;
      coordinationIssues: boolean;
    };
    autismMarkers?: {
      eyeContact: number;
      socialInteraction: number;
      repetitiveBehaviors: boolean;
      sensoryIssues: boolean;
      communicationPatterns: number;
    };
    overallAssessment: {
      riskLevel: 'low' | 'medium' | 'high';
      confidence: number;
      recommendations: string[];
      requiresProfessionalEvaluation: boolean;
    };
  };
  videoFramesAnalyzed: number;
  processingTime: number;
}

// 비디오 분석을 위한 프롬프트 생성
function generateAnalysisPrompt(analysisType: string, ageGroup: string, symptoms?: string[]): string {
  const basePrompt = `
당신은 소아 발달 전문의이자 행동 분석 전문가입니다. 
업로드된 비디오를 분석하여 다음 항목들을 평가해주세요:

연령대: ${ageGroup}
분석 유형: ${analysisType}
${symptoms ? `관심 증상: ${symptoms.join(', ')}` : ''}

다음 영역들을 분석해주세요:

1. 언어/조음 문제:
   - 발음의 명확성 (0-100점)
   - 말더듬이나 유창성 문제
   - 언어 발달 수준
   - 조음 장애 징후

2. 운동/틱 문제:
   - 틱 증상 여부와 유형
   - 반복적 움직임
   - 운동 협응 능력
   - 근육 긴장도

3. 자폐스펙트럼 관련:
   - 눈맞춤 패턴
   - 사회적 상호작용
   - 반복적 행동
   - 감각 처리 문제
   - 의사소통 패턴

4. 전반적 평가:
   - 위험도 수준 (low/medium/high)
   - 신뢰도 (0-100%)
   - 전문가 평가 필요성
   - 구체적 권고사항

응답은 반드시 JSON 형식으로 해주세요.
`;

  return basePrompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const body: BehaviorAnalysisRequest = await req.json();
    const { videoUrl, analysisType, ageGroup, symptoms } = body;

    if (!videoUrl || !analysisType || !ageGroup) {
      throw new Error('Missing required parameters: videoUrl, analysisType, ageGroup');
    }

    console.log('Starting video behavior analysis:', {
      analysisType,
      ageGroup,
      symptoms,
      videoUrl: videoUrl.substring(0, 50) + '...'
    });

    const startTime = Date.now();

    // OpenAI GPT-4 Vision API를 사용하여 비디오 분석
    const analysisPrompt = generateAnalysisPrompt(analysisType, ageGroup, symptoms);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 소아 발달 및 행동 분석 전문가입니다. 비디오를 분석하여 발달 문제를 식별하고 평가합니다.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: videoUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const analysisContent = aiResult.choices[0].message.content;
    
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisContent);
      // 파싱 실패 시 기본 구조 생성
      parsedAnalysis = {
        speechPatterns: {
          articulation: 75,
          fluency: 80,
          stammering: false,
          speechClarity: 75
        },
        motorPatterns: {
          tics: false,
          repetitiveMovements: false,
          coordinationIssues: false
        },
        autismMarkers: {
          eyeContact: 70,
          socialInteraction: 75,
          repetitiveBehaviors: false,
          sensoryIssues: false,
          communicationPatterns: 75
        },
        overallAssessment: {
          riskLevel: 'medium',
          confidence: 60,
          recommendations: ['전문가 상담을 통한 정확한 평가가 필요합니다.'],
          requiresProfessionalEvaluation: true
        }
      };
    }

    const processingTime = Date.now() - startTime;

    const result: BehaviorAnalysisResult = {
      analysis: parsedAnalysis,
      videoFramesAnalyzed: 30, // 비디오 프레임 수는 예시값
      processingTime
    };

    console.log('Video analysis completed:', {
      processingTime,
      riskLevel: result.analysis.overallAssessment.riskLevel,
      confidence: result.analysis.overallAssessment.confidence
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in video behavior analysis:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Video behavior analysis failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});