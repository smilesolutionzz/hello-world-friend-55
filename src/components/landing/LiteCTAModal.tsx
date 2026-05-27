import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import LiteCTAContent from './LiteCTAContent';

const STORAGE_KEY = 'aihpro:lite-cta-modal-shown';

/**
 * LiteCTAModal — 메인 진입 시 자동으로 뜨는 "발달체크" CTA 모달.
 * - 세션당 1회만 자동 오픈 (localStorage)
 * - ?cta=1 쿼리로 강제 오픈 가능
 * - 닫은 후에는 우하단 플로팅 버튼으로 다시 열 수 있음
 */
const LiteCTAModal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const force = searchParams.get('cta') === '1';
    let shown = false;
    try {
      shown = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {}
    if (force || !shown) {
      // 살짝 지연시켜 첫 페인트 깜빡임 방지
      const t = setTimeout(() => setOpen(true), 250);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-0 bg-white">
          <LiteCTAContent modal onDismiss={() => handleOpenChange(false)} />
        </DialogContent>
      </Dialog>

      {/* 닫은 뒤 다시 열기 위한 플로팅 버튼 */}
      {!open && (
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
