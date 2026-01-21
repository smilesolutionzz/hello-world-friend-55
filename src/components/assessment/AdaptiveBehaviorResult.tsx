import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle, AlertCircle, ArrowLeft, Download, MessageCircle, ExternalLink, Brain, Loader2, Crown, Wallet, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';
import { useToast } from '@/hooks/use-toast';
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { RelatedTestRecommendations } from './RelatedTestRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface AdaptiveBehaviorResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    level: string;
  };
}

const AdaptiveBehaviorResult = ({ results }: AdaptiveBehaviorResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [expertInterpretation, setExpertInterpretation] = useState<string>("");
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [reportImage, setReportImage] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // 카테고리별 점수 계산
  const categoryScores = {
    '일상생활 기술': results.answers.slice(0, 5).reduce((sum, val) => sum + val, 0), // 5문항, 최대 15점
    '사회적 기술': results.answers.slice(5, 9).reduce((sum, val) => sum + val, 0), // 4문항, 최대 12점
    '의사소통 기술': results.answers.slice(9, 12).reduce((sum, val) => sum + val, 0), // 3문항, 최대 9점
    '자기관리 기술': results.answers.slice(12, 15).reduce((sum, val) => sum + val, 0), // 3문항, 최대 9점
    '지역사회 적응': results.answers.slice(15, 18).reduce((sum, val) => sum + val, 0), // 3문항, 최대 9점
  };

  // 레이더 차트 데이터
  const radarData = Object.entries(categoryScores).map(([name, value]) => {
    let maxScore = 15;
    if (name === '사회적 기술') maxScore = 12;
    else if (name !== '일상생활 기술') maxScore = 9;
    
    return {
      category: name,
      score: value,
      fullMark: maxScore,
      percentage: Math.round((value / maxScore) * 100)
    };
  });

  // 막대 차트 데이터
  const barData = Object.entries(categoryScores).map(([name, value]) => {
    let maxScore = 15;
    if (name === '사회적 기술') maxScore = 12;
    else if (name !== '일상생활 기술') maxScore = 9;
    
    return {
      name,
      점수: value,
      최대점수: maxScore,
    };
  });

  const getLevelInfo = (level: string) => {
    switch (level) {
      case '높음':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: TrendingUp,
          scoreRange: '평균 2.5점 이상 (총 45점 이상)',
          message: '적응행동 수준이 우수합니다',
          description: '일상생활과 사회적 기능이 매우 우수하며, 독립적으로 생활할 수 있는 능력을 갖추고 있습니다.',
          recommendation: '현재의 긍정적인 발달을 유지하고 더욱 향상시킬 수 있도록 지속적인 지원이 필요합니다.',
          focus: '강점 유지',
          interventions: [
            '현재의 강점을 계속 활용',
            '더 높은 수준의 독립성 목표 설정',
            '지역사회 참여 기회 확대',
            '자기 결정 능력 강화',
            '정기적인 발달 모니터링'
          ]
        };
      case '중간':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: CheckCircle,
          scoreRange: '평균 1.5~2.5점 (총 27~45점)',
          message: '적응행동 수준이 평균적입니다',
          description: '기본적인 적응행동은 가능하나, 일부 영역에서 추가 지원이 필요할 수 있습니다.',
          recommendation: '취약한 영역을 파악하여 집중적인 훈련과 지원을 제공하는 것이 좋습니다.',
          focus: '취약 영역 강화',
          interventions: [
            '개별화된 교육 프로그램(IEP) 수립',
            '단계별 기술 훈련',
            '부분적 도움 및 단계적 독립성 증진',
            '강점 영역 활용 전략',
            '정기적 평가 및 계획 수정'
          ]
        };
      case '낮음':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: AlertCircle,
          scoreRange: '평균 0.5~1.5점 (총 9~27점)',
          message: '적응행동 수준이 낮습니다',
          description: '일상생활에서 상당한 지원이 필요하며, 체계적인 훈련이 필요합니다.',
          recommendation: '전문가의 체계적인 지원과 적응행동 훈련 프로그램 참여를 권장합니다.',
          focus: '집중적 개입',
          interventions: [
            '집중적인 적응행동 훈련',
            '작업치료 및 일상생활 훈련',
            '보조기구 활용 고려',
            '가족 교육 및 지원',
            '전문 치료사 협력'
          ]
        };
      default:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: AlertCircle,
          scoreRange: '평균 0.5점 미만 (총 9점 미만)',
          message: '적응행동 수준이 매우 낮습니다',
          description: '일상생활 전반에서 집중적인 지원이 필요하며, 즉각적인 전문가 개입이 필요합니다.',
          recommendation: '발달장애 전문가의 종합적인 평가와 개별화된 지원 계획이 시급히 필요합니다.',
          focus: '즉각적 개입',
          interventions: [
            '종합적 발달 평가 실시',
            '다학제적 팀 접근',
            '개별화 집중 훈련',
            '보호자 집중 교육',
            '전문 서비스 연계'
          ]
        };
    }
  };

  const info = getLevelInfo(results.level);
  const Icon = info.icon;
  const percentage = Math.round((results.average / 3) * 100);

  const handlePDFDownload = async () => {
    await downloadResultAsPDF(
      'adaptive-behavior-result-content',
      '적응행동_평가_결과',
      () => {
        toast({
          title: "PDF 다운로드 완료",
          description: "적응행동 평가 결과가 저장되었습니다.",
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

  useEffect(() => {
    const fetchExpertInterpretation = async () => {
      setIsLoadingInterpretation(true);
      try {
        const { data, error } = await supabase.functions.invoke('behavior-expert-interpretation', {
          body: {
            assessmentType: 'adaptive-behavior',
            results,
            categoryScores
          }
        });

        if (error) throw error;
        if (data?.interpretation) {
          setExpertInterpretation(data.interpretation);
        }
      } catch (error) {
        console.error('전문가 해석 생성 실패:', error);
      } finally {
        setIsLoadingInterpretation(false);
      }
    };

    const fetchReportImage = async () => {
      setIsLoadingImage(true);
      try {
        const prompt = `적응행동 평가 결과를 표현하는 긍정적이고 희망찬 이미지를 생성해주세요. 아동의 성장과 발달을 상징하는 따뜻하고 밝은 분위기의 실사 이미지로 만들어주세요. 전문적이면서도 친근한 느낌을 담아주세요.`;
        
        const { data, error } = await supabase.functions.invoke('generate-report-image', {
          body: { prompt }
        });

        if (error) throw error;
        if (data?.imageUrl) {
          setReportImage(data.imageUrl);
        }
      } catch (error) {
        console.error('리포트 이미지 생성 실패:', error);
      } finally {
        setIsLoadingImage(false);
      }
    };

    fetchExpertInterpretation();
    fetchReportImage();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 py-8">
      <div id="adaptive-behavior-result-content" className="container mx-auto px-4 max-w-6xl space-y-6">
        {/* PDF Header */}
        <PDFHeader testName="적응행동 평가 결과" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Button>
          <h1 className="text-3xl font-bold text-brand-gradient">적응행동 평가 결과</h1>
          <Button variant="outline" onClick={handlePDFDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            PDF 다운로드
          </Button>
        </div>

        {/* 법적 안전 공지 */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>⚠️ 중요 안내:</strong> 이 검사 결과는 선별 도구이며 정식 진단이 아닙니다. 
              정확한 평가와 개별 지원 계획 수립을 위해서는 반드시 발달장애 전문가의 
              종합적인 평가가 필요합니다.
            </p>
          </CardContent>
        </Card>

        {/* 종합 점수 Card */}
        <Card className={`${info.bgColor} border-2 ${info.borderColor}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-40 h-40 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl border-4 border-white">
                <div className="text-center">
                  <Icon className={`w-12 h-12 mx-auto mb-2 ${info.color}`} />
                  <div className={`text-5xl font-bold ${info.color}`}>{percentage}%</div>
                  <div className="text-sm text-muted-foreground mt-1">독립성</div>
                </div>
              </div>
            </div>
            <CardTitle className={`text-3xl mb-2 ${info.color}`}>
              {results.level}
            </CardTitle>
            <p className="text-lg font-medium text-foreground">{info.message}</p>
            <p className="text-sm text-muted-foreground mt-2">{info.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.total}점</div>
                <div className="text-xs text-muted-foreground">총점 (최대 54점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{results.average.toFixed(2)}점</div>
                <div className="text-xs text-muted-foreground">평균 (최대 3점)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">18문항</div>
                <div className="text-xs text-muted-foreground">평가 항목</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${info.color}`}>{info.focus}</div>
                <div className="text-xs text-muted-foreground">개입 초점</div>
              </div>
            </div>
            
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${info.bgColor}`}>
                  <Icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">점수 범위</h4>
                  <p className="text-sm text-muted-foreground">{info.scoreRange}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 카테고리별 상세 분석 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 레이더 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>영역별 분석</CardTitle>
              <p className="text-sm text-muted-foreground">각 적응행동 영역별 점수 분포</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 15]} tick={{ fill: '#64748b' }} />
                  <Radar name="점수" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 막대 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 점수</CardTitle>
              <p className="text-sm text-muted-foreground">각 행동 카테고리의 점수 비교</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="점수" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="최대점수" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리별 세부 분석 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 세부 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {radarData.map(({category, score, fullMark, percentage}) => {
                let severityColor = 'bg-red-500';
                if (percentage >= 70) severityColor = 'bg-green-500';
                else if (percentage >= 40) severityColor = 'bg-blue-500';
                else if (percentage >= 20) severityColor = 'bg-yellow-500';

                return (
                  <div key={category} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{category}</span>
                      <Badge variant="outline">{score} / {fullMark}점 ({percentage}%)</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`${severityColor} h-3 rounded-full transition-all`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI 생성 이미지 */}
        {(isLoadingImage || reportImage) && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {isLoadingImage ? (
                <div className="flex items-center justify-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI 이미지 생성 중...</p>
                  </div>
                </div>
              ) : reportImage ? (
                <img 
                  src={reportImage} 
                  alt="평가 결과 이미지" 
                  className="w-full h-auto object-cover"
                />
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* AI 전문가 해석 */}
        {isLoadingInterpretation ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary animate-pulse" />
                AI 전문가 해석 생성 중...
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : expertInterpretation && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                AI 전문가 해석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background/80 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{expertInterpretation}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 권장 개입 전략 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              권장 개입 전략
            </CardTitle>
            <p className="text-sm text-muted-foreground">{info.recommendation}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {info.interventions.map((intervention, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm flex-1">{intervention}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전문 치료 서비스 */}
        <Card>
          <CardHeader>
            <CardTitle>권장 전문 치료 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>🏥</span> 작업치료 (Occupational Therapy)
                </h4>
                <p className="text-sm text-muted-foreground">일상생활 기술, 소근육 발달, 감각통합 향상</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>💬</span> 언어치료 (Speech Therapy)
                </h4>
                <p className="text-sm text-muted-foreground">의사소통 기술, 사회적 언어 능력 향상</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>🧠</span> 행동치료 (ABA)
                </h4>
                <p className="text-sm text-muted-foreground">적응행동 학습, 문제행동 개선</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>👨‍👩‍👧</span> 가족 지원 서비스
                </h4>
                <p className="text-sm text-muted-foreground">부모 교육, 가족 상담, 정보 제공</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전문가 상담 안내 */}
        <ExpertConsultationNotice />

        {/* 연계 검사 추천 */}
        <RelatedTestRecommendations currentTestType="adaptive-behavior" />

        {/* CTA Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            className="w-full h-auto py-6 flex flex-col items-center gap-2" 
            onClick={() => navigate('/consultation-reservation')}
          >
            <MessageCircle className="w-6 h-6" />
            <div className="text-center">
              <div className="font-bold">전문가 상담 예약</div>
              <div className="text-xs opacity-90">발달장애 전문가 연결</div>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate('/assessment')}
          >
            <ExternalLink className="w-6 h-6" />
            <div className="text-center">
              <div className="font-bold">다른 검사 하기</div>
              <div className="text-xs opacity-90">추가 평가 진행</div>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <Brain className="w-6 h-6" />
            <div className="text-center">
              <div className="font-bold">대시보드</div>
              <div className="text-xs opacity-90">전체 기록 보기</div>
            </div>
          </Button>
        </div>

        {/* 추가 정보 */}
        <Card>
          <CardHeader>
            <Button 
              variant="ghost" 
              className="w-full justify-between"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span className="font-semibold">적응행동 이해하기</span>
              <span>{showDetails ? '▲' : '▼'}</span>
            </Button>
          </CardHeader>
          {showDetails && (
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">적응행동이란?</h4>
                <p className="text-sm text-muted-foreground">
                  적응행동(Adaptive Behavior)은 일상생활에서 독립적으로 기능하고 
                  사회적 요구에 대응하는 능력을 말합니다. 개인 독립성, 사회적 책임성, 
                  실용적 기술 등이 포함되며, 발달장애 진단의 중요한 기준 중 하나입니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">적응행동의 중요성</h4>
                <p className="text-sm text-muted-foreground">
                  적응행동 수준은 지역사회 통합, 교육적 배치, 직업 기회 등에 
                  직접적인 영향을 미칩니다. 높은 적응행동 수준은 더 큰 독립성과 
                  삶의 질 향상으로 이어집니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">적응행동 향상 방법</h4>
                <p className="text-sm text-muted-foreground">
                  체계적인 교육, 반복적 연습, 긍정적 강화, 환경 수정, 보조 기구 활용 등을 
                  통해 적응행동을 향상시킬 수 있습니다. 개별화된 지원 계획(ISP)이 
                  효과적인 개입의 핵심입니다.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdaptiveBehaviorResult;
