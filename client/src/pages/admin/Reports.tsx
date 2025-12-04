// pages/admin/Reports.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar, Download, Filter, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

// TypeScript interfaces for API responses
interface MonthlyPerformanceData {
  month: string;
  year: number;
  bookings: number;
  revenue: number;
  planners: number;
  disputes: number;
}

interface TopPlanner {
  planner_id: number;
  name: string;
  planner_name: string;
  bookings: number;
  revenue: number;
  rating: string;
  profile_picture?: string;
  color: string;
}

interface PermitStatus {
  name: string;
  value: number;
  color: string;
}

interface ComplianceMetric {
  category: string;
  compliant: number;
  total: number;
  percentage: number;
}

interface RegionalData {
  region: string;
  planners: number;
  bookings: number;
  revenue: number;
}

interface SystemAlert {
  id: string;
  type: string;
  message: string;
  severity: 'high' | 'warning' | 'medium' | 'positive';
  timestamp: string;
  action_url?: string;
}

interface FinancialMetrics {
  monthly: {
    current: {
      revenue: number;
      bookings: number;
      active_planners: number;
    };
    previous: {
      revenue: number;
      bookings: number;
      active_planners: number;
    };
    growth: {
      revenue: number;
      bookings: number;
      planners: number;
    };
  };
  yearly: {
    current: {
      revenue: number;
      bookings: number;
    };
    previous: {
      revenue: number;
      bookings: number;
    };
    growth: {
      revenue: number;
      bookings: number;
    };
  };
}

const AdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for different data types
  const [monthlyData, setMonthlyData] = useState<MonthlyPerformanceData[]>([]);
  const [plannerPerformance, setPlannerPerformance] = useState<TopPlanner[]>([]);
  const [permitStatusData, setPermitStatusData] = useState<PermitStatus[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<SystemAlert[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);

  // API base URL
  const API_BASE = 'http://localhost:5000/api/stats/admin/reports';

  // Fetch all reports data
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the main comprehensive reports endpoint
      const response = await fetch(`${API_BASE}?period=${selectedPeriod}&type=${reportType}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch reports data');
      }

      const data = result.data;

      // Update state based on the report type
      if (data.overview) {
        setMonthlyData(data.overview.monthly_performance || []);
        setPlannerPerformance(data.overview.top_planners || []);
        setPermitStatusData(data.overview.permit_status || []);
        setRecentAlerts(data.overview.system_alerts || []);
        setFinancialMetrics(data.overview.financial_metrics);
      }

      if (data.compliance) {
        setComplianceMetrics(data.compliance.metrics || []);
        setPermitStatusData(data.compliance.permit_distribution || []);
      }

      if (data.regional) {
        setRegionalData(data.regional.performance || []);
      }

      if (data.financial) {
        setFinancialMetrics(data.financial.metrics);
        if (data.financial.trends) {
          setMonthlyData(data.financial.trends);
        }
      }

    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount and when filters change
  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod, reportType]);

  // Calculate system metrics from financial data
  const systemMetrics = React.useMemo(() => {
    if (!financialMetrics) return [];

    const formatCurrency = (amount: number) => `₱${(amount / 1000000).toFixed(1)}M`;
    const formatPercentage = (percentage: number) => `${percentage > 0 ? '+' : ''}${percentage.toFixed(0)}%`;

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(financialMetrics.yearly.current.revenue),
        change: formatPercentage(financialMetrics.yearly.growth.revenue),
        trend: financialMetrics.yearly.growth.revenue >= 0 ? 'up' : 'down',
        icon: DollarSign,
        color: 'text-green-600',
        description: 'Platform revenue this year'
      },
      {
        title: 'Active Planners',
        value: financialMetrics.monthly.current.active_planners.toString(),
        change: formatPercentage(financialMetrics.monthly.growth.planners),
        trend: financialMetrics.monthly.growth.planners >= 0 ? 'up' : 'down',
        icon: Users,
        color: 'text-blue-600',
        description: 'Registered and verified planners'
      },
      {
        title: 'Total Bookings',
        value: financialMetrics.yearly.current.bookings.toString(),
        change: formatPercentage(financialMetrics.yearly.growth.bookings),
        trend: financialMetrics.yearly.growth.bookings >= 0 ? 'up' : 'down',
        icon: Calendar,
        color: 'text-purple-600',
        description: 'Successful bookings this year'
      },
      {
        title: 'Platform Growth',
        value: formatPercentage(financialMetrics.yearly.growth.revenue),
        change: formatPercentage(financialMetrics.monthly.growth.revenue),
        trend: financialMetrics.yearly.growth.revenue >= 0 ? 'up' : 'down',
        icon: TrendingUp,
        color: 'text-pink-600',
        description: 'Year-over-year growth'
      }
    ];
  }, [financialMetrics]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'medium': return AlertTriangle;
      case 'positive': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="System Reports & Analytics"
        subtitle="Comprehensive platform performance and compliance monitoring"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading reports data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="System Reports & Analytics"
      subtitle="Comprehensive platform performance and compliance monitoring"
    >
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => { setError(null); fetchReportsData(); }}
              className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['overview', 'financial', 'compliance', 'regional'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${
                  reportType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchReportsData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {systemMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`w-4 h-4 mr-1 ${metric.color}`} />
                    <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
                    <span className="text-sm text-gray-500 ml-1">from last period</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{metric.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Platform Performance Chart */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `₱${Number(value).toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Planners Performance */}
        {plannerPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Planners</h3>
            <div className="space-y-4">
              {plannerPerformance.map((planner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: planner.color }}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{planner.name}</h4>
                      <p className="text-sm text-gray-600">{planner.bookings} bookings • ★ {planner.rating}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₱{(planner.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Permit Status Distribution */}
        {permitStatusData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Permit Status</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={permitStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {permitStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {permitStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Overview */}
        {complianceMetrics.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h3>
            <div className="space-y-4">
              {complianceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{metric.category}</span>
                    <span className="text-sm text-gray-500">{metric.compliant}/{metric.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metric.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      metric.percentage >= 90 ? 'text-green-600' :
                      metric.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.percentage}% compliant
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Regional Performance */}
      {regionalData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'revenue' ? `₱${(Number(value) / 1000000).toFixed(1)}M` : value,
                  name === 'revenue' ? 'Revenue' : name === 'planners' ? 'Planners' : 'Bookings'
                ]}
              />
              <Bar yAxisId="left" dataKey="planners" fill="#8b5cf6" />
              <Bar yAxisId="left" dataKey="bookings" fill="#06b6d4" />
              <Bar yAxisId="right" dataKey="revenue" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* System Alerts */}
      {recentAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Alerts</h3>
          <div className="space-y-4">
            {recentAlerts.map((alert) => {
              const IconComponent = getSeverityIcon(alert.severity);
              return (
                <div key={alert.id} className={`flex items-start p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <IconComponent className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm opacity-75 mt-1">{new Date(alert.timestamp).toLocaleDateString()}</p>
                  </div>
                  <button className="text-sm font-medium hover:underline">
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminReports;