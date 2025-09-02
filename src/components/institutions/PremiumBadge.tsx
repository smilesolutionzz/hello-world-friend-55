import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  planType?: 'basic' | 'standard' | 'premium';
  features?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ 
  planType = 'basic', 
  features = [],
  className,
  size = 'md'
}: PremiumBadgeProps) {
  const isPremium = planType !== 'basic';
  const hasFeature = (feature: string) => features.includes(feature);

  if (!isPremium) {
    return null;
  }

  const getBadgeConfig = () => {
    switch (planType) {
      case 'premium':
        return {
          icon: Crown,
          text: '프리미엄',
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
          glow: 'shadow-yellow-400/50'
        };
      case 'standard':
        return {
          icon: Star,
          text: '스탠다드',
          variant: 'secondary' as const,
          className: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-md',
          glow: 'shadow-blue-400/50'
        };
      default:
        return {
          icon: Award,
          text: '인증됨',
          variant: 'outline' as const,
          className: 'border-primary text-primary',
          glow: ''
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex flex-wrap gap-1">
      {/* 메인 프리미엄 배지 */}
      <Badge 
        variant={config.variant}
        className={cn(
          'flex items-center gap-1 font-semibold animate-pulse-subtle',
          config.className,
          config.glow,
          sizeClasses[size],
          className
        )}
      >
        <Icon className={iconSizes[size]} />
        {config.text}
      </Badge>

      {/* 추가 기능 배지들 */}
      {hasFeature('priority_listing') && (
        <Badge variant="outline" className={cn(
          'bg-green-50 border-green-200 text-green-700',
          sizeClasses[size]
        )}>
          <Zap className={cn(iconSizes[size], 'mr-1')} />
          우선노출
        </Badge>
      )}

      {hasFeature('featured_badge') && (
        <Badge variant="outline" className={cn(
          'bg-purple-50 border-purple-200 text-purple-700',
          sizeClasses[size]
        )}>
          <Star className={cn(iconSizes[size], 'mr-1')} />
          추천기관
        </Badge>
      )}

      {hasFeature('analytics_dashboard') && (
        <Badge variant="outline" className={cn(
          'bg-blue-50 border-blue-200 text-blue-700',
          sizeClasses[size]
        )}>
          분석
        </Badge>
      )}
    </div>
  );
}