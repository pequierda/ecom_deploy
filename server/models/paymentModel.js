// models/paymentModel.js
import pool from "../config/db.js";

/* =======================
   PAYMENT CRUD OPERATIONS
======================= */

// Create a new payment record
export const createPayment = async (paymentData) => {
  const {
    booking_id,
    amount,
    receipt_url,
    status = 'pending'
  } = paymentData;

  console.log('💳 Creating payment record:', paymentData);

  const [result] = await pool.query(
    `INSERT INTO payments (booking_id, amount, receipt_url, status, uploaded_at) 
     VALUES (?, ?, ?, ?, NOW())`,
    [booking_id, amount, receipt_url, status]
  );
  
  console.log('✅ Payment created with ID:', result.insertId);
  return result.insertId;
};

// Get all payments with booking and user details
export const getAllPayments = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      b.wedding_date,
      b.wedding_location,
      b.status as booking_status,
      ps.title as package_title,
      ps.price as package_price,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      pl.business_name,
      vu.first_name as verified_by_first_name,
      vu.last_name as verified_by_last_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners pl ON ps.planner_id = pl.planner_id
    JOIN users pu ON pl.planner_id = pu.user_id
    LEFT JOIN users vu ON p.verified_by = vu.user_id
    ORDER BY p.uploaded_at DESC
  `);
  
  return rows;
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      b.wedding_date,
      b.wedding_location,
      b.status as booking_status,
      ps.title as package_title,
      ps.price as package_price,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      pl.business_name,
      pl.business_email,
      pl.business_phone,
      vu.first_name as verified_by_first_name,
      vu.last_name as verified_by_last_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners pl ON ps.planner_id = pl.planner_id
    JOIN users pu ON pl.planner_id = pu.user_id
    LEFT JOIN users vu ON p.verified_by = vu.user_id
    WHERE p.payment_id = ?
  `, [paymentId]);
  
  return rows[0] || null;
};

// Get payments by client ID
export const getPaymentsByClient = async (clientId) => {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      b.wedding_date,
      b.wedding_location,
      b.status as booking_status,
      ps.title as package_title,
      ps.price as package_price,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      pl.business_name,
      vu.first_name as verified_by_first_name,
      vu.last_name as verified_by_last_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN clients c ON b.client_id = c.client_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners pl ON ps.planner_id = pl.planner_id
    JOIN users pu ON pl.planner_id = pu.user_id
    LEFT JOIN users vu ON p.verified_by = vu.user_id
    WHERE c.client_id = ?
    ORDER BY p.uploaded_at DESC
  `, [clientId]);
  
  return rows;
};

// Get payments by planner ID
export const getPaymentsByPlanner = async (plannerId) => {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      b.wedding_date,
      b.wedding_location,
      b.status as booking_status,
      ps.title as package_title,
      ps.price as package_price,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      vu.first_name as verified_by_first_name,
      vu.last_name as verified_by_last_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners pl ON ps.planner_id = pl.planner_id
    LEFT JOIN users vu ON p.verified_by = vu.user_id
    WHERE pl.planner_id = ?
    ORDER BY p.uploaded_at DESC
  `, [plannerId]);
  
  return rows;
};

// Get payments by booking ID
export const getPaymentsByBooking = async (bookingId) => {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      b.wedding_date,
      b.wedding_location,
      b.status as booking_status,
      ps.title as package_title,
      ps.price as package_price,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      pl.business_name,
      vu.first_name as verified_by_first_name,
      vu.last_name as verified_by_last_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners pl ON ps.planner_id = pl.planner_id
    JOIN users pu ON pl.planner_id = pu.user_id
    LEFT JOIN users vu ON p.verified_by = vu.user_id
    WHERE p.booking_id = ?
    ORDER BY p.uploaded_at DESC
  `, [bookingId]);
  
  return rows;
};

// Update payment status
export const updatePaymentStatus = async (paymentId, status, verifiedBy = null) => {
  const [result] = await pool.query(
    `UPDATE payments 
     SET status = ?, verified_by = ?, verified_at = NOW() 
     WHERE payment_id = ?`,
    [status, verifiedBy, paymentId]
  );
  return result.affectedRows;
};

// Update payment details
export const updatePayment = async (paymentId, updateData) => {
  const {
    amount,
    receipt_url,
    status
  } = updateData;

  let query = 'UPDATE payments SET ';
  const params = [];
  const updates = [];

  if (amount !== undefined) {
    updates.push('amount = ?');
    params.push(amount);
  }

  if (receipt_url !== undefined) {
    updates.push('receipt_url = ?');
    params.push(receipt_url);
  }

  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length === 0) {
    return 0; // No updates to make
  }

  query += updates.join(', ') + ' WHERE payment_id = ?';
  params.push(paymentId);

  const [result] = await pool.query(query, params);
  return result.affectedRows;
};

// Delete payment
export const deletePayment = async (paymentId) => {
  const [result] = await pool.query(
    `DELETE FROM payments WHERE payment_id = ?`,
    [paymentId]
  );
  return result.affectedRows;
};

// Search payments with filters
export const searchPayments = async (filters) => {
  const {
    status,
    planner_id,
    client_id,
    booking_id,
    date_from,
    date_to,
    amount_min,
    amount_max,
    search_term,
    limit = 50,
    offset = 0
  } = filters;

  let query = `
    SELECT 
      p.*,
      b.wedding_date,
      b.wedding_location,
      b.status as booking_status,
      ps.title as package_title,
      ps.price as package_price,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      pl.business_name,
      vu.first_name as verified_by_first_name,
      vu.last_name as verified_by_last_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners pl ON ps.planner_id = pl.planner_id
    JOIN users pu ON pl.planner_id = pu.user_id
    LEFT JOIN users vu ON p.verified_by = vu.user_id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    query += ` AND p.status = ?`;
    params.push(status);
  }

  if (planner_id) {
    query += ` AND pl.planner_id = ?`;
    params.push(planner_id);
  }

  if (client_id) {
    query += ` AND c.client_id = ?`;
    params.push(client_id);
  }

  if (booking_id) {
    query += ` AND p.booking_id = ?`;
    params.push(booking_id);
  }

  if (date_from) {
    query += ` AND DATE(p.uploaded_at) >= ?`;
    params.push(date_from);
  }

  if (date_to) {
    query += ` AND DATE(p.uploaded_at) <= ?`;
    params.push(date_to);
  }

  if (amount_min) {
    query += ` AND p.amount >= ?`;
    params.push(amount_min);
  }

  if (amount_max) {
    query += ` AND p.amount <= ?`;
    params.push(amount_max);
  }

  if (search_term) {
    query += ` AND (
      u.first_name LIKE ? OR 
      u.last_name LIKE ? OR 
      u.email LIKE ? OR 
      ps.title LIKE ? OR 
      pl.business_name LIKE ?
    )`;
    const searchPattern = `%${search_term}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ` ORDER BY p.uploaded_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows;
};

// Get payment statistics
export const getPaymentStats = async (filters = {}) => {
  const { planner_id, client_id, date_from, date_to } = filters;

  let query = `
    SELECT 
      COUNT(*) as total_payments,
      COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN p.status = 'verified' THEN 1 END) as verified_payments,
      COUNT(CASE WHEN p.status = 'rejected' THEN 1 END) as rejected_payments,
      SUM(p.amount) as total_amount,
      SUM(CASE WHEN p.status = 'verified' THEN p.amount ELSE 0 END) as verified_amount,
      SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as pending_amount
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN package_services ps ON b.package_id = ps.package_id
    WHERE 1=1
  `;

  const params = [];

  if (planner_id) {
    query += ` AND ps.planner_id = ?`;
    params.push(planner_id);
  }

  if (client_id) {
    query += ` AND b.client_id = ?`;
    params.push(client_id);
  }

  if (date_from) {
    query += ` AND DATE(p.uploaded_at) >= ?`;
    params.push(date_from);
  }

  if (date_to) {
    query += ` AND DATE(p.uploaded_at) <= ?`;
    params.push(date_to);
  }

  const [rows] = await pool.query(query, params);
  return rows[0];
};

// Get invoice data for a booking
export const getInvoiceData = async (bookingId) => {
  const [rows] = await pool.query(`
    SELECT 
      b.booking_id,
      b.wedding_date,
      b.wedding_time,
      b.wedding_location,
      b.status as booking_status,
      b.created_at as booking_created_at,
      ps.title as package_title,
      ps.price as package_price,
      ps.description as package_description,
      u.first_name as client_first_name,
      u.last_name as client_last_name,
      u.email as client_email,
      u.phone as client_phone,
      pu.first_name as planner_first_name,
      pu.last_name as planner_last_name,
      pl.business_name,
      pl.business_email,
      pl.business_phone,
      pl.business_address,
      SUM(p.amount) as total_paid,
      COUNT(p.payment_id) as payment_count,
      GROUP_CONCAT(
        CONCAT(p.payment_id, ':', p.amount, ':', p.status, ':', DATE(p.uploaded_at))
        SEPARATOR '|'
      ) as payment_details
    FROM bookings b
    JOIN clients c ON b.client_id = c.client_id
    JOIN users u ON c.client_id = u.user_id
    JOIN package_services ps ON b.package_id = ps.package_id
    JOIN planners pl ON ps.planner_id = pl.planner_id
    JOIN users pu ON pl.planner_id = pu.user_id
    LEFT JOIN payments p ON b.booking_id = p.booking_id
    WHERE b.booking_id = ?
    GROUP BY b.booking_id
  `, [bookingId]);
  
  if (rows[0] && rows[0].payment_details) {
    // Parse payment details
    const payments = rows[0].payment_details.split('|').map(detail => {
      const [payment_id, amount, status, date] = detail.split(':');
      return {
        payment_id: parseInt(payment_id),
        amount: parseFloat(amount),
        status,
        uploaded_at: date
      };
    });
    rows[0].payments = payments;
    delete rows[0].payment_details;
  } else if (rows[0]) {
    rows[0].payments = [];
  }
  
  return rows[0] || null;
};