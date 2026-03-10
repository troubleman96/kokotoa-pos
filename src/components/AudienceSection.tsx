import {
  AlertTriangle,
  CheckCircle2,
  Pill,
  Scissors,
  Shirt,
  ShoppingBasket,
  Store,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { landingContent } from '@/data/landingContent';

const businessIcons = [Store, Shirt, Pill, Wrench, ShoppingBasket, Scissors];

const AudienceSection = () => {
  const { language } = useLanguage();
  const { audience } = landingContent[language];

  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-24 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {audience.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {audience.subtitle}
          </p>
        </div>

        <div className="grid xl:grid-cols-[1.2fr,0.8fr] gap-8 mb-8">
          <div className="card-kokotoa rounded-3xl p-6 lg:p-8">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              {audience.businessesTitle}
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {audience.businesses.map((business, index) => {
                const Icon = businessIcons[index];

                return (
                  <div
                    key={business.name}
                    className="rounded-2xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-display text-lg font-semibold text-foreground mb-2">
                      {business.name}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {business.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card-kokotoa rounded-3xl p-6 lg:p-8">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              {audience.painsTitle}
            </h3>

            <div className="space-y-4">
              {audience.pains.map((pain) => (
                <div
                  key={pain}
                  className="flex items-start gap-3 rounded-2xl bg-background/40 border border-border/50 px-4 py-4"
                >
                  <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6 lg:p-8">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              {audience.compare.beforeTitle}
            </h3>

            <div className="space-y-4">
              {audience.compare.before.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/40 bg-primary/5 p-6 lg:p-8">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              {audience.compare.afterTitle}
            </h3>

            <div className="space-y-4">
              {audience.compare.after.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-foreground/90 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
