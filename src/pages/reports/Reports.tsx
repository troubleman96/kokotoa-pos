import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { reportsApi, graphsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DollarSign, TrendingUp, Calendar, Download, BarChart3, Package, AlertTriangle, CreditCard,
  PiggyBank, Percent
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import MathLoader from '@/components/ui/MathLoader';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Reports = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'analytics' | 'profit'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<{
    sales: Array<{
      id: number;
      transaction_number: string;
      date: string;
      items_count: number;
      total_amount: number;
      payment_method: string;
      cashier: string;
    }>;
    summary: {
      total_sales: number;
      total_transactions: number;
      average_sale: number;
    };
  } | null>(null);
  const [inventoryData, setInventoryData] = useState<{
    products: Array<{
      id: number;
      sku: string;
      name: string;
      category: string;
      current_stock: number;
      cost_price: number;
      selling_price: number;
      cost_value: number;
      retail_value: number;
      is_low_stock: boolean;
    }>;
    summary: {
      total_items: number;
      total_cost_value: number;
      total_retail_value: number;
      low_stock_count: number;
    };
  } | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    today: { sales: number; profit?: number; transactions: number };
    this_month: { sales: number; profit?: number; transactions: number };
    inventory: { low_stock_count: number; total_products: number };
    store: { name: string };
  } | null>(null);

  // Graph States
  const [salesByMethod, setSalesByMethod] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesByHour, setSalesByHour] = useState<any[]>([]);
  const [inventoryValue, setInventoryValue] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [dailyProfitTrend, setDailyProfitTrend] = useState<any[]>([]);

  const [dailySummary, setDailySummary] = useState<any>(null);

  const [profitReport, setProfitReport] = useState<any | null>(null);

  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const days = parseInt(dateRange);

      const dateTo = format(new Date(), 'yyyy-MM-dd');
      const dateFrom = format(subDays(new Date(), days), 'yyyy-MM-dd');

      try {
        const [dashboard, sales, inventory, dailyRec, profit] = await Promise.all([
          graphsApi.getDashboard().catch(() => null),
          reportsApi.getSales({ date_from: dateFrom, date_to: dateTo }).catch(() => null),
          reportsApi.getInventory().catch(() => null),
          reportsApi.getDailySummary().catch(() => null),
          reportsApi.getProfit({ date_from: dateFrom, date_to: dateTo }).catch(() => null),
        ]);

        if (dashboard?.data) setDashboardData(dashboard.data);
        if (sales?.data) setSalesData(sales.data);
        if (inventory?.data) setInventoryData(inventory.data);
        if (dailyRec?.data) setDailySummary(dailyRec.data);
        if (profit?.data) {
          console.log('[Reports] Profit report data:', profit.data);
          setProfitReport(profit.data);
        } else if (profit === null) {
          console.warn('[Reports] Profit report API returned null - endpoint may not be available');
        }

        // Fetch Analytics specifically if tab is active or just as extra data
        if (activeTab === 'analytics' || activeTab === 'profit') {
          const [daily, top, methods, hours, value, dailyProfit] = await Promise.all([
            graphsApi.getDailySales(days).catch(() => null),
            graphsApi.getTopProducts({ limit: 5, days }).catch(() => null),
            graphsApi.getPaymentMethods(days).catch(() => null),
            graphsApi.getSalesByHour(days).catch(() => null),
            graphsApi.getInventoryValue().catch(() => null),
            graphsApi.getDailyProfit(days).catch(() => null),
          ]);

          if (daily?.data) {
            setDailyTrend(daily.data.labels.map((l, i) => ({
              name: new Date(l).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { day: 'numeric', month: 'short' }),
              sales: daily.data.data[i]
            })));
          }
          if (top?.data) setTopProducts(top.data.data.map(p => ({ name: p.name, quantity: p.quantity_sold, revenue: p.revenue })));
          if (methods?.data) setSalesByMethod(methods.data.labels.map((l, i) => ({ name: l, value: methods.data.data[i] })));
          if (hours?.data) setSalesByHour(hours.data.labels.map((l, i) => ({ name: l, sales: hours.data.data[i] })));
          if (value?.data) setInventoryValue(value.data.labels.map((l, i) => ({ name: l, value: value.data.data[i] })));
          if (dailyProfit?.data) {
            setDailyProfitTrend(dailyProfit.data.labels.map((l, i) => ({
              name: new Date(l).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { day: 'numeric', month: 'short' }),
              profit: dailyProfit.data.data[i],
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange, activeTab, language]);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let val = row[header];
        if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
        return val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link); // Append to body before clicking
    link.click();
    document.body.removeChild(link);
  };

  const handleSalesExport = () => {
    if (!salesData?.sales) return;
    const exportData = salesData.sales.map(s => ({
      Transaction: s.transaction_number,
      Date: format(new Date(s.date), 'yyyy-MM-dd HH:mm'),
      Items: s.items_count,
      Total: s.total_amount,
      Payment: s.payment_method,
      Cashier: s.cashier,
      Status: 'Completed' // Assuming all sales are completed for now, adjust if 'is_returned' is available
    }));
    exportToCSV(exportData, 'sales_report');
  };

  const handleInventoryExport = () => {
    if (!inventoryData?.products) return;
    const exportData = inventoryData.products.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category,
      Stock: p.current_stock,
      Cost: p.cost_price,
      Selling: p.selling_price,
      Value: p.retail_value,
      Status: p.is_low_stock ? 'Low Stock' : 'OK'
    }));
    exportToCSV(exportData, 'inventory_report');
  };

  const handleProfitExport = () => {
    if (!profitReport?.profit_transactions) return;
    const exportData = profitReport.profit_transactions.map((tx: any) => ({
      Transaction: tx.transaction_number,
      Date: format(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
      'Net Amount': tx.net_amount,
      'Total Profit': tx.total_profit,
      'Profit Margin': `${tx.profit_margin.toFixed(1)}%`,
      Cashier: tx.cashier
    }));
    exportToCSV(exportData, 'profit_report');
  };

  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

  const tabs = [
    { id: 'overview', label: language === 'sw' ? 'Muhtasari' : 'Overview' },
    { id: 'analytics', label: language === 'sw' ? 'Takwimu' : 'Analytics' },
    { id: 'sales', label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { id: 'profit', label: language === 'sw' ? 'Faida' : 'Profit' },
    { id: 'inventory', label: language === 'sw' ? 'Hesabu' : 'Inventory' },
  ];

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Ripoti na Takwimu' : 'Reports & Analytics'}
      subtitle={language === 'sw' ? 'Angalia utendaji wa biashara yako' : 'View your business performance'}
    >
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="flex justify-end">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{language === 'sw' ? 'Wiki 1' : '1 Week'}</SelectItem>
              <SelectItem value="30">{language === 'sw' ? 'Mwezi 1' : '1 Month'}</SelectItem>
              <SelectItem value="90">{language === 'sw' ? 'Miezi 3' : '3 Months'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={activeTab === tab.id ? 'btn-kokotoa' : ''}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab (Daily Summary) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Top Products */}
              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {language === 'sw' ? 'Bidhaa Zinazoongoza Leo' : "Today's Top Products"}
                  </CardTitle>
                  <CardDescription>
                    {language === 'sw' ? 'Bidhaa zenye mapato makubwa zaidi leo' : 'Highest revenue generating products today'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailySummary?.top_products?.length ? dailySummary.top_products.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex flex-col">
                          <span className="font-medium">{p.product_name}</span>
                          <span className="text-xs text-muted-foreground">{p.product_sku}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{formatPrice(p.revenue)}</div>
                          <div className="text-xs text-muted-foreground">{p.quantity} {language === 'sw' ? 'zimeuzwa' : 'sold'}</div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-4 text-muted-foreground">
                        {language === 'sw' ? 'Hakuna mauzo bado' : 'No sales yet today'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts Snapshot */}
              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    {language === 'sw' ? 'Tahadhari ya Bidhaa' : 'Stock Alerts'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'sw' ? 'Bidhaa zinazohitaji kuongezwa mara moja' : 'Items that need immediate restocking'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailySummary?.low_stock_alerts?.length ? dailySummary.low_stock_alerts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div>
                          <span className="font-medium text-foreground">{p.name}</span>
                          <span className="text-xs text-muted-foreground block">{p.sku}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-destructive">{p.quantity}</div>
                          <div className="text-xs text-muted-foreground">{language === 'sw' ? 'Baki (Min: ' : 'Left (Min: '}{p.minimum_stock})</div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-4 text-primary">
                        {language === 'sw' ? 'Bidhaa zote zipo katika hali nzuri' : 'All items are well stocked'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Sales Breakdown */}
              <Card className="card-kokotoa lg:col-span-2">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Mchanganuo wa Malipo ya Leo' : "Today's Payment Breakdown"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailySummary?.payment_methods && Object.entries(dailySummary.payment_methods).map(([method, data]: [string, any]) => (
                      <div key={method} className="p-4 rounded-xl border border-border bg-muted/30 shadow-sm flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">{method}</div>
                          <div className="text-lg font-bold text-foreground">{formatPrice(data.total)}</div>
                        </div>
                        <div className="text-right">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1 ml-auto">
                            <span className="text-primary font-bold text-xs">{data.count}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium">{language === 'sw' ? 'Miamala' : 'Transactions'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="card-kokotoa border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'sw' ? 'Mauzo ya Leo' : "Today's Sales"}</CardTitle>
                  <DollarSign className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {formatPrice(dashboardData?.today.sales || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData?.today.transactions || 0} {language === 'sw' ? 'miamala' : 'transactions'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'sw' ? 'Faida ya Leo' : "Today's Profit"}:{' '}
                    <span className="font-semibold text-primary">
                      {formatPrice(dashboardData?.today.profit || 0)}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="card-kokotoa border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'sw' ? 'Mauzo ya Mwezi' : 'This Month'}</CardTitle>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {formatPrice(dashboardData?.this_month.sales || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData?.this_month.transactions || 0} {language === 'sw' ? 'miamala' : 'transactions'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'sw' ? 'Faida ya Mwezi' : 'Profit This Month'}:{' '}
                    <span className="font-semibold text-primary">
                      {formatPrice(dashboardData?.this_month.profit || 0)}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="card-kokotoa border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'sw' ? 'Jumla ya Bidhaa' : 'Total Products'}</CardTitle>
                  <Package className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {dashboardData?.inventory.total_products || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sw' ? 'katika hesabu' : 'in inventory'}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-kokotoa border-destructive/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'sw' ? 'Bidhaa Zinakwisha' : 'Low Stock'}</CardTitle>
                  <Package className="w-4 h-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-destructive">
                    {dashboardData?.inventory.low_stock_count || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sw' ? 'zinahitaji kuongezwa' : 'need restocking'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex text-center py-8 justify-center">
                <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
              </div>
            ) : salesData ? (
              <>
                {/* Sales Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="card-kokotoa border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'sw' ? 'Jumla ya Mauzo' : 'Total Sales'}
                      </CardTitle>
                      <DollarSign className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {formatPrice(salesData.summary?.total_sales || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-kokotoa border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'sw' ? 'Idadi ya Miamala' : 'Total Transactions'}
                      </CardTitle>
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {salesData.summary?.total_transactions || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-kokotoa border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'sw' ? 'Wastani wa Mauzo' : 'Average Sale'}
                      </CardTitle>
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {formatPrice(salesData.summary?.average_sale || 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="card-kokotoa">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{language === 'sw' ? 'Mauzo katika Kipindi Hiki' : 'Sales for Selected Period'}</CardTitle>
                      <Button variant="outline" size="sm" onClick={handleSalesExport} disabled={!salesData?.sales.length}>
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'sw' ? 'Pakua (CSV)' : 'Download (CSV)'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {salesData.sales.length ? (
                      <div className="space-y-4">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border bg-muted/30">
                                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Muamala' : 'Transaction'}</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Bidhaa' : 'Items'}</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Malipo' : 'Payment'}</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Jumla' : 'Total'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {salesData.sales.slice(0, 20).map((sale) => (
                                <tr key={sale.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="p-4 font-mono text-xs font-bold text-foreground">{sale.transaction_number}</td>
                                  <td className="p-4">
                                    <div className="text-sm">
                                      <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
                                      <p className="text-[10px] text-muted-foreground">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-bold">{sale.items_count} {language === 'sw' ? 'Vitu' : 'Items'}</span>
                                  </td>
                                  <td className="p-4 text-xs font-medium text-muted-foreground">{sale.payment_method}</td>
                                  <td className="p-4 text-right font-bold text-primary">{formatPrice(sale.total_amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                          {salesData.sales.slice(0, 15).map((sale) => (
                            <div key={sale.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-mono text-[10px] font-bold text-muted-foreground bg-muted p-1 rounded">
                                  {sale.transaction_number}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-medium">
                                  {new Date(sale.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {sale.payment_method === 'CASH' ? <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> : <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                                    <span className="text-xs font-bold">{sale.payment_method}</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {sale.items_count} {language === 'sw' ? 'Vitu zilizouzwa' : 'Items sold'}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-base font-bold text-primary">{formatPrice(sale.total_amount)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">{language === 'sw' ? 'Hakuna miamala iliyopatikana' : 'No transactions found'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {language === 'sw' ? 'Hakuna data ya mauzo inapatikana' : 'No sales data available'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <Card className="card-kokotoa">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{language === 'sw' ? 'Ripoti ya Hesabu' : 'Inventory Report'}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleInventoryExport} disabled={!inventoryData?.products.length}>
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'sw' ? 'Pakua (CSV)' : 'Download (CSV)'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex text-center py-8 justify-center">
                  <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
                </div>
              ) : inventoryData?.products.length ? (
                <div className="space-y-4">
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Bidhaa' : 'Product'}</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Aina' : 'Category'}</th>
                          <th className="text-center p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Kiasi' : 'Stock'}</th>
                          <th className="text-right p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Thamani' : 'Value'}</th>
                          <th className="text-center p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Hali' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {inventoryData.products.slice(0, 10).map((product) => (
                          <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-sm text-foreground">{product.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono block">{product.sku}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-medium text-muted-foreground">{product.category}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-sm font-bold ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`}>
                                {product.current_stock}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono text-xs text-muted-foreground">{formatPrice(product.retail_value)}</td>
                            <td className="p-4 text-center">
                              {product.is_low_stock ? (
                                <span className="px-2.5 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  {language === 'sw' ? 'Chini' : 'Low'}
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  {language === 'sw' ? 'Sawa' : 'OK'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {inventoryData.products.slice(0, 10).map((product) => (
                      <div key={product.id} className={`p-4 rounded-xl border border-border bg-card shadow-sm space-y-4 ${product.is_low_stock ? 'border-l-4 border-l-destructive' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-sm text-foreground mb-0.5">{product.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{product.sku}</p>
                          </div>
                          {product.is_low_stock ? (
                            <span className="px-2 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-[9px] font-black uppercase">
                              {language === 'sw' ? 'CHINI' : 'LOW'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">
                              {language === 'sw' ? 'SAWA' : 'OK'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                          <div>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{language === 'sw' ? 'STOKI' : 'STOCK'}</p>
                            <p className={`text-sm font-bold ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`}>{product.current_stock}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{language === 'sw' ? 'THAMANI' : 'VALUE'}</p>
                            <p className="text-sm font-bold text-primary">{formatPrice(product.retail_value)}</p>
                          </div>
                        </div>

                        <div className="text-[10px] text-muted-foreground flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                          <span className="font-bold uppercase tracking-widest">{language === 'sw' ? 'Aina:' : 'Category:'}</span>
                          <span className="font-medium">{product.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">{language === 'sw' ? 'Hakuna bidhaa' : 'No products'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales Trend */}
              <Card className="card-kokotoa">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>{language === 'sw' ? 'Mwenendo wa Mapato' : 'Revenue Trend'}</CardTitle>
                    <CardDescription>{language === 'sw' ? `Mwenendo wa mauzo kwa muda mrefu` : `Revenue over the selected period`}</CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="h-80 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrend}>
                      <defs>
                        <linearGradient id="colorSalesDetailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(v) => `TSh ${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(v: number) => [formatPrice(v), language === 'sw' ? 'Mauzo' : 'Sales']}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSalesDetailed)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily Profit Trend */}
              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Mwenendo wa Faida' : 'Profit Trend'}</CardTitle>
                  <CardDescription>{language === 'sw' ? `Mwenendo wa faida kwa muda mrefu` : `Profit trend over the selected period`}</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyProfitTrend}>
                      <defs>
                        <linearGradient id="colorProfitDetailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `TSh ${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        formatter={(v: number) => [formatPrice(v), language === 'sw' ? 'Faida' : 'Profit']}
                      />
                      <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfitDetailed)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods Breakdown */}
              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Njia za Malipo' : 'Payment Methods'}</CardTitle>
                  <CardDescription>{language === 'sw' ? 'Mchanganuo wa malipo yaliyopokelewa' : 'Breakdown of sales by payment type'}</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByMethod}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {salesByMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        formatter={(v: number) => formatPrice(v)}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Bidhaa Zinazouzika' : 'Top Selling Products'}</CardTitle>
                  <CardDescription>{language === 'sw' ? 'Bidhaa zilizouzwa zaidi kwa idadi' : 'Best performing products by quantity'}</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                      <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" fontSize={10} width={100} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="quantity" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Peak Sales Hours */}
              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Saa za Biashara' : 'Peak Sales Hours'}</CardTitle>
                  <CardDescription>{language === 'sw' ? 'Mchanganuo wa mauzo kwa saa' : 'Sales distribution across the day'}</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByHour}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        formatter={(v: number) => formatPrice(v)}
                      />
                      <Bar dataKey="sales" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Value Breakdown */}
            <Card className="card-kokotoa lg:col-span-2">
              <CardHeader>
                <CardTitle>{language === 'sw' ? 'Thamani ya Bidhaa kwa Aina' : 'Inventory Value by Category'}</CardTitle>
                <CardDescription>{language === 'sw' ? 'Thamani ya bidhaa zilizopo ghala kwa sasa' : 'Total retail value distribution across categories'}</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryValue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `TSh ${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      formatter={(v: number) => formatPrice(v)}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profit Tab */}
        {activeTab === 'profit' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex text-center py-8 justify-center">
                <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
              </div>
            ) : profitReport ? (
              <>
                {/* Profit Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="card-kokotoa border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'sw' ? 'Jumla ya Faida' : 'Total Profit'}
                      </CardTitle>
                      <PiggyBank className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {formatPrice(profitReport.summary?.total_profit || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {profitReport.summary?.total_transactions || 0} {language === 'sw' ? 'miamala' : 'transactions'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-kokotoa border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'sw' ? 'Mauzo kwa Kipindi' : 'Sales for Period'}
                      </CardTitle>
                      <DollarSign className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {formatPrice(profitReport.summary?.total_sales || 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-kokotoa border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'sw' ? 'Asilimia ya Faida' : 'Profit Margin'}
                      </CardTitle>
                      <Percent className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {(profitReport.summary?.average_profit_margin || 0).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'sw' ? 'Wastani wa margin' : 'Average margin'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-kokotoa border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'sw' ? 'Wastani wa Faida' : 'Average Profit'}
                      </CardTitle>
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {formatPrice(profitReport.summary?.average_profit || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'sw' ? 'Kwa kila muamala' : 'Per transaction'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Profit Transaction Table */}
                <Card className="card-kokotoa">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{language === 'sw' ? 'Mchanganuo wa Faida kwa Muamala' : 'Profit Breakdown by Transaction'}</CardTitle>
                      <Button variant="outline" size="sm" onClick={handleProfitExport} disabled={!profitReport?.profit_transactions.length}>
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'sw' ? 'Pakua (CSV)' : 'Download (CSV)'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {profitReport.profit_transactions?.length ? (
                      <div className="space-y-4">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border bg-muted/30">
                                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Muamala' : 'Transaction'}</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Mauzo' : 'Sales'}</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Faida' : 'Profit'}</th>
                                <th className="text-center p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Margin' : 'Margin'}</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Keshia' : 'Cashier'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {profitReport.profit_transactions.slice(0, 20).map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="p-4 font-mono text-xs font-bold text-foreground">{tx.transaction_number}</td>
                                  <td className="p-4">
                                    <div className="text-sm">
                                      <p className="font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                                      <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                  </td>
                                  <td className="p-4 text-right font-medium">{formatPrice(tx.net_amount)}</td>
                                  <td className="p-4 text-right font-bold text-emerald-500">{formatPrice(tx.total_profit)}</td>
                                  <td className="p-4 text-center">
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold">
                                      {tx.profit_margin.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="p-4 text-sm text-muted-foreground">{tx.cashier}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="grid grid-cols-1 gap-3 md:hidden">
                          {profitReport.profit_transactions.slice(0, 15).map((tx: any) => (
                            <div key={tx.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-mono text-[10px] font-bold text-muted-foreground bg-muted p-1 rounded">
                                  {tx.transaction_number}
                                </div>
                                <div className="text-xs font-bold text-emerald-500">
                                  +{formatPrice(tx.total_profit)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <div className="text-[10px] text-muted-foreground">
                                  {tx.cashier} • {new Date(tx.date).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full">
                                  {tx.profit_margin.toFixed(1)}% margin
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">{language === 'sw' ? 'Hakuna miamala ya faida' : 'No profit transactions'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Profit Trend Chart Re-added for visual analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dailyProfitTrend.length > 0 && (
                    <Card className="card-kokotoa">
                      <CardHeader>
                        <CardTitle>{language === 'sw' ? 'Mwenendo wa Faida' : 'Profit Trend'}</CardTitle>
                        <CardDescription>
                          {language === 'sw' ? 'Faida ya kila siku katika kipindi hiki' : 'Daily profit over the selected period'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dailyProfitTrend}>
                            <defs>
                              <linearGradient id="colorProfitReport" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `TSh ${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                              formatter={(v: number) => [formatPrice(v), language === 'sw' ? 'Faida' : 'Profit']}
                            />
                            <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfitReport)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Profit Distribution via Analytics */}
                  <Card className="card-kokotoa">
                    <CardHeader>
                      <CardTitle>{language === 'sw' ? 'Muhtasari wa Makundi' : 'Category Summary'}</CardTitle>
                      <CardDescription>
                        {language === 'sw' ? 'Mchanganuo wa mapato kwa kila aina' : 'Revenue distribution by category'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryValue}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {inventoryValue.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            formatter={(v: number) => formatPrice(v)}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {language === 'sw' ? 'Hakuna data ya faida inapatikana' : 'No profit data available'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;

