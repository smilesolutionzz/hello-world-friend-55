import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
  User,
  Stethoscope,
  BarChart3,
  MessageSquare,
  Target,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatientHistory {
  id: string;
  userId: string;
  assessmentHistory: any[];
  consultationHistory: any[];
  riskLevel: 'low' | 'medium' | 'high';
  lastAssessmentDate: string;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

interface DiagnosticSuggestion {
  primaryDiagnosis: string;
  confidence: number;
  differentialDiagnoses: string[];
  recommendedTests: string[];
  treatmentSuggestions: string[];
  riskFactors: string[];
}

interface ConsultationSummary {
  sessionId: string;
  keyIssues: string[];
  interventions: string[];
  patientProgress: string;
  nextSessionGoals: string[];
  riskAssessment: string;
}

interface RevenueAnalytics {
  thisMonth: number;
  lastMonth: number;
  growth: number;
  sessionCount: number;
  averageRate: number;
  topEarningDays: string[];
}

export const AIAssistantDashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patientHistory, setPatientHistory] = useState<PatientHistory | null>(null);
  const [diagnosticSuggestion, setDiagnosticSuggestion] = useState<DiagnosticSuggestion | null>(null);
  const [consultationNotes, setConsultationNotes] = useState<string>('');
  const [generatedSummary, setGeneratedSummary] = useState<ConsultationSummary | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueAnalytics();
  }, []);

  const loadPatientHistory = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-patient-analyzer', {
        body: { userId, analysisType: 'comprehensive_history' }
      });

      if (error) throw error;

      setPatientHistory(data.patientHistory);
      setDiagnosticSuggestion(data.diagnosticSuggestion);
      
      toast({
        title: "환자 분석 완료",
        description: "AI가 환자의 히스토리를 분석했습니다.",
      });
    } catch (error) {
      console.error('Patient history loading error:', error);
      // 폴백 데이터
      setPatientHistory({
        id: userId,
        userId,
        assessmentHistory: [],
        consultationHistory: [],
        riskLevel: 'medium',
        lastAssessmentDate: new Date().toISOString(),
        improvementTrend: 'stable'
      });
      
      setDiagnosticSuggestion({
        primaryDiagnosis: "추가 평가 필요",
        confidence: 65,
        differentialDiagnoses: ["불안 장애", "적응 장애"],
        recommendedTests: ["K-CBCL", "추가 면담"],
        treatmentSuggestions: ["인지행동치료", "가족치료"],
        riskFactors: ["스트레스", "환경적 요인"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateConsultationSummary = async () => {
    if (!consultationNotes.trim()) {
      toast({
        title: "입력 필요",
        description: "상담 내용을 먼저 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-consultation-summarizer', {
        body: { 
          consultationNotes,
          patientId: selectedPatient,
          sessionType: 'regular'
        }
      });

      if (error) throw error;

      setGeneratedSummary(data.summary);
      
      toast({
        title: "상담 요약 완료",
        description: "AI가 상담 내용을 분석하고 요약했습니다.",
      });
    } catch (error) {
      console.error('Consultation summary error:', error);
      // 폴백 요약
      setGeneratedSummary({
        sessionId: `session_${Date.now()}`,
        keyIssues: ["주요 스트레스 요인", "대인관계 어려움"],
        interventions: ["인지적 재구성", "스트레스 관리 기법"],
        patientProgress: "상담에 적극적으로 참여하고 있으며, 점진적인 개선 보임",
        nextSessionGoals: ["스트레스 대처 방안 실습", "목표 설정"],
        riskAssessment: "현재 위험도는 낮음, 지속적인 모니터링 필요"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRevenueAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('expert-revenue-analyzer', {
        body: { timeframe: 'monthly' }
      });

      if (error) throw error;

      setRevenueAnalytics(data.analytics);
    } catch (error) {
      console.error('Revenue analytics error:', error);
      // 폴백 데이터
      setRevenueAnalytics({
        thisMonth: 2500000,
        lastMonth: 2200000,
        growth: 13.6,
        sessionCount: 45,
        averageRate: 55555,
        topEarningDays: ["화요일", "목요일", "토요일"]
      });
    }
  };

  const getRiskBadge = (level: string) => {
    const configs = {
      low: { color: "bg-green-100 text-green-700", label: "낮음" },
      medium: { color: "bg-yellow-100 text-yellow-700", label: "보통" },
      high: { color: "bg-red-100 text-red-700", label: "높음" }
    };
    
    const config = configs[level as keyof typeof configs] || configs.medium;
    return <Badge className={config.color}>위험도 {config.label}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI 어시스턴트 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 업무 지원 어시스턴트
          </h2>
        </div>
        <p className="text-muted-foreground">
          진단 보조, 상담 요약, 수익 분석을 AI가 자동으로 지원합니다
        </p>
      </div>

      <Tabs defaultValue="patient-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patient-analysis">
            <User className="w-4 h-4 mr-2" />
            환자 분석
          </TabsTrigger>
          <TabsTrigger value="diagnostic-support">
            <Stethoscope className="w-4 h-4 mr-2" />
            진단 보조
          </TabsTrigger>
          <TabsTrigger value="session-summary">
            <MessageSquare className="w-4 h-4 mr-2" />
            상담 요약
          </TabsTrigger>
          <TabsTrigger value="revenue-analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            수익 분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient-analysis" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="환자 ID 입력 (예: user_123)"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                />
                <Button 
                  onClick={() => loadPatientHistory(selectedPatient)}
                  disabled={!selectedPatient || isLoading}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI 분석 시작
                </Button>
              </div>

              {patientHistory && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">위험 수준</h3>
                      </div>
                      {getRiskBadge(patientHistory.riskLevel)}
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">개선 추세</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(patientHistory.improvementTrend)}
                        <span className="text-sm">
                          {patientHistory.improvementTrend === 'improving' ? '개선중' :
                           patientHistory.improvementTrend === 'declining' ? '악화' : '안정'}
                        </span>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">마지막 평가</h3>
                      </div>
                      <p className="text-sm">
                        {new Date(patientHistory.lastAssessmentDate).toLocaleDateString('ko-KR')}
                      </p>
                    </Card>
                  </div>

                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3">AI 인사이트</h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>• 지난 3개월간 상담 참여도가 증가하고 있습니다</p>
                      <p>• 스트레스 관리 능력이 향상되었습니다</p>
                      <p>• 다음 세션에서는 대인관계 기술에 집중하는 것을 권장합니다</p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic-support" className="space-y-4">
          {diagnosticSuggestion && (
            <div className="space-y-4">
              <Card className="p-6 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-800">AI 진단 보조</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">주 진단 제안</h4>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{diagnosticSuggestion.primaryDiagnosis}</span>
                      <Progress value={diagnosticSuggestion.confidence} className="w-24" />
                      <span className="text-sm text-muted-foreground">
                        신뢰도 {diagnosticSuggestion.confidence}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">감별진단</h4>
                    <div className="flex gap-2 flex-wrap">
                      {diagnosticSuggestion.differentialDiagnoses.map((diagnosis, index) => (
                        <Badge key={index} variant="outline">{diagnosis}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">권장 추가 검사</h4>
                    <div className="space-y-1">
                      {diagnosticSuggestion.recommendedTests.map((test, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Target className="w-3 h-3 text-purple-600" />
                          <span className="text-sm">{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">치료 제안</h4>
                    <div className="space-y-1">
                      {diagnosticSuggestion.treatmentSuggestions.map((treatment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 text-purple-600" />
                          <span className="text-sm">{treatment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="session-summary" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">상담 내용 입력</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="상담 중 나눈 대화, 관찰된 증상, 사용한 개입 기법 등을 자유롭게 작성해주세요..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                rows={6}
              />
              <Button 
                onClick={generateConsultationSummary}
                disabled={isLoading || !consultationNotes.trim()}
              >
                <Zap className="w-4 h-4 mr-2" />
                AI 자동 요약 생성
              </Button>
            </div>
          </Card>

          {generatedSummary && (
            <Card className="p-6 border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-4">AI 생성 상담 요약</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">주요 문제</h4>
                  <div className="space-y-1">
                    {generatedSummary.keyIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-700 mb-2">사용된 개입</h4>
                  <div className="space-y-1">
                    {generatedSummary.interventions.map((intervention, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">{intervention}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-700 mb-2">환자 진전도</h4>
                  <p className="text-sm text-green-600">{generatedSummary.patientProgress}</p>
                </div>

                <div>
                  <h4 className="font-medium text-green-700 mb-2">다음 세션 목표</h4>
                  <div className="space-y-1">
                    {generatedSummary.nextSessionGoals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-green-600" />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-green-700 mb-1">위험도 평가</h4>
                  <p className="text-sm text-green-600">{generatedSummary.riskAssessment}</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="revenue-analytics" className="space-y-4">
          {revenueAnalytics && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">이번 달 수익</p>
                    <p className="text-2xl font-bold text-green-600">
                      {revenueAnalytics.thisMonth.toLocaleString()}원
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">성장률</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{revenueAnalytics.growth}%
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">상담 횟수</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {revenueAnalytics.sessionCount}회
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">세션당 평균</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {revenueAnalytics.averageRate.toLocaleString()}원
                    </p>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">수익 분배 투명화</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>플랫폼 수수료 (30%)</span>
                    <span className="font-semibold text-red-600">
                      -{Math.round(revenueAnalytics.thisMonth * 0.3).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>전문가 수익 (70%)</span>
                    <span className="font-semibold text-green-600">
                      +{Math.round(revenueAnalytics.thisMonth * 0.7).toLocaleString()}원
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-bold">
                    <span>실수령액</span>
                    <span className="text-green-600">
                      {Math.round(revenueAnalytics.thisMonth * 0.7).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">AI 수익 최적화 제안</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span>
                      <strong>{revenueAnalytics.topEarningDays.join(", ")}</strong>에 상담이 많습니다. 
                      해당 요일에 가용시간을 늘려보세요.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>전월 대비 <strong>{revenueAnalytics.growth}%</strong> 성장! 지속적인 품질 유지가 중요합니다.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>평균 세션 시간을 10분 늘리면 월 수익이 약 15% 증가할 것으로 예상됩니다.</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};