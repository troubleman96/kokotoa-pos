import { TourStep } from '@/contexts/OnboardingContext';

const clickElement = (selector: string) => {
    if (typeof document === 'undefined') return;
    const element = document.querySelector<HTMLElement>(selector);
    element?.click();
};

const openSettingsTab = (tabId: string) => () => clickElement(`[data-tour="settings-tab-${tabId}"]`);
const openReportsTab = (tabId: string) => () => clickElement(`[data-tour="reports-tab-${tabId}"]`);

export const dashboardTourSteps: TourStep[] = [
    {
        id: 'dashboard-welcome',
        target: '[data-tour="dashboard-title"]',
        title: {
            sw: 'Karibu kwenye Dashibodi',
            en: 'Welcome to Dashboard',
        },
        content: {
            sw: 'Hapa ndio muhtasari wa biashara yako: mauzo, faida, bidhaa, na tahadhari muhimu.',
            en: 'This is your business summary: sales, profit, products, and key alerts in one view.',
        },
        position: 'bottom',
    },
    {
        id: 'dashboard-stats',
        target: '[data-tour="stats-cards"]',
        title: {
            sw: 'Kadi za Takwimu',
            en: 'Stat Cards',
        },
        content: {
            sw: 'Kadi hizi zinaonyesha utendaji wa leo/mwezi na hali ya hesabu. Tumia kuzitambua mabadiliko ya haraka.',
            en: 'These cards show today/month performance and stock status so you can spot changes quickly.',
        },
        position: 'bottom',
    },
    {
        id: 'dashboard-sales-chart',
        target: '[data-tour="sales-chart"]',
        title: {
            sw: 'Mwenendo wa Mauzo',
            en: 'Sales Trend',
        },
        content: {
            sw: 'Grafu hii inaonyesha mwelekeo wa mauzo kwa siku 7 zilizopita.',
            en: 'This chart shows your sales trend over the last 7 days.',
        },
        position: 'top',
    },
    {
        id: 'dashboard-profit-chart',
        target: '[data-tour="profit-chart"]',
        title: {
            sw: 'Mwenendo wa Faida',
            en: 'Profit Trend',
        },
        content: {
            sw: 'Hii ni grafu ya faida ya kila siku. Tumia kufuatilia kama margin inaimarika au kushuka.',
            en: 'This is your daily profit chart. Use it to track whether margins are improving or dropping.',
        },
        position: 'top',
    },
    {
        id: 'dashboard-low-stock',
        target: '[data-tour="low-stock"]',
        title: {
            sw: 'Tahadhari ya Hesabu Chini',
            en: 'Low Stock Alert',
        },
        content: {
            sw: 'Ikiwa bidhaa zinakaribia kuisha, kadi hii itaonekana hapa na kukupa njia ya kwenda moja kwa moja kwenye hesabu.',
            en: 'When items run low, this card appears here and takes you directly to inventory restocking.',
        },
        position: 'top',
        nextPage: '/pos',
    },
];

export const posTourSteps: TourStep[] = [
    {
        id: 'pos-welcome',
        target: '[data-tour="pos-header"]',
        title: {
            sw: 'Skrini ya Mauzo',
            en: 'Sales Screen',
        },
        content: {
            sw: 'Hapa unachagua bidhaa, unaweka kwenye kikapu, na kukamilisha muamala.',
            en: 'This is where you pick products, build the cart, and complete a sale.',
        },
        position: 'bottom',
    },
    {
        id: 'pos-search',
        target: '[data-tour="product-search"]',
        title: {
            sw: 'Tafuta Bidhaa',
            en: 'Search Products',
        },
        content: {
            sw: 'Tafuta kwa jina la bidhaa, kisha tumia vichujio vya category ili upate haraka unachotaka.',
            en: 'Search by product name, then use category filters to find items faster.',
        },
        position: 'bottom',
    },
    {
        id: 'pos-products',
        target: '[data-tour="product-grid"]',
        title: {
            sw: 'Gridi ya Bidhaa',
            en: 'Product Grid',
        },
        content: {
            sw: 'Bonyeza bidhaa kuongeza kwenye kikapu. Bei na stock ya sasa vinaonekana kwenye kila kadi.',
            en: 'Tap a product to add it to cart. Each card shows price and current stock.',
        },
        position: 'right',
    },
    {
        id: 'pos-cart',
        target: '[data-tour="shopping-cart"]',
        title: {
            sw: 'Kikapu',
            en: 'Cart',
        },
        content: {
            sw: 'Hapa unarekebisha quantity, unaondoa bidhaa, na unaona jumla kabla ya kulipisha.',
            en: 'Adjust quantities, remove items, and confirm totals here before checkout.',
        },
        position: 'left',
    },
    {
        id: 'pos-payment',
        target: '[data-tour="payment-methods"]',
        title: {
            sw: 'Njia za Malipo',
            en: 'Payment Methods',
        },
        content: {
            sw: 'Chagua njia ya malipo: Taslimu, M-Pesa, au Bank.',
            en: 'Choose the payment method: Cash, M-Pesa, or Bank.',
        },
        position: 'top',
    },
    {
        id: 'pos-complete',
        target: '[data-tour="complete-sale"]',
        title: {
            sw: 'Kamilisha Mauzo',
            en: 'Complete Sale',
        },
        content: {
            sw: 'Bonyeza hapa kukamilisha muamala. Mfumo utaweka rekodi ya mauzo na kupunguza stock.',
            en: 'Click here to finalize the transaction. The system records the sale and deducts stock.',
        },
        position: 'top',
        nextPage: '/inventory',
    },
];

