import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Target, Sparkles } from "lucide-react";
import { advancedDevelopmentalQuestions } from "@/data/advancedDevelopmentalQuestions";
import TokenGate from "@/components/TokenGate";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import HeartfeltMotivation from '../HeartfeltMotivation';

interface AdvancedDevelopmentalFormProps {
  ageGroup: 'child' | 'adult';
  onComplete: (results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    domainScores: Record<string, number>;
    useAIAnalysis?: boolean;
  }) => void;
  onBack: () => void;
}

const AdvancedDevelopmentalForm = ({ ageGroup, onComplete, onBack }: AdvancedDevelopmentalFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(advancedDevelopmentalQuestions.length).fill(-1));
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const totalQuestions = advancedDevelopmentalQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentQ = advancedDevelopmentalQuestions[currentQuestion];

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
    
    // 자동으로 다음 질문으로 이동
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleNext();
      }
    }, 600);
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.PREMIUM_ASSESSMENT);
    if (success) {
      setHasStarted(true);
    }
  };

  const calculateDomainScores = (allAnswers: number[]): Record<string, number> => {
    const domainScores: Record<string, number> = {
      '사회적 의사소통': 0,
      '인지적 유연성': 0,
      '감각 처리': 0,
      '정서 조절': 0,
      '사회적 상호작용': 0,
      '반복행동 및 제한된 관심': 0,
      '실행 기능': 0
    };

    advancedDevelopmentalQuestions.forEach((question, index) => {
      const answer = allAnswers[index];
      if (answer >= 0) {
        domainScores[question.domain] += answer;
      }
    });

    return domainScores;
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 고도화된 발달특성 종합평가 결과 계산
      const total = answers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / answers.length) * 100) / 100;
      const domainScores = calculateDomainScores(answers);
      
      onComplete({
        answers,
        total,
        average,
        ageGroup: ageGroup === 'child' ? '아동청소년' : '성인',
        domainScores,
        useAIAnalysis: true
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion];
  const canProceed = currentAnswer >= 0;

  // 토큰 게이트 표시
  if (!hasStarted) {
    return (
      <div className="space-y-8">
        <HeartfeltMotivation variant="hopeful" />
        
        <TokenGate
          tokensRequired={TOKEN_COSTS.PREMIUM_ASSESSMENT}
          featureName="AIH 고도화 발달특성 종합평가"
          onProceed={handleStartTest}
        >
          <div className="space-y-6 text-center max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <Brain className="w-8 h-8" />
                고도화 발달특성 종합평가 특징
              </div>
              <p className="text-muted-foreground">
                임상심리학 박사급 전문성으로 설계된 최첨단 발달평가 시스템
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">정밀 평가</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground text-left">
                  <li>• {ageGroup === 'child' ? '아동청소년' : '성인'}맞춤 {totalQuestions}문항</li>
                  <li>• 8개 핵심 발달영역 분석</li>
                  <li>• 도메인별 세부 점수 제공</li>
                  <li>• 약 12-15분 소요</li>
                </ul>
              </div>
              
              <div className="p-6 bg-secondary/5 rounded-xl border border-secondary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <h4 className="font-semibold">박사급 분석</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground text-left">
                  <li>• 신경발달학적 관점 적용</li>
                  <li>• DSM-5 기반 임상해석</li>
                  <li>• 개별화된 강점-도전 프로파일</li>
                  <li>• 과학적 근거 기반 권고</li>
                </ul>
              </div>
              
              <div className="p-6 bg-accent/5 rounded-xl border border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-accent" />
                  <h4 className="font-semibold">종합 지원</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground text-left">
                  <li>• 단계별 개입전략 제시</li>
                  <li>• 가족-전문가 협력모델</li>
                  <li>• 맞춤형 자원 연계정보</li>
                  <li>• 추후 모니터링 가이드</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 이 평가는 진단 도구가 아닌 <strong>발달 특성 이해와 지원방향 수립</strong>을 위한 전문가급 스크리닝 도구입니다.
              </p>
            </div>
          </div>
        </TokenGate>
      </div>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto p-8 shadow-lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div className="text-right">
            <span className="text-lg font-semibold text-primary">
              {currentQuestion + 1} / {totalQuestions}
            </span>
            <div className="text-xs text-muted-foreground">
              {currentQ.domain}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <Progress value={progress} className="w-full h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>진행률: {Math.round(progress)}%</span>
            <span>남은 문항: {totalQuestions - currentQuestion - 1}개</span>
          </div>
        </div>

        {/* Question Section */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
              <span>{currentQ.domain}</span>
            </div>
            
            <h2 className="text-2xl font-bold leading-relaxed max-w-4xl mx-auto">
              {ageGroup === 'child' ? currentQ.ageSpecific.child : currentQ.ageSpecific.adult}
            </h2>

            {currentQ.description && (
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {currentQ.description}
              </p>
            )}
          </div>

          <RadioGroup 
            value={currentAnswer.toString()} 
            onValueChange={handleAnswer}
            className="space-y-4 max-w-2xl mx-auto"
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="0" id="option0" className="text-red-500" />
              <Label htmlFor="option0" className="text-base cursor-pointer flex-1">
                <span className="font-medium">전혀 그렇지 않다</span>
                <span className="text-sm text-muted-foreground ml-2">(0점)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="1" id="option1" className="text-green-500" />
              <Label htmlFor="option1" className="text-base cursor-pointer flex-1">
                <span className="font-medium">그렇다</span>
                <span className="text-sm text-muted-foreground ml-2">(1점)</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6"
          >
            이전 문항
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-brand px-6"
          >
            {currentQuestion === totalQuestions - 1 ? '종합분석 보기' : '다음 문항'}
          </Button>
        </div>

        {/* Question Info */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          <p>임상적 의미: {currentQ.clinicalSignificance}</p>
        </div>
      </div>
    </Card>
  );
};

export default AdvancedDevelopmentalForm;