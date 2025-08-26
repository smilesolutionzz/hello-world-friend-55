import { useState } from 'react';
import AutismScreeningForm from '@/components/assessment/AutismScreeningForm';
import AutismScreeningResult from '@/components/assessment/AutismScreeningResult';
import AgeSelector from '@/components/assessment/AgeSelector';

const AutismScreening = () => {
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
                자폐스펙트럼 선별검사
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                발달센터 전문가들이 사용하는 검증된 도구로 자폐스펙트럼 특성을 선별검사합니다.
                조기 발견을 통한 적절한 지원이 가능합니다.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🏥 발달센터 특화 기능
              </h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li>• M-CHAT-R 기반 아동용 선별검사</li>
                <li>• AQ-10 기반 성인용 선별검사</li>
                <li>• 사회적 의사소통 및 제한적 반복행동 평가</li>
                <li>• 발달센터 연계 정보 제공</li>
                <li>• 조기 중재를 위한 전문가 권장사항</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">검사 대상자의 연령을 선택해주세요</h3>
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
          <AutismScreeningForm
            ageGroup={ageGroup}
            onComplete={handleScreeningComplete}
            onBack={handleBackToAgeSelect}
          />
        )}

        {currentStep === 'result' && screeningResults && (
          <AutismScreeningResult
            results={screeningResults}
            onBack={handleBackToAgeSelect}
            onNewTest={handleNewTest}
          />
        )}
      </div>
    </div>
  );
};

export default AutismScreening;