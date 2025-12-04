// models/statsModel.js
import pool from "../config/db.js";

/* =======================
   CLIENT STATS MODEL
======================= */

// Get client booking overview statistics
export const getClientBookingStats = async (clientId) => {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
      COUNT(CASE WHEN status IN ('pending', 'confirmed') AND wedding_date >= CURDATE() THEN 1 END) as upcoming_bookings,
      COUNT(CASE WHEN wedding_date >= CURDATE() THEN 1 END) as future_bookings
    FROM bookings 
    WHERE client_id = ?
  `, [clientId]);
  
  return rows[0];
};

// Get client payment statistics
export const getClientPaymentStats = async (clientId) => {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(pay.payment_id) as total_payments,
      COUNT(CASE WHEN pay.status = 'verified' THEN 1 END) as verified_payments,
      COUNT(CASE WHEN pay.status = 'pending' THEN 1 END) as pending_payments,
      COALESCE(SUM(CASE WHEN pay.status = 'verified' THEN pay.amount ELSE 0 END), 0) as total_paid,
      COALESCE(SUM(pay.amount), 0) as total_payment_amount
    FROM bookings b
    LEFT JOIN payments pay ON b.booking_id = pay.booking_id
    WHERE b.client_id = ?
  `, [clientId]);
  
  return rows[0];
};

// Get client's recent bookings
export const getClientRecentBookings = async (clientId, limit = 5) => {
  const [rows] = await pool.query(`
    SELECT 
      b.booking_id,
      b.wedding_date,
      b.wedding_time,
      b.wedding_location,
      b.status,
      b.created_at,
      ps.title as package_title,
      ps.price as package_price,
      p.business_name as planner_business_name,
      CONCAT(pu.first_name, ' ', pu.last_name) as planner_name
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    WHERE b.client_id = ?
    ORDER BY b.created_at DESC
    LIMIT ?
  `, [clientId, limit]);
  
  return rows.map(booking => ({
    booking_id: booking.booking_id,
    wedding_date: booking.wedding_date,
    wedding_time: booking.wedding_time,
    venue: booking.wedding_location,
    status: booking.status,
    package_title: booking.package_title,
    package_price: parseFloat(booking.package_price),
    planner_name: booking.planner_name,
    planner_business: booking.planner_business_name,
    created_at: booking.created_at,
    formatted_booking_id: `BK${String(booking.booking_id).padStart(6, '0')}`
  }));
};

// Get client's next upcoming event
export const getClientNextEvent = async (clientId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.booking_id,
      b.wedding_date,
      b.wedding_time,
      b.wedding_location,
      b.status,
      ps.title as package_title,
      p.business_name as planner_business_name,
      CONCAT(pu.first_name, ' ', pu.last_name) as planner_name,
      pu.phone as planner_phone,
      pu.email as planner_email,
      DATEDIFF(b.wedding_date, CURDATE()) as days_until_event
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    WHERE b.client_id = ? 
      AND b.wedding_date >= CURDATE()
      AND b.status IN ('confirmed', 'pending')
    ORDER BY b.wedding_date ASC
    LIMIT 1
  `, [clientId]);
  
  if (rows.length === 0) return null;
  
  const event = rows[0];
  return {
    booking_id: event.booking_id,
    wedding_date: event.wedding_date,
    wedding_time: event.wedding_time,
    venue: event.wedding_location,
    status: event.status,
    package_title: event.package_title,
    planner_name: event.planner_name,
    planner_business: event.planner_business_name,
    planner_phone: event.planner_phone,
    planner_email: event.planner_email,
    days_until_event: event.days_until_event,
    formatted_booking_id: `BK${String(event.booking_id).padStart(6, '0')}`
  };
};

// Get client's monthly booking trend
export const getClientMonthlyTrend = async (clientId, months = 6) => {
  const [rows] = await pool.query(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as bookings_count,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
    FROM bookings 
    WHERE client_id = ? 
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `, [clientId, months]);
  
  return rows.map(month => ({
    month: month.month,
    bookings_count: month.bookings_count,
    completed_count: month.completed_count
  }));
};

/* =======================
   PLANNER STATS MODEL
======================= */

