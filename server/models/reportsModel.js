import pool from "../config/db.js";

// Get business metrics for planner dashboard
export const getBusinessMetrics = async (plannerId, startDate) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as total_revenue,
        COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.client_id END) as active_clients,
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) > 0 
          THEN COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) / COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END)
          ELSE 0 
        END as avg_package_value
      FROM bookings b
      JOIN package_services ps ON b.package_id = ps.package_id
      WHERE ps.planner_id = ? AND b.wedding_date >= ?
    `, [plannerId, startDate]);

    const metrics = results[0];

    // Get previous period for comparison (same duration before startDate)
    const periodDays = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    const [prevResults] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as total_revenue,
        COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.client_id END) as active_clients,
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) > 0 
          THEN COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) / COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END)
          ELSE 0 
        END as avg_package_value
      FROM bookings b
      JOIN package_services ps ON b.package_id = ps.package_id
      WHERE ps.planner_id = ? AND b.wedding_date >= ? AND b.wedding_date < ?
    `, [plannerId, prevStartDate, startDate]);

    const prevMetrics = prevResults[0];

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return (change >= 0 ? '+' : '') + Math.round(change) + '%';
    };

    return [
      {
        title: 'Total Revenue',
        value: `₱${Number(metrics.total_revenue).toLocaleString()}`,
        change: calculateChange(metrics.total_revenue, prevMetrics.total_revenue),
        trend: 'up',
        icon: 'DollarSign',
        color: 'text-green-600'
      },
      {
        title: 'Total Bookings',
        value: metrics.total_bookings.toString(),
        change: calculateChange(metrics.total_bookings, prevMetrics.total_bookings),
        trend: 'up',
        icon: 'Calendar',
        color: 'text-blue-600'
      },
      {
        title: 'Active Clients',
        value: metrics.active_clients.toString(),
        change: calculateChange(metrics.active_clients, prevMetrics.active_clients),
        trend: 'up',
        icon: 'Users',
        color: 'text-purple-600'
      },
      {
        title: 'Avg. Package Value',
        value: `₱${Number(metrics.avg_package_value).toLocaleString()}`,
        change: calculateChange(metrics.avg_package_value, prevMetrics.avg_package_value),
        trend: 'up',
        icon: 'TrendingUp',
        color: 'text-pink-600'
      }
    ];

  } catch (error) {
    console.error('Error getting business metrics:', error);
    throw error;
  }
};

