import { BarChart3, DollarSign, Download, Percent, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MathLoader from '@/components/ui/MathLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  AnalyticsTrendPoint,
  DiscountSummaryMetrics,
  DiscountTrendPoint,
  ReportLanguage,
  ReportSaleRow,
} from '../types';
import { formatCurrencyTick, formatPercent, formatPrice, getSaleProductsLabel } from '../utils';

interface DiscountsTabProps {
  analyticsTrend: AnalyticsTrendPoint[];
  discountedSales: ReportSaleRow[];
  discountSummary: DiscountSummaryMetrics;
  effectiveDiscountTrendData: DiscountTrendPoint[];
  hasAnalyticsTrendData: boolean;
  hasDiscountTrendData: boolean;
  isLoading: boolean;
  language: ReportLanguage;
  onExport: () => void;
  onRowClick: (sale: ReportSaleRow) => void;
}

const DiscountsTab = ({
  analyticsTrend,
  discountedSales,
  discountSummary,
  effectiveDiscountTrendData,
  hasAnalyticsTrendData,
  hasDiscountTrendData,
  isLoading,
  language,
  onExport,
  onRowClick,
}: DiscountsTabProps) => (
  <div className="space-y-6">
    {isLoading ? (
      <div className="flex justify-center py-8 text-center">
        <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <Card className="card-kokotoa overflow-hidden border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Jumla ya Punguzo' : 'Total Discount'}
              </CardTitle>
              <Percent className="h-4 w-4 text-destructive opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPrice(discountSummary.totalDiscountAmount || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa overflow-hidden border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Wastani kwa Muamala' : 'Average / Sale'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPrice(discountSummary.averageDiscountPerSale || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa overflow-hidden border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Uwiano wa Punguzo' : 'Discount Ratio'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPercent(discountSummary.discountRatio || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa overflow-hidden border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Miamala Yenye Punguzo' : 'Discounted Transactions'}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {discountSummary.transactionCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {language === 'sw' ? 'Mwenendo wa Punguzo' : 'Discount Trend'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'sw'
                  ? 'Punguzo lililotolewa kwa kila siku ndani ya kipindi hiki'
                  : 'Daily discount amount across the selected period'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 min-w-0 overflow-hidden sm:h-80">
              {hasDiscountTrendData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={effectiveDiscountTrendData}>
                    <defs>
                      <linearGradient id="discountsTabBarFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#F87171" stopOpacity={0.45} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyTick} />
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                    <Bar dataKey="total" fill="url(#discountsTabBarFill)" radius={[8, 8, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <div>
                    <Percent className="mx-auto mb-3 h-10 w-10 opacity-50" />
                    <p>
                      {language === 'sw'
                        ? 'Hakuna punguzo lililorekodiwa kwa kipindi hiki.'
                        : 'No discounts recorded for this date range.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {language === 'sw'
                  ? 'Punguzo dhidi ya Mauzo, Faida na Credit'
                  : 'Discounts vs Sales, Profit and Credit'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'sw'
                  ? 'Linganisha punguzo na vipimo vingine vya biashara kwenye kipindi hiki'
                  : 'Compare discounts against the other core business metrics'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 min-w-0 overflow-hidden sm:h-80">
              {hasAnalyticsTrendData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyTick} />
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="discounts" stroke="#EF4444" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="credit" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <div>
                    <TrendingUp className="mx-auto mb-3 h-10 w-10 opacity-50" />
                    <p>
                      {language === 'sw'
                        ? 'Hakuna data ya mwenendo wa takwimu kwa kipindi hiki.'
                        : 'No analytics trend data available for this date range.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-kokotoa">
          <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base sm:text-lg">
                {language === 'sw' ? 'Miamala Yenye Punguzo' : 'Discounted Sales Transactions'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'sw'
                  ? 'Muhtasari wa miamala yote yenye punguzo ndani ya kipindi hiki'
                  : 'All sales where a discount was applied during the selected period'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={!discountedSales.length}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {language === 'sw' ? 'Pakua (CSV)' : 'Download (CSV)'}
            </Button>
          </CardHeader>
          <CardContent>
            {discountedSales.length ? (
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
                          {language === 'sw' ? 'Vitu' : 'Items'}
                        </th>
                        <th className="p-4 text-right text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Bruto' : 'Gross'}
                        </th>
                        <th className="p-4 text-right text-base font-black uppercase tracking-widest text-destructive">
                          {language === 'sw' ? 'Punguzo' : 'Discount'}
                        </th>
                        <th className="p-4 text-right text-base font-black uppercase tracking-widest text-primary">
                          {language === 'sw' ? 'Neti' : 'Net'}
                        </th>
                        <th className="p-4 text-right text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Faida' : 'Profit'}
                        </th>
                        <th className="p-4 text-left text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Malipo' : 'Payment'}
                        </th>
                        <th className="p-4 text-left text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Cashier' : 'Cashier'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {discountedSales.slice(0, 25).map((sale) => (
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
                            <span className="rounded-lg bg-muted px-2.5 py-1 text-base font-black uppercase">
                              {sale.items_count}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <p className="tabular-nums text-base font-black text-foreground">
                              {formatPrice(sale.total_amount)}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="tabular-nums text-base font-black text-destructive">
                              {formatPrice(sale.discount)}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="tabular-nums text-base font-black text-primary">
                              {formatPrice(sale.net_amount)}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="tabular-nums text-base font-black text-foreground">
                              {typeof sale.profit === 'number' ? formatPrice(sale.profit) : '-'}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="text-base font-black uppercase tracking-widest text-muted-foreground">
                              {sale.payment_method}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-base font-medium text-muted-foreground">
                              {sale.cashier || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {discountedSales.slice(0, 20).map((sale) => (
                    <div
                      key={sale.id}
                      className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                      onClick={() => onRowClick(sale)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-base font-black uppercase text-muted-foreground">
                            {getSaleProductsLabel(sale, language)}
                          </p>
                          <p className="truncate font-mono text-base font-black text-primary">
                            {sale.transaction_number}
                          </p>
                        </div>
                        <span className="text-base font-black uppercase tracking-wider text-muted-foreground">
                          {new Date(sale.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {language === 'sw' ? 'Bruto' : 'Gross'}
                          </p>
                          <p className="font-black text-foreground">{formatPrice(sale.total_amount)}</p>
                        </div>
                        <div className="rounded-xl bg-destructive/10 p-3">
                          <p className="text-[10px] uppercase tracking-widest text-destructive">
                            {language === 'sw' ? 'Punguzo' : 'Discount'}
                          </p>
                          <p className="font-black text-destructive">{formatPrice(sale.discount)}</p>
                        </div>
                        <div className="rounded-xl bg-primary/10 p-3">
                          <p className="text-[10px] uppercase tracking-widest text-primary">
                            {language === 'sw' ? 'Neti' : 'Net'}
                          </p>
                          <p className="font-black text-primary">{formatPrice(sale.net_amount)}</p>
                        </div>
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {language === 'sw' ? 'Faida' : 'Profit'}
                          </p>
                          <p className="font-black text-foreground">
                            {typeof sale.profit === 'number' ? formatPrice(sale.profit) : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-base text-muted-foreground">
                        <span className="font-bold uppercase">{sale.payment_method}</span>
                        <span>{sale.cashier || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Percent className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {language === 'sw'
                    ? 'Hakuna miamala yenye punguzo kwa kipindi hiki.'
                    : 'No discounted sales found for this period.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )}
  </div>
);

export default DiscountsTab;
