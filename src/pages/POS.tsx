import { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Smartphone, Banknote, User, Phone,
  MapPin, StickyNote, Receipt, CheckCircle2, X, Hash
} from 'lucide-react';
import ReceiptModal from '@/components/ReceiptModal';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { productsApi, salesApi, Product } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import MathLoader from '@/components/ui/MathLoader';

interface CartItem extends Product {
  quantity: number;
}

const POS = () => {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Checkout & Receipt state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState({ text: '', number: '' });
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

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

  const openCheckout = (method: string) => {
    setPaymentMethod(method);
    setIsCheckoutModalOpen(true);
  };

  const completeSale = async () => {
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

      const response = await salesApi.create({
        items,
        payment_method: paymentMethod,
        customer_phone: customerPhone,
        customer_name: customerName,
        payment_reference: paymentRef,
        notes: saleNotes,
      });

      if (response.success) {
        toast({
          title: language === 'sw' ? 'Mauzo Yamekamilika! ✓' : 'Sale Complete! ✓',
          description: `${formatPrice(total)} - ${paymentMethod}`,
        });

        // Fetch receipt automatically
        const receiptResponse = await salesApi.getReceipt(response.data.id);
        if (receiptResponse.success) {
          setReceiptData({
            text: receiptResponse.data.receipt_text,
            number: receiptResponse.data.receipt_number
          });
          setIsCheckoutModalOpen(false);

          if (settings.showReceiptAfterSale) {
            setIsReceiptModalOpen(true);
          }

          setCart([]);
          // Reset fields
          setCustomerName('');
          setCustomerPhone('+255');
          setPaymentRef('');
          setSaleNotes('');
        }
      }
    } catch (error: any) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: error.message || (language === 'sw' ? 'Mauzo yameshindwa' : 'Sale failed'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Skrini ya Mauzo' : 'Sales Screen'}
      subtitle={new Date().toLocaleDateString('sw-TZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
      headerActions={
        cart.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden relative transition-all hover:bg-primary/5 border-primary/10"
            onClick={() => {
              const element = document.getElementById('cart-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card animate-in zoom-in">
              {cart.length}
            </span>
          </Button>
        )
      }
    >
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Products Section */}
        <div className="flex-1 space-y-4">
          <div className="space-y-4">
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
              <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="card-kokotoa rounded-xl p-4 text-center hover:border-primary/30 transition-all group"
                >
                  <div className="w-full aspect-square mb-3 relative">
                    {(product.image_url && product.image_url !== '') || (product.image && product.image !== '') ? (
                      <div className="relative w-full h-full">
                        <img
                          src={product.image_url || product.image || ''}
                          alt={product.name}
                          className="w-full h-full rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            const target = e.currentTarget;
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'none';
                          }}
                        />
                        <div className="hidden absolute inset-0 w-full h-full rounded-lg bg-primary/10 items-center justify-center text-primary font-semibold text-4xl">
                          {product.category.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-4xl">
                        {product.category.charAt(0).toUpperCase()}
                      </div>
                    )}
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

        {/* Cart Section */}
        <div id="cart-section" className="w-full lg:w-96 bg-card border border-border rounded-xl flex flex-col scroll-mt-20">
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
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {(item.image_url && item.image_url !== '') || (item.image && item.image !== '') ? (
                      <img
                        src={item.image_url || item.image || ''}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 w-12 h-12 rounded-lg bg-primary/10 items-center justify-center text-primary font-semibold text-xl">
                      {item.category.charAt(0).toUpperCase()}
                    </div>
                  </div>
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
                onClick={() => openCheckout('CASH')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                disabled={isProcessing}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">{language === 'sw' ? 'Taslimu' : 'Cash'}</span>
              </Button>
              <Button
                onClick={() => openCheckout('MPESA')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                disabled={isProcessing}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">M-Pesa</span>
              </Button>
              <Button
                onClick={() => openCheckout('BANK')}
                variant="outline"
                className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                disabled={isProcessing}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">{language === 'sw' ? 'Benki' : 'Bank'}</span>
              </Button>
            </div>

            <Button
              onClick={() => openCheckout('CASH')}
              className="w-full btn-kokotoa h-14 text-lg"
              isLoading={isProcessing}
              disabled={cart.length === 0}
            >
              <ShoppingCart className="w-5 h-5" />
              {language === 'sw' ? 'Maliza Mauzo' : 'Complete Sale'}
            </Button>
          </div>
        </div>
      </div>
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={completeSale}
        isProcessing={isProcessing}
        total={total}
        paymentMethod={paymentMethod}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        paymentRef={paymentRef}
        setPaymentRef={setPaymentRef}
        notes={saleNotes}
        setNotes={setSaleNotes}
        language={language}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptText={receiptData.text}
        receiptNumber={receiptData.number}
      />
    </DashboardLayout>
  );
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  total: number;
  paymentMethod: string;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  paymentRef: string;
  setPaymentRef: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  language: string;
}

const CheckoutModal = ({
  isOpen, onClose, onConfirm, isProcessing, total, paymentMethod,
  customerName, setCustomerName, customerPhone, setCustomerPhone,
  paymentRef, setPaymentRef, notes, setNotes, language
}: CheckoutModalProps) => {
  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+255')) {
      if (value.startsWith('+25') || value.startsWith('+2') || value.startsWith('+')) {
        value = '+255';
      } else {
        value = '+255' + value.replace(/^\+?\d*/, '');
      }
    }
    setCustomerPhone(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            {language === 'sw' ? 'Thibitisha Malipo' : 'Confirm Checkout'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
            <p className="text-sm text-muted-foreground mb-1">{language === 'sw' ? 'Jumla ya Kulipa' : 'Total Amount'}</p>
            <p className="text-3xl font-display font-bold text-primary">{formatPrice(total)}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {paymentMethod}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <User className="w-3 h-3" />
                {language === 'sw' ? 'Jina la Mteja' : 'Customer Name'}
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={language === 'sw' ? 'Hiari' : 'Optional'}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {language === 'sw' ? 'Simu ya Mteja' : 'Customer Phone'}
              </label>
              <Input
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="+255xxxxxxxxx"
                className="bg-background"
              />
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {language === 'sw' ? 'Anza na +255' : 'Start with +255'}
              </p>
            </div>
            {paymentMethod !== 'CASH' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {language === 'sw' ? 'Kumbukumbu ya Malipo' : 'Payment Reference'}
                </label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder={language === 'sw' ? 'Namba ya muamala...' : 'Transaction ID...'}
                  className="bg-background border-primary/30 focus-visible:ring-primary"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                <StickyNote className="w-3 h-3" />
                {language === 'sw' ? 'Maelezo' : 'Notes'}
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'sw' ? 'Hiari' : 'Optional'}
                className="bg-background"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            {language === 'sw' ? 'Ghairi' : 'Cancel'}
          </Button>
          <Button
            className="flex-2 btn-kokotoa shadow-lg"
            onClick={onConfirm}
            isLoading={isProcessing}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {language === 'sw' ? 'Kamilisha Mauzo' : 'Complete Sale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default POS;
