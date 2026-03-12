import { useLanguage } from '@/contexts/LanguageContext';
import { SubscriptionStatus } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Store, CheckCircle, AlertTriangle } from 'lucide-react';
import MathLoader from '@/components/ui/MathLoader';

interface SubscriptionSettingsProps {
    subscriptionStatus: SubscriptionStatus | null;
    onUpgrade: () => void;
}

const SubscriptionSettings = ({ subscriptionStatus, onUpgrade }: SubscriptionSettingsProps) => {
    const { language } = useLanguage();

    if (!subscriptionStatus) {
        return (
            <div className="flex justify-center p-8">
                <MathLoader size="lg" />
            </div>
        );
    }

    const { status, status_display, subscription } = subscriptionStatus;
    const activePackage = subscription?.package;

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        const parsedDate = new Date(dateString);
        if (Number.isNaN(parsedDate.getTime())) return '-';

        return parsedDate.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatNumber = (value?: number | null) => {
        if (typeof value !== 'number') return '-';
        return value.toLocaleString();
    };

    return (
        <div className="space-y-6">
            <Card className="card-kokotoa">
                <CardHeader className="p-4 sm:p-6 border-b border-border/50 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <CreditCard className="w-5 h-5 hidden md:flex" />
                                {language === 'sw' ? 'Hali ya Usajili' : 'Subscription Status'}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                {language === 'sw' ? 'Angalia kifurushi chako cha sasa' : 'View your current package details'}
                            </CardDescription>
                        </div>
                        <Badge
                            variant={status === 'ACTIVE' ? 'default' : status === 'TRIAL' ? 'secondary' : 'destructive'}
                            className="px-3 py-1 text-sm font-medium"
                        >
                            {status_display}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
                    {/* Trial Status */}
                    {status === 'TRIAL' && (
                        <div className="bg-secondary/20 p-4 rounded-xl border border-secondary/30">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">
                                        {language === 'sw' ? 'Muda wa Majaribio' : 'Free Trial Period'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {language === 'sw'
                                            ? 'Unatumia toleo la majaribio la bure. Boresha sasa ili kuepuka usumbufu.'
                                            : 'You are using a free trial version. Upgrade now to avoid service interruption.'
                                        }
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{language === 'sw' ? 'Imeanza:' : 'Started:'}</span>
                                            <span className="font-medium">{formatDate(subscriptionStatus.trial_start)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{language === 'sw' ? 'Inaisha:' : 'Ends:'}</span>
                                            <span className="font-medium">{formatDate(subscriptionStatus.trial_end)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <Button onClick={onUpgrade} className="w-full sm:w-auto btn-kokotoa">
                                    {language === 'sw' ? 'Boresha Sasa' : 'Upgrade Now'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Active Subscription */}
                    {status === 'ACTIVE' && activePackage && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Kifurushi' : 'Package'}
                                    </h4>
                                    <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        {activePackage.name}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Gharama' : 'Price'}
                                    </h4>
                                    <p className="text-lg font-semibold">{activePackage.price_display}/{language === 'sw' ? 'mwezi' : 'mo'}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Tarehe ya Kuisha' : 'Expiry Date'}
                                    </h4>
                                    <p className="text-lg font-semibold">{formatDate(subscription?.expires_at)}</p>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    {language === 'sw' ? 'Faida Zako' : 'Your Benefits'}
                                </h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {language === 'sw' ? `Hadi maduka ${formatNumber(activePackage.max_stores)}` : `Up to ${formatNumber(activePackage.max_stores)} stores`}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {language === 'sw' ? `${formatNumber(activePackage.max_users_per_store)} watumiaji kwa duka` : `${formatNumber(activePackage.max_users_per_store)} users per store`}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {language === 'sw' ? `Bidhaa ${formatNumber(activePackage.max_products)}` : `${formatNumber(activePackage.max_products)} products`}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {status === 'ACTIVE' && !activePackage && (
                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 text-center">
                            <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                {language === 'sw' ? 'Usajili Upo Hai' : 'Subscription Active'}
                            </h3>
                            <p className="text-muted-foreground mb-2">
                                {language === 'sw'
                                    ? 'Taarifa za kifurushi chako bado hazijakamilika. Ukurasa utaendelea kufanya kazi bila kuvunjika.'
                                    : 'Your package details are temporarily unavailable. The page stays usable while the data finishes syncing.'
                                }
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {language === 'sw'
                                    ? `Tarehe ya kuisha: ${formatDate(subscription?.expires_at)}`
                                    : `Expiry date: ${formatDate(subscription?.expires_at)}`
                                }
                            </p>
                        </div>
                    )}

                    {/* Expired Status */}
                    {status === 'EXPIRED' && (
                        <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 text-center">
                            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-destructive mb-2">
                                {language === 'sw' ? 'Usajili Umeisha' : 'Subscription Expired'}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {language === 'sw'
                                    ? 'Tafadhali lipia kifurushi ili kuendelea kutumia huduma zetu.'
                                    : 'Please renew your subscription to continue accessing our services.'
                                }
                            </p>
                            <Button onClick={onUpgrade} variant="destructive" className="w-full sm:w-auto">
                                {language === 'sw' ? 'Lipia Sasa' : 'Renew Now'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionSettings;
