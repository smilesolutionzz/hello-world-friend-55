import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ModernSectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "gradient" | "dark";
  spacing?: "sm" | "md" | "lg" | "xl" | "2xl";
  container?: boolean;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
}

const ModernSection = React.forwardRef<HTMLElement, ModernSectionProps>(
  ({ 
    className, 
    variant = "default",
    spacing = "lg",
    container = true,
    containerSize = "lg",
    children,
    ...props 
  }, ref) => {
    
    const variantClasses = {
      default: "bg-background",
      muted: "bg-muted/30",
      gradient: "bg-gradient-to-b from-background via-muted/20 to-background",
      dark: "bg-foreground text-background"
    };
    
    const spacingClasses = {
      sm: "py-12 md:py-16",
      md: "py-16 md:py-20",
      lg: "py-20 md:py-28",
      xl: "py-28 md:py-36",
      "2xl": "py-36 md:py-48"
    };
    
    const containerSizeClasses = {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full"
    };
    
    return (
      <section
        ref={ref}
        className={cn(
          variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {container ? (
          <div className={cn(
            "container mx-auto px-4 md:px-6",
            containerSizeClasses[containerSize]
          )}>
            {children}
          </div>
        ) : children}
      </section>
    );
  }
);
ModernSection.displayName = "ModernSection";

// Section Header - 섹션 타이틀용
interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, badge, title, description, align = "center" }, ref) => {
    const alignClasses = {
      left: "text-left items-start",
      center: "text-center items-center",
      right: "text-right items-end"
    };
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 mb-12 md:mb-16",
          alignClasses[align],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {badge && (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full">
            {badge}
          </span>
        )}
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
          {title}
        </h2>
        
        {description && (
          <p className={cn(
            "text-base md:text-lg text-muted-foreground leading-relaxed",
            align === "center" ? "max-w-2xl" : "max-w-xl"
          )}>
            {description}
          </p>
        )}
      </motion.div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { ModernSection, SectionHeader };
