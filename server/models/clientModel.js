import pool from "../config/db.js";

/* =======================
   CLIENT OPERATIONS FOR PLANNERS
======================= */

// Get all clients for a specific planner with grouped bookings
export const getPlannerClients = async (planner_id, filters = {}) => {
  try {
    const { search, status, page = 1, limit = 20 } = filters;
    
    // First get all client-booking data
    let query = `
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email,
        u.phone,
        u.created_at as joinedDate,
        c.wedding_date as clientWeddingDate,
        c.wedding_location as clientWeddingLocation,
        b.booking_id,
        b.status,
        b.wedding_date as bookingWeddingDate,
        b.wedding_time,
        b.wedding_location as bookingWeddingLocation,
        b.notes,
        b.created_at as bookingCreatedAt,
        b.updated_at as lastContact,
        ps.package_id,
        ps.title as packageName,
        ps.price as packagePrice,
        ps.description as packageDescription,
        COALESCE(p.amount, 0) as paidAmount,
        p.status as paymentStatus
      FROM users u
      INNER JOIN clients c ON u.user_id = c.client_id
      INNER JOIN bookings b ON c.client_id = b.client_id
      INNER JOIN package_services ps ON b.package_id = ps.package_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id AND p.status = 'verified'
      WHERE ps.planner_id = ?
    `;
    
    const params = [planner_id];
    
    // Add search filter
    if (search && search.trim()) {
      query += ` AND (
        CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
        u.email LIKE ?
      )`;
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Add status filter
    if (status && status !== 'all') {
      query += ` AND b.status = ?`;
      params.push(status);
    }
    
    // Order by most recent contact
    query += ` ORDER BY b.updated_at DESC`;
    
    const [allBookings] = await pool.query(query, params);
    
    // Group bookings by client
    const clientsMap = new Map();
    
    allBookings.forEach(row => {
      const clientId = row.user_id;
      
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          id: clientId,
          name: row.name,
          email: row.email,
          phone: row.phone,
          joinedDate: row.joinedDate,
          weddingDate: row.bookingWeddingDate || row.clientWeddingDate,
          venue: row.bookingWeddingLocation || row.clientWeddingLocation,
          guestCount: row.guestCount,
          packages: [],
          bookings: [],
          totalSpent: 0,
          lastContact: row.lastContact,
          // Use the most common status or most recent one
          status: row.status
        });
      }
      
      const client = clientsMap.get(clientId);
      
      // Add package info
      client.packages.push({
        packageId: row.package_id,
        packageName: row.packageName,
        packagePrice: row.packagePrice,
        packageDescription: row.packageDescription,
        bookingId: row.booking_id,
        status: row.status,
        paidAmount: row.paidAmount,
        paymentStatus: row.paymentStatus
      });
      
      // Add booking info
      client.bookings.push({
        bookingId: row.booking_id,
        status: row.status,
        weddingDate: row.bookingWeddingDate,
        weddingTime: row.wedding_time,
        weddingLocation: row.bookingWeddingLocation,
        notes: row.notes,
        packageName: row.packageName,
        packagePrice: row.packagePrice,
        paidAmount: row.paidAmount,
        createdAt: row.bookingCreatedAt
      });
      
      // Update total spent
      client.totalSpent += Number(row.paidAmount || 0);
      
      // Update last contact to most recent
      if (new Date(row.lastContact) > new Date(client.lastContact)) {
        client.lastContact = row.lastContact;
      }
    });
    
    // Convert map to array and format
    let clients = Array.from(clientsMap.values()).map(client => ({
      ...client,
      bookingCount: client.packages.length,
      totalSpent: `₱${client.totalSpent.toLocaleString()}`,
      lastContact: getRelativeTime(client.lastContact),
      // Determine primary status based on most recent booking
      status: client.packages.length > 0 ? client.packages[0].status : 'unknown'
    }));
    
    // Apply pagination
    const total = clients.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    clients = clients.slice(startIndex, endIndex);
    
    return {
      clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    };
    
  } catch (error) {
    console.error('Error fetching planner clients:', error);
    throw error;
  }
};