// Get planner booking statistics
export const getPlannerBookingStats = async (plannerId) => {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(b.booking_id) as total_bookings,
      COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
      COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
      COUNT(ps.package_id) as total_packages,
      COUNT(CASE WHEN ps.is_active = TRUE THEN 1 END) as active_packages,
      COUNT(DISTINCT b.client_id) as unique_clients
    FROM package_services ps
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    WHERE ps.planner_id = ?
  `, [plannerId]);
  
  return rows[0];
};

// Get planner's recent bookings
export const getPlannerRecentBookings = async (plannerId, limit = 5) => {
  const [rows] = await pool.query(`
    SELECT 
      b.booking_id,
      b.wedding_date,
      b.wedding_time,
      b.wedding_location,
      b.status,
      b.created_at,
      ps.title as package_title,
      ps.price as package_price,
      CONCAT(cu.first_name, ' ', cu.last_name) as client_name,
      cu.email as client_email,
      cu.phone as client_phone
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN clients c ON b.client_id = c.client_id
    JOIN users cu ON c.client_id = cu.user_id
    WHERE ps.planner_id = ?
    ORDER BY b.created_at DESC
    LIMIT ?
  `, [plannerId, limit]);
  
  return rows.map(booking => ({
    booking_id: booking.booking_id,
    wedding_date: booking.wedding_date,
    wedding_time: booking.wedding_time,
    venue: booking.wedding_location,
    status: booking.status,
    package_title: booking.package_title,
    package_price: parseFloat(booking.package_price),
    client_name: booking.client_name,
    client_email: booking.client_email,
    client_phone: booking.client_phone,
    created_at: booking.created_at,
    formatted_booking_id: `BK${String(booking.booking_id).padStart(6, '0')}`
  }));
};

// Get planner's revenue statistics
export const getPlannerRevenueStats = async (plannerId) => {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(pay.payment_id) as total_payments,
      COUNT(CASE WHEN pay.status = 'verified' THEN 1 END) as verified_payments,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as total_revenue,
      COALESCE(AVG(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price END), 0) as average_booking_value,
      COUNT(CASE WHEN b.status IN ('confirmed', 'completed') THEN 1 END) as confirmed_completed_bookings
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    LEFT JOIN payments pay ON b.booking_id = pay.booking_id
    WHERE ps.planner_id = ?
  `, [plannerId]);
  
  return {
    total_payments: rows[0].total_payments,
    verified_payments: rows[0].verified_payments,
    total_revenue: parseFloat(rows[0].total_revenue || 0),
    average_booking_value: parseFloat(rows[0].average_booking_value || 0),
    confirmed_completed_bookings: rows[0].confirmed_completed_bookings
  };
};

/* =======================
   ADMIN STATS MODEL
======================= */

// Get system-wide statistics
export const getSystemStats = async () => {
  const [rows] = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'client') as total_clients,
      (SELECT COUNT(*) FROM users WHERE role = 'planner') as total_planners,
      (SELECT COUNT(*) FROM planners WHERE status = 'pending') as pending_planners,
      (SELECT COUNT(*) FROM planners WHERE status = 'approved') as approved_planners,
      (SELECT COUNT(*) FROM planners WHERE status = 'rejected') as rejected_planners,
      (SELECT COUNT(*) FROM bookings) as total_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
      (SELECT COUNT(*) FROM package_services WHERE is_active = TRUE) as active_packages,
      (SELECT COUNT(*) FROM package_services) as total_packages
  `);
  
  return rows[0];
};

// Get admin monthly trends
export const getAdminMonthlyTrends = async (months = 6) => {
  const [userTrend] = await pool.query(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as new_users,
      COUNT(CASE WHEN role = 'client' THEN 1 END) as new_clients,
      COUNT(CASE WHEN role = 'planner' THEN 1 END) as new_planners
    FROM users 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `, [months]);

  const [bookingTrend] = await pool.query(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as new_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings
    FROM bookings 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `, [months]);

  return {
    user_trend: userTrend,
    booking_trend: bookingTrend
  };
};

// Get total revenue statistics (admin view)
export const getRevenueStats = async () => {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(pay.payment_id) as total_payments,
      COUNT(CASE WHEN pay.status = 'verified' THEN 1 END) as verified_payments,
      COUNT(CASE WHEN pay.status = 'pending' THEN 1 END) as pending_payments,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as total_revenue,
      COALESCE(AVG(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price END), 0) as average_payment,
      COUNT(CASE WHEN b.status IN ('confirmed', 'completed') THEN 1 END) as confirmed_completed_bookings
    FROM payments pay
    LEFT JOIN bookings b ON pay.booking_id = b.booking_id
    LEFT JOIN package_services ps ON b.package_id = ps.package_id
  `);
  
  return {
    total_payments: rows[0].total_payments,
    verified_payments: rows[0].verified_payments,
    pending_payments: rows[0].pending_payments,
    total_revenue: parseFloat(rows[0].total_revenue || 0),
    average_payment: parseFloat(rows[0].average_payment || 0),
    confirmed_completed_bookings: rows[0].confirmed_completed_bookings
  };
};

/* =======================
   ADMIN REPORTS MODEL
======================= */

// Get monthly performance data for charts
export const getMonthlyPerformanceData = async (months = 6) => {
  const [rows] = await pool.query(`
    SELECT 
      DATE_FORMAT(months.month_date, '%b') as month,
      YEAR(months.month_date) as year,
      COALESCE(booking_data.bookings, 0) as bookings,
      COALESCE(booking_data.revenue, 0) as revenue,
      COALESCE(planner_data.new_planners, 0) as planners,
      COALESCE(dispute_data.disputes, 0) as disputes
    FROM (
      SELECT 
        DATE(DATE_FORMAT(CURDATE() - INTERVAL (a.a + (10 * b.a)) MONTH, '%Y-%m-01')) as month_date
      FROM 
        (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL 
                SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL 
                SELECT 8 UNION ALL SELECT 9) as a
      CROSS JOIN 
        (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL 
                SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL 
                SELECT 8 UNION ALL SELECT 9) as b
      WHERE a.a + (10 * b.a) < ?
    ) months
    LEFT JOIN (
      SELECT 
        DATE_FORMAT(b.created_at, '%Y-%m-01') as month_date,
        COUNT(*) as bookings,
        COALESCE(SUM(ps.price), 0) as revenue
      FROM bookings b
      JOIN package_services ps ON b.package_id = ps.package_id
      WHERE b.status IN ('confirmed', 'completed')
        AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m-01')
    ) booking_data ON months.month_date = booking_data.month_date
    LEFT JOIN (
      SELECT 
        DATE_FORMAT(p.created_at, '%Y-%m-01') as month_date,
        COUNT(*) as new_planners
      FROM planners p
      WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(p.created_at, '%Y-%m-01')
    ) planner_data ON months.month_date = planner_data.month_date
    LEFT JOIN (
      SELECT 
        DATE_FORMAT(bd.created_at, '%Y-%m-01') as month_date,
        COUNT(*) as disputes
      FROM bookings bd
      WHERE bd.status = 'cancelled' 
        AND bd.reason IS NOT NULL 
        AND bd.created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(bd.created_at, '%Y-%m-01')
    ) dispute_data ON months.month_date = dispute_data.month_date
    WHERE months.month_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    ORDER BY months.month_date DESC
    LIMIT ?
  `, [months, months, months, months, months, months]);

  return rows.map(row => ({
    month: row.month,
    year: row.year,
    bookings: parseInt(row.bookings),
    revenue: parseFloat(row.revenue),
    planners: parseInt(row.planners),
    disputes: parseInt(row.disputes)
  }));
};

// Get top performing planners
export const getTopPerformingPlanners = async (limit = 5) => {
  const [rows] = await pool.query(`
    SELECT 
      p.planner_id,
      p.business_name as name,
      CONCAT(u.first_name, ' ', u.last_name) as planner_name,
      COUNT(DISTINCT b.booking_id) as bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as revenue,
      COALESCE(AVG(f.rating), 0) as rating,
      u.profile_picture
    FROM planners p
    JOIN users u ON p.planner_id = u.user_id
    JOIN package_services ps ON p.planner_id = ps.planner_id
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    LEFT JOIN feedback f ON b.booking_id = f.booking_id
    WHERE p.status = 'approved'
    GROUP BY p.planner_id, p.business_name, u.first_name, u.last_name, u.profile_picture
    HAVING bookings > 0
    ORDER BY revenue DESC, rating DESC
    LIMIT ?
  `, [limit]);

  const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  
  return rows.map((row, index) => ({
    planner_id: row.planner_id,
    name: row.name || `${row.planner_name}'s Business`,
    planner_name: row.planner_name,
    bookings: parseInt(row.bookings),
    revenue: parseFloat(row.revenue),
    rating: parseFloat(row.rating).toFixed(1),
    profile_picture: row.profile_picture,
    color: colors[index % colors.length]
  }));
};

