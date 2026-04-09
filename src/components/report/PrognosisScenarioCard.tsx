import React from 'react';
import { ArrowUpRight, ArrowRight, ArrowDownRight, Calendar } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export interface PrognosisScenario {
  period: string;
  periodEn: string;
  optimistic: { score: number; description: string; descriptionEn: string };
  baseline: { score: number; description: string; descriptionEn: string };
  conservative: { score: number; description: string; descriptionEn: string };
}

interface PrognosisScenarioCardProps {
  currentScore: number;
  maxScore: number;
  scenarios: PrognosisScenario[];
  scoreName?: string;
  className?: string;
}

export const PrognosisScenarioCard: React.FC<PrognosisScenarioCardProps> = ({
  currentScore, maxScore, scenarios, scoreName, className = ''
}) => {
  const { isEnglish } = useLanguage();

  const getChangeIcon = (futureScore: number) => {
    const diff = futureScore - currentScore;
    if (diff > 2) return <ArrowUpRight className="w-3 h-3 text-green-500" />;
    if (diff < -2) return <ArrowDownRight className="w-3 h-3 text-red-500" />;
    return <ArrowRight className="w-3 h-3 text-amber-500" />;
  };

  const getChangeColor = (futureScore: number) => {
    const diff = futureScore - currentScore;
    if (diff > 2) return 'text-green-600';
    if (diff < -2) return 'text-red-600';
    return 'text-amber-600';
  };

  return (
    <div className={`rounded-2xl border border-border/40 bg-card p-4 ${className}`}>
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4 text-primary" />
        {isEnglish ? 'Prognosis Scenarios' : '예후 시나리오 예측'}
      </h3>
      <p className="text-[10px] text-muted-foreground mb-4">
        {isEnglish
          ? 'Projected outcomes based on current patterns and intervention levels'
          : '현재 패턴과 개입 수준에 따른 예상 경과입니다. 참고용이며 실제 경과와 다를 수 있습니다.'}
      </p>

      {/* Current Score Reference */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
        <span className="text-[10px] text-muted-foreground">
          {isEnglish ? 'Current' : '현재'} {scoreName && `(${scoreName})`}:
        </span>
        <span className="text-sm font-bold text-primary">{currentScore}</span>
        <span className="text-[10px] text-muted-foreground">/ {maxScore}</span>
      </div>

      {/* Scenario Table */}
      <div className="space-y-3">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="rounded-xl border border-border/30 overflow-hidden">
            <div className="px-3 py-1.5 bg-muted/30 border-b border-border/20">
              <span className="text-[11px] font-semibold text-foreground">
                📅 {isEnglish ? scenario.periodEn : scenario.period}
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border/20">
              {/* Optimistic */}
              <div className="p-2.5 text-center">
                <p className="text-[9px] text-green-600 font-medium mb-1">
                  {isEnglish ? '🟢 Active' : '🟢 적극적 개입'}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-bold text-green-600">{scenario.optimistic.score}</span>
                  {getChangeIcon(scenario.optimistic.score)}
                </div>
                <p className="text-[8px] text-muted-foreground mt-1 leading-tight">
                  {isEnglish ? scenario.optimistic.descriptionEn : scenario.optimistic.description}
                </p>
              </div>

              {/* Baseline */}
              <div className="p-2.5 text-center bg-muted/10">
                <p className="text-[9px] text-amber-600 font-medium mb-1">
                  {isEnglish ? '🟡 Moderate' : '🟡 현재 유지'}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-bold text-amber-600">{scenario.baseline.score}</span>
                  {getChangeIcon(scenario.baseline.score)}
                </div>
                <p className="text-[8px] text-muted-foreground mt-1 leading-tight">
                  {isEnglish ? scenario.baseline.descriptionEn : scenario.baseline.description}
                </p>
              </div>

              {/* Conservative */}
              <div className="p-2.5 text-center">
                <p className="text-[9px] text-red-600 font-medium mb-1">
                  {isEnglish ? '🔴 No Action' : '🔴 미개입'}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-bold text-red-600">{scenario.conservative.score}</span>
                  {getChangeIcon(scenario.conservative.score)}
                </div>
                <p className="text-[8px] text-muted-foreground mt-1 leading-tight">
                  {isEnglish ? scenario.conservative.descriptionEn : scenario.conservative.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-muted-foreground/60 mt-3 text-center leading-relaxed">
        {isEnglish
          ? '※ Projections are estimates based on statistical models and are not guaranteed outcomes.'
          : '※ 본 예측은 통계적 모델에 기반한 추정치이며, 실제 결과를 보장하지 않습니다.'}
      </p>
    </div>
  );
};

/**
 * 현재 점수를 기반으로 기본 예후 시나리오를 생성합니다.
 */
export const generateDefaultScenarios = (
  currentScore: number,
  maxScore: number,
  isHigherBetter: boolean = false
): PrognosisScenario[] => {
  const ratio = currentScore / maxScore;
  
  // For scales where lower is better (e.g., depression)
  const improve = isHigherBetter ? 1 : -1;
  const worsen = isHigherBetter ? -1 : 1;

  return [
    {
      period: '3개월 후',
      periodEn: 'After 3 months',
      optimistic: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + improve * maxScore * 0.15))),
        description: '전문가 상담 + 행동 훈련 병행 시',
        descriptionEn: 'With counseling + behavioral training',
      },
      baseline: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + improve * maxScore * 0.03))),
        description: '현재 상태 유지 시',
        descriptionEn: 'Maintaining current state',
      },
      conservative: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + worsen * maxScore * 0.08))),
        description: '개입 없이 방치 시',
        descriptionEn: 'Without intervention',
      },
    },
    {
      period: '6개월 후',
      periodEn: 'After 6 months',
      optimistic: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + improve * maxScore * 0.25))),
        description: '지속적 프로그램 참여 시',
        descriptionEn: 'With sustained program participation',
      },
      baseline: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + improve * maxScore * 0.05))),
        description: '자연 경과',
        descriptionEn: 'Natural progression',
      },
      conservative: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + worsen * maxScore * 0.15))),
        description: '리스크 요인 미관리 시',
        descriptionEn: 'Unmanaged risk factors',
      },
    },
    {
      period: '12개월 후',
      periodEn: 'After 12 months',
      optimistic: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + improve * maxScore * 0.35))),
        description: '종합적 치료 + 환경 개선 시',
        descriptionEn: 'Comprehensive treatment + environmental improvement',
      },
      baseline: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + improve * maxScore * 0.08))),
        description: '최소한의 관리 시',
        descriptionEn: 'Minimal management',
      },
      conservative: {
        score: Math.max(0, Math.min(maxScore, Math.round(currentScore + worsen * maxScore * 0.22))),
        description: '악화 요인 누적 시',
        descriptionEn: 'Accumulated risk factors',
      },
    },
  ];
};

export default PrognosisScenarioCard;
