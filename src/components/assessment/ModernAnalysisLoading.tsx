import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Lightbulb, Clock } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Quote {
  text: string;
  author: string;
}

interface Insight {
  category: string;
  text: string;
}

interface ModernAnalysisLoadingProps {
  title: string;
  description?: string;
  estimatedTime?: number;
  icon?: LucideIcon;
  quotes?: Quote[];
  insights?: Insight[];
}

const defaultQuotesKo: Quote[] = [
  { text: "자신을 아는 것이 모든 지혜의 시작이다.", author: "아리스토텔레스" },
  { text: "아이의 마음을 이해하는 것이 최고의 교육입니다.", author: "마리아 몬테소리" },
  { text: "마음의 평화는 자기 이해에서 시작됩니다.", author: "칼 융" },
  { text: "자기 인식은 변화의 첫 걸음입니다.", author: "다니엘 골먼" },
];

const defaultQuotesEn: Quote[] = [
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "Understanding the child's mind is the greatest education.", author: "Maria Montessori" },
  { text: "Peace of mind begins with self-understanding.", author: "Carl Jung" },
  { text: "Self-awareness is the first step toward change.", author: "Daniel Goleman" },
];

const defaultInsightsKo: Insight[] = [
  { category: "발달", text: "조기 개입은 발달 지연 회복에 가장 효과적입니다." },
  { category: "심리", text: "자기 이해는 정서적 안정의 첫 걸음입니다." },
  { category: "교육", text: "개인별 맞춤 접근이 최상의 결과를 만듭니다." },
  { category: "건강", text: "마음 건강은 전반적인 삶의 질을 결정합니다." },
];

const defaultInsightsEn: Insight[] = [
  { category: "Development", text: "Early intervention is most effective for developmental recovery." },
  { category: "Psychology", text: "Self-understanding is the first step to emotional stability." },
  { category: "Education", text: "Personalized approaches produce the best outcomes." },
  { category: "Wellness", text: "Mental health determines overall quality of life." },
];

const stepsKo = ["데이터 수집", "패턴 분석", "AI 해석", "리포트 생성"];
const stepsEn = ["Data Collection", "Pattern Analysis", "AI Interpretation", "Report Generation"];

const ModernAnalysisLoading: React.FC<ModernAnalysisLoadingProps> = ({
  title,
  description,
  estimatedTime = 25,
  icon: Icon = Brain,
  quotes,
  insights,
}) => {
  const { isEnglish } = useLanguage();
  const steps = isEnglish ? stepsEn : stepsKo;
  const resolvedQuotes = quotes || (isEnglish ? defaultQuotesEn : defaultQuotesKo);
  const resolvedInsights = insights || (isEnglish ? defaultInsightsEn : defaultInsightsKo);
  const resolvedDescription = description || (isEnglish ? "Our AI is conducting an in-depth analysis of your results..." : "전문적인 AI가 검사 결과를 심층 분석하고 있습니다...");

  const [timeLeft, setTimeLeft] = useState(estimatedTime);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepInterval = Math.floor(estimatedTime / steps.length);
    const elapsed = estimatedTime - timeLeft;
    const newStep = Math.min(Math.floor(elapsed / stepInterval), steps.length - 1);
    setCurrentStep(newStep);
  }, [timeLeft, estimatedTime]);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % resolvedQuotes.length);
    }, 5000);
    return () => clearInterval(quoteTimer);
  }, [resolvedQuotes.length]);

  useEffect(() => {
    const insightTimer = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % resolvedInsights.length);
    }, 4000);
    return () => clearInterval(insightTimer);
  }, [resolvedInsights.length]);

  const progress = ((estimatedTime - timeLeft) / estimatedTime) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {title}
        </h2>
        <p className="text-slate-400 text-center mb-8">
          {resolvedDescription}
        </p>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #ec4899, #22c55e)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              width: `${progress}%`,
              backgroundPosition: ["0% 0%", "100% 0%"],
            }}
            transition={{
              width: { duration: 0.5 },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
            }}
          />
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{isEnglish ? 'Est. time remaining' : '예상 남은 시간'}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">{timeLeft}</span>
            <span className="text-slate-400 ml-1">{isEnglish ? 's' : '초'}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep 
                    ? "bg-green-500" 
                    : "bg-slate-600"
                }`}
                animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className={`text-xs ${
                index <= currentStep ? "text-green-400" : "text-slate-500"
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quote Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-lg mt-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-300 leading-relaxed">
                "{resolvedQuotes[currentQuoteIndex].text}"
              </p>
              <p className="text-purple-400 text-sm mt-2">
                — {resolvedQuotes[currentQuoteIndex].author}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Insight Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentInsightIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-lg mt-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <span className="text-xs text-green-400 font-medium mb-1 block">
                {resolvedInsights[currentInsightIndex].category}
              </span>
              <p className="text-slate-300 leading-relaxed">
                {resolvedInsights[currentInsightIndex].text}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Disclaimer */}
      <p className="text-slate-500 text-sm mt-8 text-center flex items-center gap-2">
        <Lightbulb className="w-4 h-4" />
        {isEnglish 
          ? 'Results are for reference only. We recommend consulting with a professional for best outcomes.'
          : '검사 결과는 참고용이며, 전문가 상담과 함께 활용하시면 더 좋습니다.'}
      </p>
    </div>
  );
};

export default ModernAnalysisLoading;