// Get revenue data based on chart type (24h, weekly, monthly)
export const getRevenueData = async (plannerId, startDate, chartType = 'monthly') => {
  try {
    let params;

    switch(chartType) {
      case '24hours': {
        // Get data for all 24 hours
        const query = `
          SELECT 
            HOUR(b.created_at) as hour_num,
            COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as revenue,
            COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) as bookings
          FROM bookings b
          JOIN package_services ps ON b.package_id = ps.package_id
          WHERE ps.planner_id = ? AND b.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND b.status != 'cancelled'
          GROUP BY HOUR(b.created_at)
        `;
        params = [plannerId];
        
        const [hourlyResults] = await pool.execute(query, params);
        
        // Create complete 24-hour array
        const hourlyData = [];
        for (let hour = 0; hour < 24; hour++) {
          const found = hourlyResults.find(row => row.hour_num === hour);
          hourlyData.push({
            period: `${hour.toString().padStart(2, '0')}:00`,
            revenue: found ? Number(found.revenue) : 0,
            bookings: found ? Number(found.bookings) : 0
          });
        }
        return hourlyData;
      }

      case 'weekly': {
        const query = `
          SELECT 
            YEARWEEK(b.wedding_date, 1) as year_week,
            WEEK(b.wedding_date, 1) as week_num,
            YEAR(b.wedding_date) as year,
            COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as revenue,
            COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) as bookings
          FROM bookings b
          JOIN package_services ps ON b.package_id = ps.package_id
          WHERE ps.planner_id = ? AND b.wedding_date >= ? AND b.status != 'cancelled'
          GROUP BY YEARWEEK(b.wedding_date, 1)
          ORDER BY YEARWEEK(b.wedding_date, 1)
        `;
        params = [plannerId, startDate];
        
        const [weeklyResults] = await pool.execute(query, params);
        
        // Generate complete week range
        const weeklyData = [];
        const currentDate = new Date(startDate);
        const endDate = new Date();
        
        while (currentDate <= endDate) {
          const weekNum = getWeekNumber(currentDate);
          const yearWeek = `${currentDate.getFullYear()}${weekNum.toString().padStart(2, '0')}`;
          
          const found = weeklyResults.find(row => 
            row.year_week.toString() === `${currentDate.getFullYear()}${weekNum.toString().padStart(2, '0')}`
          );
          
          weeklyData.push({
            period: `Week ${weekNum}`,
            revenue: found ? Number(found.revenue) : 0,
            bookings: found ? Number(found.bookings) : 0
          });
          
          // Move to next week
          currentDate.setDate(currentDate.getDate() + 7);
          
          if (weeklyData.length >= 12) break; // Limit to 12 weeks
        }
        return weeklyData;
      }

      case 'monthly':
      default: {
        // Calculate complete months in the date range
        const query = `
          SELECT 
            YEAR(b.wedding_date) as year_num,
            MONTH(b.wedding_date) as month_num,
            COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as revenue,
            COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) as bookings
          FROM bookings b
          JOIN package_services ps ON b.package_id = ps.package_id
          WHERE ps.planner_id = ? AND b.wedding_date >= ? AND b.status != 'cancelled'
          GROUP BY YEAR(b.wedding_date), MONTH(b.wedding_date)
          ORDER BY YEAR(b.wedding_date), MONTH(b.wedding_date)
        `;
        params = [plannerId, startDate];
        
        const [monthlyResults] = await pool.execute(query, params);
        
        // Generate complete month range
        const monthlyData = [];
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        
        while (currentDate <= endDate) {
          const yearNum = currentDate.getFullYear();
          const monthNum = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
          const monthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          const found = monthlyResults.find(row => 
            row.year_num === yearNum && row.month_num === monthNum
          );
          
          monthlyData.push({
            period: monthName,
            revenue: found ? Number(found.revenue) : 0,
            bookings: found ? Number(found.bookings) : 0
          });
          
          // Move to next month
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return monthlyData;
      }
    }

  } catch (error) {
    console.error('Error getting revenue data:', error);
    throw error;
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Get package performance data
export const getPackagePerformance = async (plannerId, startDate) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        ps.title as name,
        COUNT(DISTINCT CASE WHEN b.status != 'cancelled' THEN b.booking_id END) as bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as revenue
      FROM package_services ps
      LEFT JOIN bookings b ON ps.package_id = b.package_id AND b.created_at >= ?
      WHERE ps.planner_id = ?
      GROUP BY ps.package_id, ps.title
      HAVING bookings > 0 OR revenue > 0
      ORDER BY revenue DESC
      LIMIT 10
    `, [startDate, plannerId]);

    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#84cc16', '#6366f1', '#f97316', '#14b8a6'];

    return results.map((row, index) => ({
      name: row.name,
      bookings: Number(row.bookings),
      revenue: Number(row.revenue),
      color: colors[index % colors.length]
    }));

  } catch (error) {
    console.error('Error getting package performance:', error);
    throw error;
  }
};

// Get client satisfaction data
export const getClientSatisfaction = async (plannerId) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        f.rating,
        COUNT(*) as count
      FROM feedback f
      JOIN bookings b ON f.booking_id = b.booking_id
      JOIN package_services ps ON b.package_id = ps.package_id
      WHERE ps.planner_id = ?
      GROUP BY f.rating
      ORDER BY f.rating DESC
    `, [plannerId]);

    const totalReviews = results.reduce((sum, row) => sum + Number(row.count), 0);

    const satisfactionData = [
      { rating: '5 Stars', count: 0, percentage: 0 },
      { rating: '4 Stars', count: 0, percentage: 0 },
      { rating: '3 Stars', count: 0, percentage: 0 },
      { rating: '2 Stars', count: 0, percentage: 0 },
      { rating: '1 Star', count: 0, percentage: 0 }
    ];

    results.forEach(row => {
      const index = 5 - row.rating; // Convert rating to array index (5 stars = index 0)
      satisfactionData[index].count = Number(row.count);
      satisfactionData[index].percentage = totalReviews > 0 ? Math.round((row.count / totalReviews) * 100) : 0;
    });

    return satisfactionData;

  } catch (error) {
    console.error('Error getting client satisfaction:', error);
    throw error;
  }
};

