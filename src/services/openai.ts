import { supabase } from "@/integrations/supabase/client";

export const analyzeAssessmentResults = async (
  results: Record<string, number>,
  ageGroup: 'infant' | 'child' | 'adult',
  age: number
): Promise<{ analysis: string; riskLevel: 'low' | 'medium' | 'high' }> => {
  try {
    console.log('Calling assessment-analyzer function with:', { ageGroup, age, resultsLength: Object.keys(results).length });
    
    const { data, error } = await supabase.functions.invoke('assessment-analyzer', {
      body: { results, ageGroup, age }
    });

    console.log('Assessment analyzer response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data || !data.analysis) {
      console.error('Invalid response from assessment analyzer:', data);
      throw new Error('Invalid response from analysis service');
    }

    return {
      analysis: data.analysis,
      riskLevel: data.riskLevel || 'medium'
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

export const generateAIPredictions = async (
  results: Record<string, number>,
  analysis: string,
  ageGroup: 'infant' | 'child' | 'adult',
  age: number,
  familyMembers: any[] = []
) => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-predictor', {
      body: { results, analysis, ageGroup, age, familyMembers }
    });

    if (error) throw error;

    return {
      predictions: data.predictions,
      confidence: data.confidence,
      rawAnalysis: data.rawAnalysis
    };
  } catch (error) {
    console.error('AI prediction error:', error);
    return {
      predictions: null,
      confidence: 'low',
      rawAnalysis: 'AI 예측 분석을 생성할 수 없습니다.'
    };
  }
};

// Backwards compatibility export
export const matchExperts = getExpertRecommendations;

export const generateFuturePrediction = async (
  assessmentData: Record<string, number>,
  ageGroup: 'infant' | 'child' | 'adult',
  age: number,
  rawAnswers?: number[]
) => {
  try {
    const { data, error } = await supabase.functions.invoke('future-predictor', {
      body: { assessmentData, ageGroup, age, rawAnswers, predictionType: 'developmental_delay' }
    });

    if (error) throw error;

    return {
      prediction: data.prediction,
      accuracy: data.accuracy,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('Future prediction error:', error);
    return {
      prediction: null,
      accuracy: 70,
      confidence: 'low'
    };
  }
};

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