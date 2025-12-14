import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { detectRedFlagsFromResult, RedFlagResult } from '@/utils/redFlagDetection';

interface EnhancedAnalysisResult {
  analysis: string;
  scoreInterpretation: {
    normalized?: number;
    percentile?: number;
    normativeLevel?: string;
    tScore?: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
  error?: string;
}

interface UseEnhancedAnalysisProps {
  assessmentType: string;
  results: Record<string, any>;
  rawAnswers?: number[];
  ageGroup?: string;
  age?: number;
  autoFetch?: boolean;
}

export const useEnhancedAnalysis = ({
  assessmentType,
  results,
  rawAnswers,
  ageGroup,
  age,
  autoFetch = true
}: UseEnhancedAnalysisProps) => {
  const [analysis, setAnalysis] = useState<EnhancedAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redFlagResult, setRedFlagResult] = useState<RedFlagResult>({
    hasRedFlags: false,
    flags: [],
    overallSeverity: 'none'
  });
  const [showRedFlagAlert, setShowRedFlagAlert] = useState(false);

  const fetchEnhancedAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching enhanced analysis...', { assessmentType, results });

      const { data, error: functionError } = await supabase.functions.invoke('enhanced-assessment-analyzer', {
        body: {
          assessmentType,
          results,
          rawAnswers,
          ageGroup,
          age
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (!data) {
        throw new Error('No data received from analysis service');
      }

      console.log('Enhanced analysis received:', data);
      setAnalysis(data);

      // 레드플래그 감지
      const redFlags = detectRedFlagsFromResult({
        analysis: data.analysis,
        riskLevel: data.riskLevel,
        recommendations: data.recommendations,
        scoreInterpretation: data.scoreInterpretation
      }, assessmentType);
      
      setRedFlagResult(redFlags);
      
      // 레드플래그가 있으면 알림 표시
      if (redFlags.hasRedFlags) {
        setTimeout(() => setShowRedFlagAlert(true), 1500);
      }

      // Save to database for future reference
      await saveAnalysisToDatabase(data);

    } catch (err) {
      console.error('Enhanced analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Provide fallback analysis
      const fallbackAnalysis: EnhancedAnalysisResult = {
        analysis: '분석 서비스에 일시적인 문제가 발생했습니다. 더 정확한 분석을 위해서는 전문가와 상담하시기를 권장드립니다.',
        scoreInterpretation: {
          normalized: 50,
          percentile: 50,
          normativeLevel: '평균',
          tScore: 50
        },
        recommendations: ['전문가 상담을 권장합니다', '정기적인 자기 모니터링이 도움이 됩니다'],
        riskLevel: 'medium',
        timestamp: new Date().toISOString(),
        error: 'AI 분석 서비스 일시 중단'
      };
      
      setAnalysis(fallbackAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysisToDatabase = async (analysisData: EnhancedAnalysisResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('assessment_enhanced_analysis')
          .insert({
            user_id: user.id,
            assessment_type: assessmentType,
            raw_results: results,
            enhanced_analysis: analysisData.analysis,
            score_interpretation: analysisData.scoreInterpretation,
            recommendations: analysisData.recommendations,
            risk_level: analysisData.riskLevel
          });
      }
    } catch (error) {
      console.error('Failed to save analysis to database:', error);
      // Don't throw error here as it's not critical
    }
  };

  useEffect(() => {
    if (autoFetch && assessmentType && results && Object.keys(results).length > 0) {
      fetchEnhancedAnalysis();
    }
  }, [assessmentType, results, rawAnswers, ageGroup, age, autoFetch]);

  return {
    analysis,
    isLoading,
    error,
    refetch: fetchEnhancedAnalysis,
    // 레드플래그 관련 상태
    redFlagResult,
    showRedFlagAlert,
    closeRedFlagAlert: () => setShowRedFlagAlert(false),
    openRedFlagAlert: () => setShowRedFlagAlert(true)
  };
};

export default useEnhancedAnalysis;