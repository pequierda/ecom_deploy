// models/bookingModel.js - Fixed to store venue in wedding_location and notes as plain text
import pool from "../config/db.js";

/* =======================
   BOOKING CRUD OPERATIONS
======================= */

// Create a new booking - FIXED to store venue in wedding_location and notes as plain text
export const createBooking = async (bookingData) => {
  const {
    client_id,
    package_id,
    wedding_date, // DATE field
    wedding_time, // TIME field
    wedding_location, // FIXED: Store venue in wedding_location field
    special_requests, // FIXED: Store as plain text in notes field
    estimated_guests,
    referral_source,
    budget,
    status = 'pending'
  } = bookingData;

  console.log('📝 Creating booking in model with correct field mapping:', {
    client_id,
    package_id,
    wedding_date,
    wedding_time,
    wedding_location, // Now properly mapped
    special_requests,
    status
  });

  // FIXED: Store venue in wedding_location field and notes as plain text
  const [result] = await pool.query(
    `INSERT INTO bookings (
      client_id, 
      package_id, 
      wedding_date, 
      wedding_time, 
      wedding_location,
      notes,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      client_id,
      package_id,
      wedding_date, // Store the actual date, not NOW()
      wedding_time, // Store as TIME
      wedding_location, // FIXED: Store venue in wedding_location field
      special_requests || null, // FIXED: Store as plain text, not JSON
      status
    ]
  );
  
  console.log('✅ Booking created with ID:', result.insertId);
  return result.insertId;
};

// Check package availability for a specific date
export const checkPackageAvailability = async (packageId, date) => {
  try {
    console.log('🔍 Checking package availability for:', packageId, 'on', date);
    
    // Check if date is blacklisted
    const [blackoutCheck] = await pool.query(`
      SELECT COUNT(*) as is_blocked, reason
      FROM package_unavailable_dates 
      WHERE package_id = ? AND unavailable_date = ?
    `, [packageId, date]);

    if (blackoutCheck[0].is_blocked > 0) {
      console.log('❌ Date is blacklisted');
      return {
        available: false,
        reason: blackoutCheck[0].reason || 'This date is not available',
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0
      };
    }

    // Get date-specific availability or default slots
    const [availabilityCheck] = await pool.query(`
      SELECT 
        COALESCE(pabd.total_slots, pda.total_slots) as total_slots,
        COALESCE(pabd.booked_slots, 0) as booked_slots
      FROM package_services ps
      LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
      LEFT JOIN package_availability_by_date pabd ON ps.package_id = pabd.package_id 
        AND pabd.available_date = ?
      WHERE ps.package_id = ? AND ps.is_active = TRUE
    `, [date, packageId]);

    if (availabilityCheck.length === 0) {
      console.log('❌ Package not found or inactive');
      return {
        available: false,
        reason: 'Package not found or inactive',
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0
      };
    }

    const { total_slots, booked_slots } = availabilityCheck[0];
    const availableSlots = total_slots - booked_slots;

    console.log('📊 Availability check result:', {
      total_slots,
      booked_slots,
      availableSlots,
      available: availableSlots > 0
    });

    return {
      available: availableSlots > 0,
      reason: availableSlots > 0 ? null : 'No available slots for this date',
      totalSlots: total_slots,
      bookedSlots: booked_slots,
      availableSlots: availableSlots
    };

  } catch (error) {
    console.error('Error checking package availability:', error);
    return {
      available: false,
      reason: 'Error checking availability',
      totalSlots: 0,
      bookedSlots: 0,
      availableSlots: 0
    };
  }
};

// Get all bookings with full details - FIXED to use correct field names
export const getAllBookings = async () => {
  const [rows] = await pool.query(`
    SELECT 
      b.*,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      c.wedding_date as client_wedding_date,
      c.wedding_location as client_wedding_location,
      ps.title as package_title,
      ps.price as package_price,
      ps.description as package_description,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      p.business_name,
      -- Payment information
      pay.payment_id,
      pay.amount as payment_amount,
      pay.receipt_url,
      pay.uploaded_at as payment_uploaded_at,
      pay.status as payment_status,
      pay.verified_at as payment_verified_at
    FROM bookings b
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    LEFT JOIN payments pay ON b.booking_id = pay.booking_id
    ORDER BY b.wedding_date DESC, b.wedding_time DESC
  `);
  
  return rows.map(formatBookingDataWithPayments);
};


// Get booking by ID - FIXED to use correct field names
export const getBookingById = async (bookingId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.*,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      u.profile_picture as client_profile_picture,
      c.wedding_date as client_wedding_date,
      c.wedding_location as client_wedding_location,
      ps.title as package_title,
      ps.price as package_price,
      ps.description as package_description,
      ps.detailed_description as package_detailed_description,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      pu.email as planner_email,
      pu.phone as planner_phone,
      p.business_name,
      -- Payment information
      pay.payment_id,
      pay.amount as payment_amount,
      pay.receipt_url,
      pay.uploaded_at as payment_uploaded_at,
      pay.status as payment_status,
      pay.verified_at as payment_verified_at
    FROM bookings b
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    LEFT JOIN payments pay ON b.booking_id = pay.booking_id
    WHERE b.booking_id = ?
  `, [bookingId]);
  
  return rows[0] ? formatBookingDataWithPayments(rows[0]) : null;
};

