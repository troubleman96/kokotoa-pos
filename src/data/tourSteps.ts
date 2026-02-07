import { TourStep } from '@/contexts/OnboardingContext';

export const dashboardTourSteps: TourStep[] = [
    {
        id: 'dashboard-welcome',
        target: '[data-tour="dashboard-header"]',
        title: {
            sw: 'Karibu kwenye Dashibodi! 📊',
            en: 'Welcome to Dashboard! 📊',
        },
        content: {
            sw: 'Hapa ndipo utakapopata muhtasari kamili wa biashara yako. Angalia mauzo, faida, na takwimu muhimu zote mahali pamoja.',
            en: 'This is your business command center. View sales, profits, and all important metrics in one place.',
        },
        position: 'bottom',
    },
    {
        id: 'dashboard-stats',
        target: '[data-tour="stats-cards"]',
        title: {
            sw: 'Takwimu za Haraka 💰',
            en: 'Quick Stats 💰',
        },
        content: {
            sw: 'Kadi hizi zinaonyesha jumla ya mauzo, idadi ya bidhaa, na faida yako. Zinasasishwa moja kwa moja baada ya kila mauzo.',
            en: 'These cards show your total sales, product count, and profit. They update in real-time after each sale.',
        },
        position: 'bottom',
    },
    {
        id: 'dashboard-charts',
        target: '[data-tour="sales-chart"]',
        title: {
            sw: 'Grafu za Mauzo 📈',
            en: 'Sales Charts 📈',
        },
        content: {
            sw: 'Fuatilia mwenendo wa mauzo na faida yako kwa siku 30 zilizopita. Grafu hizi zinakusaidia kuona jinsi biashara yako inavyoendelea.',
            en: 'Track your sales and profit trends over the last 30 days. These charts help you see how your business is performing.',
        },
        position: 'top',
    },
    {
        id: 'dashboard-top-products',
        target: '[data-tour="top-products"]',
        title: {
            sw: 'Bidhaa Zinazouzwa Zaidi 🏆',
            en: 'Top Selling Products 🏆',
        },
        content: {
            sw: 'Angalia bidhaa 5 zinazouzwa zaidi. Hii inakusaidia kujua ni bidhaa zipi zinafanya vizuri na unahitaji kuongeza hesabu.',
            en: 'See your top 5 best-selling products. This helps you know which items are performing well and need restocking.',
        },
        position: 'top',
    },
    {
        id: 'dashboard-low-stock',
        target: '[data-tour="low-stock"]',
        title: {
            sw: 'Tahadhari za Hesabu 🔔',
            en: 'Stock Alerts 🔔',
        },
        content: {
            sw: 'Bidhaa zenye hesabu chini zinaonyeshwa hapa. Hakikisha unaongeza hesabu mapema ili usiishie bidhaa.',
            en: 'Products with low stock are shown here. Make sure to restock early to avoid running out.',
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
            sw: 'Sehemu ya Mauzo 🛒',
            en: 'Sales Section 🛒',
        },
        content: {
            sw: 'Hapa ndipo unaporekodi mauzo yako. Chagua bidhaa, ongeza kwenye mkokoteni, na maliza mauzo haraka na kwa urahisi.',
            en: 'This is where you record your sales. Select products, add to cart, and complete sales quickly and easily.',
        },
        position: 'bottom',
    },
    {
        id: 'pos-search',
        target: '[data-tour="product-search"]',
        title: {
            sw: 'Tafuta Bidhaa 🔍',
            en: 'Search Products 🔍',
        },
        content: {
            sw: 'Tumia kisanduku hiki kutafuta bidhaa kwa jina. Unaweza pia kuchuja kwa aina ya bidhaa.',
            en: 'Use this box to search for products by name. You can also filter by product category.',
        },
        position: 'bottom',
    },
    {
        id: 'pos-products',
        target: '[data-tour="product-grid"]',
        title: {
            sw: 'Orodha ya Bidhaa 📦',
            en: 'Product List 📦',
        },
        content: {
            sw: 'Bofya bidhaa kuongeza kwenye mkokoteni. Hesabu inayopatikana inaonyeshwa kwenye kila bidhaa.',
            en: 'Click on a product to add it to the cart. Available stock is shown on each product.',
        },
        position: 'right',
    },
    {
        id: 'pos-cart',
        target: '[data-tour="shopping-cart"]',
        title: {
            sw: 'Mkokoteni wa Ununuzi 🛒',
            en: 'Shopping Cart 🛒',
        },
        content: {
            sw: 'Bidhaa zilizoongezwa zinaonyeshwa hapa. Unaweza kubadilisha idadi au kuondoa bidhaa kabla ya kumaliza mauzo.',
            en: 'Added products are shown here. You can change quantities or remove items before completing the sale.',
        },
        position: 'left',
    },
    {
        id: 'pos-payment',
        target: '[data-tour="payment-methods"]',
        title: {
            sw: 'Njia za Malipo 💳',
            en: 'Payment Methods 💳',
        },
        content: {
            sw: 'Chagua njia ya malipo: Taslimu, M-Pesa, au Kadi. Kila njia ina fomu yake ya malipo.',
            en: 'Choose payment method: Cash, M-Pesa, or Card. Each method has its own payment form.',
        },
        position: 'top',
    },
    {
        id: 'pos-complete',
        target: '[data-tour="complete-sale"]',
        title: {
            sw: 'Maliza Mauzo ✅',
            en: 'Complete Sale ✅',
        },
        content: {
            sw: 'Bofya hapa kumaliza mauzo. Risiti kutolewa moja kwa moja na hesabu itasasishwa.',
            en: 'Click here to complete the sale. A receipt will be generated automatically and stock will be updated.',
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
            sw: 'Usimamizi wa Bidhaa 📦',
            en: 'Inventory Management 📦',
        },
        content: {
            sw: 'Dhibiti bidhaa zako zote hapa. Ongeza bidhaa mpya, badilisha bei, na fuatilia hesabu.',
            en: 'Manage all your products here. Add new products, update prices, and track stock levels.',
        },
        position: 'bottom',
    },
    {
        id: 'inventory-add',
        target: '[data-tour="add-product"]',
        title: {
            sw: 'Ongeza Bidhaa Mpya ➕',
            en: 'Add New Product ➕',
        },
        content: {
            sw: 'Bofya hapa kuongeza bidhaa mpya. Weka jina, bei, hesabu, na picha ya bidhaa.',
            en: 'Click here to add a new product. Enter name, price, stock quantity, and product image.',
        },
        position: 'bottom',
    },
    {
        id: 'inventory-list',
        target: '[data-tour="product-list"]',
        title: {
            sw: 'Orodha ya Bidhaa 📋',
            en: 'Product List 📋',
        },
        content: {
            sw: 'Bidhaa zako zote zinaonyeshwa hapa. Unaweza kuhariri, kuongeza hesabu, au kufuta bidhaa.',
            en: 'All your products are displayed here. You can edit, adjust stock, or delete products.',
        },
        position: 'top',
    },
    {
        id: 'inventory-stock',
        target: '[data-tour="stock-level"]',
        title: {
            sw: 'Kiwango cha Hesabu 📊',
            en: 'Stock Levels 📊',
        },
        content: {
            sw: 'Angalia hesabu ya kila bidhaa. Rangi nyekundu inaonyesha hesabu chini inayohitaji kuongezwa.',
            en: 'View stock quantity for each product. Red color indicates low stock that needs restocking.',
        },
        position: 'top',
    },
    {
        id: 'inventory-adjust',
        target: '[data-tour="adjust-stock"]',
        title: {
            sw: 'Rekebisha Hesabu 🔄',
            en: 'Adjust Stock 🔄',
        },
        content: {
            sw: 'Tumia hii kuongeza au kupunguza hesabu moja kwa moja. Sababu za mabadiliko zitarekodiwa.',
            en: 'Use this to increase or decrease stock manually. Reasons for changes will be recorded.',
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
            sw: 'Logi ya Bidhaa 📋',
            en: 'Stock History 📋',
        },
        content: {
            sw: 'Hapa unaweza kuona historia kamili ya mabadiliko yote ya hesabu. Kila mabadiliko yanarekodishwa kwa usalama.',
            en: 'Here you can see complete history of all stock changes. Every movement is securely recorded.',
        },
        position: 'bottom',
    },
    {
        id: 'stock-history-filters',
        target: '[data-tour="stock-filters"]',
        title: {
            sw: 'Chuja Logi 🔍',
            en: 'Filter History 🔍',
        },
        content: {
            sw: 'Tumia vichujio kutafuta mabadiliko ya bidhaa maalum au aina ya mabadiliko (kuongeza, kupunguza, mauzo).',
            en: 'Use filters to find movements for specific products or movement types (restock, adjustment, sale).',
        },
        position: 'bottom',
    },
    {
        id: 'stock-history-list',
        target: '[data-tour="stock-movements-list"]',
        title: {
            sw: 'Orodha ya Mabadiliko 📊',
            en: 'Movement List 📊',
        },
        content: {
            sw: 'Kila mabadiliko yanaonyesha bidhaa, aina, kiasi, na sababu. Hii inasaidia kufuatilia hesabu yako.',
            en: 'Each movement shows product, type, quantity, and reason. This helps track your inventory.',
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
            sw: 'Historia ya Mauzo 🧾',
            en: 'Sales History 🧾',
        },
        content: {
            sw: 'Angalia rekodi zote za mauzo yako. Unaweza kutazama maelezo, kuchapisha risiti, na kufuatilia malipo.',
            en: 'View all your sales records. You can see details, print receipts, and track payments.',
        },
        position: 'bottom',
    },
    {
        id: 'sales-history-search',
        target: '[data-tour="sales-search"]',
        title: {
            sw: 'Tafuta Mauzo 🔍',
            en: 'Search Sales 🔍',
        },
        content: {
            sw: 'Tafuta mauzo kwa jina la mteja au nambari ya risiti. Unaweza pia kuchuja kwa tarehe.',
            en: 'Search sales by customer name or receipt number. You can also filter by date.',
        },
        position: 'bottom',
    },
    {
        id: 'sales-history-list',
        target: '[data-tour="sales-list"]',
        title: {
            sw: 'Orodha ya Mauzo 📋',
            en: 'Sales List 📋',
        },
        content: {
            sw: 'Kila mauzo yanaonyesha jumla, njia ya malipo, na tarehe. Bofya kuona maelezo zaidi.',
            en: 'Each sale shows total, payment method, and date. Click to view more details.',
        },
        position: 'top',
    },
    {
        id: 'sales-history-receipt',
        target: '[data-tour="sales-receipt-action"]',
        title: {
            sw: 'Chapisha Risiti 🖨️',
            en: 'Print Receipt 🖨️',
        },
        content: {
            sw: 'Unaweza kuchapisha risiti tena kwa mteja. Risiti zinaonyesha bidhaa zote na jumla.',
            en: 'You can reprint receipts for customers. Receipts show all items and totals.',
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
            sw: 'Ripoti za Biashara 📊',
            en: 'Business Reports 📊',
        },
        content: {
            sw: 'Angalia takwimu kamili za biashara yako. Ripoti zinakusaidia kufanya maamuzi sahihi.',
            en: 'View comprehensive business analytics. Reports help you make informed decisions.',
        },
        position: 'bottom',
    },
    {
        id: 'reports-filters',
        target: '[data-tour="reports-date-filter"]',
        title: {
            sw: 'Chagua Muda 📅',
            en: 'Select Period 📅',
        },
        content: {
            sw: 'Chagua tarehe za kuanza na kumalizia ili kuona ripoti za kipindi maalum.',
            en: 'Select start and end dates to view reports for a specific period.',
        },
        position: 'bottom',
    },
    {
        id: 'reports-charts',
        target: '[data-tour="reports-tabs"]',
        title: {
            sw: 'Grafu za Takwimu 📈',
            en: 'Analytics Charts 📈',
        },
        content: {
            sw: 'Grafu zinaonyesha mwenendo wa mauzo, faida, na bidhaa zinazouzwa zaidi. Rahisi kuelewa.',
            en: 'Charts show sales trends, profit, and top products. Easy to understand at a glance.',
        },
        position: 'top',
    },
    {
        id: 'reports-export',
        target: '[data-tour="reports-export"]',
        title: {
            sw: 'Pakua Ripoti 💾',
            en: 'Export Reports 💾',
        },
        content: {
            sw: 'Pakua ripoti kama faili za CSV kwa ajili ya Excel au uchambuzi zaidi.',
            en: 'Download reports as CSV files for Excel or further analysis.',
        },
        position: 'left',
        nextPage: '/settings',
    },
];

