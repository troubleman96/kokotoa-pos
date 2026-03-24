import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionStatus } from '@/hooks/use-subscriptions';
import DashboardLayout from '@/components/DashboardLayout';
import SubscriptionSettings from '@/components/subscription/SubscriptionSettings';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import TrialBanner from '@/components/subscription/TrialBanner';

const Subscription = () => {
    const { language } = useLanguage();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const {
        data: subscriptionStatus,
        isLoading,
        refetch: refetchSubscription,
    } = useSubscriptionStatus();

    return (
        <DashboardLayout
            title={language === 'sw' ? 'Usajili' : 'Subscription'}
            subtitle={language === 'sw' ? 'Dhibiti kifurushi chako' : 'Manage your subscription plan'}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Trial Banner */}
                {!isLoading && (
                    <TrialBanner
                        subscriptionStatus={subscriptionStatus ?? null}
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                )}

                {/* Subscription Details & Packages */}
                <SubscriptionSettings
                    subscriptionStatus={subscriptionStatus ?? null}
                    onUpgrade={() => setShowUpgradeModal(true)}
                />
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => {
                    setShowUpgradeModal(false);
                    void refetchSubscription();
                }}
                subscriptionInfo={subscriptionStatus}
            />
        </DashboardLayout>
    );
};

export default Subscription;
