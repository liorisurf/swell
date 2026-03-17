import * as React from "react"
import { Shield } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SafetyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

const SafetyBadge = React.forwardRef<HTMLDivElement, SafetyBadgeProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-sm text-[#10B981]",
          className
        )}
        {...props}
      >
        <Shield className="h-4 w-4 shrink-0" />
        <span>All actions are manual. Your account is always safe.</span>
      </div>
    )
  }
)
SafetyBadge.displayName = "SafetyBadge"

export { SafetyBadge }
