import { useState } from 'react';
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, 
  CreditCard, Smartphone, Banknote, Package,
  BarChart3, Settings, LogOut, Menu, X, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  { id: 1, name: 'Coca Cola', price: 1500, emoji: '🥤', stock: 48, category: 'vinywaji' },
  { id: 2, name: 'Fanta Orange', price: 1500, emoji: '🍊', stock: 36, category: 'vinywaji' },
  { id: 3, name: 'Sprite', price: 1500, emoji: '🍋', stock: 24, category: 'vinywaji' },
  { id: 4, name: 'Maji Kilimanjaro', price: 800, emoji: '💧', stock: 100, category: 'vinywaji' },
  { id: 5, name: 'Mkate wa Nyama', price: 2500, emoji: '🥪', stock: 15, category: 'vyakula' },
  { id: 6, name: 'Chapati', price: 500, emoji: '🫓', stock: 30, category: 'vyakula' },
  { id: 7, name: 'Mayai', price: 500, emoji: '🥚', stock: 60, category: 'vyakula' },
  { id: 8, name: 'Maziwa Fresh', price: 3000, emoji: '🥛', stock: 20, category: 'vinywaji' },
  { id: 9, name: 'Sukari kg', price: 4500, emoji: '🍬', stock: 25, category: 'vifaa' },
  { id: 10, name: 'Mchele kg', price: 4000, emoji: '🍚', stock: 40, category: 'vifaa' },
  { id: 11, name: 'Unga kg', price: 3500, emoji: '🌾', stock: 35, category: 'vifaa' },
  { id: 12, name: 'Mafuta Lita', price: 6500, emoji: '🫒', stock: 18, category: 'vifaa' },
];

const POS = () => {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('zote');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    { id: 'zote', label: 'Zote', labelEn: 'All' },
    { id: 'vinywaji', label: 'Vinywaji', labelEn: 'Drinks' },
    { id: 'vyakula', label: 'Vyakula', labelEn: 'Food' },
    { id: 'vifaa', label: 'Vifaa', labelEn: 'Supplies' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'zote' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const completeSale = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast({
        title: language === 'sw' ? 'Kikapu Tupu!' : 'Cart Empty!',
        description: language === 'sw' ? 'Ongeza bidhaa kwanza' : 'Add products first',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: language === 'sw' ? 'Mauzo Yamekamilika! ✓' : 'Sale Complete! ✓',
      description: `TSh ${total.toLocaleString()} - ${paymentMethod}`,
    });
    setCart([]);
  };

  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

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
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Home className="w-5 h-5" />
              <span>{language === 'sw' ? 'Nyumbani' : 'Home'}</span>
            </Link>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary w-full text-left">
              <ShoppingCart className="w-5 h-5" />
              <span>{language === 'sw' ? 'Mauzo' : 'Sales'}</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left">
              <Package className="w-5 h-5" />
              <span>{language === 'sw' ? 'Hesabu' : 'Inventory'}</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left">
              <BarChart3 className="w-5 h-5" />
              <span>{language === 'sw' ? 'Ripoti' : 'Reports'}</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left">
              <Settings className="w-5 h-5" />
              <span>{language === 'sw' ? 'Mipangilio' : 'Settings'}</span>
            </button>
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
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span>{language === 'sw' ? 'Ondoka' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Products Section */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t('pos.title')}
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

          {/* Search & Categories */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t('pos.search')}
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
                  {language === 'sw' ? cat.label : cat.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="card-kokotoa rounded-xl p-4 text-center hover:border-primary/30 transition-all group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {product.emoji}
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-primary font-semibold">{formatPrice(product.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'sw' ? 'Kiasi' : 'Stock'}: {product.stock}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col">
          {/* Cart Header */}
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">{t('pos.cart')}</h2>
                <p className="text-sm text-muted-foreground">
                  {cart.length} {language === 'sw' ? 'bidhaa' : 'items'}
                </p>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">{t('pos.empty')}</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                    <p className="text-sm text-primary">{formatPrice(item.price)}</p>
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

          {/* Cart Footer */}
          <div className="p-4 lg:p-6 border-t border-border space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-foreground">{t('pos.total')}:</span>
              <span className="text-2xl font-display font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => completeSale('Cash')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">{t('pos.pay.cash')}</span>
              </Button>
              <Button
                onClick={() => completeSale('M-Pesa')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">{t('pos.pay.mpesa')}</span>
              </Button>
              <Button
                onClick={() => completeSale('Tigo Pesa')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">{t('pos.pay.tigo')}</span>
              </Button>
            </div>

            {/* Complete Sale */}
            <Button
              onClick={() => completeSale('Cash')}
              className="w-full btn-kokotoa h-14 text-lg"
              disabled={cart.length === 0}
            >
              <span className="relative z-10 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {t('pos.complete')}
              </span>
            </Button>
          </div>
        </div>
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

export default POS;
