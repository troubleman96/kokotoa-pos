import { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, BarChart3, Settings,
  TrendingUp, AlertTriangle, DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { graphsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const { language } = useLanguage();
  const [dashboardData, setDashboardData] = useState<{
    today: { sales: number; transactions: number };
    this_month: { sales: number; transactions: number };
    inventory: { low_stock_count: number; total_products: number };
    store: { name: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await graphsApi.getDashboard();
        if (response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
      title={language === 'sw' ? 'Karibu, Mfanyabiashara!' : 'Welcome, Business Owner!'}
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
                    {language === 'sw' ? 'muamala' : 'transactions'}
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
