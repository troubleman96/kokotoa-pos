import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SaleDetailsModal from '@/components/SaleDetailsModal';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { useLanguage } from '@/contexts/LanguageContext';
import { reportsTourSteps } from '@/data/tourSteps';
import { getReportTabs } from './config';
import AnalyticsTab from './components/AnalyticsTab';
import CreditTab from './components/CreditTab';
import DiscountsTab from './components/DiscountsTab';
import InventoryTab from './components/InventoryTab';
import OverviewTab from './components/OverviewTab';
import ProfitTab from './components/ProfitTab';
import ReportsTabs from './components/ReportsTabs';
import SalesTab from './components/SalesTab';
import type { ReportTabId } from './types';
import { useReportsData } from './useReportsData';

const Reports = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<ReportTabId>('overview');
  const [dateRange, setDateRange] = useState('7');

  const tabs = getReportTabs(language);
  const {
    analyticsTrend,
    creditAnalytics,
    creditTrendData,
    dailyProfitTrend,
    dailySummary,
    dailyTrend,
    discountedSales,
    discountSummary,
    effectiveDiscountTrendData,
    handleDiscountsExport,
    handleInventoryExport,
    handleProfitExport,
    handleRowClick,
    handleSalesExport,
    hasAnalyticsTrendData,
    hasCreditTrendData,
    hasDiscountTrendData,
    inventoryData,
    inventoryValue,
    isLoading,
    isSaleDetailsOpen,
    lowStockProducts,
    profitReport,
    salesByHour,
    salesByMethod,
    salesData,
    selectedSale,
    setIsSaleDetailsOpen,
    topProducts,
    dashboardData,
  } = useReportsData({
    activeTab,
    dateRange,
    language,
  });

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            dashboardData={dashboardData}
            dailySummary={dailySummary}
            language={language}
          />
        );
      case 'sales':
        return (
          <SalesTab
            isLoading={isLoading}
            language={language}
            onExport={handleSalesExport}
            onRowClick={handleRowClick}
            salesData={salesData}
          />
        );
      case 'inventory':
        return (
          <InventoryTab
            inventoryData={inventoryData}
            isLoading={isLoading}
            language={language}
            onExport={handleInventoryExport}
          />
        );
      case 'analytics':
        return (
          <AnalyticsTab
            analyticsTrend={analyticsTrend}
            creditTrendData={creditTrendData}
            dailyProfitTrend={dailyProfitTrend}
            dailyTrend={dailyTrend}
            effectiveDiscountTrendData={effectiveDiscountTrendData}
            hasAnalyticsTrendData={hasAnalyticsTrendData}
            hasCreditTrendData={hasCreditTrendData}
            hasDiscountTrendData={hasDiscountTrendData}
            inventoryValue={inventoryValue}
            language={language}
            lowStockProducts={lowStockProducts}
            salesByHour={salesByHour}
            salesByMethod={salesByMethod}
            topProducts={topProducts}
          />
        );
      case 'discounts':
        return (
          <DiscountsTab
            analyticsTrend={analyticsTrend}
            discountedSales={discountedSales}
            discountSummary={discountSummary}
            effectiveDiscountTrendData={effectiveDiscountTrendData}
            hasAnalyticsTrendData={hasAnalyticsTrendData}
            hasDiscountTrendData={hasDiscountTrendData}
            isLoading={isLoading}
            language={language}
            onExport={handleDiscountsExport}
            onRowClick={handleRowClick}
          />
        );
      case 'profit':
        return (
          <ProfitTab
            dailyProfitTrend={dailyProfitTrend}
            inventoryValue={inventoryValue}
            isLoading={isLoading}
            language={language}
            onExport={handleProfitExport}
            profitReport={profitReport}
          />
        );
      case 'credit':
        return (
          <CreditTab
            creditAnalytics={creditAnalytics}
            isLoading={isLoading}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title={language === 'sw' ? 'Ripoti na Takwimu' : 'Reports & Analytics'}
      subtitle={language === 'sw' ? 'Angalia utendaji wa biashara yako' : 'View your business performance'}
    >
      <div
        className="w-full max-w-full min-w-0 space-y-4 overflow-x-hidden text-[14px] sm:space-y-6 sm:text-base [&_*]:max-w-full [&_*]:min-w-0"
        data-tour="reports-header"
      >
        <ReportsTabs
          activeTab={activeTab}
          dateRange={dateRange}
          language={language}
          onDateRangeChange={setDateRange}
          onTabChange={setActiveTab}
          tabs={tabs}
        />

        {renderActiveTab()}
      </div>

      <OnboardingTour page="reports" steps={reportsTourSteps} />
      <SaleDetailsModal
        isOpen={isSaleDetailsOpen}
        onClose={() => setIsSaleDetailsOpen(false)}
        sale={selectedSale}
      />
    </DashboardLayout>
  );
};

export default Reports;
