import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, Zap, Heart, Brain, Target, Sparkles, Lightbulb, Download, Printer, TrendingUp, Loader2, RefreshCw, Users, ChevronRight, BookOpen } from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTestActions } from "@/hooks/useTestActions";
import { useWordDownload } from "@/hooks/useWordDownload";
import { Link } from "react-router-dom";
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface ResilienceTestResultProps {
  results: {
    answers: Record<string, string>;
    categoryScores: Record<string, number>;
    totalScore: number;
    resilienceType: string;
    resilienceLevel: string;
    recommendations: string[];
  };
  onBack: () => void;
}

interface AIAnalysis {
  overviewAnalysis: string;
  categoryAnalysis: string;
  workplaceAnalysis: string;
  strengthsAnalysis: string;
  developmentAreas: string;
  practiceGuide: string;
  crisisResponse: string;
  expertOpinion: string;
  fullAnalysis: string;
}

export default function ResilienceTestResult({ results, onBack }: ResilienceTestResultProps) {
  const { categoryScores, totalScore, resilienceType, resilienceLevel, recommendations } = results;
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveTestResult, isSaving } = useTestActions();
  const { generateWordDocument, printDocument } = useWordDownload();

  useEffect(() => {
    generateLocalAnalysis();
  }, []);

  const generateLocalAnalysis = () => {
    setIsLoadingAnalysis(true);
    
    setTimeout(() => {
      const analysis = generateComprehensiveAnalysis();
      setAiAnalysis(analysis);
      setIsLoadingAnalysis(false);
    }, 2000);
  };

  const generateComprehensiveAnalysis = (): AIAnalysis => {
    const { stress_recovery, adaptability, emotional_stability, social_support, purpose_growth } = categoryScores;
    
    // 종합 분석
    let overviewAnalysis = "";
    if (totalScore >= 80) {
      overviewAnalysis = `당신의 전체 회복탄력성 점수는 ${totalScore}점으로, **'탁월한 회복력 리더'** 수준입니다. 이는 상위 15% 이내에 해당하는 매우 뛰어난 결과입니다.\n\n당신은 예상치 못한 위기 상황에서도 침착함을 유지하고, 스트레스 후 빠르게 정상 상태로 돌아오는 능력을 갖추고 있습니다. 변화를 위협이 아닌 성장의 기회로 인식하며, 어려움 속에서도 의미를 찾아내는 성숙한 대처 방식을 보여줍니다.\n\n이러한 높은 회복탄력성은 직장에서 리더십 역할을 수행하거나, 불확실성이 높은 환경에서 일할 때 큰 자산이 됩니다.`;
    } else if (totalScore >= 65) {
      overviewAnalysis = `당신의 전체 회복탄력성 점수는 ${totalScore}점으로, **'안정적인 적응자'** 수준입니다.\n\n대부분의 스트레스 상황에서 건강하게 대처할 수 있는 역량을 갖추고 있습니다. 일상적인 어려움에는 잘 대응하지만, 극심한 스트레스나 예상치 못한 위기 상황에서는 추가적인 지원이 필요할 수 있습니다.\n\n당신의 회복탄력성은 평균 이상이며, 일부 영역을 강화함으로써 더욱 안정적인 심리적 기반을 구축할 수 있습니다.`;
    } else if (totalScore >= 50) {
      overviewAnalysis = `당신의 전체 회복탄력성 점수는 ${totalScore}점으로, **'성장 중인 회복자'** 수준입니다.\n\n스트레스 상황에서 회복하는 데 시간이 다소 걸리거나, 특정 유형의 어려움에 더 취약할 수 있습니다. 그러나 이는 개선 가능한 영역이며, 적절한 전략과 연습을 통해 회복탄력성을 크게 높일 수 있습니다.\n\n현재 수준에서도 일상적인 스트레스에는 대처하고 있지만, 더 나은 심리적 웰빙을 위해 체계적인 접근이 도움이 될 것입니다.`;
    } else {
      overviewAnalysis = `당신의 전체 회복탄력성 점수는 ${totalScore}점으로, **회복력 개발에 관심이 필요한** 수준입니다.\n\n스트레스 상황에서 회복하는 데 어려움을 겪거나, 부정적 감정에 오래 머무르는 경향이 있을 수 있습니다. 이는 우리 모두가 경험할 수 있는 자연스러운 상태이며, 의식적인 노력을 통해 개선될 수 있습니다.\n\n전문가의 도움이나 체계적인 훈련 프로그램을 통해 회복탄력성을 단계적으로 높여가시길 권장합니다.`;
    }

    // 영역별 분석
    let categoryAnalysis = "**[5가지 핵심 영역 상세 분석]**\n\n";
    
    categoryAnalysis += `🔄 **스트레스 회복력 (${stress_recovery}점)**\n`;
    if (stress_recovery >= 75) {
      categoryAnalysis += "스트레스 상황 후 빠르게 회복하는 뛰어난 역량을 보유하고 있습니다. 위기 상황에서도 침착함을 유지하며, 부정적 감정을 효과적으로 전환합니다.\n\n";
    } else if (stress_recovery >= 50) {
      categoryAnalysis += "일반적인 스트레스에는 잘 대처하지만, 큰 위기 상황에서는 회복에 시간이 필요할 수 있습니다. 규칙적인 자기관리 루틴을 권장합니다.\n\n";
    } else {
      categoryAnalysis += "스트레스 후 회복에 어려움을 겪는 경향이 있습니다. 명상, 운동, 또는 전문 상담을 통해 회복력을 키워가실 것을 권장합니다.\n\n";
    }

    categoryAnalysis += `⚡ **적응 유연성 (${adaptability}점)**\n`;
    if (adaptability >= 75) {
      categoryAnalysis += "변화에 유연하게 적응하고, 불확실한 상황에서도 효과적으로 결정을 내립니다. 새로운 방식을 시도하는 것에 열린 자세를 가지고 있습니다.\n\n";
    } else if (adaptability >= 50) {
      categoryAnalysis += "익숙한 변화에는 적응하지만, 예상치 못한 상황에서는 불안을 느낄 수 있습니다. 작은 변화부터 연습하며 유연성을 높여보세요.\n\n";
    } else {
      categoryAnalysis += "변화에 적응하는 것이 어려울 수 있습니다. 점진적인 노출과 인지적 재구성 기법이 도움이 될 수 있습니다.\n\n";
    }

    categoryAnalysis += `❤️ **정서적 안정성 (${emotional_stability}점)**\n`;
    if (emotional_stability >= 75) {
      categoryAnalysis += "감정의 기복이 적고, 비판적 피드백에도 흔들리지 않습니다. 자기 감정을 잘 인식하고 조절하는 성숙한 정서 관리 능력을 보여줍니다.\n\n";
    } else if (emotional_stability >= 50) {
      categoryAnalysis += "대체로 안정적이나, 특정 상황에서 감정적으로 민감해질 수 있습니다. 마음챙김 훈련이 감정 조절에 도움이 될 수 있습니다.\n\n";
    } else {
      categoryAnalysis += "감정 기복이 크거나 부정적 피드백에 민감한 편입니다. 감정일기 작성, 호흡 명상 등을 통해 정서 조절 능력을 강화해보세요.\n\n";
    }

    categoryAnalysis += `🎯 **사회적 지지망 (${social_support}점)**\n`;
    if (social_support >= 75) {
      categoryAnalysis += "신뢰할 수 있는 사람들과의 관계가 탄탄하며, 필요할 때 도움을 요청할 수 있습니다. 이 지지망은 위기 시 강력한 버팀목이 됩니다.\n\n";
    } else if (social_support >= 50) {
      categoryAnalysis += "어느 정도의 사회적 지지가 있으나, 관계를 더 깊게 발전시킬 여지가 있습니다. 정기적인 소통을 통해 관계를 강화해보세요.\n\n";
    } else {
      categoryAnalysis += "사회적 지지망이 제한적일 수 있습니다. 동료, 친구, 또는 전문 네트워크를 통해 관계를 넓혀가시길 권장합니다.\n\n";
    }

    categoryAnalysis += `🧠 **목적의식 & 성장 마인드 (${purpose_growth}점)**\n`;
    if (purpose_growth >= 75) {
      categoryAnalysis += "어려움 속에서도 의미를 찾고, 실패를 성장의 기회로 전환합니다. 미래에 대한 희망적 관점과 성장 마인드셋을 갖추고 있습니다.";
    } else if (purpose_growth >= 50) {
      categoryAnalysis += "목적의식이 있으나 때때로 흔들릴 수 있습니다. 장기 목표와 가치관을 명확히 정리하면 더 강한 동기부여가 될 수 있습니다.";
    } else {
      categoryAnalysis += "삶의 목적이나 의미를 찾는 데 어려움을 겪을 수 있습니다. 가치관 탐색과 목표 설정 작업이 도움이 될 것입니다.";
    }

    // 직장 생활 분석
    let workplaceAnalysis = "**[직장 생활에서의 회복탄력성]**\n\n";
    if (totalScore >= 70) {
      workplaceAnalysis += "높은 회복탄력성을 바탕으로 업무 압박, 조직 변화, 대인 갈등 등 직장 내 다양한 도전에 효과적으로 대처할 수 있습니다.\n\n";
      workplaceAnalysis += "• 리더십 역할에서 팀원들에게 안정감을 줄 수 있습니다\n";
      workplaceAnalysis += "• 프로젝트 실패나 비판적 피드백 후에도 빠르게 재정비할 수 있습니다\n";
      workplaceAnalysis += "• 조직 변화나 불확실한 상황에서 긍정적 영향력을 발휘할 수 있습니다";
    } else if (totalScore >= 50) {
      workplaceAnalysis += "일상적인 업무 스트레스에는 대처하지만, 중대한 변화나 위기 상황에서는 추가적인 지원이 필요할 수 있습니다.\n\n";
      workplaceAnalysis += "• 멘토나 동료와의 정기적인 소통을 통해 지지망을 강화하세요\n";
      workplaceAnalysis += "• 스트레스 상황 전에 대처 전략을 미리 수립해두세요\n";
      workplaceAnalysis += "• 업무와 개인 생활의 균형을 의식적으로 관리하세요";
    } else {
      workplaceAnalysis += "직장 스트레스에 더 취약할 수 있으며, 번아웃 위험에 주의가 필요합니다.\n\n";
      workplaceAnalysis += "• EAP(직원 지원 프로그램)나 전문 상담을 활용해보세요\n";
      workplaceAnalysis += "• 업무량 조절과 경계 설정에 적극적으로 나서세요\n";
      workplaceAnalysis += "• 작은 성취들을 인식하고 스스로를 격려하는 연습을 하세요";
    }

    // 강점 분석
    const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
    const topStrength = sortedCategories[0];
    const secondStrength = sortedCategories[1];
    
    const categoryNames: Record<string, string> = {
      stress_recovery: '스트레스 회복력',
      adaptability: '적응 유연성',
      emotional_stability: '정서적 안정성',
      social_support: '사회적 지지망',
      purpose_growth: '목적의식 & 성장'
    };

    let strengthsAnalysis = `**[핵심 강점 분석]**\n\n`;
    strengthsAnalysis += `당신의 가장 뛰어난 영역은 **${categoryNames[topStrength[0]]}** (${topStrength[1]}점)입니다. `;
    strengthsAnalysis += `두 번째 강점은 **${categoryNames[secondStrength[0]]}** (${secondStrength[1]}점)입니다.\n\n`;
    strengthsAnalysis += `이 두 영역을 중심으로 다른 영역도 함께 발전시켜 나간다면, 더욱 균형 잡힌 회복탄력성을 갖추게 될 것입니다.`;

    // 개발 영역
    const weakestArea = sortedCategories[sortedCategories.length - 1];
    let developmentAreas = `**[발전 가능 영역]**\n\n`;
    developmentAreas += `**${categoryNames[weakestArea[0]]}** 영역(${weakestArea[1]}점)이 상대적으로 개발의 여지가 있습니다.\n\n`;
    
    switch (weakestArea[0]) {
      case 'stress_recovery':
        developmentAreas += "• 규칙적인 운동(주 3회 이상, 30분씩)\n• 수면 위생 관리 및 충분한 휴식\n• 스트레스 해소 취미 활동 개발";
        break;
      case 'adaptability':
        developmentAreas += "• 작은 변화부터 의도적으로 시도해보기\n• '만약에...' 시나리오 플래닝 연습\n• 새로운 경험에 열린 자세 갖기";
        break;
      case 'emotional_stability':
        developmentAreas += "• 매일 5분 마음챙김 명상\n• 감정일기 작성\n• 인지행동 전략 학습";
        break;
      case 'social_support':
        developmentAreas += "• 주 1회 이상 신뢰하는 사람과 대화\n• 도움 요청하는 연습\n• 새로운 네트워크 참여(동호회, 스터디 등)";
        break;
      case 'purpose_growth':
        developmentAreas += "• 가치관 명확화 작업(10가지 핵심 가치 정하기)\n• 장단기 목표 설정\n• 성장 마인드셋 관련 책 읽기";
        break;
    }

    // 실천 가이드
    let practiceGuide = "**[일상 실천 가이드]**\n\n";
    practiceGuide += "📅 **아침 루틴**\n• 감사일기 3줄 쓰기\n• 오늘의 우선순위 3가지 정하기\n\n";
    practiceGuide += "🌙 **저녁 루틴**\n• 오늘 잘한 것 1가지 인정하기\n• 내일을 위한 마음 준비하기\n\n";
    practiceGuide += "🔄 **주간 루틴**\n• 운동 또는 산책 3회 이상\n• 의미 있는 관계에 시간 투자\n• 회복을 위한 혼자만의 시간 확보";

    // 위기 대응
    let crisisResponse = "**[위기 상황 대응 전략]**\n\n";
    crisisResponse += "극심한 스트레스나 위기 상황이 발생했을 때:\n\n";
    crisisResponse += "1. **멈추기** - 즉각적인 반응을 멈추고 깊게 숨쉬기\n";
    crisisResponse += "2. **관찰하기** - 상황과 내 감정을 객관적으로 파악\n";
    crisisResponse += "3. **지지 요청** - 신뢰할 수 있는 사람에게 연락\n";
    crisisResponse += "4. **행동 계획** - 할 수 있는 가장 작은 한 걸음 정하기\n";
    crisisResponse += "5. **자기 돌봄** - 수면, 식사, 휴식 우선시하기";

    // 전문가 소견
    let expertOpinion = "**[전문가 종합 소견]**\n\n";
    if (totalScore >= 70) {
      expertOpinion += `회복탄력성 검사 결과, 당신은 ${resilienceType}로 분류됩니다. 이는 삶의 다양한 도전에 효과적으로 대처할 수 있는 심리적 역량을 갖추었음을 의미합니다.\n\n`;
      expertOpinion += "현재의 강점을 유지하면서, 상대적으로 낮은 영역에 대한 의식적인 개발을 권장합니다. 높은 회복탄력성은 타고난 것이 아니라 지속적인 연습과 자기관리를 통해 유지됩니다.";
    } else if (totalScore >= 50) {
      expertOpinion += `회복탄력성 검사 결과, 당신은 ${resilienceType}로 분류됩니다. 기본적인 대처 역량은 갖추고 있으나, 더 강화할 수 있는 영역이 있습니다.\n\n`;
      expertOpinion += "특히 사회적 지지망 강화와 규칙적인 자기관리 루틴 확립을 권장합니다. 필요시 코칭이나 상담을 통한 체계적인 회복탄력성 훈련을 고려해보세요.";
    } else {
      expertOpinion += `회복탄력성 검사 결과, 현재 회복력 개발에 관심이 필요한 상태입니다. 이는 누구나 겪을 수 있는 자연스러운 상태이며, 개선 가능합니다.\n\n`;
      expertOpinion += "전문 상담사와의 상담 또는 회복탄력성 훈련 프로그램 참여를 강력히 권장합니다. 작은 변화부터 시작하여 점진적으로 회복력을 키워가시기 바랍니다.";
    }

    return {
      overviewAnalysis,
      categoryAnalysis,
      workplaceAnalysis,
      strengthsAnalysis,
      developmentAreas,
      practiceGuide,
      crisisResponse,
      expertOpinion,
      fullAnalysis: `${overviewAnalysis}\n\n${categoryAnalysis}\n\n${workplaceAnalysis}\n\n${strengthsAnalysis}\n\n${developmentAreas}\n\n${practiceGuide}\n\n${crisisResponse}\n\n${expertOpinion}`
    };
  };

  const handleSaveResult = async () => {
    await saveTestResult({
      testType: '회복탄력성 검사',
      total: totalScore,
      average: totalScore,
      severity: resilienceType,
      level: resilienceLevel,
      answers: results.answers,
      scores: categoryScores,
      analysis: aiAnalysis?.fullAnalysis,
      recommendations: recommendations
    });
  };

  const handleDownloadWord = () => {
    if (!aiAnalysis) return;
    
    generateWordDocument({
      title: '회복탄력성 검사 결과',
      date: new Date().toLocaleDateString('ko-KR'),
      sections: [
        { title: '검사 개요', content: `회복력 유형: ${resilienceType}\n회복탄력성 수준: ${resilienceLevel}\n종합 점수: ${totalScore}점` },
        { title: '종합 분석', content: aiAnalysis.overviewAnalysis },
        { title: '영역별 심층 분석', content: aiAnalysis.categoryAnalysis },
        { title: '직장 생활 분석', content: aiAnalysis.workplaceAnalysis },
        { title: '핵심 강점 분석', content: aiAnalysis.strengthsAnalysis },
        { title: '발전 가능 영역', content: aiAnalysis.developmentAreas },
        { title: '일상 실천 가이드', content: aiAnalysis.practiceGuide },
        { title: '위기 대응 전략', content: aiAnalysis.crisisResponse },
        { title: '전문가 종합 소견', content: aiAnalysis.expertOpinion }
      ]
    });
  };

  const handlePrint = () => {
    if (!aiAnalysis) return;
    
    printDocument({
      title: '회복탄력성 검사 결과',
      date: new Date().toLocaleDateString('ko-KR'),
      sections: [
        { title: '검사 개요', content: `회복력 유형: ${resilienceType}\n회복탄력성 수준: ${resilienceLevel}\n종합 점수: ${totalScore}점` },
        { title: '종합 분석', content: aiAnalysis.overviewAnalysis },
        { title: '영역별 심층 분석', content: aiAnalysis.categoryAnalysis },
        { title: '직장 생활 분석', content: aiAnalysis.workplaceAnalysis },
        { title: '핵심 강점 분석', content: aiAnalysis.strengthsAnalysis },
        { title: '발전 가능 영역', content: aiAnalysis.developmentAreas },
        { title: '일상 실천 가이드', content: aiAnalysis.practiceGuide },
        { title: '위기 대응 전략', content: aiAnalysis.crisisResponse },
        { title: '전문가 종합 소견', content: aiAnalysis.expertOpinion }
      ]
    });
  };

  const getTypeInfo = () => {
    switch (resilienceType) {
      case "탁월한 회복력 리더":
        return {
          color: "from-emerald-500 to-teal-500",
          bgColor: "bg-emerald-50",
          emoji: "🛡️",
          description: "스트레스 상황에서도 침착함을 유지하고, 빠르게 회복하는 뛰어난 역량을 보유하고 있습니다.",
          quote: "\"폭풍이 지나간 후에도 서 있는 나무가 가장 강한 나무다.\""
        };
      case "안정적인 적응자":
        return {
          color: "from-blue-500 to-indigo-500",
          bgColor: "bg-blue-50",
          emoji: "⚓",
          description: "대부분의 상황에서 안정적으로 대처하며, 변화에 유연하게 적응합니다.",
          quote: "\"견고함은 고요함에서 나온다.\""
        };
      case "성장 중인 회복자":
        return {
          color: "from-amber-500 to-orange-500",
          bgColor: "bg-amber-50",
          emoji: "🌱",
          description: "회복탄력성을 키워가는 과정에 있으며, 발전 가능성이 높습니다.",
          quote: "\"매일 조금씩 더 강해지는 중이다.\""
        };
      default:
        return {
          color: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-50",
          emoji: "💪",
          description: "회복력 개발에 관심을 기울이면 큰 변화를 만들 수 있습니다.",
          quote: "\"모든 전문가는 한때 초보자였다.\""
        };
    }
  };

  const categoryInfo: Record<string, { icon: React.ReactNode; name: string; description: string }> = {
    stress_recovery: { 
      icon: <RefreshCw className="w-5 h-5" />, 
      name: '스트레스 회복력',
      description: '스트레스 후 원래 상태로 돌아오는 능력'
    },
    adaptability: { 
      icon: <Zap className="w-5 h-5" />, 
      name: '적응 유연성',
      description: '변화와 불확실성에 대처하는 능력'
    },
    emotional_stability: { 
      icon: <Heart className="w-5 h-5" />, 
      name: '정서적 안정성',
      description: '감정 조절 및 심리적 안정 유지 능력'
    },
    social_support: { 
      icon: <Users className="w-5 h-5" />, 
      name: '사회적 지지망',
      description: '도움을 주고받을 수 있는 관계의 질'
    },
    purpose_growth: { 
      icon: <Brain className="w-5 h-5" />, 
      name: '목적의식 & 성장',
      description: '삶의 의미와 성장 마인드셋'
    }
  };

  const typeInfo = getTypeInfo();

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getLevelBadgeColor = () => {
    switch (resilienceLevel) {
      case "매우 높음": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "높음": return "bg-blue-100 text-blue-800 border-blue-200";
      case "보통": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  const recommendedTests = [
    { name: "스트레스 검사", path: "/stress-package", icon: <Zap className="w-5 h-5" /> },
    { name: "삶의 의미 검사", path: "/assessment/life-purpose", icon: <Target className="w-5 h-5" /> },
    { name: "전체 심리검사 목록", path: "/assessment", icon: <Brain className="w-5 h-5" /> }
  ];

  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
          </div>

          {/* 메인 결과 카드 */}
          <Card className="border-emerald-200 shadow-xl mb-6 overflow-hidden">
            <div className={`bg-gradient-to-r ${typeInfo.color} p-6 text-white`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">회복탄력성 검사 결과</h2>
                    <p className="text-white/80">38문항 5개 영역 심층 분석 리포트</p>
                  </div>
                </div>
                <div className="text-4xl">{typeInfo.emoji}</div>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xl px-6 py-2 mb-4">
                  {resilienceType}
                </Badge>
                <div className="text-5xl font-bold text-emerald-600 mb-2">{totalScore}점</div>
                <p className="text-muted-foreground">회복탄력성 종합 점수</p>
                <Progress value={totalScore} className="w-full mt-4 h-3" />
              </div>
              <div className={`p-4 rounded-lg ${typeInfo.bgColor} mb-4`}>
                <p className="text-lg mb-2">{typeInfo.description}</p>
                <p className="text-sm italic text-muted-foreground">{typeInfo.quote}</p>
              </div>
              <div className="flex justify-center">
                <Badge className={`text-sm px-4 py-2 ${getLevelBadgeColor()}`}>
                  회복탄력성 수준: {resilienceLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 5개 영역 점수 */}
          <Card className="border-emerald-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                5가지 회복탄력성 영역 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryScores).map(([category, score]) => (
                  <div key={category} className="p-4 bg-gradient-to-r from-white to-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">{categoryInfo[category]?.icon}</span>
                        <span className="font-medium text-sm">{categoryInfo[category]?.name}</span>
                      </div>
                      <Badge className={`${getScoreColor(score)} text-white`}>{score}점</Badge>
                    </div>
                    <Progress value={score} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{categoryInfo[category]?.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI 심층 분석 리포트 */}
          <Card className="border-teal-200 mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                🧠 AI 전문가 심층 분석 리포트
              </CardTitle>
              <p className="text-white/80 text-sm">직장인 회복탄력성 전문 분석 시스템</p>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-teal-500 mb-4" />
                  <p className="text-muted-foreground">AI가 심층 분석 중입니다...</p>
                  <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6">
                  {aiAnalysis.overviewAnalysis && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-l-4 border-emerald-500">
                      <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        종합 분석
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.overviewAnalysis}</p>
                    </div>
                  )}

                  {aiAnalysis.categoryAnalysis && (
                    <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                      <h4 className="font-bold text-teal-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        영역별 심층 분석
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.categoryAnalysis}</p>
                    </div>
                  )}

                  <BlurredContent requiredCash={5000}>
                    {aiAnalysis.workplaceAnalysis && (
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          직장 생활 분석
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.workplaceAnalysis}</p>
                      </div>
                    )}

                    {aiAnalysis.strengthsAnalysis && (
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          핵심 강점 분석
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.strengthsAnalysis}</p>
                      </div>
                    )}

                    {aiAnalysis.developmentAreas && (
                      <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                        <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          발전 가능 영역
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.developmentAreas}</p>
                      </div>
                    )}

                    {aiAnalysis.practiceGuide && (
                      <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          일상 실천 가이드
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.practiceGuide}</p>
                      </div>
                    )}

                    {aiAnalysis.crisisResponse && (
                      <div className="p-4 bg-rose-50 rounded-lg border-l-4 border-rose-500">
                        <h4 className="font-bold text-rose-700 mb-2 flex items-center gap-2">
                          <RefreshCw className="w-5 h-5" />
                          위기 대응 전략
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.crisisResponse}</p>
                      </div>
                    )}

                    {aiAnalysis.expertOpinion && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                          <Brain className="w-5 h-5" />
                          전문가 종합 소견
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.expertOpinion}</p>
                      </div>
                    )}
                  </BlurredContent>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* 캐시 및 액션 버튼 */}
          <Card className="border-emerald-200 mb-6">
            <CardContent className="pt-6">
              <CashBalanceDisplay />
              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={handleSaveResult} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  결과 저장하기
                </Button>
                <Button onClick={handleDownloadWord} variant="outline" disabled={!aiAnalysis}>
                  <Download className="w-4 h-4 mr-2" />
                  Word 다운로드
                </Button>
                <Button onClick={handlePrint} variant="outline" disabled={!aiAnalysis}>
                  <Printer className="w-4 h-4 mr-2" />
                  인쇄하기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 추천 검사 */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                함께 해보면 좋은 검사
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {recommendedTests.map((test, index) => (
                  <Link 
                    key={index} 
                    to={test.path}
                    className="flex items-center justify-between p-4 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600">{test.icon}</span>
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
