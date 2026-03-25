import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Users, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";

interface OtrovertTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

interface Question {
  id: string;
  ko: string;
  en: string;
  options: { value: string; ko: string; en: string; score: number }[];
}

const questions: Question[] = [
  { id: "social_energy", ko: "사람들과 어울린 후 기분이 어떤가요?", en: "How do you feel after socializing?",
    options: [
      { value: "energized", ko: "에너지가 충전되고 더 활기차다", en: "I feel energized and more lively", score: 1 },
      { value: "complex", ko: "즐겁지만 곧 혼자만의 시간이 필요하다", en: "It's fun but I soon need alone time", score: 5 },
      { value: "neutral", ko: "특별히 변화가 없다", en: "No particular change", score: 3 },
      { value: "drained", ko: "피곤하고 충전이 필요하다", en: "I feel tired and need to recharge", score: 7 }
    ] },
  { id: "alone_time", ko: "혼자 있는 시간에 대해 어떻게 느끼나요?", en: "How do you feel about being alone?",
    options: [
      { value: "boring", ko: "지루하고 불편하다", en: "Boring and uncomfortable", score: 1 },
      { value: "okay", ko: "가끔은 괜찮지만 오래는 힘들다", en: "Sometimes okay but hard for long", score: 3 },
      { value: "necessary", ko: "필수적이고 에너지 충전 시간이다", en: "Essential recharge time", score: 7 },
      { value: "recharge", ko: "사회활동 후 꼭 필요한 회복 시간이다", en: "Recovery time needed after socializing", score: 5 }
    ] },
  { id: "party_behavior", ko: "파티나 모임에서 당신의 모습은?", en: "How do you behave at parties or gatherings?",
    options: [
      { value: "center", ko: "중심에서 활발하게 대화를 주도한다", en: "I lead conversations at the center", score: 1 },
      { value: "active_then_quiet", ko: "처음엔 적극적이지만 나중엔 조용해진다", en: "Active at first, then quiet later", score: 5 },
      { value: "observer", ko: "주로 관찰하고 필요할 때만 참여한다", en: "Mostly observe, participate when needed", score: 7 },
      { value: "avoid", ko: "가능하면 피하고 싶다", en: "I'd rather avoid them", score: 9 }
    ] },
  { id: "weekend_preference", ko: "이상적인 주말은?", en: "What's your ideal weekend?",
    options: [
      { value: "full_social", ko: "친구들과 계속 약속을 잡는다", en: "Back-to-back plans with friends", score: 1 },
      { value: "balanced", ko: "친구 만남 + 혼자만의 시간 균형", en: "Balance of friends and alone time", score: 5 },
      { value: "mostly_alone", ko: "대부분 혼자 취미활동을 한다", en: "Mostly solo hobbies", score: 7 },
      { value: "complete_alone", ko: "완전히 혼자 쉰다", en: "Completely alone and resting", score: 9 }
    ] },
  { id: "conversation_style", ko: "대화 스타일은?", en: "What's your conversation style?",
    options: [
      { value: "talk_a_lot", ko: "말을 많이 하고 이야기를 주도한다", en: "I talk a lot and lead conversations", score: 1 },
      { value: "engage_then_listen", ko: "적극 참여하다가 듣는 쪽으로 전환", en: "Engage actively then switch to listening", score: 5 },
      { value: "mostly_listen", ko: "주로 듣고 필요할 때만 말한다", en: "Mostly listen, speak when needed", score: 7 },
      { value: "minimal", ko: "최소한의 대화만 한다", en: "Minimal conversation only", score: 9 }
    ] },
  { id: "stress_recovery", ko: "스트레스를 받았을 때 회복 방법은?", en: "How do you recover from stress?",
    options: [
      { value: "meet_friends", ko: "친구들을 만나 이야기한다", en: "Meet friends and talk", score: 1 },
      { value: "brief_meet", ko: "잠깐 만났다가 혼자 정리한다", en: "Brief meetup then alone time", score: 5 },
      { value: "alone_first", ko: "혼자 충분히 쉰 후 만난다", en: "Rest alone first, then meet others", score: 7 },
      { value: "completely_alone", ko: "완전히 혼자만의 시간이 필요하다", en: "Need complete solitude", score: 9 }
    ] },
  { id: "new_people", ko: "새로운 사람을 만날 때?", en: "When meeting new people?",
    options: [
      { value: "excited", ko: "설레고 적극적으로 다가간다", en: "Excited, I approach actively", score: 1 },
      { value: "okay_but_tiring", ko: "괜찮지만 곧 피곤해진다", en: "It's okay but tiring soon", score: 5 },
      { value: "cautious", ko: "조심스럽고 관찰부터 한다", en: "Cautious, I observe first", score: 7 },
      { value: "avoid", ko: "가능하면 피하고 싶다", en: "I'd rather avoid it", score: 9 }
    ] },
  { id: "social_battery", ko: "사회적 활동 후 '배터리'는?", en: "Your 'battery' after social activities?",
    options: [
      { value: "charged", ko: "오히려 충전된다", en: "Actually gets charged", score: 1 },
      { value: "fun_but_drain", ko: "즐겁지만 배터리는 소모된다", en: "Fun but battery drains", score: 5 },
      { value: "quickly_drain", ko: "빨리 소모되어 충전이 필요하다", en: "Drains quickly, needs recharging", score: 7 },
      { value: "instantly_drain", ko: "즉시 완전히 방전된다", en: "Instantly fully drained", score: 9 }
    ] },
  { id: "group_size", ko: "편한 모임 규모는?", en: "Preferred group size?",
    options: [
      { value: "large", ko: "많은 사람일수록 재미있다", en: "The more people the better", score: 1 },
      { value: "medium", ko: "5-6명 정도가 적당하다", en: "About 5-6 people is ideal", score: 3 },
      { value: "small", ko: "2-3명의 친한 사람이 좋다", en: "2-3 close friends is best", score: 7 },
      { value: "one", ko: "일대일이 가장 편하다", en: "One-on-one is most comfortable", score: 9 }
    ] },
  { id: "thinking_style", ko: "생각을 정리할 때?", en: "When organizing your thoughts?",
    options: [
      { value: "talk_out", ko: "다른 사람과 대화하며 정리한다", en: "Talk it through with others", score: 1 },
      { value: "both", ko: "말하기와 혼자 생각하기를 섞는다", en: "Mix of talking and solo thinking", score: 5 },
      { value: "write", ko: "주로 혼자 글로 정리한다", en: "Mostly write it down alone", score: 7 },
      { value: "silent", ko: "완전히 혼자 머릿속으로만 정리한다", en: "Process entirely in my head alone", score: 9 }
    ] },
  { id: "energy_source", ko: "에너지를 얻는 방법은?", en: "How do you get energy?",
    options: [
      { value: "people", ko: "사람들과 함께 있을 때", en: "Being with people", score: 1 },
      { value: "variety", ko: "상황에 따라 다르다", en: "Depends on the situation", score: 5 },
      { value: "quiet", ko: "조용한 환경에서", en: "In a quiet environment", score: 7 },
      { value: "complete_solitude", ko: "완전한 고독 속에서", en: "In complete solitude", score: 9 }
    ] },
  { id: "phone_calls", ko: "전화 통화에 대한 생각은?", en: "How do you feel about phone calls?",
    options: [
      { value: "love", ko: "전화 통화를 즐긴다", en: "I enjoy phone calls", score: 1 },
      { value: "okay", ko: "필요하면 괜찮다", en: "Fine when necessary", score: 3 },
      { value: "prefer_text", ko: "문자를 선호한다", en: "I prefer texting", score: 7 },
      { value: "avoid", ko: "가능하면 피한다", en: "I avoid them if possible", score: 9 }
    ] },
  { id: "workspace", ko: "선호하는 작업 환경은?", en: "Preferred work environment?",
    options: [
      { value: "team", ko: "팀과 함께 일하는 공간", en: "Working with a team", score: 1 },
      { value: "flexible", ko: "혼자와 팀 작업 전환 가능", en: "Flexible between solo and team", score: 5 },
      { value: "quiet_office", ko: "조용한 개인 공간", en: "Quiet personal space", score: 7 },
      { value: "isolated", ko: "완전히 고립된 공간", en: "Completely isolated space", score: 9 }
    ] },
  { id: "social_media", ko: "SNS 사용 패턴은?", en: "Social media usage pattern?",
    options: [
      { value: "active_poster", ko: "자주 올리고 소통한다", en: "Post often and interact", score: 1 },
      { value: "occasional", ko: "가끔 올리고 주로 본다", en: "Post occasionally, mostly browse", score: 5 },
      { value: "lurker", ko: "거의 올리지 않고 구경만", en: "Rarely post, just browse", score: 7 },
      { value: "minimal", ko: "거의 사용하지 않는다", en: "Barely use it", score: 9 }
    ] },
  { id: "decision_making", ko: "중요한 결정을 내릴 때?", en: "When making important decisions?",
    options: [
      { value: "discuss", ko: "여러 사람과 상의한다", en: "Discuss with many people", score: 1 },
      { value: "few_people", ko: "소수와만 상의한다", en: "Consult with a few people", score: 5 },
      { value: "alone_then_share", ko: "혼자 결정 후 공유한다", en: "Decide alone, then share", score: 7 },
      { value: "completely_alone", ko: "완전히 혼자 결정한다", en: "Decide completely alone", score: 9 }
    ] },
  { id: "after_work", ko: "퇴근/하교 후 선호하는 활동은?", en: "Preferred activity after work/school?",
    options: [
      { value: "meet_people", ko: "바로 사람들을 만난다", en: "Meet people right away", score: 1 },
      { value: "flexible", ko: "기분에 따라 다르다", en: "Depends on my mood", score: 5 },
      { value: "rest_first", ko: "먼저 혼자 쉬고 싶다", en: "Want to rest alone first", score: 7 },
      { value: "no_plans", ko: "약속을 잡지 않는다", en: "Don't make plans", score: 9 }
    ] },
  { id: "conflict_resolution", ko: "갈등 상황에서 당신은?", en: "In conflict situations, you?",
    options: [
      { value: "discuss_immediately", ko: "즉시 대화로 해결한다", en: "Resolve through immediate discussion", score: 1 },
      { value: "brief_talk", ko: "짧게 얘기 후 시간을 둔다", en: "Brief talk then give it time", score: 5 },
      { value: "think_first", ko: "혼자 생각한 후 얘기한다", en: "Think alone first, then talk", score: 7 },
      { value: "avoid", ko: "가능한 피하고 싶다", en: "Prefer to avoid if possible", score: 9 }
    ] },
  { id: "attention_span", ko: "장시간 사회적 활동 시?", en: "During long social activities?",
    options: [
      { value: "energized", ko: "계속 활기차다", en: "Stay energized throughout", score: 1 },
      { value: "peaks_valleys", ko: "활발과 조용이 반복된다", en: "Alternate between active and quiet", score: 5 },
      { value: "gradually_quiet", ko: "점점 조용해진다", en: "Gradually become quieter", score: 7 },
      { value: "exhausted_quickly", ko: "빨리 지친다", en: "Get exhausted quickly", score: 9 }
    ] },
  { id: "small_talk", ko: "가벼운 잡담에 대해?", en: "About small talk?",
    options: [
      { value: "enjoy", ko: "즐기고 잘한다", en: "Enjoy it and do it well", score: 1 },
      { value: "situational", ko: "상황에 따라 다르다", en: "Depends on the situation", score: 5 },
      { value: "uncomfortable", ko: "불편하지만 할 수 있다", en: "Uncomfortable but can manage", score: 7 },
      { value: "avoid", ko: "피하고 싶다", en: "Want to avoid it", score: 9 }
    ] },
  { id: "recharge_time", ko: "에너지 충전에 필요한 시간은?", en: "How much recharge time do you need?",
    options: [
      { value: "no_need", ko: "특별히 필요 없다", en: "Don't particularly need it", score: 1 },
      { value: "brief", ko: "30분-1시간 정도", en: "About 30 min to 1 hour", score: 5 },
      { value: "several_hours", ko: "몇 시간이 필요하다", en: "Several hours needed", score: 7 },
      { value: "full_day", ko: "하루 이상 필요하다", en: "A full day or more", score: 9 }
    ] }
];

