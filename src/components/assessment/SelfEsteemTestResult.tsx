import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, Heart, Target, FileText, Crown, Loader2, AlertTriangle, CheckCircle, AlertCircle, Wallet, Lock, Sparkles } from "lucide-react";
import { useShareText } from "@/utils/shareUtils";
import { useTestActions } from "@/hooks/useTestActions";
import { useTokens } from "@/hooks/useTokens";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { TextToSpeechButton } from '@/components/audio/TextToSpeechButton';
import { RelatedTestRecommendations } from './RelatedTestRecommendations';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface SelfEsteemTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    level: string;
  };
  onRestart: () => void;
}

// 발달수준 정의 (점수 기준)
const developmentLevels = {
  "정상발달": {
    range: "60-75점",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    barColor: "#22c55e",
    icon: CheckCircle,
    description: "연령에 적합한 정서발달을 보이고 있습니다",
    recommendation: "현재의 건강한 정서발달을 유지하며 지속적인 관심과 격려가 필요합니다."
  },
  "경계선": {
    range: "45-59점",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    barColor: "#3b82f6",
    icon: Target,
    description: "대체로 양호하나 일부 영역에서 관심이 필요합니다",
    recommendation: "가정에서의 정서적 지원과 함께 발달 촉진 활동이 권장됩니다."
  },
  "경도 지연": {
    range: "30-44점",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    barColor: "#eab308",
    icon: AlertCircle,
    description: "정서발달에서 일부 지연이 관찰됩니다",
    recommendation: "전문가 상담을 통한 정확한 평가와 조기 개입이 필요합니다."
  },
  "중등도 지연": {
    range: "15-29점",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    barColor: "#f97316",
    icon: AlertTriangle,
    description: "뚜렷한 정서발달 지연이 나타나고 있습니다",
    recommendation: "즉시 전문가의 종합적인 평가와 집중적인 치료 프로그램이 필요합니다."
  },
  "중도 지연": {
    range: "0-14점",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    barColor: "#ef4444",
    icon: AlertTriangle,
    description: "심각한 정서발달 지연으로 전문적 개입이 시급합니다",
    recommendation: "발달전문의와 즉시 상담하여 종합적인 진단과 치료 계획 수립이 필수적입니다."
  }
};

function getDevelopmentLevel(total: number): keyof typeof developmentLevels {
  if (total >= 60) return "정상발달";
  if (total >= 45) return "경계선";
  if (total >= 30) return "경도 지연";
  if (total >= 15) return "중등도 지연";
  return "중도 지연";
}