// Get recent bookings for the planner
export const getRecentBookings = async (plannerId) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        b.booking_id,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        ps.title as package_name,
        b.wedding_date,
        b.status,
        b.created_at
      FROM bookings b
      JOIN package_services ps ON b.package_id = ps.package_id
      JOIN clients c ON b.client_id = c.client_id
      JOIN users u ON c.client_id = u.user_id
      WHERE ps.planner_id = ?
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [plannerId]);

    return results.map(row => ({
      id: row.booking_id,
      client: row.client_name,
      package: row.package_name,
      weddingDate: row.wedding_date.toISOString().split('T')[0],
      status: row.status,
      createdAt: row.created_at
    }));

  } catch (error) {
    console.error('Error getting recent bookings:', error);
    throw error;
  }
};

// Get upcoming payments for the planner
export const getUpcomingPayments = async (plannerId) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        b.booking_id as id,
        CONCAT(u.first_name, ' & ', u.last_name) as client,
        ps.title as package,
        CONCAT('₱', FORMAT(ps.price * 0.5, 0)) as amount,
        DATE_ADD(b.created_at, INTERVAL 30 DAY) as dueDate,
        CASE 
          WHEN p.status = 'pending' THEN 'pending'
          WHEN DATE_ADD(b.created_at, INTERVAL 30 DAY) < NOW() THEN 'overdue'
          ELSE 'pending'
        END as status
      FROM bookings b
      JOIN package_services ps ON b.package_id = ps.package_id
      JOIN clients c ON b.client_id = c.client_id
      JOIN users u ON c.client_id = u.user_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      WHERE ps.planner_id = ? 
        AND b.status IN ('pending', 'confirmed')
        AND (p.status IS NULL OR p.status = 'pending')
      ORDER BY DATE_ADD(b.created_at, INTERVAL 30 DAY) ASC
      LIMIT 10
    `, [plannerId]);

    return results.map(row => ({
      id: row.id,
      client: row.client,
      package: row.package,
      amount: row.amount,
      dueDate: row.dueDate.toISOString().split('T')[0],
      status: row.status
    }));

  } catch (error) {
    console.error('Error getting upcoming payments:', error);
    throw error;
  }
};

// Get summary metrics
export const getSummaryMetrics = async (plannerId, startDate) => {
  try {
    // Get current month data based on wedding dates
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month

    const [monthlyStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as monthly_revenue
      FROM bookings b
      JOIN package_services ps ON b.package_id = ps.package_id
      WHERE ps.planner_id = ? AND b.wedding_date >= ?
    `, [plannerId, currentMonth]);

    // Get completion rate based on wedding dates
    const [completionStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as total
      FROM bookings b
      JOIN package_services ps ON b.package_id = ps.package_id
      WHERE ps.planner_id = ? AND b.wedding_date >= ?
    `, [plannerId, startDate]);

    // Get retention rate (clients with multiple bookings) based on wedding dates
    const [retentionStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN booking_count > 1 THEN 1 END) as repeat_clients,
        COUNT(*) as total_clients
      FROM (
        SELECT 
          b.client_id,
          COUNT(*) as booking_count
        FROM bookings b
        JOIN package_services ps ON b.package_id = ps.package_id
        WHERE ps.planner_id = ? AND b.status != 'cancelled' AND b.wedding_date >= ?
        GROUP BY b.client_id
      ) client_bookings
    `, [plannerId, startDate]);

    const monthlyRevenue = Number(monthlyStats[0].monthly_revenue);
    const completionRate = completionStats[0].total > 0 ? 
      Math.round((completionStats[0].completed / completionStats[0].total) * 100) : 0;
    const retentionRate = retentionStats[0].total_clients > 0 ? 
      Math.round((retentionStats[0].repeat_clients / retentionStats[0].total_clients) * 100) : 0;

    return {
      monthlyRevenue: `₱${monthlyRevenue.toLocaleString()}`,
      monthlyGrowth: '+45%', // This would need previous month comparison
      completionRate: `${completionRate}%`,
      completionDetails: `${completionStats[0].completed} of ${completionStats[0].total} bookings`,
      retentionRate: `${retentionRate}%`,
      retentionDetails: 'Repeat bookings'
    };

  } catch (error) {
    console.error('Error getting summary metrics:', error);
    throw error;
  }
};

// Export all functions
export default {
  getBusinessMetrics,
  getRevenueData,
  getPackagePerformance,
  getClientSatisfaction,
  getRecentBookings,
  getUpcomingPayments,
  getSummaryMetrics
};