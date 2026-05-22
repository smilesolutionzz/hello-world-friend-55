import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { STORE_PRODUCTS } from '@/data/storeProducts';
import StoreProductCard from './StoreProductCard';

/**
 * 홈에서 보여줄 큐레이션 스토어 섹션.
 * 키즈노트 '어디가지' 톤을 차용 — 가로 스크롤 카드 + 더보기.
 */
const StoreSection: React.FC = () => {
  const items = STORE_PRODUCTS.slice(0, 5);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8a7a4d]">
            <ShoppingBag className="h-3.5 w-3.5" />
            추천 스토어
          </div>
          <h2 className="mt-1 text-[18px] font-bold text-slate-900 break-keep">
            우리 아이에게 꼭 맞는 발달 아이템
          </h2>
        </div>
        <Link
          to="/store"
          className="flex items-center gap-0.5 text-[12px] font-medium text-slate-500"
        >
          전체보기
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-5 pb-1">
          {items.map((p) => (
            <StoreProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreSection;
