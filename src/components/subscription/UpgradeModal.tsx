import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPackage, SubscriptionStatus } from '@/services/api';
import { useSubscriptionPackages } from '@/hooks/use-subscriptions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PackageSelection from './PackageSelection';
import MathLoader from '@/components/ui/MathLoader';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscriptionInfo?: SubscriptionStatus;
}

const supportPhone = '+255 692 069 230';

const formatPaymentAmount = (price: string) => {
    const numericValue = Number.parseFloat(price);

    if (Number.isNaN(numericValue)) {
        return price;
    }

    return numericValue % 1 === 0 ? String(numericValue) : numericValue.toFixed(2);
};

const UpgradeModal = ({ isOpen, onClose, subscriptionInfo }: UpgradeModalProps) => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const { data: packages = [], isLoading, isError } = useSubscriptionPackages(isOpen);
    const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedPackage(null);
            setCopied(false);
        }
    }, [isOpen]);

    const activePackages = packages.filter((pkg) => pkg.is_active);
    const isVerified = Boolean(user?.is_phone_verified);
    const durationLabel = selectedPackage?.duration_days === 30
        ? (language === 'sw' ? 'Kwa mwezi' : 'Per month')
        : (language === 'sw'
            ? `Kwa siku ${selectedPackage?.duration_days ?? 0}`
            : `For ${selectedPackage?.duration_days ?? 0} days`);

    const paymentReference = useMemo(() => {
        if (!selectedPackage) {
            return '';
        }

        return [
            `Package ID: ${selectedPackage.id}`,
            `Package: ${selectedPackage.name}`,
            `Amount: ${selectedPackage.price_display}`,
            `Phone: ${user?.phone ?? '-'}`,
        ].join('\n');
    }, [selectedPackage, user?.phone]);

    const whatsappMessage = useMemo(() => {
        if (!selectedPackage) {
            return '';
        }

        const intro = language === 'sw'
            ? 'Habari, nimelipia kifurushi hiki cha KOKOTOA POS:'
            : 'Hello, I have paid for this KOKOTOA POS package:';

        return `${intro}\n${paymentReference}\nTransaction Ref:`;
    }, [language, paymentReference, selectedPackage]);

    const whatsappLink = `https://wa.me/255692069230?text=${encodeURIComponent(whatsappMessage)}`;

    const handleCopyReference = async () => {
        if (!paymentReference || !navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(paymentReference);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    const getModalDescription = () => {
        if (!isVerified) {
            return language === 'sw'
                ? 'Thibitisha namba yako kwanza kabla ya kuchagua kifurushi.'
                : 'Verify your phone number before choosing a package.';
        }

        if (selectedPackage) {
            return language === 'sw'
                ? `Lipia ${selectedPackage.name} na utume uthibitisho wa malipo.`
                : `Pay for ${selectedPackage.name} and send your payment confirmation.`;
        }

        if (subscriptionInfo?.status === 'EXPIRED') {
            return language === 'sw'
                ? 'Chagua kifurushi, kisha tuma ujumbe wa muamala ili akaunti yako ianzishwe tena.'
                : 'Choose a package, then send your transaction message so your account can be reactivated.';
        }

        return language === 'sw'
            ? 'Chagua kifurushi kinachokufaa kulingana na mahitaji ya biashara yako.'
            : 'Choose a package that suits your business needs.';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {selectedPackage
                            ? (language === 'sw' ? 'Malipo ya Kifurushi' : 'Package Payment')
                            : (language === 'sw' ? 'Boresha Kifurushi Chako' : 'Upgrade Your Package')}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {getModalDescription()}
                    </DialogDescription>
                </DialogHeader>

                {!isVerified ? (
                    <div className="py-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">
                                {language === 'sw' ? 'Thibitisha namba kwanza' : 'Verify your phone first'}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                                {language === 'sw'
                                    ? 'Backend inahitaji namba ya simu iliyothibitishwa kabla kifurushi hakijaidhinishwa. Ukishathibitisha, utarudi hapa uchague kifurushi.'
                                    : 'The backend requires a verified phone number before a package can be approved. Verify your phone, then come back here to choose a package.'}
                            </p>
                            <Button className="btn-kokotoa" asChild>
                                <Link to="/verify-phone">
                                    {language === 'sw' ? 'Thibitisha Namba' : 'Verify Phone'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : !selectedPackage ? (
                    <div className="py-4">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <MathLoader size="lg" />
                            </div>
                        ) : isError ? (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center space-y-2">
                                <h3 className="text-lg font-semibold text-destructive">
                                    {language === 'sw' ? 'Vifurushi havijapatikana' : 'Unable to load packages'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'sw'
                                        ? 'Jaribu tena baada ya muda mfupi. Bei na vipengele sasa vinatoka moja kwa moja kwenye API.'
                                        : 'Please try again shortly. Prices and package features now come directly from the API.'}
                                </p>
                            </div>
                        ) : activePackages.length === 0 ? (
                            <div className="bg-muted/40 border border-border rounded-2xl p-6 text-center space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {language === 'sw' ? 'Hakuna vifurushi vinavyopatikana sasa' : 'No packages are available right now'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'sw'
                                        ? 'Tafadhali wasiliana na timu yetu ikiwa unahitaji kusaidiwa.'
                                        : 'Please contact our team if you need help right away.'}
                                </p>
                            </div>
                        ) : (
                            <PackageSelection
                                packages={activePackages}
                                onSelect={setSelectedPackage}
                            />
                        )}
                    </div>
                ) : (
                    <div className="py-4 space-y-6">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedPackage(null)}
                            className="mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {language === 'sw' ? 'Rudi kwenye vifurushi' : 'Back to packages'}
                        </Button>

                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 text-center">
                            <p className="text-muted-foreground mb-1">
                                {language === 'sw' ? 'Kiasi cha Kulipa' : 'Amount to Pay'}
                            </p>
                            <p className="text-4xl font-bold text-primary mb-2">
                                {selectedPackage.price_display}
                            </p>
                            <p className="text-sm font-medium text-foreground">
                                {durationLabel}
                            </p>
                            <p className="text-xs text-muted-foreground mt-3">
                                {language === 'sw'
                                    ? `Package ID: ${selectedPackage.id}`
                                    : `Package ID: ${selectedPackage.id}`}
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {language === 'sw' ? 'Rejea ya kifurushi' : 'Package reference'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {language === 'sw'
                                            ? 'Tuma maelezo haya pamoja na ujumbe wa muamala ili timu iweze kuidhinisha kifurushi sahihi.'
                                            : 'Send these details with your transaction message so the team can approve the right package.'}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleCopyReference}>
                                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {copied
                                        ? (language === 'sw' ? 'Imenakiliwa' : 'Copied')
                                        : (language === 'sw' ? 'Nakili' : 'Copy')}
                                </Button>
                            </div>
                            <pre className="whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm text-foreground font-medium">
                                {paymentReference}
                            </pre>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-center">
                                {language === 'sw' ? 'Jinsi ya Kulipa' : 'How to Pay'}
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        Airtel
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>1. Piga *150*60# (au mtandao wako)</li>
                                        <li>2. Chagua &quot;Tuma pesa&quot;</li>
                                        <li>3. Weka namba ya simu: <strong>0692 069 230</strong></li>
                                        <li>4. Weka kiasi: <strong>{formatPaymentAmount(selectedPackage.price)}</strong></li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        {language === 'sw' ? 'Baada ya Kulipa' : 'After Payment'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {language === 'sw'
                                            ? 'Tuma ujumbe wa muamala pamoja na rejea ya kifurushi hapa:'
                                            : 'Send the transaction message together with the package reference here:'}
                                    </p>
                                    <div className="space-y-3">
                                        <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <span className="text-sm">{supportPhone}</span>
                                        </a>
                                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                                            <MessageCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            {language === 'sw'
                                ? 'Akaunti yako itaamilishwa muda mfupi baada ya malipo kuthibitishwa na kifurushi kuidhinishwa.'
                                : 'Your account will be activated shortly after payment is confirmed and the package is approved.'}
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UpgradeModal;
