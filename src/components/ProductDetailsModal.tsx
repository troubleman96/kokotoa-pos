import { X, Download, QrCode } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/services/api';

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const ProductDetailsModal = ({ isOpen, onClose, product }: ProductDetailsModalProps) => {
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
            <DialogContent className="bg-card border-border max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="font-display text-xl">
                            {language === 'sw' ? 'Taarifa za Bidhaa' : 'Product Details'}
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Product Image */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full aspect-square rounded-lg object-cover border border-border"
                                />
                            ) : (
                                <div className="w-full aspect-square rounded-lg bg-primary/10 flex items-center justify-center border border-border">
                                    <span className="text-primary font-semibold text-6xl">
                                        {product.category.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'sw' ? 'SKU' : 'SKU'}: {product.sku}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Aina' : 'Category'}
                                    </p>
                                    <p className="font-medium text-foreground capitalize">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Kipimo' : 'Unit'}
                                    </p>
                                    <p className="font-medium text-foreground uppercase">{product.unit}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Bei ya Ununuzi' : 'Cost Price'}
                                    </p>
                                    <p className="font-medium text-foreground">{formatPrice(product.cost_price)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Bei ya Mauzo' : 'Selling Price'}
                                    </p>
                                    <p className="font-medium text-primary text-lg">{formatPrice(product.selling_price)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Kiasi' : 'Stock'}
                                    </p>
                                    <p className={`font-medium ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`}>
                                        {product.quantity} {product.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {language === 'sw' ? 'Faida' : 'Profit Margin'}
                                    </p>
                                    <p className="font-medium text-foreground">{product.profit_margin}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    {product.qr_code_url && (
                        <div className="border-t border-border pt-6">
                            <div className="bg-muted/30 rounded-xl p-6">
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-white p-4 rounded-lg border-2 border-primary/20">
                                            <img
                                                src={product.qr_code_url}
                                                alt={`QR Code for ${product.name}`}
                                                className="w-48 h-48"
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
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    {language === 'sw' ? 'Iliundwa' : 'Created'}
                                </p>
                                <p className="text-foreground">
                                    {new Date(product.created_at).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US')}
                                </p>
                            </div>
                            <div>
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
