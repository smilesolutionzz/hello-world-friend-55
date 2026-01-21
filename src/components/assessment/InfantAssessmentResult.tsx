import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Heart, ArrowLeft, ExternalLink, FileDown, Lock, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { PremiumAnalysisOffer } from "@/components/premium/PremiumAnalysisOffer";
import { CashBalanceDisplay } from "@/components/paywall/CashBalanceDisplay";
import { BlurredContent } from "@/components/paywall/BlurredContent";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from '@/integrations/supabase/client';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
interface InfantAssessmentResultProps {
  results: {
    answers: Record<string, number>;
    total: number;
    average: number;
    ageGroup: string;
    categoryScores: Record<string, number>;
  };
  onBack: () => void;
}

const InfantAssessmentResult = ({ results, onBack }: InfantAssessmentResultProps) => {
  const { total, average, ageGroup, categoryScores } = results;
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const today = new Date().toLocaleDateString('ko-KR');
  const [userId, setUserId] = useState<string | undefined>();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const isPremium = isPremiumUser() || isLifetimeUser();

  // 자동 저장 - 분석 포함
  const evalLevel = average >= 2.5 ? '우수' : average >= 2.0 ? '양호' : average >= 1.5 ? '보통' : '관찰 필요';
  useAutoSaveTestResult({
    testType: '영유아 발달검사',
    results: { total, average, categoryScores },
    analysis: `발달 수준: ${evalLevel}, 평균 점수: ${average.toFixed(1)}점`,
    ageGroup
  });
  
  useState(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  });
  
  const getCategoryName = (category: string) => {
    const names = {
      grossMotor: "대근육 발달",
      fineMotor: "소근육 발달", 
      language: "언어 발달",
      social: "사회성 발달",
      cognitive: "인지 발달"
    };
    return names[category as keyof typeof names] || category;
  };

  const getOverallEvaluation = (average: number) => {
    if (average >= 2.5) {
      return {
        level: "우수",
        description: "연령 대비 발달이 우수한 수준입니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (average >= 2.0) {
      return {
        level: "양호",
        description: "연령에 적합한 발달 수준입니다.",
        color: "bg-blue-100 text-blue-800 border-blue-200"
      };
    } else if (average >= 1.5) {
      return {
        level: "보통",
        description: "평균적인 발달 수준입니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else {
      return {
        level: "관찰 필요",
        description: "발달 지원이 필요할 수 있습니다.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    }
  };
  
  const chartData = Object.entries(categoryScores).map(([category, score]) => ({
    name: getCategoryName(category),
    value: score,
    fullMark: 3,
  }));

  const evaluation = getOverallEvaluation(total / Object.keys(categoryScores).length);

  return (
    <div id="infant-assessment-result" className="space-y-8">
      {/* 상단 캐시 잔액 표시 */}
      <CashBalanceDisplay />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">영유아 발달 자기 체크리스트 결과</h1>
        <div></div>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer variant="full" />

      {/* Summary Card */}
      <Card className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">검사 결과 요약</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">총점</span>
                <span className="text-2xl font-bold text-brand-gradient">{total}점</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">문항당 평균점수</span>
                <span className="text-2xl font-bold text-brand-gradient">{(total / Object.keys(categoryScores).length).toFixed(1)}점 / 3.0점</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">발달 수준</span>
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
            <h3 className="text-xl font-semibold">영역별 발달 수준</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 3]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 전문가 해석 결과 - 비구독자는 블러 처리 */}
      <BlurredContent
        title="AI 심층 분석 리포트"
        description="전문가급 상세 해석을 확인하세요"
        requiredCash={5000}
      >
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">✨ AI 심층 분석 결과</h3>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                프리미엄
              </Badge>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-medium mb-2">• 발달점수: {total}점 / {Object.keys(categoryScores).length * 3}점</p>
                <p className="text-lg font-medium">• 발달수준: {evaluation.level}</p>
              </div>
              <div>
                <p className="text-lg font-medium mb-2">• 영역당 평균점수: {(total / Object.keys(categoryScores).length).toFixed(1)}점 / 3.0점</p>
                <p className="text-lg font-medium">• 연령대: {ageGroup}</p>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-lg leading-relaxed">
                <strong>해석:</strong> {evaluation.level === "우수" 
                  ? `${ageGroup} 연령 기준으로 전반적인 발달이 우수한 수준입니다. 현재의 양육 환경과 자극이 아이의 발달에 매우 긍정적으로 작용하고 있습니다. 아이의 강점 영역을 지속적으로 지원하며, 다양한 경험과 학습 기회를 제공해주시기 바랍니다.`
                  : evaluation.level === "양호"
                  ? `${ageGroup} 연령에 적합한 발달 수준을 보이고 있습니다. 대부분의 발달 영역에서 연령에 맞는 성취를 보여주고 있어 건강한 성장을 하고 있다고 볼 수 있습니다.`
                  : evaluation.level === "보통"
                  ? `${ageGroup} 연령 기준으로 평균적인 발달 수준입니다. 일부 영역에서는 또래보다 빠른 발달을 보이고, 일부 영역에서는 시간이 더 필요할 수 있습니다.`
                  : `일부 발달 영역에서 또래보다 느린 발달을 보이고 있어 추가적인 관심과 지원이 필요할 수 있습니다. 소아과 전문의나 발달 전문가와 상담을 권장합니다.`}
              </p>
            </div>
            
            {/* 심층 분석 내용 - 프리미엄 전용 */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                영역별 심층 분석
              </h4>
              {Object.entries(categoryScores).map(([category, score]) => (
                <div key={category} className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{getCategoryName(category)}</span>
                    <Badge variant="outline">{score.toFixed(1)}점</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {score >= 2.5 ? '우수한 발달 수준입니다. 지속적인 자극과 격려를 통해 강점을 더욱 발전시켜주세요.' :
                     score >= 2.0 ? '양호한 발달 수준입니다. 현재 양육 방식을 유지하면서 다양한 경험을 제공해주세요.' :
                     score >= 1.5 ? '평균 수준입니다. 해당 영역에 조금 더 관심을 기울이면 빠른 발전을 기대할 수 있습니다.' :
                     '추가 지원이 필요할 수 있습니다. 전문가 상담을 통해 맞춤형 지원 방안을 모색해보세요.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </BlurredContent>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button 
          className="btn-brand h-16"
          onClick={() => navigate('/expert-hiring')}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">전문가 상담 연결</div>
            <div className="text-sm opacity-90">즉시 상담 가능</div>
          </div>
        </Button>

        <Button 
          onClick={async () => {
            const { downloadResultAsPDF } = await import('@/utils/pdfDownload');
            setIsGeneratingPDF(true);
            await downloadResultAsPDF(
              'infant-assessment-result',
              `영유아발달검사_${new Date().toISOString().split('T')[0]}`,
              () => setIsGeneratingPDF(false),
              () => setIsGeneratingPDF(false)
            );
          }}
          disabled={isGeneratingPDF}
          variant="outline" 
          className="h-16"
          aria-label="PDF 리포트 다운로드"
        >
          <FileDown className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">{isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 리포트'}</div>
            <div className="text-sm text-muted-foreground">결과를 PDF로 저장</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          disabled
        >
          <div className="text-left">
            <div className="font-semibold">결과 저장</div>
            <div className="text-sm text-muted-foreground">(로그인 필요)</div>
          </div>
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 체크리스트는 영유아 발달 관찰을 위한 도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 발달 평가를 위해서는 반드시 소아과 전문의나 발달 전문가와 상담하시기 바랍니다.
        </p>
      </Card>

      {/* Premium Analysis Offer */}
      <PremiumAnalysisOffer 
        testType="infant_development"
        basicScore={average}
        userId={userId}
      />
    </div>
  );
};

export default InfantAssessmentResult;