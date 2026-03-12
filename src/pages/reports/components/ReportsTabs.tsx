import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReportLanguage, ReportTabDefinition, ReportTabId } from '../types';

interface ReportsTabsProps {
  activeTab: ReportTabId;
  dateRange: string;
  language: ReportLanguage;
  onDateRangeChange: (value: string) => void;
  onTabChange: (tab: ReportTabId) => void;
  tabs: ReportTabDefinition[];
}

const ReportsTabs = ({
  activeTab,
  dateRange,
  language,
  onDateRangeChange,
  onTabChange,
  tabs,
}: ReportsTabsProps) => {
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkTabsScroll = () => {
    const container = tabsScrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftScroll(scrollLeft > 6);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  useEffect(() => {
    checkTabsScroll();

    const container = tabsScrollRef.current;
    if (!container) return undefined;

    container.addEventListener('scroll', checkTabsScroll);
    return () => container.removeEventListener('scroll', checkTabsScroll);
  }, [language, tabs.length]);

  return (
    <div
      className="mb-4 flex flex-col items-stretch gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-3"
      data-tour="reports-tabs"
    >
      <div className="w-full min-w-0">
        <div className="relative w-full min-w-0">
          <div
            ref={tabsScrollRef}
            className="relative flex w-full min-w-0 flex-1 touch-pan-x overflow-x-auto hide-scrollbar"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => onTabChange(tab.id)}
                  data-tour={`reports-tab-${tab.id}`}
                  className={[
                    'flex-none w-[25%] min-w-[25%] max-w-[25%] sm:flex-1 sm:w-auto sm:min-w-fit sm:max-w-none',
                    'flex flex-col items-center justify-center gap-0.5 px-1.5 py-2 sm:flex-row sm:gap-1.5 sm:px-3 sm:py-1.5',
                    'text-[9px] font-bold uppercase tracking-wide leading-tight whitespace-nowrap transition-all duration-200 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal',
                    'hover:bg-secondary/80 active:scale-95',
                    isActive
                      ? 'bg-card text-primary border-b-2 border-primary shadow-sm sm:rounded-md sm:border sm:border-primary/40'
                      : 'text-muted-foreground sm:border sm:border-input sm:rounded-md',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {showLeftScroll && (
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 flex w-10 items-center justify-start bg-gradient-to-r from-secondary/90 via-secondary/60 to-transparent pl-1">
              <ChevronLeft className="h-4 w-4 animate-pulse text-primary" />
            </div>
          )}

          {showRightScroll && (
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 flex w-10 items-center justify-end bg-gradient-to-l from-secondary/90 via-secondary/60 to-transparent pr-1">
              <ChevronRight className="h-4 w-4 animate-pulse text-primary" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full shrink-0 sm:w-auto" data-tour="reports-date-filter">
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-full sm:w-40">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{language === 'sw' ? 'Wiki 1' : '1 Week'}</SelectItem>
            <SelectItem value="30">{language === 'sw' ? 'Mwezi 1' : '1 Month'}</SelectItem>
            <SelectItem value="90">{language === 'sw' ? 'Miezi 3' : '3 Months'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportsTabs;
