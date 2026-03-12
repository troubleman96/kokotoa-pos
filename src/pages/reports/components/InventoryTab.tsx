import { Download, Package } from 'lucide-react';
import MathLoader from '@/components/ui/MathLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryReportData, ReportLanguage } from '../types';
import { formatPrice } from '../utils';

interface InventoryTabProps {
  inventoryData: InventoryReportData | null;
  isLoading: boolean;
  language: ReportLanguage;
  onExport: () => void;
}

const InventoryTab = ({ inventoryData, isLoading, language, onExport }: InventoryTabProps) => (
  <Card className="card-kokotoa">
    <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <CardTitle className="text-base sm:text-lg">
          {language === 'sw' ? 'Ripoti ya Hesabu' : 'Inventory Report'}
        </CardTitle>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        disabled={!inventoryData?.products.length}
        className="w-full sm:w-auto"
      >
        <Download className="mr-2 h-4 w-4" />
        {language === 'sw' ? 'Pakua (CSV)' : 'Download (CSV)'}
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center py-8 text-center">
          <MathLoader size="lg" text={language === 'sw' ? 'Inapakia...' : 'Loading...'} />
        </div>
      ) : inventoryData?.products.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-left text-base font-semibold uppercase tracking-wider text-muted-foreground">
                    {language === 'sw' ? 'Bidhaa' : 'Product'}
                  </th>
                  <th className="p-4 text-left text-base font-semibold uppercase tracking-wider text-muted-foreground">
                    {language === 'sw' ? 'Aina' : 'Category'}
                  </th>
                  <th className="p-4 text-center text-base font-semibold uppercase tracking-wider text-muted-foreground">
                    {language === 'sw' ? 'Kiasi' : 'Stock'}
                  </th>
                  <th className="p-4 text-right text-base font-semibold uppercase tracking-wider text-muted-foreground">
                    {language === 'sw' ? 'Thamani' : 'Value'}
                  </th>
                  <th className="p-4 text-center text-base font-semibold uppercase tracking-wider text-muted-foreground">
                    {language === 'sw' ? 'Hali' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {inventoryData.products.slice(0, 10).map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-muted/20">
                    <td className="p-4">
                      <span className="text-base font-bold text-foreground">{product.name}</span>
                      <span className="block font-mono text-base text-muted-foreground">{product.sku}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-base font-medium text-muted-foreground">{product.category}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-base font-bold ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`}>
                        {product.current_stock}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-base text-muted-foreground">
                      {formatPrice(product.retail_value)}
                    </td>
                    <td className="p-4 text-center">
                      {product.is_low_stock ? (
                        <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-base font-bold uppercase tracking-wider text-destructive">
                          {language === 'sw' ? 'Chini' : 'Low'}
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-base font-bold uppercase tracking-wider text-emerald-500">
                          {language === 'sw' ? 'Sawa' : 'OK'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {inventoryData.products.slice(0, 10).map((product) => (
              <div
                key={product.id}
                className={`space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm ${
                  product.is_low_stock ? 'border-l-4 border-l-destructive' : ''
                }`}
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="mb-0.5 truncate text-base font-bold text-foreground">{product.name}</p>
                    <p className="truncate font-mono text-base text-muted-foreground">{product.sku}</p>
                  </div>
                  {product.is_low_stock ? (
                    <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-base font-black uppercase text-destructive">
                      {language === 'sw' ? 'CHINI' : 'LOW'}
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-base font-black uppercase text-emerald-500">
                      {language === 'sw' ? 'SAWA' : 'OK'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-3">
                  <div>
                    <p className="mb-1 text-base font-bold uppercase tracking-widest text-muted-foreground">
                      {language === 'sw' ? 'STOKI' : 'STOCK'}
                    </p>
                    <p className={`text-base font-bold ${product.is_low_stock ? 'text-destructive' : 'text-foreground'}`}>
                      {product.current_stock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-base font-bold uppercase tracking-widest text-muted-foreground">
                      {language === 'sw' ? 'THAMANI' : 'VALUE'}
                    </p>
                    <p className="text-base font-bold text-primary">{formatPrice(product.retail_value)}</p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/30 p-2 text-base text-muted-foreground">
                  <span className="font-bold uppercase tracking-widest">
                    {language === 'sw' ? 'Aina:' : 'Category:'}
                  </span>
                  <span className="truncate font-medium">{product.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{language === 'sw' ? 'Hakuna bidhaa' : 'No products'}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default InventoryTab;
