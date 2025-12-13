import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Sparkles, Lightbulb, Heart, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnalysisLoadingOverlayProps {
  isLoading: boolean;
  estimatedTime?: number; // 예상 소요 시간 (초)
  title?: string;
  description?: string;
}

const wisdomQuotes = [
  { quote: "아이의 마음을 이해하는 것이 최고의 교육입니다.", author: "마리아 몬테소리" },
  { quote: "모든 아이는 예술가다. 문제는 자라서도 예술가로 남아있느냐이다.", author: "파블로 피카소" },
  { quote: "아이들에게 가르쳐야 할 것은 생각하는 법이지, 무엇을 생각하느냐가 아니다.", author: "마가렛 미드" },
  { quote: "자녀에게 줄 수 있는 가장 좋은 것은 시간입니다.", author: "아놀드 글래스코" },
  { quote: "사랑받는 아이는 사랑하는 법을 배웁니다.", author: "펄 벅" },
  { quote: "아이의 속도에 맞춰 걸어가세요. 그것이 진정한 동행입니다.", author: "레지오 에밀리아" },
  { quote: "칭찬은 고래도 춤추게 한다.", author: "켄 블랜차드" },
  { quote: "아이는 우리의 미래가 아닌, 현재의 소중한 존재입니다.", author: "야누슈 코르착" },
];

const insights = [
  { icon: Lightbulb, text: "조기 개입은 발달 지연 회복에 가장 효과적입니다.", category: "발달" },
  { icon: Heart, text: "정서적 안정감은 학습 능력의 기초가 됩니다.", category: "정서" },
  { icon: Star, text: "아이마다 고유한 발달 속도가 있습니다.", category: "개인차" },
  { icon: Brain, text: "놀이는 아이의 두뇌 발달에 필수적입니다.", category: "인지" },
  { icon: Sparkles, text: "긍정적 피드백은 자존감 형성에 중요합니다.", category: "자존감" },
  { icon: Heart, text: "부모와의 애착은 사회성 발달의 기반입니다.", category: "사회성" },
];

const tips = [
  "검사 결과는 참고용이며, 전문가 상담과 함께 활용하시면 더 좋습니다.",
  "정기적인 발달 체크는 조기 발견과 개입에 도움이 됩니다.",
  "아이의 강점을 발견하고 격려해주세요.",
  "일관된 양육 태도가 아이에게 안정감을 줍니다.",
  "아이와 눈을 맞추며 대화하는 시간을 가져보세요.",
];

const AnalysisLoadingOverlay: React.FC<AnalysisLoadingOverlayProps> = ({
  isLoading,
  estimatedTime = 30,
  title = "AI 분석 중",
  description = "검사 결과를 전문적으로 분석하고 있습니다..."
}) => {
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(estimatedTime);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setRemainingTime(estimatedTime);
      return;
    }

    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newProgress = Math.min((elapsed / estimatedTime) * 100, 95);
      const newRemaining = Math.max(Math.ceil(estimatedTime - elapsed), 0);
      
      setProgress(newProgress);
      setRemainingTime(newRemaining);
    }, 100);

    // 명언 변경 (8초마다)
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % wisdomQuotes.length);
    }, 8000);

    // 인사이트 변경 (5초마다)
    const insightInterval = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % insights.length);
    }, 5000);

    // 팁 변경 (10초마다)
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % tips.length);
    }, 10000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(quoteInterval);
      clearInterval(insightInterval);
      clearInterval(tipInterval);
    };
  }, [isLoading, estimatedTime]);

  const currentQuote = wisdomQuotes[currentQuoteIndex];
  const currentInsight = insights[currentInsightIndex];
  const currentTip = tips[currentTipIndex];
  const InsightIcon = currentInsight.icon;

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-md"
      >
        <div className="w-full max-w-lg mx-4 space-y-6">
          {/* 메인 분석 카드 */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-800 dark:to-purple-900 rounded-3xl p-8 shadow-2xl"
          >
            {/* 브레인 아이콘 */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* 타이틀 */}
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-6">
              {description}
            </p>

            {/* 프로그레스 바 */}
            <div className="space-y-3 mb-6">
              <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
              </div>
              
              {/* 남은 시간 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>예상 남은 시간</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{remainingTime}</span>
                  <span className="text-slate-500 dark:text-slate-400">초</span>
                </div>
              </div>
            </div>

            {/* 분석 단계 */}
            <div className="grid grid-cols-4 gap-2">
              {['데이터 수집', '패턴 분석', 'AI 해석', '리포트 생성'].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 transition-colors ${
                    progress >= (idx + 1) * 25 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`} />
                  <span className={`text-xs ${
                    progress >= (idx + 1) * 25 ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 명언 카드 */}
          <motion.div
            key={`quote-${currentQuoteIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white/90 text-sm italic leading-relaxed">
                  "{currentQuote.quote}"
                </p>
                <p className="text-amber-300/80 text-xs mt-2">— {currentQuote.author}</p>
              </div>
            </div>
          </motion.div>

          {/* 인사이트 카드 */}
          <motion.div
            key={`insight-${currentInsightIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-4 border border-green-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/30 flex items-center justify-center">
                <InsightIcon className="w-4 h-4 text-green-300" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-green-400 font-medium">{currentInsight.category}</span>
                <p className="text-white/80 text-sm">{currentInsight.text}</p>
              </div>
            </div>
          </motion.div>

          {/* 팁 */}
          <motion.div
            key={`tip-${currentTipIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-white/50 text-xs">
              💡 {currentTip}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalysisLoadingOverlay;
