import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MathLoader from '@/components/ui/MathLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreditAnalyticsData, ReportLanguage } from '../types';
import { formatCurrencyTick, formatPrice } from '../utils';

interface CreditTabProps {
  creditAnalytics: CreditAnalyticsData | null;
  isLoading: boolean;
  language: ReportLanguage;
}

const CreditTab = ({ creditAnalytics, isLoading, language }: CreditTabProps) => (
  <div className="space-y-4 sm:space-y-6">
    {isLoading ? (
      <div className="flex justify-center py-8 text-center">
        <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{language === 'sw' ? 'Jumla Credit' : 'Total Credit'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-lg font-bold text-foreground sm:text-2xl">
                {formatPrice(creditAnalytics?.summary?.total_credit_amount || 0)}
              </div>
              <p className="mt-1 text-base text-muted-foreground">
                {creditAnalytics?.summary?.transaction_count || 0} {language === 'sw' ? 'miamala' : 'transactions'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {language === 'sw' ? 'Deni Lililobaki' : 'Outstanding Debt'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-lg font-bold text-foreground sm:text-2xl">
                {formatPrice(creditAnalytics?.summary?.total_outstanding_debt || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {language === 'sw' ? 'Jumla Iliyorejeshwa' : 'Recovered Amount'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-lg font-bold text-foreground sm:text-2xl">
                {formatPrice(creditAnalytics?.summary?.total_recovered_amount || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {language === 'sw' ? 'Kiwango cha Urejeshaji' : 'Recovery Rate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-lg font-bold text-primary sm:text-2xl">
                {(creditAnalytics?.summary?.recovery_rate || 0).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {language === 'sw' ? 'Mwenendo wa Credit' : 'Credit Trend'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 min-w-0 overflow-hidden sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(creditAnalytics?.trend || []).map((trendPoint) => ({
                    name: new Date(trendPoint.date).toLocaleDateString(
                      language === 'sw' ? 'sw-TZ' : 'en-US',
                      { day: 'numeric', month: 'short' }
                    ),
                    total: trendPoint.total,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyTick} />
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Area type="monotone" dataKey="total" stroke="#F59E0B" fill="#F59E0B33" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-kokotoa">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {language === 'sw' ? 'Wateja wa Madeni Juu' : 'Top Debtors'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(creditAnalytics?.top_customers || []).length ? (
                  (creditAnalytics?.top_customers || []).map((customer, index) => (
                    <div
                      key={`${customer.customer_phone}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                    >
                      <div>
                        <p className="text-base font-semibold">
                          {customer.customer_name || (language === 'sw' ? 'Mteja' : 'Customer')}
                        </p>
                        <p className="text-base text-muted-foreground">{customer.customer_phone || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-foreground">{formatPrice(customer.total || 0)}</p>
                        <p className="text-base text-muted-foreground">
                          {language === 'sw' ? 'Deni:' : 'Outstanding:'} {formatPrice(customer.outstanding || 0)}
                        </p>
                        <p className="text-base text-muted-foreground">
                          {customer.count || 0} {language === 'sw' ? 'miamala' : 'tx'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-base text-muted-foreground">
                    {language === 'sw' ? 'Hakuna data ya credit' : 'No credit data found'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )}
  </div>
);

export default CreditTab;