export default function OtrovertTest({ onComplete, onBack }: OtrovertTestProps) {
  const { isEnglish } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; score: number }>>({});

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];

  const handleAnswer = (value: string, score: number) => {
    setAnswers({ ...answers, [currentQuestionData.id]: { value, score } });
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateResult();
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateResult();
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
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
      personalityType = isEnglish ? "Pure Extrovert" : "완전 외향형 (Pure Extrovert)";
      typeDescription = isEnglish
        ? "You are a typical extrovert! You gain energy from interacting with others and prefer being with people over being alone."
        : "당신은 전형적인 외향형입니다! 사람들과의 교류에서 에너지를 얻고, 혼자 있는 시간보다 함께하는 시간을 더 선호합니다.";
      characteristics = isEnglish
        ? ["🎉 Happiest when with people", "⚡ Energized by social activities", "🗣️ Enjoys conversation and interaction", "🌟 Loves meeting new people"]
        : ["🎉 사람들과 함께할 때 가장 행복함", "⚡ 사회적 활동에서 에너지 충전", "🗣️ 대화와 교류를 즐김", "🌟 새로운 사람 만나는 것을 좋아함"];
      strengthsTitle = isEnglish ? "Your Strengths" : "당신의 강점";
      strengths = isEnglish
        ? ["Excellent social and networking skills", "Outstanding teamwork and collaboration", "Positive energy that energizes others", "Quick relationship building and maintenance"]
        : ["뛰어난 사교성과 네트워킹 능력", "팀워크와 협업에서의 탁월함", "긍정적 에너지로 주변 활기차게 만듦", "빠른 관계 형성과 유지 능력"];
      weaknessesTitle = isEnglish ? "Points to Watch" : "주의할 점";
      weaknesses = isEnglish
        ? ["Risk of burnout from lack of alone time", "Need for deeper self-reflection", "Fatigue from excessive social activity", "Recognize that solitude is sometimes needed"]
        : ["혼자만의 시간 부족으로 번아웃 가능", "깊은 자기 성찰 시간 필요", "지나친 사회활동으로 피로 누적 가능", "때로는 고독도 필요함을 인식"];
      recommendations = isEnglish
        ? ["Schedule regular alone time", "Focus on deeper conversations and relationships", "Ensure rest between social activities", "Make time for self-reflection and meditation"]
        : ["정기적으로 혼자만의 시간 갖기", "깊이 있는 대화와 관계에 집중", "사회활동 사이 휴식 시간 확보", "자기 성찰과 명상 시간 만들기"];
    } else if (averageScore <= 4.5) {
      personalityType = isEnglish ? "Extroverted Otrovert" : "외향적 오트로버트 (Extroverted Otrovert)";
      typeDescription = isEnglish
        ? "You're extroverted but also need alone time. You enjoy social activities, but true recharging happens when you're alone."
        : "당신은 외향적이지만 혼자만의 시간도 필요로 합니다. 사회적 활동을 즐기지만, 진정한 에너지 충전은 혼자 있을 때 일어납니다.";
      characteristics = isEnglish
        ? ["🎭 Enjoys socializing but has limits", "🔋 True recharge when alone", "⚖️ Seeks balance between social and solitude", "💫 Needs introverted recovery after extroverted activity"]
        : ["🎭 사회활동을 즐기지만 한계가 있음", "🔋 혼자 있을 때 진정한 충전", "⚖️ 사교와 고독의 균형 추구", "💫 외향적 활동 후 내향적 회복 필요"];
      strengthsTitle = isEnglish ? "Your Strengths" : "당신의 강점";
      strengths = isEnglish
        ? ["Balance of social skills and self-awareness", "Excellent energy management", "Flexible adaptation to various situations", "Deep and wide relationship building"]
        : ["사회적 능력과 자기 인식의 균형", "에너지 관리 능력이 뛰어남", "다양한 상황에 유연하게 적응", "깊이와 넓이를 모두 갖춘 관계 형성"];
      weaknessesTitle = isEnglish ? "Points to Watch" : "주의할 점";
      weaknesses = isEnglish
        ? ["May overcommit without knowing limits", "Burnout risk without recovery time", "May suppress desire for alone time", "Exhaustion from trying to meet expectations"]
        : ["자신의 한계를 모르고 과도한 약속", "회복 시간 없이 계속 활동하면 번아웃", "혼자 있고 싶은 욕구를 억누를 수 있음", "타인의 기대에 부응하려다 지침"];
      recommendations = isEnglish
        ? ["Ensure sufficient alone time after social activities", "Understand and respect your energy patterns", "Avoid overcommitting", "Create and maintain a recovery routine"]
        : ["사회활동 후 충분한 단독 시간 확보", "자신의 에너지 패턴 이해하고 존중", "무리한 약속 자제하기", "회복 루틴 만들어 지키기"];
    } else if (averageScore <= 6.5) {
      personalityType = isEnglish ? "Introverted Otrovert" : "내향적 오트로버트 (Introverted Otrovert)";
      typeDescription = isEnglish
        ? "You're basically introverted but can handle social activities. Alone time is essential, and you participate in social activities with limited energy."
        : "당신은 기본적으로 내향적이지만 사회적 활동도 할 수 있습니다. 혼자만의 시간이 필수적이며, 사회활동은 제한된 에너지로 참여합니다.";
      characteristics = isEnglish
        ? ["🏡 Alone time is absolutely necessary", "🎯 Selectively participates in social activities", "📚 Prefers deep relationships with few people", "🌙 True energy recovery in solitude"]
        : ["🏡 혼자만의 시간이 절대적으로 필요", "🎯 선택적으로 사회활동 참여", "📚 깊이 있는 소수 관계 선호", "🌙 고독 속에서 진정한 에너지 회복"];
      strengthsTitle = isEnglish ? "Your Strengths" : "당신의 강점";
      strengths = isEnglish
        ? ["Deep thinking and insight", "Meaningful relationship building", "Independent and self-directed", "Can display social skills when needed"]
        : ["깊이 있는 사고와 통찰력", "의미 있는 관계 구축 능력", "독립적이고 자기주도적", "필요시 사회적 능력 발휘 가능"];
      weaknessesTitle = isEnglish ? "Points to Watch" : "주의할 점";
      weaknesses = isEnglish
        ? ["Easily stressed by social pressure", "Burden of societal expectation to be extroverted", "Tendency to isolate may become excessive", "May avoid necessary social connections"]
        : ["사회적 압력에 스트레스 받기 쉬움", "외향적이어야 한다는 사회적 기대 부담", "고립되려는 경향 과도할 수 있음", "필요한 사회적 연결 회피 가능"];
      recommendations = isEnglish
        ? ["Positively embrace your introversion", "Focus on a few deep relationships", "Ensure sufficient recovery time around social activities", "Utilize online communication"]
        : ["자신의 내향성 긍정적으로 받아들이기", "소수의 깊은 관계에 집중", "사회활동 전후 충분한 회복시간 확보", "온라인 소통도 활용하기"];
    } else {
      personalityType = isEnglish ? "Pure Introvert" : "완전 내향형 (Pure Introvert)";
      typeDescription = isEnglish
        ? "You are a typical introvert. You're most comfortable and energized when alone. Social activities are very limited, and you prefer deep relationships with a select few."
        : "당신은 전형적인 내향형입니다. 혼자만의 시간에서 가장 편안하고 에너지를 충전합니다. 사회적 활동은 매우 제한적으로 하며, 깊이 있는 소수의 관계를 선호합니다.";
      characteristics = isEnglish
        ? ["🧘 Most comfortable when alone", "📖 Rich inner world", "🎨 Prefers independent activities", "💎 Deep relationships with select few"]
        : ["🧘 혼자 있을 때 가장 편안함", "📖 내면 세계가 풍부함", "🎨 독립적 활동 선호", "💎 소수 정예 깊은 관계"];
      strengthsTitle = isEnglish ? "Your Strengths" : "당신의 강점";
      strengths = isEnglish
        ? ["Outstanding focus and deep thinking", "Excellent independent work capability", "Careful and thoughtful decisions", "Meaningful one-on-one relationships"]
        : ["뛰어난 집중력과 깊이 있는 사고", "독립적으로 일 처리 능력 탁월", "신중하고 사려 깊은 결정", "의미 있는 일대일 관계 구축"];
      weaknessesTitle = isEnglish ? "Points to Watch" : "주의할 점";
      weaknesses = isEnglish
        ? ["Loneliness from excessive isolation", "May miss networking opportunities", "Lack of social skill practice", "Tendency to avoid new experiences"]
        : ["과도한 고립으로 인한 외로움", "필요한 네트워킹 기회 놓칠 수 있음", "사회적 기술 연습 부족 가능", "새로운 경험 회피 경향"];
      recommendations = isEnglish
        ? ["Start with small social activities", "Utilize online communities", "Maintain relationships through one-on-one meetups", "Positively accept your personality type"]
        : ["작은 사회적 활동부터 시작하기", "온라인 커뮤니티 활용", "일대일 만남으로 관계 유지", "자신의 성향 긍정적으로 수용"];
    }

    const result = {
      personalityType, typeDescription,
      score: averageScore.toFixed(1),
      characteristics, strengthsTitle, strengths, weaknessesTitle, weaknesses, recommendations,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        question: isEnglish ? questions.find(q => q.id === questionId)?.en : questions.find(q => q.id === questionId)?.ko,
        answer: answer.value, score: answer.score
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
              <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isEnglish ? 'Back' : '뒤로'}
              </Button>
              <Badge variant="secondary" className="bg-white/90 text-indigo-600">
                <Sparkles className="w-3 h-3 mr-1" />
                NEW
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <CardTitle className="text-2xl">{isEnglish ? 'Otrovert Personality Analysis' : '오트로버트 성격 분석'}</CardTitle>
            </div>
            <p className="text-indigo-100 mt-2">
              {isEnglish ? 'Between extrovert and introvert — what\'s your true personality?' : '외향과 내향 사이, 당신의 진짜 성격은?'}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{isEnglish ? `Question ${currentQuestion + 1}` : `질문 ${currentQuestion + 1}`} / {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-6">
                {isEnglish ? currentQuestionData.en : currentQuestionData.ko}
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
                      answers[currentQuestionData.id]?.value === option.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleAnswer(option.value, option.score)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base">
                      {isEnglish ? option.en : option.ko}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between gap-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isEnglish ? 'Previous' : '이전'}
              </Button>
              <Button onClick={handleNext} disabled={!isAnswered} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                {currentQuestion === questions.length - 1 ? (isEnglish ? 'View Results' : '결과보기') : (isEnglish ? 'Next' : '다음')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
