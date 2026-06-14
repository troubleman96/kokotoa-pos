type SubscriptionState = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';

export interface Store {
  id: number;
  name: string;
  location: string;
  details?: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  cost_price: string;
  selling_price: string;
  quantity: number;
  minimum_stock: number;
  is_active: boolean;
  image: string | null;
  image_url: string | null;
  qr_code_url: string | null;
  is_low_stock: boolean;
  profit_margin: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  movement_type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reason?: string;
  reference?: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  cost_price: string;
  discount_percent: string;
  discount_amount: string;
  line_total: string;
  profit: string | number;
}

export interface CreditPayment {
  id: number;
  sale: number;
  amount: string;
  payment_method: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'CREDIT' | string;
  payment_reference?: string;
  created_at: string;
}

export interface Sale {
  id: number;
  transaction_number: string;
  items: SaleItem[];
  total_amount: string;
  discount_amount: string;
  tax_amount: string;
  net_amount: string;
  payment_method: string;
  payment_method_display: string;
  payment_reference?: string;
  customer_phone?: string;
  customer_name?: string;
  notes?: string;
  created_by: number;
  created_by_name: string;
  is_returned: boolean;
  returned_at: string | null;
  formatted_total: string;
  balance_due?: string;
  payments?: CreditPayment[];
  total_profit: number | string;
  has_receipt: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: 'expense' | 'debt' | 'useful' | 'general';
  folder: string;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
}

export interface SubscriptionPackage {
  id: number;
  name: string;
  description: string;
  price: string;
  price_display: string;
  currency: string;
  duration_days: number;
  max_stores: number;
  max_users_per_store: number;
  max_products: number;
  has_analytics: boolean;
  has_reports: boolean;
  has_multi_store: boolean;
  has_sms_notifications: boolean;
  is_active: boolean;
  is_featured: boolean;
}

export interface SubscriptionDetails {
  granted_by: string | null;
  granted_at: string | null;
  expires_at: string | null;
  payment_reference: string | null;
  payment_amount: string | null;
  notes: string | null;
  is_active: boolean;
  package?: SubscriptionPackage | null;
}

export interface SubscriptionStatus {
  status: SubscriptionState;
  status_display: string;
  has_access: boolean;
  trial_start: string | null;
  trial_end: string | null;
  trial_days_left?: number | null;
  subscription_activated: string | null;
  days_remaining?: number | null;
  subscription?: SubscriptionDetails | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
  };
  errors: any;
}

export interface RegisterPayload {
  phone: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  promo_code?: string;
  email?: string;
}

export interface User {
  id: number;
  phone: string;
  email?: string;
  first_name: string;
  last_name: string;
  role: 'OWNER' | 'CASHIER' | 'STAFF' | null;
  role_name: string | null;
  store: number | null;
  store_name?: string | null;
  is_phone_verified: boolean;
  is_profile_complete: boolean;
  created_at: string;
  subscription_status?: SubscriptionState;
  subscription_status_display?: string;
  has_access?: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_activated_at?: string;
  trial_days_left?: number | null;
}

export interface SalesReport {
  sales: Array<{
    id: number;
    transaction_number: string;
    date: string;
    items_count: number;
    items?: string[];
    total_amount: number;
    discount: number;
    tax: number;
    net_amount: number;
    payment_method: string;
    cashier: string;
    is_returned: boolean;
  }>;
  period: { start: string; end: string };
  summary: {
    total_sales: number;
    total_transactions: number;
    total_discount: number;
    total_tax: number;
    average_sale: number;
  };
}

export interface ProfitReport {
  profit_transactions: Array<{
    id: number;
    transaction_number: string;
    date: string;
    net_amount: number;
    total_profit: number;
    profit_margin: number;
    cashier: string;
  }>;
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_sales: number;
    total_profit: number;
    total_transactions: number;
    average_profit: number;
    average_profit_margin: number;
  };
}

export interface InventoryReport {
  products: Array<{
    id: number;
    sku: string;
    name: string;
    category: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
    cost_price: number;
    selling_price: number;
    cost_value: number;
    retail_value: number;
    is_low_stock: boolean;
    profit_margin: number;
  }>;
  summary: {
    total_items: number;
    total_cost_value: number;
    total_retail_value: number;
    low_stock_count: number;
    potential_profit: number;
  };
}

export interface DailySummaryReport {
  date: string;
  sales: {
    total_sales: number;
    transaction_count: number;
    average_sale: number;
  };
  payment_methods: {
    [key: string]: { total: number; count: number };
  };
  top_products: Array<{
    product_name: string;
    product_sku: string;
    quantity: number;
    revenue: number;
  }>;
  low_stock_alerts: Array<{
    name: string;
    sku: string;
    quantity: number;
    minimum_stock: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}

const now = () => new Date().toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const pad = (n: number) => String(n).padStart(2, '0');
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const money = (value: number) => value.toFixed(2);
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const delay = async <T,>(value: T): Promise<T> => Promise.resolve(clone(value));
const nextId = (items: Array<{ id: number }>) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1);

const baseUser: User = {
  id: 1,
  phone: '+255700000001',
  email: 'owner@kokotoa.local',
  first_name: 'Asha',
  last_name: 'Mwanaidi',
  role: 'OWNER',
  role_name: 'Owner',
  store: 1,
  store_name: 'Kokotoa Main Store',
  is_phone_verified: true,
  is_profile_complete: true,
  created_at: now(),
  subscription_status: 'ACTIVE',
  subscription_status_display: 'Active',
  has_access: true,
  trial_start_date: daysAgo(20),
  trial_end_date: daysAgo(-10),
  subscription_activated_at: daysAgo(5),
  trial_days_left: 0,
};

const seedStores: Store[] = [
  {
    id: 1,
    name: 'Kokotoa Main Store',
    location: 'Dar es Salaam',
    details: 'Static demo store',
    phone_number: '+255700000001',
    is_active: true,
    created_at: daysAgo(40),
    updated_at: now(),
  },
  {
    id: 2,
    name: 'Kokotoa Branch',
    location: 'Mwanza',
    details: 'Secondary branch',
    phone_number: '+255700000002',
    is_active: true,
    created_at: daysAgo(18),
    updated_at: now(),
  },
];

const seedPackages: SubscriptionPackage[] = [
  {
    id: 1,
    name: 'Starter',
    description: 'Basic tools for a single store.',
    price: '25000',
    price_display: 'TSh 25,000',
    currency: 'TZS',
    duration_days: 30,
    max_stores: 1,
    max_users_per_store: 3,
    max_products: 250,
    has_analytics: false,
    has_reports: false,
    has_multi_store: false,
    has_sms_notifications: false,
    is_active: true,
    is_featured: false,
  },
  {
    id: 2,
    name: 'Growth',
    description: 'Best for growing shops.',
    price: '50000',
    price_display: 'TSh 50,000',
    currency: 'TZS',
    duration_days: 30,
    max_stores: 3,
    max_users_per_store: 10,
    max_products: 2000,
    has_analytics: true,
    has_reports: true,
    has_multi_store: true,
    has_sms_notifications: true,
    is_active: true,
    is_featured: true,
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'Large-scale operations.',
    price: '120000',
    price_display: 'TSh 120,000',
    currency: 'TZS',
    duration_days: 30,
    max_stores: 20,
    max_users_per_store: 50,
    max_products: 10000,
    has_analytics: true,
    has_reports: true,
    has_multi_store: true,
    has_sms_notifications: true,
    is_active: true,
    is_featured: false,
  },
];

