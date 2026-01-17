import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'sw' | 'en';

interface Translations {
  [key: string]: {
    sw: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  'nav.home': { sw: 'Nyumbani', en: 'Home' },
  'nav.about': { sw: 'Kuhusu', en: 'About' },
  'nav.contact': { sw: 'Wasiliana', en: 'Contact' },
  'nav.pos': { sw: 'Mfumo wa Mauzo', en: 'POS System' },
  'nav.login': { sw: 'Ingia', en: 'Login' },
  'nav.getStarted': { sw: 'Anza Sasa', en: 'Get Started' },

  // Hero Section
  'hero.title': { sw: 'Mfumo wa Kisasa wa Mauzo na Hesabu', en: 'Modern POS & Inventory System' },
  'hero.subtitle': { sw: 'Dhibiti biashara yako kwa urahisi. Mauzo, Hesabu, Ripoti - yote katika sehemu moja.', en: 'Manage your business with ease. Sales, Inventory, Reports - all in one place.' },
  'hero.cta': { sw: 'Anza Bure', en: 'Start Free' },
  'hero.demo': { sw: 'Tazama Demo', en: 'Watch Demo' },
  'hero.trustedBy': { sw: 'Inatumiwa na biashara zaidi ya 1,000 Tanzania', en: 'Trusted by 1,000+ businesses in Tanzania' },

  // Features
  'features.title': { sw: 'Huduma Zetu', en: 'Our Features' },
  'features.subtitle': { sw: 'Zana zote unazohitaji kudhibiti biashara yako', en: 'All the tools you need to manage your business' },
  'features.pos.title': { sw: 'Smart POS', en: 'Smart POS' },
  'features.pos.desc': { sw: 'Inafuatilia njia mbalimbali za malipo.', en: 'Tracking multiple payment methods.' },
  'features.inventory.title': { sw: 'Udhibiti wa Stoo', en: 'Inventory Tracking' },
  'features.inventory.desc': { sw: 'Ina arifa za bidhaa zinazoisha kwa wakati.', en: 'With real-time stock alerts.' },
  'features.reports.title': { sw: 'Takwimu za Kina', en: 'Advanced Analytics' },
  'features.reports.desc': { sw: 'Michoro na maarifa ya biashara yako.', en: 'Graphical trends and insights.' },
  'features.staff.title': { sw: 'Usimamizi wa Wafanyakazi', en: 'Staff Management' },
  'features.staff.desc': { sw: 'Mgawanyo wa majukumu kwa timu yako.', en: 'Role-based access for your team.' },
  'features.receipts.title': { sw: 'Risiti za Kitaalamu', en: 'Professional Receipts' },
  'features.receipts.desc': { sw: 'Msaada wa printa za thermal.', en: 'Thermal printing support.' },
  'features.offline.title': { sw: 'Cloud Sync', en: 'Cloud Sync' },
  'features.offline.desc': { sw: 'Pata data zako kwenye kifaa chochote.', en: 'Access from any device.' },

  // Stats
  'stats.businesses': { sw: 'Biashara', en: 'Businesses' },
  'stats.transactions': { sw: 'Miamala/Siku', en: 'Transactions/Day' },
  'stats.uptime': { sw: 'Wakati wa Kufanya Kazi', en: 'Uptime' },
  'stats.support': { sw: 'Msaada 24/7', en: '24/7 Support' },

  // CTA Section
  'cta.title': { sw: 'Tayari Kuboresha Biashara Yako?', en: 'Ready to Upgrade Your Business?' },
  'cta.subtitle': { sw: 'Jiunge na maelfu ya wafanyabiashara wa Tanzania wanaotumia KOKOTOA', en: 'Join thousands of Tanzanian business owners using KOKOTOA' },
  'cta.button': { sw: 'Anza Bila Malipo', en: 'Start For Free' },

  // Footer
  'footer.tagline': { sw: 'Mfumo wa kisasa wa mauzo kwa wafanyabiashara wa Tanzania', en: 'Modern POS system for Tanzanian business owners' },
  'footer.quickLinks': { sw: 'Viungo vya Haraka', en: 'Quick Links' },
  'footer.contact': { sw: 'Wasiliana Nasi', en: 'Contact Us' },
  'footer.rights': { sw: 'Haki zote zimehifadhiwa', en: 'All rights reserved' },

  // About Page
  'about.title': { sw: 'Kuhusu KOKOTOA', en: 'About KOKOTOA' },
  'about.subtitle': { sw: 'Tunasaidia wafanyabiashara wa Tanzania kukua', en: 'Helping Tanzanian businesses grow' },
  'about.mission.title': { sw: 'Dhamira Yetu', en: 'Our Mission' },
  'about.mission.text': { sw: 'Kuwawezesha wafanyabiashara wadogo na wakubwa wa Tanzania kwa teknolojia rahisi na ya kisasa ya kudhibiti biashara zao.', en: 'To empower small and large Tanzanian businesses with simple, modern technology to manage their operations.' },
  'about.vision.title': { sw: 'Maono Yetu', en: 'Our Vision' },
  'about.vision.text': { sw: 'Kuwa mfumo wa kwanza unaochaguliwa na wafanyabiashara wote wa Afrika Mashariki kwa usimamizi wa mauzo na hesabu.', en: 'To become the first choice POS and inventory management system for all East African businesses.' },
  'about.values.title': { sw: 'Maadili Yetu', en: 'Our Values' },
  'about.value1': { sw: 'Urahisi - Teknolojia inapaswa kuwa rahisi kutumia', en: 'Simplicity - Technology should be easy to use' },
  'about.value2': { sw: 'Uaminifu - Data yako iko salama nasi', en: 'Trust - Your data is safe with us' },
  'about.value3': { sw: 'Msaada - Tuko hapa kusaidia masaa 24', en: 'Support - We are here to help 24/7' },

  // Contact Page
  'contact.title': { sw: 'Wasiliana Nasi', en: 'Contact Us' },
  'contact.subtitle': { sw: 'Tuko hapa kukusaidia. Wasiliana nasi wakati wowote.', en: 'We are here to help. Reach out anytime.' },
  'contact.name': { sw: 'Jina Lako', en: 'Your Name' },
  'contact.email': { sw: 'Barua Pepe', en: 'Email' },
  'contact.phone': { sw: 'Simu', en: 'Phone' },
  'contact.message': { sw: 'Ujumbe', en: 'Message' },
  'contact.send': { sw: 'Tuma Ujumbe', en: 'Send Message' },
  'contact.office': { sw: 'Ofisi Yetu', en: 'Our Office' },
  'contact.hours': { sw: 'Masaa ya Kazi', en: 'Working Hours' },
  'contact.hoursText': { sw: 'Jumatatu - Ijumaa: 8:00 - 18:00\nJumamosi: 9:00 - 14:00', en: 'Monday - Friday: 8:00 - 18:00\nSaturday: 9:00 - 14:00' },

  // POS Dashboard
  'pos.title': { sw: 'Skrini ya Mauzo', en: 'Sales Screen' },
  'pos.search': { sw: 'Tafuta bidhaa...', en: 'Search products...' },
  'pos.cart': { sw: 'Kikapu', en: 'Cart' },
  'pos.total': { sw: 'Jumla', en: 'Total' },
  'pos.pay.cash': { sw: 'Lipa Taslimu', en: 'Pay Cash' },
  'pos.pay.mpesa': { sw: 'M-Pesa', en: 'M-Pesa' },
  'pos.pay.tigo': { sw: 'Tigo Pesa', en: 'Tigo Pesa' },
  'pos.complete': { sw: 'Maliza Mauzo', en: 'Complete Sale' },
  'pos.empty': { sw: 'Kikapu tupu', en: 'Cart is empty' },

  // Common
  'common.language': { sw: 'Lugha', en: 'Language' },
  'common.swahili': { sw: 'Kiswahili', en: 'Swahili' },
  'common.english': { sw: 'Kiingereza', en: 'English' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('sw');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
