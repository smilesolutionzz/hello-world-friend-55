import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Users, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OtrovertTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: "social_energy",
    question: "사람들과 어울린 후 기분이 어떤가요?",
    options: [
      { value: "energized", label: "에너지가 충전되고 더 활기차다", score: 1 },
      { value: "complex", label: "즐겁지만 곧 혼자만의 시간이 필요하다", score: 5 },
      { value: "neutral", label: "특별히 변화가 없다", score: 3 },
      { value: "drained", label: "피곤하고 충전이 필요하다", score: 7 }
    ]
  },
  {
    id: "alone_time",
    question: "혼자 있는 시간에 대해 어떻게 느끼나요?",
    options: [
      { value: "boring", label: "지루하고 불편하다", score: 1 },
      { value: "okay", label: "가끔은 괜찮지만 오래는 힘들다", score: 3 },
      { value: "necessary", label: "필수적이고 에너지 충전 시간이다", score: 7 },
      { value: "recharge", label: "사회활동 후 꼭 필요한 회복 시간이다", score: 5 }
    ]
  },
  {
    id: "party_behavior",
    question: "파티나 모임에서 당신의 모습은?",
    options: [
      { value: "center", label: "중심에서 활발하게 대화를 주도한다", score: 1 },
      { value: "active_then_quiet", label: "처음엔 적극적이지만 나중엔 조용해진다", score: 5 },
      { value: "observer", label: "주로 관찰하고 필요할 때만 참여한다", score: 7 },
      { value: "avoid", label: "가능하면 피하고 싶다", score: 9 }
    ]
  },
  {
    id: "weekend_preference",
    question: "이상적인 주말은?",
    options: [
      { value: "full_social", label: "친구들과 계속 약속을 잡는다", score: 1 },
      { value: "balanced", label: "친구 만남 + 혼자만의 시간 균형", score: 5 },
      { value: "mostly_alone", label: "대부분 혼자 취미활동을 한다", score: 7 },
      { value: "complete_alone", label: "완전히 혼자 쉰다", score: 9 }
    ]
  },
  {
    id: "conversation_style",
    question: "대화 스타일은?",
    options: [
      { value: "talk_a_lot", label: "말을 많이 하고 이야기를 주도한다", score: 1 },
      { value: "engage_then_listen", label: "적극 참여하다가 듣는 쪽으로 전환", score: 5 },
      { value: "mostly_listen", label: "주로 듣고 필요할 때만 말한다", score: 7 },
      { value: "minimal", label: "최소한의 대화만 한다", score: 9 }
    ]
  },
  {
    id: "stress_recovery",
    question: "스트레스를 받았을 때 회복 방법은?",
    options: [
      { value: "meet_friends", label: "친구들을 만나 이야기한다", score: 1 },
      { value: "brief_meet", label: "잠깐 만났다가 혼자 정리한다", score: 5 },
      { value: "alone_first", label: "혼자 충분히 쉰 후 만난다", score: 7 },
      { value: "completely_alone", label: "완전히 혼자만의 시간이 필요하다", score: 9 }
    ]
  },
  {
    id: "new_people",
    question: "새로운 사람을 만날 때?",
    options: [
      { value: "excited", label: "설레고 적극적으로 다가간다", score: 1 },
      { value: "okay_but_tiring", label: "괜찮지만 곧 피곤해진다", score: 5 },
      { value: "cautious", label: "조심스럽고 관찰부터 한다", score: 7 },
      { value: "avoid", label: "가능하면 피하고 싶다", score: 9 }
    ]
  },
  {
    id: "social_battery",
    question: "사회적 활동 후 '배터리'는?",
    options: [
      { value: "charged", label: "오히려 충전된다", score: 1 },
      { value: "fun_but_drain", label: "즐겁지만 배터리는 소모된다", score: 5 },
      { value: "quickly_drain", label: "빨리 소모되어 충전이 필요하다", score: 7 },
      { value: "instantly_drain", label: "즉시 완전히 방전된다", score: 9 }
    ]
  },
  {
    id: "group_size",
    question: "편한 모임 규모는?",
    options: [
      { value: "large", label: "많은 사람일수록 재미있다", score: 1 },
      { value: "medium", label: "5-6명 정도가 적당하다", score: 3 },
      { value: "small", label: "2-3명의 친한 사람이 좋다", score: 7 },
      { value: "one", label: "일대일이 가장 편하다", score: 9 }
    ]
  },
  {
    id: "thinking_style",
    question: "생각을 정리할 때?",
    options: [
      { value: "talk_out", label: "다른 사람과 대화하며 정리한다", score: 1 },
      { value: "both", label: "말하기와 혼자 생각하기를 섞는다", score: 5 },
      { value: "write", label: "주로 혼자 글로 정리한다", score: 7 },
      { value: "silent", label: "완전히 혼자 머릿속으로만 정리한다", score: 9 }
    ]
  },
  {
    id: "energy_source",
    question: "에너지를 얻는 방법은?",
    options: [
      { value: "people", label: "사람들과 함께 있을 때", score: 1 },
      { value: "variety", label: "상황에 따라 다르다", score: 5 },
      { value: "quiet", label: "조용한 환경에서", score: 7 },
      { value: "complete_solitude", label: "완전한 고독 속에서", score: 9 }
    ]
  },
  {
    id: "phone_calls",
    question: "전화 통화에 대한 생각은?",
    options: [
      { value: "love", label: "전화 통화를 즐긴다", score: 1 },
      { value: "okay", label: "필요하면 괜찮다", score: 3 },
      { value: "prefer_text", label: "문자를 선호한다", score: 7 },
      { value: "avoid", label: "가능하면 피한다", score: 9 }
    ]
  },
  {
    id: "workspace",
    question: "선호하는 작업 환경은?",
    options: [
      { value: "team", label: "팀과 함께 일하는 공간", score: 1 },
      { value: "flexible", label: "혼자와 팀 작업 전환 가능", score: 5 },
      { value: "quiet_office", label: "조용한 개인 공간", score: 7 },
      { value: "isolated", label: "완전히 고립된 공간", score: 9 }
    ]
  },
  {
    id: "social_media",
    question: "SNS 사용 패턴은?",
    options: [
      { value: "active_poster", label: "자주 올리고 소통한다", score: 1 },
      { value: "occasional", label: "가끔 올리고 주로 본다", score: 5 },
      { value: "lurker", label: "거의 올리지 않고 구경만", score: 7 },
      { value: "minimal", label: "거의 사용하지 않는다", score: 9 }
    ]
  },
  {
    id: "decision_making",
    question: "중요한 결정을 내릴 때?",
    options: [
      { value: "discuss", label: "여러 사람과 상의한다", score: 1 },
      { value: "few_people", label: "소수와만 상의한다", score: 5 },
      { value: "alone_then_share", label: "혼자 결정 후 공유한다", score: 7 },
      { value: "completely_alone", label: "완전히 혼자 결정한다", score: 9 }
    ]
  },
  {
    id: "after_work",
    question: "퇴근/하교 후 선호하는 활동은?",
    options: [
      { value: "meet_people", label: "바로 사람들을 만난다", score: 1 },
      { value: "flexible", label: "기분에 따라 다르다", score: 5 },
      { value: "rest_first", label: "먼저 혼자 쉬고 싶다", score: 7 },
      { value: "no_plans", label: "약속을 잡지 않는다", score: 9 }
    ]
  },
  {
    id: "conflict_resolution",
    question: "갈등 상황에서 당신은?",
    options: [
      { value: "discuss_immediately", label: "즉시 대화로 해결한다", score: 1 },
      { value: "brief_talk", label: "짧게 얘기 후 시간을 둔다", score: 5 },
      { value: "think_first", label: "혼자 생각한 후 얘기한다", score: 7 },
      { value: "avoid", label: "가능한 피하고 싶다", score: 9 }
    ]
  },
  {
    id: "attention_span",
    question: "장시간 사회적 활동 시?",
    options: [
      { value: "energized", label: "계속 활기차다", score: 1 },
      { value: "peaks_valleys", label: "활발과 조용이 반복된다", score: 5 },
      { value: "gradually_quiet", label: "점점 조용해진다", score: 7 },
      { value: "exhausted_quickly", label: "빨리 지친다", score: 9 }
    ]
  },
  {
    id: "small_talk",
    question: "가벼운 잡담에 대해?",
    options: [
      { value: "enjoy", label: "즐기고 잘한다", score: 1 },
      { value: "situational", label: "상황에 따라 다르다", score: 5 },
      { value: "uncomfortable", label: "불편하지만 할 수 있다", score: 7 },
      { value: "avoid", label: "피하고 싶다", score: 9 }
    ]
  },
  {
    id: "recharge_time",
    question: "에너지 충전에 필요한 시간은?",
    options: [
      { value: "no_need", label: "특별히 필요 없다", score: 1 },
      { value: "brief", label: "30분-1시간 정도", score: 5 },
      { value: "several_hours", label: "몇 시간이 필요하다", score: 7 },
      { value: "full_day", label: "하루 이상 필요하다", score: 9 }
    ]
  }
];

