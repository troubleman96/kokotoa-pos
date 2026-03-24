type LandingLanguage = 'sw' | 'en';

type LandingContent = {
  hero: {
    title: {
      lineOne: string;
      lineTwo: string;
      highlight: string;
    };
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trustedBy: string;
    proofPoints: string[];
    preview: {
      storeName: string;
      status: string;
      products: Array<{
        name: string;
        price: string;
        emoji: string;
      }>;
      itemCount: string;
      total: string;
      checkout: string;
      inventoryLabel: string;
      inventoryValue: string;
      salesLabel: string;
      salesValue: string;
    };
  };
  benefits: {
    title: string;
    subtitle: string;
    items: Array<{
      tag: string;
      title: string;
      description: string;
    }>;
  };
  audience: {
    title: string;
    subtitle: string;
    businessesTitle: string;
    businesses: Array<{
      name: string;
      description: string;
    }>;
    painsTitle: string;
    pains: string[];
    compare: {
      beforeTitle: string;
      afterTitle: string;
      before: string[];
      after: string[];
    };
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
    note: string;
  };
  proof: {
    title: string;
    subtitle: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
    notes: string[];
  };
  packages: {
    title: string;
    subtitle: string;
    badge: string;
    name: string;
    priceSuffix: string;
    features: string[];
    cta: string;
    note: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
    notes: string[];
  };
};

