import { useState, useMemo } from 'react';
import { 
  ShoppingCart, Package, BarChart3, Settings, LogOut, 
  Menu, X, Home, TrendingUp, AlertTriangle, DollarSign,
  ArrowUpRight, ArrowDownRight, Calendar, Bell
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Shared product data - in a real app this would come from a database/context
export interface Product {
  id: number;
  name: string;
  price: number;
  buyPrice: number;
  emoji: string;
  stock: number;
  minStock: number;
  category: string;
}

export const initialProducts: Product[] = [
  { id: 1, name: 'Coca Cola', price: 1500, buyPrice: 1000, emoji: '🥤', stock: 48, minStock: 10, category: 'vinywaji' },
  { id: 2, name: 'Fanta Orange', price: 1500, buyPrice: 1000, emoji: '🍊', stock: 36, minStock: 10, category: 'vinywaji' },
  { id: 3, name: 'Sprite', price: 1500, buyPrice: 1000, emoji: '🍋', stock: 24, minStock: 10, category: 'vinywaji' },
  { id: 4, name: 'Maji Kilimanjaro', price: 800, buyPrice: 500, emoji: '💧', stock: 5, minStock: 20, category: 'vinywaji' },
  { id: 5, name: 'Mkate wa Nyama', price: 2500, buyPrice: 1800, emoji: '🥪', stock: 15, minStock: 5, category: 'vyakula' },
  { id: 6, name: 'Chapati', price: 500, buyPrice: 300, emoji: '🫓', stock: 3, minStock: 10, category: 'vyakula' },
  { id: 7, name: 'Mayai', price: 500, buyPrice: 350, emoji: '🥚', stock: 60, minStock: 20, category: 'vyakula' },
  { id: 8, name: 'Maziwa Fresh', price: 3000, buyPrice: 2200, emoji: '🥛', stock: 20, minStock: 10, category: 'vinywaji' },
  { id: 9, name: 'Sukari kg', price: 4500, buyPrice: 3500, emoji: '🍬', stock: 8, minStock: 15, category: 'vifaa' },
  { id: 10, name: 'Mchele kg', price: 4000, buyPrice: 3000, emoji: '🍚', stock: 40, minStock: 10, category: 'vifaa' },
  { id: 11, name: 'Unga kg', price: 3500, buyPrice: 2800, emoji: '🌾', stock: 2, minStock: 10, category: 'vifaa' },
  { id: 12, name: 'Mafuta Lita', price: 6500, buyPrice: 5000, emoji: '🫒', stock: 18, minStock: 5, category: 'vifaa' },
];

const Dashboard = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Calculate low stock items
  const lowStockItems = useMemo(() => 
    initialProducts.filter(p => p.stock <= p.minStock), 
    []
  );

  // Mock data for dashboard stats
  const todaySales = 485000;
  const yesterdaySales = 420000;
  const salesGrowth = ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1);
  
  const totalProducts = initialProducts.length;
  const totalStock = initialProducts.reduce((sum, p) => sum + p.stock, 0);
  const stockValue = initialProducts.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);

  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

  const navItems = [
    { path: '/dashboard', icon: Home, label: language === 'sw' ? 'Dashibodi' : 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { path: '/inventory', icon: Package, label: language === 'sw' ? 'Hesabu' : 'Inventory' },
    { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
    { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
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
            <p className="text-xs text-muted-foreground mt-2">Duka la Demo</p>
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
              <Button
                variant={language === 'sw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('sw')}
                className={language === 'sw' ? 'flex-1 btn-kokotoa' : 'flex-1'}
              >
                🇹🇿 SW
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'flex-1 btn-kokotoa' : 'flex-1'}
              >
                🇬🇧 EN
              </Button>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
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
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {lowStockItems.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Today's Sales */}
            <Card className="card-kokotoa">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'sw' ? 'Mauzo ya Leo' : "Today's Sales"}
                </CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold text-foreground">
                  {formatPrice(todaySales)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">+{salesGrowth}%</span>
                  <span className="text-xs text-muted-foreground">
                    {language === 'sw' ? 'kuliko jana' : 'vs yesterday'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Products */}
            <Card className="card-kokotoa">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'sw' ? 'Jumla ya Bidhaa' : 'Total Products'}
                </CardTitle>
                <Package className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold text-foreground">
                  {totalProducts}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === 'sw' ? `Kiasi: ${totalStock}` : `Stock: ${totalStock} items`}
                </div>
              </CardContent>
            </Card>

            {/* Stock Value */}
            <Card className="card-kokotoa">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'sw' ? 'Thamani ya Hesabu' : 'Stock Value'}
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold text-foreground">
                  {formatPrice(stockValue)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === 'sw' ? 'Bei ya ununuzi' : 'At cost price'}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card className={`card-kokotoa ${lowStockItems.length > 0 ? 'border-destructive/50' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {language === 'sw' ? 'Bidhaa Zinakwisha' : 'Low Stock Alert'}
                </CardTitle>
                <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-destructive' : 'text-primary'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-display font-bold ${lowStockItems.length > 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {lowStockItems.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === 'sw' ? 'Zinahitaji kuongezwa' : 'Need restocking'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert List */}
          {lowStockItems.length > 0 && (
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
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-destructive/10 rounded-xl">
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-destructive">
                          {language === 'sw' ? `Kiasi: ${item.stock} (Chini ya ${item.minStock})` : `Stock: ${item.stock} (Min: ${item.minStock})`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
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
        </main>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
