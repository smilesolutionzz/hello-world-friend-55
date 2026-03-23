import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n';

const questionsKo = [
  { id: 1, question: "지난 2주 동안 기분이 우울하거나 절망적이었습니까?", options: [{ value: 0, label: "전혀 아니다" },{ value: 1, label: "며칠간" },{ value: 2, label: "일주일 이상" },{ value: 3, label: "거의 매일" }] },
  { id: 2, question: "지난 2주 동안 평소 즐겁던 일에 흥미를 잃었습니까?", options: [{ value: 0, label: "전혀 아니다" },{ value: 1, label: "며칠간" },{ value: 2, label: "일주일 이상" },{ value: 3, label: "거의 매일" }] },
  { id: 3, question: "수면에 문제가 있었습니까? (잠들기 어려움, 자주 깸, 너무 많이 잠)", options: [{ value: 0, label: "전혀 없었다" },{ value: 1, label: "가끔" },{ value: 2, label: "자주" },{ value: 3, label: "매일" }] },
  { id: 4, question: "피로감이나 에너지 부족을 느꼈습니까?", options: [{ value: 0, label: "전혀 없었다" },{ value: 1, label: "가끔" },{ value: 2, label: "자주" },{ value: 3, label: "매일" }] },
  { id: 5, question: "식욕에 변화가 있었습니까?", options: [{ value: 0, label: "변화 없음" },{ value: 1, label: "약간 감소/증가" },{ value: 2, label: "현저히 감소/증가" },{ value: 3, label: "식욕 완전 상실/과식" }] },
  { id: 6, question: "자신에 대해 부정적으로 생각하거나 죄책감을 느꼈습니까?", options: [{ value: 0, label: "전혀 아니다" },{ value: 1, label: "가끔" },{ value: 2, label: "자주" },{ value: 3, label: "항상" }] },
  { id: 7, question: "집중하기 어려웠습니까?", options: [{ value: 0, label: "전혀 아니다" },{ value: 1, label: "가끔" },{ value: 2, label: "자주" },{ value: 3, label: "매일" }] },
  { id: 8, question: "지난 한 달 동안 스트레스 수준은 어땠습니까?", options: [{ value: 0, label: "낮음" },{ value: 1, label: "보통" },{ value: 2, label: "높음" },{ value: 3, label: "매우 높음" }] },
  { id: 9, question: "사회적 상황을 피하고 싶었습니까?", options: [{ value: 0, label: "전혀 아니다" },{ value: 1, label: "가끔" },{ value: 2, label: "자주" },{ value: 3, label: "항상" }] },
  { id: 10, question: "전반적인 삶의 만족도는 어떻습니까?", options: [{ value: 3, label: "매우 만족" },{ value: 2, label: "만족" },{ value: 1, label: "불만족" },{ value: 0, label: "매우 불만족" }] }
];

const questionsEn = [
  { id: 1, question: "In the past 2 weeks, have you felt depressed or hopeless?", options: [{ value: 0, label: "Not at all" },{ value: 1, label: "Several days" },{ value: 2, label: "More than a week" },{ value: 3, label: "Nearly every day" }] },
  { id: 2, question: "In the past 2 weeks, have you lost interest in things you usually enjoy?", options: [{ value: 0, label: "Not at all" },{ value: 1, label: "Several days" },{ value: 2, label: "More than a week" },{ value: 3, label: "Nearly every day" }] },
  { id: 3, question: "Have you had sleep problems? (difficulty falling asleep, waking often, sleeping too much)", options: [{ value: 0, label: "Not at all" },{ value: 1, label: "Sometimes" },{ value: 2, label: "Often" },{ value: 3, label: "Every day" }] },
  { id: 4, question: "Have you felt fatigued or lacked energy?", options: [{ value: 0, label: "Not at all" },{ value: 1, label: "Sometimes" },{ value: 2, label: "Often" },{ value: 3, label: "Every day" }] },
  { id: 5, question: "Have you experienced changes in appetite?", options: [{ value: 0, label: "No change" },{ value: 1, label: "Slight decrease/increase" },{ value: 2, label: "Significant decrease/increase" },{ value: 3, label: "Complete loss/overeating" }] },
  { id: 6, question: "Have you thought negatively about yourself or felt guilty?", options: [{ value: 0, label: "Not at all" },{ value: 1, label: "Sometimes" },{ value: 2, label: "Often" },{ value: 3, label: "Always" }] },
  { id: 7, question: "Have you had difficulty concentrating?", options: [{ value: 0, label: "Not at all" },{ value: 1, label: "Sometimes" },{ value: 2, label: "Often" },{ value: 3, label: "Every day" }] },
  { id: 8, question: "What was your stress level over the past month?", options: [{ value: 0, label: "Low" },{ value: 1, label: "Moderate" },{ value: 2, label: "High" },{ value: 3, label: "Very high" }] },
  { id: 9, question: "Have you wanted to avoid social situations?", options: [{ value: 0, label: "Not at all" },{ value: 1, label: "Sometimes" },{ value: 2, label: "Often" },{ value: 3, label: "Always" }] },
  { id: 10, question: "How satisfied are you with your overall life?", options: [{ value: 3, label: "Very satisfied" },{ value: 2, label: "Satisfied" },{ value: 1, label: "Dissatisfied" },{ value: 0, label: "Very dissatisfied" }] }
];

