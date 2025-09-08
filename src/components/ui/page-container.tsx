import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import ErrorBoundary from "./error-boundary";
import { LoadingSpinner } from "./loading-spinner";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  error?: Error | null;
  title?: string;
  description?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const PageContainer = ({ 
  children, 
  className, 
  loading = false,
  error,
  title,
  description,
  maxWidth = "lg"
}: PageContainerProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full"
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    throw error; // Let ErrorBoundary handle it
  }

  return (
    <ErrorBoundary>
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30",
        className
      )}>
        <div className={cn(
          "container mx-auto px-4 py-8",
          maxWidthClasses[maxWidth]
        )}>
          {(title || description) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-3xl md:text-4xl font-bold text-brand-gradient mb-4">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export { PageContainer };