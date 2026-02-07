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

    useEffect(() => {
        // Execute step action if provided
        if (step.action) {
            step.action();
        }
    }, [step]);

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
            className="fixed z-[9999] animate-slide-up"
            style={{ top: `${top}px`, left: `${left}px`, width: `${tooltipWidth}px` }}
        >
            <div className="card-kokotoa rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-primary/20 relative">
                {arrowStyles && <div style={arrowStyles} />}

                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-1">
                                {Array.from({ length: totalSteps }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all ${i === currentStep
                                            ? 'w-6 bg-primary'
                                            : i < currentStep
                                                ? 'w-1.5 bg-primary/50'
                                                : 'w-1.5 bg-muted'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {currentStep + 1}/{totalSteps}
                            </span>
                        </div>
                        <h3 className="font-display font-bold text-base sm:text-lg text-foreground leading-tight">
                            {step.title[language]}
                        </h3>
                    </div>
                    <button
                        onClick={onSkip}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
                        aria-label={language === 'sw' ? 'Funga' : 'Close'}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    {step.content[language]}
                </p>

                {/* Actions - Improved for mobile */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}
                        disabled={currentStep === 0}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {language === 'sw' ? 'Rudi' : 'Back'}
                    </Button>

                    <div className="flex gap-2 order-1 sm:order-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSkip}
                            className="text-muted-foreground flex-1 sm:flex-initial"
                        >
                            {language === 'sw' ? 'Ruka' : 'Skip'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={onNext}
                            className="btn-kokotoa flex items-center justify-center gap-2 flex-1 sm:flex-initial min-w-[100px]"
                        >
                            {currentStep === totalSteps - 1
                                ? language === 'sw'
                                    ? 'Maliza'
                                    : 'Finish'
                                : language === 'sw'
                                    ? 'Endelea'
                                    : 'Next'}
                            {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourTooltip;
