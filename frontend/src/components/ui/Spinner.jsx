import { cn } from "@/utils/utils";

export const Spinner = ({ size = "md", className }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-accent-primary border-r-transparent border-b-accent-primary/30 border-l-transparent",
          sizes[size]
        )}
      />
    </div>
  );
};

export const FullPageSpinner = () => (
  <div className="fixed inset-0 min-h-screen z-50 flex flex-col items-center justify-center bg-bg-base/80 backdrop-blur-md">
    <Spinner size="lg" className="mb-4" />
    <span className="text-text-secondary font-medium tracking-widest text-sm uppercase">Loading...</span>
  </div>
);