export const settingsTourSteps: TourStep[] = [
    {
        id: 'settings-welcome',
        target: '[data-tour="settings-header"]',
        title: {
            sw: 'Mipangilio ⚙️',
            en: 'Settings ⚙️',
        },
        content: {
            sw: 'Dhibiti taarifa zako binafsi, duka lako, na usalama wa akaunti yako.',
            en: 'Manage your personal information, store details, and account security.',
        },
        position: 'bottom',
    },
    {
        id: 'settings-profile',
        target: '[data-tour="profile-section"]',
        title: {
            sw: 'Taarifa Binafsi 👤',
            en: 'Personal Information 👤',
        },
        content: {
            sw: 'Badilisha jina lako, nambari ya simu, na barua pepe. Taarifa hizi zinaonyeshwa kwenye risiti.',
            en: 'Update your name, phone number, and email. This information appears on receipts.',
        },
        position: 'right',
    },
    {
        id: 'settings-store',
        target: '[data-tour="store-section"]',
        title: {
            sw: 'Taarifa za Duka 🏪',
            en: 'Store Information 🏪',
        },
        content: {
            sw: 'Badilisha jina la duka, anwani, na nambari ya simu. Taarifa hizi zinaonyeshwa kwenye risiti.',
            en: 'Update store name, address, and phone. This information appears on receipts.',
        },
        position: 'right',
    },
    {
        id: 'settings-security',
        target: '[data-tour="security-section"]',
        title: {
            sw: 'Usalama 🔒',
            en: 'Security 🔒',
        },
        content: {
            sw: 'Badilisha nywila yako mara kwa mara kwa usalama zaidi. Tumia nywila ngumu.',
            en: 'Change your password regularly for better security. Use a strong password.',
        },
        position: 'right',
        nextPage: '/users',
    },
];

