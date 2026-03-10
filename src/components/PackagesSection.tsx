import { CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { landingContent } from '@/data/landingContent';

const PackagesSection = () => {
    const { language } = useLanguage();
    const { packages } = landingContent[language];

    return (
        <section id="packages" className="py-20 lg:py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {packages.title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {packages.subtitle}
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <div className="relative p-8 rounded-3xl bg-card border-2 border-primary shadow-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            {/* Popular/Premium Badge */}
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                {packages.badge}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                                    <Zap className="w-6 h-6 text-primary fill-primary" />
                                    {packages.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-foreground">22,000 TZS</span>
                                    <span className="text-muted-foreground">{packages.priceSuffix}</span>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {packages.note}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {packages.features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="mt-1 p-0.5 rounded-full bg-primary/20">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-muted-foreground">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full h-12 btn-kokotoa text-lg shadow-lg shadow-primary/20" asChild>
                                <Link to="/register">
                                    {packages.cta}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        </section>
    );
};

export default PackagesSection;
