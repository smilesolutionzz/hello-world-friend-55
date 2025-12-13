import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Sparkles, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisWaitingScreenProps {
  initialSeconds?: number;
  onComplete?: () => void;
  title?: string;
}

interface QuoteData {
  quote: string;
  author: string;
}

const AnalysisWaitingScreen: React.FC<AnalysisWaitingScreenProps> = ({
  initialSeconds = 50,
  onComplete,
  title = "분석 결과를 준비하고 있습니다"
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [progress, setProgress] = useState(0);
  const [currentQuote, setCurrentQuote] = useState<QuoteData>({
    quote: "잠시만 기다려 주세요. 소중한 분석 결과를 준비하고 있습니다.",
    author: ""
  });
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);

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
      // Keep the current quote on error
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const steps = [
    { icon: Brain, label: "데이터 분석 중", color: "text-blue-500" },
    { icon: Heart, label: "맞춤 해석 준비", color: "text-rose-500" },
    { icon: Sparkles, label: "결과 생성 중", color: "text-amber-500" },
  ];

  const currentStepIndex = Math.min(
    Math.floor(progress / 33.33),
    steps.length - 1
  );

  return (
    <Card className="border-0 shadow-xl max-w-lg mx-auto overflow-hidden">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-2xl font-mono font-bold text-primary">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {Math.round(progress)}% 완료
          </p>
        </div>

        {/* Steps indicator */}
        <div className="px-6 py-4 border-b border-border/50">
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    isActive ? 'scale-110' : isCompleted ? 'opacity-50' : 'opacity-30'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isActive ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? step.color : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-xs ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quote section */}
        <div className="p-6 bg-gradient-to-b from-transparent to-muted/30">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-full shrink-0">
              <Quote className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-h-[80px]">
              {isLoadingQuote ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LoadingSpinner className="w-4 h-4" />
                  <span className="text-sm">명언을 불러오는 중...</span>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <p className="text-foreground leading-relaxed mb-2 italic">
                    "{currentQuote.quote}"
                  </p>
                  {currentQuote.author && (
                    <p className="text-sm text-muted-foreground text-right">
                      — {currentQuote.author}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Waiting message */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/50">
            <LoadingSpinner className="w-5 h-5" />
            <p className="text-sm text-muted-foreground">
              조금만 기다려 주세요. 정확한 분석을 위해 최선을 다하고 있습니다.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisWaitingScreen;