// Get client statistics for planner dashboard
export const getPlannerClientStats = async (planner_id) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT u.user_id) as totalClients,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) as activeProjects,
        COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.booking_id END) as pending,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END) as completed,
        COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.booking_id END) as cancelled,
        COALESCE(SUM(CASE WHEN p.status = 'verified' THEN p.amount ELSE 0 END), 0) as totalRevenue
      FROM users u
      INNER JOIN clients c ON u.user_id = c.client_id
      INNER JOIN bookings b ON c.client_id = b.client_id
      INNER JOIN package_services ps ON b.package_id = ps.package_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      WHERE ps.planner_id = ?
    `, [planner_id]);
    
    return stats[0] || {
      totalClients: 0,
      activeProjects: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0
    };
  } catch (error) {
    console.error('Error fetching planner client stats:', error);
    throw error;
  }
};

// Get specific client details for planner with all their bookings
export const getClientDetails = async (client_id, planner_id) => {
  try {
    const [clientData] = await pool.query(`
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email,
        u.phone,
        u.bio,
        u.location,
        u.profile_picture,
        u.created_at as joinedDate,
        c.wedding_date,
        c.wedding_location,
        c.partner_name,
        c.budget
      FROM users u
      INNER JOIN clients c ON u.user_id = c.client_id
      WHERE u.user_id = ?
      LIMIT 1
    `, [client_id]);
    
    if (!clientData[0]) {
      return null;
    }
    
    const client = clientData[0];
    
    // Get all bookings for this client with this planner
    const [bookings] = await pool.query(`
      SELECT 
        b.booking_id,
        b.status,
        b.wedding_date,
        b.wedding_time,
        b.wedding_location,
        b.notes,
        b.created_at,
        b.updated_at,
        ps.package_id,
        ps.title as packageName,
        ps.price as packagePrice,
        ps.description as packageDescription,
        COALESCE(p.amount, 0) as paidAmount,
        p.status as paymentStatus,
        p.payment_date,
        f.rating,
        f.comment as feedback,
        f.reply as plannerReply,
        f.created_at as feedbackDate
      FROM bookings b
      INNER JOIN package_services ps ON b.package_id = ps.package_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id AND p.status = 'verified'
      LEFT JOIN feedback f ON b.booking_id = f.booking_id
      WHERE b.client_id = ? AND ps.planner_id = ?
      ORDER BY b.created_at DESC
    `, [client_id, planner_id]);
    
    // Format bookings with package information
    const formattedBookings = bookings.map(booking => ({
      bookingId: booking.booking_id,
      status: booking.status,
      weddingDate: booking.wedding_date,
      weddingTime: booking.wedding_time,
      weddingLocation: booking.wedding_location,
      notes: booking.notes,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      package: {
        packageId: booking.package_id,
        name: booking.packageName,
        price: booking.packagePrice,
        description: booking.packageDescription
      },
      payment: {
        amount: booking.paidAmount,
        status: booking.paymentStatus,
        paymentDate: booking.payment_date
      },
      feedback: booking.rating ? {
        rating: booking.rating,
        comment: booking.feedback,
        plannerReply: booking.plannerReply,
        feedbackDate: booking.feedbackDate
      } : null
    }));
    
    return {
      ...client,
      bookings: formattedBookings,
      totalBookings: formattedBookings.length,
      totalSpent: formattedBookings.reduce((sum, booking) => sum + Number(booking.payment.amount), 0)
    };
    
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

// Send message to client (placeholder - implement based on your messaging system)
export const sendMessageToClient = async (planner_id, client_id, message_data) => {
  try {
    // This is a placeholder implementation
    // You would implement your actual messaging system here
    
    const [result] = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, message, created_at)
      VALUES (?, ?, ?, NOW())
    `, [planner_id, client_id, message_data.message]);
    
    return { success: true, messageId: result.insertId };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Utility function to calculate relative time
function getRelativeTime(date) {
  if (!date) return 'Never';
  
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.ceil(diffDays / 365)} year${Math.ceil(diffDays / 365) > 1 ? 's' : ''} ago`;
}