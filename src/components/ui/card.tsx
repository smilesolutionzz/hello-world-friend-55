import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  visualWeight?: "heavy" | "medium" | "light" | "subtle"
  interactive?: boolean
  glassMorphism?: boolean
  floating?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, visualWeight = "medium", interactive = false, glassMorphism = false, floating = false, ...props }, ref) => {
    
    // Clean white-tone design system - glass effects deprecated for premium minimal look
    const weightClasses = {
      heavy: "bg-white shadow-xl border border-slate-200/70",
      medium: "bg-white shadow-md border border-slate-200/60",
      light: "bg-white shadow-sm border border-slate-200/50",
      subtle: "bg-white shadow-sm border border-slate-100"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl overflow-hidden transition-all duration-300",
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
