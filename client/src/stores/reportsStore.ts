// stores/reportsStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  ReportsState, 
  ReportsActions, 
  Period, 
  ChartType, 
  ReportsFilters,
  ReportType,
  ReportExportFormat 
} from '../types/reports';
import { reportsService } from '../services/reportsService';

const initialState: Omit<ReportsState, keyof ReportsActions> = {
  data: {
    businessMetrics: [],
    revenueData: [],
    packagePerformance: [],
    clientSatisfaction: [],
    recentBookings: [],
    chartType: 'monthly'
  },
  filters: {
    period: '6months',
    chartType: 'monthly',
    reportType: 'overview'
  },
  loading: false,
  error: null,
};

export const useReportsStore = create<ReportsState & ReportsActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchReportsData: async (period?: Period, chartType?: ChartType) => {
        const currentFilters = get().filters;
        const selectedPeriod = period || currentFilters.period;
        const selectedChartType = chartType || currentFilters.chartType;

        set({ loading: true, error: null });

        try {
          const data = await reportsService.fetchReportsData(selectedPeriod, selectedChartType);
          
          set({
            data,
            loading: false,
            error: null,
            filters: {
              ...currentFilters,
              period: selectedPeriod,
              chartType: selectedChartType
            }
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch reports data'
          });
        }
      },

      updateFilters: (newFilters: Partial<ReportsFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        
        set({ filters: updatedFilters });

        // Auto-fetch data if period or chartType changed
        if (newFilters.period || newFilters.chartType) {
          get().fetchReportsData(updatedFilters.period, updatedFilters.chartType);
        }
      },

      exportReport: async (options?: {
        period?: Period;
        chartType?: ChartType;
        reportType?: ReportType;
        format?: ReportExportFormat;
      }) => {
        const { filters } = get();
        const exportFilters = {
          period: options?.period || filters.period,
          chartType: options?.chartType || filters.chartType,
          reportType: options?.reportType || filters.reportType,
          format: options?.format,
        };
        
        try {
          set({ loading: true, error: null });
          
          const blob = await reportsService.exportReport(
            exportFilters.period,
            exportFilters.chartType,
            exportFilters.reportType,
            exportFilters.format
          );

          // Handle download directly in store
          const filename = `reports-${filters.period}-${filters.chartType}-${Date.now()}.pdf`;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          set({ loading: false });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to export report'
          });
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'reports-store',
      // Only log in development
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);