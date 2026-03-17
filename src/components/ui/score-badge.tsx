import * as React from "react"

import { cn } from "@/lib/utils"

export interface ScoreBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number
  label?: string
}

const ScoreBadge = React.forwardRef<HTMLDivElement, ScoreBadgeProps>(
  ({ className, score, label, ...props }, ref) => {
    const getColorClasses = (value: number) => {
      if (value >= 70) return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
      if (value >= 40) return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
      return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          getColorClasses(score),
          className
        )}
        {...props}
      >
        <span>{score}</span>
        {label && <span className="opacity-80">{label}</span>}
      </div>
    )
  }
)
ScoreBadge.displayName = "ScoreBadge"

export { ScoreBadge }