// Get permit status distribution
export const getPermitStatusData = async () => {
  const [rows] = await pool.query(`
    SELECT 
      CASE 
        WHEN status = 'approved' AND permit_number IS NOT NULL THEN 'Active'
        WHEN status = 'pending' THEN 'Pending' 
        WHEN status = 'rejected' OR permit_number IS NULL THEN 'Expired'
        ELSE 'Unknown'
      END as name,
      COUNT(*) as value
    FROM planners
    GROUP BY 
      CASE 
        WHEN status = 'approved' AND permit_number IS NOT NULL THEN 'Active'
        WHEN status = 'pending' THEN 'Pending' 
        WHEN status = 'rejected' OR permit_number IS NULL THEN 'Expired'
        ELSE 'Unknown'
      END
  `);

  const colors = {
    'Active': '#10b981',
    'Pending': '#f59e0b', 
    'Expired': '#ef4444',
    'Unknown': '#6b7280'
  };

  return rows.map(row => ({
    name: row.name,
    value: parseInt(row.value),
    color: colors[row.name] || colors['Unknown']
  }));
};

// Get compliance metrics
export const getComplianceMetrics = async () => {
  const [totalPlanners] = await pool.query(`SELECT COUNT(*) as total FROM planners WHERE status = 'approved'`);
  const total = totalPlanners[0].total;

  const [rows] = await pool.query(`
    SELECT 
      'Business Permits' as category,
      COUNT(CASE WHEN permit_number IS NOT NULL THEN 1 END) as compliant,
      COUNT(*) as total
    FROM planners WHERE status = 'approved'
    
    UNION ALL
    
    SELECT 
      'Tax Registrations' as category,
      COUNT(CASE WHEN business_email IS NOT NULL THEN 1 END) as compliant,
      COUNT(*) as total
    FROM planners WHERE status = 'approved'
    
    UNION ALL
    
    SELECT 
      'Service Standards' as category,
      COUNT(CASE WHEN experience_years >= 2 THEN 1 END) as compliant,
      COUNT(*) as total
    FROM planners WHERE status = 'approved'
    
    UNION ALL
    
    SELECT 
      'Documentation' as category,
      COUNT(CASE WHEN verification_notes IS NOT NULL THEN 1 END) as compliant,
      COUNT(*) as total
    FROM planners WHERE status = 'approved'
  `);

  return rows.map(row => ({
    category: row.category,
    compliant: parseInt(row.compliant),
    total: parseInt(row.total),
    percentage: Math.round((row.compliant / row.total) * 100)
  }));
};

// Get regional performance data
export const getRegionalPerformanceData = async () => {
  const [rows] = await pool.query(`
    SELECT 
      COALESCE(u.location, 'Unknown') as region,
      COUNT(DISTINCT p.planner_id) as planners,
      COUNT(DISTINCT b.booking_id) as bookings,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN ps.price ELSE 0 END), 0) as revenue
    FROM planners p
    JOIN users u ON p.planner_id = u.user_id
    LEFT JOIN package_services ps ON p.planner_id = ps.planner_id AND ps.is_active = TRUE
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    WHERE p.status = 'approved'
    GROUP BY u.location
    HAVING planners > 0
    ORDER BY revenue DESC, planners DESC
    LIMIT 10
  `);

  return rows.map(row => ({
    region: row.region === 'Unknown' ? 'Other Regions' : row.region,
    planners: parseInt(row.planners),
    bookings: parseInt(row.bookings || 0),
    revenue: parseFloat(row.revenue || 0)
  }));
};

