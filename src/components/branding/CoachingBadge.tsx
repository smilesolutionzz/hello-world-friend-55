import React from 'react';
import { Sparkles, Compass } from 'lucide-react';

interface CoachingBadgeProps {
  variant?: 'pill' | 'inline' | 'card';
  className?: string;
}

/**
 * '발달 코칭 & 의사결정 보조' 브랜딩 배지.
 * 리포트, 결제, 분석 결과 등 핵심 노출 지점에 배치하여 비의료 포지셔닝을 명확히 합니다.
 */
const CoachingBadge: React.FC<CoachingBadgeProps> = ({ variant = 'pill', className = '' }) => {
  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 ${className}`}
      >
        <Compass className="w-3 h-3" />
        발달 코칭 도구 · 비의료
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 flex items-center gap-2 ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
        <p className="text-[11px] text-blue-900 break-keep leading-snug">
          <strong>발달 코칭 & 의사결정 보조 도구</strong> · 의료 진단이 아닙니다
        </p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-semibold text-blue-700 whitespace-nowrap ${className}`}
    >
      <Compass className="w-3 h-3" />
      코칭 도구 · 비의료
    </span>
  );
};

export default CoachingBadge;
