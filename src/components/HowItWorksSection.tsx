import { BarChart3, Package, Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { landingContent } from '@/data/landingContent';

const stepIcons = [Store, Package, BarChart3];

const HowItWorksSection = () => {
  const { language } = useLanguage();
  const { howItWorks } = landingContent[language];

  return (
    <section className="py-20 lg:py-32 bg-card/40">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {howItWorks.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {howItWorks.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {howItWorks.steps.map((step, index) => {
            const Icon = stepIcons[index];

            return (
              <div key={step.title} className="card-kokotoa rounded-3xl p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-lg font-bold">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-muted-foreground mt-10 max-w-3xl mx-auto">
          {howItWorks.note}
        </p>
      </div>
    </section>
  );
};

export default HowItWorksSection;
