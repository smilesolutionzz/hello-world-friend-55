import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

// Visual Weight Typography Component
const typographyVariants = cva(
  "font-display", // Using display font for better visual weight
  {
    variants: {
      weight: {
        giant: "text-giant text-weight-heavy font-ultra",
        huge: "text-huge text-weight-bold font-heavy", 
        large: "text-large text-weight-bold font-bold",
        big: "text-big text-weight-medium font-semibold",
        medium: "text-medium text-weight-medium font-medium",
        normal: "text-normal text-weight-medium font-normal",
        small: "text-small text-weight-light font-normal",
        tiny: "text-tiny text-weight-light font-normal",
        micro: "text-micro text-weight-subtle font-light",
      },
      emphasis: {
        primary: "text-primary",
        secondary: "text-weight-bold",
        tertiary: "text-weight-medium",
        subtle: "text-weight-light",
        minimal: "text-weight-subtle",
      },
      balance: {
        center: "text-center",
        left: "text-left",
        right: "text-right",
        symmetric: "text-center mx-auto max-w-prose",
        asymmetric: "text-left",
      }
    },
    defaultVariants: {
      weight: "normal",
      emphasis: "secondary",
      balance: "left",
    },
  }
)

// Visual Container Component for Layout Balance
const containerVariants = cva(
  "relative",
  {
    variants: {
      hierarchy: {
        primary: "container-primary bg-white/90 backdrop-blur-lg",
        secondary: "container-secondary bg-white/70 backdrop-blur-md", 
        tertiary: "container-tertiary bg-white/50 backdrop-blur-sm",
        subtle: "p-md rounded-md bg-white/30",
      },
      interaction: {
        static: "",
        hover: "interactive-secondary",
        primary: "interactive-primary",
        subtle: "interactive-subtle",
      },
      balance: {
        symmetric: "visual-balance-symmetric",
        asymmetric: "visual-balance-asymmetric",
        centered: "flex flex-col items-center justify-center text-center",
        flowing: "space-y-lg",
      }
    },
    defaultVariants: {
      hierarchy: "secondary",
      interaction: "static",
      balance: "flowing",
    },
  }
)

// Enhanced Typography Component
export interface TypographyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof typographyVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"
}

const Typography = React.forwardRef<HTMLDivElement, TypographyProps>(
  ({ className, weight, emphasis, balance, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        className={cn(typographyVariants({ weight, emphasis, balance }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

// Visual Container Component
export interface VisualContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const VisualContainer = React.forwardRef<HTMLDivElement, VisualContainerProps>(
  ({ className, hierarchy, interaction, balance, ...props }, ref) => {
    return (
      <div
        className={cn(containerVariants({ hierarchy, interaction, balance }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
VisualContainer.displayName = "VisualContainer"

// Visual Weight Card Component
interface VisualCardProps extends React.HTMLAttributes<HTMLDivElement> {
  visualWeight?: "heavy" | "medium" | "light" | "subtle"
  interactive?: boolean
  floating?: boolean
}

const VisualCard = React.forwardRef<HTMLDivElement, VisualCardProps>(
  ({ className, visualWeight = "medium", interactive = false, floating = false, ...props }, ref) => {
    const weightClasses = {
      heavy: "card-glass-purple shadow-lg border-2",
      medium: "card-glass-blue shadow-md border",
      light: "card-glass-green shadow-sm border",
      subtle: "card-glass-yellow shadow-xs border-0"
    }
    
    return (
      <div
        className={cn(
          "card-glass",
          weightClasses[visualWeight],
          interactive && "interactive-primary cursor-pointer",
          floating && "animate-float hover-lift",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
VisualCard.displayName = "VisualCard"

// Enhanced Button with Visual Weight
const buttonVisualVariants = cva(
  "inline-flex items-center justify-center rounded-visual-secondary font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      visualWeight: {
        heavy: "text-huge font-ultra px-8 py-4 bg-primary-strong text-white shadow-lg hover:shadow-xl transform hover:scale-105",
        medium: "text-normal font-semibold px-6 py-3 bg-primary-medium text-white shadow-md hover:shadow-lg transform hover:scale-102",
        light: "text-small font-medium px-4 py-2 bg-primary-light text-white shadow-sm hover:shadow-md",
        subtle: "text-tiny font-normal px-3 py-1.5 bg-primary-subtle text-primary border border-primary/20 hover:bg-primary-light",
      },
      emphasis: {
        primary: "bg-primary hover:bg-primary/90",
        secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      }
    },
    defaultVariants: {
      visualWeight: "medium",
      emphasis: "primary",
    },
  }
)

export interface VisualButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVisualVariants> {
  asChild?: boolean
}

const VisualButton = React.forwardRef<HTMLButtonElement, VisualButtonProps>(
  ({ className, visualWeight, emphasis, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVisualVariants({ visualWeight, emphasis }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
VisualButton.displayName = "VisualButton"

export { 
  Typography, 
  VisualContainer, 
  VisualCard, 
  VisualButton,
  typographyVariants,
  containerVariants,
  buttonVisualVariants
}