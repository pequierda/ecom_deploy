import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar, Download, Filter, Eye } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useReports } from '../../hooks/useReports';
import { Link } from 'react-router-dom';

const PlannerReports = () => {
  const {
    data,
    filters,
    loading,
    error,
    averageRating,
    highRatingPercentage,
    hasData,
    hasRevenueData,
    hasPackageData,
    hasClientSatisfactionData,
    hasRecentBookings,
    handlePeriodChange,
    handleChartTypeChange,
    handleReportTypeChange,
    handleExport,
    handleRetry,
    getBookingStatusColor,
    getChartTitle
  } = useReports();

  if (loading && !hasData) {
    return (
      <DashboardLayout 
        title="Reports & Analytics"
        subtitle="Track your business performance and growth"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        title="Reports & Analytics"
        subtitle="Track your business performance and growth"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800">
            <h3 className="text-lg font-medium mb-2">Error Loading Reports</h3>
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Reports & Analytics"
      subtitle="Track your business performance and growth"
    >
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-wrap items-center space-x-4 mb-4 sm:mb-0">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.period}
              onChange={(e) => handlePeriodChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Chart View:</span>
            <select
              value={filters.chartType}
              onChange={(e) => handleChartTypeChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="24hours">24 Hours</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['overview', 'revenue', 'clients'].map((type) => (
              <button
                key={type}
                onClick={() => handleReportTypeChange(type as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${
                  filters.reportType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={handleExport}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {data.businessMetrics.map((metric, index) => (
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
                {metric.icon === 'DollarSign' && <DollarSign className={`w-6 h-6 ${metric.color}`} />}
                {metric.icon === 'Calendar' && <Calendar className={`w-6 h-6 ${metric.color}`} />}
                {metric.icon === 'Users' && <Users className={`w-6 h-6 ${metric.color}`} />}
                {metric.icon === 'TrendingUp' && <TrendingUp className={`w-6 h-6 ${metric.color}`} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{getChartTitle()}</h3>
          {hasRevenueData ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₱${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]}
                />
                <Bar yAxisId="right" dataKey="bookings" fill="#ec4899" />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No revenue data available for this period
            </div>
          )}
        </div>

        {/* Package Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Performance</h3>
          {hasPackageData ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.packagePerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {data.packagePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.packagePerformance.map((package_, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: package_.color }}></div>
                      <span className="text-gray-600">{package_.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{package_.bookings} bookings</span>
                      <br />
                      <span className="text-gray-500">₱{package_.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No package performance data available
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Satisfaction */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Satisfaction</h3>
          <div className="space-y-4">
            {data.clientSatisfaction.map((rating, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-16">{rating.rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${rating.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{rating.count}</span>
                  <span className="text-sm text-gray-500 ml-1">({rating.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
          {hasClientSatisfactionData && averageRating > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Average Rating: {averageRating}/5
                  </p>
                  <p className="text-sm text-green-700">
                    {highRatingPercentage}% of clients rate your services 4+ stars
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {hasRecentBookings ? (
              data.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{booking.client}</h4>
                    <p className="text-sm text-gray-600">{booking.package}</p>
                    <p className="text-sm text-gray-500">
                      Wedding: {new Date(booking.weddingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getBookingStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent bookings
              </div>
            )}
          </div>
          
          {hasRecentBookings && (
            <div className="mt-4 text-center">
              <Link to="/planner/bookings" className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium">
                <Eye className="w-4 h-4 mr-1" />
                View All Bookings
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Total Revenue</p>
              <p className="text-2xl font-bold">
                {data.businessMetrics?.[0]?.value || '₱0'}
              </p>
              <p className="text-pink-100">All time</p>
            </div>
            <DollarSign className="w-8 h-8 text-pink-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Bookings</p>
              <p className="text-2xl font-bold">
                {data.businessMetrics?.[1]?.value || '0'}
              </p>
              <p className="text-blue-100">All bookings</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Clients</p>
              <p className="text-2xl font-bold">
                {data.businessMetrics?.[2]?.value || '0'}
              </p>
              <p className="text-green-100">Total clients</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlannerReports;