import { useState, useEffect } from 'react';
import {
    X, ShoppingBag, User, Calendar, CreditCard,
    ChevronRight, ArrowLeftRight, Printer, RefreshCcw,
    AlertCircle, FileText, Receipt
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
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

const SaleDetailsModal = ({ isOpen, onClose, sale: initialSale, onReturnSuccess, onViewReceipt }: SaleDetailsModalProps) => {
    const { language } = useLanguage();
    const { toast } = useToast();
    const [sale, setSale] = useState<Sale | null>(initialSale);
    const [isLoading, setIsLoading] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [isReturning, setIsReturning] = useState(false);

    // Fetch full sale details on open or if the sale changes
    useEffect(() => {
        if (isOpen && initialSale?.id) {
            fetchFullSaleDetails(initialSale.id);
        } else {
            setSale(initialSale);
        }
    }, [isOpen, initialSale]);

    const fetchFullSaleDetails = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await salesApi.get(id);
            if (response.success && response.data) {
                setSale(response.data);
            }
        } catch (error) {
            console.error('Error fetching sale details:', error);
            // Fallback to initialSale if full fetch fails
            setSale(initialSale);
        } finally {
            setIsLoading(false);
        }
    };

    if (!sale && !isLoading) return null;

    const handleReturn = async () => {
        if (!sale) return;
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

    const formatPrice = (price: string | number) => {
        const value = typeof price === 'string' ? parseFloat(price) : price;
        return `TSh ${value.toLocaleString()}`;
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl bg-card border-border overflow-hidden flex flex-col p-0 gap-0 h-[95vh] sm:h-[85vh] border-none sm:border shadow-2xl rounded-none sm:rounded-2xl">
                    <DialogHeader className="p-6 border-b border-border bg-muted/20 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="font-display text-2xl font-black tracking-tight flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    {language === 'sw' ? 'Maelezo ya Muamala' : 'Transaction Details'}
                                </DialogTitle>
                                <p className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block">
                                    {sale?.transaction_number}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm font-bold text-muted-foreground animate-pulse">
                                {language === 'sw' ? 'Inapakia maelezo...' : 'Loading details...'}
                            </p>
                        </div>
                    ) : sale && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Top Info Badges & Summary */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex gap-2">
                                    {sale.is_returned ? (
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-black uppercase tracking-wider border border-destructive/20 shadow-sm">
                                            <ArrowLeftRight className="w-4 h-4" />
                                            {language === 'sw' ? 'Yalirudishwa' : 'Returned'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {language === 'sw' ? 'Imekamilika' : 'Completed'}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider border border-primary/20 shadow-sm">
                                        <CreditCard className="w-4 h-4" />
                                        {sale.payment_method_display}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                                        {language === 'sw' ? 'Net Amount' : 'Net Amount'}
                                    </p>
                                    <p className="text-3xl font-display font-black text-foreground leading-none">
                                        {sale.formatted_total}
                                    </p>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-display font-black text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        {language === 'sw' ? 'Orodha ya Bidhaa' : 'Purchased Items'}
                                    </h3>
                                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                                        {sale.items?.length || 0} {language === 'sw' ? 'Aina za bidhaa' : 'Items'}
                                    </span>
                                </div>
                                <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th className="text-left p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{language === 'sw' ? 'Bidhaa' : 'Product'}</th>
                                                <th className="text-center p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{language === 'sw' ? 'Kiasi' : 'Qty'}</th>
                                                <th className="text-right p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{language === 'sw' ? 'Bei' : 'Unit Price'}</th>
                                                <th className="text-right p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-primary">{language === 'sw' ? 'Jumla Kuu' : 'Extended Total'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {sale.items?.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-black text-sm text-foreground">{item.product_name}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">SKU: {item.product_sku}</p>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-sm font-black bg-muted px-2 py-1 rounded-lg tabular-nums">{item.quantity}</span>
                                                    </td>
                                                    <td className="p-4 text-right text-sm font-bold tabular-nums">{formatPrice(item.unit_price)}</td>
                                                    <td className="p-4 text-right text-sm font-black tabular-nums text-foreground">{formatPrice(item.line_total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals & Notes Split */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {language === 'sw' ? 'Maelezo ya Ziada' : 'Additional Notes'}
                                    </h4>
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-sm font-medium italic text-foreground min-h-[80px] whitespace-pre-wrap">
                                        {sale.notes || (language === 'sw' ? 'Hakuna maelezo...' : 'No notes provided.')}
                                    </div>
                                </div>

                                <div className="space-y-2 p-6 rounded-2xl bg-muted/20 border border-primary/5">
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-muted-foreground font-bold">{language === 'sw' ? 'Jumla Ndogo' : 'Subtotal'}</span>
                                        <span className="font-black tabular-nums">{formatPrice(sale.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-muted-foreground font-bold">{language === 'sw' ? 'Punguzo' : 'Discount'}</span>
                                        <span className="font-black tabular-nums text-destructive">-{formatPrice(sale.discount_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-muted-foreground font-bold">{language === 'sw' ? 'Kodi' : 'Tax'}</span>
                                        <span className="font-black tabular-nums">{formatPrice(sale.tax_amount)}</span>
                                    </div>
                                    <div className="pt-3 mt-1 border-t border-border flex justify-between items-center text-primary">
                                        <span className="font-black uppercase tracking-widest text-base">{language === 'sw' ? 'Jumla Kuu' : 'Net Total'}</span>
                                        <span className="text-2xl font-display font-black tabular-nums">{sale.formatted_total}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        <User className="w-3.5 h-3.5" />
                                        {language === 'sw' ? 'Mteja' : 'Customer'}
                                    </div>
                                    <p className="font-black text-sm text-foreground mb-0.5">
                                        {sale.customer_name || (language === 'sw' ? 'Mteja wa Kawaida' : 'Walk-in Customer')}
                                    </p>
                                    {sale.customer_phone && <p className="text-xs font-mono font-bold text-primary">{sale.customer_phone}</p>}
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {language === 'sw' ? 'Tarehe & Saa' : 'Date & Time'}
                                    </div>
                                    <p className="font-black text-sm text-foreground mb-0.5">
                                        {sale.created_at ? format(parseISO(sale.created_at), 'dd MMM yyyy') : '-'}
                                    </p>
                                    <p className="text-xs font-bold text-muted-foreground">
                                        {sale.created_at ? format(parseISO(sale.created_at), 'HH:mm:ss') : '-'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        <Receipt className="w-3.5 h-3.5" />
                                        {language === 'sw' ? 'Keshia' : 'Cashier'}
                                    </div>
                                    <p className="font-black text-sm text-foreground mb-0.5">
                                        {sale.created_by_name}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                        {language === 'sw' ? 'Namba ya Siri' : 'Reference'}
                                    </div>
                                    <p className="font-black text-sm text-foreground mb-0.5">
                                        {sale.payment_reference || 'N/A'}
                                    </p>
                                    <p className="text-xs font-bold text-muted-foreground">
                                        {language === 'sw' ? 'Malipo' : 'Payment Method'}: {sale.payment_method}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 border-t border-border bg-muted/20 flex flex-wrap gap-3 shrink-0">
                        <Button
                            className="flex-[2] btn-kokotoa shadow-xl h-12 text-sm font-black uppercase tracking-widest rounded-2xl"
                            onClick={() => onViewReceipt && onViewReceipt(sale?.id || 0)}
                            disabled={isLoading}
                        >
                            <Printer className="w-5 h-5 mr-3" />
                            {language === 'sw' ? 'Chapisha Risiti' : 'Print Receipt'}
                        </Button>

                        {!sale?.is_returned && !isLoading && (
                            <Button
                                variant="outline"
                                className="flex-1 shadow-md h-12 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive font-black uppercase tracking-widest rounded-2xl"
                                onClick={() => setIsReturnModalOpen(true)}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                {language === 'sw' ? 'Rudisha' : 'Return'}
                            </Button>
                        )}

                        <Button variant="ghost" onClick={onClose} className="px-6 h-12 font-black uppercase tracking-widest rounded-2xl hover:bg-muted" disabled={isLoading}>
                            {language === 'sw' ? 'Funga' : 'Close'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Return Confirmation Modal */}
            <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                <DialogContent className="max-w-md bg-card border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-destructive/5 border-b border-destructive/10">
                        <DialogTitle className="flex items-center gap-3 text-destructive font-display font-black text-xl tracking-tight">
                            <div className="p-2 rounded-xl bg-destructive/10">
                                <RefreshCcw className="w-5 h-5" />
                            </div>
                            {language === 'sw' ? 'Thibitisha Kurudisha' : 'Confirm Return'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest mb-2">
                                <AlertCircle className="w-4 h-4" />
                                {language === 'sw' ? 'Onyo Muhimu!' : 'Critical Warning!'}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                {language === 'sw'
                                    ? 'Hatua hii itarudisha bidhaa zote kwenye hesabu yako na muamala huu utafutwa kwenye ripoti za mauzo. Kitendo hiki hakiwezi kutanguliwa.'
                                    : 'This action will restore all items to your inventory and remove this transaction from sales reports. This action cannot be undone.'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{language === 'sw' ? 'Sababu ya Kurudisha' : 'Reason for Return'}</label>
                            <Input
                                placeholder={language === 'sw' ? 'Mf: Mteja amebadilisha wazo...' : 'e.g., Customer changed mind...'}
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-destructive/30 focus:ring-destructive/10 rounded-xl h-12 font-medium"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-muted/20 border-t border-border flex gap-3">
                        <Button variant="ghost" className="flex-1 h-12 font-black uppercase tracking-widest rounded-xl" onClick={() => setIsReturnModalOpen(false)} disabled={isReturning}>
                            {language === 'sw' ? 'Ghairi' : 'Cancel'}
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 shadow-lg shadow-destructive/20 h-12 font-black uppercase tracking-widest rounded-xl gap-2"
                            onClick={handleReturn}
                            isLoading={isReturning}
                        >
                            {!isReturning && <RefreshCcw className="w-4 h-4" />}
                            {language === 'sw' ? 'Kamilisha' : 'Process'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SaleDetailsModal;
