import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg rounded-visual-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg rounded-visual-secondary",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-visual-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-visual-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-visual-tertiary",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
        
        // Enhanced variants with visual weight
        primary: "bg-primary-strong text-white hover:bg-primary font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 rounded-visual-primary",
        hero: "bg-gradient-to-r from-primary to-primary-glow text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 rounded-visual-primary",
        glass: "bg-white/20 text-white border border-white/30 backdrop-blur-lg hover:bg-white/30 rounded-visual-secondary",
        elevated: "bg-white text-primary shadow-lg hover:shadow-xl border border-primary/10 transform hover:scale-102 rounded-visual-secondary",
        subtle: "bg-primary-subtle text-primary border border-primary/20 hover:bg-primary-light rounded-visual-tertiary",
      },
      size: {
        default: "h-10 px-4 py-2 text-normal",
        sm: "h-8 px-3 py-1.5 text-small rounded-visual-tertiary",
        lg: "h-12 px-6 py-3 text-medium",
        xl: "h-14 px-8 py-4 text-big font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      weight: {
        light: "font-light",
        normal: "font-normal", 
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "medium",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  visualEffect?: "none" | "glow" | "float" | "pulse"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, weight, asChild = false, visualEffect = "none", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const effectClasses = {
      none: "",
      glow: "animate-glow",
      float: "animate-float",
      pulse: "animate-visual-emphasis"
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, weight }), 
          effectClasses[visualEffect],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
