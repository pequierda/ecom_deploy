import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Star,
  CheckCircle,
  Clock,
  X,
  Package,
  DollarSign,
  Award,
  AlertTriangle,
  Users,
  RefreshCw,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import { useAuthStore } from "../stores/authStore";
import { usePlannerStats } from "../hooks/usePlannerStats";

// Type definitions
interface PlannerStats {
  overview?: {
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_packages: number;
    active_packages: number;
    unique_clients: number;
  };
  revenue?: {
    total_revenue: number;
    average_booking_value: number;
    verified_payments: number;
  };
  recent_bookings?: Array<{
    booking_id: number;
    wedding_date: string;
    wedding_time: string;
    venue: string;
    status: string;
    package_title: string;
    package_price: number;
    client_name: string;
    client_email: string;
    created_at: string;
    formatted_booking_id: string;
  }>;
}

interface StatCard {
  name: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  hoverColor: string;
}

// User type definition to fix 'never' type error
interface User {
  role: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  [key: string]: any;
}

const PlannerDashboard = () => {
  const { user } = useAuthStore() as { user: User | null };
  const navigate = useNavigate();
  const { stats, loading, error, refetch } = usePlannerStats() as {
    stats: PlannerStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };

  // Redirect if no user or not planner
  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'planner') {
    navigate('/client/dashboard');
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Error Loading Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">Failed to load dashboard data</h3>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Format currency with proper typing
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date with proper typing
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Prepare chart data
  const bookingStatusData = [
    { name: 'Pending', value: stats?.overview?.pending_bookings || 0, color: '#F59E0B' },
    { name: 'Confirmed', value: stats?.overview?.confirmed_bookings || 0, color: '#10B981' },
    { name: 'Completed', value: stats?.overview?.completed_bookings || 0, color: '#3B82F6' },
    { name: 'Cancelled', value: stats?.overview?.cancelled_bookings || 0, color: '#EF4444' },
  ];

  const businessMetricsData = [
    {
      name: 'Total Packages',
      value: stats?.overview?.total_packages || 0,
      color: '#8B5CF6'
    },
    {
      name: 'Active Packages',
      value: stats?.overview?.active_packages || 0,
      color: '#F59E0B'
    },
    {
      name: 'Unique Clients',
      value: stats?.overview?.unique_clients || 0,
      color: '#06B6D4'
    },
    {
      name: 'Verified Payments',
      value: stats?.revenue?.verified_payments || 0,
      color: '#10B981'
    }
  ];

  const revenueData = [
    {
      name: 'Total Revenue',
      amount: stats?.revenue?.total_revenue || 0,
      formatted: formatCurrency(stats?.revenue?.total_revenue || 0)
    },
    {
      name: 'Average Booking Value',
      amount: stats?.revenue?.average_booking_value || 0,
      formatted: formatCurrency(stats?.revenue?.average_booking_value || 0)
    }
  ];

  // Stats cards configuration using real data
  const statsCards: StatCard[] = [
    {
      name: "Total Bookings",
      value: stats?.overview?.total_bookings || 0,
      icon: Calendar,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      name: "Total Revenue",
      value: formatCurrency(stats?.revenue?.total_revenue || 0),
      icon: DollarSign,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      name: "Unique Clients",
      value: stats?.overview?.unique_clients || 0,
      icon: Users,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
    {
      name: "Active Packages",
      value: stats?.overview?.active_packages || 0,
      icon: Package,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ComponentType<any> }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Award },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get user display name - fix for the name property issue
  const getUserDisplayName = (): string => {
    if ('first_name' in user && 'last_name' in user) {
      return `${user.first_name} ${user.last_name}`;
    }
    if ('name' in user && user.name) {
      return user.name as string;
    }
    return 'User';
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom pie chart tooltip
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{`Value: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout 
      title={`Welcome, ${getUserDisplayName()}!`}
      subtitle={`You have ${stats?.overview?.pending_bookings || 0} pending bookings and ${stats?.overview?.completed_bookings || 0} completed bookings.`}
    >
      {/* Refresh Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={refetch}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
            Booking Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Metrics Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Business Metrics
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={businessMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                >
                  {businessMetricsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Revenue Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'Amount']}
                  labelStyle={{ color: '#374151' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Booking Status Summary */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats?.overview?.pending_bookings || 0}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.overview?.confirmed_bookings || 0}</div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.overview?.completed_bookings || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats?.overview?.cancelled_bookings || 0}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.overview?.total_packages || 0}</div>
              <div className="text-sm text-gray-600">Total Packages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Revenue Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.revenue?.total_revenue || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats?.revenue?.average_booking_value || 0)}
              </div>
              <div className="text-sm text-gray-600">Average Booking Value</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.revenue?.verified_payments || 0}
              </div>
              <div className="text-sm text-gray-600">Verified Payments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings - Using Real Data */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                Recent Bookings
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                {stats?.recent_bookings?.length || 0} Recent
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            {stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wedding Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recent_bookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.formatted_booking_id}</div>
                        <div className="text-xs text-gray-500">Created: {formatDate(booking.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.package_title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.client_name}</div>
                        <div className="text-xs text-gray-500">{booking.client_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(booking.wedding_date)}</div>
                        <div className="text-xs text-gray-500">{booking.wedding_time}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(booking.package_price)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent bookings</h3>
                <p className="mt-1 text-sm text-gray-500">Your recent bookings will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlannerDashboard;