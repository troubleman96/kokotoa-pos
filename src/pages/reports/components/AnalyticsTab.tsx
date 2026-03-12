import { AlertTriangle, Percent, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { REPORT_CHART_COLORS } from '../config';
import type {
  AnalyticsTrendPoint,
  CreditTrendPoint,
  DiscountTrendPoint,
  LowStockProductPoint,
  NamedProfitPoint,
  NamedSalesPoint,
  NamedValuePoint,
  ReportLanguage,
  TopProductPoint,
} from '../types';
import { formatCurrencyTick, formatPrice } from '../utils';

interface AnalyticsTabProps {
  analyticsTrend: AnalyticsTrendPoint[];
  creditTrendData: CreditTrendPoint[];
  dailyProfitTrend: NamedProfitPoint[];
  dailyTrend: NamedSalesPoint[];
  effectiveDiscountTrendData: DiscountTrendPoint[];
  hasAnalyticsTrendData: boolean;
  hasCreditTrendData: boolean;
  hasDiscountTrendData: boolean;
  inventoryValue: NamedValuePoint[];
  language: ReportLanguage;
  lowStockProducts: LowStockProductPoint[];
  salesByHour: NamedSalesPoint[];
  salesByMethod: NamedValuePoint[];
  topProducts: TopProductPoint[];
}

const AnalyticsTab = ({
  analyticsTrend,
  creditTrendData,
  dailyProfitTrend,
  dailyTrend,
  effectiveDiscountTrendData,
  hasAnalyticsTrendData,
  hasCreditTrendData,
  hasDiscountTrendData,
  inventoryValue,
  language,
  lowStockProducts,
  salesByHour,
  salesByMethod,
  topProducts,
}: AnalyticsTabProps) => (
  <div className="space-y-4 overflow-hidden sm:space-y-6">
    <Card className="card-kokotoa">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {language === 'sw' ? 'Mwenendo wa Takwimu' : 'Analytics Trend'}
        </CardTitle>
        <CardDescription className="text-base">
          {language === 'sw'
            ? 'Mauzo, Faida, Punguzo na Credit'
            : 'Sales, Profit, Discounts and Credit'}
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
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="discounts" stroke="#EF4444" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="credit" stroke="#F59E0B" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <div>
              <Percent className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>{language === 'sw' ? 'Hakuna data ya takwimu kwa kipindi hiki.' : 'No analytics data for this period.'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <Card className="card-kokotoa">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {language === 'sw' ? 'Mwenendo wa Faida' : 'Profit Trend'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw' ? 'Mwenendo wa faida kwa muda mrefu' : 'Profit trend over the selected period'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 min-w-0 overflow-hidden sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyProfitTrend}>
              <defs>
                <linearGradient id="colorProfitDetailed" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfitDetailed)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-kokotoa">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base sm:text-lg">
              {language === 'sw' ? 'Mwenendo wa Mapato' : 'Revenue Trend'}
            </CardTitle>
            <CardDescription className="text-base">
              {language === 'sw' ? 'Mwenendo wa mauzo kwa muda mrefu' : 'Revenue over the selected period'}
            </CardDescription>
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="h-64 min-w-0 overflow-hidden pt-4 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="colorSalesDetailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted-foreground))"
                opacity={0.1}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={formatCurrencyTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [formatPrice(value), language === 'sw' ? 'Mauzo' : 'Sales']}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSalesDetailed)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <Card className="card-kokotoa">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {language === 'sw' ? 'Mwenendo wa Punguzo' : 'Discount Trend'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw'
              ? 'Punguzo kwa muda mrefu ndani ya kipindi kilichochaguliwa'
              : 'Discount movement over the selected period'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 min-w-0 overflow-hidden sm:h-80">
          {hasDiscountTrendData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={effectiveDiscountTrendData}>
                <defs>
                  <linearGradient id="discountAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyTick} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Area type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#discountAreaFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div>
                <Percent className="mx-auto mb-3 h-10 w-10 opacity-50" />
                <p>
                  {language === 'sw'
                    ? 'Hakuna punguzo lililorekodiwa kwa kipindi hiki.'
                    : 'No discounts recorded for this period.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-kokotoa">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {language === 'sw' ? 'Mwenendo wa Credit' : 'Credit Trend'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw'
              ? 'Credit kwa muda mrefu ndani ya kipindi kilichochaguliwa'
              : 'Credit movement over the selected period'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 min-w-0 overflow-hidden sm:h-80">
          {hasCreditTrendData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={creditTrendData}>
                <defs>
                  <linearGradient id="creditAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyTick} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Area type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#creditAreaFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div>
                <TrendingUp className="mx-auto mb-3 h-10 w-10 opacity-50" />
                <p>
                  {language === 'sw'
                    ? 'Hakuna credit iliyorekodiwa kwa kipindi hiki.'
                    : 'No credit recorded for this period.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <Card className="card-kokotoa">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {language === 'sw' ? 'Njia za Malipo' : 'Payment Methods'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw'
              ? 'Mchanganuo wa malipo yaliyopokelewa'
              : 'Breakdown of sales by payment type'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 min-w-0 overflow-hidden sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salesByMethod}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {salesByMethod.map((entry, index) => (
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

      <Card className="card-kokotoa">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {language === 'sw' ? 'Bidhaa Zinazouzika' : 'Top Selling Products'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw'
              ? 'Bidhaa zilizouzwa zaidi kwa idadi'
              : 'Best performing products by quantity'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 min-w-0 overflow-hidden pb-6 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                fontSize={12}
                width={80}
                tickLine={false}
                axisLine={false}
                hide={language !== 'en'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Bar dataKey="quantity" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-kokotoa">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {language === 'sw' ? 'Saa za Biashara' : 'Peak Sales Hours'}
          </CardTitle>
          <CardDescription className="text-base">
            {language === 'sw'
              ? 'Mchanganuo wa mauzo kwa saa'
              : 'Sales distribution across the day'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 min-w-0 overflow-hidden sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByHour}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                }}
                formatter={(value: number) => formatPrice(value)}
              />
              <Bar dataKey="sales" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {lowStockProducts.length > 0 && (
        <Card className="card-kokotoa border-red-100 dark:border-red-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-red-500 sm:text-lg">
                <AlertTriangle className="h-5 w-5" />
                {language === 'sw' ? 'Bidhaa Chache (Low Stock)' : 'Low Stock Analysis'}
              </CardTitle>
              <CardDescription className="text-base sm:text-base">
                {language === 'sw'
                  ? 'Bidhaa zilizofikia kiwango cha chini'
                  : 'Products below minimum threshold'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[240px] space-y-3 overflow-y-auto pr-2 sm:max-h-[280px]">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div>
                    <p className="text-base font-bold">{product.name}</p>
                    <p className="text-base uppercase text-muted-foreground">
                      {product.category} • SKU: {product.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-red-500">
                      {product.current_stock} {product.unit}
                    </p>
                    <p className="text-base text-muted-foreground">Min: {product.minimum_stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    <Card className="card-kokotoa overflow-hidden lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {language === 'sw' ? 'Thamani ya Bidhaa kwa Aina' : 'Inventory Value by Category'}
        </CardTitle>
        <CardDescription className="text-base">
          {language === 'sw'
            ? 'Thamani ya bidhaa zilizopo ghala kwa sasa'
            : 'Total retail value distribution across categories'}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64 min-w-0 overflow-hidden sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={inventoryValue}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyTick} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
              }}
              formatter={(value: number) => formatPrice(value)}
            />
            <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);

export default AnalyticsTab;
