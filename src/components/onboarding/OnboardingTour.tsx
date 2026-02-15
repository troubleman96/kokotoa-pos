import { useEffect, useState } from 'react';
import { useOnboarding, TourStep } from '@/contexts/OnboardingContext';
import TourTooltip from './TourTooltip';
import TourOverlay from './TourOverlay';

interface OnboardingTourProps {
    page: string;
    steps: TourStep[];
    autoStart?: boolean;
}

const OnboardingTour = ({ page, steps, autoStart = true }: OnboardingTourProps) => {
    const { state, startTour, nextStep, previousStep, skipTour } = useOnboarding();
    const [elementPosition, setElementPosition] = useState<{
        top: number;
        left: number;
        width: number;
        height: number;
    } | null>(null);

    useEffect(() => {
        // Auto-start tour if enabled and conditions are met
        if (
            autoStart &&
            !state.hasCompletedOnboarding &&
            !state.completedPages.includes(page) &&
            state.hasSeenWelcome &&
            !state.showWelcome &&
            (!state.isActive || state.currentPage !== page)
        ) {
            const timer = setTimeout(() => {
                startTour(page, steps);
            }, 600); // Slightly longer delay for page transitions
            return () => clearTimeout(timer);
        }
    }, [autoStart, page, steps, state.hasCompletedOnboarding, state.completedPages, state.hasSeenWelcome, state.showWelcome, state.isActive, state.currentPage, startTour]);

    useEffect(() => {
        if (!state.isActive || !state.currentSteps || state.currentSteps.length === 0) {
            setElementPosition(null);
            return;
        }

        const currentStep = state.currentSteps[state.currentStep];
        if (!currentStep) return;

        // Run optional step side effects (e.g., open a tab) before measuring.
        if (currentStep.action) {
            currentStep.action();
        }

        let cancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;
        const maxRetries = 8;

        const measurePosition = () => {
            const element = document.querySelector(currentStep.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setElementPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                });
                return element;
            }
            return null;
        };

        const updatePosition = () => {
            measurePosition();
        };

        const focusCurrentStep = (attempt = 0) => {
            if (cancelled) return;
            const element = measurePosition();

            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
                // Re-measure after smooth scrolling completes inside nested scroll containers.
                setTimeout(() => {
                    if (!cancelled) {
                        updatePosition();
                    }
                }, 350);
                return;
            }

            if (attempt < maxRetries) {
                retryTimer = setTimeout(() => focusCurrentStep(attempt + 1), 250);
                return;
            }

            // Skip steps that cannot be rendered in the current UI state.
            nextStep();
        };

        focusCurrentStep();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            cancelled = true;
            if (retryTimer) clearTimeout(retryTimer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [state.isActive, state.currentStep, state.currentSteps, nextStep]);

    // Keyboard navigation
    useEffect(() => {
        if (!state.isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case 'Enter':
                    e.preventDefault();
                    nextStep();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (state.currentStep > 0) {
                        previousStep();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    skipTour();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.isActive, state.currentStep, nextStep, previousStep, skipTour]);

    if (!state.isActive || !state.currentSteps || state.currentSteps.length === 0 || state.currentPage !== page) {
        return null;
    }

    const currentStep = state.currentSteps[state.currentStep];

    return (
        <>
            <TourOverlay
                targetElement={currentStep.target}
                isActive={state.isActive}
            />
            <TourTooltip
                step={currentStep}
                currentStep={state.currentStep}
                totalSteps={state.currentSteps.length}
                onNext={nextStep}
                onPrevious={previousStep}
                onSkip={skipTour}
                position={elementPosition}
            />
        </>
    );
};

export default OnboardingTour;
