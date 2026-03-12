import type { LucideIcon } from 'lucide-react';
import type { InventoryReport } from '@/services/api';

export type ReportLanguage = 'sw' | 'en';

export type ReportTabId =
  | 'overview'
  | 'analytics'
  | 'sales'
  | 'profit'
  | 'credit'
  | 'inventory'
  | 'discounts';

export interface ReportTabDefinition {
  id: ReportTabId;
  label: string;
  icon: LucideIcon;
}

export interface ReportSaleRow {
  id: number;
  transaction_number: string;
  items?: string[];
  product_names?: string;
  date: string;
  items_count: number;
  total_amount: number;
  discount: number;
  tax: number;
  net_amount: number;
  profit?: number;
  payment_method: string;
  cashier: string | null;
  is_returned: boolean;
}

export interface SalesReportData {
  sales: ReportSaleRow[];
  summary: {
    total_sales: number;
    total_transactions: number;
    average_sale: number;
  };
}

export type InventoryReportData = InventoryReport;

export interface DashboardReportData {
  today: { sales: number; profit?: number; transactions: number };
  this_month: { sales: number; profit?: number; transactions: number };
  inventory: { low_stock_count: number; total_products: number };
  store: { name: string };
}

export interface DailyTopProduct {
  product_name: string;
  product_sku: string;
  quantity: number;
  revenue: number;
}

export interface DailyLowStockAlert {
  name: string;
  sku: string;
  quantity: number;
  minimum_stock: number;
}

export interface PaymentMethodSummaryEntry {
  total: number;
  count: number;
}

export interface DailySummaryData {
  top_products?: DailyTopProduct[];
  low_stock_alerts?: DailyLowStockAlert[];
  payment_methods?: Record<string, PaymentMethodSummaryEntry>;
}

export interface NamedValuePoint {
  name: string;
  value: number;
}

export interface NamedSalesPoint {
  name: string;
  sales: number;
}

export interface NamedProfitPoint {
  name: string;
  profit: number;
}

export interface TopProductPoint {
  name: string;
  quantity: number;
  revenue: number;
}

export interface LowStockProductPoint {
  id: number;
  name: string;
  category: string;
  sku: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

export interface AnalyticsTrendPoint {
  name: string;
  sales: number;
  profit: number;
  credit: number;
  discounts: number;
}

export interface DiscountTrendPoint {
  name: string;
  total: number;
}

export interface CreditAnalyticsData {
  summary?: {
    total_credit_amount: number;
    total_outstanding_debt: number;
    total_recovered_amount: number;
    recovery_rate: number;
    transaction_count: number;
  };
  trend?: Array<{ date: string; total: number }>;
  top_customers?: Array<{
    customer_name: string;
    customer_phone: string;
    total: number;
    outstanding: number;
    count: number;
  }>;
  period?: { start: string; end: string };
}

export interface DiscountAnalyticsData {
  summary?: {
    total_discount_amount: number;
    average_discount_per_sale: number;
    discount_ratio: number;
    transaction_count: number;
  };
  trend?: Array<{ date: string; total: number }>;
  period?: { start: string; end: string };
}

export interface ProfitTransactionRow {
  id: number;
  transaction_number: string;
  date: string;
  product_names?: string;
  net_amount: number;
  total_profit: number;
  profit_margin: number;
  cashier: string | null;
}

export interface ProfitReportData {
  profit_transactions: ProfitTransactionRow[];
  period?: {
    start: string;
    end: string;
  };
  summary?: {
    total_sales: number;
    total_profit: number;
    total_transactions: number;
    average_profit: number;
    average_profit_margin: number;
  };
}

export interface DiscountSummaryMetrics {
  totalDiscountAmount: number;
  averageDiscountPerSale: number;
  discountRatio: number;
  transactionCount: number;
}
