import React from 'react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { STORE_BASE_URL } from '@/data/storeProducts';

/**
 * 홈에서 보여줄 스토어 프로모 배너 (한 줄).
 * 카드 그리드 없이 헤더만 노출 — 클릭 시 외부 Cafe24 스토어로 이동.
 */
const StoreSection: React.FC = () => {
  const openStore = () => {
    window.open(STORE_BASE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <section>
      <div className="flex items-end justify-between">
        <button type="button" onClick={openStore} className="text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7a4d]">
            <ShoppingBag className="h-3.5 w-3.5" />
            추천 스토어
          </div>
          <h2 className="mt-1 text-[18px] font-bold text-slate-900 break-keep">
            우리 아이에게 꼭 맞는 발달 아이템 · 심리검사 패키지
          </h2>
        </button>
        <button
          type="button"
          onClick={openStore}
          className="flex items-center gap-0.5 text-[12px] font-medium text-slate-500"
        >
          전체보기
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
};

export default StoreSection;
