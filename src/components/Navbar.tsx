import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const nextLanguage = language === 'sw' ? 'en' : 'sw';

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
    { path: '/terms', label: t('nav.terms') },
    { path: '/privacy', label: t('nav.privacy') },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
              <img
                src="/pos-kokotoa_faviconupdate/favicon.svg"
                alt="KOKOTOA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl text-foreground">
              KOKOTOA
            </span>
          </Link>

          {/* Unified Controls (Language first, then Menu) */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setLanguage(nextLanguage)}
              className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted sm:px-2.5 sm:text-xs"
              aria-label={nextLanguage === 'en' ? 'Switch to English' : 'Switch to Swahili'}
            >
              {nextLanguage === 'en' ? '🇺🇸 EN' : '🇹🇿 SW'}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="p-2 text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          </div>
        </div>
      </nav>

      {/* Side Menu (keep mounted for smooth animation) */}
      <div
        className={`fixed inset-0 z-[999] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`menu-overlay-blur absolute inset-0 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          className={`menu-panel-glass absolute right-0 top-0 h-full w-[min(88vw,25rem)] md:w-[min(38vw,29rem)]
            overflow-hidden text-card-foreground isolate
            border-l border-border/60
            transform transition-transform duration-300 ease-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/12 via-primary/5 to-transparent" />

          <div className="relative flex h-full flex-col p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Navigation</p>
                <span className="font-display font-semibold text-foreground">KOKOTOA Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-border/50 bg-background/10 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-muted/50"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-border/45 bg-background/10 p-2 backdrop-blur-sm">
              <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {language === 'sw' ? 'Kurasa' : 'Pages'}
              </p>

              <div className="space-y-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-2xl border px-3 py-3.5 font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'border-primary/30 bg-primary/12 text-primary shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.05)]'
                      : 'border-transparent text-foreground hover:border-border/50 hover:bg-background/20'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              </div>
            </div>

            <div className="mt-auto border-t border-border/60 pt-6">
              <p className="text-xs text-muted-foreground">
                {language === 'sw'
                  ? 'Chagua ukurasa kutoka menyu hii.'
                  : 'Choose any page from this menu.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