export default function OtrovertTest({ onComplete, onBack }: OtrovertTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; score: number }>>({});

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];

  const handleAnswer = (value: string, score: number) => {
    setAnswers({
      ...answers,
      [currentQuestionData.id]: { value, score }
    });
    
    // 즉시 다음 질문으로 이동
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
    const averageScore = totalScore / questions.length;

    let personalityType = "";
    let typeDescription = "";
    let characteristics: string[] = [];
    let strengthsTitle = "";
    let strengths: string[] = [];
    let weaknessesTitle = "";
    let weaknesses: string[] = [];
    let recommendations: string[] = [];

    if (averageScore <= 2.5) {
      personalityType = "완전 외향형 (Pure Extrovert)";
      typeDescription = "당신은 전형적인 외향형입니다! 사람들과의 교류에서 에너지를 얻고, 혼자 있는 시간보다 함께하는 시간을 더 선호합니다. 사회적 활동이 당신에게 활력을 주는 주요 원천입니다.";
      characteristics = [
        "🎉 사람들과 함께할 때 가장 행복함",
        "⚡ 사회적 활동에서 에너지 충전",
        "🗣️ 대화와 교류를 즐김",
        "🌟 새로운 사람 만나는 것을 좋아함"
      ];
      strengthsTitle = "당신의 강점";
      strengths = [
        "뛰어난 사교성과 네트워킹 능력",
        "팀워크와 협업에서의 탁월함",
        "긍정적 에너지로 주변 활기차게 만듦",
        "빠른 관계 형성과 유지 능력"
      ];
      weaknessesTitle = "주의할 점";
      weaknesses = [
        "혼자만의 시간 부족으로 번아웃 가능",
        "깊은 자기 성찰 시간 필요",
        "지나친 사회활동으로 피로 누적 가능",
        "때로는 고독도 필요함을 인식"
      ];
      recommendations = [
        "정기적으로 혼자만의 시간 갖기",
        "깊이 있는 대화와 관계에 집중",
        "사회활동 사이 휴식 시간 확보",
        "자기 성찰과 명상 시간 만들기"
      ];
    } else if (averageScore <= 4.5) {
      personalityType = "외향적 오트로버트 (Extroverted Otrovert)";
      typeDescription = "당신은 외향적이지만 혼자만의 시간도 필요로 합니다. 사회적 활동을 즐기지만, 진정한 에너지 충전은 혼자 있을 때 일어납니다. 사람들과의 즐거운 시간 후에는 반드시 나만의 회복 시간이 필요합니다.";
      characteristics = [
        "🎭 사회활동을 즐기지만 한계가 있음",
        "🔋 혼자 있을 때 진정한 충전",
        "⚖️ 사교와 고독의 균형 추구",
        "💫 외향적 활동 후 내향적 회복 필요"
      ];
      strengthsTitle = "당신의 강점";
      strengths = [
        "사회적 능력과 자기 인식의 균형",
        "에너지 관리 능력이 뛰어남",
        "다양한 상황에 유연하게 적응",
        "깊이와 넓이를 모두 갖춘 관계 형성"
      ];
      weaknessesTitle = "주의할 점";
      weaknesses = [
        "자신의 한계를 모르고 과도한 약속",
        "회복 시간 없이 계속 활동하면 번아웃",
        "혼자 있고 싶은 욕구를 억누를 수 있음",
        "타인의 기대에 부응하려다 지침"
      ];
      recommendations = [
        "사회활동 후 충분한 단독 시간 확보",
        "자신의 에너지 패턴 이해하고 존중",
        "무리한 약속 자제하기",
        "회복 루틴 만들어 지키기"
      ];
    } else if (averageScore <= 6.5) {
      personalityType = "내향적 오트로버트 (Introverted Otrovert)";
      typeDescription = "당신은 기본적으로 내향적이지만 사회적 활동도 할 수 있습니다. 혼자만의 시간이 필수적이며, 사회활동은 제한된 에너지로 참여합니다. 선택적으로 외향성을 발휘하지만 충전은 오직 고독 속에서 이루어집니다.";
      characteristics = [
        "🏡 혼자만의 시간이 절대적으로 필요",
        "🎯 선택적으로 사회활동 참여",
        "📚 깊이 있는 소수 관계 선호",
        "🌙 고독 속에서 진정한 에너지 회복"
      ];
      strengthsTitle = "당신의 강점";
      strengths = [
        "깊이 있는 사고와 통찰력",
        "의미 있는 관계 구축 능력",
        "독립적이고 자기주도적",
        "필요시 사회적 능력 발휘 가능"
      ];
      weaknessesTitle = "주의할 점";
      weaknesses = [
        "사회적 압력에 스트레스 받기 쉬움",
        "외향적이어야 한다는 사회적 기대 부담",
        "고립되려는 경향 과도할 수 있음",
        "필요한 사회적 연결 회피 가능"
      ];
      recommendations = [
        "자신의 내향성 긍정적으로 받아들이기",
        "소수의 깊은 관계에 집중",
        "사회활동 전후 충분한 회복시간 확보",
        "온라인 소통도 활용하기"
      ];
    } else {
      personalityType = "완전 내향형 (Pure Introvert)";
      typeDescription = "당신은 전형적인 내향형입니다. 혼자만의 시간에서 가장 편안하고 에너지를 충전합니다. 사회적 활동은 매우 제한적으로 하며, 깊이 있는 소수의 관계를 선호합니다.";
      characteristics = [
        "🧘 혼자 있을 때 가장 편안함",
        "📖 내면 세계가 풍부함",
        "🎨 독립적 활동 선호",
        "💎 소수 정예 깊은 관계"
      ];
      strengthsTitle = "당신의 강점";
      strengths = [
        "뛰어난 집중력과 깊이 있는 사고",
        "독립적으로 일 처리 능력 탁월",
        "신중하고 사려 깊은 결정",
        "의미 있는 일대일 관계 구축"
      ];
      weaknessesTitle = "주의할 점";
      weaknesses = [
        "과도한 고립으로 인한 외로움",
        "필요한 네트워킹 기회 놓칠 수 있음",
        "사회적 기술 연습 부족 가능",
        "새로운 경험 회피 경향"
      ];
      recommendations = [
        "작은 사회적 활동부터 시작하기",
        "온라인 커뮤니티 활용",
        "일대일 만남으로 관계 유지",
        "자신의 성향 긍정적으로 수용"
      ];
    }

    const result = {
      personalityType,
      typeDescription,
      score: averageScore.toFixed(1),
      characteristics,
      strengthsTitle,
      strengths,
      weaknessesTitle,
      weaknesses,
      recommendations,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        question: questions.find(q => q.id === questionId)?.question,
        answer: answer.value,
        score: answer.score
      }))
    };

    onComplete(result, 'otrovert');
  };

  const isAnswered = answers[currentQuestionData.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-2xl border-2 border-indigo-200">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로
              </Button>
              <Badge variant="secondary" className="bg-white/90 text-indigo-600">
                <Sparkles className="w-3 h-3 mr-1" />
                NEW
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <CardTitle className="text-2xl">오트로버트 성격 분석</CardTitle>
            </div>
            <p className="text-indigo-100 mt-2">
              외향과 내향 사이, 당신의 진짜 성격은?
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>질문 {currentQuestion + 1} / {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-6">
                {currentQuestionData.question}
              </h3>

              <RadioGroup
                value={answers[currentQuestionData.id]?.value}
                onValueChange={(value) => {
                  const option = currentQuestionData.options.find(o => o.value === value);
                  if (option) handleAnswer(value, option.score);
                }}
                className="space-y-3"
              >
                {currentQuestionData.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-indigo-50 ${
                      answers[currentQuestionData.id]?.value === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleAnswer(option.value, option.score)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                {currentQuestion === questions.length - 1 ? '결과보기' : '다음'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
