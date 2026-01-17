import { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Package, BarChart3, Settings, LogOut, 
  Menu, X, Home, TrendingUp, AlertTriangle, DollarSign,
  ArrowUpRight, ArrowDownRight, Calendar, Bell
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { graphsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    today: { sales: number; transactions: number };
    this_month: { sales: number; transactions: number };
    inventory: { low_stock_count: number; total_products: number };
    store: { name: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    { path: '/dashboard', icon: Home, label: language === 'sw' ? 'Dashibodi' : 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { path: '/inventory', icon: Package, label: language === 'sw' ? 'Hesabu' : 'Inventory' },
    { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
    { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
  ];

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

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-xl">K</span>
                </div>
                <span className="font-display font-bold text-lg text-foreground">KOKOTOA</span>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{dashboardData?.store.name || user?.store_name || 'My Store'}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link to="/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
              <span>{language === 'sw' ? 'Watumiaji' : 'Users'}</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant={language === 'sw' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('sw')} className={language === 'sw' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇹🇿 SW</Button>
              <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')} className={language === 'en' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇬🇧 EN</Button>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span>{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {language === 'sw' ? 'Karibu, Mfanyabiashara!' : 'Welcome, Business Owner!'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {(dashboardData?.inventory.low_stock_count || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {dashboardData?.inventory.low_stock_count}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
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
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
