import { CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { landingContent } from '@/data/landingContent';
import { SubscriptionPackage } from '@/services/api';
import { useSubscriptionPackages } from '@/hooks/use-subscriptions';

const PackagesSection = () => {
    const { language } = useLanguage();
    const { packages: packageCopy } = landingContent[language];
    const { data: packages = [], isLoading, isError } = useSubscriptionPackages();
    const activePackages = packages.filter((pkg) => pkg.is_active);

    const getPackageFeatures = (pkg: SubscriptionPackage) => {
        const features = [
            language === 'sw' ? `Hadi maduka ${pkg.max_stores}` : `Up to ${pkg.max_stores} stores`,
            language === 'sw'
                ? `${pkg.max_users_per_store} watumiaji kwa duka`
                : `${pkg.max_users_per_store} users per store`,
            language === 'sw'
                ? `Hadi bidhaa ${pkg.max_products.toLocaleString()}`
                : `Up to ${pkg.max_products.toLocaleString()} products`,
        ];

        if (pkg.has_analytics) {
            features.push(language === 'sw' ? 'Takwimu za biashara' : 'Business analytics');
        }

        if (pkg.has_reports) {
            features.push(language === 'sw' ? 'Ripoti za biashara' : 'Business reports');
        }

        if (pkg.has_multi_store) {
            features.push(language === 'sw' ? 'Usimamizi wa maduka mengi' : 'Multi-store management');
        }

        if (pkg.has_sms_notifications) {
            features.push(language === 'sw' ? 'Arifa za SMS' : 'SMS notifications');
        }

        return features;
    };

    const getDurationLabel = (durationDays: number) => {
        if (durationDays === 30) {
            return packageCopy.priceSuffix;
        }
        if (durationDays === 365) {
            return language === 'sw' ? '/Mwaka' : '/Year';
        }

        return language === 'sw' ? `/siku ${durationDays}` : `/${durationDays} days`;
    };

    return (
        <section id="packages" className="py-20 lg:py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {packageCopy.title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {packageCopy.subtitle}
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[1, 2, 3].map((card) => (
                            <div key={card} className="h-[26rem] rounded-3xl border border-border bg-card/60 animate-pulse" />
                        ))}
                    </div>
                ) : isError || activePackages.length === 0 ? (
                    <div className="max-w-2xl mx-auto text-center rounded-3xl border border-border bg-card p-10">
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                            {language === 'sw' ? 'Vifurushi havijapatikana sasa' : 'Packages are unavailable right now'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {language === 'sw'
                                ? 'Bei na vipengele sasa vinatoka moja kwa moja kwenye API. Jaribu tena baada ya muda mfupi.'
                                : 'Pricing and package features now come directly from the API. Please try again shortly.'}
                        </p>
                        <Button className="btn-kokotoa" asChild>
                            <Link to="/login">
                                {packageCopy.cta}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {activePackages.map((pkg) => {
                            const features = getPackageFeatures(pkg);
                            const isFeatured = pkg.is_featured;

                            return (
                                <div
                                    key={pkg.id}
                                    className={`relative p-8 rounded-3xl border-2 overflow-hidden transition-transform duration-300 hover:scale-[1.02] ${isFeatured
                                        ? 'bg-card border-primary shadow-2xl'
                                        : 'bg-card/90 border-border shadow-xl'
                                        }`}
                                >
                                    {isFeatured && (
                                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                            {packageCopy.badge}
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                                            {isFeatured && <Zap className="w-6 h-6 text-primary fill-primary" />}
                                            {pkg.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-foreground">{pkg.price_display}</span>
                                            <span className="text-muted-foreground">{getDurationLabel(pkg.duration_days)}</span>
                                        </div>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="mt-1 p-0.5 rounded-full bg-primary/20">
                                                    <CheckCircle className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="text-muted-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button className="w-full h-12 btn-kokotoa text-lg shadow-lg shadow-primary/20" asChild>
                                        <Link to="/login">
                                            {packageCopy.cta}
                                        </Link>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        </section>
    );
};

export default PackagesSection;
