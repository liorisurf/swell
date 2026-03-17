import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#1B3A4B]",
        className
      )}
      {...props}
    />
  )
}
Skeleton.displayName = "Skeleton"

export { Skeleton }
