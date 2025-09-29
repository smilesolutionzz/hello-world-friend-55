import * as React from "react"
import { cn } from "@/lib/utils"

// Visual Balance Grid System
interface VisualGridProps extends React.HTMLAttributes<HTMLDivElement> {
  balance?: "symmetric" | "asymmetric" | "golden" | "organic"
  visualFlow?: "top-heavy" | "bottom-heavy" | "center-focus" | "distributed"
  spacing?: "tight" | "comfortable" | "spacious" | "dramatic"
  responsive?: boolean
}

const VisualGrid = React.forwardRef<HTMLDivElement, VisualGridProps>(
  ({ 
    className, 
    balance = "symmetric", 
    visualFlow = "distributed",
    spacing = "comfortable",
    responsive = true,
    children,
    ...props 
  }, ref) => {
    
    const balanceClasses = {
      symmetric: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center",
      asymmetric: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 [&>:first-child]:col-span-2 [&>:first-child]:lg:col-span-3",
      golden: "grid grid-cols-1 md:grid-cols-8 [&>:first-child]:col-span-5 [&>:nth-child(2)]:col-span-3",
      organic: "grid grid-cols-1 md:grid-cols-12 [&>:nth-child(3n+1)]:col-span-7 [&>:nth-child(3n+2)]:col-span-5 [&>:nth-child(3n+3)]:col-span-12 md:[&>:nth-child(3n+3)]:col-span-8 md:[&>:nth-child(3n+3)]:col-start-3"
    }
    
    const flowClasses = {
      "top-heavy": "items-start",
      "bottom-heavy": "items-end", 
      "center-focus": "items-center",
      "distributed": "items-stretch"
    }
    
    const spacingClasses = {
      tight: "gap-xs md:gap-sm",
      comfortable: "gap-md md:gap-lg",
      spacious: "gap-lg md:gap-xl",
      dramatic: "gap-xl md:gap-2xl lg:gap-3xl"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          balanceClasses[balance],
          flowClasses[visualFlow],
          spacingClasses[spacing],
          responsive && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
VisualGrid.displayName = "VisualGrid"

// Visual Section with Hierarchy
interface VisualSectionProps extends React.HTMLAttributes<HTMLElement> {
  hierarchy?: "hero" | "primary" | "secondary" | "tertiary" | "footer"
  visualWeight?: "dominant" | "strong" | "medium" | "light" | "minimal"
  spacing?: "none" | "compact" | "comfortable" | "spacious" | "dramatic"
  background?: "solid" | "gradient" | "glass" | "transparent"
}

const VisualSection = React.forwardRef<HTMLElement, VisualSectionProps>(
  ({ 
    className, 
    hierarchy = "secondary",
    visualWeight = "medium",
    spacing = "comfortable",
    background = "transparent",
    children,
    ...props 
  }, ref) => {
    
    const hierarchyClasses = {
      hero: "min-h-screen flex items-center justify-center",
      primary: "py-4xl md:py-5xl",
      secondary: "py-3xl md:py-4xl", 
      tertiary: "py-2xl md:py-3xl",
      footer: "py-xl md:py-2xl mt-auto"
    }
    
    const weightClasses = {
      dominant: "relative z-30",
      strong: "relative z-20",
      medium: "relative z-10",
      light: "relative z-5",
      minimal: "relative z-0"
    }
    
    const spacingClasses = {
      none: "",
      compact: "px-sm md:px-md",
      comfortable: "px-md md:px-lg container mx-auto",
      spacious: "px-lg md:px-xl container mx-auto max-w-6xl",
      dramatic: "px-xl md:px-2xl container mx-auto max-w-4xl"
    }
    
    const backgroundClasses = {
      solid: "bg-background",
      gradient: "bg-modern",
      glass: "bg-white/10 backdrop-blur-2xl",
      transparent: ""
    }
    
    return (
      <section
        ref={ref}
        className={cn(
          hierarchyClasses[hierarchy],
          weightClasses[visualWeight],
          spacingClasses[spacing],
          backgroundClasses[background],
          className
        )}
        {...props}
      >
        {children}
      </section>
    )
  }
)
VisualSection.displayName = "VisualSection"

// Enhanced Header with Visual Hierarchy
interface VisualHeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean
  visualWeight?: "bold" | "medium" | "subtle"
  glassMorphism?: boolean
}

const VisualHeader = React.forwardRef<HTMLElement, VisualHeaderProps>(
  ({ 
    className, 
    sticky = false,
    visualWeight = "medium",
    glassMorphism = false,
    children,
    ...props 
  }, ref) => {
    
    const weightClasses = {
      bold: "h-20 md:h-24 shadow-lg border-b-2",
      medium: "h-16 md:h-20 shadow-md border-b",
      subtle: "h-14 md:h-16 shadow-sm border-b border-opacity-50"
    }
    
    return (
      <header
        ref={ref}
        className={cn(
          "w-full transition-all duration-300 z-50",
          sticky && "sticky top-0",
          glassMorphism && "bg-white/80 backdrop-blur-lg",
          !glassMorphism && "bg-background",
          weightClasses[visualWeight],
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-md h-full flex items-center justify-between">
          {children}
        </div>
      </header>
    )
  }
)
VisualHeader.displayName = "VisualHeader"

// Visual Content Flow
interface VisualFlowProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal" | "alternating"
  visualRhythm?: "regular" | "dynamic" | "organic" | "dramatic"
  emphasis?: "start" | "center" | "end" | "distributed"
}

const VisualFlow = React.forwardRef<HTMLDivElement, VisualFlowProps>(
  ({ 
    className,
    direction = "vertical",
    visualRhythm = "regular", 
    emphasis = "distributed",
    children,
    ...props 
  }, ref) => {
    
    const directionClasses = {
      vertical: "flex flex-col",
      horizontal: "flex flex-row flex-wrap",
      alternating: "grid grid-cols-1 md:grid-cols-2 [&>:nth-child(even)]:md:order-first"
    }
    
    const rhythmClasses = {
      regular: "space-y-lg",
      dynamic: "space-y-[clamp(1rem,4vw,3rem)]",
      organic: "[&>*:nth-child(3n+1)]:mb-2xl [&>*:nth-child(3n+2)]:mb-lg [&>*:nth-child(3n+3)]:mb-xl",
      dramatic: "space-y-3xl md:space-y-4xl lg:space-y-5xl"
    }
    
    const emphasisClasses = {
      start: "items-start justify-start",
      center: "items-center justify-center",
      end: "items-end justify-end", 
      distributed: "items-stretch justify-between"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          directionClasses[direction],
          rhythmClasses[visualRhythm],
          emphasisClasses[emphasis],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
VisualFlow.displayName = "VisualFlow"

export { 
  VisualGrid, 
  VisualSection, 
  VisualHeader, 
  VisualFlow 
}