import { ShoppingCart, Package, BarChart3, Smartphone, Shield, Users, Receipt, Cloud } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: ShoppingCart,
      title: t('features.pos.title'),
      description: t('features.pos.desc'),
      color: 'from-primary to-primary/70',
    },
    {
      icon: Package,
      title: t('features.inventory.title'),
      description: t('features.inventory.desc'),
      color: 'from-secondary to-secondary/70',
    },
    {
      icon: BarChart3,
      title: t('features.reports.title'),
      description: t('features.reports.desc'),
      color: 'from-primary to-secondary',
    },
    {
      icon: Users,
      title: t('features.staff.title'),
      description: t('features.staff.desc'),
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Receipt,
      title: t('features.receipts.title'),
      description: t('features.receipts.desc'),
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Cloud,
      title: t('features.offline.title'),
      description: t('features.offline.desc'),
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group card-kokotoa rounded-2xl p-6 lg:p-8 hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
