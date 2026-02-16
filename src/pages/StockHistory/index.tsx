import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { stockMovementsApi, StockMovement } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    History, ArrowUpCircle, ArrowDownCircle, RefreshCcw, Filter, Calendar,
    Search, Package, User, Info, FileStack
} from 'lucide-react';
import MathLoader from '@/components/ui/MathLoader';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { stockHistoryTourSteps } from '@/data/tourSteps';

const StockHistory = () => {
    const { language } = useLanguage();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMovements = async () => {
        setIsLoading(true);
        try {
            const response = await stockMovementsApi.list();
            if (response.success) {
                // Sort by date descending
                const sorted = response.data.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setMovements(sorted);
            }
        } catch (error) {
            console.error('Error fetching stock movements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, []);

    const filteredMovements = movements.filter(m => {
        const matchesFilter = filterType === 'all' || m.movement_type === filterType;
        const matchesSearch = m.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.product_sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'IN': return <ArrowUpCircle className="w-4 h-4 text-emerald-500" />;
            case 'OUT': return <ArrowDownCircle className="w-4 h-4 text-rose-500" />;
            case 'ADJUST': return <RefreshCcw className="w-4 h-4 text-amber-500" />;
            case 'SALE': return <ArrowDownCircle className="w-4 h-4 text-rose-400" />;
            case 'RETURN': return <ArrowUpCircle className="w-4 h-4 text-emerald-400" />;
            default: return <History className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getMovementLabel = (type: string) => {
        const labels: Record<string, { sw: string, en: string }> = {
            'IN': { sw: 'Ingizo', en: 'Stock In' },
            'OUT': { sw: 'Toleo', en: 'Stock Out' },
            'ADJUST': { sw: 'Marekebisho', en: 'Adjustment' },
            'SALE': { sw: 'Mauzo', en: 'Sale' },
            'RETURN': { sw: 'Kurudisha', en: 'Return' },
            'DAMAGE': { sw: 'Uharibifu', en: 'Damage' },
            'EXPIRED': { sw: 'Muda Kwisha', en: 'Expired' },
        };
        return language === 'sw' ? (labels[type]?.sw || type) : (labels[type]?.en || type);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(language === 'sw' ? 'sw-TZ' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <DashboardLayout
            title={language === 'sw' ? 'Kumbukumbu ya Bidhaa' : 'Stock History'}
            subtitle={language === 'sw' ? 'Fuatilia mabadiliko yote ya hesabu ya bidhaa' : 'Track all changes to your product inventory'}
        >
            <div className="space-y-6" data-tour="stock-history-header">
                {/* Filters */}
                <Card className="card-kokotoa" data-tour="stock-filters">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder={language === 'sw' ? 'Tafuta bidhaa au SKU...' : 'Search product or SKU...'}
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger>
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder={language === 'sw' ? 'Aina' : 'Type'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{language === 'sw' ? 'Zote' : 'All Movements'}</SelectItem>
                                        <SelectItem value="IN">{language === 'sw' ? 'Ingizo (Stock In)' : 'Stock In'}</SelectItem>
                                        <SelectItem value="OUT">{language === 'sw' ? 'Toleo (Stock Out)' : 'Stock Out'}</SelectItem>
                                        <SelectItem value="ADJUST">{language === 'sw' ? 'Marekebisho' : 'Adjustments'}</SelectItem>
                                        <SelectItem value="SALE">{language === 'sw' ? 'Mauzo' : 'Sales'}</SelectItem>
                                        <SelectItem value="RETURN">{language === 'sw' ? 'Kurudisha' : 'Returns'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" onClick={fetchMovements} isLoading={isLoading}>
                                {!isLoading && <RefreshCcw className="w-4 h-4 mr-2" />}
                                {language === 'sw' ? 'Sasisha' : 'Refresh'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* History Table */}
                <Card className="card-kokotoa" data-tour="stock-movements-list">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileStack className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{language === 'sw' ? 'Mienendo ya Bidhaa' : 'Product Movements'}</CardTitle>
                                <CardDescription>
                                    {language === 'sw' ? `Inaonyesha mabadiliko ${filteredMovements.length}` : `Showing ${filteredMovements.length} movements`}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <MathLoader size="lg" text={language === 'sw' ? 'Yukupata kumbukumbu...' : 'Loading history...'} />
                            </div>
                        ) : filteredMovements.length > 0 ? (
                            <div className="space-y-4">
                                {/* Desktop View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="text-left p-4 font-semibold text-muted-foreground whitespace-nowrap">{language === 'sw' ? 'Tarehe na Muda' : 'Date & Time'}</th>
                                                <th className="text-left p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Bidhaa' : 'Product'}</th>
                                                <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Aina' : 'Type'}</th>
                                                <th className="text-center p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Mabadiliko' : 'Change'}</th>
                                                <th className="text-right p-4 font-semibold text-muted-foreground">{language === 'sw' ? 'Sababu / Rejea' : 'Reason / Ref'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMovements.map((m) => (
                                                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                    <td className="p-4 text-sm whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">{formatDate(m.created_at).split(',')[0]}</span>
                                                            <span className="text-xs text-muted-foreground">{formatDate(m.created_at).split(',')[1]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-muted flex items-center justify-center">
                                                                <Package className="w-4 h-4 text-muted-foreground" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-foreground truncate max-w-[200px]">{m.product_name}</p>
                                                                <p className="text-xs text-muted-foreground">{m.product_sku}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted border border-border">
                                                            {getMovementIcon(m.movement_type)}
                                                            <span className="text-xs font-medium">{getMovementLabel(m.movement_type)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className={`text-sm font-bold ${['IN', 'RETURN'].includes(m.movement_type) ? 'text-emerald-500' :
                                                            ['OUT', 'SALE', 'DAMAGE', 'EXPIRED'].includes(m.movement_type) ? 'text-rose-500' : 'text-amber-500'
                                                            }`}>
                                                            {['IN', 'RETURN'].includes(m.movement_type) ? '+' : ['OUT', 'SALE', 'DAMAGE', 'EXPIRED'].includes(m.movement_type) ? '-' : ''}
                                                            {m.quantity}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {m.quantity_before} → {m.quantity_after}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="max-w-[250px] ml-auto">
                                                            <p className="text-sm text-foreground italic">{m.reason || '-'}</p>
                                                            {m.reference && (
                                                                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                                                    <Info className="w-3 h-3" />
                                                                    {m.reference}
                                                                </p>
                                                            )}
                                                            <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                                                <User className="w-3 h-3" />
                                                                {m.created_by_name}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {filteredMovements.map((m) => (
                                        <div key={m.id} className="p-4 rounded-xl border border-border bg-card/50 shadow-sm space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(m.created_at)}
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] font-bold uppercase tracking-tight">
                                                    {getMovementIcon(m.movement_type)}
                                                    {getMovementLabel(m.movement_type)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-foreground text-sm truncate">{m.product_name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{m.product_sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-bold leading-none ${['IN', 'RETURN'].includes(m.movement_type) ? 'text-emerald-500' :
                                                        ['OUT', 'SALE', 'DAMAGE', 'EXPIRED'].includes(m.movement_type) ? 'text-rose-500' : 'text-amber-500'
                                                        }`}>
                                                        {['IN', 'RETURN'].includes(m.movement_type) ? '+' : ['OUT', 'SALE', 'DAMAGE', 'EXPIRED'].includes(m.movement_type) ? '-' : ''}
                                                        {m.quantity}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {m.quantity_before} → {m.quantity_after}
                                                    </p>
                                                </div>
                                            </div>

                                            {(m.reason || m.reference) && (
                                                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                                    {m.reason && <p className="text-xs text-foreground italic line-clamp-2">"{m.reason}"</p>}
                                                    {m.reference && (
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1.5">
                                                            <Info className="w-3 h-3" />
                                                            Ref: {m.reference}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-[10px] pt-1">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <User className="w-3 h-3" />
                                                    {m.created_by_name}
                                                </div>
                                                <div className="text-primary font-medium">#{m.id}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <History className="w-8 h-8 text-muted-foreground opacity-20" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {language === 'sw' ? 'Hakuna kumbukumbu' : 'No history found'}
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    {language === 'sw'
                                        ? 'Hatujapata mabadiliko yoyote kwenye hesabu yako bado.'
                                        : 'We haven\'t found any changes to your inventory yet.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <OnboardingTour page="stock-history" steps={stockHistoryTourSteps} />
        </DashboardLayout>
    );
};

export default StockHistory;
