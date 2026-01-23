import { useLanguage } from '@/contexts/LanguageContext';
import { SubscriptionPackage } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PackageSelectionProps {
    packages: SubscriptionPackage[];
    onSelect: (pkg: SubscriptionPackage) => void;
    selectedPackageId?: number;
}

const PackageSelection = ({ packages, onSelect, selectedPackageId }: PackageSelectionProps) => {
    const { language } = useLanguage();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
                <div
                    key={pkg.id}
                    className={`
            relative p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col
            ${selectedPackageId === pkg.id
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                        }
          `}
                >
                    {selectedPackageId === pkg.id && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold text-wrap whitespace-nowrap">
                            {language === 'sw' ? 'Imechaguliwa' : 'Selected'}
                        </div>
                    )}

                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                        <div className="mt-2 flex items-baseline text-foreground">
                            <span className="text-3xl font-bold tracking-tight">{pkg.price_display}</span>
                            <span className="ml-1 text-sm font-medium text-muted-foreground">/{language === 'sw' ? 'mwezi' : 'month'}</span>
                        </div>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                        <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-sm text-foreground">
                                {language === 'sw' ? `Hadi maduka ${pkg.max_stores}` : `Up to ${pkg.max_stores} stores`}
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-sm text-foreground">
                                {language === 'sw'
                                    ? `${pkg.max_users_per_store} watumiaji kwa duka`
                                    : `${pkg.max_users_per_store} users per store`
                                }
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-sm text-foreground">
                                {language === 'sw'
                                    ? `Bidhaa ${pkg.max_products.toLocaleString()}`
                                    : `${pkg.max_products.toLocaleString()} products`
                                }
                            </span>
                        </li>
                        {pkg.has_analytics && (
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="text-sm text-foreground">
                                    {language === 'sw' ? 'Takwimu na Ripoti' : 'Analytics & Reports'}
                                </span>
                            </li>
                        )}
                        {pkg.has_multi_store && (
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="text-sm text-foreground">
                                    {language === 'sw' ? 'Usimamizi wa maduka mengi' : 'Multi-store Management'}
                                </span>
                            </li>
                        )}
                        {pkg.has_sms_notifications && (
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="text-sm text-foreground">
                                    {language === 'sw' ? 'Arifa za SMS' : 'SMS Notifications'}
                                </span>
                            </li>
                        )}
                    </ul>

                    <Button
                        onClick={() => onSelect(pkg)}
                        variant={selectedPackageId === pkg.id ? "default" : "outline"}
                        className="w-full btn-kokotoa"
                    >
                        {language === 'sw' ? 'Chagua Kifurushi' : 'Select Package'}
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default PackageSelection;
