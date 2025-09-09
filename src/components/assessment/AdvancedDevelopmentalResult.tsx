import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Share2, 
  Brain, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Users,
  BookOpen,
  Clock,
  Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTestResultActions } from '@/hooks/useTestResultActions';
import LoadingCompassion from '@/components/LoadingCompassion';

interface AdvancedDevelopmentalResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    domainScores: Record<string, number>;
    useAIAnalysis?: boolean;
  };
  onBack: () => void;
  onNewTest: () => void;
}

interface AdvancedAnalysisResult {
  overallRiskLevel: 'minimal' | 'mild' | 'moderate' | 'significant' | 'high';
  executiveSummary: string;
  clinicalInterpretation: string;
  comprehensiveAnalysis: {
    neurodevelopmentalPerspective: string;
    developmentalTrajectory: string;
    environmentalConsiderations: string;
    strengthsBasedApproach: string;
  };
  domainAnalysis: Array<{
    domain: string;
    score: number;
    percentile: string;
    clinicalInterpretation: string;
    neurocognitiveProfile: string;
    developmentalImplications: string;
    specificRecommendations: string[];
    interventionStrategies: string[];
    monitoringPlan: string;
  }>;
  developmentalProfile: {
    cognitiveStrengths: string[];
    socialEmotionalStrengths: string[];
    adaptiveBehaviorStrengths: string[];
    areasOfConcern: string[];
    riskFactors: string[];
    protectiveFactors: string[];
    uniqueCharacteristics: string[];
  };
  evidenceBasedRecommendations: {
    immediate: string[];
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
    familySupport: Array<{
      strategy: string;
      implementation: string;
      expectedOutcome: string;
    }>;
    educationalSupport: Array<{
      intervention: string;
      methodology: string;
      schoolCollaboration: string;
    }>;
    therapeuticInterventions: Array<{
      therapy: string;
      rationale: string;
      duration: string;
      expectedProgress: string;
    }>;
    specializedReferrals: Array<{
      specialist: string;
      purpose: string;
      urgency: string;
      preparationAdvice: string;
    }>;
  };
  progressMonitoring: {
    shortTermIndicators: string[];
    longTermOutcomes: string[];
    assessmentSchedule: string;
    parentObservationGuidelines: string;
  };
  clinicalNotes: string;
  confidenceLevel: number;
  recommendedFollowUp: string;
  emergencyGuidelines: string;
  resourceRecommendations: Array<{
    resource: string;
    description: string;
    accessInfo: string;
  }>;
}