// Get bookings by client ID - FIXED ordering
export const getBookingsByClient = async (clientId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.*,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      ps.title as package_title,
      ps.price as package_price,
      ps.description as package_description,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      p.business_name
    FROM bookings b
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    WHERE b.client_id = ?
    ORDER BY b.wedding_date DESC, b.wedding_time DESC
  `, [clientId]);
  
  return rows.map(formatBookingData);
};

// Get bookings by planner ID - FIXED ordering
export const getBookingsByPlanner = async (plannerId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.*,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      ps.title as package_title,
      ps.price as package_price,
      ps.description as package_description,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      p.business_name,
      -- Payment information
      pay.payment_id,
      pay.amount as payment_amount,
      pay.receipt_url,
      pay.uploaded_at as payment_uploaded_at,
      pay.status as payment_status,
      pay.verified_at as payment_verified_at
    FROM bookings b
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    LEFT JOIN payments pay ON b.booking_id = pay.booking_id
    WHERE ps.planner_id = ?
    ORDER BY b.wedding_date DESC, b.wedding_time DESC
  `, [plannerId]);
  
  return rows.map(formatBookingDataWithPayments);
};


// Get bookings by package ID - FIXED ordering
export const getBookingsByPackage = async (packageId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.*,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      ps.title as package_title,
      ps.price as package_price,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      p.business_name
    FROM bookings b
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    WHERE b.package_id = ?
    ORDER BY b.wedding_date DESC, b.wedding_time DESC
  `, [packageId]);
  
  return rows.map(formatBookingData);
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, notes = null) => {
  const [result] = await pool.query(
    `UPDATE bookings SET status = ?, reason = COALESCE(?, reason) WHERE booking_id = ?`,
    [status, notes, bookingId]
  );
  return result.affectedRows;
};

// Update booking details - FIXED to use correct field names
export const updateBooking = async (bookingId, updateData) => {
  const {
    wedding_date,
    wedding_time,
    wedding_location, // FIXED: Map venue to wedding_location
    special_requests, // FIXED: Store as plain text in notes
    status
  } = updateData;

  let query = 'UPDATE bookings SET ';
  const params = [];
  const updates = [];

  if (wedding_date !== undefined) {
    updates.push('wedding_date = ?');
    params.push(wedding_date);
  }

  if (wedding_time !== undefined) {
    updates.push('wedding_time = ?');
    params.push(wedding_time);
  }

  if (wedding_location !== undefined) {
    updates.push('wedding_location = ?');
    params.push(wedding_location);
  }

  if (special_requests !== undefined) {
    updates.push('notes = ?');
    params.push(special_requests); // Store as plain text
  }

  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length === 0) {
    return 0; // No updates to make
  }

  query += updates.join(', ') + ' WHERE booking_id = ?';
  params.push(bookingId);

  const [result] = await pool.query(query, params);
  return result.affectedRows;
};

// Delete booking (soft delete by updating status)
export const cancelBooking = async (bookingId) => {
  const [result] = await pool.query(
    `UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?`,
    [bookingId]
  );
  return result.affectedRows;
};

// Hard delete booking
export const deleteBooking = async (bookingId) => {
  const [result] = await pool.query(
    `DELETE FROM bookings WHERE booking_id = ?`,
    [bookingId]
  );
  return result.affectedRows;
};

/* =======================
   HELPER FUNCTIONS
======================= */

// Format booking data - FIXED to use correct field names (no JSON parsing needed)
const formatBookingData = (booking) => {
  return {
    ...booking,
    // Use the actual database columns
    wedding_date: booking.wedding_date,
    wedding_time: booking.wedding_time,
    venue: booking.wedding_location, // Map wedding_location to venue for backward compatibility
    wedding_location: booking.wedding_location,
    special_requests: booking.notes, // Notes field contains plain text special requests
    notes: booking.notes // Keep original notes field
  };
};

// Search bookings with filters - FIXED to use correct field names
export const searchBookings = async (filters) => {
  const {
    status,
    planner_id,
    client_id,
    package_id,
    date_from,
    date_to,
    search_term,
    limit = 50,
    offset = 0
  } = filters;

  let query = `
    SELECT 
      b.*,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      ps.title as package_title,
      ps.price as package_price,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      p.business_name,
      -- Payment information
      pay.payment_id,
      pay.amount as payment_amount,
      pay.receipt_url,
      pay.uploaded_at as payment_uploaded_at,
      pay.status as payment_status,
      pay.verified_at as payment_verified_at
    FROM bookings b
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users pu ON p.planner_id = pu.user_id
    LEFT JOIN payments pay ON b.booking_id = pay.booking_id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    query += ` AND b.status = ?`;
    params.push(status);
  }

  if (planner_id) {
    query += ` AND ps.planner_id = ?`;
    params.push(planner_id);
  }

  if (client_id) {
    query += ` AND b.client_id = ?`;
    params.push(client_id);
  }

  if (package_id) {
    query += ` AND b.package_id = ?`;
    params.push(package_id);
  }

  if (date_from) {
    query += ` AND b.wedding_date >= ?`;
    params.push(date_from);
  }

  if (date_to) {
    query += ` AND b.wedding_date <= ?`;
    params.push(date_to);
  }

  if (search_term) {
    query += ` AND (
      u.first_name LIKE ? OR 
      u.last_name LIKE ? OR 
      u.email LIKE ? OR 
      ps.title LIKE ? OR 
      p.business_name LIKE ? OR
      b.wedding_location LIKE ?
    )`;
    const searchPattern = `%${search_term}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ` ORDER BY b.wedding_date DESC, b.wedding_time DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows.map(formatBookingDataWithPayments);
};

