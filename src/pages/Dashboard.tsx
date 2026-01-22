import { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, BarChart3, Settings,
  TrendingUp, AlertTriangle, DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { graphsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    today: { sales: number; transactions: number };
    this_month: { sales: number; transactions: number };
    inventory: { low_stock_count: number; total_products: number };
    store: { name: string };
  } | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, salesRes] = await Promise.all([
          graphsApi.getDashboard(),
          graphsApi.getDailySales(30) // Long term trend as requested
        ]);

        if (dashRes.data) {
          setDashboardData(dashRes.data);
        }

        if (salesRes.data) {
          const transformed = salesRes.data.labels.map((label: string, index: number) => ({
            name: new Date(label).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { day: 'numeric', month: 'short' }),
            sales: salesRes.data.data[index]
          }));
          setSalesTrend(transformed);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [language]);

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
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  {dashboardData?.this_month.transactions || 0} {language === 'sw' ? 'muamala' : 'transactions'}
                </div>
              </CardContent>
            </Card>

            <Card className={`card-kokotoa ${(dashboardData?.inventory.low_stock_count || 0) > 0 ? 'border-destructive/50' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'sw' ? 'Bidhaa Zinakwisha' : 'Low Stock Alert'}
                </CardTitle>
                <AlertTriangle className={`w-4 h-4 ${(dashboardData?.inventory.low_stock_count || 0) > 0 ? 'text-destructive' : 'text-primary'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-display font-bold ${(dashboardData?.inventory.low_stock_count || 0) > 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {dashboardData?.inventory.low_stock_count || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === 'sw' ? 'zinahitaji kuongezwa' : 'need restocking'}
                </div>
              </CardContent>
            </Card>
          </div>

          {(dashboardData?.inventory.low_stock_count || 0) > 0 && (
            <Card className="card-kokotoa mb-6 border-destructive/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    {language === 'sw' ? 'Tahadhari: Bidhaa Zinakwisha!' : 'Warning: Low Stock Items!'}
                  </CardTitle>
                  <Link to="/inventory">
                    <Button variant="outline" size="sm">
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

            {/* Quick Summary / Status */}
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
                <Link to="/reports" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {language === 'sw' ? 'Tazama Ripoti' : 'View Reports'}
                  </span>
                </Link>
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
    </DashboardLayout>
  );
};

export default Dashboard;
