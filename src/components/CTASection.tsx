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
      <div className="absolute top-1/2 left-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[26rem] sm:w-[26rem] lg:h-[37.5rem] lg:w-[37.5rem]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl px-5 pb-16 pt-10 text-center card-kokotoa sm:px-6 sm:pb-20 sm:pt-12 md:px-10">
          {/* Icon */}
          <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 animate-pulse-glow sm:h-16 sm:w-16">
            <Sparkles className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
          </div>

          {/* Title */}
          <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
            {cta.title}
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-xl text-base text-muted-foreground sm:text-lg md:text-xl">
            {cta.subtitle}
          </p>

          {/* CTA Button */}
          <Link to="/dashboard" className="inline-flex w-full justify-center sm:w-auto">
            <Button size="lg" className="btn-kokotoa h-14 w-full px-6 text-base text-primary-foreground sm:h-16 sm:w-auto sm:px-10 sm:text-lg">
              <span className="relative z-10 flex items-center gap-2">
                {cta.button}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </Link>

          {/* Trust Note */}
          <p className="mt-6 px-2 text-sm text-muted-foreground">
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