const seedProducts: Product[] = [
  {
    id: 1,
    name: 'Azam Bread',
    sku: 'BRD-001',
    category: 'Bakery',
    unit: 'pcs',
    cost_price: '1800',
    selling_price: '2200',
    quantity: 18,
    minimum_stock: 10,
    is_active: true,
    image: null,
    image_url: null,
    qr_code_url: null,
    is_low_stock: false,
    profit_margin: '18.18',
    created_at: daysAgo(30),
    updated_at: now(),
  },
  {
    id: 2,
    name: 'Coca Cola 500ml',
    sku: 'DRK-002',
    category: 'Drinks',
    unit: 'bottle',
    cost_price: '700',
    selling_price: '1200',
    quantity: 6,
    minimum_stock: 8,
    is_active: true,
    image: null,
    image_url: null,
    qr_code_url: null,
    is_low_stock: true,
    profit_margin: '41.67',
    created_at: daysAgo(25),
    updated_at: now(),
  },
  {
    id: 3,
    name: 'Fanta Orange',
    sku: 'DRK-003',
    category: 'Drinks',
    unit: 'bottle',
    cost_price: '700',
    selling_price: '1200',
    quantity: 22,
    minimum_stock: 8,
    is_active: true,
    image: null,
    image_url: null,
    qr_code_url: null,
    is_low_stock: false,
    profit_margin: '41.67',
    created_at: daysAgo(21),
    updated_at: now(),
  },
  {
    id: 4,
    name: 'Rice 5kg',
    sku: 'GRN-004',
    category: 'Grains',
    unit: 'bag',
    cost_price: '14500',
    selling_price: '18000',
    quantity: 4,
    minimum_stock: 6,
    is_active: true,
    image: null,
    image_url: null,
    qr_code_url: null,
    is_low_stock: true,
    profit_margin: '19.44',
    created_at: daysAgo(14),
    updated_at: now(),
  },
  {
    id: 5,
    name: 'Cooking Oil 1L',
    sku: 'OIL-005',
    category: 'Household',
    unit: 'bottle',
    cost_price: '6200',
    selling_price: '8000',
    quantity: 13,
    minimum_stock: 5,
    is_active: true,
    image: null,
    image_url: null,
    qr_code_url: null,
    is_low_stock: false,
    profit_margin: '22.5',
    created_at: daysAgo(12),
    updated_at: now(),
  },
];

const seedUsers: User[] = [
  baseUser,
  {
    id: 2,
    phone: '+255700000002',
    email: 'cashier@kokotoa.local',
    first_name: 'Juma',
    last_name: 'Musa',
    role: 'CASHIER',
    role_name: 'Cashier',
    store: 1,
    store_name: 'Kokotoa Main Store',
    is_phone_verified: true,
    is_profile_complete: true,
    created_at: daysAgo(22),
    subscription_status: 'ACTIVE',
    subscription_status_display: 'Active',
    has_access: true,
    trial_days_left: 0,
  },
  {
    id: 3,
    phone: '+255700000003',
    email: 'staff@kokotoa.local',
    first_name: 'Amina',
    last_name: 'Hassan',
    role: 'STAFF',
    role_name: 'Staff',
    store: 1,
    store_name: 'Kokotoa Main Store',
    is_phone_verified: true,
    is_profile_complete: true,
    created_at: daysAgo(14),
    subscription_status: 'ACTIVE',
    subscription_status_display: 'Active',
    has_access: true,
    trial_days_left: 0,
  },
];

const saleSeedItems = [
  { productId: 1, quantity: 2, unitPrice: 2200 },
  { productId: 2, quantity: 3, unitPrice: 1200 },
];

const buildSaleItem = (product: Product, quantity: number, unitPrice: number): SaleItem => {
  const costPrice = Number(product.cost_price);
  const lineTotal = quantity * unitPrice;
  const profit = (unitPrice - costPrice) * quantity;

  return {
    id: nextId([]),
    product: product.id,
    product_name: product.name,
    product_sku: product.sku,
    quantity,
    unit_price: money(unitPrice),
    cost_price: money(costPrice),
    discount_percent: '0',
    discount_amount: '0',
    line_total: money(lineTotal),
    profit: money(profit),
  };
};

const seedSales: Sale[] = [];
const seedStockMovements: StockMovement[] = [];

(() => {
  const saleDates = [daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(3)];
  const saleTemplates = [
    { paymentMethod: 'CASH', discount: 0, tax: 0, items: saleSeedItems },
    { paymentMethod: 'MOBILE_MONEY', discount: 500, tax: 0, items: [{ productId: 4, quantity: 1, unitPrice: 18000 }] },
    { paymentMethod: 'CREDIT', discount: 0, tax: 0, items: [{ productId: 5, quantity: 1, unitPrice: 8000 }] },
    { paymentMethod: 'BANK', discount: 0, tax: 0, items: [{ productId: 3, quantity: 4, unitPrice: 1200 }] },
  ];

  saleTemplates.forEach((template, index) => {
    const items = template.items.map((entry) => {
      const product = seedProducts.find((p) => p.id === entry.productId)!;
      return buildSaleItem(product, entry.quantity, entry.unitPrice);
    });

    const totalAmount = items.reduce((sum, item) => sum + Number(item.line_total), 0);
    const netAmount = Math.max(0, totalAmount - template.discount + template.tax);
    const profitTotal = items.reduce((sum, item) => sum + Number(item.profit), 0);
    const createdAt = saleDates[index];

    seedSales.push({
      id: index + 1,
      transaction_number: `TXN-${1000 + index + 1}`,
      items,
      total_amount: money(totalAmount),
      discount_amount: money(template.discount),
      tax_amount: money(template.tax),
      net_amount: money(netAmount),
      payment_method: template.paymentMethod,
      payment_method_display: template.paymentMethod === 'CASH' ? 'Cash' : template.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : template.paymentMethod === 'BANK' ? 'Bank' : 'Credit',
      payment_reference: template.paymentMethod === 'MOBILE_MONEY' ? 'MM-123456' : undefined,
      customer_phone: template.paymentMethod === 'CREDIT' ? '+255700000099' : undefined,
      customer_name: template.paymentMethod === 'CREDIT' ? 'Demo Customer' : undefined,
      notes: template.paymentMethod === 'CREDIT' ? 'Static credit sale' : undefined,
      created_by: 1,
      created_by_name: 'Asha Mwanaidi',
      is_returned: false,
      returned_at: null,
      formatted_total: `TSh ${money(netAmount)}`,
      balance_due: template.paymentMethod === 'CREDIT' ? money(netAmount - 3000) : '0.00',
      payments: template.paymentMethod === 'CREDIT'
        ? [
            {
              id: 1,
              sale: index + 1,
              amount: '3000.00',
              payment_method: 'CASH',
              payment_reference: 'CASH-INIT',
              created_at: createdAt,
            },
          ]
        : [],
      total_profit: money(profitTotal),
      has_receipt: true,
      created_at: createdAt,
      updated_at: createdAt,
    });
  });

  const movements: StockMovement[] = [];
  seedSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const product = seedProducts.find((entry) => entry.id === item.product);
      if (!product) return;
      const quantityBefore = product.quantity;
      product.quantity = Math.max(0, product.quantity - item.quantity);
      product.is_low_stock = product.quantity <= product.minimum_stock;
      product.updated_at = sale.created_at;
      movements.push({
        id: movements.length + 1,
        product: product.id,
        product_name: product.name,
        product_sku: product.sku,
        movement_type: 'OUT',
        quantity: item.quantity,
        quantity_before: quantityBefore,
        quantity_after: product.quantity,
        reason: 'Sale',
        reference: sale.transaction_number,
        created_by: 1,
        created_by_name: 'Asha Mwanaidi',
        created_at: sale.created_at,
      });
    });
  });

  seedStockMovements.push(...movements);
})();

