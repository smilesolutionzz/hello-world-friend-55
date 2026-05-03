/**
 * CollapsibleReason — "큐레이션 이유"를 접기/펼치기로 표시
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  reason: string;
  /** 100자 이상일 때 자동 접힘 */
  threshold?: number;
  /** 라벨 텍스트 */
  label?: string;
  /** 색상 톤 (rose/blue/amber) */
  tone?: 'rose' | 'blue' | 'amber';
}

const TONE: Record<NonNullable<Props['tone']>, { bg: string; border: string; label: string }> = {
  rose: { bg: 'bg-rose-50/60', border: 'border-rose-300', label: 'text-rose-700' },
  blue: { bg: 'bg-blue-50/60', border: 'border-blue-300', label: 'text-blue-700' },
  amber: { bg: 'bg-amber-50/60', border: 'border-amber-300', label: 'text-amber-700' },
};

export default function CollapsibleReason({
  reason,
  threshold = 80,
  label = '큐레이션 이유',
  tone = 'rose',
}: Props) {
  const long = reason.length > threshold;
  const [expanded, setExpanded] = useState(!long);
  const t = TONE[tone];

  const preview = long && !expanded ? reason.slice(0, threshold).trimEnd() + '…' : reason;

  return (
    <div className={`px-3 py-2 rounded-lg ${t.bg} border-l-2 ${t.border}`}>
      <p className="text-xs text-slate-700 break-keep leading-relaxed">
        <span className={`font-semibold ${t.label}`}>{label} · </span>
        {preview}
      </p>
      {long && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900"
          aria-expanded={expanded}
        >
          {expanded ? '접기' : '더 보기'}
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
