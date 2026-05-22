import React from 'react';
import { Heart, Star } from 'lucide-react';
import type { StoreProduct } from '@/data/storeProducts';

interface Props {
  product: StoreProduct;
  className?: string;
  onClick?: (p: StoreProduct) => void;
}

/**
 * 키즈노트 스타일 상품 카드.
 * 클릭 시 외부 Cafe24 상품 페이지를 새 창으로 연다 (rel=noopener).
 */
export const StoreProductCard: React.FC<Props> = ({ product, className, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(product);
    try {
      // analytics hook (no-op if not wired)
      window.dispatchEvent(new CustomEvent('store_product_click', { detail: { id: product.id, name: product.name } }));
    } catch {}
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`group block w-[160px] sm:w-[180px] shrink-0 ${className ?? ''}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-active:scale-[0.98]"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          aria-label="찜하기"
          className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur"
        >
          <Heart className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      <div className="mt-2 px-0.5">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-slate-800 break-keep">
          {product.name}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          {product.discountPercent ? (
            <span className="text-[13px] font-bold text-rose-500">{product.discountPercent}%</span>
          ) : null}
          <span className="text-[14px] font-bold text-slate-900">
            {product.price.toLocaleString()}원
          </span>
        </div>
        {product.rating !== undefined && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            {product.reviewCount !== undefined && (
              <span className="text-slate-400">· 리뷰 {product.reviewCount}</span>
            )}
          </div>
        )}
      </div>
    </a>
  );
};

export default StoreProductCard;