const seedNotes: Note[] = [
  {
    id: 1,
    title: 'Daily cash count',
    content: 'Count the till after closing.',
    category: 'general',
    folder: 'Operations',
    tags: ['cash', 'daily'],
    is_pinned: true,
    is_archived: false,
    created_at: daysAgo(1),
    updated_at: now(),
    created_by_name: 'Asha Mwanaidi',
  },
  {
    id: 2,
    title: 'Supplier follow-up',
    content: 'Call supplier about rice delivery.',
    category: 'expense',
    folder: 'Suppliers',
    tags: ['supplier'],
    is_pinned: false,
    is_archived: false,
    created_at: daysAgo(2),
    updated_at: now(),
    created_by_name: 'Asha Mwanaidi',
  },
  {
    id: 3,
    title: 'Customer debt',
    content: 'Track the pending customer payment.',
    category: 'debt',
    folder: 'Debts',
    tags: ['credit'],
    is_pinned: false,
    is_archived: false,
    created_at: daysAgo(4),
    updated_at: now(),
    created_by_name: 'Asha Mwanaidi',
  },
];

let currentUser = clone(baseUser);
let stores = clone(seedStores);
let packages = clone(seedPackages);
let products = clone(seedProducts);
let users = clone(seedUsers);
let sales = clone(seedSales);
let stockMovements = clone(seedStockMovements);
let notes = clone(seedNotes);
let accessToken: string | null = 'static-access-token';
let refreshToken: string | null = 'static-refresh-token';
let subscriptionStatus: SubscriptionStatus = {
  status: 'ACTIVE',
  status_display: 'Active',
  has_access: true,
  trial_start: daysAgo(20),
  trial_end: daysAgo(-10),
  trial_days_left: 0,
  subscription_activated: daysAgo(5),
  days_remaining: 0,
  subscription: {
    granted_by: 'System',
    granted_at: daysAgo(5),
    expires_at: daysAgo(-10),
    payment_reference: 'STATIC-001',
    payment_amount: '50000',
    notes: 'Static demo subscription',
    is_active: true,
    package: packages[1],
  },
};

const paymentMethodDisplay = (method: string) =>
  method === 'CASH' ? 'Cash' : method === 'MOBILE_MONEY' ? 'Mobile Money' : method === 'BANK' ? 'Bank' : 'Credit';

const parseDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const withinRange = (value: string, start?: string, end?: string) => {
  const date = parseDate(value);
  if (!date) return true;
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
};

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

const aggregateSalesByDay = (days: number) => {
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = dateKey(date);
    labels.push(key);
    const dailySales = sales.filter((sale) => sale.created_at.slice(0, 10) === key);
    data.push(sum(dailySales.map((sale) => Number(sale.net_amount))));
  }
  return { labels, data };
};

const aggregateProfitByDay = (days: number) => {
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = dateKey(date);
    labels.push(key);
    const dailySales = sales.filter((sale) => sale.created_at.slice(0, 10) === key);
    data.push(sum(dailySales.map((sale) => Number(sale.total_profit))));
  }
  return { labels, data };
};

const aggregateMonthly = (months: number, selector: (month: string) => number) => {
  const labels: string[] = [];
  const data: number[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = monthKey(date);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    data.push(selector(key));
  }
  return { labels, data };
};

const getSalesSummary = (filteredSales: Sale[]) => ({
  total_sales: sum(filteredSales.map((sale) => Number(sale.net_amount))),
  transaction_count: filteredSales.length,
});

const buildInventoryReport = (): InventoryReport => {
  const mapped = products.map((product) => {
    const costPrice = Number(product.cost_price);
    const sellingPrice = Number(product.selling_price);
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      current_stock: product.quantity,
      minimum_stock: product.minimum_stock,
      unit: product.unit,
      cost_price: costPrice,
      selling_price: sellingPrice,
      cost_value: costPrice * product.quantity,
      retail_value: sellingPrice * product.quantity,
      is_low_stock: product.is_low_stock,
      profit_margin: sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0,
    };
  });

  return {
    products: mapped,
    summary: {
      total_items: mapped.reduce((acc, item) => acc + item.current_stock, 0),
      total_cost_value: mapped.reduce((acc, item) => acc + item.cost_value, 0),
      total_retail_value: mapped.reduce((acc, item) => acc + item.retail_value, 0),
      low_stock_count: mapped.filter((item) => item.is_low_stock).length,
      potential_profit: mapped.reduce((acc, item) => acc + (item.retail_value - item.cost_value), 0),
    },
  };
};

const buildSalesReport = (filteredSales: Sale[]): SalesReport => ({
  sales: filteredSales.map((sale) => ({
    id: sale.id,
    transaction_number: sale.transaction_number,
    date: sale.created_at,
    items_count: sale.items.length,
    items: sale.items.map((item) => item.product_name),
    total_amount: Number(sale.total_amount),
    discount: Number(sale.discount_amount),
    tax: Number(sale.tax_amount),
    net_amount: Number(sale.net_amount),
    payment_method: sale.payment_method,
    cashier: sale.created_by_name,
    is_returned: sale.is_returned,
  })),
  period: { start: filteredSales[0]?.created_at ?? now(), end: filteredSales.at(-1)?.created_at ?? now() },
  summary: {
    total_sales: sum(filteredSales.map((sale) => Number(sale.net_amount))),
    total_transactions: filteredSales.length,
    total_discount: sum(filteredSales.map((sale) => Number(sale.discount_amount))),
    total_tax: sum(filteredSales.map((sale) => Number(sale.tax_amount))),
    average_sale: filteredSales.length ? sum(filteredSales.map((sale) => Number(sale.net_amount))) / filteredSales.length : 0,
  },
});

const buildProfitReport = (filteredSales: Sale[]): ProfitReport => ({
  profit_transactions: filteredSales.map((sale) => ({
    id: sale.id,
    transaction_number: sale.transaction_number,
    date: sale.created_at,
    net_amount: Number(sale.net_amount),
    total_profit: Number(sale.total_profit),
    profit_margin: Number(sale.net_amount) > 0 ? (Number(sale.total_profit) / Number(sale.net_amount)) * 100 : 0,
    cashier: sale.created_by_name,
  })),
  period: { start: filteredSales[0]?.created_at ?? now(), end: filteredSales.at(-1)?.created_at ?? now() },
  summary: {
    total_sales: sum(filteredSales.map((sale) => Number(sale.net_amount))),
    total_profit: sum(filteredSales.map((sale) => Number(sale.total_profit))),
    total_transactions: filteredSales.length,
    average_profit: filteredSales.length ? sum(filteredSales.map((sale) => Number(sale.total_profit))) / filteredSales.length : 0,
    average_profit_margin: filteredSales.length
      ? sum(filteredSales.map((sale) => (Number(sale.net_amount) > 0 ? (Number(sale.total_profit) / Number(sale.net_amount)) * 100 : 0))) / filteredSales.length
      : 0,
  },
});

