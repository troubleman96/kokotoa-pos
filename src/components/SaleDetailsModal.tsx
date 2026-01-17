import { useState } from 'react';
import {
    X, ShoppingBag, User, Calendar, CreditCard,
    ChevronRight, ArrowLeftRight, Printer, RefreshCcw,
    AlertCircle, FileText
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sale, salesApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface SaleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
    onReturnSuccess?: () => void;
    onViewReceipt?: (id: number) => void;
}

const SaleDetailsModal = ({ isOpen, onClose, sale, onReturnSuccess, onViewReceipt }: SaleDetailsModalProps) => {
    const { language } = useLanguage();
    const { toast } = useToast();
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [isReturning, setIsReturning] = useState(false);

    if (!sale) return null;

    const handleReturn = async () => {
        if (!returnReason.trim()) {
            toast({
                title: language === 'sw' ? 'Kosa!' : 'Error!',
                description: language === 'sw' ? 'Tafadhali weka sababu ya kurudisha' : 'Please provide a return reason',
                variant: 'destructive',
            });
            return;
        }

        setIsReturning(true);
        try {
            const response = await salesApi.return(sale.id, returnReason);
            if (response.success) {
                toast({
                    title: language === 'sw' ? 'Mafanikio!' : 'Success!',
                    description: language === 'sw' ? 'Mauzo yamerudishwa na hesabu imerekebishwa' : 'Sale returned and stock restored',
                });
                setIsReturnModalOpen(false);
                if (onReturnSuccess) onReturnSuccess();
            }
        } catch (error: any) {
            toast({
                title: language === 'sw' ? 'Kosa!' : 'Error!',
                description: error.message || (language === 'sw' ? 'Imeshindwa kurudisha mauzo' : 'Failed to process return'),
                variant: 'destructive',
            });
        } finally {
            setIsReturning(false);
        }
    };

    const formatPrice = (price: string) => `TSh ${parseFloat(price).toLocaleString()}`;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl bg-card border-border overflow-hidden flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="font-display text-xl flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                {language === 'sw' ? `Muamala: ${sale.transaction_number}` : `Transaction: ${sale.transaction_number}`}
                            </DialogTitle>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Status Badges */}
                        <div className="flex gap-2">
                            {sale.is_returned ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                                    <ArrowLeftRight className="w-4 h-4" />
                                    {language === 'sw' ? 'Yamerudishwa' : 'Returned'}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    {language === 'sw' ? 'Imekamilika' : 'Completed'}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <CreditCard className="w-4 h-4" />
                                {sale.payment_method_display}
                            </span>
                        </div>

                        {/* Customer & Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border border-border">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>{language === 'sw' ? 'Mteja' : 'Customer'}</span>
                                </div>
                                <p className="font-medium text-foreground">
                                    {sale.customer_name || (language === 'sw' ? 'Mteja wa Kawaida' : 'Walk-in Customer')}
                                </p>
                                {sale.customer_phone && <p className="text-sm text-primary">{sale.customer_phone}</p>}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{language === 'sw' ? 'Tarehe' : 'Date'}</span>
                                </div>
                                <p className="font-medium text-foreground">
                                    {new Date(sale.created_at).toLocaleString(language === 'sw' ? 'sw-TZ' : 'en-US')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'sw' ? 'Iliuzwa na' : 'Sold by'}: {sale.created_by_name}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="space-y-3">
                            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                {language === 'sw' ? 'Orodha ya Bidhaa' : 'Items Sold'}
                            </h3>
                            <div className="border border-border rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-semibold text-muted-foreground">{language === 'sw' ? 'Bidhaa' : 'Product'}</th>
                                            <th className="text-center p-3 text-sm font-semibold text-muted-foreground">{language === 'sw' ? 'Kiasi' : 'Qty'}</th>
                                            <th className="text-right p-3 text-sm font-semibold text-muted-foreground">{language === 'sw' ? 'Bei' : 'Price'}</th>
                                            <th className="text-right p-3 text-sm font-semibold text-muted-foreground">{language === 'sw' ? 'Jumla' : 'Total'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {sale.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">
                                                    <p className="font-medium text-sm text-foreground">{item.product_name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{item.product_sku}</p>
                                                </td>
                                                <td className="p-3 text-center text-sm font-medium">{item.quantity}</td>
                                                <td className="p-3 text-right text-sm">{formatPrice(item.unit_price)}</td>
                                                <td className="p-3 text-right text-sm font-semibold">{formatPrice(item.line_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/30 font-bold border-t border-border">
                                        <tr>
                                            <td colSpan={3} className="p-3 text-right text-sm">{language === 'sw' ? 'Jumla Kuu' : 'Grand Total'}</td>
                                            <td className="p-3 text-right text-lg text-primary">{sale.formatted_total}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        {sale.notes && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{language === 'sw' ? 'Maelezo' : 'Notes'}</h4>
                                <div className="p-3 bg-muted/20 rounded-lg text-sm italic text-foreground whitespace-pre-wrap">
                                    {sale.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-border bg-card flex flex-wrap gap-2">
                        <Button
                            className="flex-1 btn-kokotoa shadow-md"
                            onClick={() => onViewReceipt && onViewReceipt(sale.id)}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            {language === 'sw' ? 'Tazama Risiti' : 'View Receipt'}
                        </Button>

                        {!sale.is_returned && (
                            <Button
                                variant="destructive"
                                className="flex-1 shadow-md"
                                onClick={() => setIsReturnModalOpen(true)}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                {language === 'sw' ? 'Rudisha Mauzo' : 'Return Order'}
                            </Button>
                        )}

                        <Button variant="outline" onClick={onClose} className="flex-1 border-border">
                            {language === 'sw' ? 'Funga' : 'Close'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Return Confirmation Modal */}
            <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                <DialogContent className="max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <RefreshCcw className="w-5 h-5" />
                            {language === 'sw' ? 'Thibitisha Kurudisha' : 'Confirm Return'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                            <p className="text-sm text-destructive font-medium mb-1">
                                {language === 'sw' ? 'Onyo!' : 'Warning!'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {language === 'sw'
                                    ? 'Hatua hii itarudisha bidhaa zote kwenye hesabu yako na muamala huu utafutwa kwenye ripoti za mauzo.'
                                    : 'This action will restore all items to your inventory and remove this transaction from sales reports.'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{language === 'sw' ? 'Sababu ya Kurudisha' : 'Reason for Return'}</label>
                            <Input
                                placeholder={language === 'sw' ? 'Mf: Mteja amebadilisha wazo...' : 'e.g., Customer changed mind...'}
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsReturnModalOpen(false)} disabled={isReturning}>
                            {language === 'sw' ? 'Ghairi' : 'Cancel'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReturn}
                            disabled={isReturning}
                        >
                            {isReturning ? (
                                <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCcw className="w-4 h-4 mr-2" />
                            )}
                            {language === 'sw' ? 'Kamilisha' : 'Process Return'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SaleDetailsModal;
