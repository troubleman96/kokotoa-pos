import { eachDayOfInterval, format } from 'date-fns';
import type { ReportLanguage, ReportSaleRow } from './types';

export const buildTrendDates = (dateFrom: string, dateTo: string) =>
  eachDayOfInterval({
    start: new Date(`${dateFrom}T00:00:00`),
    end: new Date(`${dateTo}T00:00:00`),
  }).map((date) => format(date, 'yyyy-MM-dd'));

export const formatTrendDateLabel = (date: string, language: ReportLanguage) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });

export const formatPrice = (price: number) => `TSh ${Number(price || 0).toLocaleString()}`;

export const formatPercent = (value: number) => (Number.isFinite(value) ? `${value.toFixed(1)}%` : '0.0%');

export const formatCurrencyTick = (value: number) => `TSh ${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`;

export const exportToCSV = (data: Array<Record<string, string | number | null | undefined>>, filename: string) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyyMMdd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getSaleProductsLabel = (
  sale: Pick<ReportSaleRow, 'items' | 'product_names'>,
  language: ReportLanguage
) => {
  if (sale.items?.length) {
    return sale.items.join(', ');
  }

  return sale.product_names || (language === 'sw' ? 'Hakuna bidhaa...' : 'No products listed');
};
