import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import LiteCTAContent from './LiteCTAContent';

const SESSION_KEY = 'aihpro:lite-cta-modal-shown';
const NEVER_KEY = 'aihpro:lite-cta-modal-never';

/**
 * LiteCTAModal — 메인 진입 시 자동으로 뜨는 "발달체크" CTA 모달.
 * - 세션당 1회만 자동 오픈
 * - "다시 보지 않기" 체크 시 영구 차단 (플로팅 버튼도 숨김)
 * - ?cta=1 쿼리로 강제 오픈 가능 (영구 차단도 무시)
 */
const LiteCTAModal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [neverShow, setNeverShow] = useState(false);

  useEffect(() => {
    const force = searchParams.get('cta') === '1';
    let shown = false;
    let never = false;
    try {
      shown = localStorage.getItem(SESSION_KEY) === '1';
      never = localStorage.getItem(NEVER_KEY) === '1';
    } catch {}
    setNeverShow(never);
    if (force) {
      const t = setTimeout(() => setOpen(true), 250);
      return () => clearTimeout(t);
    }
    if (!shown && !never) {
      const t = setTimeout(() => setOpen(true), 250);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(SESSION_KEY, '1');
        if (dontShowAgain) {
          localStorage.setItem(NEVER_KEY, '1');
          setNeverShow(true);
        }
      } catch {}
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-0 bg-white">
          <LiteCTAContent modal onDismiss={() => handleOpenChange(false)} />
          <label className="flex items-center justify-center gap-2 py-3 px-4 text-[12px] text-slate-500 border-t border-slate-100 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 accent-slate-900"
            />
            다시 보지 않기
          </label>
        </DialogContent>
      </Dialog>

      {/* 닫은 뒤 다시 열기 위한 플로팅 버튼 (영구 차단 시 숨김) */}
      {!open && !neverShow && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="발달체크 다시 보기"
          className="fixed z-40 right-4 bottom-[88px] md:bottom-6 inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-3 text-[13px] font-semibold shadow-lg active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4" />
          1분 발달체크
        </button>
      )}
    </>
  );
};

export default LiteCTAModal;
