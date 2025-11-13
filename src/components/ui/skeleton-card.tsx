import { Skeleton } from "./skeleton";
import { Card, CardContent } from "./card";

interface SkeletonCardProps {
  showHeader?: boolean;
  lines?: number;
  className?: string;
}

const SkeletonCard = ({ showHeader = true, lines = 3, className }: SkeletonCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        {showHeader && (
          <div className="space-y-2 mb-4">
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