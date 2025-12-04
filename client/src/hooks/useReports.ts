// hooks/useReports.ts
import { useEffect, useMemo } from 'react';
import { useReportsStore } from '../stores/reportsStore';
import type { Period, ChartType, ReportType, BookingStatus } from '../types/reports';

export const useReports = () => {
  const {
    data,
    filters,
    loading,
    error,
    fetchReportsData,
    updateFilters,
    exportReport,
    clearError
  } = useReportsStore();

  // Fetch initial data when hook is first used
  useEffect(() => {
    if (data.businessMetrics.length === 0) {
      fetchReportsData();
    }
  }, [fetchReportsData, data.businessMetrics.length]);

  // Handlers
  const handlePeriodChange = (period: Period) => {
    updateFilters({ period });
  };

  const handleChartTypeChange = (chartType: ChartType) => {
    updateFilters({ chartType });
  };

  const handleReportTypeChange = (reportType: ReportType) => {
    updateFilters({ reportType });
  };

  const handleExport = async () => {
    try {
      await exportReport();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRetry = () => {
    clearError();
    fetchReportsData(filters.period, filters.chartType);
  };

  // Utility functions
  const getBookingStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChartTitle = (): string => {
    switch (filters.chartType) {
      case '24hours': return 'Hourly Revenue & Bookings (Last 24 Hours)';
      case 'weekly': return 'Weekly Revenue & Bookings';
      case 'monthly': return 'Monthly Revenue & Bookings';
      default: return 'Revenue & Bookings';
    }
  };

  // Computed values
  const averageRating = useMemo(() => {
    if (!data.clientSatisfaction || data.clientSatisfaction.length === 0) {
      return 0;
    }

    const totalRatings = data.clientSatisfaction.reduce((sum, item) => sum + item.count, 0);
    if (totalRatings === 0) return 0;

    const weightedSum = data.clientSatisfaction.reduce(
      (sum, item, index) => sum + ((5 - index) * item.count), 
      0
    );

    return Number((weightedSum / totalRatings).toFixed(1));
  }, [data.clientSatisfaction]);

  const highRatingPercentage = useMemo(() => {
    if (!data.clientSatisfaction || data.clientSatisfaction.length === 0) {
      return 0;
    }

    const totalRatings = data.clientSatisfaction.reduce((sum, item) => sum + item.count, 0);
    if (totalRatings === 0) return 0;

    const highRatings = data.clientSatisfaction
      .slice(0, 2)
      .reduce((sum, item) => sum + item.count, 0);

    return Math.round((highRatings / totalRatings) * 100);
  }, [data.clientSatisfaction]);

  const hasData = data.businessMetrics.length > 0;
  const hasRevenueData = data.revenueData.length > 0;
  const hasPackageData = data.packagePerformance.length > 0;
  const hasClientSatisfactionData = data.clientSatisfaction.length > 0;
  const hasRecentBookings = data.recentBookings.length > 0;

  return {
    // State
    data,
    filters,
    loading,
    error,
    
    // Computed values
    averageRating,
    highRatingPercentage,
    hasData,
    hasRevenueData,
    hasPackageData,
    hasClientSatisfactionData,
    hasRecentBookings,
    
    // Handlers
    handlePeriodChange,
    handleChartTypeChange,
    handleReportTypeChange,
    handleExport,
    handleRetry,
    
    // Utility functions
    getBookingStatusColor,
    getChartTitle,
    
    // Actions
    fetchReportsData,
    clearError
  };
};