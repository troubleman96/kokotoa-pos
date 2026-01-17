import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { reportsApi, graphsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, Package, BarChart3, Settings, LogOut, Menu, X, Home,
  DollarSign, TrendingUp, Calendar, Download, Filter
} from 'lucide-react';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';

const Reports = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'analytics'>('sales');
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
    today: { sales: number; transactions: number };
    this_month: { sales: number; transactions: number };
    inventory: { low_stock_count: number; total_products: number };
    store: { name: string };
  } | null>(null);
  const [dateRange, setDateRange] = useState('7');

  const navItems = [
    { path: '/dashboard', icon: Home, label: language === 'sw' ? 'Dashibodi' : 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { path: '/inventory', icon: Package, label: language === 'sw' ? 'Hesabu' : 'Inventory' },
    { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
    { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashboard, sales, inventory] = await Promise.all([
          graphsApi.getDashboard().catch(() => null),
          reportsApi.getSales().catch(() => null),
          reportsApi.getInventory().catch(() => null),
        ]);

        if (dashboard?.data) setDashboardData(dashboard.data);
        if (sales?.data) setSalesData(sales.data);
        if (inventory?.data) setInventoryData(inventory.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

  const tabs = [
    { id: 'sales', label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { id: 'inventory', label: language === 'sw' ? 'Hesabu' : 'Inventory' },
    { id: 'analytics', label: language === 'sw' ? 'Takwimu' : 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
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

          {/* Navigation */}
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
          </nav>

          {/* Language Toggle */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant={language === 'sw' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('sw')} className={language === 'sw' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇹🇿 SW</Button>
              <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')} className={language === 'en' ? 'flex-1 btn-kokotoa' : 'flex-1'}>🇬🇧 EN</Button>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span>{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {language === 'sw' ? 'Ripoti na Takwimu' : 'Reports & Analytics'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? 'Angalia utendaji wa biashara yako' : 'View your business performance'}
                </p>
              </div>
            </div>
            
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
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="card-kokotoa">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'sw' ? 'Mauzo ya Leo' : "Today's Sales"}</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold text-foreground">
                  {formatPrice(dashboardData?.today.sales || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dashboardData?.today.transactions || 0} {language === 'sw' ? 'muamala' : 'transactions'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-kokotoa">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{language === 'sw' ? 'Mauzo ya Mwezi' : 'This Month'}</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold text-foreground">
                  {formatPrice(dashboardData?.this_month.sales || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dashboardData?.this_month.transactions || 0} {language === 'sw' ? 'muamala' : 'transactions'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-kokotoa">
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

            <Card className="card-kokotoa">
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

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <Card className="card-kokotoa">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{language === 'sw' ? 'Mauzo ya Hivi Punde' : 'Recent Sales'}</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'sw' ? 'Pakua' : 'Download'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto block" />
                  </div>
                ) : salesData?.sales.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Muamala' : 'Transaction'}</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Bidhaa' : 'Items'}</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Malipo' : 'Payment'}</th>
                          <th className="text-right p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Jumla' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.sales.slice(0, 10).map((sale) => (
                          <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-4 font-medium">{sale.transaction_number}</td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(sale.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-muted-foreground">{sale.items_count}</td>
                            <td className="p-4 text-muted-foreground">{sale.payment_method}</td>
                            <td className="p-4 text-right font-medium text-primary">{formatPrice(sale.total_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">{language === 'sw' ? 'Hakuna mauzo' : 'No sales yet'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <Card className="card-kokotoa">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{language === 'sw' ? 'Ripoti ya Hesabu' : 'Inventory Report'}</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'sw' ? 'Pakua' : 'Download'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto block" />
                  </div>
                ) : inventoryData?.products.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Bidhaa' : 'Product'}</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Aina' : 'Category'}</th>
                          <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Kiasi' : 'Stock'}</th>
                          <th className="text-right p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Thamani' : 'Value'}</th>
                          <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Hali' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.products.slice(0, 10).map((product) => (
                          <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-4">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-muted-foreground block">{product.sku}</span>
                            </td>
                            <td className="p-4 text-muted-foreground">{product.category}</td>
                            <td className="p-4 text-center">
                              <span className={product.is_low_stock ? 'text-destructive font-semibold' : ''}>
                                {product.current_stock}
                              </span>
                            </td>
                            <td className="p-4 text-right text-muted-foreground">{formatPrice(product.retail_value)}</td>
                            <td className="p-4 text-center">
                              {product.is_low_stock ? (
                                <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                                  {language === 'sw' ? 'Chini' : 'Low'}
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                  {language === 'sw' ? 'Sawa' : 'OK'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Mauzo ya Leo' : 'Today\'s Sales'}</CardTitle>
                  <CardDescription>{language === 'sw' ? 'Muhtasari wa mauzo ya leo' : 'Summary of today\'s sales'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-4xl font-display font-bold text-primary mb-2">
                      {formatPrice(dashboardData?.today.sales || 0)}
                    </p>
                    <p className="text-muted-foreground">
                      {dashboardData?.today.transactions || 0} {language === 'sw' ? 'muamala' : 'transactions'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-kokotoa">
                <CardHeader>
                  <CardTitle>{language === 'sw' ? 'Thamani ya Hesabu' : 'Inventory Value'}</CardTitle>
                  <CardDescription>{language === 'sw' ? 'Jumla ya thamani ya bidhaa zote' : 'Total value of all products'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-4xl font-display font-bold text-primary mb-2">
                      {formatPrice(inventoryData?.summary.total_retail_value || 0)}
                    </p>
                    <p className="text-muted-foreground">
                      {inventoryData?.summary.total_items || 0} {language === 'sw' ? 'bidhaa' : 'products'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Reports;