export const usersTourSteps: TourStep[] = [
    {
        id: 'users-welcome',
        target: '[data-tour="users-header"]',
        title: {
            sw: 'Usimamizi wa Wafanyakazi 👥',
            en: 'Staff Management 👥',
        },
        content: {
            sw: 'Ongeza na dhibiti wafanyakazi wako. Weka majukumu na ruhusa kwa kila mfanyakazi.',
            en: 'Add and manage your staff. Set roles and permissions for each employee.',
        },
        position: 'bottom',
    },
    {
        id: 'users-add',
        target: '[data-tour="add-user"]',
        title: {
            sw: 'Ongeza Mfanyakazi ➕',
            en: 'Add Staff ➕',
        },
        content: {
            sw: 'Bofya hapa kuongeza mfanyakazi mpya. Weka jina, nambari ya simu, na jukumu.',
            en: 'Click here to add a new staff member. Enter name, phone number, and role.',
        },
        position: 'bottom',
    },
    {
        id: 'users-roles',
        target: '[data-tour="user-list"]',
        title: {
            sw: 'Majukumu ya Wafanyakazi 🎭',
            en: 'Staff Roles 🎭',
        },
        content: {
            sw: 'Kuna majukumu 3: Mmiliki (Owner), Meneja (Manager), na Karani (Cashier). Kila jukumu lina ruhusa tofauti.',
            en: 'There are 3 roles: Owner, Manager, and Cashier. Each role has different permissions.',
        },
        position: 'top',
    },
];
