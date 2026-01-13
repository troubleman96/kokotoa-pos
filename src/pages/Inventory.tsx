import { useState, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Package, ShoppingCart,
  BarChart3, Settings, LogOut, Menu, X, Home,
  AlertTriangle, Save, XCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { initialProducts, type Product } from './Dashboard';

const Inventory = () => {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('zote');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    buyPrice: '',
    stock: '',
    minStock: '',
    category: 'vinywaji',
    emoji: '📦',
  });

  const categories = [
    { id: 'zote', label: 'Zote', labelEn: 'All' },
    { id: 'vinywaji', label: 'Vinywaji', labelEn: 'Drinks' },
    { id: 'vyakula', label: 'Vyakula', labelEn: 'Food' },
    { id: 'vifaa', label: 'Vifaa', labelEn: 'Supplies' },
  ];

  const emojis = ['📦', '🥤', '🍊', '🍋', '💧', '🥪', '🫓', '🥚', '🥛', '🍬', '🍚', '🌾', '🫒', '🍎', '🍞', '🧀', '🥩', '🍗'];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'zote' || product.category === selectedCategory;
      const matchesLowStock = !showLowStockOnly || product.stock <= product.minStock;
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, showLowStockOnly]);

  // Low stock count
  const lowStockCount = useMemo(() => 
    products.filter(p => p.stock <= p.minStock).length, 
    [products]
  );

  const formatPrice = (price: number) => `TSh ${price.toLocaleString()}`;

  // Open modal for adding new product
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      buyPrice: '',
      stock: '',
      minStock: '',
      category: 'vinywaji',
      emoji: '📦',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      buyPrice: product.buyPrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
      emoji: product.emoji,
    });
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Tafadhali jaza taarifa zote muhimu' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? {
              ...p,
              name: formData.name,
              price: parseInt(formData.price),
              buyPrice: parseInt(formData.buyPrice) || 0,
              stock: parseInt(formData.stock),
              minStock: parseInt(formData.minStock) || 5,
              category: formData.category,
              emoji: formData.emoji,
            }
          : p
      ));
      toast({
        title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
        description: language === 'sw' ? 'Bidhaa imesasishwa' : 'Product updated successfully',
      });
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now(),
        name: formData.name,
        price: parseInt(formData.price),
        buyPrice: parseInt(formData.buyPrice) || 0,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock) || 5,
        category: formData.category,
        emoji: formData.emoji,
      };
      setProducts(prev => [...prev, newProduct]);
      toast({
        title: language === 'sw' ? 'Imefanikiwa!' : 'Success!',
        description: language === 'sw' ? 'Bidhaa mpya imeongezwa' : 'New product added successfully',
      });
    }

    setIsModalOpen(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      toast({
        title: language === 'sw' ? 'Imefutwa!' : 'Deleted!',
        description: language === 'sw' ? 'Bidhaa imefutwa' : 'Product deleted successfully',
      });
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

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

        {/* Filters */}
        <div className="p-4 lg:p-6 border-b border-border bg-card/50 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 h-12 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {language === 'sw' ? cat.label : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Low Stock Filter */}
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

        {/* Products Table/Grid */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="card-kokotoa overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-semibold text-muted-foreground">
                        {language === 'sw' ? 'Bidhaa' : 'Product'}
                      </th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">
                        {language === 'sw' ? 'Aina' : 'Category'}
                      </th>
                      <th className="text-right p-4 font-semibold text-muted-foreground">
                        {language === 'sw' ? 'Bei ya Ununuzi' : 'Buy Price'}
                      </th>
                      <th className="text-right p-4 font-semibold text-muted-foreground">
                        {language === 'sw' ? 'Bei ya Mauzo' : 'Sell Price'}
                      </th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">
                        {language === 'sw' ? 'Kiasi' : 'Stock'}
                      </th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">
                        {language === 'sw' ? 'Hali' : 'Status'}
                      </th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">
                        {language === 'sw' ? 'Vitendo' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const isLowStock = product.stock <= product.minStock;
                      return (
                        <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{product.emoji}</span>
                              <span className="font-medium text-foreground">{product.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground capitalize">
                            {categories.find(c => c.id === product.category)?.[language === 'sw' ? 'label' : 'labelEn'] || product.category}
                          </td>
                          <td className="p-4 text-right text-muted-foreground">
                            {formatPrice(product.buyPrice)}
                          </td>
                          <td className="p-4 text-right font-medium text-primary">
                            {formatPrice(product.price)}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                              {product.stock}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              (min: {product.minStock})
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {isLowStock ? (
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
                                onClick={() => openEditModal(product)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setProductToDelete(product);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid gap-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.minStock;
              return (
                <Card key={product.id} className={`card-kokotoa ${isLowStock ? 'border-destructive/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{product.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {categories.find(c => c.id === product.category)?.[language === 'sw' ? 'label' : 'labelEn']}
                          </p>
                        </div>
                      </div>
                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {language === 'sw' ? 'Chini' : 'Low'}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{language === 'sw' ? 'Bei Ununuzi:' : 'Buy:'}</span>
                        <span className="ml-1 text-foreground">{formatPrice(product.buyPrice)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{language === 'sw' ? 'Bei Mauzo:' : 'Sell:'}</span>
                        <span className="ml-1 text-primary font-semibold">{formatPrice(product.price)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{language === 'sw' ? 'Kiasi:' : 'Stock:'}</span>
                        <span className={`ml-1 font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                          {product.stock}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{language === 'sw' ? 'Kiwango Chini:' : 'Min:'}</span>
                        <span className="ml-1 text-foreground">{product.minStock}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(product)}
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        {language === 'sw' ? 'Hariri' : 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProductToDelete(product);
                          setIsDeleteModalOpen(true);
                        }}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
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
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct 
                ? (language === 'sw' ? 'Hariri Bidhaa' : 'Edit Product')
                : (language === 'sw' ? 'Ongeza Bidhaa Mpya' : 'Add New Product')
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Emoji Picker */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {language === 'sw' ? 'Ikoni' : 'Icon'}
              </label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, emoji })}
                    className={`text-2xl p-2 rounded-lg transition-colors ${
                      formData.emoji === emoji 
                        ? 'bg-primary/20 ring-2 ring-primary' 
                        : 'bg-muted/30 hover:bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
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

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {language === 'sw' ? 'Aina' : 'Category'}
              </label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.filter(c => c.id !== 'zote').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {language === 'sw' ? cat.label : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'sw' ? 'Bei ya Ununuzi' : 'Buy Price'}
                </label>
                <Input
                  type="number"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  placeholder="0"
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'sw' ? 'Bei ya Mauzo *' : 'Sell Price *'}
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  className="bg-background"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'sw' ? 'Kiasi cha Sasa *' : 'Current Stock *'}
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {language === 'sw' ? 'Kiwango Chini' : 'Min Stock Alert'}
                </label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="5"
                  className="bg-background"
                />
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
                {editingProduct 
                  ? (language === 'sw' ? 'Hifadhi' : 'Save')
                  : (language === 'sw' ? 'Ongeza' : 'Add')
                }
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
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
                <span className="text-3xl">{productToDelete.emoji}</span>
                <div>
                  <h4 className="font-semibold text-foreground">{productToDelete.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sw' ? `Kiasi: ${productToDelete.stock}` : `Stock: ${productToDelete.stock}`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'sw' 
                  ? 'Je, una uhakika unataka kufuta bidhaa hii? Hatua hii haiwezi kutenduliwa.'
                  : 'Are you sure you want to delete this product? This action cannot be undone.'
                }
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              {language === 'sw' ? 'Futa' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default Inventory;
