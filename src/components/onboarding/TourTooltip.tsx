import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { TourStep } from '@/contexts/OnboardingContext';

interface TourTooltipProps {
    step: TourStep;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    position: { top: number; left: number; width: number; height: number } | null;
}

const TourTooltip = ({
    step,
    currentStep,
    totalSteps,
    onNext,
    onPrevious,
    onSkip,
    position,
}: TourTooltipProps) => {
    const { language } = useLanguage();
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!position) return null;

    const getTooltipPosition = () => {
        const tooltipWidth = isMobile ? Math.min(340, window.innerWidth - 32) : 380;
        const tooltipHeight = 250;
        const padding = 16;
        const arrowSize = 12;

        let top = 0;
        let left = 0;
        let arrowPosition = '';

        // On mobile, always position at bottom of screen for better accessibility
        if (isMobile) {
            top = window.innerHeight - tooltipHeight - padding;
            left = (window.innerWidth - tooltipWidth) / 2;
            arrowPosition = 'none';
        } else {
            switch (step.position) {
                case 'top':
                    top = position.top - tooltipHeight - arrowSize - padding;
                    left = position.left + position.width / 2 - tooltipWidth / 2;
                    arrowPosition = 'bottom';
                    break;
                case 'bottom':
                    top = position.top + position.height + arrowSize + padding;
                    left = position.left + position.width / 2 - tooltipWidth / 2;
                    arrowPosition = 'top';
                    break;
                case 'left':
                    top = position.top + position.height / 2 - tooltipHeight / 2;
                    left = position.left - tooltipWidth - arrowSize - padding;
                    arrowPosition = 'right';
                    break;
                case 'right':
                    top = position.top + position.height / 2 - tooltipHeight / 2;
                    left = position.left + position.width + arrowSize + padding;
                    arrowPosition = 'left';
                    break;
                case 'center':
                    top = window.innerHeight / 2 - tooltipHeight / 2;
                    left = window.innerWidth / 2 - tooltipWidth / 2;
                    arrowPosition = 'none';
                    break;
            }

            // Ensure tooltip stays within viewport
            const maxLeft = window.innerWidth - tooltipWidth - padding;
            const maxTop = window.innerHeight - tooltipHeight - padding;
            left = Math.max(padding, Math.min(left, maxLeft));
            top = Math.max(padding, Math.min(top, maxTop));
        }

        return { top, left, arrowPosition, tooltipWidth };
    };

    const { top, left, arrowPosition, tooltipWidth } = getTooltipPosition();

    const getArrowStyles = () => {
        if (isMobile) return null; // No arrow on mobile

        const arrowSize = 12;
        const baseStyles = {
            position: 'absolute' as const,
            width: 0,
            height: 0,
            borderStyle: 'solid' as const,
        };

        switch (arrowPosition) {
            case 'top':
                return {
                    ...baseStyles,
                    top: -arrowSize,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
                    borderColor: 'transparent transparent hsl(var(--card)) transparent',
                };
            case 'bottom':
                return {
                    ...baseStyles,
                    bottom: -arrowSize,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
                    borderColor: 'hsl(var(--card)) transparent transparent transparent',
                };
            case 'left':
                return {
                    ...baseStyles,
                    left: -arrowSize,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
                    borderColor: 'transparent hsl(var(--card)) transparent transparent',
                };
            case 'right':
                return {
                    ...baseStyles,
                    right: -arrowSize,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
                    borderColor: 'transparent transparent transparent hsl(var(--card))',
                };
            default:
                return null;
        }
    };

    const arrowStyles = getArrowStyles();

    return (
        <div
            ref={tooltipRef}
            className="fixed z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{ top: `${top}px`, left: `${left}px`, width: `${tooltipWidth}px` }}
        >
            <div className="bg-card/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-primary/20 relative">
                {arrowStyles && <div style={arrowStyles} />}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex gap-1.5">
                                {Array.from({ length: totalSteps }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep
                                            ? 'w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'
                                            : i < currentStep
                                                ? 'w-1.5 bg-primary/40'
                                                : 'w-1.5 bg-muted-foreground/20'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                {currentStep + 1} of {totalSteps}
                            </span>
                        </div>
                        <h3 className="font-display font-black text-lg sm:text-xl text-foreground leading-tight tracking-tight">
                            {step.title[language]}
                        </h3>
                    </div>
                    <button
                        onClick={onSkip}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-muted/50 rounded-lg flex-shrink-0"
                        aria-label={language === 'sw' ? 'Funga' : 'Close'}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base font-medium">
                    {step.content[language]}
                </p>

                {/* Actions - Improved for mobile with better visual hierarchy */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onPrevious}
                        disabled={currentStep === 0}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1 hover:bg-primary/5 text-muted-foreground disabled:opacity-30"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {language === 'sw' ? 'Rudi' : 'Back'}
                    </Button>

                    <div className="flex gap-2 order-1 sm:order-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSkip}
                            className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 flex-1 sm:flex-initial text-xs uppercase tracking-widest font-bold"
                        >
                            {language === 'sw' ? 'Ruka' : 'Skip'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={onNext}
                            className="btn-kokotoa flex items-center justify-center gap-2 flex-1 sm:flex-initial min-w-[110px] shadow-[0_8px_20px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_25px_rgba(var(--primary),0.4)] transition-all active:scale-95"
                        >
                            <span className="font-bold">
                                {currentStep === totalSteps - 1
                                    ? language === 'sw'
                                        ? 'Maliza'
                                        : 'Finish'
                                    : language === 'sw'
                                        ? 'Endelea'
                                        : 'Next'}
                            </span>
                            {currentStep < totalSteps - 1 ? (
                                <ChevronRight className="w-4 h-4 animate-pulse" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourTooltip;
