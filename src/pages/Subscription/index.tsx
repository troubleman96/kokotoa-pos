import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { subscriptionApi, SubscriptionStatus } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import SubscriptionSettings from '@/components/subscription/SubscriptionSettings';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import TrialBanner from '@/components/subscription/TrialBanner';

const Subscription = () => {
    const { language } = useLanguage();
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSubscription = async () => {
        try {
            const response = await subscriptionApi.getStatus();
            if (response.success) {
                setSubscriptionStatus(response.data);
            }
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    return (
        <DashboardLayout
            title={language === 'sw' ? 'Usajili' : 'Subscription'}
            subtitle={language === 'sw' ? 'Dhibiti kifurushi chako' : 'Manage your subscription plan'}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Trial Banner */}
                {!isLoading && (
                    <TrialBanner
                        subscriptionStatus={subscriptionStatus}
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                )}

                {/* Subscription Details & Packages */}
                <SubscriptionSettings
                    subscriptionStatus={subscriptionStatus}
                    onUpgrade={() => setShowUpgradeModal(true)}
                />
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => {
                    setShowUpgradeModal(false);
                    // Refresh status after modal close in case of upgrade
                    fetchSubscription();
                }}
                subscriptionInfo={subscriptionStatus || undefined}
            />
        </DashboardLayout>
    );
};

export default Subscription;
