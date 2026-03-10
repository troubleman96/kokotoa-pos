import { Link } from 'react-router-dom';
import { ArrowRight, Play, ShoppingCart, Package, BarChart3, Wifi } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { landingContent } from '@/data/landingContent';

const HeroSection = () => {
  const { language } = useLanguage();
  const content = landingContent[language];
  const { hero } = content;

  return (
    <section className="relative min-h-screen flex items-center hero-pattern overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-8 md:pt-28 md:pb-10 relative z-10">
        <div className="grid lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-7 animate-slide-up max-w-2xl">
            {/* Title */}
            <h1 className="font-display text-[2.6rem] sm:text-[3.2rem] lg:text-[3.6rem] xl:text-[3.9rem] font-bold leading-[1.02] tracking-[-0.04em] space-y-1.5">
              {hero.title.lineOne && (
                <span className="block text-foreground whitespace-nowrap">{hero.title.lineOne}</span>
              )}
              {hero.title.lineTwo && (
                <span className="block text-foreground whitespace-nowrap">{hero.title.lineTwo}</span>
              )}
              {hero.title.highlight && (
                <span className="block mt-2">
                  <span className="inline-flex -rotate-1">
                    <span className="rotate-1 inline-flex items-center whitespace-nowrap px-5 py-2.5 md:px-6 md:py-3 bg-[#2BFF68] text-[#04210F] font-semibold rounded-3xl shadow-[0_18px_60px_rgba(43,255,104,0.45)]">
                      {hero.title.highlight}
                    </span>
                  </span>
                </span>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 overflow-x-visible">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="btn-kokotoa text-primary-foreground w-full h-11 md:h-12 sm:min-w-[170px] px-4 sm:px-7 text-sm md:text-base">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {hero.primaryCta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </Link>
              <Link to="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-11 md:h-12 sm:min-w-[170px] px-4 sm:px-7 text-sm md:text-base border-border hover:bg-muted"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {hero.secondaryCta}
                </Button>
              </Link>
            </div>

            <div className="space-y-5 pt-1">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3 max-w-3xl">
                {hero.proofPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-border/60 bg-card/35 px-3.5 py-3 text-xs md:text-sm text-muted-foreground backdrop-blur-sm"
                  >
                    {point}
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                <span className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
                    />
                  ))}
                </span>
                <span>{hero.trustedBy}</span>
              </p>
            </div>
          </div>

          {/* Right Content - POS Preview */}
          <div className="relative animate-slide-up lg:pl-2" style={{ animationDelay: '0.2s' }}>
            <div className="card-kokotoa rounded-2xl p-5 md:p-6">
              {/* Mock POS Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
                    <img src="/pos-kokotoa_faviconupdate/favicon.svg" alt="KOKOTOA Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">KOKOTOA POS</h3>
                    <p className="text-xs text-muted-foreground">{hero.preview.storeName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs">{hero.preview.status}</span>
                </div>
              </div>

              {/* Mock Products Grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {hero.preview.products.map((product, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 rounded-xl p-2.5 text-center hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all cursor-pointer"
                  >
                    <div className="text-xl mb-1">{product.emoji}</div>
                    <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-primary">TSh {product.price}</p>
                  </div>
                ))}
              </div>

              {/* Mock Cart Summary */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{hero.preview.itemCount}</span>
                  <span className="text-foreground font-medium">{hero.preview.total}</span>
                </div>
                <Button className="w-full btn-kokotoa h-11">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {hero.preview.checkout}
                </Button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-4 -right-3 md:-right-4 bg-card/95 rounded-xl p-3 shadow-lg border border-border animate-float">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{hero.preview.inventoryLabel}</p>
                  <p className="text-sm font-bold text-foreground">{hero.preview.inventoryValue}</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 -left-3 md:-left-4 bg-card/95 rounded-xl p-3 shadow-lg border border-border animate-float" style={{ animationDelay: '-2s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{hero.preview.salesLabel}</p>
                  <p className="text-sm font-bold text-primary">{hero.preview.salesValue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full leading-none">
        <svg
          viewBox="0 0 1440 140"
          className="block w-full h-[72px] md:h-[96px]"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,64L80,74.7C160,85,320,107,480,106.7C640,107,800,85,960,69.3C1120,53,1280,43,1360,37.3L1440,32V140H1360C1280,140,1120,140,960,140C800,140,640,140,480,140C320,140,160,140,80,140H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
