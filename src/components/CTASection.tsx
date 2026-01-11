import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-kokotoa-deep to-background" />
      <div className="absolute inset-0 hero-pattern opacity-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-8 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('cta.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>

          {/* CTA Button */}
          <Link to="/pos">
            <Button size="lg" className="btn-kokotoa text-primary-foreground px-10 h-16 text-lg">
              <span className="relative z-10 flex items-center gap-2">
                {t('cta.button')}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </Link>

          {/* Trust Note */}
          <p className="mt-6 text-sm text-muted-foreground">
            ✓ Hakuna malipo ya kuanza • ✓ Usanidi rahisi wa dakika 5 • ✓ Msaada wa Kiswahili
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
