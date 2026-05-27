import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MIND_TRACK_FOCUSES } from '@/lib/mindTrackFocusTracks';
import { MIND_TRACK_7_PRICE } from '@/constants/tokenCosts';

interface StickyTrackCTAProps {
  selectedGoal: string | null;
  loading?: boolean;
  onStart: () => void;
}

/**
 * 하단 고정 결제 바 — 트랙 선택 시 노출
 * 모바일 풀폭, 데스크톱은 max-w-2xl 중앙
 */
const StickyTrackCTA: React.FC<StickyTrackCTAProps> = ({
  selectedGoal,
  loading,
  onStart,
}) => {
  if (!selectedGoal) return null;
  const focus = MIND_TRACK_FOCUSES.find((f) => f.id === selectedGoal);
  if (!focus) return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 px-3 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="mx-auto max-w-2xl pointer-events-auto bg-white border border-slate-200 shadow-2xl rounded-2xl px-3 py-2.5 flex items-center gap-3">
        <span className="text-2xl shrink-0">{focus.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-slate-400 leading-tight">
            선택한 트랙
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {focus.label}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-emerald-600 font-semibold leading-tight">베타 7일 무료</div>
          <div className="text-[10px] text-slate-400 leading-tight line-through">
            ₩{MIND_TRACK_7_PRICE.toLocaleString()}
          </div>
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={loading}
          className="shrink-0 h-11 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold inline-flex items-center gap-1.5 hover:bg-slate-800 transition-colors disabled:opacity-60"
        >
          {loading ? '...' : (
            <>
              무료 시작
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StickyTrackCTA;
