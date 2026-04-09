import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/i18n/LanguageContext';
import type { ValidityResult } from '@/utils/responseValidityAnalyzer';

interface ResponseValidityCardProps {
  validity: ValidityResult;
  className?: string;
}

const statusConfig = {
  high: { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800/50', label: '높음', labelEn: 'High' },
  acceptable: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800/50', label: '양호', labelEn: 'Acceptable' },
  caution: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/50', label: '주의', labelEn: 'Caution' },
  invalid: { icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800/50', label: '부적합', labelEn: 'Invalid' },
};

const indicatorStatusColors = {
  pass: 'bg-green-500',
  warning: 'bg-amber-500',
  fail: 'bg-red-500',
};

export const ResponseValidityCard: React.FC<ResponseValidityCardProps> = ({ validity, className = '' }) => {
  const { isEnglish } = useLanguage();
  const config = statusConfig[validity.overallValidity];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          {isEnglish ? 'Response Validity' : '응답 신뢰도 분석'}
        </h3>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${config.color} border ${config.border} bg-background`}>
          {isEnglish ? config.labelEn : config.label} ({validity.overallScore}%)
        </div>
      </div>

      {/* Indicators */}
      <div className="space-y-2.5">
        {validity.indicators.map((indicator, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground/80">
                {isEnglish ? indicator.nameEn : indicator.name}
              </span>
              <span className="text-[10px] font-bold text-foreground/60">{indicator.score}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={`h-full rounded-full ${indicatorStatusColors[indicator.status]} transition-all duration-500`}
                style={{ width: `${indicator.score}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {isEnglish ? indicator.descriptionEn : indicator.description}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <p className="text-[11px] text-foreground/70 leading-relaxed">
          <span className="font-semibold">{isEnglish ? 'Note: ' : '참고: '}</span>
          {validity.recommendation}
        </p>
      </div>
    </div>
  );
};

export default ResponseValidityCard;
