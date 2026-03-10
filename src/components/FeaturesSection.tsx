import { ShoppingCart, Package, BarChart3, Smartphone, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { landingContent } from '@/data/landingContent';

const FeaturesSection = () => {
  const { language } = useLanguage();
  const { benefits } = landingContent[language];
  const icons = [ShoppingCart, Package, BarChart3, Users, TrendingUp, Smartphone];

  const colors = [
    'from-primary to-primary/70',
    'from-secondary to-secondary/70',
    'from-primary to-secondary',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
  ];

  return (
    <section className="py-20 lg:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {benefits.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {benefits.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.items.map((benefit, index) => {
            const Icon = icons[index];
            return (
              <div
                key={index}
                className="group card-kokotoa rounded-2xl p-6 lg:p-8 hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[index]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-3">
                  {benefit.tag}
                </p>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
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
