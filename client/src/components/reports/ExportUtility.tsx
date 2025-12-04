// components/reports/ExportUtility.tsx
import React, { useState } from 'react';
import { Download, FileText, BarChart3, Users, DollarSign, Loader2 } from 'lucide-react';
import { useReportExport } from '../../hooks/useReports';
import type { Period, ReportType, ReportExportFormat } from '../../types/reports';

interface ExportUtilityProps {
  selectedPeriod: Period;
  className?: string;
}

const ExportUtility: React.FC<ExportUtilityProps> = ({ 
  selectedPeriod, 
  className = '' 
}) => {
  const { exportReport, loading, error } = useReportExport();
  const [selectedFormat, setSelectedFormat] = useState<ReportExportFormat>('json');
  const [selectedType, setSelectedType] = useState<ReportType>('comprehensive');

  const exportOptions = [
    { value: 'comprehensive' as ReportType, label: 'Complete Report', icon: FileText },
    { value: 'revenue' as ReportType, label: 'Revenue Analytics', icon: DollarSign },
    { value: 'bookings' as ReportType, label: 'Booking Analytics', icon: BarChart3 },
    { value: 'satisfaction' as ReportType, label: 'Client Satisfaction', icon: Users }
  ] as const;

  const formatOptions: Array<{ value: ReportExportFormat; label: string; description: string }> = [
    { value: 'json', label: 'JSON Data', description: 'Machine-readable format' },
    { value: 'csv', label: 'CSV Export', description: 'Spreadsheet compatible' },
    { value: 'pdf', label: 'PDF Summary', description: 'Presentation ready' },
  ];

  const handleExport = async () => {
    await exportReport(selectedType, selectedPeriod, selectedFormat);
  };

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case '3months': return 'Last 3 Months';
      case '6months': return 'Last 6 Months';
      case '1year': return 'Last Year';
      case 'all': return 'All Time';
      default: return 'Selected Period';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Export Report</h3>
        <Download className="w-4 h-4 text-gray-500" />
      </div>

      <div className="space-y-4">
        {/* Export Type Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {exportOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedType(option.value)}
                  className={`p-2 text-left rounded-md border transition-colors ${
                    selectedType === option.value
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-3 h-3" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Format
          </label>
          <div className="space-y-1">
            {formatOptions.map((format) => (
              <label key={format.value} className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={selectedFormat === format.value}
                  onChange={(e) => setSelectedFormat(e.target.value as ReportExportFormat)}
                  className="w-3 h-3 text-pink-600 focus:ring-pink-500"
                />
                <div className="ml-2">
                  <div className="text-xs font-medium text-gray-900">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Period Info */}
        <div className="p-2 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-600">
            <div className="font-medium">Period: {getPeriodLabel(selectedPeriod)}</div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-pink-600 text-white text-xs font-medium rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-3 h-3" />
              <span>Export Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportUtility;