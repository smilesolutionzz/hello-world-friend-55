import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Search, ShoppingCart } from 'lucide-react';
import {
  STORE_BASE_URL,
  STORE_CATEGORIES,
  STORE_PRODUCTS,
  type StoreCategory,
} from '@/data/storeProducts';
import StoreProductCard from '@/components/store/StoreProductCard';

/**
 * /store — 큐레이션 스토어 페이지
 * - 모든 상품 클릭은 smilezzsolution.cafe24.com 의 해당 상품/카테고리 페이지로 외부 이동
 * - 결제·배송·재고는 Cafe24가 책임
 */
const Store: React.FC = () => {
  const [active, setActive] = useState<StoreCategory | 'all'>('all');
  const [q, setQ] = useState('');

  const products = useMemo(() => {
    let list = STORE_PRODUCTS;
    if (active !== 'all') list = list.filter((p) => p.category === active);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(k) || (p.tags ?? []).some((t) => t.toLowerCase().includes(k)),
      );
    }
    return list;
  }, [active, q]);

  return (
    <main id="main-content" className="min-h-screen w-full bg-white text-slate-900 break-keep pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/home" aria-label="뒤로" className="-ml-1 p-1.5">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Link>
            <h1 className="text-[22px] font-bold tracking-tight">스토어</h1>
          </div>
          <a
            href={STORE_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="장바구니"
            className="p-1.5 relative"
          >
            <ShoppingCart className="h-5 w-5 text-slate-700" />
          </a>
        </div>

        {/* 검색 */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="상품·키워드 검색"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
          />
        </div>

        {/* 카테고리 탭 */}
        <div className="-mx-5 mt-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            <TabChip label="전체" active={active === 'all'} onClick={() => setActive('all')} />
            {STORE_CATEGORIES.map((c) => (
              <TabChip
                key={c.key}
                label={c.label}
                active={active === c.key}
                onClick={() => setActive(c.key)}
              />
            ))}
          </div>
        </div>
      </header>

      {/* 안내 배너 */}
      <div className="mx-5 mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 p-4">
        <p className="text-[12px] font-semibold text-[#8a7a4d]">파트너 스토어 연동</p>
        <p className="mt-1 text-[14px] font-bold leading-snug text-slate-900">
          AIHPRO가 큐레이션한 발달 아이템
        </p>
        <p className="mt-1 text-[12px] text-slate-600">
          결제·배송은 파트너 스토어에서 안전하게 진행됩니다.
        </p>
        <a
          href={STORE_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-900 underline-offset-2 hover:underline"
        >
          파트너 스토어 바로가기 <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* 상품 그리드 */}
      <section className="px-5 mt-5">
        {products.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-slate-400">
            조건에 맞는 상품이 없어요.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6">
            {products.map((p) => (
              <StoreProductCard key={p.id} product={p} className="!w-full" />
            ))}
          </div>
        )}
      </section>

      {/* 푸터 노트 */}
      <p className="mt-10 px-5 text-center text-[11px] text-slate-400">
        본 스토어의 결제·배송·교환·환불은 파트너사(smilezzsolution.cafe24.com) 정책을 따릅니다.
      </p>
    </main>
  );
};

const TabChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
      active
        ? 'bg-slate-900 text-white'
        : 'bg-white text-slate-600 border border-slate-200'
    }`}
  >
    {label}
  </button>
);

export default Store;
