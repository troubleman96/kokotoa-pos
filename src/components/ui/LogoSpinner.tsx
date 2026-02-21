import { cn } from "@/lib/utils";

interface LogoSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const LogoSpinner = ({ size = "md", className, label = "Loading" }: LogoSpinnerProps) => {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <span className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)} role="status" aria-label={label}>
      <span className="absolute inset-0 rounded-full bg-primary/10 blur-sm" />
      <img
        src="/pos-kokotoa_faviconupdate/favicon.svg"
        alt="KOKOTOA loading"
        className="relative h-full w-full object-contain animate-spin"
        loading="eager"
      />
    </span>
  );
};

export default LogoSpinner;
