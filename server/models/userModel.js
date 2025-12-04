// models/userModel.js (Updated for profile system)
import pool from "../config/db.js";

/* =======================
   USER OPERATIONS
======================= */

// Create User with new fields
export const createUser = async (first_name, last_name, email, phone, hashedPassword, role, bio = null, location = null) => {
  const [result] = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, bio, location) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone, hashedPassword, role, bio, location]
  );
  return result.insertId;
};

// Find User by Email
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0];
};

// Find User by ID with role-specific data
export const findUserById = async (userId) => {
  const [rows] = await pool.query(`SELECT * FROM users WHERE user_id = ?`, [userId]);
  return rows[0];
};

// Get user with complete profile (includes planner/client data)
export const getUserWithProfile = async (userId) => {
  const [userRows] = await pool.query(`SELECT * FROM users WHERE user_id = ?`, [userId]);
  
  if (!userRows[0]) return null;
  
  const user = userRows[0];
  
  // Get role-specific data
  if (user.role === 'planner') {
    const [plannerRows] = await pool.query(
      `SELECT * FROM planners WHERE planner_id = ?`, 
      [userId]
    );
    user.plannerProfile = plannerRows[0] || null;
  } else if (user.role === 'client') {
    const [clientRows] = await pool.query(
      `SELECT * FROM clients WHERE client_id = ?`, 
      [userId]
    );
    user.clientProfile = clientRows[0] || null;
  }
  
  return user;
};

// Update user profile - Enhanced with selective field updates
export const updateUserProfile = async (userId, updates) => {
  const { first_name, last_name, phone, bio, location, profile_picture } = updates;
  
  // Build dynamic query to only update provided fields
  const fields = [];
  const values = [];
  
  if (first_name !== undefined) {
    fields.push('first_name = ?');
    values.push(first_name);
  }
  if (last_name !== undefined) {
    fields.push('last_name = ?');
    values.push(last_name);
  }
  if (phone !== undefined) {
    fields.push('phone = ?');
    values.push(phone);
  }
  if (bio !== undefined) {
    fields.push('bio = ?');
    values.push(bio);
  }
  if (location !== undefined) {
    fields.push('location = ?');
    values.push(location);
  }
  if (profile_picture !== undefined) {
    fields.push('profile_picture = ?');
    values.push(profile_picture);
  }
  
  if (fields.length === 0) {
    return 0; // No fields to update
  }
  
  values.push(userId); // Add userId for WHERE clause
  
  const [result] = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
  
  return result.affectedRows;
};

/* =======================
   PLANNER OPERATIONS
======================= */

// Create planner profile
export const createPlannerProfile = async (planner_id, business_name, experience_years = 0) => {
  const [result] = await pool.query(
    `INSERT INTO planners (planner_id, business_name, experience_years, status) 
     VALUES (?, ?, ?, 'pending')`,
    [planner_id, business_name, experience_years]
  );
  return result.insertId;
};

// Update planner profile - Enhanced with selective field updates
export const updatePlannerProfile = async (planner_id, updates) => {
  const { 
    business_name, 
    business_address, 
    business_email, 
    business_phone, 
    experience_years 
  } = updates;
  
  // Build dynamic query to only update provided fields
  const fields = [];
  const values = [];
  
  if (business_name !== undefined) {
    fields.push('business_name = ?');
    values.push(business_name);
  }
  if (business_address !== undefined) {
    fields.push('business_address = ?');
    values.push(business_address);
  }
  if (business_email !== undefined) {
    fields.push('business_email = ?');
    values.push(business_email);
  }
  if (business_phone !== undefined) {
    fields.push('business_phone = ?');
    values.push(business_phone);
  }
  if (experience_years !== undefined) {
    fields.push('experience_years = ?');
    values.push(experience_years);
  }
  
  if (fields.length === 0) {
    return 0; // No fields to update
  }
  
  values.push(planner_id); // Add planner_id for WHERE clause
  
  const [result] = await pool.query(
    `UPDATE planners SET ${fields.join(', ')} WHERE planner_id = ?`,
    values
  );
  
  return result.affectedRows;
};

// Get planner status
export const getPlannerStatus = async (planner_id) => {
  const [rows] = await pool.query(
    `SELECT status FROM planners WHERE planner_id = ?`,
    [planner_id]
  );
  return rows[0]?.status || null;
};

