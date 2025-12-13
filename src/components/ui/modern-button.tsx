import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

const modernButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: 
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        secondary: 
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: 
          "border-2 border-border bg-transparent hover:bg-accent hover:border-primary/30",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground",
        gradient: 
          "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md hover:shadow-xl hover:scale-[1.02]",
        soft: 
          "bg-primary/10 text-primary hover:bg-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-lg",
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-10 px-5 text-sm rounded-xl",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-xl"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false
    }
  }
);

interface ModernButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    
    if (asChild) {
      return (
        <Slot 
          ref={ref} 
          className={cn(modernButtonVariants({ variant, size, fullWidth, className }))}
        >
          {children}
        </Slot>
      );
    }
    
    return (
      <motion.button
        ref={ref}
        className={cn(modernButtonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>처리 중...</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </motion.button>
    );
  }
);
ModernButton.displayName = "ModernButton";

export { ModernButton, modernButtonVariants };