// Get system alerts and notifications
export const getSystemAlerts = async (limit = 10) => {
  const alerts = [];

  // Check for expiring permits
  const [expiringPermits] = await pool.query(`
    SELECT COUNT(*) as count 
    FROM planners 
    WHERE status = 'approved' 
      AND permit_number IS NOT NULL 
      AND created_at < DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
  `);

  if (expiringPermits[0].count > 0) {
    alerts.push({
      id: `permit_expiry_${Date.now()}`,
      type: 'permit_expiry',
      message: `${expiringPermits[0].count} business permits expiring within 30 days`,
      severity: 'warning',
      timestamp: new Date().toISOString().split('T')[0],
      action_url: '/admin/planners?status=approved'
    });
  }

  // Check for recent disputes/cancellations
  const [disputes] = await pool.query(`
    SELECT COUNT(*) as count 
    FROM bookings 
    WHERE status = 'cancelled' 
      AND reason IS NOT NULL 
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  `);

  if (disputes[0].count > 0) {
    alerts.push({
      id: `disputes_${Date.now()}`,
      type: 'dispute',
      message: `${disputes[0].count} new disputes filed in the last 7 days`,
      severity: 'high',
      timestamp: new Date().toISOString().split('T')[0],
      action_url: '/admin/bookings?status=cancelled'
    });
  }

  // Check for pending planners
  const [pendingPlanners] = await pool.query(`
    SELECT COUNT(*) as count 
    FROM planners 
    WHERE status = 'pending'
  `);

  if (pendingPlanners[0].count > 0) {
    alerts.push({
      id: `pending_planners_${Date.now()}`,
      type: 'compliance',
      message: `${pendingPlanners[0].count} planners pending documentation review`,
      severity: 'medium',
      timestamp: new Date().toISOString().split('T')[0],
      action_url: '/admin/planners?status=pending'
    });
  }

  // Check for monthly revenue performance
  const [currentMonth] = await pool.query(`
    SELECT 
      COALESCE(SUM(ps.price), 0) as current_revenue
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE b.status IN ('confirmed', 'completed')
      AND MONTH(b.created_at) = MONTH(CURDATE())
      AND YEAR(b.created_at) = YEAR(CURDATE())
  `);

  const [lastMonth] = await pool.query(`
    SELECT 
      COALESCE(SUM(ps.price), 0) as last_revenue
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE b.status IN ('confirmed', 'completed')
      AND MONTH(b.created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH)
      AND YEAR(b.created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH)
  `);

  const currentRevenue = parseFloat(currentMonth[0].current_revenue);
  const lastRevenue = parseFloat(lastMonth[0].last_revenue);
  
  if (lastRevenue > 0) {
    const growth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    if (growth > 10) {
      alerts.push({
        id: `revenue_growth_${Date.now()}`,
        type: 'revenue',
        message: `Monthly revenue target exceeded by ${Math.round(growth)}%`,
        severity: 'positive',
        timestamp: new Date().toISOString().split('T')[0],
        action_url: '/admin/reports'
      });
    }
  }

  return alerts.slice(0, limit);
};

// Get enhanced financial metrics
export const getEnhancedFinancialMetrics = async () => {
  // Current month revenue
  const [currentMonth] = await pool.query(`
    SELECT 
      COUNT(DISTINCT b.booking_id) as bookings,
      COALESCE(SUM(ps.price), 0) as revenue,
      COUNT(DISTINCT ps.planner_id) as active_planners
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE b.status IN ('confirmed', 'completed')
      AND MONTH(b.created_at) = MONTH(CURDATE())
      AND YEAR(b.created_at) = YEAR(CURDATE())
  `);

  // Previous month for comparison
  const [lastMonth] = await pool.query(`
    SELECT 
      COUNT(DISTINCT b.booking_id) as bookings,
      COALESCE(SUM(ps.price), 0) as revenue,
      COUNT(DISTINCT ps.planner_id) as active_planners
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE b.status IN ('confirmed', 'completed')
      AND MONTH(b.created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH)
      AND YEAR(b.created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH)
  `);

  // Year-over-year growth
  const [currentYear] = await pool.query(`
    SELECT 
      COUNT(DISTINCT b.booking_id) as bookings,
      COALESCE(SUM(ps.price), 0) as revenue
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE b.status IN ('confirmed', 'completed')
      AND YEAR(b.created_at) = YEAR(CURDATE())
  `);

  const [lastYear] = await pool.query(`
    SELECT 
      COUNT(DISTINCT b.booking_id) as bookings,
      COALESCE(SUM(ps.price), 0) as revenue
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE b.status IN ('confirmed', 'completed')
      AND YEAR(b.created_at) = YEAR(CURDATE() - INTERVAL 1 YEAR)
  `);

  const current = currentMonth[0];
  const last = lastMonth[0];
  const yearCurrent = currentYear[0];
  const yearLast = lastYear[0];

  return {
    monthly: {
      current: {
        revenue: parseFloat(current.revenue),
        bookings: parseInt(current.bookings),
        active_planners: parseInt(current.active_planners)
      },
      previous: {
        revenue: parseFloat(last.revenue),
        bookings: parseInt(last.bookings),
        active_planners: parseInt(last.active_planners)
      },
      growth: {
        revenue: last.revenue > 0 ? ((current.revenue - last.revenue) / last.revenue) * 100 : 0,
        bookings: last.bookings > 0 ? ((current.bookings - last.bookings) / last.bookings) * 100 : 0,
        planners: last.active_planners > 0 ? ((current.active_planners - last.active_planners) / last.active_planners) * 100 : 0
      }
    },
    yearly: {
      current: {
        revenue: parseFloat(yearCurrent.revenue),
        bookings: parseInt(yearCurrent.bookings)
      },
      previous: {
        revenue: parseFloat(yearLast.revenue),
        bookings: parseInt(yearLast.bookings)
      },
      growth: {
        revenue: yearLast.revenue > 0 ? ((yearCurrent.revenue - yearLast.revenue) / yearLast.revenue) * 100 : 0,
        bookings: yearLast.bookings > 0 ? ((yearCurrent.bookings - yearLast.bookings) / yearLast.bookings) * 100 : 0
      }
    }
  };
};

