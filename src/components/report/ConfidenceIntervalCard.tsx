import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ConfidenceIntervalProps {
  score: number;
  maxScore: number;
  lower: number;
  upper: number;
  sem: number;
  reliability?: number;
  label?: string;
  className?: string;
}

export const ConfidenceIntervalCard: React.FC<ConfidenceIntervalProps> = ({
  score, maxScore, lower, upper, sem, reliability = 0.8, label, className = ''
}) => {
  const { isEnglish } = useLanguage();
  const pctScore = (score / maxScore) * 100;
  const pctLower = (lower / maxScore) * 100;
  const pctUpper = (upper / maxScore) * 100;

  const reliabilityLabel = reliability >= 0.9 ? (isEnglish ? 'Excellent' : '우수')
    : reliability >= 0.8 ? (isEnglish ? 'Good' : '양호')
    : reliability >= 0.7 ? (isEnglish ? 'Acceptable' : '수용가능')
    : (isEnglish ? 'Low' : '낮음');

  return (
    <div className={`rounded-2xl border border-border/40 bg-card p-4 ${className}`}>
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        {isEnglish ? 'Score Confidence Interval' : '점수 신뢰구간'}
      </h3>

      {/* Visual CI bar */}
      <div className="mb-4">
        {label && <p className="text-[11px] text-muted-foreground mb-1.5">{label}</p>}
        <div className="relative h-8 rounded-lg bg-muted/30 overflow-hidden">
          {/* CI range band */}
          <div
            className="absolute top-0 h-full bg-primary/15 border-l-2 border-r-2 border-primary/30"
            style={{ left: `${pctLower}%`, width: `${pctUpper - pctLower}%` }}
          />
          {/* Score marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-primary"
            style={{ left: `${pctScore}%` }}
          />
          <div
            className="absolute -top-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm"
            style={{ left: `${pctScore}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">0</span>
          <span className="text-[9px] text-muted-foreground">{maxScore}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/30 p-2">
          <p className="text-[9px] text-muted-foreground">{isEnglish ? '95% CI Lower' : '95% 하한'}</p>
          <p className="text-sm font-bold text-foreground">{lower}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2">
          <p className="text-[9px] text-muted-foreground">{isEnglish ? 'Observed' : '관측값'}</p>
          <p className="text-sm font-bold text-primary">{score}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <p className="text-[9px] text-muted-foreground">{isEnglish ? '95% CI Upper' : '95% 상한'}</p>
          <p className="text-sm font-bold text-foreground">{upper}</p>
        </div>
      </div>

      {/* Reliability & SEM */}
      <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
        <div className="text-[10px] text-muted-foreground">
          <span className="font-medium">{isEnglish ? 'Internal Consistency' : '내적 일관성'}:</span>{' '}
          <span className="font-bold text-foreground">{reliability.toFixed(2)}</span>{' '}
          <span className="text-muted-foreground/70">({reliabilityLabel})</span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          <span className="font-medium">{isEnglish ? 'SEM' : '측정표준오차'}:</span>{' '}
          <span className="font-bold text-foreground">±{sem}</span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceIntervalCard;