export const inventoryTourSteps: TourStep[] = [
    {
        id: 'inventory-welcome',
        target: '[data-tour="inventory-header"]',
        title: {
            sw: 'Usimamizi wa Hesabu',
            en: 'Inventory Management',
        },
        content: {
            sw: 'Hapa unasimamia bidhaa, bei, kiasi kilichobaki, na hali ya stock.',
            en: 'Manage products, pricing, available quantities, and stock health here.',
        },
        position: 'bottom',
    },
    {
        id: 'inventory-add',
        target: '[data-tour="add-product"]',
        title: {
            sw: 'Ongeza Bidhaa',
            en: 'Add Product',
        },
        content: {
            sw: 'Fungua fomu ya kuongeza bidhaa mpya pamoja na bei, unit, SKU, na kiwango cha chini cha stock.',
            en: 'Open the form to add a new product with pricing, unit, SKU, and minimum stock.',
        },
        position: 'bottom',
    },
    {
        id: 'inventory-list',
        target: '[data-tour="product-list"]',
        title: {
            sw: 'Orodha ya Bidhaa',
            en: 'Product List',
        },
        content: {
            sw: 'Hapa unaona bidhaa zote na unaweza kufungua maelezo, kuhariri, au kufuta.',
            en: 'See all products here and open details, edit, or delete as needed.',
        },
        position: 'top',
    },
    {
        id: 'inventory-stock',
        target: '[data-tour="stock-level"]',
        title: {
            sw: 'Kiwango cha Stock',
            en: 'Stock Level',
        },
        content: {
            sw: 'Namba hii inaonyesha stock ya sasa. Rangi ya tahadhari inaonyesha bidhaa zinazohitaji kuongeza.',
            en: 'This number is the current stock. Alert styling highlights items that need restocking.',
        },
        position: 'top',
    },
    {
        id: 'inventory-adjust',
        target: '[data-tour="adjust-stock"]',
        title: {
            sw: 'Rekebisha Stock',
            en: 'Adjust Stock',
        },
        content: {
            sw: 'Tumia kitufe hiki kurekebisha stock (ingizo, toleo, au kuweka kiasi halisi) na kuhifadhi sababu.',
            en: 'Use this action to adjust stock (in, out, or set exact) and save the reason.',
        },
        position: 'left',
        nextPage: '/stock-history',
    },
];

export const stockHistoryTourSteps: TourStep[] = [
    {
        id: 'stock-history-welcome',
        target: '[data-tour="stock-history-header"]',
        title: {
            sw: 'Historia ya Stock',
            en: 'Stock History',
        },
        content: {
            sw: 'Hapa unaona mabadiliko yote ya stock kwa uwazi wa ukaguzi.',
            en: 'This page gives a full audit trail of all stock movements.',
        },
        position: 'bottom',
    },
    {
        id: 'stock-history-filters',
        target: '[data-tour="stock-filters"]',
        title: {
            sw: 'Vichujio vya Historia',
            en: 'History Filters',
        },
        content: {
            sw: 'Chuja kwa bidhaa au aina ya movement ili kupata tukio unalotafuta haraka.',
            en: 'Filter by product or movement type to find specific events quickly.',
        },
        position: 'bottom',
    },
    {
        id: 'stock-history-list',
        target: '[data-tour="stock-movements-list"]',
        title: {
            sw: 'Orodha ya Movements',
            en: 'Movement List',
        },
        content: {
            sw: 'Kila mstari unaonyesha kiasi, aina ya movement, sababu, na muda.',
            en: 'Each row shows quantity change, movement type, reason, and timestamp.',
        },
        position: 'top',
        nextPage: '/sales-history',
    },
];

