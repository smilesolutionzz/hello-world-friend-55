import { useState, useEffect, useMemo } from 'react';
import { Brain } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface AnalysisLoadingScreenProps {
  testName: string;
  estimatedSeconds?: number;
  tips?: { label: string; text: string }[];
}

const DEFAULT_TIPS_KO = [
  { label: '감각', text: '감각처리 특성은 개인마다 다르게 나타납니다.' },
  { label: '인지', text: '인지 패턴은 환경과 경험에 따라 달라질 수 있습니다.' },
  { label: '정서', text: '정서 조절 능력은 훈련을 통해 향상될 수 있습니다.' },
  { label: '관계', text: '대인관계 패턴은 초기 애착 경험에 영향을 받습니다.' },
  { label: '행동', text: '행동 변화는 작은 습관부터 시작하는 것이 효과적입니다.' },
  { label: '스트레스', text: '적절한 스트레스는 성장의 원동력이 됩니다.' },
];

const DEFAULT_TIPS_EN = [
  { label: 'Sensory', text: 'Sensory processing characteristics vary from person to person.' },
  { label: 'Cognitive', text: 'Cognitive patterns can change based on environment and experience.' },
  { label: 'Emotional', text: 'Emotional regulation skills can be improved through practice.' },
  { label: 'Relational', text: 'Interpersonal patterns are influenced by early attachment experiences.' },
  { label: 'Behavioral', text: 'Behavioral change is most effective when starting with small habits.' },
  { label: 'Stress', text: 'Healthy levels of stress can be a driving force for growth.' },
];

const STAGES_KO = [
  { label: '데이터 수집', pct: 0 },
  { label: '패턴 분석', pct: 25 },
  { label: 'AI 해석', pct: 55 },
  { label: '리포트 생성', pct: 85 },
];

const STAGES_EN = [
  { label: 'Data Collection', pct: 0 },
  { label: 'Pattern Analysis', pct: 25 },
  { label: 'AI Interpretation', pct: 55 },
  { label: 'Report Generation', pct: 85 },
];

const AnalysisLoadingScreen = ({
  testName,
  estimatedSeconds = 20,
  tips,
}: AnalysisLoadingScreenProps) => {
  const { isEnglish } = useLanguage();
  const [elapsed, setElapsed] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const activeTips = tips || (isEnglish ? DEFAULT_TIPS_EN : DEFAULT_TIPS_KO);
  const STAGES = isEnglish ? STAGES_EN : STAGES_KO;

  useEffect(() => {
    const timer = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIdx(p => (p + 1) % activeTips.length), 4000);
    return () => clearInterval(tipTimer);
  }, [activeTips.length]);

  const timeLeft = Math.max(0, estimatedSeconds - elapsed);
  const progress = Math.min(95, (elapsed / estimatedSeconds) * 100);

  const currentStage = useMemo(() => {
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (progress >= STAGES[i].pct) return i;
    }
    return 0;
  }, [progress, STAGES]);

  const currentTip = activeTips[tipIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary)/0.15)] via-[hsl(var(--primary)/0.08)] to-[hsl(var(--primary)/0.2)] flex flex-col items-center justify-center p-4">
      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl bg-card/80 backdrop-blur-xl border border-border/40 shadow-2xl p-8 space-y-6">
        {/* Brain Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-foreground">
            {isEnglish ? `Analyzing ${testName}` : `${testName} 분석 중`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEnglish ? 'Our AI is performing an in-depth analysis of your results...' : '전문적인 AI가 검사 결과를 심층 분석하고 있습니다...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time + Countdown */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="text-xs">⏱</span> {isEnglish ? 'Est. time remaining' : '예상 남은 시간'}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-foreground">{timeLeft}</span>
              <span className="text-sm text-muted-foreground">{isEnglish ? 'sec' : '초'}</span>
            </div>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between px-2">
          {STAGES.map((stage, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded-full transition-colors duration-500 ${
                  i <= currentStage
                    ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                    : 'bg-muted-foreground/30'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-500 ${
                  i <= currentStage ? 'text-primary' : 'text-muted-foreground/50'
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rotating Tip */}
      <div className="w-full max-w-md mt-8 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 p-4 transition-all duration-500">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-base">💡</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-primary mb-0.5">{currentTip.label}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{currentTip.text}</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground/60 mt-6 text-center max-w-sm">
        💡 {isEnglish ? 'Results are for reference only. We recommend consulting with a professional.' : '검사 결과는 참고용이며, 전문가 상담과 함께 활용하시면 더 좋습니다.'}
      </p>
    </div>
  );
};

export default AnalysisLoadingScreen;
