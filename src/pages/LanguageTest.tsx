import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Brain, Clock, Users, Sparkles, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

type AgeGroup = "12-24" | "25-36" | "37-48" | "49-60" | "61+";

const LanguageTest = () => {
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState<AgeGroup>("12-24");
  const [answers, setAnswers] = useState<number[]>(new Array(20).fill(0));
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // 연령대별 문항 (placeholder - 실제 문항으로 교체 가능)
  const questionsByAge: Record<AgeGroup, string[]> = {
    "12-24": [
      "아이가 '엄마', '아빠'를 구분해서 말한다",
      "간단한 단어(물, 밥 등)를 따라 말한다",
      "손짓과 함께 의사를 표현한다",
      "자신의 이름을 알아듣는다",
      "안된다는 말을 이해한다",
      "간단한 지시(앉아, 와 등)를 따른다",
      "친숙한 사물의 이름을 안다",
      "동물소리를 흉내낸다",
      "책을 보며 집중한다",
      "동요를 들으며 반응한다",
      "표정으로 감정을 표현한다",
      "원하는 것을 손가락으로 가리킨다",
      "다른 아이들에게 관심을 보인다",
      "익숙한 사람을 알아본다",
      "놀이를 통해 상호작용한다",
      "소리내어 웃는다",
      "눈 맞춤을 자주 한다",
      "부르면 돌아본다",
      "혼자서도 잠시 놀 수 있다",
      "새로운 환경에 적응한다"
    ],
    "25-36": [
      "두 단어를 연결해서 말한다",
      "50개 이상의 단어를 안다",
      "질문에 고개를 끄덕이거나 젓는다",
      "간단한 문장을 이해한다",
      "자신의 요구를 말로 표현한다",
      "색깔 이름을 안다",
      "숫자를 따라 말한다",
      "동화책에 관심을 보인다",
      "다른 아이와 함께 논다",
      "감정을 말로 표현하려 한다",
      "규칙적인 일상을 이해한다",
      "상황에 맞는 반응을 보인다",
      "모방놀이를 즐긴다",
      "관심있는 것에 집중한다",
      "도움을 요청할 수 있다",
      "익숙한 노래를 따라 부른다",
      "사회적 상황을 이해한다",
      "기본적인 예의를 안다",
      "감정 조절을 시도한다",
      "새로운 어휘를 학습한다"
    ],
    "37-48": [
      "완전한 문장으로 말한다",
      "200개 이상의 어휘를 사용한다",
      "'왜?'라는 질문을 자주 한다",
      "과거와 미래를 구분한다",
      "이야기를 순서대로 말한다",
      "반대말을 이해한다",
      "카테고리별로 분류한다",
      "책 읽기를 좋아한다",
      "역할놀이를 즐긴다",
      "친구와 대화를 나눈다",
      "복잡한 지시를 이해한다",
      "문제 상황을 설명한다",
      "상상놀이를 창의적으로 한다",
      "타인의 감정을 이해한다",
      "규칙을 지키려 노력한다",
      "협력하여 놀이한다",
      "자신의 의견을 표현한다",
      "갈등 상황을 말로 해결하려 한다",
      "새로운 정보를 빠르게 습득한다",
      "추상적 개념을 이해하기 시작한다"
    ],
    "49-60": [
      "문법에 맞게 대화한다",
      "복잡한 문장을 구성한다",
      "시간 개념을 정확히 안다",
      "논리적으로 설명한다",
      "긴 이야기를 기억한다",
      "유머를 이해한다",
      "은유적 표현을 안다",
      "독립적으로 책을 읽는다",
      "토론에 참여한다",
      "타인의 관점을 이해한다",
      "계획을 세우고 실행한다",
      "문제해결 능력을 보인다",
      "창의적 표현을 한다",
      "감정을 적절히 조절한다",
      "사회적 규칙을 이해한다",
      "리더십을 발휘한다",
      "비판적 사고를 한다",
      "학습에 적극적이다",
      "자기 관리를 한다",
      "미래를 계획한다"
    ],
    "61+": [
      "학교 수업을 이해한다",
      "또래와 원활히 소통한다",
      "추상적 사고를 한다",
      "복잡한 과제를 수행한다",
      "논리적 추론을 한다",
      "창의적 글쓰기를 한다",
      "다양한 관점을 이해한다",
      "학습 전략을 사용한다",
      "자기주도적으로 학습한다",
      "팀워크를 발휘한다",
      "갈등을 건설적으로 해결한다",
      "미래 목표를 설정한다",
      "책임감을 가진다",
      "공감 능력이 뛰어나다",
      "비판적으로 정보를 평가한다",
      "창의적 문제해결을 한다",
      "자신의 강점을 안다",
      "지속적으로 성장한다",
      "사회적 기여를 생각한다",
      "전문적 흥미를 발전시킨다"
    ]
  };

  const currentQuestions = questionsByAge[selectedAge];

  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 모든 문항이 응답되었는지 확인
    if (answers.some(answer => answer === 0)) {
      alert("모든 문항에 응답해주세요.");
      return;
    }

    const total = answers.reduce((sum, answer) => sum + answer, 0);
    const average = Math.round((total / 20) * 10) / 10;

    // Webhook 호출 (옵션)
    if (webhookUrl) {
      try {
        const submissionData = {
          testType: "language",
          ageGroup: selectedAge,
          answers,
          total,
          average,
          createdAt: new Date().toISOString()
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(submissionData)
        });
      } catch (error) {
        console.error("Webhook error:", error);
      }
    }

    // 결과 페이지로 이동
    navigate(`/report-result?score=${total}&avg=${average}&age=${selectedAge}&test=language`);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
        <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-lg border border-border">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse-glow" />
                <span className="text-lg sm:text-2xl font-semibold text-brand-gradient">언어발달 자가검사</span>
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              <span className="block text-foreground mb-1 sm:mb-2">3분으로 확인하는</span>
              <span className="block text-brand-gradient">언어발달</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              연령 맞춤 20문항으로 간단 진단
            </p>
          </div>

          {/* Settings Toggle */}
          <div className="max-w-4xl mx-auto mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              설정
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card className="max-w-4xl mx-auto mb-8 p-6">
              <h3 className="text-lg font-semibold mb-4">데이터 저장 설정</h3>
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL (옵션)</Label>
                <Input
                  id="webhook"
                  type="url"
                  placeholder="https://your-webhook-url.com"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  결과 데이터를 자동으로 저장하려면 웹훅 URL을 입력하세요.
                </p>
              </div>
            </Card>
          )}

          {/* Test Form */}
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              {/* Age Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">연령대 선택</Label>
                <Select value={selectedAge} onValueChange={(value: AgeGroup) => {
                  setSelectedAge(value);
                  setAnswers(new Array(20).fill(0)); // 연령대 변경 시 답변 초기화
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="연령대를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12-24">12-24개월</SelectItem>
                    <SelectItem value="25-36">25-36개월</SelectItem>
                    <SelectItem value="37-48">37-48개월</SelectItem>
                    <SelectItem value="49-60">49-60개월</SelectItem>
                    <SelectItem value="61+">61개월 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  검사 문항 ({selectedAge}개월)
                </h2>
                
                {currentQuestions.map((question, index) => (
                  <Card key={index} className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">
                        {index + 1}. {question}
                      </h3>
                      
                      <RadioGroup
                        value={answers[index]?.toString() || ""}
                        onValueChange={(value) => handleAnswerChange(index, value)}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id={`q${index}-1`} />
                          <Label htmlFor={`q${index}-1`} className="text-sm">전혀 아니다</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id={`q${index}-2`} />
                          <Label htmlFor={`q${index}-2`} className="text-sm">아니다</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id={`q${index}-3`} />
                          <Label htmlFor={`q${index}-3`} className="text-sm">그렇다</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id={`q${index}-4`} />
                          <Label htmlFor={`q${index}-4`} className="text-sm">매우 그렇다</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <Button
                  type="submit"
                  className="w-full sm:w-auto min-w-[200px] h-12 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  결과 보기
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;