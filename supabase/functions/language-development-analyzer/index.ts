import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  results?: {
    receptive?: number;
    expressive?: number;
    total?: number;
    receptive_percentage?: number;
    expressive_percentage?: number;
    total_percentage?: number;
    ageInMonths?: number;
    ageGroup?: string;
    questionCount?: number;
    receptive_max?: number;
    expressive_max?: number;
    total_max?: number;
    [key: string]: unknown;
  };
  answers?: Record<string, string>;
  ageGroup?: string;
  age?: number;
  scoreMeta?: {
    receptiveMax?: number;
    expressiveMax?: number;
    totalMax?: number;
  };
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const deriveMaxFromScoreAndPercent = (score: number, percentage: number, fallback: number): number => {
  if (percentage <= 0) return fallback;
  const derived = Math.round(score / (percentage / 100));
  return Number.isFinite(derived) && derived > 0 ? derived : fallback;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results = {}, answers = {}, ageGroup, age, scoreMeta }: AnalysisRequest = await req.json();

    const answerEntries = Object.entries(answers);
    const receptiveAnswerCount = answerEntries.filter(([id]) => id.startsWith("rec_")).length;
    const expressiveAnswerCount = answerEntries.filter(([id]) => id.startsWith("exp_")).length;

    const receptiveScore = toNumber(results.receptive) ?? 0;
    const expressiveScore = toNumber(results.expressive) ?? 0;
    const totalScore = toNumber(results.total) ?? receptiveScore + expressiveScore;

    const receptivePercent = toNumber(results.receptive_percentage) ?? 0;
    const expressivePercent = toNumber(results.expressive_percentage) ?? 0;
    const totalPercent = toNumber(results.total_percentage) ?? 0;

    const resolvedAge = age ?? toNumber(results.ageInMonths) ?? undefined;
    const resolvedAgeGroup = ageGroup || (typeof results.ageGroup === "string" ? results.ageGroup : undefined);

    const receptiveMax =
      toNumber(scoreMeta?.receptiveMax) ??
      toNumber(results.receptive_max) ??
      (receptiveAnswerCount > 0
        ? receptiveAnswerCount
        : deriveMaxFromScoreAndPercent(receptiveScore, receptivePercent, 23));

    const expressiveMax =
      toNumber(scoreMeta?.expressiveMax) ??
      toNumber(results.expressive_max) ??
      (expressiveAnswerCount > 0
        ? expressiveAnswerCount
        : deriveMaxFromScoreAndPercent(expressiveScore, expressivePercent, 22));

    const totalMax =
      toNumber(scoreMeta?.totalMax) ??
      toNumber(results.total_max) ??
      toNumber(results.questionCount) ??
      receptiveMax + expressiveMax;

    console.log("언어발달 검사 분석 요청:", {
      receptiveScore,
      expressiveScore,
      totalScore,
      receptivePercent,
      expressivePercent,
      totalPercent,
      receptiveMax,
      expressiveMax,
      totalMax,
      resolvedAgeGroup,
      resolvedAge,
      answerCount: answerEntries.length,
    });

    const prompt = `당신은 25년 경력의 언어치료학 박사이자 영유아 언어발달 전문가입니다.

아래 데이터는 프리미엄 유료 검사 결과입니다. 반드시 실제 점수 체계를 반영한 전문가급 상세 보고서를 작성하세요.

⚠️ 절대 금지:
- "안녕하세요" 같은 인사말로 시작
- 한두 줄 요약으로 끝내기
- 형식 없는 나열형 답변

검사 결과 요약:
- 수용언어: ${receptiveScore} / ${receptiveMax} (${receptivePercent}%)
- 표현언어: ${expressiveScore} / ${expressiveMax} (${expressivePercent}%)
- 전체 점수: ${totalScore} / ${totalMax} (${totalPercent}%)
${resolvedAgeGroup ? `- 대상 연령군: ${resolvedAgeGroup}` : ""}
${resolvedAge ? `- 실제 월령: ${resolvedAge}개월` : ""}

문항별 응답:
${answerEntries.map(([questionId, answer]) => `- ${questionId}: ${answer}`).join("\n")}

=== 출력 형식(반드시 아래 헤딩 7개를 그대로 사용) ===
## 1. 전문가 종합 해석
## 2. 수용언어 영역 정밀 분석
## 3. 표현언어 영역 정밀 분석
## 4. 문항별 응답 패턴 분석
## 5. 발달 맥락 및 3-6개월 예후
## 6. 가정에서 바로 적용 가능한 언어자극 전략
## 7. 전문적 권고사항 및 추후 계획

작성 규칙:
1) 전체 2,500자 이상, 각 섹션 최소 3문단 이상
2) 첫 섹션 첫 문장은 반드시 현재 위험도/강점의 핵심 판단으로 시작
3) 점수(%)와 발달 이정표를 구체적으로 연결해 해석
4) 부모가 바로 실행 가능한 문장으로 제시 (상황, 말 예시, 빈도 포함)
5) 면책문구를 마지막에 2문장으로 포함: "본 결과는 선별 목적" + "진단은 전문기관 종합평가 필요"
6) 전문성과 현실성을 유지하되, 과장/공포 유도 금지`;

    const requestAIAnalysis = async (analysisPrompt: string) => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "당신은 영유아 언어발달 전문가입니다. 헤딩 기반 임상 보고서를 작성하며, 짧은 답변을 절대 생성하지 않습니다.",
            },
            { role: "user", content: analysisPrompt },
          ],
          max_tokens: 5000,
          temperature: 0.55,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway 오류:", response.status, errorText);
        throw new Error(`AI Gateway 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("AI 응답 포맷이 올바르지 않습니다.");
      }

      return content;
    };

    let analysis = await requestAIAnalysis(prompt);

    if (analysis.length < 1800) {
      const retryPrompt = `${prompt}\n\n[재요청] 이전 응답이 지나치게 짧았습니다. 같은 정보를 유지하되 길이를 최소 2배로 확장하고, 각 섹션을 3~5문단으로 상세히 작성하세요.`;
      analysis = await requestAIAnalysis(retryPrompt);
    }

    console.log("AI 분석 생성 완료", { length: analysis.length });

    return new Response(
      JSON.stringify({
        analysis,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("언어발달 분석 오류:", error);
    return new Response(
      JSON.stringify({
        error: "AI 분석 생성 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});