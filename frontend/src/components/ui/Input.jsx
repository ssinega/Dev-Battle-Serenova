import { forwardRef } from "react"
import { cn } from "@/utils/utils"

export const Input = forwardRef(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary",
          "ring-offset-bg-base file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && "border-accent-red focus-visible:ring-accent-red",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}
    </div>
  )
})
Input.displayName = "Input"
