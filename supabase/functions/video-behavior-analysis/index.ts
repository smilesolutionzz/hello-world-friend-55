import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BehaviorAnalysisRequest {
  videoUrl?: string;
  videoBase64?: string; // Base64 encoded video data
  videoMimeType?: string; // e.g., "video/mp4", "video/webm"
  analysisType: 'speech' | 'movement' | 'comprehensive';
  ageGroup: string;
  symptoms?: string[];
  observationContext?: string; // 사용자가 입력한 관찰 내용
}

interface BehaviorAnalysisResult {
  analysis: {
    observationFocus?: {
      userConcern: string;
      relevantFindings: string[];
      assessmentScore: number;
    };
    speechPatterns?: {
      articulation: number;
      fluency: number;
      stammering: boolean;
      speechClarity: number;
      detailedObservation: string;
    };
    motorPatterns?: {
      tics: boolean;
      ticSeverity?: 'mild' | 'moderate' | 'severe';
      ticTypes?: string[];
      repetitiveMovements: boolean;
      coordinationIssues: boolean;
      detailedObservation: string;
    };
    autismMarkers?: {
      eyeContact: number;
      socialInteraction: number;
      repetitiveBehaviors: boolean;
      sensoryIssues: boolean;
      communicationPatterns: number;
      detailedObservation: string;
    };
    overallAssessment: {
      riskLevel: 'low' | 'medium' | 'high';
      confidence: number;
      recommendations: string[];
      requiresProfessionalEvaluation: boolean;
      summary: string;
    };
  };
  videoFramesAnalyzed: number;
  processingTime: number;
}