export const salesHistoryTourSteps: TourStep[] = [
    {
        id: 'sales-history-welcome',
        target: '[data-tour="sales-history-header"]',
        title: {
            sw: 'Historia ya Mauzo',
            en: 'Sales History',
        },
        content: {
            sw: 'Hapa unaona miamala yote iliyokamilika pamoja na muhtasari wa mapato na faida.',
            en: 'This page lists completed transactions with revenue and profit summaries.',
        },
        position: 'bottom',
    },
    {
        id: 'sales-history-search',
        target: '[data-tour="sales-search"]',
        title: {
            sw: 'Tafuta na Chuja',
            en: 'Search and Filter',
        },
        content: {
            sw: 'Tafuta kwa namba ya muamala, jina la mteja, au simu; chuja pia kwa njia ya malipo.',
            en: 'Search by transaction number, customer name, or phone; also filter by payment method.',
        },
        position: 'bottom',
    },
    {
        id: 'sales-history-list',
        target: '[data-tour="sales-list"]',
        title: {
            sw: 'Orodha ya Miamala',
            en: 'Transaction List',
        },
        content: {
            sw: 'Bonyeza muamala kuona maelezo kamili, bidhaa zilizouzwa, na taarifa za malipo.',
            en: 'Click any transaction to view full sale details, sold items, and payment info.',
        },
        position: 'top',
    },
    {
        id: 'sales-history-receipt',
        target: '[data-tour="sales-receipt-action"]',
        title: {
            sw: 'Toa Risiti Tena',
            en: 'Reprint Receipt',
        },
        content: {
            sw: 'Kitufe hiki kinakuruhusu kufungua risiti tena kwa mteja kwa kumbukumbu au uchapishaji.',
            en: 'Use this action to open and reprint a receipt for the customer.',
        },
        position: 'left',
        nextPage: '/reports',
    },
];

export const reportsTourSteps: TourStep[] = [
    {
        id: 'reports-welcome',
        target: '[data-tour="reports-header"]',
        title: {
            sw: 'Ripoti za Biashara',
            en: 'Business Reports',
        },
        content: {
            sw: 'Sehemu hii inaonyesha utendaji wa biashara kwa vipindi tofauti.',
            en: 'This section shows business performance across selectable time ranges.',
        },
        position: 'bottom',
    },
    {
        id: 'reports-filters',
        target: '[data-tour="reports-date-filter"]',
        title: {
            sw: 'Chagua Kipindi',
            en: 'Choose Time Range',
        },
        content: {
            sw: 'Badili kipindi (wiki, mwezi, miezi 3) ili kulinganisha mwenendo wa mauzo na faida.',
            en: 'Switch range (week, month, 3 months) to compare sales and profit trends.',
        },
        position: 'bottom',
    },
    {
        id: 'reports-tabs',
        target: '[data-tour="reports-tabs"]',
        title: {
            sw: 'Tabu za Ripoti',
            en: 'Report Tabs',
        },
        content: {
            sw: 'Tabu hizi zinagawanya ripoti kwa muhtasari, takwimu, mauzo, faida, na hesabu.',
            en: 'These tabs organize reports into overview, analytics, sales, profit, and inventory.',
        },
        position: 'top',
    },
    {
        id: 'reports-export',
        target: '[data-tour="reports-export"]',
        title: {
            sw: 'Pakua Ripoti',
            en: 'Export Report',
        },
        content: {
            sw: 'Pakua data ya mauzo kama CSV kwa uchambuzi wa nje au kushirikisha timu.',
            en: 'Export sales data as CSV for external analysis or team sharing.',
        },
        position: 'left',
        action: openReportsTab('sales'),
        nextPage: '/settings',
    },
];

