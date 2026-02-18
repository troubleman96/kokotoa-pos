import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Plus, Edit2, Trash2, Package,
  AlertTriangle, Save, XCircle, Image as ImageIcon,
  ArrowUpCircle, ArrowDownCircle, RefreshCcw, History, Filter, MoreVertical
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { productsApi, Product } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import MathLoader from '@/components/ui/MathLoader';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { inventoryTourSteps } from '@/data/tourSteps';
import { useIsMobile } from '@/hooks/use-mobile';

const Inventory = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isAddRoute = location.pathname === '/inventory/add';
  const isMobileAddRoute = isMobile && isAddRoute;
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Adjustment state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adjustData, setAdjustData] = useState({
    movement_type: 'IN',
    quantity: 1,
    reason: '',
    reference: ''
  });

  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    category: string;
    unit: string;
    cost_price: string;
    selling_price: string;
    quantity: string;
    minimum_stock: string;
    image: File | null;
  }>({
    name: '',
    sku: '',
    category: '',
    unit: 'pcs',
    cost_price: '',
    selling_price: '',
    quantity: '',
    minimum_stock: '5',
    image: null,
  });

  const categories = useMemo(
    () => [
      { id: 'all', label: language === 'sw' ? 'Zote' : 'All' },
      ...categoryList.map((cat) => ({ id: cat, label: cat })),
    ],
    [language, categoryList]
  );

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsApi.list(),
        productsApi.getCategories().catch(() => null),
      ]);

      if (productsResponse.data) {
        setProducts(productsResponse.data);
      }

      if (categoriesResponse?.data?.categories) {
        setCategoryList([...new Set(categoriesResponse.data.categories)]);
      } else if (productsResponse.data) {
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
  }, [toast, language]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedCategory === 'all') return;
    const exists = categoryList.includes(selectedCategory);
    if (!exists) {
      setSelectedCategory('all');
    }
  }, [categoryList, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesLowStock = !showLowStockOnly || product.is_low_stock;
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, showLowStockOnly]);

  const lowStockCount = useMemo(() =>
    products.filter(p => p.is_low_stock).length,
    [products]
  );

  const formatPrice = (price: string) => `TSh ${parseFloat(price).toLocaleString()}`;

  const handleViewProduct = async (product: Product) => {
    setIsLoadingDetails(true);
    setIsDetailsModalOpen(true);
    try {
      // Fetch full product details including QR code
      const response = await productsApi.get(product.id);
      if (response.data) {
        setSelectedProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Imeshindwa kupata taarifa za bidhaa' : 'Failed to fetch product details',
        variant: 'destructive',
      });
      setIsDetailsModalOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const openAdjustModal = (product: Product) => {
    setProductToAdjust(product);
    setAdjustData({
      movement_type: 'IN',
      quantity: 1,
      reason: '',
      reference: ''
    });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = async () => {
    if (!productToAdjust) return;

    setIsAdjusting(true);
    try {
      const response = await productsApi.adjustStock({
        product_id: productToAdjust.id,
        movement_type: adjustData.movement_type as 'IN' | 'OUT' | 'ADJUST',
        quantity: adjustData.quantity,
        reason: adjustData.reason,
        reference: adjustData.reference
      });

      if (response.success) {
        toast({
          title: language === 'sw' ? 'Mafanikio' : 'Success',
          description: language === 'sw' ? 'Marekebisho yamekamilika' : 'Stock adjustment successful',
        });
        setIsAdjustModalOpen(false);
        fetchProducts();
      } else {
        toast({
          title: language === 'sw' ? 'Kosa' : 'Error',
          description: response.message || (language === 'sw' ? 'Marekebisho yameshindwa' : 'Adjustment failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Adjustment error:', error);
      toast({
        title: language === 'sw' ? 'Hitilafu' : 'Error',
        description: language === 'sw' ? 'Kuna tatizo limetokea' : 'An error occurred during adjustment',
        variant: 'destructive',
      });
    } finally {
      setIsAdjusting(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: '',
      unit: 'pcs',
      cost_price: '',
      selling_price: '',
      quantity: '',
      minimum_stock: '5',
      image: null,
    });
    setImagePreview(null);
    if (isMobile) {
      navigate('/inventory/add');
      return;
    }
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit || 'pcs',
      cost_price: product.cost_price.toString(),
      selling_price: product.selling_price.toString(),
      quantity: product.quantity.toString(),
      minimum_stock: product.minimum_stock.toString(),
      image: null,
    });
    setImagePreview(product.image_url || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.selling_price || !formData.quantity) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Tafadhali jaza taarifa zote muhimu' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    if (parseFloat(formData.selling_price) <= parseFloat(formData.cost_price)) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Bei ya mauzo lazima iwe kubwa kuliko bei ya ununuzi' : 'Selling price must be greater than cost price',
        variant: 'destructive',
      });
      return;
    }
    const UNIT_MAP: Record<string, string> = {
      'piece': 'pcs',
      'pieces': 'pcs',
      'pcs': 'pcs',
      'kg': 'kg',
      'g': 'g',
      'l': 'l',
      'ml': 'ml',
      'box': 'box',
      'pack': 'pack',
      'dozen': 'dozen',
    };
    const normalizedUnit = UNIT_MAP[formData.unit.toLowerCase()] || 'pcs';

    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, {
          name: formData.name,
          selling_price: parseFloat(formData.selling_price),
          cost_price: parseFloat(formData.cost_price) || 0,
          quantity: parseInt(formData.quantity),
          minimum_stock: parseInt(formData.minimum_stock) || 5,
          category: formData.category,
          unit: normalizedUnit,
        });
        toast({
          title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
          description: language === 'sw' ? 'Bidhaa imesasishwa' : 'Product updated successfully',
        });
      } else {
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('sku', formData.sku || `SKU-${Date.now()}`);
        formDataObj.append('category', formData.category || 'General');
        formDataObj.append('unit', normalizedUnit);
        formDataObj.append('cost_price', String(parseFloat(formData.cost_price) || 0));
        formDataObj.append('selling_price', String(parseFloat(formData.selling_price)));
        formDataObj.append('quantity', String(parseInt(formData.quantity)));
        formDataObj.append('minimum_stock', String(parseInt(formData.minimum_stock) || 5));
        formDataObj.append('is_active', 'true');
        if (formData.image) {
          formDataObj.append('image', formData.image);
        }
        await productsApi.create(formDataObj);
        toast({
          title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
          description: language === 'sw' ? 'Bidhaa mpya imeongezwa' : 'New product added successfully',
        });
      }
      if (isMobileAddRoute) {
        navigate('/inventory');
      } else {
        setIsModalOpen(false);
      }
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(productToDelete.id);
      toast({
        title: language === 'sw' ? 'Imefutwa!' : 'Deleted!',
        description: language === 'sw' ? 'Bidhaa imefutwa' : 'Product deleted successfully',
      });
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: err.message || (language === 'sw' ? 'Tafadhali wasiliana na msaada' : 'Please try again'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeProductForm = () => {
    if (isMobileAddRoute) {
      navigate('/inventory');
      return;
    }
    setIsModalOpen(false);
  };

  const renderProductForm = () => (
    <div className="space-y-3 py-2 pr-1 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 gap-3 items-end">
        <div className="col-span-3">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {language === 'sw' ? 'Jina la Bidhaa *' : 'Product Name *'}
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={language === 'sw' ? 'Mfano: Coca Cola' : 'e.g., Coca Cola'}
            className="bg-background"
          />
        </div>

        <div className="col-span-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {language === 'sw' ? 'Kipimo' : 'Unit'}
          </label>
          <select
            value={formData.unit}
            onChange={e => setFormData({ ...formData, unit: e.target.value })}
            className="bg-background border rounded px-2.5 py-2 w-full h-10"
          >
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l</option>
            <option value="ml">ml</option>
            <option value="box">box</option>
            <option value="pack">pack</option>
            <option value="dozen">dozen</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{language === 'sw' ? 'SKU' : 'SKU'}</label>
          <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{language === 'sw' ? 'Aina' : 'Category'}</label>
          <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-background" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          {language === 'sw' ? 'Picha ya Bidhaa' : 'Product Image'}
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFormData({ ...formData, image: file });
              const reader = new FileReader();
              reader.onloadend = () => {
                setImagePreview(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
          accept="image/*"
          className="hidden"
        />
        {imagePreview || (editingProduct?.image_url) ? (
          <div className="relative w-full h-24 sm:h-32 bg-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={imagePreview || editingProduct?.image_url}
              alt="Product preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm">{language === 'sw' ? 'Badilisha Picha' : 'Change Image'}</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-24 sm:h-32 bg-muted/30 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{language === 'sw' ? 'Chagua Picha' : 'Select Image'}</span>
            <span className="text-xs text-muted-foreground mt-1">{language === 'sw' ? '(Hiari)' : '(Optional)'}</span>
          </div>
        )}
        {formData.image && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFormData({ ...formData, image: null });
              setImagePreview(null);
            }}
            className="mt-2 text-sm text-destructive hover:underline"
          >
            {language === 'sw' ? 'Ondoa Picha' : 'Remove Image'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{language === 'sw' ? 'Bei ya Ununuzi' : 'Buy Price'}</label>
          <Input type="number" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} placeholder="0" className="bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{language === 'sw' ? 'Bei ya Mauzo *' : 'Sell Price *'}</label>
          <Input type="number" value={formData.selling_price} onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })} placeholder="0" className="bg-background" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{language === 'sw' ? 'Kiasi cha Sasa *' : 'Current Stock *'}</label>
          <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" className="bg-background" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{language === 'sw' ? 'Kiwango Chini' : 'Min Stock'}</label>
          <Input type="number" value={formData.minimum_stock} onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })} placeholder="5" className="bg-background" />
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-2 pt-1">
        <Button variant="outline" onClick={closeProductForm}>
          <XCircle className="w-4 h-4 mr-2" />
          {language === 'sw' ? 'Ghairi' : 'Cancel'}
        </Button>
        <Button onClick={handleSubmit} className="btn-kokotoa">
          <Save className="w-4 h-4 mr-2" />
          <span className="relative z-10">
            {editingProduct ? (language === 'sw' ? 'Hifadhi' : 'Save') : (language === 'sw' ? 'Ongeza' : 'Add')}
          </span>
        </Button>
      </div>
    </div>
  );

  if (isMobileAddRoute) {
    return (
      <DashboardLayout
        title={language === 'sw' ? 'Ongeza Bidhaa Mpya' : 'Add New Product'}
        subtitle={language === 'sw' ? 'Jaza taarifa za bidhaa' : 'Fill in product details'}
      >
        <Card className="card-kokotoa">
          <CardContent className="p-4">
            {renderProductForm()}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Hesabu ya Bidhaa' : 'Inventory Management'}
      subtitle={language === 'sw' ? `Jumla: ${products.length} bidhaa` : `Total: ${products.length} products`}
    >
      <div className="space-y-4" data-tour="inventory-header">
        <div className="p-4 lg:p-6 border-b border-border bg-card/50 space-y-4">
          <div className="space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-3">
            <div className="relative min-w-0 lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 sm:pr-36 h-12 bg-card border-border text-base"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-24 sm:w-28 h-8 bg-muted/70 text-[11px] border-border/60 gap-1.5 px-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder={language === 'sw' ? 'Aina' : 'Filter'} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2 sm:flex sm:justify-end lg:shrink-0">
              <Button
                variant={showLowStockOnly ? 'default' : 'outline'}
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`col-span-3 h-11 px-2 sm:px-4 text-sm ${showLowStockOnly ? 'bg-destructive hover:bg-destructive/90' : ''}`}
              >
                <AlertTriangle className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">{language === 'sw' ? `Zinakwisha (${lowStockCount})` : `Low Stock (${lowStockCount})`}</span>
                <span className="sm:hidden text-xs font-semibold">{lowStockCount}</span>
              </Button>

              <Button
                onClick={openAddModal}
                className="btn-kokotoa col-span-5 h-11 px-4 sm:px-5 text-sm font-bold"
                data-tour="add-product"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="relative z-10">{language === 'sw' ? 'Ongeza Bidhaa' : 'Add Product'}</span>
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <Card className="card-kokotoa overflow-hidden hidden md:block" data-tour="product-list">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Bidhaa' : 'Product'}</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Aina' : 'Category'}</th>
                        <th className="text-right p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Bei ya Ununuzi' : 'Buy Price'}</th>
                        <th className="text-right p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Bei ya Mauzo' : 'Sell Price'}</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Kiasi' : 'Stock'}</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Hali' : 'Status'}</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Vitendo' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() => handleViewProduct(product)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {(product.image_url && product.image_url !== '') || (product.image && product.image !== '') ? (
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <img
                                    src={product.image_url || product.image || ''}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                                  {product.category.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-medium text-foreground block truncate">{product.name}</span>
                                <span className="text-xs text-muted-foreground block truncate">{product.sku}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground capitalize">{product.category}</td>
                          <td className="p-4 text-right text-muted-foreground">{formatPrice(product.cost_price)}</td>
                          <td className="p-4 text-right font-medium text-primary">{formatPrice(product.selling_price)}</td>
                          <td className="p-4 text-center">
                            <span className={`font-semibold ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`} data-tour="stock-level">
                              {product.quantity}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {product.unit} (min: {product.minimum_stock})
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {product.is_low_stock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                {language === 'sw' ? 'Chini' : 'Low'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {language === 'sw' ? 'Sawa' : 'OK'}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); openAdjustModal(product); }}
                                className="hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/20"
                                title={language === 'sw' ? 'Marekebisho' : 'Adjust Stock'}
                                data-tour="adjust-stock"
                              >
                                <RefreshCcw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); navigate(`/stock-history?search=${product.sku}`); }}
                                className="hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                title={language === 'sw' ? 'Historia' : 'Stock History'}
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); setProductToDelete(product); setIsDeleteModalOpen(true); }}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden" data-tour="product-list">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`card-kokotoa overflow-hidden border-l-4 ${product.is_low_stock ? 'border-l-destructive' : 'border-l-primary'}`}
                    onClick={() => handleViewProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <div className="flex items-start gap-3">
                          {(product.image_url || product.image) ? (
                            <img
                              src={product.image_url || product.image || ''}
                              alt={product.name}
                              className="w-14 h-14 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                              {product.category.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="grid w-full grid-cols-[1fr_1fr_auto] gap-4 items-center">
                              <div className="min-w-0">
                                <p className="text-base font-bold text-foreground leading-tight truncate">{product.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{product.sku}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{language === 'sw' ? 'Aina' : 'Category'}</p>
                                <p className="text-base font-bold text-foreground capitalize truncate">{product.category}</p>
                              </div>
                              <div className="flex items-center justify-end gap-3 justify-self-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full bg-muted/50"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                                    >
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      {language === 'sw' ? 'Hariri' : 'Edit'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => { e.stopPropagation(); openAdjustModal(product); }}
                                      data-tour="adjust-stock"
                                    >
                                      <RefreshCcw className="w-4 h-4 mr-2" />
                                      {language === 'sw' ? 'Rekebisha' : 'Adjust'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => { e.stopPropagation(); navigate(`/stock-history?search=${product.sku}`); }}
                                    >
                                      <History className="w-4 h-4 mr-2" />
                                      {language === 'sw' ? 'Historia' : 'Logs'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-destructive/10 text-destructive"
                                  onClick={(e) => { e.stopPropagation(); setProductToDelete(product); setIsDeleteModalOpen(true); }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 py-3 border-y border-border/50 items-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{language === 'sw' ? 'Hesabu' : 'Stock Level'}</p>
                          <p className={`text-base font-bold ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`} data-tour="stock-level">
                            {product.quantity} <span className="text-xs font-normal text-muted-foreground">{product.unit}</span>
                          </p>
                        </div>
                        <div className="text-center flex flex-col items-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{language === 'sw' ? 'Hali' : 'Status'}</p>
                          {product.is_low_stock ? (
                            <span className="text-destructive font-bold flex items-center justify-center gap-1 text-sm">
                              <AlertTriangle className="w-3 h-3" />
                              {language === 'sw' ? 'Inaisha' : 'Low'}
                            </span>
                          ) : (
                            <span className="text-primary font-bold text-sm">
                              {language === 'sw' ? 'Ipo' : 'In Stock'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {language === 'sw' ? 'Bei ya Mauzo' : 'Selling Price'}
                          </p>
                          <p className="text-sm font-bold text-primary truncate">
                            {formatPrice(product.selling_price)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="card-kokotoa">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {language === 'sw' ? 'Hakuna bidhaa' : 'No products found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'sw' ? 'Ongeza bidhaa mpya ili kuanza' : 'Add new products to get started'}
                </p>
                <Button onClick={openAddModal} className="btn-kokotoa">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="relative z-10">{language === 'sw' ? 'Ongeza Bidhaa' : 'Add Product'}</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="bg-card border-border max-w-md w-[95vw] sm:w-full top-3 sm:top-[50%] translate-y-0 sm:translate-y-[-50%] max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y [WebkitOverflowScrolling:touch]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? (language === 'sw' ? 'Hariri Bidhaa' : 'Edit Product') : (language === 'sw' ? 'Ongeza Bidhaa Mpya' : 'Add New Product')}
            </DialogTitle>
          </DialogHeader>
          {renderProductForm()}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              {language === 'sw' ? 'Futa Bidhaa?' : 'Delete Product?'}
            </DialogTitle>
          </DialogHeader>

          {productToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl mb-4">
                {(productToDelete.image_url && productToDelete.image_url !== '') || (productToDelete.image && productToDelete.image !== '') ? (
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img
                      src={productToDelete.image_url || productToDelete.image || ''}
                      alt={productToDelete.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div
                      className="absolute inset-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold"
                      style={{ display: 'none' }}
                    >
                      {productToDelete.category.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {productToDelete.category.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground">{productToDelete.name}</h4>
                  <p className="text-sm text-muted-foreground">{language === 'sw' ? `Kiasi: ${productToDelete.quantity}` : `Stock: ${productToDelete.quantity}`}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'sw' ? 'Je, una uhakika unataka kufuta bidhaa hii? Hatua hii haiwezi kutenduliwa.' : 'Are you sure you want to delete this product? This action cannot be undone.'}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="relative"
            >
              {isDeleting ? (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'sw' ? 'Inafuta...' : 'Deleting...'}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === 'sw' ? 'Futa' : 'Delete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Modal */}
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <RefreshCcw className="w-5 h-5 text-amber-500" />
              {language === 'sw' ? 'Marekebisho ya Hesabu' : 'Stock Adjustment'}
            </DialogTitle>
          </DialogHeader>

          {productToAdjust && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground leading-none mb-1">{productToAdjust.name}</h4>
                  <p className="text-xs text-muted-foreground">{productToAdjust.sku}</p>
                  <p className="text-xs font-medium text-primary mt-1">
                    {language === 'sw' ? 'Sasa:' : 'Current:'} {productToAdjust.quantity} {productToAdjust.unit}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{language === 'sw' ? 'Aina ya Marekebisho' : 'Adjustment Type'}</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={adjustData.movement_type === 'IN' ? 'default' : 'outline'}
                    onClick={() => setAdjustData({ ...adjustData, movement_type: 'IN' })}
                    className="flex flex-col h-auto py-2 gap-1"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span className="text-[10px]">{language === 'sw' ? 'Ingizo' : 'Stock In'}</span>
                  </Button>
                  <Button
                    variant={adjustData.movement_type === 'OUT' ? 'default' : 'outline'}
                    onClick={() => setAdjustData({ ...adjustData, movement_type: 'OUT' })}
                    className="flex flex-col h-auto py-2 gap-1"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    <span className="text-[10px]">{language === 'sw' ? 'Toleo' : 'Stock Out'}</span>
                  </Button>
                  <Button
                    variant={adjustData.movement_type === 'ADJUST' ? 'default' : 'outline'}
                    onClick={() => setAdjustData({ ...adjustData, movement_type: 'ADJUST' })}
                    className="flex flex-col h-auto py-2 gap-1"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span className="text-[10px]">{language === 'sw' ? 'Weka Sawa' : 'Set Exact'}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {adjustData.movement_type === 'ADJUST'
                    ? (language === 'sw' ? 'Hesabu Mpya' : 'New Total Quantity')
                    : (language === 'sw' ? 'Kiasi (Kinajumlishwa/Kinaondolewa)' : 'Quantity Change (Add/Subtract)')}
                </label>
                <Input
                  type="number"
                  min="1"
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) || 1 })}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{language === 'sw' ? 'Sababu' : 'Reason'}</label>
                <Input
                  placeholder={language === 'sw' ? 'Mf: Umepokea mzigo, Uharibifu, n.k' : 'e.g., Stock replenishment, Damage, etc.'}
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{language === 'sw' ? 'Rejea (Hiyari)' : 'Reference (Optional)'}</label>
                <Input
                  placeholder={language === 'sw' ? 'Mf: PO-001' : 'e.g., PO-001'}
                  value={adjustData.reference}
                  onChange={(e) => setAdjustData({ ...adjustData, reference: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)} disabled={isAdjusting}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button
              className="btn-kokotoa"
              onClick={handleAdjustStock}
              isLoading={isAdjusting}
            >
              {!isAdjusting && <Save className="w-4 h-4 mr-2" />}
              {language === 'sw' ? 'Hifadhi' : 'Save Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Details Modal with QR Code */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProduct(null);
        }}
        onAdjustStock={(product) => {
          setIsDetailsModalOpen(false);
          openAdjustModal(product);
        }}
        product={selectedProduct}
      />

      <OnboardingTour page="inventory" steps={inventoryTourSteps} />
    </DashboardLayout>
  );
};

export default Inventory;
