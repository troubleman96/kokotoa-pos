import {
  BarChart3,
  CreditCard,
  DollarSign,
  Package,
  Percent,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import type { ReportLanguage, ReportTabDefinition } from './types';

export const REPORT_CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const getReportTabs = (language: ReportLanguage): ReportTabDefinition[] => [
  { id: 'overview', label: language === 'sw' ? 'Muhtasari' : 'Overview', icon: BarChart3 },
  { id: 'analytics', label: language === 'sw' ? 'Takwimu' : 'Analytics', icon: TrendingUp },
  { id: 'sales', label: language === 'sw' ? 'Mauzo' : 'Sales', icon: DollarSign },
  { id: 'profit', label: language === 'sw' ? 'Faida' : 'Profit', icon: PiggyBank },
  { id: 'credit', label: language === 'sw' ? 'Madeni' : 'Credit', icon: CreditCard },
  { id: 'inventory', label: language === 'sw' ? 'Hesabu' : 'Inventory', icon: Package },
  { id: 'discounts', label: language === 'sw' ? 'Punguzo' : 'Discounts', icon: Percent },
];
