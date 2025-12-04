// controllers/statsController.js
import {
  getClientBookingStats,
  getClientPaymentStats,
  getClientRecentBookings,
  getClientNextEvent,
  getClientMonthlyTrend,
  getPlannerBookingStats,
  getPlannerRecentBookings,
  getPlannerRevenueStats,
  getSystemStats,
  getAdminMonthlyTrends,
  getRevenueStats,
  // Reports functions
  getMonthlyPerformanceData,
  getTopPerformingPlanners,
  getPermitStatusData,
  getComplianceMetrics,
  getRegionalPerformanceData,
  getSystemAlerts,
  getEnhancedFinancialMetrics,
  // Additional Analytics functions
  getPaymentAnalytics,
  getPackageAnalytics,
  getBookingAnalytics,
  getFeedbackAnalytics,
  getPermitProcessingAnalytics,
  getUserEngagementAnalytics,
  getAvailabilityAnalytics
} from "../models/statsModel.js";

/* =======================
   CLIENT STATS
======================= */

// Get client dashboard stats
export const getClientStats = async (req, res) => {
  try {
    const clientId = req.user?.userId;
    
    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is a client
    if (req.user?.role !== 'client') {
      return res.status(403).json({ message: "Access denied. Client role required." });
    }

    console.log('📊 Getting stats for client:', clientId);

    // Get all client stats using model functions
    const [
      bookingStats,
      paymentStats,
      recentBookings,
      nextEvent,
      monthlyTrend
    ] = await Promise.all([
      getClientBookingStats(clientId),
      getClientPaymentStats(clientId),
      getClientRecentBookings(clientId, 5),
      getClientNextEvent(clientId),
      getClientMonthlyTrend(clientId, 6)
    ]);

    const stats = {
      // Overview stats
      overview: {
        total_bookings: bookingStats.total_bookings,
        pending_bookings: bookingStats.pending_bookings,
        confirmed_bookings: bookingStats.confirmed_bookings,
        completed_bookings: bookingStats.completed_bookings,
        cancelled_bookings: bookingStats.cancelled_bookings,
        upcoming_bookings: bookingStats.upcoming_bookings,
        future_bookings: bookingStats.future_bookings
      },
      
      // Payment summary
      payments: {
        total_payments: paymentStats.total_payments,
        verified_payments: paymentStats.verified_payments,
        pending_payments: paymentStats.pending_payments,
        total_paid: parseFloat(paymentStats.total_paid || 0),
        total_payment_amount: parseFloat(paymentStats.total_payment_amount || 0)
      },
      
      // Recent activity
      recent_bookings: recentBookings,
      
      // Next event
      next_event: nextEvent,
      
      // Monthly trend
      monthly_trend: monthlyTrend
    };

    console.log('📊 Client stats generated successfully');

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error getting client stats:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   PLANNER STATS
======================= */

// Get planner dashboard stats
export const getPlannerStats = async (req, res) => {
  try {
    const plannerId = req.user?.userId;
    
    if (!plannerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is a planner
    if (req.user?.role !== 'planner') {
      return res.status(403).json({ message: "Access denied. Planner role required." });
    }

    console.log('📊 Getting stats for planner:', plannerId);

    // Get all planner stats using model functions
    const [
      bookingStats,
      recentBookings,
      revenueStats
    ] = await Promise.all([
      getPlannerBookingStats(plannerId),
      getPlannerRecentBookings(plannerId, 5),
      getPlannerRevenueStats(plannerId)
    ]);

    const stats = {
      // Overview stats
      overview: {
        total_bookings: bookingStats.total_bookings,
        pending_bookings: bookingStats.pending_bookings,
        confirmed_bookings: bookingStats.confirmed_bookings,
        completed_bookings: bookingStats.completed_bookings,
        cancelled_bookings: bookingStats.cancelled_bookings,
        total_packages: bookingStats.total_packages,
        active_packages: bookingStats.active_packages,
        unique_clients: bookingStats.unique_clients
      },

      // Revenue stats
      revenue: revenueStats,

      // Recent activity
      recent_bookings: recentBookings
    };

    console.log('📊 Planner stats generated successfully');

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error getting planner stats:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   ADMIN STATS
======================= */

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is an admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting stats for admin:', userId);

    // Get all admin stats using model functions
    const [
      systemStats,
      monthlyTrends,
      revenueStats
    ] = await Promise.all([
      getSystemStats(),
      getAdminMonthlyTrends(6),
      getRevenueStats()
    ]);

    const stats = {
      // System overview
      system: {
        total_clients: systemStats.total_clients,
        total_planners: systemStats.total_planners,
        pending_planners: systemStats.pending_planners,
        approved_planners: systemStats.approved_planners,
        rejected_planners: systemStats.rejected_planners,
        total_bookings: systemStats.total_bookings,
        pending_bookings: systemStats.pending_bookings,
        confirmed_bookings: systemStats.confirmed_bookings,
        completed_bookings: systemStats.completed_bookings,
        active_packages: systemStats.active_packages,
        total_packages: systemStats.total_packages
      },

      // Revenue overview
      revenue: revenueStats,

      // Trends
      trends: {
        user_trend: monthlyTrends.user_trend,
        booking_trend: monthlyTrends.booking_trend
      }
    };

    console.log('📊 Admin stats generated successfully');

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error getting admin stats:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Enhanced Admin Stats - With additional analytics
export const getEnhancedAdminStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting enhanced stats for admin:', userId);

    // Get all admin stats including new analytics
    const [
      systemStats,
      monthlyTrends,
      revenueStats,
      paymentAnalytics,
      bookingAnalytics,
      feedbackAnalytics,
      engagementAnalytics
    ] = await Promise.all([
      getSystemStats(),
      getAdminMonthlyTrends(6),
      getRevenueStats(),
      getPaymentAnalytics(),
      getBookingAnalytics(),
      getFeedbackAnalytics(),
      getUserEngagementAnalytics()
    ]);

    const stats = {
      // Existing system overview
      system: {
        total_clients: systemStats.total_clients,
        total_planners: systemStats.total_planners,
        pending_planners: systemStats.pending_planners,
        approved_planners: systemStats.approved_planners,
        rejected_planners: systemStats.rejected_planners,
        total_bookings: systemStats.total_bookings,
        pending_bookings: systemStats.pending_bookings,
        confirmed_bookings: systemStats.confirmed_bookings,
        completed_bookings: systemStats.completed_bookings,
        active_packages: systemStats.active_packages,
        total_packages: systemStats.total_packages
      },

      // Existing revenue overview
      revenue: revenueStats,

      // Existing trends
      trends: {
        user_trend: monthlyTrends.user_trend,
        booking_trend: monthlyTrends.booking_trend
      },

      // NEW: Key Performance Indicators
      kpis: {
        payment_verification_rate: paymentAnalytics.overview.verification_rate,
        booking_confirmation_rate: bookingAnalytics.conversion_metrics.confirmation_rate,
        booking_cancellation_rate: bookingAnalytics.conversion_metrics.cancellation_rate,
        platform_avg_rating: feedbackAnalytics.overview.avg_rating,
        feedback_reply_rate: feedbackAnalytics.overview.reply_rate,
        client_booking_conversion: engagementAnalytics.client_engagement.booking_conversion_rate,
        planner_success_rate: engagementAnalytics.planner_engagement.booking_success_rate
      },

      // NEW: Quick insights for dashboard
      insights: {
        payment_health: paymentAnalytics.overview.verification_rate >= 85 ? 'healthy' : 'needs_attention',
        booking_performance: bookingAnalytics.conversion_metrics.confirmation_rate >= 70 ? 'healthy' : 'needs_attention',
        customer_satisfaction: feedbackAnalytics.overview.avg_rating >= 4.0 ? 'excellent' : 
                               feedbackAnalytics.overview.avg_rating >= 3.5 ? 'good' : 'needs_improvement',
        platform_growth: engagementAnalytics.user_overview.find(u => u.role === 'client')?.new_users_30d > 
                          engagementAnalytics.user_overview.find(u => u.role === 'client')?.new_users_7d * 4 ? 'growing' : 'stable'
      }
    };

    console.log('📊 Enhanced admin stats generated successfully');

    res.json({
      success: true,
      data: stats,
      metadata: {
        includes_analytics: true,
        data_freshness: 'real_time',
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting enhanced admin stats:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   ADMIN REPORTS CONTROLLERS
======================= */

// Get comprehensive admin reports data
export const getAdminReports = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is an admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { period = '6months', type = 'overview' } = req.query;
    
    // Parse period parameter
    let months = 6;
    switch (period) {
      case '3months': months = 3; break;
      case '6months': months = 6; break;
      case '1year': months = 12; break;
      case 'all': months = 24; break; // Cap at 2 years for performance
      default: months = 6;
    }

    console.log(`📊 Getting admin reports for period: ${period} (${months} months), type: ${type}`);

    // Get all reports data based on type
    let reportsData = {};

    if (type === 'overview' || type === 'all') {
      const [
        monthlyPerformance,
        topPlanners,
        permitStatus,
        systemAlerts,
        financialMetrics
      ] = await Promise.all([
        getMonthlyPerformanceData(months),
        getTopPerformingPlanners(5),
        getPermitStatusData(),
        getSystemAlerts(10),
        getEnhancedFinancialMetrics()
      ]);

      reportsData.overview = {
        monthly_performance: monthlyPerformance,
        top_planners: topPlanners,
        permit_status: permitStatus,
        system_alerts: systemAlerts,
        financial_metrics: financialMetrics
      };
    }

    if (type === 'compliance' || type === 'all') {
      const [
        complianceMetrics,
        permitStatus
      ] = await Promise.all([
        getComplianceMetrics(),
        getPermitStatusData()
      ]);

      reportsData.compliance = {
        metrics: complianceMetrics,
        permit_distribution: permitStatus
      };
    }

    if (type === 'regional' || type === 'all') {
      const regionalData = await getRegionalPerformanceData();
      reportsData.regional = {
        performance: regionalData
      };
    }

    if (type === 'financial' || type === 'all') {
      const [
        financialMetrics,
        monthlyPerformance
      ] = await Promise.all([
        getEnhancedFinancialMetrics(),
        getMonthlyPerformanceData(months)
      ]);

      reportsData.financial = {
        metrics: financialMetrics,
        trends: monthlyPerformance
      };
    }

    console.log('📊 Admin reports generated successfully');

    res.json({
      success: true,
      data: reportsData,
      metadata: {
        period,
        type,
        months_included: months,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting admin reports:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get monthly performance data
export const getMonthlyPerformance = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { months = 6 } = req.query;
    const monthsNum = parseInt(months) || 6;

    console.log(`📊 Getting monthly performance data for ${monthsNum} months`);

    const performanceData = await getMonthlyPerformanceData(monthsNum);

    res.json({
      success: true,
      data: performanceData,
      metadata: {
        months_requested: monthsNum,
        data_points: performanceData.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting monthly performance:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get top performing planners
export const getTopPlanners = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit) || 5;

    console.log(`📊 Getting top ${limitNum} performing planners`);

    const topPlanners = await getTopPerformingPlanners(limitNum);

    res.json({
      success: true,
      data: topPlanners,
      metadata: {
        limit: limitNum,
        total_returned: topPlanners.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting top planners:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get permit status distribution
export const getPermitStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting permit status distribution');

    const permitStatus = await getPermitStatusData();

    res.json({
      success: true,
      data: permitStatus,
      metadata: {
        total_planners: permitStatus.reduce((sum, item) => sum + item.value, 0)
      }
    });

  } catch (error) {
    console.error('❌ Error getting permit status:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get compliance metrics
export const getComplianceReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting compliance metrics');

    const complianceMetrics = await getComplianceMetrics();

    res.json({
      success: true,
      data: complianceMetrics,
      metadata: {
        categories_tracked: complianceMetrics.length,
        overall_compliance: Math.round(
          complianceMetrics.reduce((sum, metric) => sum + metric.percentage, 0) / complianceMetrics.length
        )
      }
    });

  } catch (error) {
    console.error('❌ Error getting compliance report:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get regional performance data
export const getRegionalReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting regional performance data');

    const regionalData = await getRegionalPerformanceData();

    res.json({
      success: true,
      data: regionalData,
      metadata: {
        regions_tracked: regionalData.length,
        total_revenue: regionalData.reduce((sum, region) => sum + region.revenue, 0),
        total_planners: regionalData.reduce((sum, region) => sum + region.planners, 0)
      }
    });

  } catch (error) {
    console.error('❌ Error getting regional report:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get system alerts
export const getSystemAlertsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit) || 10;

    console.log(`📊 Getting system alerts (limit: ${limitNum})`);

    const systemAlerts = await getSystemAlerts(limitNum);

    res.json({
      success: true,
      data: systemAlerts,
      metadata: {
        limit: limitNum,
        total_alerts: systemAlerts.length,
        alert_types: [...new Set(systemAlerts.map(alert => alert.type))],
        severity_breakdown: systemAlerts.reduce((acc, alert) => {
          acc[alert.severity] = (acc[alert.severity] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('❌ Error getting system alerts:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get enhanced financial metrics
export const getFinancialReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting enhanced financial metrics');

    const [financialMetrics, monthlyData] = await Promise.all([
      getEnhancedFinancialMetrics(),
      getMonthlyPerformanceData(12)
    ]);

    res.json({
      success: true,
      data: {
        metrics: financialMetrics,
        monthly_trends: monthlyData
      },
      metadata: {
        currency: 'PHP',
        includes_projections: false,
        data_period: '12_months'
      }
    });

  } catch (error) {
    console.error('❌ Error getting financial report:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   ADDITIONAL ADMIN ANALYTICS CONTROLLERS
======================= */

// Get payment processing analytics
export const getPaymentAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting payment analytics for admin:', userId);

    const paymentAnalytics = await getPaymentAnalytics();

    res.json({
      success: true,
      data: paymentAnalytics,
      metadata: {
        report_type: 'payment_analytics',
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting payment analytics:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get package analytics by category
export const getPackageAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting package analytics for admin:', userId);

    const packageAnalytics = await getPackageAnalytics();

    res.json({
      success: true,
      data: packageAnalytics,
      metadata: {
        report_type: 'package_analytics',
        categories_analyzed: packageAnalytics.category_performance.length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting package analytics:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get booking conversion and analytics
export const getBookingAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting booking analytics for admin:', userId);

    const bookingAnalytics = await getBookingAnalytics();

    res.json({
      success: true,
      data: bookingAnalytics,
      metadata: {
        report_type: 'booking_analytics',
        seasonal_months_analyzed: bookingAnalytics.seasonal_patterns.length,
        cancellation_reasons_found: bookingAnalytics.cancellation_reasons.length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting booking analytics:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get feedback and review analytics
export const getFeedbackAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting feedback analytics for admin:', userId);

    const feedbackAnalytics = await getFeedbackAnalytics();

    res.json({
      success: true,
      data: feedbackAnalytics,
      metadata: {
        report_type: 'feedback_analytics',
        total_feedback_analyzed: feedbackAnalytics.overview.total_feedback,
        avg_platform_rating: feedbackAnalytics.overview.avg_rating,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting feedback analytics:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get permit processing analytics
export const getPermitAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting permit processing analytics for admin:', userId);

    const permitAnalytics = await getPermitProcessingAnalytics();

    res.json({
      success: true,
      data: permitAnalytics,
      metadata: {
        report_type: 'permit_analytics',
        avg_processing_time: `${permitAnalytics.permit_overview.avg_processing_days} days`,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting permit analytics:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get user engagement analytics
export const getUserEngagementReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting user engagement analytics for admin:', userId);

    const engagementAnalytics = await getUserEngagementAnalytics();

    res.json({
      success: true,
      data: engagementAnalytics,
      metadata: {
        report_type: 'user_engagement',
        client_booking_conversion: `${engagementAnalytics.client_engagement.booking_conversion_rate}%`,
        planner_success_rate: `${engagementAnalytics.planner_engagement.booking_success_rate}%`,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting user engagement analytics:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get availability and slot utilization analytics
export const getAvailabilityAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting availability analytics for admin:', userId);

    const availabilityAnalytics = await getAvailabilityAnalytics();

    res.json({
      success: true,
      data: availabilityAnalytics,
      metadata: {
        report_type: 'availability_analytics',
        overall_utilization: `${availabilityAnalytics.slot_utilization.utilization_rate}%`,
        fully_booked_dates: availabilityAnalytics.slot_utilization.fully_booked_dates,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting availability analytics:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get comprehensive business intelligence dashboard
export const getBusinessIntelligenceDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    console.log('📊 Getting comprehensive business intelligence dashboard for admin:', userId);

    // Get all analytics in parallel for a comprehensive dashboard
    const [
      paymentAnalytics,
      packageAnalytics,
      bookingAnalytics,
      feedbackAnalytics,
      permitAnalytics,
      engagementAnalytics,
      availabilityAnalytics
    ] = await Promise.all([
      getPaymentAnalytics(),
      getPackageAnalytics(),
      getBookingAnalytics(),
      getFeedbackAnalytics(),
      getPermitProcessingAnalytics(),
      getUserEngagementAnalytics(),
      getAvailabilityAnalytics()
    ]);

    // Create summary insights
    const insights = {
      payment_health: {
        status: paymentAnalytics.overview.verification_rate >= 85 ? 'healthy' : 'needs_attention',
        verification_rate: paymentAnalytics.overview.verification_rate,
        pending_amount: paymentAnalytics.overview.pending_amount
      },
      booking_performance: {
        status: bookingAnalytics.conversion_metrics.confirmation_rate >= 70 ? 'healthy' : 'needs_attention',
        confirmation_rate: bookingAnalytics.conversion_metrics.confirmation_rate,
        cancellation_rate: bookingAnalytics.conversion_metrics.cancellation_rate
      },
      platform_satisfaction: {
        status: feedbackAnalytics.overview.avg_rating >= 4.0 ? 'excellent' : 
                feedbackAnalytics.overview.avg_rating >= 3.5 ? 'good' : 'needs_improvement',
        avg_rating: feedbackAnalytics.overview.avg_rating,
        reply_rate: feedbackAnalytics.overview.reply_rate
      },
      resource_utilization: {
        status: availabilityAnalytics.slot_utilization.utilization_rate >= 60 ? 'optimal' : 
                availabilityAnalytics.slot_utilization.utilization_rate >= 30 ? 'moderate' : 'underutilized',
        utilization_rate: availabilityAnalytics.slot_utilization.utilization_rate,
        fully_booked_dates: availabilityAnalytics.slot_utilization.fully_booked_dates
      }
    };

    res.json({
      success: true,
      data: {
        insights,
        payment_analytics: paymentAnalytics,
        package_analytics: packageAnalytics,
        booking_analytics: bookingAnalytics,
        feedback_analytics: feedbackAnalytics,
        permit_analytics: permitAnalytics,
        engagement_analytics: engagementAnalytics,
        availability_analytics: availabilityAnalytics
      },
      metadata: {
        report_type: 'business_intelligence_dashboard',
        generated_at: new Date().toISOString(),
        data_freshness: 'real_time'
      }
    });

  } catch (error) {
    console.error('❌ Error getting business intelligence dashboard:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};