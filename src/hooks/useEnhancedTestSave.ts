import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  EnhancedTestResult,
  QuestionResponse,
  DomainScore,
  SessionMetadata,
  ComparisonData,
  RiskAssessment,
  AIAnalysisResult,
  SaveTestOptions,
  EnvironmentalFactors
} from '@/types/enhancedTestResult';

interface TestSession {
  startTime: Date;
  questionTimes: Map<string, number>;
  pauseEvents: { start: Date; end?: Date }[];
}

export const useEnhancedTestSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const { toast } = useToast();

  // 검사 세션 시작
  const startTestSession = useCallback(() => {
    setCurrentSession({
      startTime: new Date(),
      questionTimes: new Map(),
      pauseEvents: []
    });
  }, []);

  // 질문 응답 시간 기록
  const recordQuestionTime = useCallback((questionId: string, timeMs: number) => {
    if (currentSession) {
      currentSession.questionTimes.set(questionId, timeMs);
    }
  }, [currentSession]);

  // 세션 일시정지
  const pauseSession = useCallback(() => {
    if (currentSession) {
      currentSession.pauseEvents.push({ start: new Date() });
    }
  }, [currentSession]);

  // 세션 재개
  const resumeSession = useCallback(() => {
    if (currentSession && currentSession.pauseEvents.length > 0) {
      const lastPause = currentSession.pauseEvents[currentSession.pauseEvents.length - 1];
      if (!lastPause.end) {
        lastPause.end = new Date();
      }
    }
  }, [currentSession]);

  // 세션 메타데이터 생성
  const createSessionMetadata = useCallback((): SessionMetadata => {
    const endTime = new Date();
    const startTime = currentSession?.startTime || new Date();
    
    let totalPauseSeconds = 0;
    currentSession?.pauseEvents.forEach(pause => {
      if (pause.end) {
        totalPauseSeconds += (pause.end.getTime() - pause.start.getTime()) / 1000;
      }
    });

    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000 - totalPauseSeconds);

    // 디바이스 타입 감지
    const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };

    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds,
      pauseCount: currentSession?.pauseEvents.length || 0,
      totalPauseSeconds: Math.round(totalPauseSeconds),
      completionRate: 100,
      deviceType: getDeviceType(),
      browserInfo: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      languagePreference: navigator.language
    };
  }, [currentSession]);

  // 이전 검사와 비교 데이터 생성
  const fetchComparisonData = async (userId: string, testType: string, currentScore: number): Promise<ComparisonData> => {
    try {
      // 같은 타입의 이전 검사 결과 조회
      const { data: testTypes } = await supabase
        .from('test_types')
        .select('id')
        .eq('name', testType)
        .single();

      if (!testTypes) {
        return { trend: 'first_test', consecutiveTestCount: 1 };
      }

      const { data: previousResults } = await supabase
        .from('test_results')
        .select('id, scores, completed_at')
        .eq('user_id', userId)
        .eq('test_type_id', testTypes.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (!previousResults || previousResults.length === 0) {
        return { trend: 'first_test', consecutiveTestCount: 1 };
      }

      const previousTest = previousResults[0];
      const previousScores = previousTest.scores as any;
      const previousTotalScore = previousScores?.totalScore || previousScores?.results?.total || 0;

      // 전체 평균 계산
      const allScores = previousResults
        .map(r => (r.scores as any)?.totalScore || (r.scores as any)?.results?.total || 0)
        .filter(s => s > 0);
      const averageScore = allScores.length > 0 
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
        : 0;

      const scoreDifference = currentScore - previousTotalScore;
      const percentageChange = previousTotalScore > 0 
        ? ((scoreDifference / previousTotalScore) * 100)
        : 0;

      // 트렌드 결정
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (Math.abs(percentageChange) < 5) {
        trend = 'stable';
      } else if (scoreDifference > 0) {
        // 점수가 높아졌을 때 - 검사 유형에 따라 해석이 다를 수 있음
        trend = 'improving';
      } else {
        trend = 'declining';
      }

      return {
        previousTestId: previousTest.id,
        previousTestDate: previousTest.completed_at,
        previousTotalScore,
        scoreDifference,
        percentageChange: Math.round(percentageChange * 10) / 10,
        trend,
        consecutiveTestCount: previousResults.length + 1,
        averageScore: Math.round(averageScore * 10) / 10
      };
    } catch (error) {
      console.error('비교 데이터 조회 오류:', error);
      return { trend: 'first_test', consecutiveTestCount: 1 };
    }
  };

  // 위험도 평가 생성
  const assessRisk = (
    domainScores: DomainScore[],
    totalScore: number,
    maxScore: number,
    testType: string
  ): RiskAssessment => {
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    const riskFactors: string[] = [];
    const protectiveFactors: string[] = [];
    const redFlags: string[] = [];

    // 도메인별 분석
    domainScores.forEach(domain => {
      if (domain.percentage >= 70) {
        riskFactors.push(`${domain.domain} 영역 높은 점수 (${domain.percentage}%)`);
      } else if (domain.percentage <= 30) {
        protectiveFactors.push(`${domain.domain} 영역 안정적 (${domain.percentage}%)`);
      }

      // 위험 신호 체크 (특정 도메인에서 매우 높은 점수)
      if (domain.percentage >= 85) {
        redFlags.push(`${domain.domain} 영역 집중 관리 필요`);
      }
    });

    // 전체 위험도 결정
    let overallRisk: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    let urgencyLevel = 1;
    let recommendProfessional = false;

    if (percentage >= 80 || redFlags.length >= 2) {
      overallRisk = 'critical';
      urgencyLevel = 5;
      recommendProfessional = true;
    } else if (percentage >= 60 || redFlags.length >= 1) {
      overallRisk = 'high';
      urgencyLevel = 4;
      recommendProfessional = true;
    } else if (percentage >= 40) {
      overallRisk = 'moderate';
      urgencyLevel = 2;
    } else {
      overallRisk = 'low';
      urgencyLevel = 1;
    }

    return {
      overallRisk,
      riskFactors,
      protectiveFactors,
      urgencyLevel,
      recommendProfessional,
      redFlags: redFlags.length > 0 ? redFlags : undefined
    };
  };

  // AI 분석 요청
  const requestAIAnalysis = async (
    testType: string,
    results: any,
    domainScores: DomainScore[]
  ): Promise<AIAnalysisResult | undefined> => {
    try {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-test-results', {
        body: {
          testType,
          results: {
            ...results,
            domainScores
          }
        }
      });

      if (error) throw error;

      const analysisText = data?.analysis || '';
      
      // 분석 결과 파싱
      return {
        summary: analysisText.substring(0, 200) + '...',
        detailedAnalysis: analysisText,
        strengths: extractStrengths(analysisText),
        areasOfConcern: extractConcerns(analysisText),
        personalizedRecommendations: extractRecommendations(analysisText),
        confidenceScore: 0.85,
        analysisModel: 'gpt-4o-mini',
        analysisTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI 분석 오류:', error);
      return undefined;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 텍스트에서 강점 추출
  const extractStrengths = (text: string): string[] => {
    const strengthPatterns = [/강점[:\s]([^\n]+)/g, /잘[^\n]*하고[^\n]*/g];
    const strengths: string[] = [];
    strengthPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) strengths.push(match[1].trim());
      }
    });
    return strengths.slice(0, 5);
  };

  // 텍스트에서 우려사항 추출
  const extractConcerns = (text: string): string[] => {
    const concernPatterns = [/주의[:\s]([^\n]+)/g, /어려움[^\n]*/g];
    const concerns: string[] = [];
    concernPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) concerns.push(match[1].trim());
      }
    });
    return concerns.slice(0, 5);
  };

  // 텍스트에서 추천사항 추출
  const extractRecommendations = (text: string): string[] => {
    const patterns = [/추천[:\s]([^\n]+)/g, /제안[:\s]([^\n]+)/g, /권장[:\s]([^\n]+)/g];
    const recommendations: string[] = [];
    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) recommendations.push(match[1].trim());
      }
    });
    return recommendations.slice(0, 5);
  };

  // 고급 검사 결과 저장
  const saveEnhancedTestResult = async (
    data: Partial<EnhancedTestResult> & { testType: string; totalScore: number },
    options: SaveTestOptions = {}
  ): Promise<string | null> => {
    const {
      silent = false,
      includeRawResponses = true,
      generateComparison = true,
      runAIAnalysis = false,
      calculateRisk = true
    } = options;

    try {
      setIsSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!silent) {
          toast({
            title: "로그인 필요",
            description: "검사 결과 저장을 위해 로그인이 필요합니다.",
            variant: "destructive",
          });
        }
        return null;
      }

      // test_type 찾기 또는 생성
      let testTypeId = '';
      const { data: existingType } = await supabase
        .from('test_types')
        .select('id')
        .eq('name', data.testType)
        .maybeSingle();

      if (existingType) {
        testTypeId = existingType.id;
      } else {
        const { data: newType, error: createError } = await supabase
          .from('test_types')
          .insert({ name: data.testType, description: `${data.testType} 검사` })
          .select('id')
          .single();
        
        if (createError) throw createError;
        testTypeId = newType.id;
      }

      // 세션 메타데이터
      const sessionMetadata = data.sessionMetadata || createSessionMetadata();

      // 비교 데이터 생성
      let comparisonData = data.comparisonData;
      if (generateComparison) {
        comparisonData = await fetchComparisonData(user.id, data.testType, data.totalScore);
      }

      // 위험도 평가
      let riskAssessment = data.riskAssessment;
      if (calculateRisk && data.domainScores && data.maxPossibleScore) {
        riskAssessment = assessRisk(
          data.domainScores,
          data.totalScore,
          data.maxPossibleScore,
          data.testType
        );
      }

      // AI 분석 (선택적)
      let aiAnalysis = data.aiAnalysis;
      if (runAIAnalysis && data.domainScores) {
        aiAnalysis = await requestAIAnalysis(data.testType, data, data.domainScores);
      }

      // 저장할 데이터 구성
      const enhancedScores: EnhancedTestResult = {
        testType: data.testType,
        testVersion: data.testVersion || '1.0',
        testCategory: data.testCategory,
        totalScore: data.totalScore,
        maxPossibleScore: data.maxPossibleScore,
        percentageScore: data.maxPossibleScore 
          ? Math.round((data.totalScore / data.maxPossibleScore) * 100) 
          : undefined,
        domainScores: data.domainScores || [],
        responses: includeRawResponses ? (data.responses || []) : [],
        answeredCount: data.answeredCount || data.responses?.length || 0,
        skippedCount: data.skippedCount || 0,
        sessionMetadata,
        environmentalFactors: data.environmentalFactors,
        comparisonData,
        riskAssessment,
        aiAnalysis,
        userNotes: data.userNotes,
        ageGroup: data.ageGroup,
        userAge: data.userAge,
        gender: data.gender,
        tags: data.tags,
        isBookmarked: false
      };

      // DB 저장
      const { data: savedResult, error } = await supabase
        .from('test_results')
        .insert({
          test_type_id: testTypeId,
          user_id: user.id,
          scores: enhancedScores as any
        })
        .select('id')
        .single();

      if (error) throw error;

      if (!silent) {
        toast({
          title: "검사 결과 저장 완료",
          description: comparisonData?.trend !== 'first_test' 
            ? `이전 검사 대비 ${comparisonData?.scoreDifference! > 0 ? '+' : ''}${comparisonData?.scoreDifference}점 변화`
            : "검사 결과가 성공적으로 저장되었습니다.",
        });
      }

      // 세션 초기화
      setCurrentSession(null);

      return savedResult.id;
    } catch (error) {
      console.error('고급 결과 저장 오류:', error);
      if (!silent) {
        toast({
          title: "저장 실패",
          description: "결과 저장 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // 기존 결과를 고급 형식으로 변환하여 저장
  const convertAndSaveResult = async (
    basicData: {
      testType: string;
      results: Record<string, number>;
      analysis?: string;
      testInfo?: any;
      ageGroup?: string;
    },
    options: SaveTestOptions = {}
  ) => {
    // 기본 결과를 도메인 점수로 변환
    const domainScores: DomainScore[] = Object.entries(basicData.results)
      .filter(([key]) => !['total', 'average', 'severity', 'level'].includes(key))
      .map(([domain, score]) => ({
        domain,
        rawScore: score,
        maxScore: 100, // 기본값
        percentage: Math.min(100, Math.round(score))
      }));

    const totalScore = basicData.results.total || 
      basicData.results.average ||
      domainScores.reduce((sum, d) => sum + d.rawScore, 0);

    return saveEnhancedTestResult({
      testType: basicData.testType,
      totalScore,
      maxPossibleScore: domainScores.length * 100,
      domainScores,
      ageGroup: basicData.ageGroup,
      aiAnalysis: basicData.analysis ? {
        summary: basicData.analysis.substring(0, 200),
        detailedAnalysis: basicData.analysis,
        strengths: [],
        areasOfConcern: [],
        personalizedRecommendations: [],
        analysisTimestamp: new Date().toISOString()
      } : undefined
    }, options);
  };

  return {
    // 세션 관리
    startTestSession,
    recordQuestionTime,
    pauseSession,
    resumeSession,
    currentSession,
    
    // 저장 기능
    saveEnhancedTestResult,
    convertAndSaveResult,
    
    // 상태
    isSaving,
    isAnalyzing
  };
};
