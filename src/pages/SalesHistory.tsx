import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import {
    ShoppingBag, Search, Filter, Calendar,
    TrendingUp, Hash, Trash2, ArrowLeftRight,
    Printer, Info, ChevronRight, CreditCard,
    DollarSign, Receipt, RefreshCcw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { salesApi, Sale } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import SaleDetailsModal from '@/components/SaleDetailsModal';
import ReceiptModal from '@/components/ReceiptModal';
import { useToast } from '@/hooks/use-toast';
import MathLoader from '@/components/ui/MathLoader';

const SalesHistory = () => {
    const { language } = useLanguage();
    const { toast } = useToast();
    const [sales, setSales] = useState<Sale[]>([]);
    const [summary, setSummary] = useState({ total_sales: 0, transaction_count: 0, total_profit: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState<string>('all');

    // Modals state
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<{ text: string, number: string }>({ text: '', number: '' });

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await salesApi.list();
            if (response.success) {
                setSales(response.data.sales);
                const calculatedProfit = response.data.sales.reduce((acc, sale) => {
                    const profitValue = typeof sale.total_profit === 'string'
                        ? parseFloat(sale.total_profit)
                        : typeof sale.total_profit === 'number'
                            ? sale.total_profit
                            : 0;
                    return acc + (isNaN(profitValue) ? 0 : profitValue);
                }, 0);

                setSummary({
                    total_sales: response.data.summary.total_sales,
                    transaction_count: response.data.summary.transaction_count,
                    total_profit: response.data.summary.total_profit ?? calculatedProfit,
                });
            }
        } catch (error: any) {
            console.error('Error fetching sales:', error);
            toast({
                title: language === 'sw' ? 'Kosa!' : 'Error!',
                description: language === 'sw' ? 'Imeshindwa kupata miamala' : 'Failed to fetch transactions',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const matchesSearch = sale.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sale.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (sale.customer_phone || '').includes(searchQuery);

            const matchesMethod = filterMethod === 'all' || sale.payment_method === filterMethod;

            return matchesSearch && matchesMethod;
        });
    }, [sales, searchQuery, filterMethod]);

    const handleViewSale = (sale: Sale) => {
        setSelectedSale(sale);
        setIsDetailsOpen(true);
    };

    const handleViewReceipt = async (id: number) => {
        try {
            const response = await salesApi.getReceipt(id);
            if (response.success) {
                setReceiptData({
                    text: response.data.receipt_text,
                    number: response.data.receipt_number
                });
                setIsReceiptOpen(true);
            }
        } catch (error) {
            toast({
                title: language === 'sw' ? 'Kosa!' : 'Error!',
                description: language === 'sw' ? 'Imeshindwa kupata risiti' : 'Failed to retrieve receipt',
                variant: 'destructive',
            });
        }
    };

    const formatPrice = (price: number | string) => {
        const value = typeof price === 'string' ? parseFloat(price) : price;
        return `TSh ${value.toLocaleString()}`;
    };

    return (
        <DashboardLayout
            title={language === 'sw' ? 'Miamala ya Mauzo' : 'Sales Transactions'}
            subtitle={language === 'sw' ? 'Kumbukumbu ya mauzo yote yaliyofanyika' : 'History of all sales transactions processed'}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="card-kokotoa">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {language === 'sw' ? 'Jumla ya Mauzo' : 'Total Revenue'}
                            </CardTitle>
                            <DollarSign className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-display font-bold text-foreground">
                                {formatPrice(summary.total_sales)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {language === 'sw' ? 'Mtaji na Mauzo yote' : 'Revenue across all methods'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {language === 'sw' ? 'Jumla ya Faida' : 'Total Profit'}:{' '}
                                <span className="font-semibold text-primary">
                                    {formatPrice(summary.total_profit)}
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-kokotoa">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {language === 'sw' ? 'Idadi ya Miamala' : 'Transactions'}
                            </CardTitle>
                            <Hash className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-display font-bold text-foreground">
                                {summary.transaction_count}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {language === 'sw' ? 'Miamala iliyofanyika' : 'Total sales orders'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="card-kokotoa hidden lg:block">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {language === 'sw' ? 'Thamani ya Wastani' : 'Average Order Value'}
                            </CardTitle>
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-display font-bold text-foreground">
                                {formatPrice(summary.transaction_count > 0 ? (summary.total_sales / summary.transaction_count) : 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {language === 'sw' ? 'Kila mteja' : 'Average basket size'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="card-kokotoa border-primary/5">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder={language === 'sw' ? 'Tafuta muamala, mteja au simu...' : 'Search transaction, customer or phone...'}
                                    className="pl-9 bg-background focus-visible:ring-primary"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-56">
                                <Select value={filterMethod} onValueChange={setFilterMethod}>
                                    <SelectTrigger className="bg-background">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder={language === 'sw' ? 'Njia ya Malipo' : 'Payment Method'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{language === 'sw' ? 'Njia Zote' : 'All Methods'}</SelectItem>
                                        <SelectItem value="CASH">{language === 'sw' ? 'Taslimu (Cash)' : 'Cash'}</SelectItem>
                                        <SelectItem value="MPESA">M-Pesa</SelectItem>
                                        <SelectItem value="TIGOPESA">Tigo Pesa</SelectItem>
                                        <SelectItem value="AIRTELMONEY">Airtel Money</SelectItem>
                                        <SelectItem value="BANK">Bank Transfer</SelectItem>
                                        <SelectItem value="CREDIT">{language === 'sw' ? 'Mkopo (Credit)' : 'Credit'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" onClick={fetchSales} className="border-primary/20 hover:bg-primary/5" isLoading={isLoading}>
                                {!isLoading && <RefreshCcw className="w-4 h-4 mr-2" />}
                                {language === 'sw' ? 'Sasisha' : 'Refresh'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Table */}
                <Card className="card-kokotoa overflow-hidden border-primary/5 shadow-xl">
                    <CardHeader className="bg-muted/30">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Receipt className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{language === 'sw' ? 'Orodha ya Miamala' : 'Transaction List'}</CardTitle>
                                <CardDescription>
                                    {language === 'sw' ? `Miamala ${filteredSales.length} iliyopatikana` : `Showing ${filteredSales.length} transactions`}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-background">
                                <MathLoader size="lg" text={language === 'sw' ? 'Inatafuta miamala...' : 'Loading transactions...'} />
                            </div>
                        ) : filteredSales.length > 0 ? (
                            <div className="space-y-4">
                                {/* Desktop View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Muamala' : 'Transaction'}</th>
                                                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                                                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Mteja' : 'Customer'}</th>
                                                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">{language === 'sw' ? 'Malipo' : 'Payment'}</th>
                                                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider text-right">{language === 'sw' ? 'Jumla' : 'Total'}</th>
                                                <th className="p-4 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {filteredSales.map((sale) => (
                                                <tr
                                                    key={sale.id}
                                                    className={`group hover:bg-primary/5 transition-colors cursor-pointer ${sale.is_returned ? 'bg-destructive/5' : ''}`}
                                                    onClick={() => handleViewSale(sale)}
                                                >
                                                    <td className="p-4">
                                                        <div className="font-mono text-xs font-bold text-foreground bg-muted group-hover:bg-primary/10 p-1.5 rounded inline-block">
                                                            {sale.transaction_number}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm">
                                                            <p className="font-medium text-foreground">
                                                                {sale.created_at ? format(parseISO(sale.created_at), 'dd MMM yyyy') : '-'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {sale.created_at ? format(parseISO(sale.created_at), 'HH:mm') : '-'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm">
                                                            <p className="font-medium text-foreground">{sale.customer_name || 'Walk-in'}</p>
                                                            {sale.customer_phone && <p className="text-xs text-muted-foreground">{sale.customer_phone}</p>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted border border-border">
                                                                {sale.payment_method_display}
                                                            </span>
                                                            {sale.is_returned && (
                                                                <span className="text-[10px] font-bold text-destructive uppercase">
                                                                    {language === 'sw' ? 'Yalirudishwa' : 'Returned'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className={`font-display font-bold ${sale.is_returned ? 'text-destructive line-through' : 'text-primary'}`}>
                                                            {sale.formatted_total}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => { e.stopPropagation(); handleViewReceipt(sale.id); }}
                                                            >
                                                                <Printer className="w-4 h-4 text-primary" />
                                                            </Button>
                                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View */}
                                <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                                    {filteredSales.map((sale) => (
                                        <div
                                            key={sale.id}
                                            className={`p-4 rounded-xl border border-border bg-card/50 shadow-sm space-y-3 relative overflow-hidden active:scale-[0.98] transition-all ${sale.is_returned ? 'border-l-4 border-l-destructive' : ''}`}
                                            onClick={() => handleViewSale(sale)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                    {sale.transaction_number}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Calendar className="w-3 h-3" />
                                                    {sale.created_at ? format(parseISO(sale.created_at), 'dd MMM, HH:mm') : '-'}
                                                </div>
                                            </div>

                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-foreground text-sm truncate">{sale.customer_name || 'Walk-in Customer'}</p>
                                                        {sale.is_returned && (
                                                            <span className="text-[8px] font-bold text-destructive uppercase border border-destructive/20 px-1 rounded bg-destructive/5">
                                                                {language === 'sw' ? 'Yalirudishwa' : 'Returned'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5 p-1 rounded bg-muted/50 border border-border/50">
                                                            {sale.payment_method === 'CASH' ? <DollarSign className="w-3 h-3 text-emerald-500" /> : <CreditCard className="w-3 h-3 text-blue-500" />}
                                                            <span className="text-[10px] font-semibold">{sale.payment_method_display}</span>
                                                        </div>
                                                        {sale.customer_phone && (
                                                            <p className="text-[10px] text-muted-foreground font-mono">{sale.customer_phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-base font-display font-bold ${sale.is_returned ? 'text-destructive line-through' : 'text-primary'}`}>
                                                        {sale.formatted_total}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 px-3 bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 text-[10px] font-bold"
                                                    onClick={(e) => { e.stopPropagation(); handleViewReceipt(sale.id); }}
                                                >
                                                    <Printer className="w-3 h-3 mr-1.5" />
                                                    {language === 'sw' ? 'RISITI' : 'RECEIPT'}
                                                </Button>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                                    {language === 'sw' ? 'ANGALIA' : 'VIEW DETAILS'}
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-background">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 border-2 border-dashed border-border">
                                    <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-20" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                                    {language === 'sw' ? 'Hakuna Miamala' : 'No Transactions Found'}
                                </h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    {language === 'sw'
                                        ? 'Anza kufanya mauzo kwenye POS ili kuona kumbukumbu hapa.'
                                        : 'Process some sales in the POS to see your transaction history here.'}
                                </p>
                                <Button className="mt-6 btn-kokotoa shadow-xl" onClick={() => window.location.href = '/pos'}>
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    {language === 'sw' ? 'Anza Leo' : 'Go to POS'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <SaleDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                sale={selectedSale}
                onReturnSuccess={() => {
                    setIsDetailsOpen(false);
                    fetchSales();
                }}
                onViewReceipt={handleViewReceipt}
            />

            <ReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                receiptText={receiptData.text}
                receiptNumber={receiptData.number}
            />
        </DashboardLayout>
    );
};

export default SalesHistory;
