import React from 'react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { STORE_PRODUCTS, STORE_BASE_URL } from '@/data/storeProducts';
import StoreProductCard from './StoreProductCard';

/**
 * 홈에서 보여줄 큐레이션 스토어 섹션.
 * 키즈노트 '어디가지' 톤을 차용 — 가로 스크롤 카드 + 더보기.
 * 헤더/전체보기 클릭 시 외부 Cafe24 스토어로 이동.
 */
const StoreSection: React.FC = () => {
  // 모바일은 가로 스크롤 5개, PC는 그리드로 전체 노출(빈칸 방지)
  const mobileItems = STORE_PRODUCTS.slice(0, 5);
  const desktopItems = STORE_PRODUCTS; // 발달 아이템 + 심리검사 패키지 전체

  const openStore = () => {
    window.open(STORE_BASE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <button
          type="button"
          onClick={openStore}
          className="text-left"
        >
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

      {/* 모바일 — 가로 스크롤 */}
      <div className="-mx-5 overflow-x-auto no-scrollbar md:hidden">
        <div className="flex gap-3 px-5 pb-1">
          {mobileItems.map((p) => (
            <StoreProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* PC — 빈칸 없도록 반응형 그리드(전체 노출) */}
      <div className="hidden md:grid gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {desktopItems.map((p) => (
          <StoreProductCard key={p.id} product={p} fullWidth />
        ))}
      </div>
    </section>
  );
};

export default StoreSection;

