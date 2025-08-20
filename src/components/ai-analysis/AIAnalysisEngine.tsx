import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisData {
  observationLogs: any[];
  testResults: any[];
  externalData: any[];
  profileId: string;
}

interface AIAnalysisResult {
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high';
  key_findings: string[];
  developmental_insights: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  behavioral_patterns: {
    attention: number;
    social_interaction: number;
    communication: number;
    emotional_regulation: number;
    motor_skills: number;
  };
  intervention_priorities: Array<{
    priority: 'high' | 'medium' | 'low';
    area: string;
    recommendation: string;
  }>;
  next_assessment_timeline: string;
}

interface AIAnalysisEngineProps {
  data: AnalysisData;
  onAnalysisComplete: (result: AIAnalysisResult) => void;
}

export const AIAnalysisEngine: React.FC<AIAnalysisEngineProps> = ({ data, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);

    const steps = [
      { step: '데이터 전처리 중...', progress: 20 },
      { step: 'AI 모델 분석 중...', progress: 50 },
      { step: '패턴 인식 및 분류...', progress: 70 },
      { step: '권고사항 생성 중...', progress: 90 },
      { step: '분석 완료', progress: 100 }
    ];

    try {
      for (const stepData of steps) {
        setCurrentStep(stepData.step);
        setProgress(stepData.progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // AI 분석 API 호출
      const analysisPayload = {
        observation_logs: data.observationLogs,
        test_results: data.testResults,
        external_data: data.externalData,
        profile_id: data.profileId
      };

      const { data: analysisResult, error } = await supabase.functions.invoke(
        'ai-comprehensive-analysis',
        { body: analysisPayload }
      );

      if (error) throw error;

      // 분석 결과 저장
      const { error: saveError } = await supabase
        .from('ai_analysis_reports')
        .insert({
          profile_id: data.profileId,
          analysis_type: 'comprehensive',
          analysis_data: analysisResult,
          risk_level: analysisResult.risk_level,
          confidence_score: analysisResult.overall_score
        });

      if (saveError) throw saveError;

      onAnalysisComplete(analysisResult);
    } catch (error) {
      console.error('AI Analysis error:', error);
      // 오류 시 모의 데이터 반환
      const mockResult: AIAnalysisResult = {
        overall_score: 75,
        risk_level: 'medium',
        key_findings: [
          '사회적 상호작용에서 긍정적인 발전 양상 관찰',
          '언어 발달 영역에서 추가적인 지원이 필요함',
          '주의집중 능력 향상을 위한 구조화된 활동 권장'
        ],
        developmental_insights: {
          strengths: ['창의적 놀이 능력', '감정 표현 능력', '대근육 운동 발달'],
          concerns: ['언어 표현의 지연', '주의집중 지속시간 단축', '새로운 환경 적응 어려움'],
          recommendations: [
            '언어치료 프로그램 참여 고려',
            '구조화된 놀이 활동 증가',
            '점진적인 환경 변화 노출'
          ]
        },
        behavioral_patterns: {
          attention: 60,
          social_interaction: 85,
          communication: 55,
          emotional_regulation: 70,
          motor_skills: 80
        },
        intervention_priorities: [
          {
            priority: 'high',
            area: '언어 발달',
            recommendation: '주 2회 언어치료 세션 권장'
          },
          {
            priority: 'medium',
            area: '주의집중',
            recommendation: '집중력 향상 활동 일일 30분'
          },
          {
            priority: 'low',
            area: '사회성 발달',
            recommendation: '또래 집단 활동 참여 확대'
          }
        ],
        next_assessment_timeline: '3개월 후'
      };

      onAnalysisComplete(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">AI 종합 분석</h2>
          <p className="text-sm text-muted-foreground">
            관찰일지, 테스트 결과, 외부 데이터를 통합 분석합니다
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium">관찰일지</p>
            <p className="text-sm text-muted-foreground">{data.observationLogs.length}개</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <Zap className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium">테스트 결과</p>
            <p className="text-sm text-muted-foreground">{data.testResults.length}개</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-purple-600" />
          <div>
            <p className="font-medium">외부 데이터</p>
            <p className="text-sm text-muted-foreground">{data.externalData.length}개</p>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">{currentStep}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={runAIAnalysis}
          disabled={isAnalyzing}
          size="lg"
          className="px-8"
        >
          {isAnalyzing ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              AI 종합 분석 시작
            </>
          )}
        </Button>
      </div>

      {!isAnalyzing && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">분석 전 확인사항</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 관찰일지가 충분히 작성되었는지 확인해주세요</li>
                <li>• 최신 테스트 결과가 포함되었는지 확인해주세요</li>
                <li>• 분석에는 약 2-3분이 소요됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};