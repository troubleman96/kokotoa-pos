import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { subscriptionApi, SubscriptionPackage, SubscriptionStatus } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MessageCircle, Copy, Check } from 'lucide-react';
import PackageSelection from './PackageSelection';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscriptionInfo?: SubscriptionStatus;
}

const UpgradeModal = ({ isOpen, onClose, subscriptionInfo }: UpgradeModalProps) => {
    const { language } = useLanguage();
    const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const fallbackPackages: SubscriptionPackage[] = [
        {
            id: 1,
            name: language === 'sw' ? 'Kifurushi cha Majaribio' : 'Free Trial',
            price: 0,
            price_display: '0 TZS',
            duration_days: 7,
            max_stores: 1,
            max_users_per_store: 1,
            max_products: 100,
            has_analytics: false,
            has_multi_store: false,
            has_sms_notifications: false
        },
        {
            id: 2,
            name: language === 'sw' ? 'Kifurushi cha Kawaida' : 'Basic Package',
            price: 15000,
            price_display: '15,000 TZS',
            duration_days: 30,
            max_stores: 1,
            max_users_per_store: 2,
            max_products: 1000,
            has_analytics: true,
            has_multi_store: false,
            has_sms_notifications: false
        },
        {
            id: 3,
            name: language === 'sw' ? 'Kifurushi cha Premium' : 'Premium Package',
            price: 22000,
            price_display: '22,000 TZS',
            duration_days: 30,
            max_stores: 3,
            max_users_per_store: 10,
            max_products: 5000,
            has_analytics: true,
            has_multi_store: true,
            has_sms_notifications: true
        }
    ];

    useEffect(() => {
        if (isOpen) {
            loadPackages();
        } else {
            setSelectedPackage(null); // Reset on close
        }
    }, [isOpen]);

    const loadPackages = async () => {
        try {
            setIsLoading(true);
            const response = await subscriptionApi.getPackages();
            if (response.success && response.data && response.data.length > 0) {
                setPackages(response.data);
            } else {
                setPackages(fallbackPackages);
            }
        } catch (error) {
            console.error('Error loading packages:', error);
            setPackages(fallbackPackages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyReference = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {selectedPackage
                            ? (language === 'sw' ? 'Malipo' : 'Payment')
                            : (language === 'sw' ? 'Boresha Kifurushi Chako' : 'Upgrade Your Package')
                        }
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {selectedPackage
                            ? (language === 'sw' ? `Lipia ${selectedPackage.name}` : `Payment for ${selectedPackage.name}`)
                            : subscriptionInfo?.message || (language === 'sw'
                                ? 'Chagua kifurushi kinachokufaa kulingana na mahitaji ya biashara yako'
                                : 'Choose a package that suits your business needs')
                        }
                    </DialogDescription>
                </DialogHeader>

                {!selectedPackage ? (
                    <div className="py-4">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : (
                            <PackageSelection
                                packages={packages}
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
                            <p className="text-4xl font-bold text-primary mb-4">
                                {selectedPackage.price_display}
                            </p>
                            <p className="text-sm font-medium text-foreground">
                                {language === 'sw' ? 'Kwa mwezi' : 'Per month'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-center">
                                {language === 'sw' ? 'Jinsi ya Kulipa' : 'How to Pay'}
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        M-Pesa / Tigo Pesa / Airtel
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>1. Piga *150*00# (Au mtandao wako)</li>
                                        <li>2. Chagua "Lipa kwa M-Pesa"</li>
                                        <li>3. Weka namba ya kampuni: <strong>123456</strong></li>
                                        <li>4. Weka namba ya kumbukumbu: <strong className="text-primary cursor-pointer" onClick={() => handleCopyReference('KOKOTOA')}>KOKOTOA</strong></li>
                                        <li>5. Weka kiasi: <strong>{selectedPackage.price}</strong></li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl bg-card border border-border">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        {language === 'sw' ? 'Baada ya Kulipa' : 'After Payment'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {language === 'sw'
                                            ? 'Tafadhali tuma ujumbe wa muamala kwenda:'
                                            : 'Please send the transaction message to:'
                                        }
                                    </p>
                                    <div className="space-y-3">
                                        <a href="tel:+255XXXXXXXXX" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Phone className="w-4 h-4 text-primary" />
                                            <span className="text-sm">+255 XXX XXX XXX</span>
                                        </a>
                                        <a href="https://wa.me/255XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                                            <MessageCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    {language === 'sw' ? 'Namba ya Kumbukumbu' : 'Reference Number'}
                                </p>
                                <p className="text-lg font-mono font-bold text-primary">KOKOTOA</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyReference('KOKOTOA')}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            {language === 'sw'
                                ? 'Akaunti yako itaamilishwa muda mfupi baada ya malipo kuthibitishwa.'
                                : 'Your account will be activated shortly after payment confirmation.'
                            }
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UpgradeModal;
