import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { graphsApi, reportsApi, Sale } from '@/services/api';
import type {
  AnalyticsTrendPoint,
  CreditAnalyticsData,
  DailySummaryData,
  DashboardReportData,
  DiscountAnalyticsData,
  DiscountTrendPoint,
  InventoryReportData,
  LowStockProductPoint,
  NamedProfitPoint,
  NamedSalesPoint,
  NamedValuePoint,
  ProfitReportData,
  ReportLanguage,
  ReportTabId,
  SalesReportData,
  TopProductPoint,
} from './types';
import { buildTrendDates, exportToCSV, formatTrendDateLabel } from './utils';

interface UseReportsDataParams {
  activeTab: ReportTabId;
  dateRange: string;
  language: ReportLanguage;
}

export const useReportsData = ({ activeTab, dateRange, language }: UseReportsDataParams) => {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReportData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardReportData | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummaryData | null>(null);
  const [profitReport, setProfitReport] = useState<ProfitReportData | null>(null);
  const [creditAnalytics, setCreditAnalytics] = useState<CreditAnalyticsData | null>(null);
  const [discountAnalytics, setDiscountAnalytics] = useState<DiscountAnalyticsData | null>(null);

  const [salesByMethod, setSalesByMethod] = useState<NamedValuePoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductPoint[]>([]);
  const [salesByHour, setSalesByHour] = useState<NamedSalesPoint[]>([]);
  const [inventoryValue, setInventoryValue] = useState<NamedValuePoint[]>([]);
  const [dailyTrend, setDailyTrend] = useState<NamedSalesPoint[]>([]);
  const [dailyProfitTrend, setDailyProfitTrend] = useState<NamedProfitPoint[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProductPoint[]>([]);
  const [analyticsTrend, setAnalyticsTrend] = useState<AnalyticsTrendPoint[]>([]);
  const [discountTrendData, setDiscountTrendData] = useState<DiscountTrendPoint[]>([]);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSaleDetailsOpen, setIsSaleDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const days = parseInt(dateRange, 10);
      const dateTo = format(new Date(), 'yyyy-MM-dd');
      const dateFrom = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const trendDates = buildTrendDates(dateFrom, dateTo);

      try {
        const [dashboard, sales, inventory, dailyRec, profit, credit, discounts, unifiedTrend] =
          await Promise.all([
            graphsApi.getDashboard().catch(() => null),
            reportsApi.getSales({ date_from: dateFrom, date_to: dateTo }).catch(() => null),
            reportsApi.getInventory().catch(() => null),
            reportsApi.getDailySummary().catch(() => null),
            reportsApi.getProfit({ date_from: dateFrom, date_to: dateTo }).catch(() => null),
            reportsApi.getCredit({ date_from: dateFrom, date_to: dateTo }).catch(() => null),
            reportsApi.getDiscounts({ date_from: dateFrom, date_to: dateTo }).catch(() => null),
            reportsApi.getAnalyticsTrend({ date_from: dateFrom, date_to: dateTo }).catch(() => null),
          ]);

        if (dashboard?.data) {
          setDashboardData(dashboard.data as DashboardReportData);
        }

        if (sales?.data) {
          setSalesData(sales.data as SalesReportData);
        }

        if (inventory?.data) {
          setInventoryData(inventory.data as InventoryReportData);
        }

        if (dailyRec?.data) {
          setDailySummary(dailyRec.data as DailySummaryData);
        }

        if (credit?.data) {
          setCreditAnalytics(credit.data as CreditAnalyticsData);
        }

        if (discounts?.data) {
          const discountData = discounts.data as DiscountAnalyticsData;
          const discountTrendMap = new Map(
            (discountData.trend || []).map((entry) => [entry.date, Number(entry.total) || 0])
          );

          setDiscountAnalytics(discountData);
          setDiscountTrendData(
            (discountData.trend || []).length
              ? trendDates.map((date) => ({
                  name: formatTrendDateLabel(date, language),
                  total: discountTrendMap.get(date) || 0,
                }))
              : []
          );
        } else {
          setDiscountAnalytics(null);
          setDiscountTrendData([]);
        }

        if (unifiedTrend?.data?.trends?.length) {
          const analyticsTrendMap = new Map(
            unifiedTrend.data.trends.map((entry) => [entry.date, entry])
          );

          setAnalyticsTrend(
            trendDates.map((date) => {
              const entry = analyticsTrendMap.get(date);

              return {
                name: formatTrendDateLabel(date, language),
                sales: Number(entry?.sales) || 0,
                profit: Number(entry?.profit) || 0,
                credit: Number(entry?.credit) || 0,
                discounts: Number(entry?.discounts) || 0,
              };
            })
          );
        } else {
          setAnalyticsTrend([]);
        }

        if (profit?.data) {
          console.log('[Reports] Profit report data:', profit.data);
          setProfitReport(profit.data as ProfitReportData);
        } else if (profit === null) {
          console.warn('[Reports] Profit report API returned null - endpoint may not be available');
        }

        const [daily, top, methods, hours, value, dailyProfit, lowStock, todayTop, todayMethods] =
          await Promise.all([
            graphsApi.getDailySales(days).catch(() => null),
            graphsApi.getTopProducts({ limit: 5, days }).catch(() => null),
            graphsApi.getPaymentMethods(days).catch(() => null),
            graphsApi.getSalesByHour(days).catch(() => null),
            graphsApi.getInventoryValue().catch(() => null),
            graphsApi.getDailyProfit(days).catch(() => null),
            graphsApi.getLowStock().catch(() => null),
            graphsApi.getTopProducts({ limit: 5, days: 1 }).catch(() => null),
            graphsApi.getPaymentMethods(1).catch(() => null),
          ]);

        if (daily?.data) {
          setDailyTrend(
            daily.data.labels.map((label: string, index: number) => ({
              name: new Date(label).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
                day: 'numeric',
                month: 'short',
              }),
              sales: daily.data.data[index],
            }))
          );
        }

        if (top?.data) {
          setTopProducts(
            top.data.data.map((product: any) => ({
              name: product.name,
              quantity: product.quantity_sold,
              revenue: product.revenue,
            }))
          );
        }

        if (methods?.data) {
          setSalesByMethod(
            methods.data.labels.map((label: string, index: number) => ({
              name: label,
              value: methods.data.data[index],
            }))
          );
        }

        if (hours?.data) {
          setSalesByHour(
            hours.data.labels.map((label: string, index: number) => ({
              name: label,
              sales: hours.data.data[index],
            }))
          );
        }

        if (value?.data) {
          setInventoryValue(
            value.data.labels.map((label: string, index: number) => ({
              name: label,
              value: value.data.data[index],
            }))
          );
        }

        if (dailyProfit?.data) {
          setDailyProfitTrend(
            dailyProfit.data.labels.map((label: string, index: number) => ({
              name: new Date(label).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
                day: 'numeric',
                month: 'short',
              }),
              profit: dailyProfit.data.data[index],
            }))
          );
        }

        if (lowStock?.data) {
          setLowStockProducts((lowStock.data.data || []) as LowStockProductPoint[]);
        }

        if (!dailyRec?.data) {
          const paymentMethods: Record<string, { total: number; count: number }> = {};

          if (todayMethods?.data) {
            todayMethods.data.labels.forEach((label: string, index: number) => {
              paymentMethods[label] = {
                total: todayMethods.data.data[index],
                count: 0,
              };
            });
          }

          setDailySummary({
            top_products:
              todayTop?.data?.data.map((product: any) => ({
                product_name: product.name,
                product_sku: product.sku,
                quantity: product.quantity_sold,
                revenue: product.revenue,
              })) || [],
            low_stock_alerts:
              lowStock?.data?.data.map((product: any) => ({
                name: product.name,
                sku: product.sku,
                quantity: product.current_stock,
                minimum_stock: product.minimum_stock,
              })) || [],
            payment_methods: paymentMethods,
          });
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, dateRange, language]);

  const handleSalesExport = () => {
    if (!salesData?.sales) return;

    exportToCSV(
      salesData.sales.map((sale) => ({
        Transaction: sale.transaction_number,
        Date: format(new Date(sale.date), 'yyyy-MM-dd HH:mm'),
        Items: sale.items_count,
        Total: sale.total_amount,
        Payment: sale.payment_method,
        Cashier: sale.cashier,
        Status: 'Completed',
      })),
      'sales_report'
    );
  };

  const handleInventoryExport = () => {
    if (!inventoryData?.products) return;

    exportToCSV(
      inventoryData.products.map((product) => ({
        SKU: product.sku,
        Name: product.name,
        Category: product.category,
        Stock: product.current_stock,
        Cost: product.cost_price,
        Selling: product.selling_price,
        Value: product.retail_value,
        Status: product.is_low_stock ? 'Low Stock' : 'OK',
      })),
      'inventory_report'
    );
  };

  const handleProfitExport = () => {
    if (!profitReport?.profit_transactions) return;

    exportToCSV(
      profitReport.profit_transactions.map((transaction) => ({
        Transaction: transaction.transaction_number,
        Date: format(new Date(transaction.date), 'yyyy-MM-dd HH:mm'),
        'Net Amount': transaction.net_amount,
        'Total Profit': transaction.total_profit,
        'Profit Margin': `${transaction.profit_margin.toFixed(1)}%`,
        Cashier: transaction.cashier,
      })),
      'profit_report'
    );
  };

  const discountedSales = useMemo(
    () =>
      [...(salesData?.sales || [])]
        .filter((sale) => Number(sale.discount) > 0 && !sale.is_returned)
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
    [salesData]
  );

  const discountSummary = useMemo(() => {
    const totalDiscountFromSales = discountedSales.reduce(
      (sum, sale) => sum + (Number(sale.discount) || 0),
      0
    );
    const transactionCount = discountAnalytics?.summary?.transaction_count ?? discountedSales.length;
    const totalDiscountAmount =
      discountAnalytics?.summary?.total_discount_amount ?? totalDiscountFromSales;
    const averageDiscountPerSale =
      discountAnalytics?.summary?.average_discount_per_sale ??
      (transactionCount ? totalDiscountAmount / transactionCount : 0);
    const discountRatio =
      discountAnalytics?.summary?.discount_ratio ??
      (salesData?.summary?.total_sales
        ? (totalDiscountAmount / salesData.summary.total_sales) * 100
        : 0);

    return {
      totalDiscountAmount,
      averageDiscountPerSale,
      discountRatio,
      transactionCount,
    };
  }, [discountAnalytics, discountedSales, salesData]);

  const hasAnalyticsTrendData = analyticsTrend.some(
    (point) => point.sales > 0 || point.profit > 0 || point.credit > 0 || point.discounts > 0
  );
  const effectiveDiscountTrendData = discountTrendData.length
    ? discountTrendData
    : analyticsTrend.map((point) => ({ name: point.name, total: point.discounts }));
  const hasDiscountTrendData = effectiveDiscountTrendData.some((point) => point.total > 0);

  const handleDiscountsExport = () => {
    if (!discountedSales.length) return;

    exportToCSV(
      discountedSales.map((sale) => ({
        Transaction: sale.transaction_number,
        Date: format(new Date(sale.date), 'yyyy-MM-dd HH:mm'),
        Items: sale.items_count,
        Gross: sale.total_amount,
        Discount: sale.discount,
        Net: sale.net_amount,
        Profit: sale.profit || 0,
        Payment: sale.payment_method,
        Cashier: sale.cashier || '',
      })),
      'discounts_report'
    );
  };

  const handleRowClick = async (sale: { id: number }) => {
    try {
      const response = await reportsApi.getSaleDetail(sale.id);

      if (response.success && response.data) {
        setSelectedSale(response.data);
        setIsSaleDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error loading sale detail from report endpoint:', error);
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description:
          language === 'sw'
            ? 'Imeshindwa kupata maelezo ya muamala.'
            : 'Failed to load sale details.',
        variant: 'destructive',
      });
    }
  };

  return {
    analyticsTrend,
    creditAnalytics,
    dailyProfitTrend,
    dailySummary,
    dailyTrend,
    discountedSales,
    discountSummary,
    effectiveDiscountTrendData,
    handleDiscountsExport,
    handleInventoryExport,
    handleProfitExport,
    handleRowClick,
    handleSalesExport,
    hasAnalyticsTrendData,
    hasDiscountTrendData,
    inventoryData,
    inventoryValue,
    isLoading,
    isSaleDetailsOpen,
    lowStockProducts,
    profitReport,
    salesByHour,
    salesByMethod,
    salesData,
    selectedSale,
    setIsSaleDetailsOpen,
    topProducts,
    dashboardData,
  };
};
