import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface ModernCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "glass" | "gradient" | "bordered" | "elevated";
  hover?: "lift" | "glow" | "scale" | "none";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children?: React.ReactNode;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ 
    className, 
    variant = "default", 
    hover = "lift",
    padding = "md",
    rounded = "2xl",
    children,
    ...props 
  }, ref) => {
    
    const variantClasses = {
      default: "bg-card border border-border/50",
      glass: "bg-background/60 backdrop-blur-xl border border-border/30",
      gradient: "bg-gradient-to-br from-card via-card to-secondary/30 border border-border/30",
      bordered: "bg-card border-2 border-border",
      elevated: "bg-card shadow-lg border-0"
    };
    
    const hoverClasses = {
      lift: "hover:-translate-y-1 hover:shadow-xl",
      glow: "hover:shadow-[var(--glow-primary)]",
      scale: "hover:scale-[1.02]",
      none: ""
    };
    
    const paddingClasses = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10"
    };
    
    const roundedClasses = {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-2xl",
      xl: "rounded-3xl",
      "2xl": "rounded-[2rem]",
      "3xl": "rounded-[2.5rem]"
    };
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "transition-all duration-300 ease-out",
          variantClasses[variant],
          hoverClasses[hover],
          paddingClasses[padding],
          roundedClasses[rounded],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ModernCard.displayName = "ModernCard";

// Feature Card - 기능 소개용
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  accentColor?: "blue" | "green" | "purple" | "orange" | "pink";
  className?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon, title, description, badge, accentColor = "blue" }, ref) => {
    const accentClasses = {
      blue: "from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50",
      green: "from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/50",
      purple: "from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50",
      orange: "from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/50",
      pink: "from-pink-500/10 to-pink-600/5 border-pink-200/50 dark:border-pink-800/50"
    };
    
    const iconBgClasses = {
      blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      green: "bg-green-500/10 text-green-600 dark:text-green-400",
      purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400"
    };
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative p-6 rounded-2xl",
          "bg-gradient-to-br border",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1 hover:shadow-lg",
          accentClasses[accentColor],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {badge && (
          <span className="absolute top-4 right-4 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
            {badge}
          </span>
        )}
        
        <div className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4",
          iconBgClasses[accentColor]
        )}>
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </motion.div>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

// Stats Card - 통계 표시용
interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, value, label, icon, trend }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative p-6 rounded-2xl bg-card border border-border/50",
          "hover:border-primary/30 transition-all duration-300",
          className
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        
        <div className="text-3xl font-bold text-foreground mb-1">
          {value}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {label}
        </div>
      </motion.div>
    );
  }
);
StatsCard.displayName = "StatsCard";

export { ModernCard, FeatureCard, StatsCard };
