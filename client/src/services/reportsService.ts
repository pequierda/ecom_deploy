// services/reportsService.ts
import type { Period, ChartType, ReportsData } from '../types/reports';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ReportsService {
  async fetchReportsData(period: Period = '6months', chartType: ChartType = 'monthly'): Promise<ReportsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports?period=${period}&chartType=${chartType}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reports data:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch reports data');
    }
  }

  async exportReport(period: Period, chartType: ChartType, reportType: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/export`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period,
          chartType,
          reportType,
          format: 'pdf' // or 'xlsx', 'csv' depending on requirements
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export report');
    }
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportsService = new ReportsService();