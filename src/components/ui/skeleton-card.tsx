import { Skeleton } from "./skeleton";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  showHeader?: boolean;
  lines?: number;
  className?: string;
  variant?: "default" | "institution" | "expert" | "compact";
}

/**
 * SkeletonCard - Phase 1 개선: 다양한 로딩 상태 지원
 * 8px 그리드 시스템 적용
 */
const SkeletonCard = ({ 
  showHeader = true, 
  lines = 3, 
  className,
  variant = "default" 
}: SkeletonCardProps) => {
  
  // Institution card skeleton
  if (variant === "institution") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6 space-y-4">
          {/* Header with image */}
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          
          {/* Action button */}
          <Skeleton className="h-11 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  // Expert card skeleton
  if (variant === "expert") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6 space-y-4">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Details */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          
          {/* Price and button */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Compact skeleton
  if (variant === "compact") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>
    );
  }
  
  // Default skeleton
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 space-y-4">
        {showHeader && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { SkeletonCard };