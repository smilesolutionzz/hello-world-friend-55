import React, { useState, useEffect, useCallback } from 'react';
import { Brain, BarChart2, Sparkles, FileText, Heart, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PremiumAnalysisLoadingProps {
  initialSeconds?: number;
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
  steps?: Array<{ label: string }>;
}

interface QuoteData {
  quote: string;
  author: string;
}

const defaultSteps = [
  { label: "데이터 수집" },
  { label: "패턴 분석" },
  { label: "AI 해석" },
  { label: "리포트 생성" },
];

const insights = [
  { icon: Heart, title: "정서", content: "정서적 안정감은 학습 능력의 기초가 됩니다." },
  { icon: Brain, title: "인지", content: "두뇌 발달은 다양한 경험을 통해 촉진됩니다." },
  { icon: Lightbulb, title: "창의성", content: "호기심을 격려하면 창의적 사고가 성장합니다." },
  { icon: Sparkles, title: "사회성", content: "또래 관계는 사회적 기술 발달에 중요합니다." },
];

const PremiumAnalysisLoading: React.FC<PremiumAnalysisLoadingProps> = ({
  initialSeconds = 50,
  onComplete,
  title = "전문 분석 중",
  subtitle = "DSM-5 기준으로 정밀 분석하고 있습니다...",
  steps = defaultSteps,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [progress, setProgress] = useState(0);
  const [currentQuote, setCurrentQuote] = useState<QuoteData>({
    quote: "아이의 마음을 이해하는 것이 최고의 교육입니다.",
    author: "마리아 몬테소리"
  });
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const fetchQuote = useCallback(async () => {
    setIsLoadingQuote(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-waiting-quote');
      if (error) throw error;
      if (data?.quote) {
        setCurrentQuote(data);
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setIsLoadingQuote(false);
    }
  }, []);

  // Fetch initial quote
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Fetch new quote every 15 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      fetchQuote();
    }, 15000);
    return () => clearInterval(quoteInterval);
  }, [fetchQuote]);

  // Rotate insights every 5 seconds
  useEffect(() => {
    const insightInterval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(insightInterval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        setProgress(((initialSeconds - newTime) / initialSeconds) * 100);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, initialSeconds, onComplete]);

  const currentStepIndex = Math.min(
    Math.floor(progress / (100 / steps.length)),
    steps.length - 1
  );

  const currentInsight = insights[currentInsightIndex];
  const InsightIcon = currentInsight.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-500/20">
          {/* Brain Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {title}
          </h2>
          <p className="text-purple-200/80 text-center mb-8 text-sm">
            {subtitle}
          </p>

          {/* Progress Bar */}
          <div className="relative mb-4">
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-purple-200/70 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>예상 남은 시간</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {timeLeft}<span className="text-lg ml-1 text-purple-300">초</span>
            </div>
          </div>

          {/* Steps */}
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-2"
                >
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-purple-400 ring-4 ring-purple-400/30' 
                        : isCompleted 
                          ? 'bg-green-400' 
                          : 'bg-slate-600'
                    }`}
                  />
                  <span className={`text-xs whitespace-nowrap ${
                    isActive ? 'text-purple-300 font-medium' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quote Card */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-5 mt-4 border border-purple-500/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div className={`transition-opacity duration-300 ${isLoadingQuote ? 'opacity-50' : 'opacity-100'}`}>
              <p className="text-white text-sm leading-relaxed">
                "{currentQuote.quote}"
              </p>
              {currentQuote.author && (
                <p className="text-purple-400 text-sm mt-2">
                  — {currentQuote.author}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Insight Card */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-5 mt-4 border border-purple-500/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <InsightIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-medium mb-1">
                {currentInsight.title}
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentInsight.content}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-purple-300/60 text-xs mt-6 flex items-center justify-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          검사 결과는 참고용이며, 전문가 상담과 함께 활용하시면 더 좋습니다.
        </p>
      </div>
    </div>
  );
};

export default PremiumAnalysisLoading;