const AdvancedDevelopmentalResult = ({ results, onBack, onNewTest }: AdvancedDevelopmentalResultProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<AdvancedAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const { toast } = useToast();
  const { saveTestResult } = useTestResultActions();

  // AI 분석 실행
  const generateAIAnalysis = async () => {
    if (aiAnalysis || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress(0);

    // 프로그레스 시뮬레이션
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    try {
      const { data, error } = await supabase.functions.invoke('advanced-developmental-analyzer', {
        body: {
          results: {
            answers: results.answers,
            total: results.total,
            domainScores: results.domainScores,
            ageGroup: results.ageGroup === '아동청소년' ? 'child' : 'adult'
          },
          ageGroup: results.ageGroup === '아동청소년' ? 'child' : 'adult'
        }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (error) throw error;

      if (data?.analysis) {
        setAiAnalysis(data.analysis);
        toast({
          title: "박사급 종합분석 완료! 🧠",
          description: "전문가 수준의 상세한 발달특성 분석을 확인하세요.",
        });
      } else {
        throw new Error('분석 결과를 받지 못했습니다.');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('AI 분석 오류:', error);
      setAnalysisError(error.message || '분석 중 오류가 발생했습니다.');
      toast({
        title: "분석 오류",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (results.useAIAnalysis) {
      generateAIAnalysis();
    }
  }, []);

  const getRiskLevelInfo = (level: string) => {
    const configs = {
      minimal: { color: 'bg-green-500', text: '최소 위험', icon: CheckCircle, description: '발달이 양호한 범위입니다' },
      mild: { color: 'bg-blue-500', text: '경미한 특성', icon: Info, description: '일부 영역에서 지원이 도움될 수 있습니다' },
      moderate: { color: 'bg-yellow-500', text: '중등도 특성', icon: AlertTriangle, description: '전문가 상담을 권장합니다' },
      significant: { color: 'bg-orange-500', text: '상당한 특성', icon: AlertTriangle, description: '적극적인 지원이 필요합니다' },
      high: { color: 'bg-red-500', text: '높은 특성', icon: AlertTriangle, description: '즉시 전문가 평가를 받아보세요' }
    };
    return configs[level as keyof typeof configs] || configs.moderate;
  };

  const handleSaveResult = async () => {
    try {
      await saveTestResult({
        testType: 'advanced_developmental_assessment',
        results: {
          answers: results.answers,
          total: results.total,
          average: results.average,
          domainScores: results.domainScores,
          ageGroup: results.ageGroup,
          aiAnalysis: aiAnalysis
        }
      });
      toast({
        title: "결과 저장 완료",
        description: "평가 결과가 안전하게 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "결과 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const displayData = aiAnalysis || {
    overallRiskLevel: results.total > 20 ? 'moderate' : results.total > 15 ? 'mild' : 'minimal',
    executiveSummary: `총 ${results.total}점으로 ${results.ageGroup} 기준 평균 ${results.average}점의 발달특성을 보입니다.`
  };

  const riskInfo = getRiskLevelInfo(displayData.overallRiskLevel);
  const Icon = riskInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              AIH 고도화 발달특성 종합분석 결과
            </h1>
            <p className="text-muted-foreground">
              임상심리학 박사급 전문성으로 분석한 개별화된 발달특성 프로파일
            </p>
          </div>

          {/* Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">{results.total}점</div>
                <div className="text-sm text-muted-foreground">총점 (35점 만점)</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${riskInfo.color}`}></div>
                  <span className="font-semibold">{riskInfo.text}</span>
                </div>
                <div className="text-sm text-muted-foreground">{riskInfo.description}</div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold">{results.ageGroup}</div>
                <div className="text-sm text-muted-foreground">평가 대상</div>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Analysis Section */}
        {isAnalyzing && (
          <Card className="p-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
            <LoadingCompassion />
            <div className="space-y-4 mt-6">
              <div className="flex justify-between text-sm">
                <span>분석 진행률</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <div className="text-center text-sm text-muted-foreground">
                예상 완료 시간: {timeLeft}초
              </div>
            </div>
          </Card>
        )}

        {analysisError && (
          <Card className="p-6 mb-8 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">분석 오류</span>
            </div>
            <p className="text-sm">{analysisError}</p>
            <Button 
              onClick={generateAIAnalysis} 
              variant="outline" 
              className="mt-4"
              disabled={isAnalyzing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 분석하기
            </Button>
          </Card>
        )}

        {/* Main Results */}
        {aiAnalysis && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">핵심 요약</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {aiAnalysis.executiveSummary}
              </p>
            </Card>

            {/* Domain Analysis */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">영역별 상세 분석</h2>
              </div>
              <div className="grid gap-6">
                {aiAnalysis.domainAnalysis?.map((domain, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{domain.domain}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{domain.score}점</Badge>
                        <Badge variant="secondary">{domain.percentile}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium mb-1">임상적 해석</h4>
                        <p className="text-muted-foreground">{domain.clinicalInterpretation}</p>
                      </div>
                      
                      {domain.specificRecommendations?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">권장사항</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {domain.specificRecommendations.slice(0, 3).map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Developmental Profile */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-green-700">강점 영역</h2>
                </div>
                <div className="space-y-3">
                  {aiAnalysis.developmentalProfile?.cognitiveStrengths?.slice(0, 4).map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-bold text-orange-700">관심 영역</h2>
                </div>
                <div className="space-y-3">
                  {aiAnalysis.developmentalProfile?.areasOfConcern?.slice(0, 4).map((concern, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{concern}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">맞춤형 지원 방안</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      즉시 실행 권장사항
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {aiAnalysis.evidenceBasedRecommendations?.immediate?.slice(0, 4).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      가족 지원 전략
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {aiAnalysis.evidenceBasedRecommendations?.familySupport?.slice(0, 3).map((support, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-secondary">•</span>
                          <span>{support.strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      전문가 연계
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {aiAnalysis.evidenceBasedRecommendations?.specializedReferrals?.slice(0, 3).map((referral, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span><strong>{referral.specialist}</strong>: {referral.purpose}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">추후 모니터링</h3>
                    <p className="text-sm text-muted-foreground">
                      {aiAnalysis.progressMonitoring?.assessmentSchedule}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Clinical Notes */}
            {aiAnalysis.clinicalNotes && (
              <Card className="p-6 bg-muted/30">
                <h2 className="text-lg font-bold mb-3">전문가 의견</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiAnalysis.clinicalNotes}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>신뢰도: {Math.round((aiAnalysis.confidenceLevel || 0.8) * 100)}%</span>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            처음으로
          </Button>
          <Button variant="outline" onClick={onNewTest} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            새 평가 시작
          </Button>
          <Button onClick={handleSaveResult} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            결과 저장
          </Button>
        </div>

        {/* Professional Notice */}
        <Card className="mt-8 p-6 border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-800">전문가 안내사항</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                본 평가는 <strong>발달특성 이해와 지원방향 수립</strong>을 위한 스크리닝 도구입니다. 
                정확한 진단이나 임상적 판단을 위해서는 반드시 자격을 갖춘 임상전문가의 종합적인 평가를 받으시기 바랍니다. 
                AI 분석 결과는 참고용이며, 개별적인 전문가 상담을 대체할 수 없습니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedDevelopmentalResult;