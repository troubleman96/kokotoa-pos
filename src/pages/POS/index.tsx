import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Smartphone, Banknote, User, Phone,
  MapPin, StickyNote, Receipt, CheckCircle2, X, Hash, ChevronLeft, ChevronRight
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
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { posTourSteps } from '@/data/tourSteps';

interface CartItem extends Product {
  quantity: number;
}

const POS_CART_HINT_VIEWS_KEY = 'kokotoa_pos_cart_hint_views';
const POS_CART_HINT_MAX_VIEWS = 5;

const POS = () => {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const activeCategoryRef = useRef<HTMLButtonElement>(null);
  const [showCategoryLeft, setShowCategoryLeft] = useState(false);
  const [showCategoryRight, setShowCategoryRight] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [allowCartHint, setAllowCartHint] = useState(false);
  const [showCartHint, setShowCartHint] = useState(false);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState('');

  // Checkout & Receipt state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState({ text: '', number: '' });
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [creditPaymentAmount, setCreditPaymentAmount] = useState('');

  const categories = useMemo(
    () => [
      { id: 'all', label: language === 'sw' ? 'Zote' : 'All' },
      ...categoryList.map((cat) => ({ id: cat, label: cat })),
    ],
    [language, categoryList]
  );

  const checkCategoryScroll = () => {
    const container = categoriesScrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowCategoryLeft(scrollLeft > 6);
    setShowCategoryRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    if (activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedCategory]);

  useEffect(() => {
    checkCategoryScroll();
    const container = categoriesScrollRef.current;
    if (!container) return undefined;

    container.addEventListener('scroll', checkCategoryScroll);
    return () => container.removeEventListener('scroll', checkCategoryScroll);
  }, [categories]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productsApi.list(),
          productsApi.getCategories().catch(() => null),
        ]);

        if (productsResponse.data) {
          setProducts(productsResponse.data);
        }

        if (Array.isArray(categoriesResponse?.data?.categories)) {
          const normalized = categoriesResponse.data.categories.filter((cat): cat is string => typeof cat === 'string');
          setCategoryList([...new Set(normalized)]);
        } else if (productsResponse.data) {
          // Fallback if category endpoint fails: derive from available products.
          const uniqueCategories = [...new Set(productsResponse.data.map((p: Product) => p.category))];
          setCategoryList(uniqueCategories);
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
  }, [language]);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 1024);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const currentViews = Number(localStorage.getItem(POS_CART_HINT_VIEWS_KEY) || '0');
    if (currentViews < POS_CART_HINT_MAX_VIEWS) {
      localStorage.setItem(POS_CART_HINT_VIEWS_KEY, String(currentViews + 1));
      setAllowCartHint(true);
      return;
    }
    setAllowCartHint(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !allowCartHint || cart.length === 0) {
      setShowCartHint(false);
      return;
    }

    setShowCartHint(true);
    const timer = setTimeout(() => setShowCartHint(false), 3000);
    return () => clearTimeout(timer);
  }, [isMobile, allowCartHint, cart.length]);

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
  const discountNumericValue = Number(discountValue) || 0;
  const discountAmount = discountType === 'percent'
    ? Math.min(total, (total * discountNumericValue) / 100)
    : Math.min(total, discountNumericValue);
  const checkoutTotal = Math.max(0, total - discountAmount);

  const openCheckout = (method: string) => {
    setPaymentMethod(method);
    if (method !== 'CREDIT') {
      setCreditPaymentAmount('');
    }
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
        discount_amount: discountAmount,
        notes: saleNotes,
      });

      if (response.success) {
        const initialCreditPayment = paymentMethod === 'CREDIT'
          ? Math.max(0, Math.min(checkoutTotal, Number(creditPaymentAmount) || 0))
          : 0;

        if (paymentMethod === 'CREDIT' && initialCreditPayment > 0) {
          try {
            await salesApi.recordCreditPayment({
              sale: response.data.id,
              amount: initialCreditPayment,
              payment_method: 'CASH',
            });
          } catch (creditPaymentError) {
            console.error('Failed to record initial credit payment:', creditPaymentError);
            toast({
              title: language === 'sw' ? 'Tahadhari' : 'Notice',
              description: language === 'sw'
                ? 'Mauzo ya credit yamehifadhiwa lakini malipo ya awali hayakuweza kurekodiwa.'
                : 'Credit sale was saved, but initial payment could not be recorded.',
            });
          }
        }

        toast({
          title: language === 'sw' ? 'Mauzo Yamekamilika! ✓' : 'Sale Complete! ✓',
          description: `${formatPrice(checkoutTotal)} - ${paymentMethod}`,
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
          setCreditPaymentAmount('');
          setDiscountType('amount');
          setDiscountValue('');
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
    <>
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
            <div className="relative lg:hidden">
              {showCartHint && (
                <div className="absolute right-0 -top-11 whitespace-nowrap rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-semibold shadow-lg animate-in fade-in">
                  {language === 'sw' ? 'Bofya kuona kikapu haraka' : 'Tap to open cart quickly'}
                </div>
              )}

              <Button
                variant="outline"
                size="icon"
                className={`relative transition-all hover:bg-primary/5 border-primary/10 ${showCartHint ? 'animate-bounce' : 'animate-pulse'}`}
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
            </div>
          )
        }
      >
        <div className="flex flex-col lg:flex-row gap-4 h-full min-w-0 overflow-x-hidden" data-tour="pos-header">
          {/* Products Section */}
          <div className="flex-1 space-y-4 min-w-0">
            <div className="space-y-4">
              <div className="relative" data-tour="product-search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={language === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
              </div>

              <div className="relative w-full min-w-0">
                <div
                  ref={categoriesScrollRef}
                  className="flex overflow-x-auto hide-scrollbar flex-1 relative w-full min-w-0 touch-pan-x"
                >
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      ref={selectedCategory === cat.id ? activeCategoryRef : null}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`${selectedCategory === cat.id ? 'btn-kokotoa' : ''} flex-1 min-w-[25%] max-w-[25%] sm:min-w-0 sm:max-w-none h-8 sm:h-9 px-2 sm:px-3 whitespace-nowrap truncate`}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>

                {showCategoryLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background/90 via-background/60 to-transparent pointer-events-none flex items-center justify-start pl-1">
                    <ChevronLeft className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                )}

                {showCategoryRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background/90 via-background/60 to-transparent pointer-events-none flex items-center justify-end pr-1">
                    <ChevronRight className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground sm:hidden">
                {language === 'sw' ? 'Telezesha kushoto/kulia kuona aina zote' : 'Swipe left/right to view all filters'}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4" data-tour="product-grid">
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
          <div id="cart-section" className="w-full lg:w-96 bg-card border border-border rounded-xl flex flex-col scroll-mt-20" data-tour="shopping-cart">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-foreground">
                    {language === 'sw'
                      ? `Kikapu (${cart.length} bidhaa)`
                      : `Cart (${cart.length} ${cart.length === 1 ? 'item' : 'items'})`}
                  </h2>
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">
                  {language === 'sw' ? 'Punguzo:' : 'Discount:'}
                </label>
                <div className="flex items-center rounded-md border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDiscountType('amount')}
                    className={`px-2 py-1 text-xs font-semibold ${discountType === 'amount' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'}`}
                  >
                    Amt
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`px-2 py-1 text-xs font-semibold ${discountType === 'percent' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'}`}
                  >
                    %
                  </button>
                </div>
                <Input
                  type="number"
                  min="0"
                  max={discountType === 'percent' ? 100 : total}
                  value={discountValue}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      setDiscountValue('');
                      return;
                    }

                    const parsed = Number(raw);
                    if (Number.isNaN(parsed)) return;
                    const max = discountType === 'percent' ? 100 : total;
                    const clamped = Math.max(0, Math.min(max, parsed));
                    setDiscountValue(String(clamped));
                  }}
                  placeholder={language === 'sw' ? 'Weka punguzo' : 'Enter discount'}
                  className="h-9 bg-background"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-foreground">{language === 'sw' ? 'Jumla' : 'Total'}:</span>
                <span className="text-2xl font-display font-bold text-primary">
                  {formatPrice(checkoutTotal)}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2" data-tour="payment-methods">
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
                  onClick={() => openCheckout('MOBILE_MONEY')}
                  variant="outline"
                  className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                  disabled={isProcessing}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">{language === 'sw' ? 'Simu' : 'Mobile'}</span>
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
                <Button
                  onClick={() => openCheckout('CREDIT')}
                  variant="outline"
                  className="flex-col gap-1 h-auto py-3 hover:bg-primary/10 hover:border-primary/30"
                  disabled={isProcessing}
                >
                  <Receipt className="w-5 h-5" />
                  <span className="text-xs">{language === 'sw' ? 'Credit' : 'Credit'}</span>
                </Button>
              </div>

              <Button
                onClick={() => openCheckout('CASH')}
                className="w-full btn-kokotoa h-14 text-lg"
                isLoading={isProcessing}
                disabled={cart.length === 0}
                data-tour="complete-sale"
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
          total={checkoutTotal}
          paymentMethod={paymentMethod}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          paymentRef={paymentRef}
          setPaymentRef={setPaymentRef}
          notes={saleNotes}
          setNotes={setSaleNotes}
          creditPaymentAmount={creditPaymentAmount}
          setCreditPaymentAmount={setCreditPaymentAmount}
          language={language}
        />

        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          receiptText={receiptData.text}
          receiptNumber={receiptData.number}
        />
      </DashboardLayout>
      <OnboardingTour page="pos" steps={posTourSteps} />
    </>
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
  creditPaymentAmount: string;
  setCreditPaymentAmount: (v: string) => void;
  language: string;
}

const CheckoutModal = ({
  isOpen, onClose, onConfirm, isProcessing, total, paymentMethod,
  customerName, setCustomerName, customerPhone, setCustomerPhone,
  paymentRef, setPaymentRef, notes, setNotes, creditPaymentAmount, setCreditPaymentAmount, language
}: CheckoutModalProps) => {
  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;
  const initialCreditPayment = Math.max(0, Math.min(total, Number(creditPaymentAmount) || 0));
  const remainingCreditBalance = Math.max(0, total - initialCreditPayment);
  const paymentMethodLabelMap: Record<string, string> = {
    CASH: language === 'sw' ? 'Taslimu' : 'Cash',
    MOBILE_MONEY: language === 'sw' ? 'Simu' : 'Mobile',
    BANK: language === 'sw' ? 'Benki' : 'Bank',
    CREDIT: language === 'sw' ? 'Credit' : 'Credit',
  };

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

  const handleCreditPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setCreditPaymentAmount('');
      return;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) return;
    const clamped = Math.max(0, Math.min(total, value));
    setCreditPaymentAmount(String(clamped));
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
              {paymentMethodLabelMap[paymentMethod] || paymentMethod}
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
            {(paymentMethod === 'MOBILE_MONEY' || paymentMethod === 'BANK') && (
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
            {paymentMethod === 'CREDIT' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                  <Banknote className="w-3 h-3" />
                  {language === 'sw' ? 'Malipo ya Awali' : 'Initial Payment'}
                </label>
                <Input
                  type="number"
                  min="0"
                  max={total}
                  step="0.01"
                  value={creditPaymentAmount}
                  onChange={handleCreditPaymentChange}
                  placeholder="0"
                  className="bg-background border-primary/30 focus-visible:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  {language === 'sw' ? 'Deni litakalobaki:' : 'Remaining balance:'} <span className="font-semibold text-foreground">{formatPrice(remainingCreditBalance)}</span>
                </p>
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