// Get planner statistics
export const getPlannerStatistics = async (planner_id) => {
  try {
    // Get total bookings
    const [bookingRows] = await pool.query(
      `SELECT COUNT(*) as total_bookings 
       FROM bookings b
       JOIN package_services ps ON b.package_id = ps.package_id 
       WHERE ps.planner_id = ?`,
      [planner_id]
    );

    // Get completed bookings
    const [completedRows] = await pool.query(
      `SELECT COUNT(*) as completed_bookings 
       FROM bookings b
       JOIN package_services ps ON b.package_id = ps.package_id 
       WHERE ps.planner_id = ? AND b.status = 'completed'`,
      [planner_id]
    );

    // Get average rating from feedback
    const [ratingRows] = await pool.query(
      `SELECT AVG(f.rating) as avg_rating, COUNT(f.rating) as total_reviews
       FROM feedback f
       JOIN bookings b ON f.booking_id = b.booking_id
       JOIN package_services ps ON b.package_id = ps.package_id
       WHERE ps.planner_id = ?`,
      [planner_id]
    );

    // Calculate client retention rate (simplified version)
    const [retentionRows] = await pool.query(
      `SELECT 
         COUNT(DISTINCT b.client_id) as unique_clients,
         COUNT(*) as total_bookings
       FROM bookings b
       JOIN package_services ps ON b.package_id = ps.package_id 
       WHERE ps.planner_id = ?`,
      [planner_id]
    );

    const uniqueClients = retentionRows[0].unique_clients || 0;
    const totalBookings = retentionRows[0].total_bookings || 0;
    const clientRetention = uniqueClients > 0 ? Math.round(((totalBookings - uniqueClients) / uniqueClients) * 100) : 0;

    return {
      totalBookings: parseInt(bookingRows[0].total_bookings) || 0,
      completedWeddings: parseInt(completedRows[0].completed_bookings) || 0,
      averageRating: Math.round((parseFloat(ratingRows[0].avg_rating) || 0) * 10) / 10, // Round to 1 decimal
      totalReviews: parseInt(ratingRows[0].total_reviews) || 0,
      clientRetention: Math.min(clientRetention, 100), // Cap at 100%
      responseTime: '2 hours' // This would come from message response tracking
    };
  } catch (error) {
    console.error('Error getting planner statistics:', error);
    throw error;
  }
};

// Get recent reviews for planner
export const getPlannerRecentReviews = async (planner_id, limit = 5) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         f.feedback_id as id,
         CONCAT(u.first_name, ' & ', COALESCE(u.last_name, 'Partner')) as client,
         f.rating,
         f.created_at as date,
         f.comment,
         TRUE as verified
       FROM feedback f
       JOIN bookings b ON f.booking_id = b.booking_id
       JOIN package_services ps ON b.package_id = ps.package_id
       JOIN clients c ON b.client_id = c.client_id
       JOIN users u ON c.client_id = u.user_id
       WHERE ps.planner_id = ? AND f.comment IS NOT NULL AND f.comment != ''
       ORDER BY f.created_at DESC
       LIMIT ?`,
      [planner_id, limit]
    );

    return rows.map(row => ({
      id: row.id,
      client: row.client,
      rating: row.rating,
      date: row.date,
      comment: row.comment || '',
      verified: row.verified
    }));
  } catch (error) {
    console.error('Error getting recent reviews:', error);
    throw error;
  }
};

/* =======================
   CLIENT OPERATIONS
======================= */

// Create client profile
export const createClientProfile = async (client_id, wedding_date = null, wedding_location = null) => {
  const [result] = await pool.query(
    `INSERT INTO clients (client_id, wedding_date, wedding_location) 
     VALUES (?, ?, ?)`,
    [client_id, wedding_date, wedding_location]
  );
  return result.insertId;
};

// Update client profile
export const updateClientProfile = async (client_id, updates) => {
  const { wedding_date, wedding_location } = updates;
  
  const [result] = await pool.query(
    `UPDATE clients 
     SET wedding_date = ?, wedding_location = ?
     WHERE client_id = ?`,
    [wedding_date, wedding_location, client_id]
  );
  
  return result.affectedRows;
};