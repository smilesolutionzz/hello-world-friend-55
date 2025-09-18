import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Weight, 
  Activity, 
  Apple, 
  Clock, 
  User, 
  Target,
  TrendingDown,
  Heart,
  ChevronRight,
  ChevronLeft,
  Pill
} from 'lucide-react';

interface DietAnalysisTestProps {
  onComplete: (result: any) => void;
}

const DietAnalysisTest: React.FC<DietAnalysisTestProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const questions = [
    {
      id: 0,
      question: "현재 체중과 목표 체중을 알려주세요",
      type: "multiple",
      options: [
        "5kg 이하 감량 희망",
        "5-10kg 감량 희망", 
        "10-15kg 감량 희망",
        "15kg 이상 감량 희망"
      ]
    },
    {
      id: 1,
      question: "평소 식사 패턴은 어떠신가요?",
      type: "multiple",
      options: [
        "규칙적으로 3끼 모두 챙겨먹음",
        "아침은 거르고 점심, 저녁만",
        "불규칙하게 먹거나 자주 건너뜀",
        "간식이나 야식을 자주 먹음"
      ]
    },
    {
      id: 2,
      question: "평소 운동량은 어느 정도인가요?",
      type: "multiple", 
      options: [
        "거의 운동하지 않음",
        "주 1-2회 가벼운 운동",
        "주 3-4회 규칙적 운동", 
        "거의 매일 운동함"
      ]
    },
    {
      id: 3,
      question: "체질적으로 어떤 특성이 있나요?",
      type: "multiple",
      options: [
        "쉽게 살이 찌고 빠지기 어려움",
        "스트레스 받으면 식욕이 증가함",
        "소화가 잘 안되고 부종이 잘 생김",
        "열이 많고 변비가 자주 있음"
      ]
    },
    {
      id: 4,
      question: "다이어트 시 가장 어려운 점은 무엇인가요?",
      type: "multiple",
      options: [
        "식욕 조절이 어려움",
        "운동 지속이 어려움",
        "요요현상이 심함",
        "의지력 부족"
      ]
    },
    {
      id: 5,
      question: "선호하는 음식 성향은?",
      type: "multiple",
      options: [
        "매운 음식을 좋아함",
        "달고 기름진 음식을 좋아함",
        "시원하고 담백한 음식을 좋아함",
        "따뜻하고 부드러운 음식을 좋아함"
      ]
    },
    {
      id: 6,
      question: "수면 패턴은 어떠신가요?",
      type: "multiple",
      options: [
        "잠들기 어렵고 자주 깸",
        "깊게 자지만 아침에 일어나기 힘듦",
        "규칙적으로 잘 잠",
        "스트레스 받으면 잠을 못잠"
      ]
    },
    {
      id: 7,
      question: "평소 스트레스 수준은?",
      type: "multiple",
      options: [
        "매우 높음 (업무, 인간관계 등)",
        "보통 수준",
        "낮은 편",
        "거의 스트레스 없음"
      ]
    },
    {
      id: 8,
      question: "물 섭취량은 하루에 얼마나 되나요?",
      type: "multiple",
      options: [
        "500ml 이하",
        "500ml-1L",
        "1L-2L",
        "2L 이상"
      ]
    },
    {
      id: 9,
      question: "과거 다이어트 경험은?",
      type: "multiple",
      options: [
        "한 번도 시도한 적 없음",
        "몇 번 시도했지만 실패",
        "성공했지만 요요현상 경험",
        "꾸준히 관리하고 있음"
      ]
    }
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료 - 분석 결과 생성
      const analysisResult = generateDietAnalysis(newAnswers);
      onComplete(analysisResult);
    }
  };

  const generateDietAnalysis = (userAnswers: { [key: number]: string }) => {
    // 답변 분석 로직 - 더 정교한 분석
    const weightGoal = userAnswers[0];
    const eatingPattern = userAnswers[1]; 
    const exerciseLevel = userAnswers[2];
    const constitution = userAnswers[3];
    const difficulty = userAnswers[4];
    const foodPreference = userAnswers[5];
    const sleepPattern = userAnswers[6];
    const stressLevel = userAnswers[7];
    const waterIntake = userAnswers[8];
    const dietHistory = userAnswers[9];

    // 체질 판단 - 더 정교한 로직
    let constitutionType = "소양인";
    let score = { taeeum: 0, soyang: 0, soeum: 0, taeyang: 0 };
    
    // 각 답변에 따른 체질 점수 계산
    if (constitution.includes("쉽게 살이 찌고")) score.taeeum += 2;
    if (constitution.includes("소화가 잘 안되고")) score.soeum += 2;
    if (constitution.includes("열이 많고")) score.soyang += 2;
    if (constitution.includes("스트레스")) score.soyang += 1;
    
    if (foodPreference.includes("매운 음식")) score.soyang += 1;
    if (foodPreference.includes("달고 기름진")) score.taeeum += 1;
    if (foodPreference.includes("시원하고 담백한")) score.taeyang += 1;
    if (foodPreference.includes("따뜻하고 부드러운")) score.soeum += 1;
    
    // 최고 점수 체질 선택
    const maxScore = Math.max(...Object.values(score));
    if (score.taeeum === maxScore) constitutionType = "태음인";
    else if (score.soyang === maxScore) constitutionType = "소양인";
    else if (score.soeum === maxScore) constitutionType = "소음인";
    else constitutionType = "태양인";

    // 다이어트 처방 생성 - 더 상세한 분석
    const prescriptions = {
      "태음인": {
        herbs: ["율무", "백출", "진피", "후박", "창출", "적복령"],
        diet: "고단백 저탄수화물, 견과류 섭취, 현미밥 위주",
        exercise: "유산소 운동 위주 (주 4-5회, 30분 이상)",
        caution: "과식 주의, 규칙적인 식사, 당분 제한",
        detailedAdvice: "체중감량에 가장 효과적인 체질로, 꾸준한 운동과 식단 관리가 중요합니다."
      },
      "소양인": {
        herbs: ["맥문동", "오미자", "생지황", "모과", "석곡", "천문동"],
        diet: "시원한 성질의 음식, 충분한 수분 섭취, 해산물 위주",
        exercise: "격렬하지 않은 운동 (요가, 수영, 걷기)",
        caution: "매운 음식 피하기, 과로 금지, 충분한 휴식",
        detailedAdvice: "열 체질이므로 서두르지 말고 꾸준히 관리하는 것이 중요합니다."
      },
      "소음인": {
        herbs: ["인삼", "계피", "생강", "대추", "황기", "당귀"],
        diet: "따뜻한 성질의 음식, 소량씩 자주, 닭고기, 양고기",
        exercise: "가벼운 운동으로 시작 (산책, 스트레칭)",
        caution: "차가운 음식 피하기, 무리한 다이어트 금지",
        detailedAdvice: "소화기능이 약하므로 급하게 살을 빼기보다 체력을 기르면서 서서히 감량하세요."
      },
      "태양인": {
        herbs: ["오가피", "모과", "포도", "감초", "갈근", "승마"],
        diet: "담백하고 시원한 음식, 해조류, 생선류",
        exercise: "꾸준한 유산소 운동 (조깅, 자전거)",
        caution: "기름진 음식 제한, 알코올 절제",
        detailedAdvice: "간 기능을 보호하면서 점진적인 체중감량이 효과적입니다."
      }
    };

    return {
      constitutionType,
      targetWeight: weightGoal,
      dietPlan: prescriptions[constitutionType as keyof typeof prescriptions],
      analysisDate: new Date().toISOString(),
      stressLevel,
      waterIntake,
      dietHistory,
      detailedScore: score,
      recommendations: {
        herbs: prescriptions[constitutionType as keyof typeof prescriptions].herbs,
        diet: prescriptions[constitutionType as keyof typeof prescriptions].diet,
        exercise: prescriptions[constitutionType as keyof typeof prescriptions].exercise,
        caution: prescriptions[constitutionType as keyof typeof prescriptions].caution,
        detailedAdvice: prescriptions[constitutionType as keyof typeof prescriptions].detailedAdvice
      }
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Weight className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-foreground">한방다이어트 체질분석</h1>
          </div>
          <p className="text-muted-foreground">
            체질별 맞춤 다이어트 프로그램을 위한 분석을 진행합니다
          </p>
        </div>

        {/* 진행률 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              진행률
            </span>
            <span className="text-sm font-medium text-green-600">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 질문 카드 */}
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-xl flex items-center">
              <Target className="h-6 w-6 mr-2 text-green-600" />
              질문 {currentQuestion + 1}
            </CardTitle>
            <CardDescription className="text-lg font-medium text-foreground">
              {questions[currentQuestion].question}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full p-4 h-auto text-left justify-start hover:bg-green-50 hover:border-green-300 transition-colors"
                  onClick={() => handleAnswer(option)}
                >
                  <div className="flex items-center w-full">
                    <div className="w-6 h-6 rounded-full border-2 border-green-300 mr-3 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="flex-1">{option}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              ))}
            </div>
            
            {/* 네비게이션 버튼 */}
            {currentQuestion > 0 && (
              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← 이전 질문으로
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 진행 상황 */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              예상 소요시간: 7-10분
            </div>
            <div className="flex items-center">
              <Pill className="h-4 w-4 mr-1" />
              맞춤 처방 제공
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DietAnalysisTest };