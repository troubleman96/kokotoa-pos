import { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, BarChart3, Settings,
  TrendingUp, AlertTriangle, DollarSign,
  ArrowUpRight, TrendingDown, Users, ArrowRight, Calendar, PiggyBank, BarChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { api, graphsApi, subscriptionApi, SubscriptionStatus } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Legend
} from 'recharts';
import TrialBanner from '@/components/subscription/TrialBanner';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import MathLoader from '@/components/ui/MathLoader';

const Dashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    today: { sales: number; profit: number; transactions: number; profit_margin: number };
    this_month: { sales: number; profit: number; transactions: number; profit_margin: number };
    inventory: { low_stock_count: number; total_products: number };
    store: { name: string };
  } | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [dailyProfitTrend, setDailyProfitTrend] = useState<any[]>([]);
  const [monthlyProfitTrend, setMonthlyProfitTrend] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscription State
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, salesRes, profitRes, monthlyRes] = await Promise.all([
          graphsApi.getDashboard().catch(() => null),
          graphsApi.getDailySales(7).catch(() => null),
          graphsApi.getDailyProfit(7).catch(() => null),
          graphsApi.getMonthlyProfit(6).catch(() => null),
        ]);

        if (dashRes?.data) {
          console.log('[Dashboard] Dashboard data:', dashRes.data);
          setDashboardData(dashRes.data);
        } else if (dashRes === null) {
          console.warn('[Dashboard] Dashboard API returned null');
        }

        // Process Daily Data for Comparison
        if (salesRes?.data && profitRes?.data) {
          const combinedData = salesRes.data.labels.map((label: string, index: number) => ({
            name: new Date(label).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { day: 'numeric', month: 'short' }),
            sales: salesRes.data.data[index] || 0,
            profit: profitRes.data.data[index] || 0
          }));
          setComparisonData(combinedData);
          setSalesTrend(combinedData);
          setDailyProfitTrend(combinedData);
        }

        if (monthlyRes?.data) {
          const monthlyData = monthlyRes.data.labels.map((label: string, index: number) => ({
            name: label,
            profit: monthlyRes.data.data[index] || 0
          }));
          setMonthlyProfitTrend(monthlyData);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSubscription = async () => {
      try {
        const subRes = await subscriptionApi.getStatus();
        if (subRes.success) {
          setSubscriptionStatus(subRes.data);
          // Auto-show upgrade modal if expired
          if (subRes.data.status === 'EXPIRED') {
            setShowUpgradeModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    if (user) {
      fetchDashboard();
      fetchSubscription();
    }
  }, [language, user]);

  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

  // Generate sample notifications
  const notifications = [
    ...(dashboardData?.inventory.low_stock_count ? [{
      id: '1',
      type: 'low_stock' as const,
      title: language === 'sw' ? 'Bidhaa Zinakwisha' : 'Low Stock Alert',
      message: language === 'sw'
        ? `${dashboardData.inventory.low_stock_count} bidhaa zinahitaji kuongezwa`
        : `${dashboardData.inventory.low_stock_count} products need restocking`,
      time: language === 'sw' ? 'Sasa hivi' : 'Just now',
      read: false,
    }] : []),
    ...(dashboardData?.today.transactions ? [{
      id: '2',
      type: 'sale' as const,
      title: language === 'sw' ? 'Mauzo ya Leo' : "Today's Sales",
      message: language === 'sw'
        ? `Umefanya mauzo ${dashboardData.today.transactions} - ${formatPrice(dashboardData.today.sales)}`
        : `You made ${dashboardData.today.transactions} sales - ${formatPrice(dashboardData.today.sales)}`,
      time: language === 'sw' ? 'Dakika 5 zilizopita' : '5 minutes ago',
      read: false,
    }] : []),
  ];

  return (
    <DashboardLayout
      title={language === 'sw'
        ? `Karibu, ${user?.first_name || 'Mfanyabiashara'}!`
        : `Welcome, ${user?.first_name || 'Business Owner'}!`}
      subtitle={new Date().toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
      notificationCount={dashboardData?.inventory.low_stock_count || 0}
      notifications={notifications}
    >
      {/* Messages */}
      {(user?.role === 'OWNER' && subscriptionStatus) && (
        <TrialBanner
          subscriptionStatus={subscriptionStatus}
          onUpgrade={() => setShowUpgradeModal(true)}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {user?.role === 'OWNER' && (
              <Card className="card-kokotoa">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === 'sw' ? 'Mauzo ya Leo' : "Today's Sales"}
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {formatPrice(dashboardData?.today.sales || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'sw' ? 'Faida ya Leo' : "Today's Profit"}:{' '}
                    <span className="font-bold text-emerald-600">
                      {formatPrice(dashboardData?.today.profit || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">
                      {dashboardData?.today.transactions || 0}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'sw' ? 'miamala' : 'transactions'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {user?.role === 'OWNER' && (
              <Card className="card-kokotoa">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === 'sw' ? 'Faida ya Leo' : "Today's Profit"}
                  </CardTitle>
                  <PiggyBank className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-emerald-600">
                    {formatPrice(dashboardData?.today.profit || 0)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      {dashboardData?.today.profit_margin?.toFixed(1) || '0.0'}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'sw' ? 'margin' : 'margin'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="card-kokotoa">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'sw' ? 'Jumla ya Bidhaa' : 'Total Products'}
                </CardTitle>
                <Package className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold text-foreground">
                  {dashboardData?.inventory.total_products || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === 'sw' ? 'katika hesabu' : 'in inventory'}
                </div>
              </CardContent>
            </Card>

            {user?.role === 'OWNER' && (
              <Card className="card-kokotoa">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === 'sw' ? 'Mauzo ya Mwezi' : 'This Month'}
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {formatPrice(dashboardData?.this_month.sales || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'sw' ? 'Faida' : 'Profit'}:{' '}
                    <span className="font-bold text-emerald-600">
                      {formatPrice(dashboardData?.this_month.profit || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Margin:</span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      {dashboardData?.this_month.profit_margin?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}


          </div>

          {(dashboardData?.inventory.low_stock_count || 0) > 0 && (
            <Card className="card-kokotoa mb-6 border-destructive/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                      <AlertTriangle className="w-5 h-5" />
                      {language === 'sw' ? 'Tahadhari' : 'Warning'}
                    </CardTitle>
                    <p className="text-sm font-medium text-destructive/80 pl-7 leading-snug">
                      {language === 'sw' ? (
                        <>Bidhaa <span className="font-bold text-foreground">{dashboardData?.inventory.low_stock_count || 0}</span> <br />zinahitaji kuongezwa!</>
                      ) : (
                        <><span className="font-bold text-foreground">{dashboardData?.inventory.low_stock_count || 0}</span> products <br />need restocking!</>
                      )}
                    </p>
                  </div>
                  <Link to="/inventory?low_stock=true">
                    <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      {language === 'sw' ? 'Tazama Zote' : 'View All'}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Sales Chart */}
            <Card className="card-kokotoa lg:col-span-3 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{language === 'sw' ? 'Mwenendo wa Mauzo' : 'Sales Trend'}</CardTitle>
                  <CardDescription>
                    {language === 'sw' ? 'Mwenendo wa mauzo kwa muda mrefu' : 'Long-term sales trend'}
                  </CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                      tickFormatter={(value) => `TSh ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                      formatter={(value: number) => [formatPrice(value), language === 'sw' ? 'Mauzo' : 'Sales']}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales vs Profit Comparison Chart */}
            {user?.role === 'OWNER' && (
              <Card className="card-kokotoa lg:col-span-3 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{language === 'sw' ? 'Mauzo vs Faida' : 'Sales vs Profit'}</CardTitle>
                    <CardDescription>
                      {language === 'sw' ? 'Mulinganisho wa mauzo na faida kwa siku 7 zilizopita' : 'Sales vs Profit comparison for the last 7 days'}
                    </CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <BarChart className="w-5 h-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="h-80 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={comparisonData}>
                      <defs>
                        <linearGradient id="colorSalesComp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfitComp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                        tickFormatter={(value) => `TSh ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        name={language === 'sw' ? 'Mauzo' : 'Sales'}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSalesComp)"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        name={language === 'sw' ? 'Faida' : 'Profit'}
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorProfitComp)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Monthly Profit Bar Chart */}
            {user?.role === 'OWNER' && monthlyProfitTrend.length > 0 && (
              <Card className="card-kokotoa lg:col-span-3 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{language === 'sw' ? 'Mwenendo wa Faida (Miezi 6)' : 'Profit Trend (6 Months)'}</CardTitle>
                    <CardDescription>
                      {language === 'sw' ? 'Faida iliyopatikana kila mwezi' : 'Monthly profit performance'}
                    </CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="h-80 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={monthlyProfitTrend}>
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
                        tickFormatter={(value) => `TSh ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                        formatter={(value: number) => [formatPrice(value), language === 'sw' ? 'Faida' : 'Profit']}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                      />
                      <Bar
                        dataKey="profit"
                        fill="#a855f7"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Quick Summary / Status */}
            {user?.role === 'OWNER' && (
              <Card className="card-kokotoa overflow-hidden">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Mwenendo wa Mapato' : 'Revenue Trend'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'sw' ? 'Mauzo ya Leo' : "Today's Sales"}</span>
                      <span className="font-bold text-primary">{formatPrice(dashboardData?.today.sales || 0)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary animate-pulse"
                        style={{ width: `${Math.min(100, (dashboardData?.today.sales || 0) / 100000 * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'sw' ? 'Mwezi Huu' : 'This Month'}</span>
                      <span className="font-bold text-foreground">{formatPrice(dashboardData?.this_month.sales || 0)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${Math.min(100, (dashboardData?.this_month.sales || 0) / 2000000 * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border mt-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {language === 'sw'
                        ? 'Utendaji wa biashara yako unaonyesha mwelekeo chanya. Endelea kufuatilia mapato yako!'
                        : 'Your business performance shows a positive trend. Keep tracking your revenue!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle>
                {language === 'sw' ? 'Hatua za Haraka' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/pos" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {language === 'sw' ? 'Anza Mauzo' : 'Start Sale'}
                  </span>
                </Link>
                <Link to="/inventory" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                  <Package className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {language === 'sw' ? 'Ongeza Bidhaa' : 'Add Product'}
                  </span>
                </Link>
                {user?.role === 'OWNER' && (
                  <Link to="/reports" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                    <BarChart3 className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {language === 'sw' ? 'Tazama Ripoti' : 'View Reports'}
                    </span>
                  </Link>
                )}
                <Link to="/settings" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                  <Settings className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {language === 'sw' ? 'Mipangilio' : 'Settings'}
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        subscriptionInfo={subscriptionStatus || undefined}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
