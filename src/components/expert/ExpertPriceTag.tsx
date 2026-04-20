import { Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { calculateExpertPricing, EXPERT_BASE_PRICE, formatKRW } from '@/lib/expertPricing';
import { cn } from '@/lib/utils';

interface ExpertPriceTagProps {
  basePrice?: number;
  unitLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBadge?: boolean;
}

/**
 * 활성 구독 상태에 따라 자동으로 30%/50% 할인된 전문가 상담 가격을 표시합니다.
 */
export function ExpertPriceTag({
  basePrice = EXPERT_BASE_PRICE,
  unitLabel = '/40분',
  size = 'md',
  className,
  showBadge = true,
}: ExpertPriceTagProps) {
  const { subscription } = useSubscription();
  const pricing = calculateExpertPricing(subscription, basePrice);
  const hasDiscount = pricing.discountPercent > 0;

  const finalSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  const baseSize = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }[size];

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {hasDiscount && showBadge && (
        <div className="inline-flex items-center gap-1 self-start rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <Sparkles className="h-2.5 w-2.5" />
          {pricing.label}
        </div>
      )}
      <div className="flex items-baseline gap-1.5">
        {hasDiscount && (
          <span className={cn(baseSize, 'text-muted-foreground line-through')}>
            {formatKRW(pricing.base)}
          </span>
        )}
        <span className={cn(finalSize, 'font-bold', hasDiscount ? 'text-emerald-600' : 'text-foreground')}>
          {formatKRW(pricing.final)}
        </span>
        <span className="ml-0.5 text-xs text-muted-foreground">{unitLabel}</span>
      </div>
    </div>
  );
}