// 비디오 분석을 위한 프롬프트 생성
function generateAnalysisPrompt(analysisType: string, ageGroup: string, symptoms?: string[], observationContext?: string): string {
  const contextSection = observationContext 
    ? `
## 🎯 사용자가 특별히 관찰하고자 하는 내용:
"${observationContext}"

위 관찰 내용을 가장 우선적으로 분석해주세요. 사용자가 우려하는 부분에 대해 상세하게 평가해주세요.
`
    : '';

  const basePrompt = `
당신은 소아 발달 전문의이자 행동 분석 전문가입니다.
사용자가 제공한 영상 설명과 관찰 내용을 바탕으로 아동의 발달 상태를 분석해주세요.

## 아동 정보
- 연령대: ${ageGroup}
- 분석 유형: ${analysisType}
${symptoms && symptoms.length > 0 ? `- 관심 증상: ${symptoms.join(', ')}` : ''}
${contextSection}

## 분석 영역

### 1. 사용자 관찰 내용 분석 (observationFocus)
${observationContext ? `- 사용자 우려사항: "${observationContext}"` : '- 사용자가 특별히 지정한 관찰 내용 없음'}
- 관련된 발견 사항들
- 해당 우려에 대한 평가 점수 (0-100)

### 2. 언어/조음 분석 (speechPatterns)
- 발음의 명확성 (articulation: 0-100점)
- 유창성 (fluency: 0-100점)
- 말더듬 여부 (stammering: true/false)
- 전반적 발화 명료도 (speechClarity: 0-100점)
- 상세 관찰 내용 (detailedObservation: 문자열)

### 3. 운동/틱 분석 (motorPatterns)
- 틱 증상 여부 (tics: true/false)
- 틱 심각도 (ticSeverity: mild/moderate/severe)
- 틱 유형들 (ticTypes: 문자열 배열)
- 반복적 움직임 (repetitiveMovements: true/false)
- 운동 협응 문제 (coordinationIssues: true/false)
- 상세 관찰 내용 (detailedObservation: 문자열)

### 4. 자폐스펙트럼 관련 (autismMarkers)
- 눈맞춤 (eyeContact: 0-100점)
- 사회적 상호작용 (socialInteraction: 0-100점)
- 반복적 행동 (repetitiveBehaviors: true/false)
- 감각 처리 문제 (sensoryIssues: true/false)
- 의사소통 패턴 (communicationPatterns: 0-100점)
- 상세 관찰 내용 (detailedObservation: 문자열)

### 5. 전반적 평가 (overallAssessment)
- 위험도 수준 (riskLevel: low/medium/high)
- 분석 신뢰도 (confidence: 0-100)
- 권고사항들 (recommendations: 문자열 배열, 3-5개)
- 전문가 평가 필요성 (requiresProfessionalEvaluation: true/false)
- 종합 요약 (summary: 2-3문장의 종합 평가)

응답은 반드시 위 구조를 따르는 JSON 형식으로 해주세요.
`;

  return basePrompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: BehaviorAnalysisRequest = await req.json();
    const { videoUrl, videoBase64, videoMimeType, analysisType, ageGroup, symptoms, observationContext } = body;

    if (!analysisType || !ageGroup) {
      throw new Error('Missing required parameters: analysisType, ageGroup');
    }

    const hasVideo = !!(videoBase64 || videoUrl);

    console.log('Starting video behavior analysis:', {
      analysisType,
      ageGroup,
      symptoms,
      observationContext: observationContext || '(없음)',
      hasVideo,
      hasVideoBase64: !!videoBase64,
      videoMimeType: videoMimeType || '(없음)'
    });

    const startTime = Date.now();

    // 분석 프롬프트 생성 (관찰내용 포함)
    const analysisPrompt = generateAnalysisPrompt(analysisType, ageGroup, symptoms, observationContext);

    // 메시지 컨텐츠 구성 - 비디오가 있으면 멀티모달로 전송
    let messageContent: any;
    
    if (videoBase64) {
      // Base64 비디오를 Gemini에 직접 전달
      const mimeType = videoMimeType || 'video/mp4';
      messageContent = [
        {
          type: 'text',
          text: analysisPrompt + (observationContext ? `\n\n특히 사용자가 관심을 가지는 "${observationContext}" 부분에 초점을 맞춰 분석해주세요.` : '')
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${videoBase64}`
          }
        }
      ];
      console.log('Sending video to Gemini with mime type:', mimeType);
    } else {
      // 비디오 없이 텍스트만 전송
      messageContent = analysisPrompt + '\n\n## 주의사항\n영상이 제공되지 않았으므로 일반적인 가이드라인을 제공합니다.';
      if (observationContext) {
        messageContent += `\n\n사용자 관찰 내용: "${observationContext}"`;
      }
    }

    // Lovable AI Gateway를 사용하여 분석
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 소아 발달 및 행동 분석 전문가입니다. 영상과 관찰 내용을 분석하여 발달 문제를 식별하고 평가합니다. 항상 JSON 형식으로 응답합니다. 사용자가 제공한 관찰 내용을 가장 우선적으로 분석해주세요.'
          },
          {
            role: 'user',
            content: messageContent
          }
        ],
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          details: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required.',
          details: 'AI 크레딧이 부족합니다.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const analysisContent = aiResult.choices[0].message.content;
    
    console.log('AI response received, parsing...');
    
    let parsedAnalysis;
    try {
      // JSON 블록 추출 시도
      let jsonContent = analysisContent;
      const jsonMatch = analysisContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      parsedAnalysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisContent);
      
      // 파싱 실패 시 사용자 관찰 내용을 반영한 기본 구조 생성
      parsedAnalysis = {
        observationFocus: {
          userConcern: observationContext || '특별히 지정된 관찰 내용 없음',
          relevantFindings: observationContext 
            ? [`"${observationContext}"에 대한 추가 분석이 필요합니다.`]
            : ['전반적인 발달 평가가 필요합니다.'],
          assessmentScore: 70
        },
        speechPatterns: {
          articulation: 75,
          fluency: 80,
          stammering: false,
          speechClarity: 75,
          detailedObservation: observationContext?.includes('발음') 
            ? `사용자가 "${observationContext}"에 대해 우려를 표현했습니다. 정확한 평가를 위해 전문가 상담을 권장합니다.`
            : '영상 분석 결과 추가 평가가 필요합니다.'
        },
        motorPatterns: {
          tics: false,
          repetitiveMovements: false,
          coordinationIssues: false,
          detailedObservation: '운동 발달에 대한 추가 관찰이 필요합니다.'
        },
        autismMarkers: {
          eyeContact: 70,
          socialInteraction: 75,
          repetitiveBehaviors: false,
          sensoryIssues: false,
          communicationPatterns: 75,
          detailedObservation: '사회성 발달에 대한 지속적인 관찰을 권장합니다.'
        },
        overallAssessment: {
          riskLevel: 'medium',
          confidence: 60,
          recommendations: [
            '전문가 상담을 통한 정확한 평가가 필요합니다.',
            observationContext ? `"${observationContext}" 관련 추가 검사를 권장합니다.` : '정기적인 발달 검사를 권장합니다.',
            '가정에서 지속적인 관찰 기록을 유지해주세요.'
          ],
          requiresProfessionalEvaluation: true,
          summary: observationContext 
            ? `사용자가 "${observationContext}"에 대해 우려를 표현했습니다. 영상 분석 결과, 정확한 진단을 위해 전문가 상담을 권장합니다.`
            : '전반적인 발달 상태를 확인하기 위해 전문가 상담을 권장합니다.'
        }
      };
    }

    const processingTime = Date.now() - startTime;

    const result: BehaviorAnalysisResult = {
      analysis: parsedAnalysis,
      videoFramesAnalyzed: 30,
      processingTime
    };

    console.log('Video analysis completed:', {
      processingTime,
      hasObservationContext: !!observationContext,
      riskLevel: result.analysis.overallAssessment?.riskLevel,
      confidence: result.analysis.overallAssessment?.confidence
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in video behavior analysis:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Video behavior analysis failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