const BasicMentalHealthTest = () => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const questions = isEnglish ? questionsEn : questionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value.toString();
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        const result = getResult();
        const totalScore = answers.map(a => parseInt(a) || 0).reduce((sum, answer) => sum + answer, 0);
        navigate('/free-trial-result', { 
          state: { testResult: { ...result, totalScore, maxScore: 30, testType: 'mental_health_quick', completedAt: new Date().toISOString() } }
        });
      }
    }, 500);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const getResult = () => {
    const totalScore = answers.map(a => parseInt(a) || 0).reduce((sum, answer) => sum + answer, 0);
    const maxScore = 30;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage <= 25) {
      return {
        level: isEnglish ? "Good" : "양호",
        color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200",
        description: isEnglish ? "Your mental state is in good condition. You're maintaining a healthy mindset!" : "현재 심리상태가 양호합니다. 건강한 마음 상태를 유지하고 계시네요!",
        recommendations: isEnglish
          ? ["Maintain your current healthy lifestyle patterns", "Continue regular exercise and adequate sleep", "Enjoy hobbies for stress management"]
          : ["현재의 건강한 생활 패턴을 유지하세요", "규칙적인 운동과 충분한 수면을 계속하세요", "스트레스 관리를 위한 취미 활동을 즐기세요"]
      };
    } else if (percentage <= 50) {
      return {
        level: isEnglish ? "Caution" : "주의",
        color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200",
        description: isEnglish ? "You may have some stress or mood changes. Proper management is needed." : "약간의 스트레스나 기분 변화가 있을 수 있습니다. 적절한 관리가 필요합니다.",
        recommendations: isEnglish
          ? ["Get enough rest and sleep", "Try light exercise or meditation", "Increase conversation time with family and friends"]
          : ["충분한 휴식과 수면을 취하세요", "가벼운 운동이나 명상을 시작해보세요", "가족이나 친구와 대화 시간을 늘려보세요"]
      };
    } else if (percentage <= 75) {
      return {
        level: isEnglish ? "Warning" : "경고",
        color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200",
        description: isEnglish ? "Stress or depression may be affecting your daily life." : "스트레스나 우울감이 일상에 영향을 주고 있을 수 있습니다.",
        recommendations: isEnglish
          ? ["Consider professional counseling", "Identify and reduce stressors", "Establish a regular daily routine"]
          : ["전문가 상담을 고려해보세요", "스트레스 요인을 파악하고 줄여보세요", "규칙적인 생활 패턴을 만들어보세요"]
      };
    } else {
      return {
        level: isEnglish ? "Critical" : "위험",
        color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200",
        description: isEnglish ? "You may be experiencing serious psychological difficulties. Professional help is needed." : "심리적 어려움이 심각할 수 있습니다. 전문가의 도움이 필요합니다.",
        recommendations: isEnglish
          ? ["Please seek professional counseling immediately", "Ask family or friends for help", "Crisis hotline: 988 (Suicide & Crisis Lifeline)"]
          : ["즉시 전문가 상담을 받으시기 바랍니다", "가족이나 친구에게 도움을 요청하세요", "위기상황시 자살예방 상담전화 1577-0199"]
      };
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const result = isCompleted ? getResult() : null;

  if (isCompleted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
        <div className="container mx-auto max-w-4xl">
          <Card className={`${result.bgColor} ${result.borderColor} border-2`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.bgColor}`}>
                  <Brain className={`w-8 h-8 ${result.color}`} />
                </div>
              </div>
              <CardTitle className={`text-2xl ${result.color}`}>
                {isEnglish ? 'Mental Health Status:' : '기본 심리상태:'} {result.level}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg text-muted-foreground mb-4">{result.description}</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">{isEnglish ? 'Recommendations' : '기본 추천사항'}</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2"><span className="text-primary">•</span><span>{rec}</span></li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-purple-700">{isEnglish ? 'Want AI Expert Deep Analysis?' : 'AI 전문가급 심층 분석을 원하시나요?'}</h4>
                  <p className="text-sm text-gray-600">
                    {isEnglish
                      ? 'Free trial provides basic results only. Sign up for premium to get expert-level AI analysis and personalized solutions.'
                      : <>무료 체험에서는 기본 결과만 제공됩니다.<br/><span className="font-semibold text-purple-600">회원가입 후 프리미엄 검사</span>를 이용하시면 <span className="font-semibold">AI가 전문가 수준의 상세한 해석과 맞춤형 솔루션</span>을 제공합니다.</>}
                  </p>
                  <div className="space-y-2 text-sm text-purple-600">
                    <p>✨ {isEnglish ? 'Personalized psychological profile' : '개인별 맞춤 심리 프로파일 생성'}</p>
                    <p>🎯 {isEnglish ? 'Expert-level AI analysis' : '전문가급 AI 분석 및 해석'}</p>
                    <p>📋 {isEnglish ? 'Detailed action plan' : '상세한 개선 방안 및 액션플랜 제공'}</p>
                    <p>🔍 {isEnglish ? 'Hidden pattern discovery' : '숨겨진 심리 패턴 발견'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm text-primary font-medium text-center">
                  💡 {isEnglish ? 'This result is for reference only. Please consult a professional for accurate diagnosis.' : '이 결과는 참고용이며, 정확한 진단은 전문가와 상담하시기 바랍니다.'}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center space-y-3">
                  <h4 className="font-bold text-blue-700">🎉 {isEnglish ? 'Try with friends!' : '친구들과 함께 해보세요!'}</h4>
                  <p className="text-sm text-blue-600">
                    {isEnglish ? 'Share your results and get 5 free tokens!' : <>결과를 공유하고 <span className="font-semibold">무료 토큰 5개</span>를 받아보세요!</>}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800" onClick={() => {
                      const text = isEnglish
                        ? `My mental health result: ${result.level}\n\n${result.description}\n\n👆 Try it free!\n\nhttps://mindgrowth.co.kr/free-trial`
                        : `나의 심리상태 분석 결과: ${result.level}\n\n${result.description}\n\n👆 너도 무료로 체험해봐!\n\nhttps://mindgrowth.co.kr/free-trial`;
                      if (navigator.share) { navigator.share({ title: isEnglish ? 'Mental Health Result' : '심리상태 분석 결과', text }); }
                      else { navigator.clipboard.writeText(text); }
                    }}>
                      {isEnglish ? 'Share' : '카톡 공유하기'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const text = isEnglish
                        ? `My mental health result: ${result.level}\n\n${result.description}\n\n👆 Try it! https://mindgrowth.co.kr/free-trial`
                        : `나의 심리상태 분석 결과: ${result.level}\n\n${result.description}\n\n👆 너도 무료로 체험해봐! https://mindgrowth.co.kr/free-trial`;
                      navigator.clipboard.writeText(text);
                    }}>
                      {isEnglish ? 'Copy Link' : '링크 복사'}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/free-trial')} variant="outline">
                  {isEnglish ? 'Try Other Free Tests' : '다른 무료 테스트 해보기'}
                </Button>
                <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  {isEnglish ? 'Get Expert Analysis' : '월 9,900원으로 전문가 분석받기'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/free-trial')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEnglish ? 'Back' : '돌아가기'}
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{isEnglish ? 'Basic Mental Health Check' : '기본 심리상태 체크'}</h1>
            <p className="text-muted-foreground">{isEnglish ? 'Quickly check your current mental state' : '현재 마음 상태를 간단히 확인해보세요'}</p>
          </div>
        </div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% {isEnglish ? 'complete' : '완료'}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={answers[currentQuestion]} onValueChange={(value) => handleAnswer(parseInt(value))}>
              {questions[currentQuestion].options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`bmh-${currentQuestion}-${option.value}`} />
                  <Label htmlFor={`bmh-${currentQuestion}-${option.value}`} className="cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isEnglish ? 'Previous' : '이전'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BasicMentalHealthTest;