/* =======================
   ADDITIONAL ADMIN ANALYTICS
======================= */

// Get payment processing analytics
export const getPaymentAnalytics = async () => {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(*) as total_payments,
      COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_payments,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_payments,
      ROUND((COUNT(CASE WHEN status = 'verified' THEN 1 END) / COUNT(*)) * 100, 2) as verification_rate,
      AVG(CASE 
        WHEN status = 'verified' AND verified_at IS NOT NULL 
        THEN TIMESTAMPDIFF(HOUR, uploaded_at, verified_at) 
      END) as avg_processing_hours,
      COALESCE(SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END), 0) as total_verified_amount,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
    FROM payments
  `);

  const [monthlyTrend] = await pool.query(`
    SELECT 
      DATE_FORMAT(uploaded_at, '%Y-%m') as month,
      COUNT(*) as payments_count,
      COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
      COALESCE(SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END), 0) as verified_amount
    FROM payments 
    WHERE uploaded_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(uploaded_at, '%Y-%m')
    ORDER BY month DESC
  `);

  return {
    overview: rows[0],
    monthly_trend: monthlyTrend.map(row => ({
      month: row.month,
      payments_count: parseInt(row.payments_count),
      verified_count: parseInt(row.verified_count),
      verified_amount: parseFloat(row.verified_amount)
    }))
  };
};

// Get package analytics by category
export const getPackageAnalytics = async () => {
  const [categoryStats] = await pool.query(`
    SELECT 
      c.name as category_name,
      COUNT(ps.package_id) as total_packages,
      COUNT(CASE WHEN ps.is_active = TRUE THEN 1 END) as active_packages,
      COUNT(DISTINCT b.booking_id) as total_bookings,
      COALESCE(AVG(ps.price), 0) as avg_price,
      COALESCE(AVG(ps.rating), 0) as avg_rating,
      COUNT(ps.review_count) as total_reviews
    FROM categories c
    LEFT JOIN package_services ps ON c.category_id = ps.category_id
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    GROUP BY c.category_id, c.name
    ORDER BY total_bookings DESC
  `);

  const [packageTrends] = await pool.query(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as packages_created,
      COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_packages
    FROM package_services 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `);

  return {
    category_performance: categoryStats.map(row => ({
      category_name: row.category_name,
      total_packages: parseInt(row.total_packages || 0),
      active_packages: parseInt(row.active_packages || 0),
      total_bookings: parseInt(row.total_bookings || 0),
      avg_price: parseFloat(row.avg_price || 0),
      avg_rating: parseFloat(row.avg_rating || 0),
      total_reviews: parseInt(row.total_reviews || 0)
    })),
    creation_trends: packageTrends.map(row => ({
      month: row.month,
      packages_created: parseInt(row.packages_created),
      active_packages: parseInt(row.active_packages)
    }))
  };
};

// Get booking conversion and cancellation analytics
export const getBookingAnalytics = async () => {
  const [conversionStats] = await pool.query(`
    SELECT 
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
      ROUND((COUNT(CASE WHEN status = 'confirmed' THEN 1 END) / COUNT(*)) * 100, 2) as confirmation_rate,
      ROUND((COUNT(CASE WHEN status = 'cancelled' THEN 1 END) / COUNT(*)) * 100, 2) as cancellation_rate,
      AVG(CASE 
        WHEN status = 'confirmed' AND updated_at != created_at 
        THEN TIMESTAMPDIFF(HOUR, created_at, updated_at) 
      END) as avg_confirmation_hours
    FROM bookings
  `);

  const [cancellationReasons] = await pool.query(`
    SELECT 
      COALESCE(reason, 'No reason provided') as cancellation_reason,
      COUNT(*) as count
    FROM bookings 
    WHERE status = 'cancelled'
    GROUP BY reason
    ORDER BY count DESC
    LIMIT 10
  `);

  const [seasonalTrends] = await pool.query(`
    SELECT 
      MONTH(wedding_date) as month,
      MONTHNAME(wedding_date) as month_name,
      COUNT(*) as booking_count,
      COUNT(CASE WHEN status IN ('confirmed', 'completed') THEN 1 END) as successful_bookings
    FROM bookings 
    WHERE wedding_date >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR)
    GROUP BY MONTH(wedding_date), MONTHNAME(wedding_date)
    ORDER BY month
  `);

  return {
    conversion_metrics: conversionStats[0],
    cancellation_reasons: cancellationReasons.map(row => ({
      reason: row.cancellation_reason,
      count: parseInt(row.count)
    })),
    seasonal_patterns: seasonalTrends.map(row => ({
      month: parseInt(row.month),
      month_name: row.month_name,
      booking_count: parseInt(row.booking_count),
      successful_bookings: parseInt(row.successful_bookings),
      success_rate: Math.round((row.successful_bookings / row.booking_count) * 100)
    }))
  };
};

