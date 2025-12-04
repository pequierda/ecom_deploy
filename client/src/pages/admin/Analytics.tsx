// pages/admin/Analytics.tsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, Activity, MapPin, Star, Clock, Download, Filter } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const AdminAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1year');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Sample analytics data
  const platformGrowth = [
    { month: 'Jan', users: 1200, planners: 45, bookings: 89, revenue: 1250000 },
    { month: 'Feb', users: 1450, planners: 52, bookings: 112, revenue: 1580000 },
    { month: 'Mar', users: 1680, planners: 58, bookings: 134, revenue: 1890000 },
    { month: 'Apr', users: 1920, planners: 65, bookings: 156, revenue: 2150000 },
    { month: 'May', users: 2180, planners: 71, bookings: 178, revenue: 2420000 },
    { month: 'Jun', users: 2450, planners: 78, bookings: 201, revenue: 2680000 },
    { month: 'Jul', users: 2720, planners: 84, bookings: 224, revenue: 2950000 },
    { month: 'Aug', users: 3000, planners: 91, bookings: 247, revenue: 3220000 },
    { month: 'Sep', users: 3280, planners: 98, bookings: 270, revenue: 3490000 },
    { month: 'Oct', users: 3560, planners: 105, bookings: 293, revenue: 3760000 },
    { month: 'Nov', users: 3840, planners: 112, bookings: 316, revenue: 4030000 },
    { month: 'Dec', users: 4120, planners: 119, bookings: 339, revenue: 4300000 }
  ];

  const userAcquisition = [
    { source: 'Organic Search', users: 1850, percentage: 45 },
    { source: 'Social Media', users: 1230, percentage: 30 },
    { source: 'Direct', users: 615, percentage: 15 },
    { source: 'Referrals', users: 410, percentage: 10 }
  ];

  const topPerformingPlanners = [
    { name: 'Creative Events PH', bookings: 45, revenue: 3750000, rating: 4.9, growth: '+28%' },
    { name: 'Seaside Weddings Co.', bookings: 38, revenue: 2470000, rating: 4.8, growth: '+22%' },
    { name: 'Mountain View Events', bookings: 32, revenue: 3840000, rating: 4.9, growth: '+35%' },
    { name: 'Elegant Occasions', bookings: 28, revenue: 1960000, rating: 4.7, growth: '+18%' },
    { name: 'Garden Paradise', bookings: 25, revenue: 1875000, rating: 4.6, growth: '+15%' }
  ];

  const regionalDistribution = [
    { region: 'Metro Manila', planners: 45, bookings: 156, revenue: 12500000, color: '#ec4899' },
    { region: 'Calabarzon', planners: 28, bookings: 98, revenue: 7200000, color: '#8b5cf6' },
    { region: 'Central Luzon', planners: 18, bookings: 67, revenue: 4800000, color: '#06b6d4' },
    { region: 'Bicol', planners: 12, bookings: 45, revenue: 3200000, color: '#10b981' },
    { region: 'Visayas', planners: 15, bookings: 52, revenue: 3900000, color: '#f59e0b' },
    { region: 'Mindanao', planners: 9, bookings: 28, revenue: 2100000, color: '#ef4444' }
  ];

  const popularPackages = [
    { name: 'Premium Wedding', bookings: 89, avgPrice: 125000, satisfaction: 4.8 },
    { name: 'Garden Wedding', bookings: 67, avgPrice: 85000, satisfaction: 4.7 },
    { name: 'Intimate Ceremony', bookings: 54, avgPrice: 65000, satisfaction: 4.6 },
    { name: 'Destination Wedding', bookings: 32, avgPrice: 180000, satisfaction: 4.9 },
    { name: 'Beach Wedding', bookings: 28, avgPrice: 95000, satisfaction: 4.5 }
  ];

  const userEngagement = [
    { metric: 'Daily Active Users', value: '2,840', change: '+12%', trend: 'up' },
    { metric: 'Session Duration', value: '8.5 min', change: '+5%', trend: 'up' },
    { metric: 'Page Views per Session', value: '4.2', change: '+8%', trend: 'up' },
    { metric: 'Bounce Rate', value: '32%', change: '-3%', trend: 'down' }
  ];

  const conversionFunnel = [
    { stage: 'Visitors', count: 12500, percentage: 100 },
    { stage: 'Registered Users', count: 4120, percentage: 33 },
    { stage: 'Service Browsers', count: 2890, percentage: 23 },
    { stage: 'Inquiries Made', count: 1450, percentage: 12 },
    { stage: 'Bookings Completed', count: 339, percentage: 3 }
  ];

  const keyMetrics = [
    {
      title: 'Total Platform Revenue',
      value: '₱33.7M',
      change: '+24%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '4,120',
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Bookings',
      value: '339',
      change: '+22%',
      trend: 'up',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Platform Engagement',
      value: '89%',
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'text-pink-600'
    }
  ];

  return (
    <DashboardLayout 
      title="Platform Analytics"
      subtitle="Comprehensive insights into platform performance and user behavior"
    >
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
              <option value="1month">Last month</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
            </select>
          </div>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Metrics</option>
            <option value="revenue">Revenue Focus</option>
            <option value="users">User Focus</option>
            <option value="bookings">Booking Focus</option>
          </select>
        </div>
        
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`w-4 h-4 mr-1 ${metric.color}`} />
                  <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Platform Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={platformGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₱${(value as number / 1000000).toFixed(1)}M` : value,
                  name === 'revenue' ? 'Revenue' : 
                  name === 'users' ? 'Users' : 
                  name === 'planners' ? 'Planners' : 'Bookings'
                ]}
              />
              <Area yAxisId="left" type="monotone" dataKey="users" fill="#8b5cf6" fillOpacity={0.6} />
              <Bar yAxisId="right" dataKey="bookings" fill="#ec4899" />
              <Line yAxisId="left" type="monotone" dataKey="planners" stroke="#10b981" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* User Acquisition Sources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Acquisition Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userAcquisition}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="users"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {userAcquisition.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Users']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{stage.count.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 ml-2">({stage.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stage.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Performing Planners */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Planners</h3>
          <div className="space-y-4">
            {topPerformingPlanners.map((planner, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{planner.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{planner.bookings} bookings</span>
                    <span>★ {planner.rating}</span>
                    <span className="text-green-600 font-medium">{planner.growth}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₱{(planner.revenue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
          <div className="space-y-4">
            {userEngagement.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{metric.metric}</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                  <p className="text-sm text-gray-500">vs last period</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionalDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `₱${(value as number / 1000000).toFixed(1)}M` : value,
                name === 'revenue' ? 'Revenue' : name === 'planners' ? 'Planners' : 'Bookings'
              ]}
            />
            <Bar yAxisId="left" dataKey="planners" fill="#8b5cf6" />
            <Bar yAxisId="left" dataKey="bookings" fill="#06b6d4" />
            <Bar yAxisId="right" dataKey="revenue" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Package Types */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Package Types</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Share
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {popularPackages.map((pkg, index) => {
                const totalBookings = popularPackages.reduce((sum, p) => sum + p.bookings, 0);
                const marketShare = ((pkg.bookings / totalBookings) * 100).toFixed(1);
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pkg.bookings}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₱{pkg.avgPrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-900">{pkg.satisfaction}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-pink-600 h-2 rounded-full"
                            style={{ width: `${marketShare}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{marketShare}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Platform Growth Rate</p>
              <p className="text-3xl font-bold">+24%</p>
              <p className="text-pink-100">Year over year</p>
            </div>
            <TrendingUp className="w-10 h-10 text-pink-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">User Satisfaction</p>
              <p className="text-3xl font-bold">4.7★</p>
              <p className="text-blue-100">Average rating</p>
            </div>
            <Star className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Market Penetration</p>
              <p className="text-3xl font-bold">67%</p>
              <p className="text-green-100">In target regions</p>
            </div>
            <MapPin className="w-10 h-10 text-green-200" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;