// Updated format function to include payment data
const formatBookingDataWithPayments = (booking) => {
  return {
    ...booking,
    // Use the actual database columns
    wedding_date: booking.wedding_date,
    wedding_time: booking.wedding_time,
    venue: booking.wedding_location, // Map wedding_location to venue for backward compatibility
    wedding_location: booking.wedding_location,
    special_requests: booking.notes, // Notes field contains plain text special requests
    notes: booking.notes, // Keep original notes field
    // Payment information
    payment: booking.payment_id ? {
      payment_id: booking.payment_id,
      amount: booking.payment_amount,
      receipt_url: booking.receipt_url,
      uploaded_at: booking.payment_uploaded_at,
      status: booking.payment_status,
      verified_at: booking.payment_verified_at
    } : null
  };
};

// Get booking statistics - FIXED to use correct field names
export const getBookingStats = async (filters = {}) => {
  const { planner_id, date_from, date_to } = filters;

  let query = `
    SELECT 
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
      COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings
    FROM bookings b
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE 1=1
  `;

  const params = [];

  if (planner_id) {
    query += ` AND ps.planner_id = ?`;
    params.push(planner_id);
  }

  if (date_from) {
    query += ` AND b.wedding_date >= ?`;
    params.push(date_from);
  }

  if (date_to) {
    query += ` AND b.wedding_date <= ?`;
    params.push(date_to);
  }

  const [rows] = await pool.query(query, params);
  return rows[0];
};

// Create or get client - FIXED to use correct field names
export const createOrGetClient = async (userData) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    wedding_date,
    wedding_location
  } = userData;

  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      `SELECT user_id FROM users WHERE email = ?`,
      [email]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].user_id;
    } else {
      // Create new user with default password hash
      const [userResult] = await pool.query(
        `INSERT INTO users (first_name, last_name, email, phone, role, password_hash) 
         VALUES (?, ?, ?, ?, 'client', 'temp_password_hash')`,
        [first_name, last_name, email, phone]
      );
      userId = userResult.insertId;
    }

    // Check if client profile exists
    const [existingClients] = await pool.query(
      `SELECT client_id FROM clients WHERE client_id = ?`,
      [userId]
    );

    if (existingClients.length === 0) {
      // Create client profile
      await pool.query(
        `INSERT INTO clients (client_id, wedding_date, wedding_location) 
         VALUES (?, ?, ?)`,
        [userId, wedding_date, wedding_location]
      );
    } else {
      // Update client profile
      await pool.query(
        `UPDATE clients SET wedding_date = ?, wedding_location = ? WHERE client_id = ?`,
        [wedding_date, wedding_location, userId]
      );
    }

    return userId;
  } catch (error) {
    console.error('Error creating/updating client:', error);
    throw error;
  }
};

// Get package availability for a date range
export const getPackageAvailabilityRange = async (packageId, startDate, endDate) => {
  const [rows] = await pool.query(`
    SELECT 
      date_val as available_date,
      COALESCE(pabd.total_slots, pda.total_slots) as total_slots,
      COALESCE(pabd.booked_slots, 0) as booked_slots,
      (COALESCE(pabd.total_slots, pda.total_slots) - COALESCE(pabd.booked_slots, 0)) as available_slots,
      CASE WHEN pud.unavailable_date IS NOT NULL THEN TRUE ELSE FALSE END as is_blocked,
      pud.reason as blocked_reason
    FROM (
      SELECT DATE_ADD(?, INTERVAL seq DAY) as date_val
      FROM (
        SELECT a.N + b.N * 10 + c.N * 100 as seq
        FROM (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
        CROSS JOIN (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
        CROSS JOIN (SELECT 0 as N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
      ) numbers
      WHERE DATE_ADD(?, INTERVAL seq DAY) <= ?
    ) dates
    LEFT JOIN package_default_availability pda ON pda.package_id = ?
    LEFT JOIN package_availability_by_date pabd ON pabd.package_id = ? AND pabd.available_date = dates.date_val
    LEFT JOIN package_unavailable_dates pud ON pud.package_id = ? AND pud.unavailable_date = dates.date_val
    ORDER BY date_val
  `, [startDate, startDate, endDate, packageId, packageId, packageId]);

  return rows;
};