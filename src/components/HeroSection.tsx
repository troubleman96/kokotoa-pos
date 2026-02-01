import { Link } from 'react-router-dom';
import { ArrowRight, Play, ShoppingCart, Package, BarChart3, Wifi } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center hero-pattern overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Tanzania's #1 POS System
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">{t('hero.title').split(' ').slice(0, -2).join(' ')}</span>
              <span className="inline-block px-3 py-1 ml-2 bg-primary text-primary-foreground rounded-lg -rotate-1 transform transition-transform hover:rotate-0">
                {t('hero.title').split(' ').slice(-2).join(' ')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/login">
                <Button size="lg" className="btn-kokotoa text-primary-foreground px-8 h-14 text-lg">
                  <span className="relative z-10 flex items-center gap-2">
                    {t('hero.cta')}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-border hover:bg-muted"
              >
                <Play className="w-5 h-5 mr-2" />
                {t('hero.demo')}
              </Button>
            </div>

            {/* Trust Badge */}
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
                  />
                ))}
              </span>
              {t('hero.trustedBy')}
            </p>
          </div>

          {/* Right Content - POS Preview */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-kokotoa rounded-2xl p-6 md:p-8">
              {/* Mock POS Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
                    <img src="/pos-kokotoa_favicon/favicon.svg" alt="KOKOTOA Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">KOKOTOA POS</h3>
                    <p className="text-xs text-muted-foreground">Duka la Njaro</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs">Online</span>
                </div>
              </div>

              {/* Mock Products Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { name: 'Soda', price: '1,500', emoji: '🥤' },
                  { name: 'Mkate', price: '2,000', emoji: '🍞' },
                  { name: 'Mayai', price: '500', emoji: '🥚' },
                  { name: 'Maziwa', price: '3,000', emoji: '🥛' },
                  { name: 'Sukari', price: '4,500', emoji: '🍬' },
                  { name: 'Mchele', price: '8,000', emoji: '🍚' },
                ].map((product, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 rounded-xl p-3 text-center hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all cursor-pointer"
                  >
                    <div className="text-2xl mb-1">{product.emoji}</div>
                    <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-primary">TSh {product.price}</p>
                  </div>
                ))}
              </div>

              {/* Mock Cart Summary */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bidhaa 3</span>
                  <span className="text-foreground font-medium">TSh 6,500</span>
                </div>
                <Button className="w-full btn-kokotoa h-12">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Maliza Mauzo
                </Button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-card rounded-xl p-3 shadow-lg border border-border animate-float">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bidhaa</p>
                  <p className="text-sm font-bold text-foreground">1,234</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-3 shadow-lg border border-border animate-float" style={{ animationDelay: '-2s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mauzo Leo</p>
                  <p className="text-sm font-bold text-primary">TSh 450K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
