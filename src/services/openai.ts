import { supabase } from "@/integrations/supabase/client";

export const analyzeAssessmentResults = async (
  results: Record<string, number>,
  ageGroup: 'infant' | 'child' | 'adult',
  age: number
): Promise<{ analysis: string; riskLevel: 'low' | 'medium' | 'high' }> => {
  try {
    const { data, error } = await supabase.functions.invoke('assessment-analyzer', {
      body: { results, ageGroup, age }
    });

    if (error) throw error;

    return {
      analysis: data.analysis,
      riskLevel: data.riskLevel
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      analysis: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      riskLevel: 'medium'
    };
  }
};

export const getExpertRecommendations = async (
  analysis: string,
  ageGroup: 'infant' | 'child' | 'adult',
  age: number
) => {
  try {
    const { data, error } = await supabase.functions.invoke('expert-matcher', {
      body: { analysis, ageGroup, age }
    });

    if (error) throw error;

    return data.experts || [];
  } catch (error) {
    console.error('Expert matching error:', error);
    return [];
  }
};

// Backwards compatibility export
export const matchExperts = getExpertRecommendations;

export const chatWithAICounselor = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{ response: string; riskLevel: 'low' | 'medium' | 'high' }> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-counselor', {
      body: { message, conversationHistory }
    });

    if (error) throw error;

    return {
      response: data.response,
      riskLevel: data.riskLevel
    };
  } catch (error) {
    console.error('AI counselor error:', error);
    return {
      response: "죄송합니다. 일시적인 문제가 발생했습니다. 긴급한 상황이라면 정신건강위기상담전화 1577-0199로 연락해주세요.",
      riskLevel: 'medium'
    };
  }
};