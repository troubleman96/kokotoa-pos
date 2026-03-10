import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { landingContent } from '@/data/landingContent';

const StatsSection = () => {
  const { language } = useLanguage();
  const { proof } = landingContent[language];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {proof.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {proof.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-10">
          {proof.stats.map((stat, index) => (
            <div key={index} className="text-center group card-kokotoa rounded-2xl px-5 py-8">
              <div className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground mb-2 group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="card-kokotoa rounded-3xl p-8 lg:p-10">
          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            {proof.notes.map((note) => (
              <div key={note} className="flex items-start gap-3 rounded-2xl bg-background/40 px-4 py-4 border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
