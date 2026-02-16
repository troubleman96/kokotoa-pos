import { Download, QrCode, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/services/api';

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdjustStock?: (product: Product) => void;
    product: Product | null;
}

const ProductDetailsModal = ({ isOpen, onClose, onAdjustStock, product }: ProductDetailsModalProps) => {
    const { language } = useLanguage();

    if (!product) return null;

    const formatPrice = (price: string) => `TSh ${parseFloat(price).toLocaleString()}`;

    const handleDownloadQR = () => {
        if (!product.qr_code_url) return;

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = product.qr_code_url;
        link.download = `QR_${product.sku}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border max-w-2xl px-3 sm:px-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="relative">
                    <DialogTitle className="hidden sm:block font-display text-xl text-center">
                        {language === 'sw' ? 'Taarifa za Bidhaa' : 'Product Details'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 py-1 sm:py-4">
                    {/* Product Image and Info Section */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center sm:items-start">
                        <div className="w-28 h-28 sm:w-56 sm:h-56 flex justify-center sm:block flex-shrink-0 rounded-2xl bg-primary/5 p-1.5 border border-primary/10">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full rounded-xl object-cover border border-border"
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center border border-border">
                                    <span className="text-primary font-semibold text-3xl sm:text-6xl">
                                        {product.category.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 w-full space-y-3 text-left min-w-0 bg-muted/20 rounded-xl p-3 sm:p-0 sm:bg-transparent">
                            <h3 className="sm:hidden font-display text-lg font-bold text-center text-foreground">
                                {language === 'sw' ? 'Taarifa za Bidhaa' : 'Product Details'}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-left">
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Jina' : 'Name'}
                                    </p>
                                    <p className="font-medium text-xs sm:text-base text-foreground truncate">{product.name}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'SKU' : 'SKU'}
                                    </p>
                                    <p className="font-medium text-xs sm:text-base text-foreground truncate">{product.sku}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Aina' : 'Category'}
                                    </p>
                                    <p className="font-medium text-xs sm:text-base text-foreground capitalize truncate">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Kipimo' : 'Unit'}
                                    </p>
                                    <p className="font-medium text-xs sm:text-base text-foreground uppercase">{product.unit}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Bei ya Ununuzi' : 'Cost Price'}
                                    </p>
                                    <p className="font-medium text-xs sm:text-base text-foreground">{formatPrice(product.cost_price)}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Bei ya Mauzo' : 'Selling Price'}
                                    </p>
                                    <p className="font-medium text-sm sm:text-lg text-primary">{formatPrice(product.selling_price)}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Kiasi' : 'Stock'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className={`font-medium text-xs sm:text-base ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`}>
                                            {product.quantity} {product.unit}
                                        </p>
                                        {onAdjustStock && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded-full hover:bg-amber-100 hover:text-amber-600"
                                                onClick={() => onAdjustStock(product)}
                                            >
                                                <RefreshCcw className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Faida' : 'Profit Margin'}
                                    </p>
                                    <p className="font-medium text-xs sm:text-base text-foreground">{product.profit_margin}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    {product.qr_code_url && (
                        <div className="hidden sm:block border-t border-border pt-4 sm:pt-6">
                            <div className="bg-muted/30 rounded-xl p-4 sm:p-6">
                                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-primary/20">
                                            <img
                                                src={product.qr_code_url}
                                                alt={`QR Code for ${product.name}`}
                                                className="w-32 h-32 sm:w-48 sm:h-48"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <QrCode className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-2">
                                                    {language === 'sw' ? 'Jinsi ya Kutumia QR Code' : 'How to Use QR Code'}
                                                </h4>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    <li>• {language === 'sw' ? 'Chapisha QR code na uiweke kwenye bidhaa' : 'Print the QR code and attach it to the product'}</li>
                                                    <li>• {language === 'sw' ? 'Scan wakati wa mauzo kwa haraka zaidi' : 'Scan during sales for faster checkout'}</li>
                                                    <li>• {language === 'sw' ? 'Tumia simu yoyote yenye camera' : 'Use any phone with a camera'}</li>
                                                    <li>• {language === 'sw' ? 'Taarifa za bidhaa zitaonekana mara moja' : 'Product details will appear instantly'}</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleDownloadQR}
                                            className="btn-kokotoa w-full md:w-auto"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            <span className="relative z-10">
                                                {language === 'sw' ? 'Pakua QR Code' : 'Download QR Code'}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="border-t border-border pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm text-center">
                            <div className="flex flex-col items-center">
                                <p className="text-muted-foreground">
                                    {language === 'sw' ? 'Iliundwa' : 'Created'}
                                </p>
                                <p className="text-foreground">
                                    {new Date(product.created_at).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US')}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-muted-foreground">
                                    {language === 'sw' ? 'Ilisasishwa' : 'Updated'}
                                </p>
                                <p className="text-foreground">
                                    {new Date(product.updated_at).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailsModal;
