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
            sw: 'Bofya hapa kumaliza mauzo. Risiti itatolewa moja kwa moja na hesabu itasasishwa.',
            en: 'Click here to complete the sale. A receipt will be generated automatically and stock will be updated.',
        },
        position: 'top',
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
    },
];
