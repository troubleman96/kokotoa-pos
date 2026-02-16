import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, CreditCard, DollarSign, RefreshCcw, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { reportsApi, salesApi, Sale } from '@/services/api';
import MathLoader from '@/components/ui/MathLoader';

const CreditDebts = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditSummary, setCreditSummary] = useState<{
    total_credit_amount: number;
    total_outstanding_debt: number;
    total_recovered_amount: number;
    recovery_rate: number;
    transaction_count: number;
  } | null>(null);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOBILE_MONEY' | 'BANK'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');

  const formatPrice = (value: number | string) => {
    const numeric = typeof value === 'string' ? Number(value) : value;
    return `TSh ${(Number.isFinite(numeric) ? numeric : 0).toLocaleString()}`;
  };

  const getBalanceDue = (sale: Sale) => Number(sale.balance_due || 0);

  const fetchOutstandingCredits = async () => {
    setIsLoading(true);
    try {
      const [salesResponse, creditResponse] = await Promise.all([
        salesApi.list({ payment_method: 'CREDIT', has_outstanding_balance: true }),
        reportsApi.getCredit().catch(() => null),
      ]);

      if (salesResponse.success && salesResponse.data?.sales) {
        setSales(salesResponse.data.sales);
      }

      if (creditResponse?.success && creditResponse.data?.summary) {
        setCreditSummary(creditResponse.data.summary);
      }
    } catch (error) {
      console.error('Error fetching outstanding credits:', error);
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Imeshindwa kupata madeni.' : 'Failed to fetch outstanding credits.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstandingCredits();
  }, []);

  const filteredSales = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sales;

    return sales.filter((sale) => {
      return (
        sale.transaction_number.toLowerCase().includes(query) ||
        (sale.customer_name || '').toLowerCase().includes(query) ||
        (sale.customer_phone || '').includes(query)
      );
    });
  }, [sales, searchQuery]);

  const localOutstandingTotal = useMemo(() => {
    return filteredSales.reduce((acc, sale) => acc + getBalanceDue(sale), 0);
  }, [filteredSales]);

  const openPaymentDialog = async (sale: Sale) => {
    setSelectedSale(sale);
    setPaymentAmount('');
    setPaymentMethod('CASH');
    setPaymentReference('');
    setIsPaymentDialogOpen(true);

    try {
      const response = await salesApi.get(sale.id);
      if (response.success) {
        setSelectedSale(response.data);
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedSale) return;

    const balanceDue = getBalanceDue(selectedSale);
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      toast({
        title: language === 'sw' ? 'Kiasi Batili' : 'Invalid Amount',
        description: language === 'sw' ? 'Weka kiasi sahihi cha malipo.' : 'Enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    if (amount > balanceDue) {
      toast({
        title: language === 'sw' ? 'Kiasi Kimezidi' : 'Amount Too High',
        description: language === 'sw'
          ? 'Kiasi hakiwezi kuzidi deni lililobaki.'
          : 'Payment cannot exceed the remaining balance.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const payload: {
        sale: number;
        amount: number;
        payment_method: 'CASH' | 'MOBILE_MONEY' | 'BANK';
        payment_reference?: string;
      } = {
        sale: selectedSale.id,
        amount,
        payment_method: paymentMethod,
      };

      if (paymentReference.trim()) {
        payload.payment_reference = paymentReference.trim();
      }

      await salesApi.recordCreditPayment(payload);

      toast({
        title: language === 'sw' ? 'Malipo Yamehifadhiwa' : 'Payment Recorded',
        description: language === 'sw' ? 'Malipo ya deni yamefanikiwa.' : 'Credit payment was recorded successfully.',
      });

      await fetchOutstandingCredits();

      const updated = await salesApi.get(selectedSale.id);
      if (updated.success) {
        setSelectedSale(updated.data);
      }

      setPaymentAmount('');
      setPaymentReference('');
    } catch (error) {
      console.error('Error recording credit payment:', error);
      toast({
        title: language === 'sw' ? 'Kosa!' : 'Error!',
        description: language === 'sw' ? 'Imeshindwa kuhifadhi malipo.' : 'Failed to record payment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Madeni ya Wateja' : 'Credit Debts'}
      subtitle={language === 'sw' ? 'Fuata madeni, malipo na salio la wateja' : 'Track outstanding balances and repayments'}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{language === 'sw' ? 'Jumla ya Deni' : 'Outstanding Debt'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-foreground">
                {formatPrice(creditSummary?.total_outstanding_debt ?? localOutstandingTotal)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{language === 'sw' ? 'Iliyorejeshwa' : 'Recovered'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-foreground">
                {formatPrice(creditSummary?.total_recovered_amount || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{language === 'sw' ? 'Kiwango cha Urejeshaji' : 'Recovery Rate'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-primary">
                {(creditSummary?.recovery_rate || 0).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{language === 'sw' ? 'Madeni Hai' : 'Open Debts'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-foreground">{filteredSales.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-kokotoa">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={language === 'sw' ? 'Tafuta muamala, mteja au simu...' : 'Search transaction, customer or phone...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={fetchOutstandingCredits} isLoading={isLoading}>
                {!isLoading && <RefreshCcw className="w-4 h-4 mr-2" />}
                {language === 'sw' ? 'Sasisha' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-kokotoa overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle>{language === 'sw' ? 'Orodha ya Madeni' : 'Outstanding Credit Sales'}</CardTitle>
            <CardDescription>
              {language === 'sw'
                ? `${filteredSales.length} madeni yenye salio la kulipa`
                : `${filteredSales.length} sales with unpaid balance`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-16 flex justify-center">
                <MathLoader size="lg" text={language === 'sw' ? 'Inapakia madeni...' : 'Loading debts...'} />
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {language === 'sw' ? 'Hakuna deni lililobaki.' : 'No outstanding debts found.'}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded leading-none">
                          {sale.transaction_number}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {sale.created_at ? format(parseISO(sale.created_at), 'dd MMM yyyy, HH:mm') : '-'}
                        </span>
                      </div>
                      <p className="font-semibold text-sm">
                        {sale.customer_name || (language === 'sw' ? 'Mteja wa Kawaida' : 'Walk-in Customer')}
                        {sale.customer_phone ? ` • ${sale.customer_phone}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'sw' ? 'Malipo yaliyofanyika:' : 'Payments made:'} {sale.payments?.length || 0}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <div>
                        <p className="text-[11px] text-muted-foreground">{language === 'sw' ? 'Jumla ya Mauzo' : 'Sale Total'}</p>
                        <p className="font-semibold text-sm">{sale.formatted_total || formatPrice(sale.net_amount)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">{language === 'sw' ? 'Deni Lililobaki' : 'Balance Due'}</p>
                        <p className="font-display font-bold text-lg text-destructive">{formatPrice(getBalanceDue(sale))}</p>
                      </div>
                      <Button className="btn-kokotoa" onClick={() => openPaymentDialog(sale)}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {language === 'sw' ? 'Lipia Deni' : 'Record Payment'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'sw' ? 'Malipo ya Deni' : 'Credit Repayment'}</DialogTitle>
            <DialogDescription>
              {selectedSale?.transaction_number}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card className="card-kokotoa">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{language === 'sw' ? 'Deni Lililobaki' : 'Balance Due'}</p>
                    <p className="font-bold text-destructive">{formatPrice(getBalanceDue(selectedSale))}</p>
                  </CardContent>
                </Card>
                <Card className="card-kokotoa">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{language === 'sw' ? 'Mteja' : 'Customer'}</p>
                    <p className="font-semibold text-sm truncate">
                      {selectedSale.customer_name || (language === 'sw' ? 'Mteja wa Kawaida' : 'Walk-in Customer')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {language === 'sw' ? 'Kiasi cha Malipo' : 'Payment Amount'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={getBalanceDue(selectedSale)}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {language === 'sw' ? 'Njia ya Malipo' : 'Payment Method'}
                  </label>
                  <Select value={paymentMethod} onValueChange={(value: 'CASH' | 'MOBILE_MONEY' | 'BANK') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">{language === 'sw' ? 'Taslimu' : 'Cash'}</SelectItem>
                      <SelectItem value="MOBILE_MONEY">{language === 'sw' ? 'Simu' : 'Mobile'}</SelectItem>
                      <SelectItem value="BANK">{language === 'sw' ? 'Benki' : 'Bank'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'sw' ? 'Kumbukumbu ya Malipo (Hiari)' : 'Payment Reference (Optional)'}
                </label>
                <Input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={language === 'sw' ? 'Mfano: TXN12345' : 'e.g. TXN12345'}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  {language === 'sw' ? 'Historia ya Malipo' : 'Payment History'}
                </p>
                <div className="max-h-48 overflow-auto rounded-lg border border-border divide-y divide-border/40">
                  {(selectedSale.payments || []).length ? (
                    [...(selectedSale.payments || [])]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((payment) => (
                        <div key={payment.id} className="p-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">{formatPrice(payment.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.payment_method} {payment.payment_reference ? `• ${payment.payment_reference}` : ''}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {payment.created_at ? format(parseISO(payment.created_at), 'dd MMM, HH:mm') : '-'}
                          </p>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      {language === 'sw' ? 'Hakuna malipo yaliyorekodiwa bado.' : 'No payments recorded yet.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              {language === 'sw' ? 'Funga' : 'Close'}
            </Button>
            <Button className="btn-kokotoa" isLoading={isSubmittingPayment} onClick={handleSubmitPayment}>
              <DollarSign className="w-4 h-4 mr-2" />
              {language === 'sw' ? 'Hifadhi Malipo' : 'Save Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CreditDebts;
