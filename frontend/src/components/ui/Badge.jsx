import { cn } from "@/utils/utils"

export const Badge = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-bg-elevated text-text-secondary border-border",
    primary: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
    success: "bg-accent-green/10 text-accent-green border-accent-green/20",
    warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
    danger: "bg-accent-red/10 text-accent-red border-accent-red/20",
  }

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2", variants[variant], className)} {...props}>
      {children}
    </div>
  )
}
