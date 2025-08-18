import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PremiumAssessmentCard from "@/components/assessment/PremiumAssessmentCard";
import PremiumAssessmentForm from "@/components/assessment/PremiumAssessmentForm";
import PremiumAssessmentResult from "@/components/assessment/PremiumAssessmentResult";
import { 
  premiumAssessmentInfo,
  personalityTypeAssessmentQuestions,
  temperamentAssessmentQuestions, 
  cognitiveAssessmentQuestions,
  workStressAssessmentQuestions,
  relationshipAssessmentQuestions
} from "@/data/premiumAssessmentQuestions";

const PremiumAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'list' | 'assessment' | 'result'>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number>>({});
  const [isSubscribed] = useState(true); // TODO: 실제 구독 상태로 연동

  const assessmentData = {
    personality_type: Object.values(personalityTypeAssessmentQuestions).flat(),
    temperament: Object.values(temperamentAssessmentQuestions).flat(),
    cognitive: Object.values(cognitiveAssessmentQuestions).flat(),
    work_stress: Object.values(workStressAssessmentQuestions).flat(),
    relationship: Object.values(relationshipAssessmentQuestions).flat()
  };

  const handleStartAssessment = (assessmentKey: string) => {
    setSelectedAssessment(assessmentKey);
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = (results: Record<string, number>) => {
    console.log('Premium Assessment Results:', results);
    setAssessmentResults(results);
    setCurrentStep('result');
  };

  const handleBack = () => {
    if (currentStep === 'result') {
      setCurrentStep('list');
    } else if (currentStep === 'assessment') {
      setCurrentStep('list');
    } else {
      navigate('/assessment');
    }
  };

  if (currentStep === 'result' && selectedAssessment && Object.keys(assessmentResults).length > 0) {
    return (
      <PremiumAssessmentResult
        assessmentType={selectedAssessment}
        results={assessmentResults}
        assessmentInfo={premiumAssessmentInfo[selectedAssessment as keyof typeof premiumAssessmentInfo]}
        onBack={handleBack}
      />
    );
  }

  if (currentStep === 'assessment' && selectedAssessment) {
    return (
      <PremiumAssessmentForm
        assessmentType={selectedAssessment}
        questions={assessmentData[selectedAssessment as keyof typeof assessmentData]}
        assessmentInfo={premiumAssessmentInfo[selectedAssessment as keyof typeof premiumAssessmentInfo]}
        onComplete={handleAssessmentComplete}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-yellow-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                프리미엄 심리검사
              </h1>
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-lg text-muted-foreground">
              전문적이고 정밀한 심리 분석을 위한 특별한 검사들
            </p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Premium Features Banner */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-300" />
                <h2 className="text-2xl font-bold">구독자 전용 프리미엄 검사</h2>
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold mb-1">5가지</div>
                  <div className="text-sm opacity-90">전문 검사</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">정밀분석</div>
                  <div className="text-sm opacity-90">과학적 근거</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">맞춤형</div>
                  <div className="text-sm opacity-90">개인별 해석</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">PDF</div>
                  <div className="text-sm opacity-90">상세 보고서</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Cards Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(premiumAssessmentInfo).map(([key, info]) => (
              <PremiumAssessmentCard
                key={key}
                assessmentKey={key}
                info={info}
                onStart={handleStartAssessment}
                isSubscribed={isSubscribed}
              />
            ))}
          </div>
        </div>

        {/* Subscription CTA for Non-subscribers */}
        {!isSubscribed && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                프리미엄 회원이 되어보세요
              </h3>
              <p className="text-yellow-700 mb-6">
                전문적인 심리검사와 상세한 분석 보고서를 받아보실 수 있습니다
              </p>
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3"
                size="lg"
              >
                구독하기
              </Button>
            </div>
          </div>
        )}

        {/* Professional Notice */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h4 className="font-semibold text-blue-900 mb-2">전문 심리검사 안내</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              본 검사들은 임상심리학 이론에 근거한 전문 도구들로, 개인의 심리적 특성을 깊이 있게 분석합니다. 
              검사 결과는 참고용이며, 전문적인 상담이나 치료가 필요한 경우 전문가와 상담하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumAssessment;