import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Package, ShoppingCart,
  BarChart3, Settings, LogOut, Menu, X, Home,
  AlertTriangle, Save, XCircle, Image as ImageIcon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { productsApi, Product } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Inventory = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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

  const fetchProducts = useCallback(async () => {
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
  }, [toast, language]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      setIsModalOpen(false);
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
    }
  };

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

      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-foreground">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {language === 'sw' ? 'Hesabu ya Bidhaa' : 'Inventory Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? `Jumla: ${products.length} bidhaa` : `Total: ${products.length} products`}
                </p>
              </div>
            </div>
            
            <Button onClick={openAddModal} className="btn-kokotoa">
              <Plus className="w-4 h-4 mr-2" />
              <span className="relative z-10">{language === 'sw' ? 'Ongeza Bidhaa' : 'Add Product'}</span>
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 border-b border-border bg-card/50 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-12 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}​
              </SelectContent>
            </Select>

            <Button
              variant={showLowStockOnly ? 'default' : 'outline'}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`h-12 ${showLowStockOnly ? 'bg-destructive hover:bg-destructive/90' : ''}`}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {language === 'sw' ? `Zinakwisha (${lowStockCount})` : `Low Stock (${lowStockCount})`}
            </Button>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <Card className="card-kokotoa overflow-hidden">
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
                     {filteredProducts.map((product) => {
                       return (
                       <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                           <td className="p-4">
                            <div className="flex items-center gap-3">
                              {(product.image_url && product.image_url !== '') || (product.image && product.image !== '') ? (
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <img 
                                    src={product.image_url || product.image || ''} 
                                    alt={product.name} 
                                    className="w-12 h-12 rounded-lg object-cover"
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
                                  <div className="hidden absolute inset-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {product.category.charAt(0).toUpperCase()}
                                  </div>
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
                          <span className={`font-semibold ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`}>
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
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(product)} className="hover:bg-primary/10 hover:text-primary">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setProductToDelete(product); setIsDeleteModalOpen(true); }} className="hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </Card>
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
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? (language === 'sw' ? 'Hariri Bidhaa' : 'Edit Product') : (language === 'sw' ? 'Ongeza Bidhaa Mpya' : 'Add New Product')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {language === 'sw' ? 'Jina la Bidhaa *' : 'Product Name *'}
              </label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={language === 'sw' ? 'Mfano: Coca Cola' : 'e.g., Coca Cola'} className="bg-background" />
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
              <label className="text-sm font-medium text-muted-foreground mb-2 block">{language === 'sw' ? 'Kipimo' : 'Unit'}</label>
              <select
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="bg-background border rounded px-3 py-2 w-full"
              >
                <option value="pcs">{language === 'sw' ? 'Vipande (pcs)' : 'Pieces (pcs)'}</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="box">{language === 'sw' ? 'Kisanduku (box)' : 'Box'}</option>
                <option value="pack">{language === 'sw' ? 'Kifurushi (pack)' : 'Pack'}</option>
                <option value="dozen">{language === 'sw' ? 'Dazeni (dozen)' : 'Dozen'}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
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
                <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
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
                <div className="w-full h-32 bg-muted/30 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center" onClick={() => fileInputRef.current?.click()}>
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
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              <XCircle className="w-4 h-4 mr-2" />
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} className="btn-kokotoa">
              <Save className="w-4 h-4 mr-2" />
              <span className="relative z-10">
                {editingProduct ? (language === 'sw' ? 'Hifadhi' : 'Save') : (language === 'sw' ? 'Ongeza' : 'Add')}
              </span>
            </Button>
          </DialogFooter>
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
                    <div className="hidden absolute inset-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
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
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>{language === 'sw' ? 'Ghairi' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'sw' ? 'Futa' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default Inventory;
