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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
              <img
                src="/pos-kokotoa_favicon/favicon.svg"
                alt="KOKOTOA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              KOKOTOA
            </span>
          </Link>

          {/* Unified Controls (Language first, then Menu) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(nextLanguage)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-colors"
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
              <Menu className="w-6 h-6" />
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
        {/* Full opaque overlay to hide all background content */}
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Professional side panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-[88%] md:w-[38%] max-w-[460px]
            bg-card text-card-foreground opacity-100 isolate
            border-l border-border shadow-2xl
            transform transition-transform duration-300 ease-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="h-full flex flex-col p-5 md:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Navigation</p>
                <span className="font-display font-semibold text-foreground">KOKOTOA Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 rounded-xl font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary bg-primary/10 border border-primary/30'
                      : 'text-foreground hover:bg-muted border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-border/70">
              <p className="text-xs text-muted-foreground">
                Chagua ukurasa kutoka menyu hii.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
