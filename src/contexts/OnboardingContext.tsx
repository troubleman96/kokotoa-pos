import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface TourStep {
    id: string;
    target: string;
    title: { sw: string; en: string };
    content: { sw: string; en: string };
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: () => void;
    nextPage?: string;
}

interface OnboardingState {
    isActive: boolean;
    currentStep: number;
    currentPage: string;
    completedPages: string[];
    hasSeenWelcome: boolean;
    hasCompletedOnboarding: boolean;
    showWelcome: boolean;
    currentSteps: TourStep[];
}

interface OnboardingContextType {
    state: OnboardingState;
    startTour: (page: string, steps: TourStep[]) => void;
    nextStep: () => void;
    previousStep: () => void;
    skipTour: () => void;
    completeTour: () => void;
    restartOnboarding: () => void;
    dismissWelcome: () => void;
    acceptWelcome: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'kokotoa_onboarding';

const safeGetLocalStorage = (key: string) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSetLocalStorage = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore localStorage write failures in restricted browsers.
    }
};

const getStoredState = (): Partial<OnboardingState> => {
    try {
        const stored = safeGetLocalStorage(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const saveState = (state: Partial<OnboardingState>) => {
    try {
        const current = getStoredState();
        safeSetLocalStorage(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
    } catch (error) {
        console.error('Failed to save onboarding state:', error);
    }
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const stored = getStoredState();

    const [state, setState] = useState<OnboardingState>({
        isActive: false,
        currentStep: 0,
        currentPage: '',
        completedPages: stored.completedPages || [],
        hasSeenWelcome: stored.hasSeenWelcome || false,
        hasCompletedOnboarding: stored.hasCompletedOnboarding || false,
        showWelcome: false,
        currentSteps: [],
    });

    const navigate = useNavigate();

    // Check if user should see welcome on first dashboard visit
    useEffect(() => {
        if (!state.hasSeenWelcome && !state.hasCompletedOnboarding) {
            // Show welcome modal after a short delay
            const timer = setTimeout(() => {
                setState(prev => ({ ...prev, showWelcome: true }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state.hasSeenWelcome, state.hasCompletedOnboarding]);

    const startTour = (page: string, steps: TourStep[]) => {
        // Allow starting a new tour even if one is active (for cross-page flow)
        if (state.hasCompletedOnboarding && !state.isActive) {
            return;
        }

        setState(prev => ({
            ...prev,
            isActive: true,
            currentStep: 0,
            currentPage: page,
            currentSteps: steps,
        }));
    };

    const nextStep = () => {
        const currentStepObj = state.currentSteps[state.currentStep];

        // Handle cross-page navigation if specified
        if (currentStepObj?.nextPage && state.currentStep === state.currentSteps.length - 1) {
            navigate(currentStepObj.nextPage);
            // We don't finish yet, let the next page's OnboardingTour take over
            setState(prev => ({
                ...prev,
                isActive: false, // Briefly deactivate so the next page can auto-start
                completedPages: [...prev.completedPages, prev.currentPage]
            }));
            saveState({ completedPages: [...state.completedPages, state.currentPage] });
            return;
        }

        setState(prev => {
            const stepsLength = prev.currentSteps.length;
            if (prev.currentStep < stepsLength - 1) {
                return { ...prev, currentStep: prev.currentStep + 1 };
            } else {
                // Tour completed for this page
                const newCompletedPages = [...prev.completedPages, prev.currentPage];
                saveState({ completedPages: newCompletedPages });
                return {
                    ...prev,
                    isActive: false,
                    currentStep: 0,
                    completedPages: newCompletedPages,
                };
            }
        });
    };

    const previousStep = () => {
        setState(prev => ({
            ...prev,
            currentStep: Math.max(0, prev.currentStep - 1),
        }));
    };

    const skipTour = () => {
        setState(prev => {
            const newState = {
                ...prev,
                isActive: false,
                currentStep: 0,
                hasCompletedOnboarding: true,
            };
            saveState({ hasCompletedOnboarding: true });
            return newState;
        });
    };

    const completeTour = () => {
        setState(prev => {
            const newCompletedPages = [...prev.completedPages, prev.currentPage];
            const newState = {
                ...prev,
                isActive: false,
                currentStep: 0,
                completedPages: newCompletedPages,
            };
            saveState({ completedPages: newCompletedPages });
            return newState;
        });
    };
    const restartOnboarding = () => {
        setState({
            isActive: false,
            currentStep: 0,
            currentPage: '',
            completedPages: [],
            hasSeenWelcome: false,
            hasCompletedOnboarding: false,
            showWelcome: true,
            currentSteps: [],
        });
        saveState({
            completedPages: [],
            hasSeenWelcome: false,
            hasCompletedOnboarding: false,
        });
    };

    const dismissWelcome = () => {
        setState(prev => ({
            ...prev,
            showWelcome: false,
            hasSeenWelcome: true,
            hasCompletedOnboarding: true,
        }));
        saveState({ hasSeenWelcome: true, hasCompletedOnboarding: true });
    };

    const acceptWelcome = () => {
        setState(prev => ({
            ...prev,
            showWelcome: false,
            hasSeenWelcome: true,
        }));
        saveState({ hasSeenWelcome: true });
    };

    return (
        <OnboardingContext.Provider
            value={{
                state,
                startTour,
                nextStep,
                previousStep,
                skipTour,
                completeTour,
                restartOnboarding,
                dismissWelcome,
                acceptWelcome,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
