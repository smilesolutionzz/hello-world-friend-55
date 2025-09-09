import { useState } from 'react';
import AdvancedDevelopmentalForm from '@/components/assessment/AdvancedDevelopmentalForm';
import AdvancedDevelopmentalResult from '@/components/assessment/AdvancedDevelopmentalResult';
import AgeSelector from '@/components/assessment/AgeSelector';

const AdvancedDevelopmentalAssessment = () => {
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                AIH 고도화 발달특성 종합평가
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                임상심리학 박사급 전문성이 적용된 35문항 종합평가로, 
                8개 핵심 발달 영역을 정밀 분석하여 개별화된 전문가급 인사이트를 제공합니다.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8 max-w-4xl mx-auto border border-primary/10">
              <h3 className="text-xl font-bold text-primary mb-6 text-center">
                🧠 박사급 고도화 평가 시스템
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">🔬 과학적 정밀성</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 35문항 다차원 종합평가</li>
                    <li>• 8개 핵심 발달영역 정밀분석</li>
                    <li>• DSM-5 기반 임상적 해석</li>
                    <li>• 신경발달학적 관점 적용</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">🎯 개별화 전문성</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 개인별 강점-도전영역 매핑</li>
                    <li>• 맞춤형 개입전략 제시</li>
                    <li>• 단계별 발달지원 로드맵</li>
                    <li>• 가족-전문가 협력모델</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">📊 8대 핵심 발달영역</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <span>• 사회적 의사소통</span>
                  <span>• 인지적 유연성</span>
                  <span>• 감각 처리</span>
                  <span>• 정서 조절</span>
                  <span>• 사회적 상호작용</span>
                  <span>• 반복행동/관심</span>
                  <span>• 실행 기능</span>
                  <span>• 적응 기술</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center">평가 대상자의 연령대를 선택해주세요</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button
                  onClick={() => handleAgeSelect(10)}
                  className="group p-8 border-2 border-primary/20 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="space-y-2">
                    <div className="text-4xl">👶</div>
                    <div className="text-xl font-bold text-primary">아동·청소년</div>
                    <div className="text-sm text-muted-foreground">만 2세 ~ 18세</div>
                    <div className="text-xs text-muted-foreground">발달 특성과 사회적 적응 중심</div>
                  </div>
                </button>
                <button
                  onClick={() => handleAgeSelect(25)}
                  className="group p-8 border-2 border-primary/20 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="space-y-2">
                    <div className="text-4xl">🧑</div>
                    <div className="text-xl font-bold text-primary">성인</div>
                    <div className="text-sm text-muted-foreground">만 19세 이상</div>
                    <div className="text-xs text-muted-foreground">일상 기능과 직업적 적응 중심</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'screening' && (
          <AdvancedDevelopmentalForm
            ageGroup={ageGroup}
            onComplete={handleScreeningComplete}
            onBack={handleBackToAgeSelect}
          />
        )}

        {currentStep === 'result' && screeningResults && (
          <AdvancedDevelopmentalResult
            results={screeningResults}
            onBack={handleBackToAgeSelect}
            onNewTest={handleNewTest}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedDevelopmentalAssessment;