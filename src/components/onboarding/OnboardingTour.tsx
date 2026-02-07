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
    const { state, startTour, nextStep, previousStep, skipTour, currentSteps } = useOnboarding();
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
            !state.showWelcome
        ) {
            const timer = setTimeout(() => {
                startTour(page, steps);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoStart, page, steps, state.hasCompletedOnboarding, state.completedPages, state.hasSeenWelcome, state.showWelcome, startTour]);

    useEffect(() => {
        if (!state.isActive || currentSteps.length === 0) {
            setElementPosition(null);
            return;
        }

        const currentStep = currentSteps[state.currentStep];
        if (!currentStep) return;

        const updatePosition = () => {
            const element = document.querySelector(currentStep.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setElementPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                });

                // Scroll element into view if needed
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [state.isActive, state.currentStep, currentSteps]);

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

    if (!state.isActive || currentSteps.length === 0 || state.currentPage !== page) {
        return null;
    }

    const currentStep = currentSteps[state.currentStep];

    return (
        <>
            <TourOverlay
                targetElement={currentStep.target}
                isActive={state.isActive}
            />
            <TourTooltip
                step={currentStep}
                currentStep={state.currentStep}
                totalSteps={currentSteps.length}
                onNext={nextStep}
                onPrevious={previousStep}
                onSkip={skipTour}
                position={elementPosition}
            />
        </>
    );
};

export default OnboardingTour;
