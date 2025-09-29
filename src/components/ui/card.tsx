import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  visualWeight?: "heavy" | "medium" | "light" | "subtle"
  interactive?: boolean
  glassMorphism?: boolean
  floating?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, visualWeight = "medium", interactive = false, glassMorphism = true, floating = false, ...props }, ref) => {
    
    const weightClasses = {
      heavy: glassMorphism ? "card-glass-purple shadow-xl border-2" : "bg-white shadow-xl border-2 border-primary/20",
      medium: glassMorphism ? "card-glass-blue shadow-lg border" : "bg-white shadow-lg border border-border",
      light: glassMorphism ? "card-glass-green shadow-md border" : "bg-white shadow-md border border-border/50",
      subtle: glassMorphism ? "card-glass-yellow shadow-sm" : "bg-white/80 shadow-sm border-0"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-visual-secondary overflow-hidden transition-all duration-300",
          glassMorphism ? "card-glass" : "",
          weightClasses[visualWeight],
          interactive && "interactive-primary cursor-pointer",
          floating && "animate-float hover-lift",
          "animate-fade-in",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
