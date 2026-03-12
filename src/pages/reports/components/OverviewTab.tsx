import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailySummaryData, DashboardReportData, ReportLanguage } from '../types';
import { formatPrice } from '../utils';

interface OverviewTabProps {
  dailySummary: DailySummaryData | null;
  dashboardData: DashboardReportData | null;
  language: ReportLanguage;
}

const OverviewTab = ({ dailySummary, dashboardData, language }: OverviewTabProps) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <Card className="card-kokotoa">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            {language === 'sw' ? 'Bidhaa Zinazoongoza Leo' : "Today's Top Products"}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw'
              ? 'Bidhaa zenye mapato makubwa zaidi leo'
              : 'Highest revenue generating products today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailySummary?.top_products?.length ? (
              dailySummary.top_products.map((product, index) => (
                <div
                  key={`${product.product_sku}-${index}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted/80"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-bold">{product.product_name}</span>
                    <span className="truncate font-mono text-base text-muted-foreground">{product.product_sku}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-primary">{formatPrice(product.revenue)}</div>
                    <div className="text-base font-medium text-muted-foreground">
                      {product.quantity} {language === 'sw' ? 'zimeuzwa' : 'sold'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-base italic text-muted-foreground">
                {language === 'sw' ? 'Hakuna mauzo bado' : 'No sales yet today'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="card-kokotoa">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {language === 'sw' ? 'Tahadhari ya Bidhaa' : 'Stock Alerts'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw'
              ? 'Bidhaa zinazohitaji kuongezwa mara moja'
              : 'Items that need immediate restocking'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailySummary?.low_stock_alerts?.length ? (
              dailySummary.low_stock_alerts.map((product, index) => (
                <div
                  key={`${product.sku}-${index}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                >
                  <div className="min-w-0">
                    <span className="block truncate text-base font-bold text-foreground">{product.name}</span>
                    <span className="block truncate font-mono text-base text-muted-foreground">{product.sku}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-destructive">{product.quantity}</div>
                    <div className="text-base font-medium text-muted-foreground">
                      {language === 'sw' ? 'Baki (Min: ' : 'Left (Min: '}
                      {product.minimum_stock})
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-base font-medium italic text-primary">
                {language === 'sw' ? 'Bidhaa zote zipo katika hali nzuri' : 'All items are well stocked'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="card-kokotoa lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {language === 'sw' ? 'Mchanganuo wa Malipo ya Leo' : "Today's Payment Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {dailySummary?.payment_methods &&
              Object.entries(dailySummary.payment_methods).map(([method, data]) => (
                <div
                  key={method}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3 shadow-sm sm:p-4"
                >
                  <div className="min-w-0">
                    <div className="mb-1 text-base font-bold uppercase tracking-wider text-muted-foreground">
                      {method}
                    </div>
                    <div className="text-base font-black text-foreground sm:text-lg">
                      {formatPrice(data.total)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                      <span className="text-base font-bold text-primary">{data.count}</span>
                    </div>
                    <div className="text-base font-medium uppercase tracking-tighter text-muted-foreground">
                      {language === 'sw' ? 'Miamala' : 'Transactions'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <Card className="card-kokotoa relative overflow-hidden border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
          <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
            {language === 'sw' ? 'Leo' : 'Today'}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary opacity-50" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-6">
          <div className="text-lg font-black leading-tight text-foreground sm:text-2xl">
            {formatPrice(dashboardData?.today.sales || 0)}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-base font-bold text-primary">
              {dashboardData?.today.transactions || 0} {language === 'sw' ? 'Miamala' : 'Tx'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-kokotoa relative overflow-hidden border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
          <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
            {language === 'sw' ? 'Mweziu' : 'Month'}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-primary opacity-50" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-6">
          <div className="text-lg font-black leading-tight text-foreground sm:text-2xl">
            {formatPrice(dashboardData?.this_month.sales || 0)}
          </div>
          <div className="mt-1">
            <span className="text-base font-bold italic text-muted-foreground">
              {dashboardData?.this_month.transactions || 0} {language === 'sw' ? 'miamala' : 'tx'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-kokotoa relative overflow-hidden border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
          <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
            {language === 'sw' ? 'Bidhaa' : 'Items'}
          </CardTitle>
          <Package className="h-4 w-4 text-primary opacity-50" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-6">
          <div className="text-lg font-black leading-tight text-foreground sm:text-2xl">
            {dashboardData?.inventory.total_products || 0}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-medium uppercase text-muted-foreground">
              {language === 'sw' ? 'ghalani' : 'stock'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="card-kokotoa relative overflow-hidden border-destructive/10">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 sm:pb-2 sm:pt-6">
          <CardTitle className="text-base font-bold uppercase tracking-wider text-destructive/80">
            {language === 'sw' ? 'Chini' : 'Low'}
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive opacity-50" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-6">
          <div className="truncate text-base font-black leading-tight text-destructive sm:text-2xl">
            {dashboardData?.inventory.low_stock_count || 0}
          </div>
          <div className="mt-1">
            <span className="text-base font-bold uppercase text-destructive">
              {language === 'sw' ? 'zimebaki' : 'alerts'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default OverviewTab;
