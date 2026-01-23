import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { SubscriptionStatus } from '@/services/api';
import { Clock } from 'lucide-react';

interface TrialBannerProps {
    subscriptionStatus: SubscriptionStatus;
    onUpgrade?: () => void;
}

const TrialBanner = ({ subscriptionStatus, onUpgrade }: TrialBannerProps) => {
    const { language } = useLanguage();

    if (!subscriptionStatus || subscriptionStatus.status !== 'TRIAL') return null;

    const daysLeft = subscriptionStatus.days_remaining || 0;
    const isUrgent = daysLeft <= 3;

    return (
        <div className={`
      w-full px-4 py-3 mb-4 rounded-xl flex items-center justify-between flex-wrap gap-2
      ${isUrgent ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-primary/10 border border-primary/20'}
    `}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isUrgent ? 'bg-orange-500/20 text-orange-600' : 'bg-primary/20 text-primary'}`}>
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-medium text-foreground">
                        {language === 'sw' ? 'Muda wa Majaribio' : 'Free Trial Active'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {language === 'sw'
                            ? `Zimebaki siku ${daysLeft} za majaribio`
                            : `${daysLeft} days remaining in your trial`
                        }
                    </p>
                </div>
            </div>

            {onUpgrade ? (
                <button
                    onClick={onUpgrade}
                    className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${isUrgent
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }
          `}
                >
                    {language === 'sw' ? 'Boresha Sasa' : 'Upgrade Now'}
                </button>
            ) : (
                <Link
                    to="/settings?tab=subscription"
                    className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${isUrgent
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }
          `}
                >
                    {language === 'sw' ? 'Boresha Sasa' : 'Upgrade Now'}
                </Link>
            )}
        </div>
    );
};

export default TrialBanner;
