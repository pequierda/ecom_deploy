import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import DashboardLayout from "../components/DashboardLayout";

const BPLOAdminDashboard = () => {
  const { user, isAuthenticated, getFullName } = useAuthStore();

  type StatsDataType = {
    system?: { total_planners?: number; approved_planners?: number; pending_planners?: number };
    revenue?: { total_revenue?: number };
    kpis?: { payment_verification_rate?: number; booking_confirmation_rate?: number; platform_avg_rating?: number };
    insights?: { payment_health?: string; booking_performance?: string; customer_satisfaction?: string; platform_growth?: string };
    metadata?: { generated_at?: string };
  };

  type AnalyticsDataType = { user_overview?: Array<{ role: string; new_users_30d?: number }> };
  type PermitDataType = { permit_overview?: { pending_permits?: number; avg_processing_days?: number; approved_permits?: number; rejected_permits?: number } };
  type FeedbackDataType = { overview?: { total_feedback?: number } };
  type SystemAlertType = { id: string | number; message: string; severity: string; timestamp: string };

  const [statsData, setStatsData] = useState<StatsDataType | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDataType | null>(null);
  const [permitData, setPermitData] = useState<PermitDataType | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackDataType | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api";

  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout title="Access Denied">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-500">Please log in to access the admin dashboard.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (user.role !== "admin") {
    return (
      <DashboardLayout title="Access Denied">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-500">You don't have permission to access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const headers = { "Content-Type": "application/json" };
      const [statsResponse, analyticsResponse, permitResponse, feedbackResponse, alertsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/stats/admin/enhanced`, { headers, credentials: "include" }),
        fetch(`${API_BASE_URL}/stats/admin/analytics/engagement`, { headers, credentials: "include" }),
        fetch(`${API_BASE_URL}/stats/admin/analytics/permits`, { headers, credentials: "include" }),
        fetch(`${API_BASE_URL}/stats/admin/analytics/feedback`, { headers, credentials: "include" }),
        fetch(`${API_BASE_URL}/stats/admin/reports/alerts?limit=5`, { headers, credentials: "include" }),
      ]);

      if (!statsResponse.ok) throw new Error(`Failed to fetch stats data (${statsResponse.status})`);
      if (!analyticsResponse.ok) throw new Error(`Failed to fetch analytics data (${analyticsResponse.status})`);
      if (!permitResponse.ok) throw new Error(`Failed to fetch permit data (${permitResponse.status})`);
      if (!feedbackResponse.ok) throw new Error(`Failed to fetch feedback data (${feedbackResponse.status})`);
      if (!alertsResponse.ok) throw new Error(`Failed to fetch alerts data (${alertsResponse.status})`);

      const [stats, analytics, permits, feedback, alerts] = await Promise.all([
        statsResponse.json(),
        analyticsResponse.json(),
        permitResponse.json(),
        feedbackResponse.json(),
        alertsResponse.json(),
      ]);

      setStatsData(stats.data);
      setAnalyticsData(analytics.data);
      setPermitData(permits.data);
      setFeedbackData(feedback.data);
      setSystemAlerts(alerts.data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") fetchDashboardData();
  }, [isAuthenticated, user]);

  const formatCurrency = (amount: number | undefined) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount || 0);

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-yellow-100 text-yellow-800";
      case "needs_attention":
        return "bg-red-100 text-red-800";
      case "growing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading Dashboard...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center text-gray-500 text-base">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading dashboard data...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard Error">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <h3 className="text-red-800 font-bold mb-2">Failed to load dashboard</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg text-white ${refreshing ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
          >
            {refreshing ? "Retrying..." : "Try Again"}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      name: "Total Planners",
      value: statsData?.system?.total_planners || 0,
      color: "bg-blue-500",
      subtitle: `${statsData?.system?.approved_planners || 0} approved`,
    },
    {
      name: "Pending Permits",
      value: permitData?.permit_overview?.pending_permits || 0,
      color: "bg-yellow-500",
      subtitle: `Avg: ${permitData?.permit_overview?.avg_processing_days || 0} days`,
    },
    {
      name: "Platform Rating",
      value: statsData?.kpis?.platform_avg_rating?.toFixed(1) || "0.0",
      color: "bg-purple-600",
      subtitle: `${feedbackData?.overview?.total_feedback || 0} reviews`,
    },
  ];

  const insights = [
    {
      title: "Payment Health",
      status: statsData?.insights?.payment_health || "unknown",
      value: `${statsData?.kpis?.payment_verification_rate || 0}%`,
      description: "Payment verification rate",
    },
    {
      title: "Booking Performance",
      status: statsData?.insights?.booking_performance || "unknown",
      value: `${statsData?.kpis?.booking_confirmation_rate || 0}%`,
      description: "Booking confirmation rate",
    },
    {
      title: "Customer Satisfaction",
      status: statsData?.insights?.customer_satisfaction || "unknown",
      value: `${statsData?.kpis?.platform_avg_rating?.toFixed(1) || 0}/5`,
      description: "Average platform rating",
    },
    {
      title: "Platform Growth",
      status: statsData?.insights?.platform_growth || "unknown",
      value: `${analyticsData?.user_overview?.find((u) => u.role === "client")?.new_users_30d || 0}`,
      description: "New clients (30 days)",
    },
  ];

  return (
    <DashboardLayout
      title={`Welcome, ${getFullName() || "Admin"}!`}
      subtitle={`System overview: ${statsData?.system?.pending_planners || 0} pending registrations and ${permitData?.permit_overview?.pending_permits || 0} permits awaiting review.`}
    >
      {/* Refresh Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center px-5 py-3 rounded-lg text-white text-sm font-medium transition-colors ${
            refreshing ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          <span className={`mr-2 ${refreshing ? "animate-spin" : ""}`}>🔄</span>
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Data freshness indicator */}
      {statsData && (
        <div className="mb-6 text-sm text-gray-500">
          Dashboard data last updated: {new Date().toLocaleString()}
          {statsData.metadata && (
            <span className="ml-2 opacity-70">
              • Generated at: {statsData.metadata.generated_at ? new Date(statsData.metadata.generated_at).toLocaleString() : "N/A"}
            </span>
          )}
        </div>
      )}

      {/* System Overview Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow p-6 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Performance Insights */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Insights</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight, index) => {
            const colorClass = getStatusColor(insight.status);
            return (
              <div key={index} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{insight.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      colorClass === "bg-green-100 text-green-800"
                        ? "bg-green-100 text-green-800"
                        : colorClass === "bg-yellow-100 text-yellow-800"
                        ? "bg-yellow-100 text-yellow-800"
                        : colorClass === "bg-red-100 text-red-800"
                        ? "bg-red-100 text-red-800"
                        : colorClass === "bg-blue-100 text-blue-800"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {insight.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</p>
                <p className="text-xs text-gray-500">{insight.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permit Processing Overview */}
      <div className="mb-8 bg-white rounded-xl shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📋</span> Permit Processing Status
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Avg Processing: {permitData?.permit_overview?.avg_processing_days || 0} days</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              {permitData?.permit_overview?.pending_permits || 0} Pending
            </span>
          </div>
        </div>
        <div className="p-6 grid gap-6 sm:grid-cols-3 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">{permitData?.permit_overview?.approved_permits || 0}</div>
            <div className="text-sm text-gray-500">Approved Permits</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-600">{permitData?.permit_overview?.pending_permits || 0}</div>
            <div className="text-sm text-gray-500">Pending Review</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600">{permitData?.permit_overview?.rejected_permits || 0}</div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>
        <div className="text-center p-6">
          <button className="inline-flex items-center text-pink-500 font-medium hover:underline">
            View all permit applications <span className="ml-2">→</span>
          </button>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="mb-8 bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🔔</span> System Alerts
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {systemAlerts.map((alert) => {
              const severityColors =
                alert.severity === "warning"
                  ? "bg-yellow-100 text-yellow-800"
                  : alert.severity === "high"
                  ? "bg-red-100 text-red-800"
                  : alert.severity === "positive"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800";
              return (
                <div key={alert.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      alert.severity === "warning"
                        ? "bg-yellow-500"
                        : alert.severity === "high"
                        ? "bg-red-500"
                        : alert.severity === "positive"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{alert.message}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors}`}>{alert.severity}</span>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="text-center">
              <button className="inline-flex items-center text-pink-500 font-medium hover:underline">
                View all system alerts <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BPLOAdminDashboard;
