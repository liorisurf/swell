import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:ring-offset-2 focus:ring-offset-[#0D1B2A]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#00A896] text-white",
        secondary:
          "border-transparent bg-[#1B3A4B] text-[#94A3B8]",
        outline: "border-[#2D4A5E] text-white",
        success:
          "border-transparent bg-[#10B981]/10 text-[#10B981]",
        warning:
          "border-transparent bg-[#F59E0B]/10 text-[#F59E0B]",
        danger:
          "border-transparent bg-[#EF4444]/10 text-[#EF4444]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
