import pool from "../config/db.js";
import { 
  getBusinessMetrics, 
  getRevenueData, 
  getPackagePerformance, 
  getClientSatisfaction, 
  getRecentBookings,
  getUpcomingPayments,
  getSummaryMetrics 
} from "../models/reportsModel.js";

// Get planner dashboard reports data
export const getPlannerReports = async (req, res) => {
  try {
    const { period = '6months', chartType = 'monthly' } = req.query;
    const plannerId = req.user.userId || req.user.user_id;
    
    console.log('🔍 Planner ID:', plannerId, 'Chart Type:', chartType, 'Period:', period);
    
    // Calculate date range based on period
    let startDate = new Date();
    switch(period) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }
    
    console.log('🔍 Start date:', startDate.toISOString().split('T')[0]);
    
    // Use model functions to get data
    const [
      businessMetrics,
      revenueData,
      packagePerformance,
      clientSatisfaction,
      recentBookings,
      upcomingPayments,
      summaryMetrics
    ] = await Promise.all([
      getBusinessMetrics(plannerId, startDate),
      getRevenueData(plannerId, startDate, chartType),
      getPackagePerformance(plannerId, startDate),
      getClientSatisfaction(plannerId),
      getRecentBookings(plannerId),
      getUpcomingPayments(plannerId),
      getSummaryMetrics(plannerId, startDate)
    ]);

    console.log('✅ All data fetched successfully');
    console.log('📊 Revenue data rows:', revenueData.length);

    res.json({
      businessMetrics,
      revenueData,
      packagePerformance,
      clientSatisfaction,
      recentBookings,
      upcomingPayments,
      summaryMetrics,
      chartType
    });

  } catch (error) {
    console.error('Error fetching planner reports:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reports', 
      error: error.message 
    });
  }
};

// Get admin dashboard reports data
export const getAdminReports = async (req, res) => {
  try {
    // Implement admin-specific reports here
    res.json({ message: 'Admin reports endpoint' });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    res.status(500).json({ 
      message: 'Failed to fetch admin reports', 
      error: error.message 
    });
  }
};

// Get client dashboard reports data
export const getClientReports = async (req, res) => {
  try {
    // Implement client-specific reports here
    res.json({ message: 'Client reports endpoint' });
  } catch (error) {
    console.error('Error fetching client reports:', error);
    res.status(500).json({ 
      message: 'Failed to fetch client reports', 
      error: error.message 
    });
  }
};

export default {
  getPlannerReports,
  getAdminReports,
  getClientReports
};