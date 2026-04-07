import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n";

interface DepressionTestFormProps {
  ageGroup?: 'toddler' | 'child' | 'adolescent' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, severity: string, ageGroup: string}) => void;
  onBack: () => void;
}

// AIHPRO 감정 웰니스 검사 - 자체 개발 문항 (저작권 안전)
// 유아용 (3-6세) 부모 보고형
const toddlerQKo = ["아이가 평소보다 자주 울거나 짜증을 냅니다","아이가 좋아하던 놀이에 흥미를 잃었습니다","아이가 식사를 잘 하지 않거나 과식합니다","아이가 잠들기 어려워하거나 자주 깹니다","아이가 에너지가 없고 활동량이 줄었습니다","아이가 또래 아이들과 놀기를 거부합니다","아이가 이유 없이 무기력해 보입니다","아이가 분리불안이 심해졌습니다","아이가 자신감이 없어 보이고 위축됩니다","아이가 신체 증상(복통, 두통 등)을 자주 호소합니다","아이가 표정이 어둡거나 웃지 않습니다","아이가 쉽게 좌절하고 포기합니다"];
const toddlerQEn = ["My child cries or gets irritable more often than usual","My child has lost interest in favorite activities","My child eats poorly or overeats","My child has difficulty sleeping or wakes often","My child has less energy and reduced activity","My child refuses to play with peers","My child seems listless for no reason","My child's separation anxiety has worsened","My child seems lacking in confidence and withdrawn","My child frequently complains of physical symptoms","My child's expression is dark or doesn't smile","My child gets frustrated and gives up easily"];

// 아동용 (7-12세) - AIHPRO 자체 창작 문항
const childQKo = ["요즘 기분이 가라앉거나 우울한 느낌이 들어요","하루를 보내면서 즐거운 순간이 있어요","내가 무엇을 해도 잘 안 될 것 같은 느낌이 들어요","방과 후 놀이나 활동이 재미있어요","내가 잘못한 일이 자꾸 떠올라요","친구들이 나를 좋아하지 않는다고 느낄 때가 있어요","나 자신에 대해 만족스러운 편이에요","작은 일에도 눈물이 날 때가 있어요","학교에서 집중하기가 어려워요","친구들과 어울리는 게 즐거워요","혼자 있고 싶은 마음이 자주 들어요","무언가를 결정하는 것이 어렵게 느껴져요","내 모습이 마음에 드는 편이에요","공부나 과제를 하는 게 힘들어요","밤에 잠이 잘 와요","몸이 무겁고 피곤한 느낌이 자주 들어요","밥맛이 없거나 너무 많이 먹게 돼요","가슴이 답답하거나 속이 불편할 때가 있어요","가족과 함께 있으면 편안해요","아침에 일어나면 하루가 기대돼요","재미있던 것들이 요즘은 시시하게 느껴져요"];
const childQEn = ["I feel down or gloomy these days","I have enjoyable moments during the day","I feel like nothing I do will work out","After-school activities are fun","Things I did wrong keep coming back to mind","I sometimes feel like my friends don't like me","I feel satisfied with myself","Small things make me want to cry sometimes","It's hard to concentrate at school","I enjoy hanging out with friends","I often want to be alone","Making decisions feels difficult","I like the way I am","Doing homework and studying feels hard","I fall asleep easily at night","I often feel heavy and tired","I lose my appetite or eat too much","I sometimes feel tightness in my chest or stomach","I feel comfortable with my family","I look forward to the day when I wake up","Things that used to be fun feel boring now"];

