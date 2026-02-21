import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

const TourWelcome = () => {
    const { language } = useLanguage();
    const { state, dismissWelcome, acceptWelcome } = useOnboarding();

    useEffect(() => {
        if (state.showWelcome) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [state.showWelcome]);

    if (!state.showWelcome) return null;

    const content = {
        sw: {
            title: 'Karibu, KOKOTOA POS! 🎉',
            subtitle: 'Mfumo wa mauzo wa biashara yako',
            features: [
                {
                    icon: '🛒',
                    title: 'Mauzo Rahisi',
                    description: 'Rekodi mauzo haraka na kwa usalama',
                },
                {
                    icon: '📦',
                    title: 'Usimamizi wa Bidhaa',
                    description: 'Fuatilia bidhaa na hesabu kwa urahisi',
                },
                {
                    icon: '📊',
                    title: 'Ripoti Kamili',
                    description: 'Angalia takwimu za biashara yako',
                },
                {
                    icon: '👥',
                    title: 'Wafanyakazi',
                    description: 'Dhibiti timu yako na majukumu',
                },
            ],
            question: 'Je, ungependa mwongozo wa haraka wa jinsi ya kutumia mfumo?',
            startTour: 'Anza Mwongozo',
            skipTour: 'Ruka, Nitajifunza Mwenyewe',
        },
        en: {
            title: 'Welcome to KOKOTOA POS! 🎉',
            subtitle: 'Modern Point of Sale System for Your Business',
            features: [
                {
                    icon: '🛒',
                    title: 'Easy Sales',
                    description: 'Record sales quickly and securely',
                },
                {
                    icon: '📦',
                    title: 'Inventory Management',
                    description: 'Track products and stock effortlessly',
                },
                {
                    icon: '📊',
                    title: 'Complete Reports',
                    description: 'View your business analytics',
                },
                {
                    icon: '👥',
                    title: 'Staff Management',
                    description: 'Control your team and roles',
                },
            ],
            question: 'Would you like a quick tour of how to use the system?',
            startTour: 'Start Tour',
            skipTour: 'Skip, I\'ll Explore Myself',
        },
    };

    const t = content[language];

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="card-kokotoa rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border-2 border-primary/20 animate-slide-up relative my-4 max-h-[92vh] overflow-hidden flex flex-col">
                {/* Close button */}
                <button
                    onClick={dismissWelcome}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="overflow-y-auto pr-1">
                    {/* Header */}
                    <div className="text-center mb-6 mt-2">
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 p-2">
                                <img
                                    src="/pos-kokotoa_faviconupdate/web-app-manifest-192x192.png"
                                    alt="KOKOTOA POS"
                                    className="w-full h-full object-contain"
                                />
                            </span>
                            <span>{t.title}</span>
                        </h2>
                        <p className="text-muted-foreground text-base sm:text-lg">
                            {t.subtitle}
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                        {t.features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-muted/30 rounded-xl p-3 sm:p-4 text-center hover:bg-muted/50 transition-colors"
                            >
                                <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{feature.icon}</div>
                                <h3 className="font-display font-semibold text-foreground mb-1 text-sm sm:text-base">
                                    {feature.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Question */}
                    <p className="text-center text-foreground font-medium mb-5">
                        {t.question}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/60 bg-card">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={dismissWelcome}
                        className="flex-1"
                    >
                        {t.skipTour}
                    </Button>
                    <Button
                        size="lg"
                        onClick={acceptWelcome}
                        className="flex-1 btn-kokotoa"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t.startTour}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TourWelcome;
