import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Calculator, Users, Layers } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface MethodologyFooterProps {
  dataSources?: string[];
  statisticalMethods?: string[];
  modelName?: string;
  generatedAt?: string;
  className?: string;
}

/**
 * 리포트 하단 '방법론 투명성' 푸터.
 * 이는 ChatGPT 같은 단순 LLM과의 결정적 차별점을 학부모/전문가에게 명시적으로 보여줍니다.
 */
const MethodologyFooter: React.FC<MethodologyFooterProps> = ({
  dataSources = [],
  statisticalMethods,
  modelName = 'Gemini 3.1 Pro',
  generatedAt,
  className = '',
}) => {
  const { isEnglish } = useLanguage();
  const t = (ko: string, en: string) => (isEnglish ? en : ko);
  const [open, setOpen] = useState(false);

  const defaultMethods = isEnglish
    ? [
        'Reliable Change Index (RCI) — Jacobson & Truax (1991)',
        '95% Confidence Interval based on SEM',
        "Cronbach's α — Internal consistency reliability",
        'Age-normed T-scores & Percentile ranks',
        'Multi-source data triangulation',
      ]
    : [
        '신뢰변화지수 (RCI) — Jacobson & Truax (1991)',
        '측정표준오차(SEM) 기반 95% 신뢰구간',
        "Cronbach's α — 내적 일관성 신뢰도",
        '연령 정규화 T점수 및 백분위',
        '다중 데이터 소스 삼각검증',
      ];

  const methods = statisticalMethods && statisticalMethods.length > 0 ? statisticalMethods : defaultMethods;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden ${className}`}
      aria-label={t('리포트 방법론', 'Report Methodology')}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-100/50 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-bold text-slate-800 break-keep">
            {t('이 리포트는 어떻게 만들어졌나요?', 'How was this report generated?')}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
          <div className="pt-4 grid sm:grid-cols-2 gap-4">
            {/* 통계 모델 */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <h5 className="text-xs font-bold text-slate-700">
                  {t('적용된 통계 모델', 'Statistical Methods')}
                </h5>
              </div>
              <ul className="space-y-1">
                {methods.map((m, i) => (
                  <li key={i} className="text-[11px] text-slate-600 leading-snug pl-3 relative break-keep">
                    <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-slate-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* 데이터 소스 */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <h5 className="text-xs font-bold text-slate-700">
                  {t('통합된 데이터 소스', 'Integrated Data Sources')}
                </h5>
              </div>
              {dataSources.length > 0 ? (
                <ul className="space-y-1">
                  {dataSources.map((s, i) => (
                    <li key={i} className="text-[11px] text-slate-600 leading-snug pl-3 relative break-keep">
                      <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  {t('단일 검사 기반 분석', 'Single-assessment based analysis')}
                </p>
              )}
            </div>
          </div>

          {/* 차별점 */}
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5 text-blue-700" />
              <h5 className="text-xs font-bold text-blue-900">
                {t('일반 AI 챗봇과의 차이', 'Difference from Generic AI Chatbots')}
              </h5>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed break-keep">
              {t(
                '일반 LLM은 텍스트 패턴만 생성하지만, AIHPRO는 검증된 임상 통계 모델(RCI, SEM, Cronbach\'s α)을 적용하고 다중 데이터를 삼각검증합니다. 또한 제휴 전문가가 직접 검토할 수 있는 Human-in-the-Loop 구조를 제공합니다.',
                'Generic LLMs only generate text patterns. AIHPRO applies validated clinical statistical models (RCI, SEM, Cronbach\'s α), triangulates multi-source data, and supports a Human-in-the-Loop expert review workflow.'
              )}
            </p>
          </div>

          {/* 메타 */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60">
            <span>
              {t('AI 엔진', 'AI Engine')}: <span className="font-semibold">{modelName}</span>
            </span>
            {generatedAt && (
              <span>
                {t('생성일', 'Generated')}: {new Date(generatedAt).toLocaleString(isEnglish ? 'en-US' : 'ko-KR')}
              </span>
            )}
          </div>

          {/* 면책 */}
          <p className="text-[10px] text-slate-500 italic leading-relaxed break-keep">
            {t(
              '※ 본 리포트는 의료 진단이 아니며, 발달 코칭 및 의사결정 보조를 위한 참고 자료입니다. 임상적 판단이 필요한 경우 반드시 자격을 갖춘 전문가의 상담을 받으시기 바랍니다.',
              '※ This report is not a medical diagnosis. It is a reference tool for developmental coaching and decision support. Please consult a qualified professional for clinical judgment.'
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default MethodologyFooter;
