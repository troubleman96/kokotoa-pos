import { BarChart3, DollarSign, Download, Percent, PiggyBank, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MathLoader from '@/components/ui/MathLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REPORT_CHART_COLORS } from '../config';
import type { NamedProfitPoint, NamedValuePoint, ProfitReportData, ReportLanguage } from '../types';
import { formatCurrencyTick, formatPrice } from '../utils';

interface ProfitTabProps {
  dailyProfitTrend: NamedProfitPoint[];
  inventoryValue: NamedValuePoint[];
  isLoading: boolean;
  language: ReportLanguage;
  onExport: () => void;
  profitReport: ProfitReportData | null;
}

const ProfitTab = ({
  dailyProfitTrend,
  inventoryValue,
  isLoading,
  language,
  onExport,
  profitReport,
}: ProfitTabProps) => (
  <div className="space-y-6">
    {isLoading ? (
      <div className="flex justify-center py-8 text-center">
        <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
      </div>
    ) : profitReport ? (
      <>
        <div className="grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <Card className="card-kokotoa relative overflow-hidden border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Faida' : 'Profit'}
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-emerald-500 opacity-50" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPrice(profitReport.summary?.total_profit || 0)}
              </div>
              <div className="mt-1">
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-base font-bold text-emerald-500">
                  {profitReport.summary?.total_transactions || 0} {language === 'sw' ? 'Miamala' : 'Tx'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa relative overflow-hidden border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Mauzo' : 'Sales'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary opacity-50" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPrice(profitReport.summary?.total_sales || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa relative overflow-hidden border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Margin' : 'Margin'}
              </CardTitle>
              <Percent className="h-4 w-4 text-primary opacity-50" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {(profitReport.summary?.average_profit_margin || 0).toFixed(1)}%
              </div>
              <div className="mt-1">
                <span className="text-base font-bold uppercase tracking-tighter text-muted-foreground">
                  {language === 'sw' ? 'Wastani' : 'Average'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa relative overflow-hidden border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'sw' ? 'Wastani' : 'Avg'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary opacity-50" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
              <div className="text-lg font-black text-foreground sm:text-2xl">
                {formatPrice(profitReport.summary?.average_profit || 0)}
              </div>
              <div className="mt-1">
                <span className="text-base font-bold uppercase tracking-tighter text-muted-foreground">
                  {language === 'sw' ? 'Kwa Muamala' : 'Per Tx'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-kokotoa">
          <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base sm:text-lg">
                {language === 'sw' ? 'Mchanganuo wa Faida kwa Muamala' : 'Profit Breakdown by Transaction'}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={!profitReport?.profit_transactions.length}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {language === 'sw' ? 'Pakua (CSV)' : 'Download (CSV)'}
            </Button>
          </CardHeader>
          <CardContent>
            {profitReport.profit_transactions?.length ? (
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
                        <th className="p-4 text-right text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Mauzo' : 'Sales'}
                        </th>
                        <th className="p-4 text-right text-base font-black uppercase tracking-widest text-emerald-500">
                          {language === 'sw' ? 'Faida' : 'Profit'}
                        </th>
                        <th className="p-4 text-center text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Margin' : 'Margin'}
                        </th>
                        <th className="p-4 text-left text-base font-black uppercase tracking-widest text-muted-foreground">
                          {language === 'sw' ? 'Keshia' : 'Cashier'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {profitReport.profit_transactions.slice(0, 20).map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border/50 last:border-0">
                          <td className="p-4">
                            <p className="mb-0.5 font-mono text-base font-black text-foreground transition-colors group-hover:text-primary">
                              {transaction.transaction_number}
                            </p>
                            <p className="max-w-[250px] line-clamp-1 text-base font-bold uppercase tracking-tighter text-muted-foreground">
                              {transaction.product_names || (language === 'sw' ? 'Hakuna maelezo...' : 'No items listed')}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="text-base">
                              <p className="font-black text-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                              <p className="text-base font-bold uppercase text-muted-foreground">
                                {new Date(transaction.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <p className="tabular-nums text-base font-black text-foreground">
                              {formatPrice(transaction.net_amount)}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="tabular-nums text-base font-black text-emerald-500">
                              {formatPrice(transaction.total_profit)}
                            </p>
                          </td>
                          <td className="p-4 text-center">
                            <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-base font-black uppercase text-emerald-500">
                              {transaction.profit_margin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-base font-black uppercase tracking-widest text-muted-foreground">
                              {transaction.cashier}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {profitReport.profit_transactions.slice(0, 15).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="relative space-y-3 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="inline-block max-w-full rounded-lg bg-emerald-500/5 px-2 py-0.5 font-mono text-base font-black text-emerald-500 truncate">
                            {transaction.transaction_number}
                          </div>
                          <p className="line-clamp-1 text-base font-black uppercase text-muted-foreground">
                            {transaction.product_names}
                          </p>
                        </div>
                        <div className="text-base font-black uppercase tracking-wider text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-end justify-between border-t border-border/50 pt-1">
                        <div className="min-w-0 space-y-1">
                          <div className="max-w-[60%] truncate text-base font-black uppercase tracking-widest text-muted-foreground">
                            {transaction.cashier}
                          </div>
                          <div className="inline-block rounded-full bg-muted px-2 py-0.5 text-base font-bold">
                            {transaction.profit_margin.toFixed(1)}% margin
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="mb-0.5 text-base font-bold uppercase text-muted-foreground">
                            {language === 'sw' ? 'Faida' : 'Profit'}
                          </p>
                          <p className="tabular-nums text-lg font-black text-emerald-500">
                            {formatPrice(transaction.total_profit)}
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
                  {language === 'sw' ? 'Hakuna miamala ya faida' : 'No profit transactions'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {dailyProfitTrend.length > 0 && (
            <Card className="card-kokotoa">
              <CardHeader>
                <CardTitle>{language === 'sw' ? 'Mwenendo wa Faida' : 'Profit Trend'}</CardTitle>
                <CardDescription>
                  {language === 'sw'
                    ? 'Faida ya kila siku katika kipindi hiki'
                    : 'Daily profit over the selected period'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyProfitTrend}>
                    <defs>
                      <linearGradient id="colorProfitReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyTick} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                      }}
                      formatter={(value: number) => [formatPrice(value), language === 'sw' ? 'Faida' : 'Profit']}
                    />
                    <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfitReport)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle>{language === 'sw' ? 'Muhtasari wa Makundi' : 'Category Summary'}</CardTitle>
              <CardDescription>
                {language === 'sw'
                  ? 'Mchanganuo wa mapato kwa kila aina'
                  : 'Revenue distribution by category'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryValue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {inventoryValue.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                    }}
                    formatter={(value: number) => formatPrice(value)}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </>
    ) : (
      <div className="py-12 text-center">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">
          {language === 'sw' ? 'Hakuna data ya faida inapatikana' : 'No profit data available'}
        </p>
      </div>
    )}
  </div>
);

export default ProfitTab;
