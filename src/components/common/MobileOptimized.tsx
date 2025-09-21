import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "w-full max-w-full overflow-x-hidden",
      "safe-area-pt safe-area-pb safe-area-pl safe-area-pr",
      "min-h-screen flex flex-col",
      className
    )}>
      {children}
    </div>
  );
};

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-card text-card-foreground rounded-lg shadow-sm border",
      "p-3 sm:p-4 lg:p-6",
      "w-full",
      className
    )}>
      {children}
    </div>
  );
};

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const MobileButton: React.FC<MobileButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = "w-full sm:w-auto inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({ 
  children, 
  cols = 2, 
  gap = 'md',
  className 
}) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-2 lg:grid-cols-4"
  };
  
  const gapClasses = {
    sm: "gap-2",
    md: "gap-3 sm:gap-4",
    lg: "gap-4 sm:gap-6"
  };

  return (
    <div className={cn(
      "grid",
      colClasses[cols],
      gapClasses[gap],
      "w-full",
      className
    )}>
      {children}
    </div>
  );
};