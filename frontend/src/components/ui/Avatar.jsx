import { cn } from "@/utils/utils";
import { User } from "lucide-react";

export const Avatar = ({ src, fallback, size = "md", className }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-24 h-24 text-3xl",
  };

  const initials = fallback
    ? fallback.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : null;

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border-2 border-border/50 bg-bg-surface",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={fallback || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      
      {!src && initials && (
        <div className="flex h-full w-full items-center justify-center bg-bg-elevated text-text-primary font-medium">
          {initials}
        </div>
      )}

      {!src && !initials && (
        <div className="flex h-full w-full items-center justify-center bg-bg-elevated text-text-muted">
          <User className="h-1/2 w-1/2" />
        </div>
      )}
    </div>
  );
};
