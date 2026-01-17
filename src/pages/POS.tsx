import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, 
  CreditCard, Smartphone, Banknote, Package,
  BarChart3, Settings, LogOut, Menu, X, Home
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { productsApi, salesApi, Product, SaleItem } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CartItem extends Product {
  quantity: number;
}

const POS = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: language === 'sw' ? 'Dashibodi' : 'Dashboard' },
    { path: '/pos', icon: ShoppingCart, label: language === 'sw' ? 'Mauzo' : 'Sales' },
    { path: '/inventory', icon: Package, label: language === 'sw' ? 'Hesabu' : 'Inventory' },
    { path: '/reports', icon: BarChart3, label: language === 'sw' ? 'Ripoti' : 'Reports' },
    { path: '/settings', icon: Settings, label: language === 'sw' ? 'Mipangilio' : 'Settings' },
  ];

  const categories = [
    { id: 'all', label: language === 'sw' ? 'Zote' : 'All' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.list();
        if (response.data) {
          setProducts(response.data);
          const uniqueCategories = [...new Set(response.data.map((p: Product) => p.category))];
          uniqueCategories.forEach((cat: string) => {
            if (!categories.find(c => c.id === cat)) {
              categories.push({ id: cat, label: cat });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: language === 'sw' ? 'Kosa!' : 'Error!',
          description: language === 'sw' ? 'Imeshindwa kupata bidhaa' : 'Failed to fetch products',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.selling_price) * item.quantity), 0);

  const completeSale = async (paymentMethod: string) => {
    if (cart.length === 0) {
      toast({
        title: language === 'sw' ? 'Kikapu Tupu!' : 'Cart Empty!',
        description: language === 'sw' ? 'Ongeza bidhaa kwanza' : 'Add products first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: parseFloat(item.selling_price),
        discount_percent: 0,
      }));

      await salesApi.create({
        items,
        payment_method: paymentMethod,
        customer_phone: '',
        customer_name: '',
      });

      toast({
        title: language === 'sw' ? 'Mauzo Yamekamilika! ✓' : 'Sale Complete! ✓',
        description: `${formatPrice(total)} - ${paymentMethod}`,
      });
      setCart([]);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Mauzo yameshindwa' : 'Sale failed'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
            <p className="text-xs text-muted-foreground mt-2">{user?.store_name || 'My Store'}</p>
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

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {language === 'sw' ? 'Skrini ya Mauzo' : 'Sales Screen'}
            </h1>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('sw-TZ', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? 'btn-kokotoa whitespace-nowrap' : 'whitespace-nowrap'}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="card-kokotoa rounded-xl p-4 text-center hover:border-primary/30 transition-all group"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {product.category.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-primary font-semibold">{formatPrice(parseFloat(product.selling_price))}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'sw' ? 'Kiasi' : 'Stock'}: {product.quantity}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col">
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">{language === 'sw' ? 'Kikapu' : 'Cart'}</h2>
                <p className="text-sm text-muted-foreground">
                  {cart.length} {language === 'sw' ? 'bidhaa' : 'items'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">{language === 'sw' ? 'Kikapu tupu' : 'Cart is empty'}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className="text-2xl">{item.category.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                    <p className="text-sm text-primary">{formatPrice(parseFloat(item.selling_price))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 lg:p-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-foreground">{language === 'sw' ? 'Jumla' : 'Total'}:</span>
              <span className="text-2xl font-display font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => completeSale('CASH')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                disabled={isProcessing}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">{language === 'sw' ? 'Taslimu' : 'Cash'}</span>
              </Button>
              <Button
                onClick={() => completeSale('MOMO')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                disabled={isProcessing}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">M-Pesa</span>
              </Button>
              <Button
                onClick={() => completeSale('BANK')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                disabled={isProcessing}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">{language === 'sw' ? 'Benki' : 'Bank'}</span>
              </Button>
            </div>

            <Button
              onClick={() => completeSale('CASH')}
              className="w-full btn-kokotoa h-14 text-lg"
              disabled={cart.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {language === 'sw' ? 'Inashughulikia...' : 'Processing...'}
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {language === 'sw' ? 'Maliza Mauzo' : 'Complete Sale'}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default POS;