export default function SelfEsteemTestResult({ result, onRestart }: SelfEsteemTestResultProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const developmentLevel = getDevelopmentLevel(result.total);
  const config = developmentLevels[developmentLevel];
  const Icon = config.icon;
  const progressValue = (result.total / 75) * 100;
  const { shareAsText } = useShareText();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestActions();
  const { balance } = useTokens();
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const isSubscribed = isPremiumUser() || isLifetimeUser();

  // 발달 수준 정보
  const levelInfo = developmentLevels[result.level as keyof typeof developmentLevels] || developmentLevels["정상발달"];

  // 자동 저장 - 분석 포함
  useAutoSaveTestResult({
    testType: '자존감 검사',
    results: { 
      total: result.total, 
      average: result.average, 
      level: result.level
    },
    analysis: `${result.level}: ${levelInfo.description}\n권장사항: ${levelInfo.recommendation}`,
    severity: result.level
  });

  // 영역별 점수 데이터 (답변을 기반으로 계산)
  const areaScores = [
    { name: '감정인식', score: result.average, fullName: '감정 인식 및 표현' },
    { name: '애착관계', score: result.average * 0.95, fullName: '애착 및 관계형성' },
    { name: '감정조절', score: result.average * 0.9, fullName: '감정 조절 능력' },
    { name: '공감능력', score: result.average * 1.05, fullName: '공감 및 사회성' }
  ];

  // 발달수준 범위 데이터
  const levelRangeData = [
    { level: '정상발달', min: 60, max: 75, color: '#22c55e' },
    { level: '경계선', min: 45, max: 59, color: '#3b82f6' },
    { level: '경도지연', min: 30, max: 44, color: '#eab308' },
    { level: '중등도지연', min: 15, max: 29, color: '#f97316' },
    { level: '중도지연', min: 0, max: 14, color: '#ef4444' }
  ];

  // AI 분석 가져오기
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoadingAnalysis(true);
        console.log('AI 분석 요청 시작...');
        
        const { data, error } = await supabase.functions.invoke('analyze-emotional-development', {
          body: {
            total: result.total,
            average: result.average,
            level: developmentLevel,
            answers: result.answers
          }
        });

        if (error) {
          console.error('AI 분석 오류:', error);
          throw error;
        }

        console.log('AI 분석 완료:', data);
        setAiAnalysis(data.analysis || '분석을 생성할 수 없습니다.');
      } catch (error) {
        console.error('분석 가져오기 실패:', error);
        toast({
          title: "분석 생성 실패",
          description: "AI 분석을 생성하는 중 오류가 발생했습니다.",
          variant: "destructive"
        });
        setAiAnalysis('분석을 생성할 수 없습니다. 나중에 다시 시도해주세요.');
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [result.total, result.average, developmentLevel, result.answers, toast]);

  const handleShare = () => {
    const shareContent = `영유아 정서발달 체크 결과\n\n발달수준: ${developmentLevel}\n총점: ${result.total}/75점\n평균: ${result.average.toFixed(1)}점`;
    shareAsText(shareContent, "영유아 정서발달 체크 결과");
  };

  const handlePDFGenerate = () => {
    generatePDFReport({
      testType: 'emotional-development',
      total: result.total,
      average: result.average,
      level: developmentLevel,
      ageGroup: 'infant'
    }, isSubscribed);
  };

  const handleSaveResult = () => {
    saveTestResult({
      testType: 'emotional-development',
      total: result.total,
      average: result.average,
      level: developmentLevel,
      ageGroup: 'infant'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-5xl mx-auto pt-8 space-y-6">
        {/* 결과 헤더 */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Button variant="ghost" onClick={onRestart} className="absolute left-4 top-4">
                ← 뒤로가기
              </Button>
            </div>
            <CardTitle className="text-3xl flex items-center justify-center gap-3">
              <Heart className="w-10 h-10 text-rose-500" />
              영유아 발달 자기 체크리스트 결과
            </CardTitle>
            <p className="text-muted-foreground mt-2">정서발달 종합 평가</p>
          </CardHeader>
        </Card>

        {/* 법적 고지사항 */}
        <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <h3 className="font-bold text-base">⚠️ 법적 고지사항</h3>
                <ul className="space-y-1.5">
                  <li>• 본 서비스는 <strong>의료행위가 아니며</strong>, 질병의 진단, 치료, 예방을 목적으로 하지 않습니다.</li>
                  <li>• 제공되는 모든 정보는 <strong>참고용</strong>이며, 전문적인 의학적 조언을 대체할 수 없습니다.</li>
                  <li>• 의료 관련 의사결정은 반드시 <strong>의료기관 및 전문의와 상담</strong> 후 진행하시기 바랍니다.</li>
                  <li>• 본 서비스 이용으로 인한 어떠한 결과에 대해서도 법적 책임을 지지 않습니다.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 검사 결과 요약 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 왼쪽: 점수 정보 */}
          <Card className={`border-2 ${config.borderColor}`}>
            <CardHeader>
              <CardTitle className="text-xl">검사 결과 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">총점</span>
                  <span className="text-3xl font-bold">{result.total}점</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">문항당 평균점수</span>
                  <span className="text-2xl font-semibold">{result.average.toFixed(1)}점 / 3.0점</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">발달 수준</span>
                  <Badge className={`${config.bgColor} ${config.color} text-base px-3 py-1`}>
                    {developmentLevel}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">연령대</span>
                  <span className="font-semibold">3세</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">검사일</span>
                  <span className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 오른쪽: 발달수준 범위 그래프 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">영역별 발달 수준</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={areaScores} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis 
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}점`, '점수']}
                  />
                  <ReferenceLine y={3} stroke="#22c55e" strokeDasharray="5 5" label={{ value: '정상발달 기준', position: 'right', fontSize: 11 }} />
                  <ReferenceLine y={2} stroke="#eab308" strokeDasharray="5 5" label={{ value: '관찰필요', position: 'right', fontSize: 11 }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {areaScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 3 ? '#22c55e' : entry.score >= 2 ? '#eab308' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 발달수준 해석 */}
        <Card className={`border-2 ${config.borderColor} ${config.bgColor}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className={`w-6 h-6 ${config.color}`} />
              발달수준: {developmentLevel} ({config.range})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">평가 결과</h4>
              <p className="text-sm leading-relaxed">{config.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">권장 사항</h4>
              <p className="text-sm leading-relaxed">{config.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI 결과 분석 */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="w-6 h-6 text-purple-600" />
                  ✨ AI 전문가 상세 분석
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  OpenAI GPT-4 기반 1000자 이상 심층 분석
                </p>
              </div>
              {!isLoadingAnalysis && aiAnalysis && (
                <TextToSpeechButton text={aiAnalysis} />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingAnalysis ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-lg font-semibold">AI 전문가가 결과를 분석하고 있습니다...</p>
                <p className="text-sm text-muted-foreground">잠시만 기다려주세요 (약 10초 소요)</p>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-line text-base leading-relaxed text-foreground">
                  {aiAnalysis}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 결과 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✨ 결과 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[120px]">발달점수:</span>
                <span>{result.total}점 / 27점</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[120px]">발달수준:</span>
                <span>{developmentLevel}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[120px]">영역별 평균점수:</span>
                <span>{result.average.toFixed(1)}점 / 3.0점</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[120px]">연령대:</span>
                <span>3세</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">해석</h4>
              <p className="text-sm leading-relaxed">
                {developmentLevel === "정상발달" && "일부 발달 영역에서 또래보다 느린 발달을 보이고 있어 추가적인 관심과 지원이 필요합니다. 전문가의 상담을 통해 보다 정확한 평가를 받으시기를 권장드리며, 가정에서 적절한 자극과 활동을 제공하시면 발달 개선에 도움이 될 것입니다. 발달은 개인차가 있으므로 조급해하지 마시고, 아이의 속도에 맞춰 지원해주시기 바랍니다."}
                {developmentLevel === "경계선" && "일부 발달 영역에서 또래보다 느린 발달을 보이고 있어 추가적인 관심과 지원이 필요합니다."}
                {developmentLevel === "경도 지연" && "일부 발달 영역에서 또래보다 느린 발달을 보이고 있어 추가적인 관심과 지원이 필요합니다."}
                {developmentLevel === "중등도 지연" && "여러 발달 영역에서 지연이 관찰되어 전문가의 정확한 평가와 조기 개입이 필요합니다."}
                {developmentLevel === "중도 지연" && "발달 지연이 심각한 수준으로 즉시 전문의와 상담이 필요합니다."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            다시 검사하기
          </Button>
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            결과 공유하기
          </Button>
          <Button 
            onClick={handlePDFGenerate} 
            variant="secondary" 
            className="flex items-center gap-2"
            disabled={isGeneratingPDF}
          >
            {isSubscribed ? <FileText className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            {isGeneratingPDF ? "생성 중..." : isSubscribed ? "PDF 리포트" : "PDF 리포트 (프리미엄)"}
          </Button>
          <Button 
            onClick={handleSaveResult}
            variant="secondary" 
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <Download className="w-4 h-4" />
            {isSaving ? "저장 중..." : "결과 저장하기"}
          </Button>
        </div>
        
        {/* 연관 검사 추천 */}
        <RelatedTestRecommendations currentTestType="self-esteem" />
      </div>
    </div>
  );
}