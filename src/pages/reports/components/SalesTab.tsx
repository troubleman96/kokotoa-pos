import { BarChart3, CreditCard, DollarSign, Download, TrendingUp } from 'lucide-react';
import MathLoader from '@/components/ui/MathLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReportLanguage, ReportSaleRow, SalesReportData } from '../types';
import { formatPrice, getSaleProductsLabel } from '../utils';

interface SalesTabProps {
  isLoading: boolean;
  language: ReportLanguage;
  onExport: () => void;
  onRowClick: (sale: ReportSaleRow) => void;
  salesData: SalesReportData | null;
}

const SalesTab = ({ isLoading, language, onExport, onRowClick, salesData }: SalesTabProps) => (
  <div className="space-y-6">
    {isLoading ? (
      <div className="flex justify-center py-8 text-center">
        <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
      </div>
    ) : salesData ? (
      <>
        <div className="grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-3 sm:gap-4">
          <Card className="card-kokotoa overflow-hidden border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
              <CardTitle className="truncate text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Mauzo' : 'Sales'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary opacity-50" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPrice(salesData.summary?.total_sales || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Miamala' : 'Tx'}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary opacity-50" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {salesData.summary?.total_transactions || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa col-span-2 overflow-hidden border-primary/10 sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Wastani' : 'Avg'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary opacity-50" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPrice(salesData.summary?.average_sale || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-kokotoa">
          <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base sm:text-lg">
                {language === 'sw' ? 'Mauzo katika Kipindi Hiki' : 'Sales for Selected Period'}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={!salesData?.sales.length}
              className="w-full sm:w-auto"
              data-tour="reports-export"
            >
              <Download className="mr-2 h-4 w-4" />
              {language === 'sw' ? 'Pakua (CSV)' : 'Download (CSV)'}
            </Button>
          </CardHeader>
          <CardContent>
            {salesData.sales.length ? (
              <div className="space-y-4">
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-4 text-left text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Muamala & Bidhaa' : 'Transaction & Products'}
                        </th>
                        <th className="p-4 text-left text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Tarehe' : 'Date'}
                        </th>
                        <th className="p-4 text-left text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Kiasi' : 'Qty'}
                        </th>
                        <th className="p-4 text-left text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Malipo' : 'Payment'}
                        </th>
                        <th className="p-4 text-right text-base font-black uppercase tracking-widest text-primary">
                          {language === 'sw' ? 'Jumla' : 'Total'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {salesData.sales.slice(0, 20).map((sale) => (
                        <tr
                          key={sale.id}
                          className="group cursor-pointer border-b border-border/50 transition-all last:border-0 hover:bg-primary/5"
                          onClick={() => onRowClick(sale)}
                        >
                          <td className="p-4">
                            <p className="max-w-[300px] line-clamp-1 text-base font-bold uppercase tracking-tighter text-muted-foreground">
                              {getSaleProductsLabel(sale, language)}
                            </p>
                            <p className="mt-0.5 font-mono text-base font-black text-foreground transition-colors group-hover:text-primary">
                              {sale.transaction_number}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="text-base">
                              <p className="font-black text-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                              <p className="text-base font-bold uppercase text-muted-foreground">
                                {new Date(sale.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="rounded-lg bg-muted px-2.5 py-1 text-base font-black uppercase transition-colors group-hover:bg-primary/10">
                              {sale.items_count} {language === 'sw' ? 'Vitu' : 'Items'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-base font-black uppercase tracking-widest text-muted-foreground">
                              {sale.payment_method}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <p className="tabular-nums text-base font-black text-primary">
                              {formatPrice(sale.total_amount)}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {salesData.sales.slice(0, 15).map((sale) => (
                    <div
                      key={sale.id}
                      className="relative space-y-3 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
                      onClick={() => onRowClick(sale)}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <p className="line-clamp-1 text-base font-black uppercase text-muted-foreground">
                            {getSaleProductsLabel(sale, language)}
                          </p>
                          <div className="inline-block max-w-full rounded-lg bg-primary/5 px-2 py-0.5 font-mono text-base font-black text-primary truncate">
                            {sale.transaction_number}
                          </div>
                        </div>
                        <div className="text-base font-black uppercase tracking-wider text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-end justify-between pt-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="rounded bg-muted/50 p-1">
                              {sale.payment_method === 'CASH' ? (
                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                              )}
                            </div>
                            <span className="text-base font-black uppercase tracking-widest">
                              {sale.payment_method}
                            </span>
                          </div>
                          <div className="text-base font-bold uppercase text-muted-foreground">
                            {sale.items_count} {language === 'sw' ? 'Vitu' : 'Items'}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="tabular-nums text-lg font-black text-primary">
                            {formatPrice(sale.total_amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {language === 'sw' ? 'Hakuna miamala iliyopatikana' : 'No transactions found'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    ) : (
      <div className="py-12 text-center">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">
          {language === 'sw' ? 'Hakuna data ya mauzo inapatikana' : 'No sales data available'}
        </p>
      </div>
    )}
  </div>
);

export default SalesTab;
