import React from 'react';
import { ShieldCheck, Database, Sparkles, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/i18n/LanguageContext';

interface ReliabilityBadgeProps {
  /** 통계적 신뢰도 0~1 (Cronbach's α 또는 합산 신뢰도) */
  reliability?: number;
  /** 분석에 사용된 데이터 포인트 수 (검사+관찰+훈련 등 합산) */
  dataPoints?: number;
  /** 비교 대상이 된 정규화 표본 크기 */
  normSampleSize?: number;
  /** 전문가 검증 완료 여부 */
  expertVerified?: boolean;
  /** 사용된 AI 모델 */
  modelName?: string;
  className?: string;
}

/**
 * 리포트 상단에 노출되는 '신뢰도 배지'.
 * - 임상심리 표준에 따라 0.7 미만은 '참고용', 0.8 이상은 '높음', 0.9 이상은 '매우 높음'으로 표시.
 * - 데이터 N수, 정규화 표본, 전문가 검증, 모델명을 함께 노출하여 ChatGPT 대비 차별화.
 */
const ReliabilityBadge: React.FC<ReliabilityBadgeProps> = ({
  reliability = 0.85,
  dataPoints = 0,
  normSampleSize = 1247,
  expertVerified = false,
  modelName = 'Gemini 3.1 Pro',
  className = '',
}) => {
  const { isEnglish } = useLanguage();
  const t = (ko: string, en: string) => (isEnglish ? en : ko);

  const reliabilityPct = Math.round(reliability * 100);
  const reliabilityLevel =
    reliability >= 0.9
      ? { label: t('매우 높음', 'Excellent'), color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }
      : reliability >= 0.8
      ? { label: t('높음', 'High'), color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
      : reliability >= 0.7
      ? { label: t('수용 가능', 'Acceptable'), color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
      : { label: t('참고용', 'Reference Only'), color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={`rounded-2xl border-2 ${reliabilityLevel.bg} p-4 ${className}`}
        role="region"
        aria-label={t('리포트 신뢰도 정보', 'Report Reliability Info')}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${reliabilityLevel.color}`} />
            <div>
              <h4 className="text-sm font-bold text-slate-900 break-keep">
                {t('이 리포트의 신뢰도', 'Report Reliability')}
              </h4>
              <p className="text-[11px] text-slate-500 break-keep">
                {t(
                  'AIHPRO는 단일 AI 출력이 아닌 통계 기반 분석을 제공합니다',
                  'AIHPRO uses statistical analysis, not raw AI output'
                )}
              </p>
            </div>
          </div>

          {expertVerified && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3" />
                  {t('전문가 검증', 'Expert Verified')}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                {t(
                  '제휴 기관 전문가가 이 리포트를 검토하고 코멘트를 추가했습니다.',
                  'A licensed partner expert has reviewed this report and added comments.'
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* 신뢰도 점수 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg bg-white/70 p-2.5 cursor-help">
                <div className="flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3 h-3 text-slate-500" />
                  <p className="text-[9px] text-slate-500 font-medium">
                    {t('내적 일관성', 'Reliability')}
                  </p>
                </div>
                <p className={`text-base font-bold ${reliabilityLevel.color}`}>
                  {reliabilityPct}%
                </p>
                <p className="text-[9px] text-slate-500">{reliabilityLevel.label}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px] text-xs">
              {t(
                "Cronbach's α 기반 내적 일관성. 0.7 이상은 임상 활용이 가능한 수준입니다.",
                "Cronbach's alpha — internal consistency. ≥0.7 is acceptable for clinical use."
              )}
            </TooltipContent>
          </Tooltip>

          {/* 데이터 포인트 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg bg-white/70 p-2.5 cursor-help">
                <div className="flex items-center gap-1 mb-0.5">
                  <Database className="w-3 h-3 text-slate-500" />
                  <p className="text-[9px] text-slate-500 font-medium">
                    {t('분석 데이터', 'Data Points')}
                  </p>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {dataPoints > 0 ? dataPoints.toLocaleString() : '—'}
                </p>
                <p className="text-[9px] text-slate-500">
                  {t('개 항목', 'items')}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px] text-xs">
              {t(
                '검사 응답, 관찰일지, 훈련 기록 등 분석에 활용된 모든 데이터 항목 수입니다.',
                'Total number of data items (assessments, observations, training logs) used in this analysis.'
              )}
            </TooltipContent>
          </Tooltip>

          {/* 정규화 표본 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg bg-white/70 p-2.5 cursor-help">
                <div className="flex items-center gap-1 mb-0.5">
                  <Info className="w-3 h-3 text-slate-500" />
                  <p className="text-[9px] text-slate-500 font-medium">
                    {t('비교 표본', 'Norm Sample')}
                  </p>
                </div>
                <p className="text-base font-bold text-slate-800">
                  N={normSampleSize.toLocaleString()}
                </p>
                <p className="text-[9px] text-slate-500">
                  {t('정규화', 'Normalized')}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px] text-xs">
              {t(
                '같은 연령대 사용자 표본 대비 백분위와 T점수가 산출됩니다.',
                'Percentile and T-scores are computed against this age-matched normalized sample.'
              )}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
          <span>
            {t('분석 엔진', 'Engine')}:{' '}
            <span className="font-semibold text-slate-700">{modelName}</span>
          </span>
          <span className="italic">
            {t('* 의료 진단이 아닌 발달 코칭 참고 자료입니다', '* Non-medical developmental coaching reference')}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ReliabilityBadge;