// 청소년용 (13-18세) - AIHPRO 자체 창작 문항
const adolQKo = ["최근 2주간 기분이 가라앉거나 공허한 느낌이 있었다","미래에 대해 기대감보다 불안감이 더 크다","나는 또래에 비해 뒤처져 있다는 생각이 든다","일상에서 만족감이나 성취감을 느끼기 어렵다","사소한 일에도 죄책감이나 후회를 느낀다","나에게 불공평한 일이 자주 일어난다고 느낀다","나 자신에 대한 실망감이 있다","실수를 하면 지나치게 오래 자책한다","스스로를 해치고 싶은 충동이 든 적이 있다","감정 기복이 심하고 쉽게 눈물이 난다","안절부절못하거나 긴장감이 지속된다","SNS나 대인관계에 대한 관심이 줄었다","결정을 내려야 할 때 머뭇거리는 시간이 길어졌다","외모나 체형에 대한 걱정이 많다","학업이나 일상 과제 수행 능력이 떨어진 느낌이다","수면 패턴이 불규칙하거나 잠이 잘 오지 않는다","쉽게 지치고 체력이 떨어진 느낌이다","식욕의 변화가 있다 (감소 또는 증가)","건강에 대한 걱정이 평소보다 많아졌다","취미나 관심사에 대한 열정이 줄었다","혼자만의 시간이 지나치게 늘었다"];
const adolQEn = ["I've felt down or empty in the past two weeks","I feel more anxiety than excitement about the future","I feel like I'm falling behind compared to my peers","It's hard to feel satisfaction or accomplishment in daily life","I feel guilt or regret over small things","I feel unfair things happen to me often","I feel disappointed in myself","I dwell on mistakes for too long","I've had urges to harm myself","My mood swings are intense and I cry easily","I feel restless or tense continuously","My interest in social media or relationships has decreased","I take longer to make decisions","I worry a lot about my appearance or body","My ability to perform in school or daily tasks has declined","My sleep pattern is irregular or I can't fall asleep","I get tired easily and feel my stamina has dropped","My appetite has changed (decreased or increased)","I worry about my health more than usual","My passion for hobbies and interests has faded","I spend too much time alone"];

// 성인용 (19세 이상) - AIHPRO 자체 창작 문항
const adultQKo = ["최근 2주간 지속적으로 기분이 저하되거나 공허감을 느꼈다","미래에 대한 희망보다 불안이 앞선다","삶에서 의미 있는 성과를 이루지 못했다는 생각이 든다","일상의 소소한 일에서 즐거움을 찾기 어렵다","과거의 결정이나 행동에 대해 자주 후회한다","주변 환경이나 상황이 나에게 불리하게 돌아간다고 느낀다","자기 자신에 대한 평가가 부정적이다","문제가 생기면 대부분 내 탓이라는 생각이 든다","삶을 끝내고 싶다는 생각이 스쳐 지나간 적이 있다","감정 조절이 어렵고 작은 일에도 눈물이 난다","마음이 불안하고 긴장 상태가 지속된다","사람들과의 교류가 줄고 고립감을 느낀다","사소한 결정도 내리기가 힘들다","자신의 외모나 건강 상태에 대한 불만이 있다","업무나 가사 등 일상적인 역할 수행이 버겁다","수면의 질이 나빠졌다 (불면 또는 과수면)","만성적인 피로감을 느낀다","식습관에 변화가 생겼다 (식욕 감소 또는 과식)","체중 변화가 있었다","건강에 대한 염려가 커졌다","여가 활동이나 취미에 대한 흥미가 사라졌다"];
const adultQEn = ["I've felt persistently low or empty in the past two weeks","Anxiety overshadows my hope for the future","I feel I haven't achieved meaningful results in life","It's hard to find joy in everyday small things","I often regret past decisions or actions","I feel circumstances work against me","My self-evaluation tends to be negative","When problems arise, I think it's mostly my fault","The thought of ending my life has crossed my mind","I struggle to regulate emotions and cry easily over small things","I feel persistently anxious and tense","I've been socializing less and feeling isolated","Even small decisions are difficult to make","I'm dissatisfied with my appearance or health","Everyday roles like work or housekeeping feel overwhelming","My sleep quality has worsened (insomnia or oversleeping)","I feel chronic fatigue","My eating habits have changed (decreased appetite or overeating)","I've experienced weight changes","My health concerns have increased","I've lost interest in leisure activities or hobbies"];

const getQuestions = (ageGroup: 'toddler' | 'child' | 'adolescent' | 'adult', isEn: boolean) => {
  if (ageGroup === 'toddler') return isEn ? toddlerQEn : toddlerQKo;
  if (ageGroup === 'child') return isEn ? childQEn : childQKo;
  if (ageGroup === 'adolescent') return isEn ? adolQEn : adolQKo;
  return isEn ? adultQEn : adultQKo;
};

const getAgeGroupLabel = (ageGroup: 'toddler' | 'child' | 'adolescent' | 'adult', isEn: boolean) => {
  if (ageGroup === 'toddler') return isEn ? 'Toddler (3-6)' : '유아 (3-6세)';
  if (ageGroup === 'child') return isEn ? 'Child (7-12)' : '아동 (7-12세)';
  if (ageGroup === 'adolescent') return isEn ? 'Adolescent (13-18)' : '청소년 (13-18세)';
  return isEn ? 'Adult (19+)' : '성인 (19세 이상)';
};

