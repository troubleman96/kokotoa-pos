import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { landingContent } from '@/data/landingContent';

const CTASection = () => {
  const { language } = useLanguage();
  const { cta } = landingContent[language];

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-kokotoa-deep to-background" />
      <div className="absolute inset-0 hero-pattern opacity-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center card-kokotoa rounded-3xl px-6 md:px-10 pt-12 pb-20 relative overflow-hidden">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-8 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {cta.title}
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            {cta.subtitle}
          </p>

          {/* CTA Button */}
          <Link to="/register">
            <Button size="lg" className="btn-kokotoa text-primary-foreground px-10 h-16 text-lg">
              <span className="relative z-10 flex items-center gap-2">
                {cta.button}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </Link>

          {/* Trust Note */}
          <p className="mt-6 text-sm text-muted-foreground">
            {cta.notes.map((note) => `✓ ${note}`).join(' • ')}
          </p>

          <div className="absolute bottom-0 left-0 w-full leading-none">
            <svg
              viewBox="0 0 1200 120"
              className="block w-full h-14 md:h-16"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,48L60,58.7C120,69,240,91,360,90.7C480,91,600,69,720,58.7C840,48,960,48,1080,58.7L1200,69V120H1080C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120H0Z"
                className="fill-primary/15"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