export const settingsTourSteps: TourStep[] = [
    {
        id: 'settings-welcome',
        target: '[data-tour="settings-header"]',
        title: {
            sw: 'Mipangilio',
            en: 'Settings',
        },
        content: {
            sw: 'Hapa unasimamia akaunti, usalama, taarifa za duka, na tabia ya mfumo wa mauzo.',
            en: 'Manage account details, security, store info, and POS behavior here.',
        },
        position: 'bottom',
    },
    {
        id: 'settings-tabs',
        target: '[data-tour="settings-tab-profile"]',
        title: {
            sw: 'Tabu za Mipangilio',
            en: 'Settings Tabs',
        },
        content: {
            sw: 'Tumia tabu hizi kubadilisha sehemu tofauti bila kutoka kwenye ukurasa huu.',
            en: 'Use these tabs to switch between settings sections without leaving this page.',
        },
        position: 'bottom',
    },
    {
        id: 'settings-profile',
        target: '[data-tour="profile-section"]',
        title: {
            sw: 'Wasifu wa Mtumiaji',
            en: 'User Profile',
        },
        content: {
            sw: 'Hariri jina na barua pepe ya mtumiaji; simu inaendelea kuwa namba ya akaunti.',
            en: 'Update user name and email; phone remains your account identifier.',
        },
        position: 'right',
        action: openSettingsTab('profile'),
    },
    {
        id: 'settings-security',
        target: '[data-tour="security-section"]',
        title: {
            sw: 'Usalama wa Akaunti',
            en: 'Account Security',
        },
        content: {
            sw: 'Badilisha nenosiri ili kulinda akaunti na kupunguza hatari ya ufikiaji usioruhusiwa.',
            en: 'Change your password to protect account access and reduce security risk.',
        },
        position: 'right',
        action: openSettingsTab('password'),
    },
    {
        id: 'settings-store',
        target: '[data-tour="store-info"]',
        title: {
            sw: 'Taarifa za Duka',
            en: 'Store Information',
        },
        content: {
            sw: 'Wamiliki wanaweza kusasisha jina la duka, eneo, simu, na maelezo ya risiti.',
            en: 'Owners can update store name, location, phone, and receipt-facing details.',
        },
        position: 'right',
        action: openSettingsTab('store'),
    },
    {
        id: 'settings-subscription',
        target: '[data-tour="subscription-status"]',
        title: {
            sw: 'Usajili na Kikomo cha Maduka',
            en: 'Subscription and Store Limit',
        },
        content: {
            sw: 'Hapa unaona mpango wako wa sasa, kikomo cha maduka, na wakati wa kuboresha kifurushi.',
            en: 'View your current plan, store limit usage, and when to upgrade.',
        },
        position: 'right',
        action: openSettingsTab('subscription'),
    },
    {
        id: 'settings-sales',
        target: '[data-tour="receipt-customization"]',
        title: {
            sw: 'Mipangilio ya Mauzo',
            en: 'Sales Preferences',
        },
        content: {
            sw: 'Dhibiti tabia ya POS kama kufungua risiti moja kwa moja baada ya muamala.',
            en: 'Control POS behavior such as automatically showing receipts after sale.',
        },
        position: 'right',
        action: openSettingsTab('sales'),
        nextPage: '/users',
    },
];

export const usersTourSteps: TourStep[] = [
    {
        id: 'users-welcome',
        target: '[data-tour="users-header"]',
        title: {
            sw: 'Usimamizi wa Watumiaji',
            en: 'User Management',
        },
        content: {
            sw: 'Hapa unaongeza na kusimamia watumiaji wa duka lako kulingana na majukumu yao.',
            en: 'Add and manage store users based on their role responsibilities.',
        },
        position: 'bottom',
    },
    {
        id: 'users-add',
        target: '[data-tour="add-user"]',
        title: {
            sw: 'Ongeza Mtumiaji',
            en: 'Add User',
        },
        content: {
            sw: 'Unda mtumiaji mpya kwa kuweka jina, simu, nenosiri, na jukumu.',
            en: 'Create a new user with name, phone, password, and role.',
        },
        position: 'bottom',
    },
    {
        id: 'users-list',
        target: '[data-tour="users-list"]',
        title: {
            sw: 'Orodha ya Watumiaji',
            en: 'Users List',
        },
        content: {
            sw: 'Orodha hii inaonyesha hali ya kila mtumiaji, store, na vitendo vya kuhariri au kufuta.',
            en: 'This list shows each user status, store, and actions to edit or delete.',
        },
        position: 'top',
    },
    {
        id: 'users-roles',
        target: '[data-tour="user-roles"]',
        title: {
            sw: 'Majukumu ya Watumiaji',
            en: 'User Roles',
        },
        content: {
            sw: 'Roles kama Cashier na Staff huzuia ufikiaji kwa mujibu wa kazi zao.',
            en: 'Roles like Cashier and Staff control access based on daily responsibilities.',
        },
        position: 'top',
    },
];
