import { Link } from 'react-router-dom';
import { ArrowRight, Play, ShoppingCart, Package, BarChart3, Wifi } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { landingContent } from '@/data/landingContent';

const HeroSection = () => {
  const { language } = useLanguage();
  const content = landingContent[language];
  const { hero } = content;
  const whatsappMessage = encodeURIComponent(
    'Habari KOKOTOA, naomba msaada wa bookings na support.'
  );
  const whatsappLink = `https://wa.me/255692069230?text=${whatsappMessage}`;

  return (
    <section className="relative flex min-h-[100svh] items-start overflow-hidden hero-pattern pt-20 sm:pt-24 lg:items-center lg:pt-0">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="container mx-auto px-4 pb-10 pt-10 sm:pb-12 sm:pt-12 md:pt-14 lg:pb-16 lg:pt-28 relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
          {/* Left Content */}
          <div className="space-y-5 lg:space-y-7 animate-slide-up max-w-2xl">
            {/* Title */}
            <h1 className="font-display text-[1.95rem] min-[380px]:text-[2.2rem] sm:text-[2.85rem] md:text-[3.2rem] lg:text-[3.5rem] xl:text-[3.75rem] font-bold leading-[1.02] tracking-[-0.045em] space-y-1 sm:space-y-1.5">
              {hero.title.lineOne && (
                <span className="block text-foreground">{hero.title.lineOne}</span>
              )}
              {hero.title.lineTwo && (
                <span className="block text-foreground">{hero.title.lineTwo}</span>
              )}
              {hero.title.highlight && (
                <span className="block pt-1.5 sm:pt-2">
                  <span className="group/hero-highlight inline-flex max-w-full">
                    <span className="inline-block max-w-full origin-left rotate-[-4deg] rounded-3xl bg-[#2BFF68] px-4 py-2 text-[0.95em] font-semibold text-[#04210F] shadow-[0_18px_60px_rgba(43,255,104,0.45)] transition-transform duration-300 ease-out group-hover/hero-highlight:rotate-0 motion-reduce:transform-none sm:px-5 sm:py-2.5 md:px-6 md:py-3">
                      {hero.title.highlight}
                    </span>
                  </span>
                </span>
              )}
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-base md:text-lg">
              {hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center sm:gap-4">
              <Link to="/login" className="min-w-0">
                <Button size="lg" className="btn-kokotoa text-primary-foreground h-10 w-full px-3 text-xs min-[380px]:text-sm sm:h-11 sm:min-w-[170px] sm:px-7 md:h-12 md:text-base">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {hero.primaryCta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="min-w-0"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-10 w-full px-3 text-xs min-[380px]:text-sm sm:h-11 sm:min-w-[170px] sm:px-7 md:h-12 md:text-base border-border hover:bg-muted"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {hero.secondaryCta}
                </Button>
              </a>
            </div>

            {(hero.proofPoints.length > 0 || hero.trustedBy) && (
              <div className="space-y-5 pt-1">
                {hero.proofPoints.length > 0 && (
                  <div className="grid max-w-3xl grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-3">
                    {hero.proofPoints.map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-border/60 bg-card/35 px-3.5 py-3 text-xs text-muted-foreground backdrop-blur-sm md:text-sm"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                )}

                {hero.trustedBy && (
                  <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary to-secondary sm:h-8 sm:w-8"
                        />
                      ))}
                    </span>
                    <span>{hero.trustedBy}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Content - POS Preview */}
          <div className="relative mx-auto w-full max-w-[34rem] animate-slide-up lg:mx-0 lg:pl-2" style={{ animationDelay: '0.2s' }}>
            <div className="card-kokotoa rounded-2xl p-4 sm:p-5 md:p-6">
              {/* Mock POS Header */}
              <div className="mb-4 flex items-center justify-between sm:mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-transparent">
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
              <div className="mb-5 grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3">
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
              <div className="space-y-2.5 rounded-xl bg-muted/30 p-3.5 sm:p-4">
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
            <div className="absolute right-2 top-3 max-w-[9.5rem] rounded-xl border border-border bg-card/95 p-2.5 shadow-lg animate-float sm:-right-3 sm:top-4 sm:max-w-none sm:p-3 md:-right-4">
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

            <div className="absolute bottom-4 left-2 max-w-[9.5rem] rounded-xl border border-border bg-card/95 p-2.5 shadow-lg animate-float sm:-left-3 sm:bottom-6 sm:max-w-none sm:p-3 md:-left-4" style={{ animationDelay: '-2s' }}>
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
