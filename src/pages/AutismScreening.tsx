import { useState } from 'react';
import DevelopmentalScreeningForm from '@/components/assessment/AutismScreeningForm';
import DevelopmentalScreeningResult from '@/components/assessment/AutismScreeningResult';
import AgeSelector from '@/components/assessment/AgeSelector';

const DevelopmentalScreening = () => {
  const [currentStep, setCurrentStep] = useState<'age-select' | 'screening' | 'result'>('age-select');
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [ageGroup, setAgeGroup] = useState<'child' | 'adult'>('child');
  const [screeningResults, setScreeningResults] = useState<any>(null);

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
    setAgeGroup(age < 18 ? 'child' : 'adult');
    setCurrentStep('screening');
  };

  const handleScreeningComplete = (results: any) => {
    setScreeningResults(results);
    setCurrentStep('result');
  };

  const handleBackToAgeSelect = () => {
    setCurrentStep('age-select');
    setSelectedAge(null);
  };

  const handleNewTest = () => {
    setCurrentStep('age-select');
    setSelectedAge(null);
    setScreeningResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {currentStep === 'age-select' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                AIH 발달특성 체크
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AIH에서 독자 개발한 발달특성 관찰도구로 개인의 고유한 특성을 파악하고
                발달센터와의 연계를 통한 맞춤형 지원 방향을 제시합니다.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🏥 발달센터 특화 기능
              </h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li>• AIH 독자 개발 발달특성 관찰도구</li>
                <li>• 개인의 강점과 지원 영역 분석</li>
                <li>• 사회적 특성 및 환경 적응성 평가</li>
                <li>• 발달센터 연계 맞춤 정보 제공</li>
                <li>• 개별화 지원 방향 제시</li>
                <li>• 전문적이면서도 편안한 접근</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">체크 대상자의 연령을 선택해주세요</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={() => handleAgeSelect(10)}
                  className="p-6 border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="text-lg font-semibold">아동청소년</div>
                  <div className="text-sm text-muted-foreground">16개월 ~ 18세</div>
                </button>
                <button
                  onClick={() => handleAgeSelect(25)}
                  className="p-6 border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="text-lg font-semibold">성인</div>
                  <div className="text-sm text-muted-foreground">19세 이상</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'screening' && (
          <DevelopmentalScreeningForm
            ageGroup={ageGroup}
            onComplete={handleScreeningComplete}
            onBack={handleBackToAgeSelect}
          />
        )}

        {currentStep === 'result' && screeningResults && (
          <DevelopmentalScreeningResult
            results={screeningResults}
            onBack={handleBackToAgeSelect}
            onNewTest={handleNewTest}
          />
        )}
      </div>
    </div>
  );
};

export default DevelopmentalScreening;