// Get feedback and review analytics
export const getFeedbackAnalytics = async () => {
  const [overallStats] = await pool.query(`
    SELECT 
      COUNT(*) as total_feedback,
      COUNT(CASE WHEN reply IS NOT NULL THEN 1 END) as replied_feedback,
      ROUND((COUNT(CASE WHEN reply IS NOT NULL THEN 1 END) / COUNT(*)) * 100, 2) as reply_rate,
      AVG(rating) as avg_rating,
      COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
      COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
      COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
      COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
      COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
    FROM feedback
  `);

  const [ratingTrends] = await pool.query(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as feedback_count,
      AVG(rating) as avg_rating,
      COUNT(CASE WHEN reply IS NOT NULL THEN 1 END) as replied_count
    FROM feedback 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `);

  const stats = overallStats[0];
  
  return {
    overview: {
      total_feedback: parseInt(stats.total_feedback),
      replied_feedback: parseInt(stats.replied_feedback),
      reply_rate: parseFloat(stats.reply_rate || 0),
      avg_rating: parseFloat(stats.avg_rating || 0)
    },
    rating_distribution: [
      { stars: 5, count: parseInt(stats.five_star_count) },
      { stars: 4, count: parseInt(stats.four_star_count) },
      { stars: 3, count: parseInt(stats.three_star_count) },
      { stars: 2, count: parseInt(stats.two_star_count) },
      { stars: 1, count: parseInt(stats.one_star_count) }
    ],
    monthly_trends: ratingTrends.map(row => ({
      month: row.month,
      feedback_count: parseInt(row.feedback_count),
      avg_rating: parseFloat(row.avg_rating || 0),
      replied_count: parseInt(row.replied_count),
      reply_rate: Math.round((row.replied_count / row.feedback_count) * 100)
    }))
  };
};

// Get permit processing analytics
export const getPermitProcessingAnalytics = async () => {
  const [processingStats] = await pool.query(`
    SELECT 
      COUNT(*) as total_permits,
      COUNT(CASE WHEN is_approved = TRUE THEN 1 END) as approved_permits,
      COUNT(CASE WHEN is_approved = FALSE THEN 1 END) as rejected_permits,
      COUNT(CASE WHEN is_approved IS NULL THEN 1 END) as pending_permits,
      AVG(CASE 
        WHEN reviewed_at IS NOT NULL 
        THEN TIMESTAMPDIFF(DAY, submitted_at, reviewed_at) 
      END) as avg_processing_days
    FROM permits
  `);

  const [attachmentStats] = await pool.query(`
    SELECT 
      COUNT(*) as total_attachments,
      COUNT(CASE WHEN permit_status = 'approved' THEN 1 END) as approved_attachments,
      COUNT(CASE WHEN permit_status = 'rejected' THEN 1 END) as rejected_attachments,
      COUNT(CASE WHEN permit_status = 'pending' THEN 1 END) as pending_attachments,
      COUNT(DISTINCT permit_id) as permits_with_attachments
    FROM permit_attachments
  `);

  const [processingTrends] = await pool.query(`
    SELECT 
      DATE_FORMAT(submitted_at, '%Y-%m') as month,
      COUNT(*) as submitted_count,
      COUNT(CASE WHEN is_approved = TRUE THEN 1 END) as approved_count,
      AVG(CASE 
        WHEN reviewed_at IS NOT NULL 
        THEN TIMESTAMPDIFF(DAY, submitted_at, reviewed_at) 
      END) as avg_processing_days
    FROM permits 
    WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
    ORDER BY month DESC
  `);

  return {
    permit_overview: {
      ...processingStats[0],
      avg_processing_days: Math.round(processingStats[0].avg_processing_days || 0)
    },
    attachment_overview: attachmentStats[0],
    processing_trends: processingTrends.map(row => ({
      month: row.month,
      submitted_count: parseInt(row.submitted_count),
      approved_count: parseInt(row.approved_count || 0),
      avg_processing_days: Math.round(row.avg_processing_days || 0),
      approval_rate: row.submitted_count > 0 ? Math.round((row.approved_count / row.submitted_count) * 100) : 0
    }))
  };
};

// Get user engagement analytics
export const getUserEngagementAnalytics = async () => {
  const [userStats] = await pool.query(`
    SELECT 
      role,
      COUNT(*) as total_users,
      COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
      COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d
    FROM users 
    GROUP BY role
  `);

  const [clientEngagement] = await pool.query(`
    SELECT 
      COUNT(DISTINCT c.client_id) as total_clients,
      COUNT(DISTINCT b.client_id) as clients_with_bookings,
      ROUND((COUNT(DISTINCT b.client_id) / COUNT(DISTINCT c.client_id)) * 100, 2) as booking_conversion_rate,
      AVG(client_bookings.booking_count) as avg_bookings_per_client
    FROM clients c
    LEFT JOIN bookings b ON c.client_id = b.client_id
    LEFT JOIN (
      SELECT client_id, COUNT(*) as booking_count 
      FROM bookings 
      GROUP BY client_id
    ) client_bookings ON c.client_id = client_bookings.client_id
  `);

  const [plannerEngagement] = await pool.query(`
    SELECT 
      COUNT(DISTINCT p.planner_id) as total_planners,
      COUNT(DISTINCT ps.planner_id) as planners_with_packages,
      COUNT(DISTINCT b_planner.planner_id) as planners_with_bookings,
      ROUND((COUNT(DISTINCT ps.planner_id) / COUNT(DISTINCT p.planner_id)) * 100, 2) as package_creation_rate,
      ROUND((COUNT(DISTINCT b_planner.planner_id) / COUNT(DISTINCT p.planner_id)) * 100, 2) as booking_success_rate
    FROM planners p
    LEFT JOIN package_services ps ON p.planner_id = ps.planner_id
    LEFT JOIN (
      SELECT DISTINCT ps.planner_id 
      FROM bookings b 
      JOIN package_services ps ON b.package_id = ps.package_id
    ) b_planner ON p.planner_id = b_planner.planner_id
    WHERE p.status = 'approved'
  `);

  return {
    user_overview: userStats.map(row => ({
      role: row.role,
      total_users: parseInt(row.total_users),
      new_users_30d: parseInt(row.new_users_30d),
      new_users_7d: parseInt(row.new_users_7d)
    })),
    client_engagement: {
      ...clientEngagement[0],
      avg_bookings_per_client: parseFloat(clientEngagement[0].avg_bookings_per_client || 0)
    },
    planner_engagement: plannerEngagement[0]
  };
};

// Get availability and slot utilization analytics
export const getAvailabilityAnalytics = async () => {
  const [slotUtilization] = await pool.query(`
    SELECT 
      COUNT(*) as total_date_slots,
      SUM(total_slots) as total_available_slots,
      SUM(booked_slots) as total_booked_slots,
      ROUND((SUM(booked_slots) / SUM(total_slots)) * 100, 2) as utilization_rate,
      AVG(total_slots) as avg_slots_per_date,
      COUNT(CASE WHEN booked_slots >= total_slots THEN 1 END) as fully_booked_dates
    FROM package_availability_by_date
    WHERE available_date >= CURDATE()
  `);

  const [popularDates] = await pool.query(`
    SELECT 
      DAYNAME(available_date) as day_name,
      COUNT(*) as date_count,
      SUM(booked_slots) as total_bookings,
      ROUND(AVG((booked_slots / total_slots) * 100), 2) as avg_utilization
    FROM package_availability_by_date
    WHERE available_date >= CURDATE()
    GROUP BY DAYOFWEEK(available_date), DAYNAME(available_date)
    ORDER BY total_bookings DESC
  `);

  const [blackoutAnalysis] = await pool.query(`
    SELECT 
      block_type,
      COUNT(*) as total_blocks,
      COUNT(DISTINCT package_id) as affected_packages
    FROM package_unavailable_dates
    WHERE unavailable_date >= CURDATE()
    GROUP BY block_type
  `);

  return {
    slot_utilization: slotUtilization[0],
    popular_days: popularDates.map(row => ({
      day_name: row.day_name,
      date_count: parseInt(row.date_count),
      total_bookings: parseInt(row.total_bookings),
      avg_utilization: parseFloat(row.avg_utilization || 0)
    })),
    blackout_analysis: blackoutAnalysis.map(row => ({
      block_type: row.block_type,
      total_blocks: parseInt(row.total_blocks),
      affected_packages: parseInt(row.affected_packages)
    }))
  };
};