export const landingContent: Record<LandingLanguage, LandingContent> = {
  sw: {
    hero: {
      title: {
        lineOne: 'Mfumo wa Kisasa wa',
        lineTwo: 'Mauzo na Stock',
        highlight: 'Jua Faida Zako',
      },
      subtitle:
        'Mfumo rahisi kwa biashara za Tanzania kuuza haraka, kufuatilia bidhaa, na kuona faida ya biashara yako bila usumbufu.',
      primaryCta: 'Ingia',
      secondaryCta: 'Lipia sasa',
      trustedBy: '',
      proofPoints: [],
      preview: {
        storeName: 'Duka la Mjini',
        status: 'Mtandaoni',
        products: [
          { name: 'Soda', price: '1,500', emoji: '🥤' },
          { name: 'Mkate', price: '2,000', emoji: '🍞' },
          { name: 'Mayai', price: '500', emoji: '🥚' },
          { name: 'Maziwa', price: '3,000', emoji: '🥛' },
          { name: 'Sukari', price: '4,500', emoji: '🍬' },
          { name: 'Mchele', price: '8,000', emoji: '🍚' },
        ],
        itemCount: 'Bidhaa 3',
        total: 'TSh 6,500',
        checkout: 'Kamilisha Mauzo',
        inventoryLabel: 'Bidhaa karibu kuisha',
        inventoryValue: '12',
        salesLabel: 'Faida wiki hii',
        salesValue: 'TSh 450K',
      },
    },
    benefits: {
      title: 'Faida za KOKOTOA',
      subtitle: 'Kuuza, kufuatilia stock, na kuona faida kwa urahisi.',
      items: [
        {
          tag: 'Mauzo',
          title: 'Ongeza Udhibiti wa Mauzo',
          description:
            'Fuatilia kila mauzo kwa usahihi na ujue biashara yako inaingiza kiasi gani kila siku.',
        },
        {
          tag: 'Stoo',
          title: 'Zuia Upotevu wa Stock',
          description:
            'Jua bidhaa zinazoisha, zinazosimama, na zinazopotea kabla hazijaleta hasara.',
        },
        {
          tag: 'Faida',
          title: 'Jua Faida Zako Halisi',
          description:
            'Pata ripoti rahisi zinazoonyesha biashara yako ipo wapi na inaenda wapi.',
        },
        {
          tag: 'Timu',
          title: 'Simamia Wafanyakazi Vizuri',
          description:
            'Angalia miamala, uwajibikaji na utendaji wa timu yako bila usumbufu.',
        },
        {
          tag: 'Maamuzi',
          title: 'Fanya Maamuzi Bora ya Biashara',
          description:
            'Tambua bidhaa zinazouza zaidi na muda ambao biashara yako inafanya vizuri.',
        },
        {
          tag: 'Popote',
          title: 'Endesha Biashara Popote Ulipo',
          description:
            'Usiwe dukani muda wote kujua kinachoendelea kwenye biashara yako.',
        },
      ],
    },
    audience: {
      title: 'Inafaa kwa Nani?',
      subtitle:
        'KOKOTOA imejengwa kwa biashara zinazotaka mfumo rahisi kuliko daftari na usimamizi wa kukisia.',
      businessesTitle: 'Biashara zinazonufaika haraka',
      businesses: [
        {
          name: 'Duka la rejareja',
          description: 'Kwa mauzo ya kila siku na stock inayobadilika mara kwa mara.',
        },
        {
          name: 'Boutique',
          description: 'Kwa bidhaa zenye size, rangi na bei tofauti.',
        },
        {
          name: 'Pharmacy',
          description: 'Kwa udhibiti wa stock, risiti na huduma ya haraka.',
        },
        {
          name: 'Hardware',
          description: 'Kwa bidhaa nyingi na ufuatiliaji wa kina wa stoo.',
        },
        {
          name: 'Mini market',
          description: 'Kwa mauzo mengi na njia tofauti za malipo kila siku.',
        },
        {
          name: 'Salon na spa',
          description: 'Kwa kusimamia huduma, bidhaa na wateja kwa utaratibu.',
        },
      ],
      painsTitle: 'Maumivu tunayoyatatua',
      pains: [
        'Kutokujua faida ya kweli ya biashara kila siku.',
        'Kuishiwa stock bila kuona taarifa mapema.',
        'Wafanyakazi kutorekodi mauzo kwa usahihi.',
        'Ripoti kuchukua muda mrefu kutengeneza.',
        'Owner kushindwa kuona biashara akiwa mbali.',
      ],
      compare: {
        beforeTitle: 'Bila KOKOTOA',
        afterTitle: 'Na KOKOTOA',
        before: [
          'Mauzo yanaandikwa kwenye daftari au kukadiriwa.',
          'Stock haionekani wazi hadi bidhaa ziishe.',
          'Ripoti zinahitaji muda na makaratasi mengi.',
          'Owner haoni kinachoendelea akiwa mbali na duka.',
        ],
        after: [
          'Mauzo yanarekodiwa papo hapo kwenye mfumo.',
          'Stock inaonekana mapema kabla ya kuleta hasara.',
          'Ripoti zinapatikana haraka na ni rahisi kuelewa.',
          'Owner anaweza kusimamia biashara popote alipo.',
        ],
      },
    },
    howItWorks: {
      title: 'Jinsi KOKOTOA Inavyofanya Kazi',
      subtitle:
        'Unahitaji hatua chache tu kuanza kuona mauzo, stock na taarifa za biashara yako.',
      steps: [
        {
          title: 'Sajili biashara yako',
          description: 'Fungua akaunti na weka taarifa muhimu za duka lako ndani ya dakika chache.',
        },
        {
          title: 'Ongeza bidhaa na bei',
          description: 'Ingiza bidhaa, kiasi kilichopo na bei za kuuza mara moja.',
        },
        {
          title: 'Anza kuuza na kufuatilia',
          description: 'Rekodi mauzo, fuatilia stock na soma ripoti kila siku kwa urahisi.',
        },
      ],
      note: 'Hakuna usanidi mgumu. Timu yako inaweza kuanza kutumia mfumo kwa muda mfupi.',
    },
    proof: {
      title: 'Ushahidi Unaosaidia Uamini Haraka',
      subtitle:
        'Haya ni mambo ambayo wafanyabiashara wengi hutafuta kabla ya kuamua kuhamia kwenye mfumo.',
      stats: [
        { value: '1,000+', label: 'biashara zinatumia KOKOTOA' },
        { value: '5M+', label: 'miamala imeshachakatwa' },
        { value: '26', label: 'mikoa imefikiwa Tanzania' },
        { value: 'Dakika 5', label: 'kuanza kutumia mfumo' },
      ],
      notes: [
        'Mauzo, stock na ripoti vinaonekana kwenye sehemu moja.',
        'Mfumo unafanya kazi kwenye simu, tablet au kompyuta.',
        'Maduka mengi yanaweza kusimamiwa kwenye akaunti moja.',
        'Ripoti zimeandikwa kwa lugha rahisi kwa owner na timu.',
      ],
    },
    packages: {
      title: 'Anza na Kifurushi Kinachotosha Biashara Yako',
      subtitle:
        'Baada ya kuona thamani ya mfumo, chagua package inayokupa usimamizi wa mauzo, stock na ripoti kwa gharama rahisi.',
      badge: 'Maarufu',
      name: 'Premium Package',
      priceSuffix: '/mwezi',
      features: [
        'Hadi maduka 3 kwenye akaunti moja',
        'Watumiaji 10 kwa kila duka',
        'Bidhaa hadi 5,000',
        'Ripoti na takwimu za biashara',
        'Usimamizi wa stock na wafanyakazi',
        'Arifa za SMS',
      ],
      cta: 'Anza Sasa',
      note: 'Hakuna malipo ya kuanza. Inafaa kwa biashara ndogo na za kati.',
    },
    cta: {
      title: 'Anza kuona biashara yako kwa uwazi zaidi',
      subtitle:
        'Jaribu KOKOTOA uone mauzo, stock na faida zako bila makaratasi mengi wala usumbufu.',
      button: 'Fungua Akaunti',
      notes: ['Hakuna malipo ya kuanza', 'Usanidi wa haraka', 'Msaada wa Kiswahili'],
    },
  },
  en: {
    hero: {
      title: {
        lineOne: 'Manage Sales and',
        lineTwo: 'Stock',
        highlight: 'See Your Profit',
      },
      subtitle:
        'A simple system for Tanzanian businesses to sell faster, track stock, and see profit clearly without extra admin.',
      primaryCta: 'Login',
      secondaryCta: 'Subscribe',
      trustedBy: 'Trusted by 1,000+ businesses in Tanzania',
      proofPoints: [
        'Start in 5 minutes',
        'Swahili-first experience',
        'No upfront payment',
        'Easy-to-read reports',
      ],
      preview: {
        storeName: 'City Store',
        status: 'Online',
        products: [
          { name: 'Soda', price: '1,500', emoji: '🥤' },
          { name: 'Bread', price: '2,000', emoji: '🍞' },
          { name: 'Eggs', price: '500', emoji: '🥚' },
          { name: 'Milk', price: '3,000', emoji: '🥛' },
          { name: 'Sugar', price: '4,500', emoji: '🍬' },
          { name: 'Rice', price: '8,000', emoji: '🍚' },
        ],
        itemCount: '3 items',
        total: 'TSh 6,500',
        checkout: 'Complete Sale',
        inventoryLabel: 'Low-stock items',
        inventoryValue: '12',
        salesLabel: "This week's profit",
        salesValue: 'TSh 450K',
      },
    },
    benefits: {
      title: 'KOKOTOA Benefits',
      subtitle: 'Sell, track stock, and see profit with ease.',
      items: [
        {
          tag: 'Sales',
          title: 'Get Better Control of Sales',
          description:
            'Track every sale accurately and know how much your business brings in each day.',
        },
        {
          tag: 'Stock',
          title: 'Reduce Stock Loss',
          description:
            'See what is running out, what is slow-moving, and what is going missing before it creates losses.',
        },
        {
          tag: 'Profit',
          title: 'See Your Real Profit',
          description:
            'Get simple reports that show where your business stands and where it is going.',
        },
        {
          tag: 'Team',
          title: 'Manage Staff with Clarity',
          description:
            'Review transactions, accountability, and team performance without extra effort.',
        },
        {
          tag: 'Decisions',
          title: 'Make Better Business Decisions',
          description:
            'Identify the products that sell most and the hours when your business performs best.',
        },
        {
          tag: 'Anywhere',
          title: 'Run the Business from Anywhere',
          description:
            'You do not need to stay in the shop all day to know what is happening.',
        },
      ],
    },
    audience: {
      title: 'Who Is It For?',
      subtitle:
        'KOKOTOA is built for businesses that want something simpler and clearer than notebooks and guesswork.',
      businessesTitle: 'Businesses that benefit quickly',
      businesses: [
        {
          name: 'Retail shops',
          description: 'For everyday sales and stock that changes often.',
        },
        {
          name: 'Boutiques',
          description: 'For products with different sizes, colors, and prices.',
        },
        {
          name: 'Pharmacies',
          description: 'For stock control, receipts, and faster customer service.',
        },
        {
          name: 'Hardware stores',
          description: 'For large product catalogs and deeper stock visibility.',
        },
        {
          name: 'Mini markets',
          description: 'For many daily sales and different payment methods.',
        },
        {
          name: 'Salons and spas',
          description: 'For organizing services, products, and customer flow.',
        },
      ],
      painsTitle: 'Problems we solve',
      pains: [
        'Not knowing the real profit of the business every day.',
        'Running out of stock without early visibility.',
        'Staff not recording sales accurately.',
        'Reports taking too long to prepare.',
        'Owners losing visibility when away from the shop.',
      ],
      compare: {
        beforeTitle: 'Without KOKOTOA',
        afterTitle: 'With KOKOTOA',
        before: [
          'Sales are written in notebooks or estimated.',
          'Stock problems appear only after products run out.',
          'Reports take time and too much paperwork.',
          'Owners cannot see what is happening when they are away.',
        ],
        after: [
          'Sales are recorded instantly in the system.',
          'Stock is visible early before losses happen.',
          'Reports are fast and easy to understand.',
          'Owners can manage the business from anywhere.',
        ],
      },
    },
    howItWorks: {
      title: 'How KOKOTOA Works',
      subtitle:
        'You only need a few steps to start seeing your sales, stock, and business performance clearly.',
      steps: [
        {
          title: 'Register your business',
          description: 'Create an account and add your store details in a few minutes.',
        },
        {
          title: 'Add products and prices',
          description: 'Enter products, quantities on hand, and selling prices once.',
        },
        {
          title: 'Sell and track performance',
          description: 'Record sales, monitor stock, and read reports every day with ease.',
        },
      ],
      note: 'There is no complicated setup. Your team can learn the system quickly.',
    },
    proof: {
      title: 'Proof That Builds Trust Quickly',
      subtitle:
        'These are the signals many business owners want before moving from manual work to a system.',
      stats: [
        { value: '1,000+', label: 'businesses using KOKOTOA' },
        { value: '5M+', label: 'transactions processed' },
        { value: '26', label: 'regions reached in Tanzania' },
        { value: '5 min', label: 'to start using the system' },
      ],
      notes: [
        'Sales, stock, and reports are visible in one place.',
        'The system works on phone, tablet, or computer.',
        'Multiple stores can be managed from one account.',
        'Reports are written in simple language for owners and staff.',
      ],
    },
    packages: {
      title: 'Start with a Package That Fits Your Business',
      subtitle:
        'Once the value is clear, choose a package that gives you sales, stock, and reporting control at a practical cost.',
      badge: 'Popular',
      name: 'Premium Package',
      priceSuffix: '/month',
      features: [
        'Up to 3 stores in one account',
        '10 users per store',
        'Up to 5,000 products',
        'Business reports and analytics',
        'Stock and staff management',
        'SMS alerts',
      ],
      cta: 'Get Started',
      note: 'No upfront payment. Suitable for small and medium businesses.',
    },
    cta: {
      title: 'Start seeing your business more clearly',
      subtitle:
        'Try KOKOTOA and track sales, stock, and profit without paperwork or confusion.',
      button: 'Create Account',
      notes: ['No upfront payment', 'Fast setup', 'Swahili support'],
    },
  },
};
