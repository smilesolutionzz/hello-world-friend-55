import { cva, type VariantProps } from "class-variance-authority";

/**
 * Primary CTA Button Variants
 * Phase 1: CTA 명확화를 위한 버튼 변형 시스템
 */
export const primaryCTAVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        // Primary CTA - 페이지당 1개만 사용
        primary: [
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/25",
          "hover:bg-primary-strong hover:shadow-xl hover:shadow-primary/30",
          "hover:scale-105 hover:-translate-y-0.5",
          "active:scale-100 active:translate-y-0",
        ],
        // Secondary CTA - 보조 액션
        secondary: [
          "border-2 border-primary bg-background text-primary",
          "hover:bg-primary/5 hover:border-primary-strong",
          "hover:scale-102",
        ],
        // Ghost - 미묘한 액션
        ghost: [
          "text-foreground hover:bg-muted",
          "hover:text-primary",
        ],
        // Destructive - 삭제/취소 액션
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
        ],
      },
      size: {
        // Large - Primary CTA 전용
        lg: "h-14 px-8 py-4 text-base",
        // Medium - 일반 버튼
        md: "h-11 px-6 py-3 text-sm",
        // Small - 인라인 액션
        sm: "h-9 px-4 py-2 text-xs",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export type PrimaryCTAVariants = VariantProps<typeof primaryCTAVariants>;
