import { cn } from "@/lib/utils";

interface MathLoaderProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    text?: string;
}

const MathLoader = ({ size = "md", className, text }: MathLoaderProps) => {
    const sizeClasses = {
        xs: "w-4 h-4 text-xs",
        sm: "w-6 h-6 text-sm",
        md: "w-8 h-8 text-base",
        lg: "w-12 h-12 text-2xl",
        xl: "w-16 h-16 text-4xl",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className={cn(
                "flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold animate-math-flicker shadow-glow",
                sizeClasses[size]
            )} />
            {text && (
                <span className="text-muted-foreground text-sm font-medium animate-pulse">
                    {text}
                </span>
            )}
        </div>
    );
};

export default MathLoader;
