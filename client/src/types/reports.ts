// types/reports.ts

export type Period = '3months' | '6months' | '1year' | 'all';
export type ChartType = '24hours' | 'weekly' | 'monthly';
export type ReportType = 
  | 'overview'
  | 'revenue'
  | 'clients'
  | 'bookings'
  | 'satisfaction'
  | 'comprehensive';
  
export type ReportExportFormat = 'pdf' | 'csv' | 'json';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BusinessMetric {
  title: string;
  value: string;
  change: string;
  color: string;
  icon: 'DollarSign' | 'Calendar' | 'Users' | 'TrendingUp';
}

export interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
}

export interface PackagePerformance {
  name: string;
  bookings: number;
  revenue: number;
  color: string;
}

export interface ClientSatisfaction {
  rating: string;
  count: number;
  percentage: number;
}

export interface RecentBooking {
  id: string;
  client: string;
  package: string;
  weddingDate: string;
  status: BookingStatus;
  createdAt: string;
}

export interface ReportsData {
  businessMetrics: BusinessMetric[];
  revenueData: RevenueData[];
  packagePerformance: PackagePerformance[];
  clientSatisfaction: ClientSatisfaction[];
  recentBookings: RecentBooking[];
  chartType: ChartType;
}

export interface ReportsFilters {
  period: Period;
  chartType: ChartType;
  reportType: ReportType;
}

export interface ReportsState {
  data: ReportsData;
  filters: ReportsFilters;
  loading: boolean;
  error: string | null;
}

export interface ReportsActions {
  fetchReportsData: (period?: Period, chartType?: ChartType) => Promise<void>;
  updateFilters: (filters: Partial<ReportsFilters>) => void;
  exportReport: (options?: {
    period?: Period;
    chartType?: ChartType;
    reportType?: ReportType;
    format?: ReportExportFormat;
  }) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}