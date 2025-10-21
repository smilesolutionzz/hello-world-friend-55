import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, MessageCircle, Users, Brain, Sparkles, Crown, Target, Download } from "lucide-react";
import { ImageGenerator } from "@/components/ai-image/ImageGenerator";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ProductRecommendation from "@/components/ProductRecommendation";
import SocialShareButtons from '@/components/social/SocialShareButtons';
import VoiceFeature from '@/components/voice/VoiceFeature';
import { useTestResultActions } from '@/hooks/useTestResultActions';
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';
import ShareResultButton from '@/components/ShareResultButton';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TextToSpeechButton } from '@/components/audio/TextToSpeechButton';
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';
import { FileText } from 'lucide-react';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';

interface AdhdTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  };
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const AdhdTestResult = ({ results, onBack, onStartAIChat, onStartRealTimeChat }: AdhdTestResultProps) => {
  const { total, average, ageGroup, severity, answers } = results;
  const navigate = useNavigate();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();
  const { toast } = useToast();
  
  // AI 분석 상태
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [domainScores, setDomainScores] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [tokenError, setTokenError] = useState<{required: number, available: number} | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 사용자 정보 확인
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);
  
  // AI 분석 요청 함수
  const requestAIAnalysis = async () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "AI 전문 분석을 받으려면 로그인이 필요합니다.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setTokenError(null);

    try {
      console.log('🧠 ADHD AI 분석 요청 시작');
      
      const { data, error } = await supabase.functions.invoke('premium-adhd-analyzer', {
        body: {
          answers,
          ageGroup,
          severity,
          total,
          average,
          userId: user.id
        }
      });

      if (error) {
        console.error('❌ ADHD AI 분석 오류:', error);
        throw error;
      }

      if (data?.error) {
        if (data.error === 'insufficient_tokens') {
          setTokenError({
            required: data.required,
            available: data.available
          });
          return;
        }
        throw new Error(data.message || 'AI 분석 중 오류가 발생했습니다.');
      }

      console.log('✅ ADHD AI 분석 완료:', data);
      setAiAnalysis(data.analysis);
      setDomainScores(data.domainScores);
      
      toast({
        title: "🧠 AI 전문 분석 완료!",
        description: "ADHD 정신과의사급 상세 분석이 완료되었습니다.",
      });

    } catch (error: any) {
      console.error('❌ ADHD AI 분석 오류:', error);
      setAnalysisError(error.message || 'AI 분석 중 오류가 발생했습니다.');
      toast({
        title: "분석 오류",
        description: error.message || 'AI 분석 중 오류가 발생했습니다.',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOverallEvaluation = (severity: string) => {
    if (severity === "정상 범위") {
      return {
        level: "Normal Range (정상 범위)",
        description: "ADHD 증상이 일반적인 범위 내에 있습니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (severity === "경계선 수준") {
      return {
        level: "Borderline Level (경계선 수준)",
        description: "일부 ADHD 증상이 나타날 수 있어 관찰이 필요합니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else if (severity === "중등도 수준") {
      return {
        level: "Moderate Level (중등도 수준)",
        description: "ADHD 증상이 중등도 수준으로 전문가 상담을 권장합니다.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else {
      return {
        level: "Severe Level (심각한 수준)",
        description: "ADHD 증상이 심각한 수준으로 즉시 전문가 도움이 필요합니다.",
        color: "bg-red-100 text-red-800 border-red-200"
      };
    }
  };
  
  // ADHD 증상 영역별 분석 (부주의, 과잉행동-충동성)
  const inattentionScore = results.answers.slice(0, 9).reduce((sum, score) => sum + score, 0);
  const hyperactivityScore = results.answers.slice(9, 18).reduce((sum, score) => sum + score, 0);
  
  // 기본 ADHD 검사는 2개 영역만 제공 (18문항)
  const chartData = [
    {
      name: "주의력 결핍",
      value: inattentionScore,
      fullMark: 18,
    },
    {
      name: "과잉행동/충동성",
      value: hyperactivityScore,
      fullMark: 18,
    }
  ];

  const evaluation = getOverallEvaluation(severity);

  const handlePDFDownload = async () => {
    await downloadResultAsPDF(
      'adhd-result-content',
      'ADHD_자가체크_결과',
      () => {
        toast({
          title: "PDF 다운로드 완료",
          description: "ADHD 자가체크 결과가 저장되었습니다.",
        });
      },
      (error) => {
        toast({
          title: "다운로드 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div id="adhd-result-content" className="space-y-8">
      {/* PDF Header */}
      <PDFHeader testName="ADHD 자가체크 결과" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">주의집중력 자가체크 결과 (참고용)</h1>
        <Button variant="outline" onClick={handlePDFDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          PDF 다운로드
        </Button>
      </div>

      {/* 법적 안전 공지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">📊 체크 결과 (참고용)</span><br />
          ⚠️ 이 결과는 참고용이며 전문적 평가가 절대 아닙니다. 주의집중력 문제가 의심되면 반드시 전문기관에서 상담받으세요.
        </p>
      </div>

      {/* AI 전문 분석 섹션 */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900">🧠 AI 전문가 심층분석</h3>
            <p className="text-purple-700 text-sm">정신과의사급 ADHD 전문 분석 (8토큰)</p>
          </div>
        </div>

        {tokenError && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">토큰 부족</span>
              </div>
              <p className="text-red-700 text-sm mb-4">
                AI 전문 분석을 위해서는 {tokenError.required}토큰이 필요하지만, 
                현재 {tokenError.available}토큰만 보유하고 있습니다.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => navigate('/token-subscription')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  토큰 충전하기
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={requestAIAnalysis}
                  disabled={isAnalyzing}
                >
                  다시 시도
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!aiAnalysis && !tokenError && (
          <div className="text-center py-8">
            <div className="bg-white/70 rounded-xl p-6 border border-purple-200">
              <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-bold text-lg text-purple-900 mb-2">
                정신과의사급 ADHD 전문 분석
              </h4>
              <p className="text-purple-700 text-sm mb-4 leading-relaxed">
                • 주의력 결핍 & 과잉행동/충동성 세부 분석<br/>
                • DSM-5 기준 임상적 해석<br/>
                • 연령별 특성 고려한 맞춤 분석<br/>
                • 치료 권고 및 관리방안 제시<br/>
                • 2000자 이상 전문가급 상세 분석
              </p>
              <Button 
                onClick={requestAIAnalysis}
                disabled={isAnalyzing}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    AI 전문 분석 시작 (8토큰)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-purple-800 font-medium">AI가 ADHD 전문 분석을 진행중입니다...</span>
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        )}

        {analysisError && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">분석 오류</span>
              </div>
              <p className="text-red-700 text-sm mb-3">{analysisError}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={requestAIAnalysis}
                disabled={isAnalyzing}
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {aiAnalysis && (
          <div className="space-y-6">
            {/* 도메인별 점수 차트 */}
            {domainScores.length > 0 && (
              <Card className="bg-white/70 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    ADHD 전문가 AI 분석 결과
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 막대 차트 */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">영역별 점수</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={domainScores}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any, name: string) => [
                              `${value.toFixed(1)}%`, 
                              '백분율'
                            ]}
                            labelFormatter={(label) => `영역: ${label}`}
                          />
                          <Bar 
                            dataKey="percentage" 
                            fill="#8B5CF6" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 레이더 차트 */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">종합 프로필</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={domainScores}>
                          <PolarGrid />
                          <PolarAngleAxis 
                            dataKey="name" 
                            fontSize={12}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]}
                            fontSize={10}
                          />
                          <Radar
                            name="백분율"
                            dataKey="percentage"
                            stroke="#8B5CF6"
                            fill="#8B5CF6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${value.toFixed(1)}%`, '백분율']}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 도메인별 상세 정보 */}
                  <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {domainScores.map((domain, index) => (
                      <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-purple-900 mb-2">{domain.name}</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">점수:</span>
                            <span className="font-medium">{domain.score}점</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">백분율:</span>
                            <span className="font-medium">{domain.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">수준:</span>
                            <Badge 
                              variant={domain.severity === '높음' ? 'destructive' : 
                                     domain.severity === '중간' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {domain.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI 분석 결과 */}
            <Card className="bg-white/70 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    정신과의사급 AI 전문 분석
                  </CardTitle>
                  <TextToSpeechButton text={aiAnalysis} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {aiAnalysis}
                  </div>
                </div>
                
                {/* 분석 결과 액션 버튼 */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button 
                    onClick={() => navigate('/experts')}
                    variant="outline" 
                    size="sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    전문가 상담
                  </Button>
                  <Button 
                    onClick={() => navigate('/premium-assessment')}
                    variant="outline"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    다른 검사 하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>

      {/* Summary Card */}
      <Card className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">검사 결과 요약</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">총점</span>
                <span className="text-2xl font-bold text-brand-gradient">{total}/36점</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                최대 36점 (18문항 × 2점)
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">평균점수</span>
                <span className="text-2xl font-bold text-brand-gradient">{average.toFixed(1)}/2.0점</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                문항당 평균점수
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">규준집단 대비</span>
                <span className="text-2xl font-bold text-brand-gradient">{((total/36)*100).toFixed(0)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">평가 결과</span>
                <Badge className={evaluation.color}>
                  {evaluation.level}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">연령대</span>
                <span className="text-lg">{ageGroup}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">검사일</span>
                <span className="text-lg">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">증상 영역별 점수</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 18]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 전문가 해석 결과 - 대폭 확장 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 상세 분석 결과</h3>
        
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">총 점수</p>
              <p className="text-3xl font-bold text-blue-900">{total}점 / 36점</p>
              <p className="text-sm text-blue-600 mt-1">만점 대비 {Math.round((total/36)*100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">부주의 증상</p>
              <p className="text-2xl font-bold text-blue-900">{inattentionScore}점 / 18점</p>
              <p className="text-sm text-blue-600 mt-1">집중력 관련</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-800">과잉행동/충동</p>
              <p className="text-2xl font-bold text-blue-900">{hyperactivityScore}점 / 18점</p>
              <p className="text-sm text-blue-600 mt-1">활동성 관련</p>
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 상세 해석</h4>
            <div className="prose prose-purple max-w-none">
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                {severity === "정상 범위" 
                  ? `현재 점수 ${total}점은 ADHD 증상이 일반적인 범위 내에 있는 건강한 상태를 나타냅니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 일상생활에서 집중력이나 충동 조절에 큰 어려움이 없는 수준입니다.

**7가지 구체적 유지 방법:**
• **규칙적 루틴**: 일정한 생활 패턴으로 집중력과 자기 조절 능력 유지
• **적당한 도전**: 집중력을 요하는 활동으로 인지 능력 지속 발전
• **스트레스 관리**: 과도한 스트레스 상황에서의 집중력 저하 예방
• **건강한 습관**: 충분한 수면과 균형잡힌 식단으로 뇌 기능 최적화
• **시간 관리**: 효과적인 계획 수립과 실행 능력 지속 개발
• **주의력 훈련**: 독서, 퍼즐 등을 통한 집중력 강화 활동 지속
• **정기 점검**: 스트레스나 환경 변화 시 집중력 상태 자가 모니터링

**재평가 권장:** 현재 상태를 유지하면서 6개월 후 재검사를 통해 지속적인 집중력 관리 상태를 확인하시기 바랍니다.`
                  : severity === "경계선 수준"
                  ? `현재 점수 ${total}점은 ADHD 증상이 경계선 수준에 있어 주의 깊은 관찰이 필요한 상태입니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 때때로 일상생활에 경미한 영향을 미칠 수 있습니다.

**7가지 구체적 개선 방법:**
• **환경 조성**: 집중하기 쉬운 환경 만들기 (정리정돈, 소음 차단 등)
• **시간 구조화**: 포모도로 기법 등을 활용한 집중 시간 관리
• **행동 모니터링**: 주의력 분산이나 충동적 행동 패턴 관찰하고 기록
• **운동 요법**: 규칙적인 유산소 운동으로 집중력과 충동 조절 능력 향상
• **인지 훈련**: 집중력 강화 앱이나 게임을 통한 주의력 훈련
• **스트레스 완화**: 명상, 요가 등을 통한 정신적 안정감 확보
• **전문가 상담**: 필요시 ADHD 전문가와 상담으로 조기 개입

**재평가 권장:** 생활 개선 노력 후 3-6개월 뒤 재검사를 통해 증상 변화와 개선 효과를 확인하시기 바랍니다.`
                  : severity === "중등도 수준"
                  ? `현재 점수 ${total}점은 ADHD 증상이 중등도 수준으로 나타나 전문가의 정확한 평가가 필요한 상태입니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 학업이나 업무에서 상당한 어려움을 겪을 수 있습니다.

**7가지 구체적 관리 방법:**
• **전문가 평가**: ADHD 전문의나 임상심리사와 정확한 진단 평가 받기
• **행동 치료**: CBT나 행동 수정 프로그램을 통한 체계적 증상 관리
• **학습/업무 전략**: 집중력 보완을 위한 구체적 전략과 도구 활용
• **환경 수정**: 주의 분산 요소 최소화와 집중 지원 환경 구축
• **지지체계**: 가족, 동료들의 이해와 협조를 통한 지원 체계 구축
• **약물 상담**: 필요시 의사와 ADHD 치료 약물에 대한 상담
• **생활 관리**: 규칙적인 운동, 수면, 식단 관리로 증상 완화

**재평가 권장:** 전문가 치료 시작 후 1-3개월 간격으로 정기적 재평가를 통해 치료 효과를 모니터링하고 치료 계획을 조정하시기 바랍니다.`
                  : `현재 점수 ${total}점은 ADHD 증상이 심각한 수준으로 나타나 즉시 전문가의 도움이 필요한 상태입니다. 부주의 증상 ${inattentionScore}점, 과잉행동/충동성 ${hyperactivityScore}점으로, 일상생활 전반에 상당한 지장을 주고 있을 가능성이 높습니다.

**7가지 즉시 실행 방법:**
• **응급 평가**: 즉시 ADHD 전문의나 정신건강의학과 예약하여 정확한 진단
• **치료 계획**: 의사와 함께 종합적인 ADHD 치료 계획 수립
• **약물 치료**: 처방에 따른 ADHD 치료 약물로 즉각적 증상 완화
• **집중 상담**: 주 1-2회 ADHD 전문 상담사와 행동 치료 시작
• **환경 재구성**: 집중을 방해하는 모든 요소 제거하고 지원 환경 조성
• **지지체계 활성화**: 가족과 주변인들에게 상황 설명하고 적극적 도움 요청
• **위기 관리**: ADHD 증상 악화 시 즉시 대처할 수 있는 응급 계획 수립

**재평가 권장:** 치료 시작 후 2-4주 간격으로 집중적인 모니터링과 재평가를 통해 증상 호전도를 확인하고 치료 강도를 조정하시기 바랍니다.`}
              </p>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <a 
              href="https://drive.google.com/file/d/17WD3mhW2T4TdkfxTzLpfH5bzFARxz_Vh/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              👉 구독 후 더 정밀한 분석 리포트(PDF) 다운받기 (예시)
            </a>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-5 gap-4">
        <Button 
          className="btn-brand h-16"
          onClick={() => navigate('/expert-hiring')}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">ADHD전문가연결</div>
            <div className="text-sm opacity-90">맞춤 추천 상담</div>
          </div>
        </Button>

        <Button 
          className="btn-brand h-16"
          onClick={() => navigate('/counseling', { state: { assessmentResults: { ...results, testType: 'adhd' } } })}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">단계별 상담 시작</div>
            <div className="text-sm opacity-90">AI → 전문가</div>
          </div>
        </Button>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white h-16"
          onClick={() => navigate('/ai-counselor', { state: { assessmentResults: { ...results, testType: 'adhd' } } })}
        >
          <Brain className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">AI 상담만</div>
            <div className="text-sm opacity-90">빠른 상담</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          onClick={() => generatePDFReport({
            testType: 'ADHD 검사',
            results: {
              total: results.total,
              average: results.average,
              severity,
              answers
            },
            analysis: `ADHD 검사 결과 분석: ${evaluation.description}`,
            testInfo: {
              ageGroup,
              generatedAt: new Date().toISOString(),
              version: '1.0'
            }
          })}
          disabled={isGeneratingPDF}
        >
          <div className="text-left">
            <div className="font-semibold">{isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 리포트'}</div>
            <div className="text-sm text-muted-foreground">{isGeneratingPDF ? '잠시만 기다려주세요' : '결과를 PDF로 저장'}</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          onClick={() => saveTestResult({
            testType: 'ADHD 검사',
            results: {
              total: results.total,
              average: results.average,
              severity,
              answers
            },
            analysis: `ADHD 검사 결과 분석: ${evaluation.description}`,
            ageGroup,
            testInfo: {
              generatedAt: new Date().toISOString(),
              version: '1.0'
            }
          })}
          disabled={isSaving}
        >
          <div className="text-left">
            <div className="font-semibold">{isSaving ? '저장 중...' : '결과 저장'}</div>
            <div className="text-sm text-muted-foreground">{isSaving ? '잠시만 기다려주세요' : '검사기록에 저장'}</div>
          </div>
        </Button>
      </div>

      {/* AI 이미지 생성 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">🎨 맞춤형 집중력 향상 이미지 생성</h3>
        <p className="text-muted-foreground mb-6">
          ADHD 테스트 결과를 바탕으로 집중력 향상과 치료에 도움이 되는 개인화된 이미지를 생성해보세요.
        </p>
        <ImageGenerator
          initialPrompt={`ADHD ${severity} 수준에 맞는 집중력 향상과 마음 안정을 위한 치료 이미지 생성. 평온하고 집중할 수 있는 환경을 표현한 한국어 설명 포함`}
          context={`ADHD 테스트 결과 - 심각도: ${severity}, 총점: ${total}점. 주의력 결핍: ${inattentionScore}점, 과잉행동/충동성: ${hyperactivityScore}점`}
          type="therapy"
        />
      </Card>

      {/* 다음 단계 제안 */}
      <NextStepSuggestion className="mb-6" />

      {/* 결과 공유 */}
      <Card className="p-6 mb-6 result-content">
        <ShareResultButton
          title={`ADHD 자가진단 결과 - ${severity}`}
          description={`총점 ${total}점 (평균 ${average}점) - ${severity} 수준으로 확인되었습니다.`}
          resultData={results}
          showScreenshot={true}
        />
      </Card>

      {/* 상품 추천 */}
      <ProductRecommendation 
        category="adhd" 
        severity={severity}
        ageGroup={ageGroup}
      />

      {/* 음성 기능 */}
      <VoiceFeature 
        title="ADHD 검사 결과 음성 안내"
        text={`ADHD 검사 결과를 알려드리겠습니다. 총점 ${results.total}점으로 ${evaluation.level} 수준입니다. ${evaluation.description}`}
        type="result"
      />

      {/* 소셜 공유 */}
      <SocialShareButtons 
        title={`ADHD 검사 결과: ${evaluation.level} (${results.average.toFixed(1)}점)`}
        description={`${evaluation.description} 더 자세한 분석을 받아보세요!`}
      />

      {/* IEP 생성 버튼 (구독자 전용) */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-2">맞춤형 개별교육계획(IEP) 생성</h4>
            <p className="text-purple-800 text-sm mb-4">
              이 검사 결과를 바탕으로 AI가 개별화된 교육 및 지원 계획을 자동으로 생성해드립니다.
            </p>
            <Button
              onClick={() => navigate('/iep-generator', { 
                state: { 
                  assessmentResults: {
                    'ADHD 검사': results,
                    aiAnalysis: aiAnalysis,
                    domainScores: domainScores
                  } 
                }
              })}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              맞춤형 IEP 생성하기
            </Button>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 체크는 주의집중력 증상 관찰을 위한 참고도구로, 전문적 평가를 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 통합건강의학과 전문의와 상담하시기 바랍니다.
        </p>
      </Card>

      {/* 전문가 상담 권유 */}
      <ExpertConsultationNotice />
      
      {/* 맞춤 추천 및 B2B 제안 */}
      <PersonalizedProductRecommendation 
        testType="adhd"
        testResult={results}
      />
    </div>
  );
};

export default AdhdTestResult;