const buildDailySummary = (date?: string): DailySummaryReport => {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const filtered = sales.filter((sale) => sale.created_at.slice(0, 10) === targetDate);
  const paymentMethods: DailySummaryReport['payment_methods'] = {};

  filtered.forEach((sale) => {
    const entry = paymentMethods[sale.payment_method] || { total: 0, count: 0 };
    entry.total += Number(sale.net_amount);
    entry.count += 1;
    paymentMethods[sale.payment_method] = entry;
  });

  const topProductsMap = new Map<string, { product_name: string; product_sku: string; quantity: number; revenue: number }>();
  filtered.forEach((sale) => {
    sale.items.forEach((item) => {
      const entry = topProductsMap.get(item.product_sku) || {
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += Number(item.line_total);
      topProductsMap.set(item.product_sku, entry);
    });
  });

  return {
    date: targetDate,
    sales: {
      total_sales: sum(filtered.map((sale) => Number(sale.net_amount))),
      transaction_count: filtered.length,
      average_sale: filtered.length ? sum(filtered.map((sale) => Number(sale.net_amount))) / filtered.length : 0,
    },
    payment_methods: paymentMethods,
    top_products: [...topProductsMap.values()].sort((a, b) => b.revenue - a.revenue),
    low_stock_alerts: products
      .filter((product) => product.is_low_stock)
      .map((product) => ({
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        minimum_stock: product.minimum_stock,
      })),
  };
};

export class ApiService {
  getAccessToken() {
    return accessToken;
  }

  setAccessToken(token: string | null) {
    accessToken = token;
  }

  getRefreshToken() {
    return refreshToken;
  }

  setRefreshToken(token: string | null) {
    refreshToken = token;
  }
}

export const api = new ApiService();

export const authApi = {
  register: async (data: RegisterPayload) => {
    currentUser = {
      ...currentUser,
      phone: data.phone,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || currentUser.email,
      is_profile_complete: false,
    };

    return delay({
      success: true,
      message: 'Registration complete',
      data: {
        access_token: 'static-access-token',
        refresh_token: 'static-refresh-token',
        token_type: 'Bearer',
        user: clone(currentUser),
      },
      errors: null,
    } satisfies AuthResponse);
  },

  verifyOtp: async (data: { phone: string; otp_code: string }) =>
    delay({
      success: true,
      message: 'OTP verified',
      data: {
        user_id: currentUser.id,
        phone: data.phone,
        is_phone_verified: true,
        can_create_store: !currentUser.is_profile_complete,
        is_profile_complete: currentUser.is_profile_complete,
        subscription_status: currentUser.subscription_status,
      },
      errors: null,
    }),

  requestPhoneVerification: async (data: { phone: string }) =>
    delay({ success: true, message: `Verification code sent to ${data.phone}`, data: { phone: data.phone, otp_sent: true }, errors: null }),

  resendOtp: async () => delay({ success: true, message: 'OTP resent', data: null, errors: null }),

  login: async (data: { phone: string; password: string }) =>
    delay({
      success: true,
      message: 'Login successful',
      data: {
        access_token: 'static-access-token',
        refresh_token: 'static-refresh-token',
        token_type: 'Bearer',
        user: clone({ ...currentUser, phone: data.phone || currentUser.phone }),
      },
      errors: null,
    } satisfies AuthResponse),

  refreshToken: async () =>
    delay({ access: 'static-access-token', refresh: 'static-refresh-token', token_type: 'Bearer', success: true, message: 'Token refreshed', errors: null }),

  requestPasswordReset: async () => delay({ success: true, message: 'Password reset requested', data: null, errors: null }),

  resetPassword: async () => delay({ success: true, message: 'Password reset complete', data: null, errors: null }),

  changePassword: async () => delay({ success: true, message: 'Password changed', data: null, errors: null }),
};

export const accountsApi = {
  changeName: async (data: { first_name: string; last_name: string }) => {
    currentUser = { ...currentUser, first_name: data.first_name, last_name: data.last_name };
    users = users.map((user) => (user.id === currentUser.id ? clone(currentUser) : user));
    return delay({ success: true, message: 'Profile updated', data, errors: null });
  },

  getCurrentUser: async () => delay({ success: true, message: 'Current user', data: clone(currentUser), errors: null }),

  updateProfile: async (data: Partial<User>) => {
    currentUser = { ...currentUser, ...data };
    users = users.map((user) => (user.id === currentUser.id ? clone(currentUser) : user));
    return delay({ success: true, message: 'Profile updated', data: clone(currentUser), errors: null });
  },

  updateEmail: async (data: { email: string }) => {
    currentUser = { ...currentUser, email: data.email };
    users = users.map((user) => (user.id === currentUser.id ? clone(currentUser) : user));
    return delay({ success: true, message: 'Email updated', data: { email: data.email }, errors: null });
  },
};

export const subscriptionApi = {
  getPackages: async () => delay({ success: true, message: 'Packages', data: clone(packages), errors: null }),

  getStatus: async () => delay({ success: true, message: 'Subscription status', data: clone(subscriptionStatus), errors: null }),

  grantAccess: async (data: {
    user_id: number;
    package_id?: number;
    payment_reference?: string;
    payment_amount?: string;
    notes?: string;
    expires_at?: string;
    custom_expires_at?: string;
  }) => {
    const selectedPackage = packages.find((pkg) => pkg.id === data.package_id) || packages[1];
    subscriptionStatus = {
      status: 'ACTIVE',
      status_display: 'Active',
      has_access: true,
      trial_start: subscriptionStatus.trial_start,
      trial_end: subscriptionStatus.trial_end,
      trial_days_left: 0,
      subscription_activated: now(),
      days_remaining: 30,
      subscription: {
        granted_by: 'Static Admin',
        granted_at: now(),
        expires_at: data.custom_expires_at || data.expires_at || daysAgo(-30),
        payment_reference: data.payment_reference || 'STATIC-APPROVAL',
        payment_amount: data.payment_amount || selectedPackage.price,
        notes: data.notes || null,
        is_active: true,
        package: selectedPackage,
      },
    };
    currentUser = { ...currentUser, subscription_status: 'ACTIVE', subscription_status_display: 'Active', has_access: true };
    users = users.map((user) => (user.id === data.user_id ? { ...user, subscription_status: 'ACTIVE', subscription_status_display: 'Active', has_access: true } : user));
    return delay({
      success: true,
      message: 'Access granted',
      data: {
        user: { id: data.user_id, phone: currentUser.phone, subscription_status: 'ACTIVE' },
        subscription: {
          id: selectedPackage.id,
          package: { id: selectedPackage.id, name: selectedPackage.name, price_display: selectedPackage.price_display },
          payment_reference: data.payment_reference || null,
          payment_amount: data.payment_amount || selectedPackage.price,
          expires_at: data.custom_expires_at || data.expires_at || null,
          is_active: true,
        },
      },
      errors: null,
    });
  },

  blockUser: async (data: { user_id: number; reason: string }) => {
    subscriptionStatus = {
      ...subscriptionStatus,
      status: 'BLOCKED',
      status_display: 'Blocked',
      has_access: false,
      days_remaining: 0,
    };
    users = users.map((user) => (user.id === data.user_id ? { ...user, subscription_status: 'BLOCKED', subscription_status_display: 'Blocked', has_access: false } : user));
    return delay({ success: true, message: data.reason, data: null, errors: null });
  },
};

export const storesApi = {
  create: async (data: { name: string; location: string; details?: string; phone_number: string }) => {
    const store: Store = {
      id: nextId(stores),
      name: data.name,
      location: data.location,
      details: data.details,
      phone_number: data.phone_number,
      is_active: true,
      created_at: now(),
      updated_at: now(),
    };
    stores = [...stores, store];
    currentUser = { ...currentUser, store: store.id, store_name: store.name, is_profile_complete: true, role: 'OWNER' };
    users = users.map((user) => (user.id === currentUser.id ? clone(currentUser) : user));
    return delay({ success: true, message: 'Store created', data: { store, user: { id: currentUser.id, is_profile_complete: true, role: 'OWNER' } }, errors: null });
  },

  list: async () => delay({ success: true, message: 'Stores', data: clone(stores), errors: null }),

  get: async (id: number) => {
    const store = stores.find((entry) => entry.id === id);
    return delay({
      success: true,
      message: 'Store',
      data: { ...(store || stores[0]), user_count: users.filter((user) => user.store === id).length },
      errors: null,
    });
  },

  update: async (id: number, data: Partial<Store>) => {
    stores = stores.map((store) => (store.id === id ? { ...store, ...data, updated_at: now() } : store));
    const updated = stores.find((store) => store.id === id) || stores[0];
    if (currentUser.store === id) currentUser = { ...currentUser, store_name: updated.name };
    return delay({ success: true, message: 'Store updated', data: clone(updated), errors: null });
  },

  patch: async (id: number, data: Partial<Store>) => storesApi.update(id, data),

  delete: async (id: number) => {
    stores = stores.filter((store) => store.id !== id);
    return delay({ success: true, message: 'Store deleted', errors: null });
  },
};

export const usersApi = {
  list: async () => delay({ success: true, message: 'Users', data: clone(users), errors: null }),

  add: async (data: { phone: string; password: string; first_name: string; last_name: string; role: string }) => {
    const user: User = {
      id: nextId(users),
      phone: data.phone,
      email: `${data.first_name.toLowerCase()}.${data.last_name.toLowerCase()}@kokotoa.local`,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role as User['role'],
      role_name: data.role,
      store: currentUser.store,
      store_name: currentUser.store_name,
      is_phone_verified: true,
      is_profile_complete: true,
      created_at: now(),
      subscription_status: currentUser.subscription_status,
      subscription_status_display: currentUser.subscription_status_display,
      has_access: currentUser.has_access,
      trial_days_left: 0,
    };
    users = [...users, user];
    return delay({ success: true, message: 'User added', data: clone(user), errors: null });
  },

  get: async (id: number) => delay({ success: true, message: 'User', data: clone(users.find((user) => user.id === id) || users[0]), errors: null }),

  update: async (id: number, data: Partial<User> & { is_active?: boolean }) => {
    users = users.map((user) => (user.id === id ? { ...user, ...data, role_name: data.role || user.role_name } : user));
    return delay({ success: true, message: 'User updated', data: clone(users.find((user) => user.id === id) || users[0]), errors: null });
  },

  delete: async (id: number) => {
    users = users.filter((user) => user.id !== id);
    return delay({ success: true, message: 'User deleted', errors: null });
  },
};

const applyProductUpdate = (product: Product, patch: Partial<Product>) => {
  const updated = { ...product, ...patch, updated_at: now() };
  updated.is_low_stock = updated.quantity <= updated.minimum_stock;
  const cost = Number(updated.cost_price);
  const sell = Number(updated.selling_price);
  updated.profit_margin = sell > 0 ? (((sell - cost) / sell) * 100).toFixed(2) : '0.00';
  return updated;
};

const extractFormData = (formData: FormData) => Object.fromEntries(formData.entries());

export const productsApi = {
  list: async (params?: { category?: string; low_stock?: boolean; search?: string }) => {
    const filtered = products.filter((product) => {
      const matchesCategory = !params?.category || product.category === params.category;
      const matchesLowStock = !params?.low_stock || product.is_low_stock;
      const search = params?.search?.toLowerCase();
      const matchesSearch = !search || product.name.toLowerCase().includes(search) || product.sku.toLowerCase().includes(search);
      return matchesCategory && matchesLowStock && matchesSearch;
    });
    return delay({ success: true, message: 'Products', data: clone(filtered), errors: null });
  },

  create: async (formData: FormData) => {
    const payload = extractFormData(formData);
    const product: Product = {
      id: nextId(products),
      name: String(payload.name || 'New Product'),
      sku: String(payload.sku || `SKU-${Date.now()}`),
      category: String(payload.category || 'General'),
      unit: String(payload.unit || 'pcs'),
      cost_price: String(payload.cost_price || '0'),
      selling_price: String(payload.selling_price || '0'),
      quantity: Number(payload.quantity || 0),
      minimum_stock: Number(payload.minimum_stock || 5),
      is_active: true,
      image: null,
      image_url: null,
      qr_code_url: null,
      is_low_stock: false,
      profit_margin: '0.00',
      created_at: now(),
      updated_at: now(),
    };
    products = [...products, applyProductUpdate(product, {})];
    return delay({ success: true, message: 'Product created', data: clone(products.at(-1)!), errors: null });
  },

  get: async (id: number) => delay({ success: true, message: 'Product', data: clone(products.find((product) => product.id === id) || products[0]), errors: null }),

  update: async (id: number, data: Record<string, unknown>) => {
    products = products.map((product) =>
      product.id === id
        ? applyProductUpdate(product, {
            name: data.name as string | undefined,
            sku: data.sku as string | undefined,
            category: data.category as string | undefined,
            unit: data.unit as string | undefined,
            cost_price: data.cost_price as string | undefined,
            selling_price: data.selling_price as string | undefined,
            quantity: typeof data.quantity === 'number' ? data.quantity : product.quantity,
            minimum_stock: typeof data.minimum_stock === 'number' ? data.minimum_stock : product.minimum_stock,
          })
        : product
    );
    return delay({ success: true, message: 'Product updated', data: clone(products.find((product) => product.id === id) || products[0]), errors: null });
  },

  delete: async (id: number) => {
    products = products.filter((product) => product.id !== id);
    return delay({ success: true, message: 'Product deleted', errors: null });
  },

  getLowStock: async () => delay({ success: true, message: 'Low stock', data: clone(products.filter((product) => product.is_low_stock)), errors: null }),

  getCategories: async () => delay({ success: true, message: 'Categories', data: { categories: [...new Set(products.map((product) => product.category))] }, errors: null }),

  adjustStock: async (data: { product_id: number; movement_type: 'IN' | 'OUT' | 'ADJUST'; quantity: number; reason?: string; reference?: string }) => {
    const index = products.findIndex((product) => product.id === data.product_id);
    const product = products[index];
    if (!product) {
      return delay({ success: false, message: 'Product not found', data: null, errors: { product_id: ['Not found'] } });
    }
    const before = product.quantity;
    const after = data.movement_type === 'IN'
      ? before + data.quantity
      : data.movement_type === 'OUT'
        ? Math.max(0, before - data.quantity)
        : data.quantity;
    const updatedProduct = applyProductUpdate(product, { quantity: after });
    products[index] = updatedProduct;
    const movement: StockMovement = {
      id: nextId(stockMovements),
      product: product.id,
      product_name: product.name,
      product_sku: product.sku,
      movement_type: data.movement_type,
      quantity: data.quantity,
      quantity_before: before,
      quantity_after: after,
      reason: data.reason,
      reference: data.reference,
      created_by: currentUser.id,
      created_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
      created_at: now(),
    };
    stockMovements = [...stockMovements, movement];
    return delay({ success: true, message: 'Stock adjusted', data: clone(movement), errors: null });
  },

  bulkAdjustStock: async (data: { adjustments: Array<{ product_id: number; movement_type: 'IN' | 'OUT' | 'ADJUST'; quantity: number; reason?: string }> }) => {
    for (const adjustment of data.adjustments) {
      // Sequential updates keep the in-memory product list consistent.
      // eslint-disable-next-line no-await-in-loop
      await productsApi.adjustStock(adjustment);
    }
    return delay({ success: true, message: 'Stock adjusted', data: { adjustments_count: data.adjustments.length }, errors: null });
  },
};

export const stockMovementsApi = {
  list: async () => delay({ success: true, message: 'Stock movements', data: clone(stockMovements), errors: null }),
  get: async (id: number) => delay({ success: true, message: 'Stock movement', data: clone(stockMovements.find((movement) => movement.id === id) || stockMovements[0]), errors: null }),
};

const buildReceipt = (sale: Sale) => ({
  id: sale.id,
  receipt_number: sale.transaction_number,
  receipt_text: `${sale.transaction_number}\n${sale.items.map((item) => `${item.product_name} x${item.quantity}`).join('\n')}\nTotal: ${sale.formatted_total}`,
  printed_at: sale.updated_at,
  created_at: sale.created_at,
});

export const receiptsApi = {
  list: async () => delay({ success: true, message: 'Receipts', data: sales.map(buildReceipt), errors: null }),
  get: async (id: number) => {
    const sale = sales.find((entry) => entry.id === id) || sales[0];
    return delay({ success: true, message: 'Receipt', data: buildReceipt(sale), errors: null });
  },
};

export const salesApi = {
  list: async (params?: { date_from?: string; date_to?: string; payment_method?: string; is_returned?: boolean; has_outstanding_balance?: boolean }) => {
    const filtered = sales.filter((sale) => {
      const matchesRange = withinRange(sale.created_at, params?.date_from, params?.date_to);
      const matchesMethod = !params?.payment_method || sale.payment_method === params.payment_method;
      const matchesReturned = params?.is_returned === undefined || sale.is_returned === params.is_returned;
      const matchesBalance = params?.has_outstanding_balance === undefined
        || (params.has_outstanding_balance ? Number(sale.balance_due || '0') > 0 : Number(sale.balance_due || '0') <= 0);
      return matchesRange && matchesMethod && matchesReturned && matchesBalance;
    });
    return delay({ success: true, message: 'Sales', data: { sales: clone(filtered), summary: getSalesSummary(filtered) }, errors: null });
  },

  create: async (data: { items: Array<{ product_id: number; quantity: number; unit_price: number; discount_percent?: number }>; payment_method: string; payment_reference?: string; customer_phone?: string; customer_name?: string; notes?: string; discount_amount?: number; tax_amount?: number }) => {
    const createdAt = now();
    const items = data.items.map((item) => {
      const productIndex = products.findIndex((product) => product.id === item.product_id);
      const product = products[productIndex];
      const before = product.quantity;
      products[productIndex] = applyProductUpdate(product, { quantity: Math.max(0, before - item.quantity) });
      stockMovements = [
        ...stockMovements,
        {
          id: nextId(stockMovements),
          product: product.id,
          product_name: product.name,
          product_sku: product.sku,
          movement_type: 'OUT',
          quantity: item.quantity,
          quantity_before: before,
          quantity_after: products[productIndex].quantity,
          reason: 'Sale',
          reference: `TXN-${1000 + sales.length + 1}`,
          created_by: currentUser.id,
          created_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
          created_at: createdAt,
        },
      ];

      return {
        id: item.product_id,
        product: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: money(item.unit_price),
        cost_price: product.cost_price,
        discount_percent: String(item.discount_percent || 0),
        discount_amount: '0',
        line_total: money(item.quantity * item.unit_price),
        profit: money((item.unit_price - Number(product.cost_price)) * item.quantity),
      } satisfies SaleItem;
    });

    const totalAmount = sum(items.map((item) => Number(item.line_total)));
    const discount = Number(data.discount_amount || 0);
    const tax = Number(data.tax_amount || 0);
    const netAmount = Math.max(0, totalAmount - discount + tax);
    const totalProfit = sum(items.map((item) => Number(item.profit)));
    const sale: Sale = {
      id: nextId(sales),
      transaction_number: `TXN-${1000 + sales.length + 1}`,
      items,
      total_amount: money(totalAmount),
      discount_amount: money(discount),
      tax_amount: money(tax),
      net_amount: money(netAmount),
      payment_method: data.payment_method,
      payment_method_display: paymentMethodDisplay(data.payment_method),
      payment_reference: data.payment_reference,
      customer_phone: data.customer_phone,
      customer_name: data.customer_name,
      notes: data.notes,
      created_by: currentUser.id,
      created_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
      is_returned: false,
      returned_at: null,
      formatted_total: `TSh ${money(netAmount)}`,
      balance_due: data.payment_method === 'CREDIT' ? money(netAmount - Math.min(netAmount, 3000)) : '0.00',
      payments: data.payment_method === 'CREDIT'
        ? [
            {
              id: nextId([]),
              sale: nextId(sales),
              amount: '3000.00',
              payment_method: 'CASH',
              payment_reference: 'STATIC-CREDIT',
              created_at: createdAt,
            },
          ]
        : [],
      total_profit: money(totalProfit),
      has_receipt: true,
      created_at: createdAt,
      updated_at: createdAt,
    };
    sales = [sale, ...sales];
    return delay({ success: true, message: 'Sale created', data: clone(sale), errors: null });
  },

  recordCreditPayment: async (data: { sale: number; amount: number; payment_method?: 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'CREDIT'; payment_reference?: string }) => {
    sales = sales.map((sale) =>
      sale.id === data.sale
        ? {
            ...sale,
            payments: [
              ...(sale.payments || []),
              {
                id: nextId(sales.flatMap((entry) => entry.payments || [])),
                sale: data.sale,
                amount: money(data.amount),
                payment_method: data.payment_method || 'CASH',
                payment_reference: data.payment_reference,
                created_at: now(),
              },
            ],
            balance_due: money(Math.max(0, Number(sale.balance_due || '0') - data.amount)),
          }
        : sale
    );
    return delay({ success: true, message: 'Credit payment recorded', data: { id: data.sale }, errors: null });
  },

  get: async (id: number) => delay({ success: true, message: 'Sale', data: clone(sales.find((sale) => sale.id === id) || sales[0]), errors: null }),

  return: async (id: number, reason: string) => {
    sales = sales.map((sale) => (sale.id === id ? { ...sale, is_returned: true, returned_at: now(), notes: [sale.notes, reason].filter(Boolean).join(' | ') } : sale));
    return delay({ success: true, message: 'Sale returned', data: clone(sales.find((sale) => sale.id === id) || sales[0]), errors: null });
  },

  getReceipt: async (id: number) => {
    const sale = sales.find((entry) => entry.id === id) || sales[0];
    return delay({ success: true, message: 'Receipt', data: buildReceipt(sale), errors: null });
  },
};

export const reportsApi = {
  getSales: async (params?: { date_from?: string; date_to?: string }) =>
    delay({ success: true, message: 'Sales report', data: buildSalesReport(sales.filter((sale) => withinRange(sale.created_at, params?.date_from, params?.date_to))), errors: null }),

  getSaleDetail: async (id: number) => salesApi.get(id),

  getProfit: async (params?: { date_from?: string; date_to?: string }) =>
    delay({ success: true, message: 'Profit report', data: buildProfitReport(sales.filter((sale) => withinRange(sale.created_at, params?.date_from, params?.date_to))), errors: null }),

  getInventory: async () => delay({ success: true, message: 'Inventory report', data: buildInventoryReport(), errors: null }),

  getDailySummary: async (date?: string) => delay({ success: true, message: 'Daily summary', data: buildDailySummary(date), errors: null }),

  getCredit: async (params?: { date_from?: string; date_to?: string }) => {
    const filtered = sales.filter((sale) => withinRange(sale.created_at, params?.date_from, params?.date_to) && Number(sale.balance_due || '0') > 0);
    return delay({
      success: true,
      message: 'Credit report',
      data: {
        summary: {
          total_credit_amount: sum(filtered.map((sale) => Number(sale.net_amount))),
          total_outstanding_debt: sum(filtered.map((sale) => Number(sale.balance_due || '0'))),
          total_recovered_amount: sum(filtered.flatMap((sale) => (sale.payments || []).map((payment) => Number(payment.amount)))),
          recovery_rate: filtered.length ? 75 : 0,
          transaction_count: filtered.length,
        },
        trend: filtered.map((sale) => ({ date: sale.created_at.slice(0, 10), total: Number(sale.balance_due || '0') })),
        top_customers: filtered.map((sale) => ({
          customer_name: sale.customer_name || 'Customer',
          customer_phone: sale.customer_phone || '',
          total: Number(sale.net_amount),
          outstanding: Number(sale.balance_due || '0'),
          count: 1,
        })),
        period: { start: params?.date_from || filtered[0]?.created_at || now(), end: params?.date_to || filtered.at(-1)?.created_at || now() },
      },
      errors: null,
    });
  },

  getDiscounts: async (params?: { date_from?: string; date_to?: string }) => {
    const filtered = sales.filter((sale) => withinRange(sale.created_at, params?.date_from, params?.date_to));
    const totals = filtered.reduce((acc, sale) => {
      const key = sale.created_at.slice(0, 10);
      acc[key] = (acc[key] || 0) + Number(sale.discount_amount);
      return acc;
    }, {} as Record<string, number>);
    return delay({
      success: true,
      message: 'Discount report',
      data: {
        summary: {
          total_discount_amount: sum(filtered.map((sale) => Number(sale.discount_amount))),
          average_discount_per_sale: filtered.length ? sum(filtered.map((sale) => Number(sale.discount_amount))) / filtered.length : 0,
          discount_ratio: 5,
          transaction_count: filtered.length,
        },
        trend: Object.entries(totals).map(([date, total]) => ({ date, total })),
        period: { start: params?.date_from || filtered[0]?.created_at || now(), end: params?.date_to || filtered.at(-1)?.created_at || now() },
      },
      errors: null,
    });
  },

  getAnalyticsTrend: async (params?: { date_from?: string; date_to?: string }) => {
    const filtered = sales.filter((sale) => withinRange(sale.created_at, params?.date_from, params?.date_to));
    const dates = [...new Set(filtered.map((sale) => sale.created_at.slice(0, 10)))];
    return delay({
      success: true,
      message: 'Analytics trend',
      data: {
        trends: dates.map((date) => {
          const daySales = filtered.filter((sale) => sale.created_at.slice(0, 10) === date);
          return {
            date,
            sales: sum(daySales.map((sale) => Number(sale.net_amount))),
            profit: sum(daySales.map((sale) => Number(sale.total_profit))),
            discounts: sum(daySales.map((sale) => Number(sale.discount_amount))),
            credit: sum(daySales.filter((sale) => Number(sale.balance_due || '0') > 0).map((sale) => Number(sale.balance_due || '0'))),
          };
        }),
      },
      errors: null,
    });
  },
};

export const notebookApi = {
  list: async (params?: {
    search?: string;
    category?: 'expense' | 'debt' | 'useful' | 'general';
    folder?: string;
    is_pinned?: boolean;
    is_archived?: boolean;
  }) => {
    const filtered = notes.filter((note) => {
      const matchesSearch = !params?.search || `${note.title} ${note.content}`.toLowerCase().includes(params.search.toLowerCase());
      const matchesCategory = !params?.category || note.category === params.category;
      const matchesFolder = !params?.folder || note.folder === params.folder;
      const matchesPinned = params?.is_pinned === undefined || note.is_pinned === params.is_pinned;
      const matchesArchived = params?.is_archived === undefined || note.is_archived === params.is_archived;
      return matchesSearch && matchesCategory && matchesFolder && matchesPinned && matchesArchived;
    });
    return delay({ success: true, message: 'Notes', data: { notes: clone(filtered), summary: { count: filtered.length, pinned_count: filtered.filter((note) => note.is_pinned).length } }, errors: null });
  },

  create: async (data: { title: string; content?: string; category?: 'expense' | 'debt' | 'useful' | 'general'; folder?: string; tags?: string[]; is_pinned?: boolean }) => {
    const note: Note = {
      id: nextId(notes),
      title: data.title,
      content: data.content || '',
      category: data.category || 'general',
      folder: data.folder || 'General',
      tags: data.tags || [],
      is_pinned: Boolean(data.is_pinned),
      is_archived: false,
      created_at: now(),
      updated_at: now(),
      created_by_name: `${currentUser.first_name} ${currentUser.last_name}`,
    };
    notes = [note, ...notes];
    return delay({ success: true, message: 'Note created', data: clone(note), errors: null });
  },

  get: async (id: number) => delay({ success: true, message: 'Note', data: clone(notes.find((note) => note.id === id) || notes[0]), errors: null }),

  update: async (id: number, data: Partial<Pick<Note, 'title' | 'content' | 'category' | 'folder' | 'tags' | 'is_pinned' | 'is_archived'>>) => {
    notes = notes.map((note) => (note.id === id ? { ...note, ...data, updated_at: now() } : note));
    return delay({ success: true, message: 'Note updated', data: clone(notes.find((note) => note.id === id) || notes[0]), errors: null });
  },

  delete: async (id: number) => {
    notes = notes.filter((note) => note.id !== id);
    return delay({ success: true, message: 'Note deleted', errors: null });
  },

  getFolders: async () => delay({ success: true, message: 'Folders', data: { folders: [...new Set(notes.map((note) => note.folder))] }, errors: null }),

  export: async (params?: { search?: string; category?: 'expense' | 'debt' | 'useful' | 'general'; folder?: string; is_pinned?: boolean; is_archived?: boolean }) =>
    notebookApi.list(params),
};

export const graphsApi = {
  getDailySales: async (days = 7) => {
    const series = aggregateSalesByDay(days);
    return delay({ success: true, message: 'Daily sales', data: { data: series.data, labels: series.labels, period: { start: series.labels[0], end: series.labels.at(-1) || series.labels[0], days }, summary: { total_sales: sum(series.data), transaction_count: sales.length, average_sale: series.data.length ? sum(series.data) / series.data.length : 0 } }, errors: null });
  },

  getTopProducts: async (params?: { limit?: number; days?: number }) => {
    const limit = params?.limit || 5;
    const filtered = params?.days ? sales.filter((sale) => withinRange(sale.created_at, daysAgo(params.days), now())) : sales;
    const map = new Map<string, { rank: number; sku: string; name: string; quantity_sold: number; revenue: number; profit: number; transactions: number }>();
    filtered.forEach((sale) => {
      sale.items.forEach((item) => {
        const current = map.get(item.product_sku) || { rank: 0, sku: item.product_sku, name: item.product_name, quantity_sold: 0, revenue: 0, profit: 0, transactions: 0 };
        current.quantity_sold += item.quantity;
        current.revenue += Number(item.line_total);
        current.profit += Number(item.profit);
        current.transactions += 1;
        map.set(item.product_sku, current);
      });
    });
    const data = [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit).map((item, index) => ({ ...item, rank: index + 1 }));
    return delay({ success: true, message: 'Top products', data: { data, period: { start: now(), end: now(), days: params?.days || 0 }, summary: { total_items_sold: sum(data.map((item) => item.quantity_sold)) } }, errors: null });
  },

  getLowStock: async () => {
    const data = products.filter((product) => product.is_low_stock).map((product) => ({ id: product.id, sku: product.sku, name: product.name, category: product.category, current_stock: product.quantity, minimum_stock: product.minimum_stock, unit: product.unit, status: 'LOW' }));
    return delay({ success: true, message: 'Low stock', data: { data, count: data.length, message: 'Low stock products' }, errors: null });
  },

  getPaymentMethods: async (days = 7) => {
    const filtered = sales.filter((sale) => withinRange(sale.created_at, daysAgo(days), now()));
    const methods = ['CASH', 'MOBILE_MONEY', 'BANK', 'CREDIT'];
    const data = methods.map((method) => sum(filtered.filter((sale) => sale.payment_method === method).map((sale) => Number(sale.net_amount))));
    return delay({ success: true, message: 'Payment methods', data: { data, labels: methods, period: { start: now(), end: now(), days }, summary: { total_sales: sum(data), transaction_count: filtered.length } }, errors: null });
  },

  getSalesByHour: async (days = 7) => {
    const labels = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
    const data = labels.map((_, index) => sum(sales.filter((sale) => sale.created_at.slice(0, 10)).map((sale) => Number(sale.net_amount))) / (index + 3));
    return delay({ success: true, message: 'Sales by hour', data: { data, labels, period: { start: now(), end: now(), days }, summary: { total_sales: sum(data), transaction_count: sales.length, peak_hour: labels[data.indexOf(Math.max(...data))] } }, errors: null });
  },

  getInventoryValue: async () => {
    const mapped = buildInventoryReport().products;
    return delay({ success: true, message: 'Inventory value', data: { data: mapped.map((product) => product.retail_value), labels: mapped.map((product) => product.name), summary: { total_cost_value: sum(mapped.map((product) => product.cost_value)), total_retail_value: sum(mapped.map((product) => product.retail_value)), potential_profit: sum(mapped.map((product) => product.retail_value - product.cost_value)), item_count: mapped.length } }, errors: null });
  },

  getDashboard: async () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todaysSales = sales.filter((sale) => sale.created_at.slice(0, 10) === todayKey);
    const monthKeyValue = monthKey(new Date());
    const thisMonthSales = sales.filter((sale) => sale.created_at.slice(0, 7) === monthKeyValue);
    return delay({ success: true, message: 'Dashboard', data: { today: { sales: sum(todaysSales.map((sale) => Number(sale.net_amount))), profit: sum(todaysSales.map((sale) => Number(sale.total_profit))), transactions: todaysSales.length, profit_margin: todaysSales.length && sum(todaysSales.map((sale) => Number(sale.net_amount))) > 0 ? (sum(todaysSales.map((sale) => Number(sale.total_profit))) / sum(todaysSales.map((sale) => Number(sale.net_amount)))) * 100 : 0 }, this_month: { sales: sum(thisMonthSales.map((sale) => Number(sale.net_amount))), profit: sum(thisMonthSales.map((sale) => Number(sale.total_profit))), transactions: thisMonthSales.length, profit_margin: thisMonthSales.length && sum(thisMonthSales.map((sale) => Number(sale.net_amount))) > 0 ? (sum(thisMonthSales.map((sale) => Number(sale.total_profit))) / sum(thisMonthSales.map((sale) => Number(sale.net_amount)))) * 100 : 0 }, inventory: { low_stock_count: products.filter((product) => product.is_low_stock).length, total_products: products.length }, store: { name: currentUser.store_name || 'Kokotoa Store' } }, errors: null });
  },

  getDailyProfit: async (days = 7) => {
    const series = aggregateProfitByDay(days);
    return delay({ success: true, message: 'Daily profit', data: { data: series.data, labels: series.labels, period: { start: series.labels[0], end: series.labels.at(-1) || series.labels[0], days }, summary: { total_profit: sum(series.data), total_sales: sum(series.data), transaction_count: sales.length, average_profit: series.data.length ? sum(series.data) / series.data.length : 0, profit_margin: 30 } }, errors: null });
  },

  getMonthlyProfit: async (months = 6) => {
    const result = aggregateMonthly(months, (key) => sum(sales.filter((sale) => sale.created_at.slice(0, 7) === key).map((sale) => Number(sale.total_profit))));
    return delay({ success: true, message: 'Monthly profit', data: { data: result.data, labels: result.labels, summary: { total_profit: sum(result.data), average_monthly_profit: result.data.length ? sum(result.data) / result.data.length : 0 } }, errors: null });
  },

  getMonthlySales: async (months = 6) => {
    const result = aggregateMonthly(months, (key) => sum(sales.filter((sale) => sale.created_at.slice(0, 7) === key).map((sale) => Number(sale.net_amount))));
    return delay({ success: true, message: 'Monthly sales', data: { data: result.data, labels: result.labels, summary: { total_sales: sum(result.data), average_monthly_sales: result.data.length ? sum(result.data) / result.data.length : 0 } }, errors: null });
  },
};

export type {
  SubscriptionState,
};