const DepressionTestForm = ({ ageGroup = 'adult', onComplete, onBack }: DepressionTestFormProps) => {
  const { isEnglish } = useLanguage();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'toddler' | 'child' | 'adolescent' | 'adult' | null>(ageGroup || null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const questions = selectedAgeGroup ? getQuestions(selectedAgeGroup, isEnglish) : [];
  if (currentQuestion >= questions.length) return null;
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAgeGroupSelect = (group: 'toddler' | 'child' | 'adolescent' | 'adult') => {
    setSelectedAgeGroup(group);
    setAnswers(new Array(getQuestions(group, isEnglish).length).fill(""));
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => calculateResults(newAnswers), 300);
    }
  };

  const calculateResults = (finalAnswers: string[]) => {
    const numericAnswers = finalAnswers.map(a => {
      const parsed = parseInt(a);
      if (isNaN(parsed)) return 0;
      return 3 - parsed;
    });
    
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total > 0 ? Math.round((total / questions.length) * 10) / 10 : 0;
    
    let severity = "";
    if (total <= 13) severity = isEnglish ? "Normal" : "정상";
    else if (total <= 19) severity = isEnglish ? "Mild Depression" : "가벼운 우울";
    else if (total <= 28) severity = isEnglish ? "Moderate Depression" : "중등도 우울";
    else severity = isEnglish ? "Severe Depression" : "심한 우울";
    
    onComplete({ answers: numericAnswers, total, average, severity, ageGroup: getAgeGroupLabel(selectedAgeGroup!, isEnglish) });
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateResults(answers);
  };

  const currentAnswer = answers[currentQuestion] || "";
  const canProceed = currentAnswer !== "";

  const handleStartTest = () => {
    setHasStarted(true);
  };

  const answerOptions = isEnglish
    ? [{ v: "1", l: "Not true (1)" }, { v: "2", l: "Somewhat (2)" }, { v: "3", l: "True (3)" }]
    : [{ v: "1", l: "그렇지 않다 (1점)" }, { v: "2", l: "보통이다 (2점)" }, { v: "3", l: "그렇다 (3점)" }];

  if (!selectedAgeGroup) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{isEnglish ? "Select your age group" : "연령대를 선택해주세요"}</h2>
            <p className="text-muted-foreground">{isEnglish ? "Questions are tailored to your age" : "연령에 맞는 검사 문항이 제공됩니다"}</p>
          </div>
          <div className="grid gap-4">
            {(['toddler', 'child', 'adolescent', 'adult'] as const).map(g => (
              <Button key={g} variant="outline" className="h-auto p-6 flex flex-col items-start text-left hover:bg-primary/5 hover:border-primary" onClick={() => handleAgeGroupSelect(g)}>
                <span className="text-lg font-semibold">{getAgeGroupLabel(g, isEnglish)}</span>
                <span className="text-sm text-muted-foreground">
                  {isEnglish
                    ? g === 'toddler' ? 'Parent-report preschool depression screening (12 items)' 
                      : g === 'child' ? 'Elementary school items (21 items)' 
                      : g === 'adolescent' ? 'Middle/high school items (21 items)' 
                      : 'Adult items (21 items)'
                    : g === 'toddler' ? '부모 보고형 유아 우울 선별 검사 (12문항)' 
                      : g === 'child' ? '초등학생 대상 문항 (21문항)' 
                      : g === 'adolescent' ? '중고등학생 대상 문항 (21문항)' 
                      : '성인 대상 문항 (21문항)'}
                </span>
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={onBack} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEnglish ? "Back" : "뒤로가기"}
          </Button>
        </div>
      </Card>
    );
  }

  if (!hasStarted) {
    setHasStarted(true);
    return null;
  }

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? "Back" : "뒤로가기"}
          </Button>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">{getAgeGroupLabel(selectedAgeGroup, isEnglish)}</span>
            <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {isEnglish ? `Progress: ${Math.round(progress)}%` : `진행률: ${Math.round(progress)}%`}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center">{questions[currentQuestion]}</h2>
          <RadioGroup value={currentAnswer} onValueChange={handleAnswer} className="space-y-4">
            {answerOptions.map((opt, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.v} id={`depression-q${currentQuestion}-opt${i}`} />
                <Label htmlFor={`depression-q${currentQuestion}-opt${i}`} className="text-base cursor-pointer">{opt.l}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center pt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            {isEnglish ? "Previous" : "이전"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {isEnglish ? "Auto-advances on selection" : "답변 선택 시 자동으로 넘어갑니다"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DepressionTestForm;
