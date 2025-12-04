import {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByClient,
  getBookingsByPlanner,
  getBookingsByPackage,
  updateBookingStatus,
  updateBooking,
  cancelBooking,
  deleteBooking,
  searchBookings,
  getBookingStats
} from "../models/bookingModel.js";
import { checkDateAvailability } from "../models/packageModel.js";
import pool from "../config/db.js";

/* =======================
   HELPER FUNCTIONS
======================= */

// Get base URL for the server
const getBaseUrl = (req) => {
  // Try to get from environment variable first
  const envBaseUrl = process.env.SERVER_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }
  
  // Fallback: construct from request
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

// Construct full URL for uploaded files
const getFullFileUrl = (req, filename) => {
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}/uploads/receipts/${filename}`;
};

/* =======================
   BOOKING CRUD OPERATIONS
======================= */

// Create a new booking - FIXED to properly map venue to wedding_location and notes as plain text
export const addBooking = async (req, res) => {
  console.log('\n=== BOOKING CREATION START ===');
  console.log('📥 Request received at:', new Date().toISOString());
  
  try {
    // Debug: Log incoming request data
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from token:', req.user);
    console.log('📄 File upload:', req.file ? {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');

    const {
      packageId,
      weddingDate,
      weddingTime,
      venue, // This will be mapped to wedding_location
      specialRequests, // This will be stored as plain text in notes
      paymentMethod,
      paymentAmount,
      allowMarketing = false
    } = req.body;

    console.log('\n🔍 VALIDATION PHASE');
    
    // Validate required fields
    console.log('✅ Checking required fields...');
    if (!packageId || !weddingDate || !venue) {
      console.log('❌ Missing required fields:', {
        packageId: !!packageId,
        weddingDate: !!weddingDate,
        venue: !!venue
      });
      return res.status(400).json({ 
        message: "Package ID, wedding date, and venue are required" 
      });
    }
    console.log('✅ Required fields validated');

    // Validate wedding date
    console.log('📅 Validating wedding date:', weddingDate);
    const weddingDateObj = new Date(weddingDate);
    const today = new Date();
    console.log('📅 Wedding date object:', weddingDateObj);
    console.log('📅 Today date object:', today);
    
    if (weddingDateObj <= today) {
      console.log('❌ Wedding date validation failed - date is not in future');
      return res.status(400).json({ 
        message: "Wedding date must be in the future" 
      });
    }
    console.log('✅ Wedding date validated - is in future');

    // Validate wedding time if provided
    if (weddingTime) {
      console.log('⏰ Validating wedding time:', weddingTime);
      // Basic time format validation (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(weddingTime)) {
        console.log('❌ Invalid time format');
        return res.status(400).json({ 
          message: "Wedding time must be in HH:MM format" 
        });
      }
      console.log('✅ Wedding time validated');
    }

    console.log('\n🔍 AUTHENTICATION PHASE');
    
    // Get client_id from authenticated user
    let clientId = req.user?.userId;
    console.log('👤 Client ID from token:', clientId);
    
    if (!clientId) {
      console.log('❌ No client ID found - user not authenticated');
      return res.status(401).json({
        message: "Authentication required for booking. Please login or create an account."
      });
    }
    console.log('✅ User authenticated, client ID:', clientId);

    console.log('\n🧹 CLEANUP PHASE - Removing invalid bookings');
    
    // Clean up any bookings that were created with today's date due to the NOW() bug
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('🔍 Checking for invalid bookings with wedding_date =', today);
      
      // Find bookings where wedding_date equals today (these are likely from the NOW() bug)
      const [invalidBookings] = await pool.query(`
        SELECT booking_id, wedding_date, created_at, status
        FROM bookings 
        WHERE client_id = ? 
          AND DATE(wedding_date) = ?
          AND status = 'pending'
      `, [clientId, today]);
      
      console.log('🚫 Found invalid bookings:', invalidBookings);
      
      if (invalidBookings.length > 0) {
        // Delete these invalid bookings
        const [deleteResult] = await pool.query(`
          DELETE FROM bookings 
          WHERE client_id = ? 
            AND DATE(wedding_date) = ?
            AND status = 'pending'
        `, [clientId, today]);
        
        console.log('✅ Cleaned up', deleteResult.affectedRows, 'invalid bookings');
      }
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error (non-fatal):', cleanupError);
      // Continue with booking creation even if cleanup fails
    }

    console.log('\n🔍 AVAILABILITY CHECK PHASE');
    
    // Check package availability for the specific date
    console.log('📦 Checking availability for package:', packageId, 'on date:', weddingDate);
    const availability = await checkDateAvailability(packageId, weddingDate);
    console.log('📊 Availability result:', availability);
    
    if (!availability.available) {
      console.log('❌ Package not available on selected date');
      return res.status(400).json({ 
        message: availability.reason || "Package is not available for this date"
      });
    }
    console.log('✅ Package is available on selected date');

    console.log('\n🔍 CLIENT PROFILE CHECK PHASE');
    
    // Verify user is a client or create client profile if needed
    try {
      console.log('🔍 Checking for existing client profile...');
      const [existingClient] = await pool.query(
        `SELECT client_id FROM clients WHERE client_id = ?`,
        [clientId]
      );
      console.log('📊 Existing client query result:', existingClient);

      if (existingClient.length === 0) {
        console.log('👤 No client profile found - creating new client profile');
        await pool.query(
          `INSERT INTO clients (client_id, wedding_date, wedding_location) 
           VALUES (?, ?, ?)`,
          [clientId, weddingDate, venue]
        );
        console.log('✅ Client profile created successfully');
      } else {
        console.log('✅ Existing client profile found');
      }
    } catch (profileError) {
      console.error('❌ Error checking/creating client profile:', profileError);
      return res.status(500).json({
        message: "Error setting up client profile"
      });
    }

    console.log('\n🔍 FILE UPLOAD PROCESSING PHASE');
    
    // Handle file upload for receipt - UPDATED to use full URL
    let receiptUrl = null;
    if (req.file) {
      receiptUrl = getFullFileUrl(req, req.file.filename);
      console.log('📄 Receipt file processed, full URL:', receiptUrl);
    } else {
      console.log('📄 No receipt file uploaded');
    }

    console.log('\n🔍 BOOKING CREATION PHASE');
    
    // FIXED: Create booking with correct field mapping
    console.log('📝 Creating booking with correct field mapping:', {
      client_id: clientId,
      package_id: packageId,
      wedding_date: weddingDate,
      wedding_time: weddingTime,
      wedding_location: venue, // FIXED: Map venue to wedding_location
      special_requests: specialRequests, // FIXED: Map to special_requests for plain text storage
      status: 'pending'
    });

    const bookingId = await createBooking({
      client_id: clientId,
      package_id: packageId,
      wedding_date: weddingDate,
      wedding_time: weddingTime,
      wedding_location: venue, // FIXED: Properly map venue to wedding_location
      special_requests: specialRequests, // FIXED: Store as plain text in notes field
      status: 'pending'
    });

    console.log('✅ Booking created successfully with ID:', bookingId);
    console.log('📅 Wedding date stored correctly:', weddingDate);
    console.log('📍 Venue stored in wedding_location:', venue);
    console.log('📝 Special requests stored as plain text in notes:', specialRequests);

    console.log('\n🔍 PAYMENT RECORD PHASE');
    
    // Create payment record if payment method and amount provided
    if (paymentMethod && paymentAmount) {
      console.log('💳 Creating payment record:', {
        booking_id: bookingId,
        amount: paymentAmount,
        payment_method: paymentMethod,
        receipt_url: receiptUrl, // Now contains full URL
        status: 'pending'
      });

      if (receiptUrl) {
        try {
          const paymentId = await createPaymentRecord({
            booking_id: bookingId,
            amount: paymentAmount,
            payment_method: paymentMethod,
            receipt_url: receiptUrl, // Full URL stored
            status: 'pending'
          });
          console.log('✅ Payment record created with ID:', paymentId);
          console.log('🔗 Full receipt URL stored:', receiptUrl);
        } catch (paymentError) {
          console.error('❌ Error creating payment record:', paymentError);
          // Continue without failing the booking
        }
      } else {
        console.log('⚠️ Payment method and amount provided but no receipt file - skipping payment record');
      }
    } else {
      console.log('💳 No payment information provided - skipping payment record');
    }

    const formattedBookingId = `BK${String(bookingId).padStart(6, '0')}`;
    console.log('📋 Formatted booking ID:', formattedBookingId);

    console.log('\n✅ BOOKING CREATION SUCCESS');
    console.log('🎉 Booking completed successfully!');

    res.status(201).json({ 
      message: "Booking created successfully",
      bookingId: formattedBookingId,
      status: 'pending'
    });

  } catch (error) {
    console.error('\n❌ BOOKING CREATION ERROR');
    console.error('💥 Error details:', error);
    console.error('📚 Error stack:', error.stack);
    
    // Handle database constraint errors from triggers
    if (error.message.includes('Client already has a booking on this date')) {
      console.log('🚫 Database constraint: Client already has booking on this date');
      return res.status(400).json({ 
        message: "You already have a booking on this date. If this seems wrong, please try again or contact support." 
      });
    }
    
    if (error.message.includes('not available on the selected date')) {
      console.log('🚫 Database constraint: Package not available on selected date');
      return res.status(400).json({ 
        message: "This package is not available on the selected date" 
      });
    }

    if (error.message.includes('No available slots')) {
      console.log('🚫 Database constraint: No available slots');
      return res.status(400).json({ 
        message: "No available slots for this date" 
      });
    }

    console.log('💥 Sending 500 error response');
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  } finally {
    console.log('=== BOOKING CREATION END ===\n');
  }
};

// Helper function with debugging
const createPaymentRecord = async (paymentData) => {
  console.log('💳 Creating payment record with data:', paymentData);
  
  const { booking_id, amount, payment_method, receipt_url, status = 'pending' } = paymentData;
  
  try {
    const [result] = await pool.query(
      `INSERT INTO payments (booking_id, amount, receipt_url, status) 
       VALUES (?, ?, ?, ?)`,
      [booking_id, amount, receipt_url, status]
    );
    
    console.log('✅ Payment record created, insert ID:', result.insertId);
    return result.insertId;
  } catch (error) {
    console.error('❌ Error creating payment record:', error);
    throw error;
  }
};

// Update the guest booking function as well - FIXED mapping
export const addGuestBooking = async (req, res) => {
  console.log('\n=== GUEST BOOKING CREATION START ===');
  console.log('📥 Guest booking request received at:', new Date().toISOString());

  try {
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

    const {
      // Minimal client info for guest booking
      email,
      firstName,
      lastName,
      phone,
      // Booking details
      packageId,
      weddingDate,
      weddingTime,
      venue, // Will be mapped to wedding_location
      specialRequests, // Will be stored as plain text in notes
      allowMarketing = false
    } = req.body;

    console.log('\n🔍 GUEST VALIDATION PHASE');
    
    // Validate required fields
    console.log('✅ Checking required fields for guest booking...');
    if (!packageId || !weddingDate || !venue || !email || !firstName || !lastName) {
      console.log('❌ Missing required fields for guest booking:', {
        packageId: !!packageId,
        weddingDate: !!weddingDate,
        venue: !!venue,
        email: !!email,
        firstName: !!firstName,
        lastName: !!lastName
      });
      return res.status(400).json({ 
        message: "Package ID, wedding date, venue, email, first name, and last name are required" 
      });
    }
    console.log('✅ Required fields for guest booking validated');

    // Validate wedding date
    console.log('📅 Validating wedding date:', weddingDate);
    const weddingDateObj = new Date(weddingDate);
    if (weddingDateObj <= new Date()) {
      console.log('❌ Wedding date validation failed - date is not in future');
      return res.status(400).json({ 
        message: "Wedding date must be in the future" 
      });
    }
    console.log('✅ Wedding date validated');

    // Validate wedding time if provided
    if (weddingTime) {
      console.log('⏰ Validating wedding time:', weddingTime);
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(weddingTime)) {
        console.log('❌ Invalid time format');
        return res.status(400).json({ 
          message: "Wedding time must be in HH:MM format" 
        });
      }
      console.log('✅ Wedding time validated');
    }

    console.log('\n🔍 AVAILABILITY CHECK PHASE');
    
    // Check package availability
    const availability = await checkDateAvailability(packageId, weddingDate);
    console.log('📊 Availability result:', availability);
    
    if (!availability.available) {
      console.log('❌ Package not available on selected date');
      return res.status(400).json({ 
        message: availability.reason || "Package is not available for this date"
      });
    }
    console.log('✅ Package is available');

    console.log('\n🔍 GUEST USER CREATION PHASE');
    
    // Create or get guest user
    let clientId;
    try {
      console.log('👤 Checking for existing user with email:', email);
      
      // Check if user exists
      const [existingUsers] = await pool.query(
        `SELECT user_id FROM users WHERE email = ?`,
        [email]
      );
      
      console.log('📊 Existing user query result:', existingUsers);

      if (existingUsers.length > 0) {
        clientId = existingUsers[0].user_id;
        console.log('✅ Found existing user, client ID:', clientId);
      } else {
        console.log('👤 No existing user found - creating guest user');
        
        // Create guest user
        const [userResult] = await pool.query(
          `INSERT INTO users (first_name, last_name, email, phone, role, password_hash) 
           VALUES (?, ?, ?, ?, 'client', 'guest_user')`,
          [firstName, lastName, email, phone || '']
        );
        clientId = userResult.insertId;
        console.log('✅ Guest user created with ID:', clientId);

        // Create client profile
        console.log('👤 Creating client profile for guest user');
        await pool.query(
          `INSERT INTO clients (client_id, wedding_date, wedding_location) 
           VALUES (?, ?, ?)`,
          [clientId, weddingDate, venue]
        );
        console.log('✅ Client profile created for guest user');
      }
    } catch (userError) {
      console.error('❌ Error creating guest user:', userError);
      return res.status(500).json({
        message: "Error creating user account"
      });
    }

    console.log('\n🔍 GUEST BOOKING CREATION PHASE');
    
    // FIXED: Create booking with correct field mapping
    console.log('📝 Creating guest booking with correct field mapping:', {
      client_id: clientId,
      package_id: packageId,
      wedding_date: weddingDate,
      wedding_time: weddingTime,
      wedding_location: venue, // FIXED: Map venue to wedding_location
      special_requests: specialRequests, // FIXED: Store as plain text
      status: 'pending'
    });

    const bookingId = await createBooking({
      client_id: clientId,
      package_id: packageId,
      wedding_date: weddingDate,
      wedding_time: weddingTime,
      wedding_location: venue, // FIXED: Properly map venue to wedding_location
      special_requests: specialRequests, // FIXED: Store as plain text in notes
      status: 'pending'
    });

    console.log('✅ Guest booking created successfully with ID:', bookingId);
    console.log('📍 Venue stored in wedding_location:', venue);
    console.log('📝 Special requests stored as plain text:', specialRequests);

    const formattedBookingId = `BK${String(bookingId).padStart(6, '0')}`;
    console.log('📋 Formatted booking ID:', formattedBookingId);

    console.log('\n✅ GUEST BOOKING CREATION SUCCESS');

    res.status(201).json({ 
      message: "Booking created successfully",
      bookingId: formattedBookingId,
      status: 'pending'
    });

  } catch (error) {
    console.error('\n❌ GUEST BOOKING CREATION ERROR');
    console.error('💥 Error details:', error);
    console.error('📚 Error stack:', error.stack);
    
    // Handle database constraint errors
    if (error.message.includes('Client already has a booking on this date')) {
      console.log('🚫 Database constraint: Client already has booking on this date');
      return res.status(400).json({ 
        message: "You already have a booking on this date" 
      });
    }
    
    if (error.message.includes('not available on the selected date')) {
      console.log('🚫 Database constraint: Package not available on selected date');
      return res.status(400).json({ 
        message: "This package is not available on the selected date" 
      });
    }

    console.log('💥 Sending 500 error response');
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  } finally {
    console.log('=== GUEST BOOKING CREATION END ===\n');
  }
};

// Debug route for testing
export const debugClientBookings = async (req, res) => {
  try {
    const clientId = req.user?.userId;
    
    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check all bookings for this client
    const [bookings] = await pool.query(`
      SELECT 
        booking_id,
        client_id,
        package_id,
        wedding_date,
        wedding_time,
        wedding_location,
        notes,
        status,
        created_at,
        DATE(wedding_date) as wedding_date_only,
        DATE(created_at) as created_date_only
      FROM bookings 
      WHERE client_id = ?
      ORDER BY created_at DESC
    `, [clientId]);

    const today = new Date().toISOString().split('T')[0];
    const todayConflicts = bookings.filter(booking => 
      booking.wedding_date_only === today && 
      booking.status !== 'cancelled'
    );
    
    res.json({
      clientId,
      allBookings: bookings,
      todayConflicts,
      today,
      message: "Debug information for your bookings"
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: "Error getting debug info" });
  }
};

// Rest of the controller functions...
export const listAllBookings = async (req, res) => {
  try {
    const {
      status,
      planner_id,
      client_id,
      package_id,
      date_from,
      date_to,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await searchBookings({
      status,
      planner_id,
      client_id,
      package_id,
      date_from,
      date_to,
      search_term: search,
      limit: parseInt(limit),
      offset
    });

    // Get total count for pagination
    const stats = await getBookingStats({
      planner_id,
      date_from,
      date_to
    });

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalItems: stats.total_bookings,
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(stats.total_bookings / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get booking by ID
export const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get bookings by client ID
export const listClientBookings = async (req, res) => {
  try {
    const { clientId } = req.params;
    const bookings = await getBookingsByClient(clientId);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get bookings by planner ID
export const listPlannerBookings = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const {
      status,
      date_from,
      date_to,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await searchBookings({
      planner_id: plannerId,
      status,
      date_from,
      date_to,
      limit: parseInt(limit),
      offset
    });

    // Get stats for this planner
    const stats = await getBookingStats({
      planner_id: plannerId,
      date_from,
      date_to
    });

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalItems: stats.total_bookings,
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(stats.total_bookings / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching planner bookings:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get bookings by package ID
export const listPackageBookings = async (req, res) => {
  try {
    const { packageId } = req.params;
    const bookings = await getBookingsByPackage(packageId);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching package bookings:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   BOOKING STATUS MANAGEMENT
======================= */

// Update booking status
export const updateBookingStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: pending, confirmed, cancelled, completed" 
      });
    }

    // Check if booking exists
    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updated = await updateBookingStatus(id, status, notes);
    
    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ 
      message: `Booking status updated to ${status}`,
      bookingId: id,
      status 
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    
    // Handle database constraints (from triggers)
    if (error.message.includes('No available slots')) {
      return res.status(400).json({ 
        message: "Cannot confirm booking: No available slots for this date" 
      });
    }
    
    if (error.message.includes('Client already has a booking')) {
      return res.status(400).json({ 
        message: "Cannot confirm booking: Client already has a booking on this date" 
      });
    }
    
    if (error.message.includes('not available on the selected date')) {
      return res.status(400).json({ 
        message: "Cannot confirm booking: Package is not available on the selected date" 
      });
    }

    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Confirm booking
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const updated = await updateBookingStatus(id, 'confirmed', notes);
    
    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ 
      message: "Booking confirmed successfully",
      bookingId: id,
      status: 'confirmed'
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    
    // Handle database constraints
    if (error.message.includes('No available slots')) {
      return res.status(400).json({ 
        message: "Cannot confirm booking: No available slots for this date" 
      });
    }
    
    if (error.message.includes('Client already has a booking')) {
      return res.status(400).json({ 
        message: "Cannot confirm booking: Client already has a booking on this date" 
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Cancel booking
export const cancelBookingController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updated = await cancelBooking(id);
    
    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Optionally add cancellation reason to notes
    if (reason) {
      await updateBookingStatus(id, 'cancelled', reason);
    }

    res.json({ 
      message: "Booking cancelled successfully",
      bookingId: id,
      status: 'cancelled'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   BOOKING DETAILS UPDATE
======================= */

// Update booking details - FIXED to handle correct field names
export const editBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if booking exists
    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Don't allow updating confirmed or completed bookings
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return res.status(400).json({ 
        message: "Cannot update confirmed or completed bookings" 
      });
    }

    // Map venue to wedding_location if provided
    if (updateData.venue) {
      updateData.wedding_location = updateData.venue;
      delete updateData.venue;
    }

    // Map specialRequests to special_requests if provided
    if (updateData.specialRequests) {
      updateData.special_requests = updateData.specialRequests;
      delete updateData.specialRequests;
    }

    const updated = await updateBooking(id, updateData);
    
    if (!updated) {
      return res.status(404).json({ message: "Booking not found or not updated" });
    }

    res.json({ message: "Booking updated successfully" });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   BOOKING DELETION
======================= */

// Delete booking (hard delete - admin only)
export const removeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteBooking(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   BOOKING STATISTICS
======================= */

// Get booking statistics
export const getBookingStatistics = async (req, res) => {
  try {
    const {
      planner_id,
      date_from,
      date_to
    } = req.query;

    const stats = await getBookingStats({
      planner_id,
      date_from,
      date_to
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   SEARCH BOOKINGS
======================= */

// Search bookings with advanced filters
export const searchBookingsController = async (req, res) => {
  try {
    const {
      status,
      planner_id,
      client_id,
      package_id,
      date_from,
      date_to,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await searchBookings({
      status,
      planner_id,
      client_id,
      package_id,
      date_from,
      date_to,
      search_term: search,
      limit: parseInt(limit),
      offset
    });

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalItems: bookings.length,
        itemsPerPage: parseInt(limit),
        hasNext: bookings.length === parseInt(limit),
        hasPrev: parseInt(page) > 1
      },
      filters: {
        status,
        planner_id,
        client_id,
        package_id,
        date_from,
        date_to,
        search
      }
    });
  } catch (error) {
    console.error('Error searching bookings:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   CLIENT-SPECIFIC BOOKING OPERATIONS
======================= */

// Get current user's bookings (client-specific)
export const getMyBookings = async (req, res) => {
  try {
    const clientId = req.user?.userId;
    
    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is a client
    if (req.user?.role !== 'client') {
      return res.status(403).json({ message: "Access denied. Client role required." });
    }

    // Extract query parameters
    const {
      status,
      search,
      page = 1,
      limit = 50
    } = req.query;

    console.log('📋 Getting bookings for client:', clientId, 'with filters:', { status, search });
    
    // If specific status filter is provided, use search function
    if (status || search) {
      // ALWAYS get overall summary counts first (unfiltered)
      const allBookings = await getBookingsByClient(clientId);
      
      // Calculate detailed status counts from all bookings
      const detailedStatusCounts = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
      };

      const overallSummary = {
        upcoming: 0,
        completed: 0,
        cancelled: 0
      };

      // Count by actual status
      allBookings.forEach(booking => {
        detailedStatusCounts[booking.status]++;
        
        // For general categorization
        if (booking.status === 'cancelled') {
          overallSummary.cancelled++;
        } else if (booking.status === 'completed') {
          overallSummary.completed++;
        } else if (booking.status === 'pending' || booking.status === 'confirmed') {
          overallSummary.upcoming++;
        }
      });

      // Now get filtered results
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const filteredBookings = await searchBookings({
        client_id: clientId,
        status,
        search_term: search,
        limit: parseInt(limit),
        offset
      });

      console.log('📊 Filtered bookings:', filteredBookings.length);
      console.log('📊 Overall summary:', overallSummary);
      console.log('📊 Detailed status counts:', detailedStatusCounts);
      
      // Categorize filtered results
      const categorizedBookings = {
        upcoming: [],
        completed: [],
        cancelled: []
      };
      
      filteredBookings.forEach(booking => {
        if (booking.status === 'pending' || booking.status === 'confirmed') {
          categorizedBookings.upcoming.push(booking);
        } else if (booking.status === 'completed') {
          categorizedBookings.completed.push(booking);
        } else if (booking.status === 'cancelled') {
          categorizedBookings.cancelled.push(booking);
        }
      });

      // If status filter is applied, only return that category in bookings
      if (status) {
        const resultBookings = {
          upcoming: [],
          completed: [],
          cancelled: []
        };
        
        if (status === 'pending' || status === 'confirmed') {
          resultBookings.upcoming = filteredBookings.filter(b => b.status === status);
        } else if (status === 'completed') {
          resultBookings.completed = filteredBookings.filter(b => b.status === status);
        } else if (status === 'cancelled') {
          resultBookings.cancelled = filteredBookings.filter(b => b.status === status);
        }
        
        return res.json({
          bookings: resultBookings,
          total: filteredBookings.length,
          summary: overallSummary, // Use overall summary for tab counts
          statusCounts: detailedStatusCounts, // Detailed status counts for stats cards
          filteredSummary: {
            upcoming: resultBookings.upcoming.length,
            completed: resultBookings.completed.length,
            cancelled: resultBookings.cancelled.length
          },
          pagination: {
            currentPage: parseInt(page),
            totalItems: filteredBookings.length,
            itemsPerPage: parseInt(limit),
            hasNext: filteredBookings.length === parseInt(limit),
            hasPrev: parseInt(page) > 1
          }
        });
      }

      return res.json({
        bookings: categorizedBookings,
        total: filteredBookings.length,
        summary: overallSummary,
        statusCounts: detailedStatusCounts, // Add detailed status counts
        pagination: {
          currentPage: parseInt(page),
          totalItems: filteredBookings.length,
          itemsPerPage: parseInt(limit),
          hasNext: filteredBookings.length === parseInt(limit),
          hasPrev: parseInt(page) > 1
        }
      });
    }

    // Default behavior - get all bookings and categorize
    const bookings = await getBookingsByClient(clientId);
    console.log('📊 Raw bookings from database:', bookings.map(b => ({ id: b.booking_id, status: b.status, date: b.wedding_date })));
    
    // Initialize detailed status counts
    const detailedStatusCounts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    const categorizedBookings = {
      upcoming: [],
      completed: [],
      cancelled: []
    };

    // Process each booking
    bookings.forEach(booking => {
      console.log(`📅 Processing booking ${booking.booking_id}: status=${booking.status}`);
      
      // Count by actual status - ensure we handle all possible statuses
      if (booking.status && detailedStatusCounts.hasOwnProperty(booking.status)) {
        detailedStatusCounts[booking.status]++;
      } else {
        console.log(`⚠️ Unknown status for booking ${booking.booking_id}: ${booking.status}`);
      }
      
      // Categorize for display
      if (booking.status === 'cancelled') {
        categorizedBookings.cancelled.push(booking);
        console.log(`✅ Added booking ${booking.booking_id} to cancelled`);
      } else if (booking.status === 'completed') {
        categorizedBookings.completed.push(booking);
        console.log(`✅ Added booking ${booking.booking_id} to completed`);
      } else if (booking.status === 'pending' || booking.status === 'confirmed') {
        categorizedBookings.upcoming.push(booking);
        console.log(`✅ Added booking ${booking.booking_id} to upcoming (${booking.status})`);
      } else {
        console.log(`⚠️ Uncategorized status for booking ${booking.booking_id}: ${booking.status}`);
      }
    });

    console.log('📊 Final categorization:', {
      upcoming: categorizedBookings.upcoming.length,
      completed: categorizedBookings.completed.length,
      cancelled: categorizedBookings.cancelled.length
    });

    console.log('📊 Detailed status counts calculated:', detailedStatusCounts);

    res.json({
      bookings: categorizedBookings,
      total: bookings.length,
      summary: {
        upcoming: categorizedBookings.upcoming.length,
        completed: categorizedBookings.completed.length,
        cancelled: categorizedBookings.cancelled.length
      },
      statusCounts: detailedStatusCounts // Ensure statusCounts are always returned
    });
    
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Create booking for authenticated client
export const createClientBooking = async (req, res) => {
  console.log('\n=== CLIENT BOOKING CREATION START ===');
  console.log('📥 Client booking request received at:', new Date().toISOString());
  
  try {
    const clientId = req.user?.userId;
    
    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is a client
    if (req.user?.role !== 'client') {
      return res.status(403).json({ message: "Access denied. Client role required." });
    }

    console.log('👤 Authenticated client ID:', clientId);
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

    const {
      packageId,
      weddingDate,
      weddingTime,
      venue,
      specialRequests,
      paymentMethod,
      paymentAmount
    } = req.body;

    // Validate required fields
    if (!packageId || !weddingDate || !venue) {
      return res.status(400).json({ 
        message: "Package ID, wedding date, and venue are required" 
      });
    }

    // Validate wedding date is in the future
    const weddingDateObj = new Date(weddingDate);
    if (weddingDateObj <= new Date()) {
      return res.status(400).json({ 
        message: "Wedding date must be in the future" 
      });
    }

    // Check package availability
    const availability = await checkDateAvailability(packageId, weddingDate);
    if (!availability.available) {
      return res.status(400).json({ 
        message: availability.reason || "Package is not available for this date"
      });
    }

    // Ensure client profile exists
    try {
      const [existingClient] = await pool.query(
        `SELECT client_id FROM clients WHERE client_id = ?`,
        [clientId]
      );

      if (existingClient.length === 0) {
        await pool.query(
          `INSERT INTO clients (client_id, wedding_date, wedding_location) 
           VALUES (?, ?, ?)`,
          [clientId, weddingDate, venue]
        );
      }
    } catch (profileError) {
      console.error('Error checking/creating client profile:', profileError);
      return res.status(500).json({
        message: "Error setting up client profile"
      });
    }

    // Create the booking
    const bookingId = await createBooking({
      client_id: clientId,
      package_id: packageId,
      wedding_date: weddingDate,
      wedding_time: weddingTime,
      wedding_location: venue,
      special_requests: specialRequests,
      status: 'pending'
    });

    // Handle payment record if provided - UPDATED with full URL
    if (paymentMethod && paymentAmount && req.file) {
      const receiptUrl = getFullFileUrl(req, req.file.filename);
      console.log('💳 Creating payment record with full URL:', receiptUrl);
      
      try {
        await createPaymentRecord({
          booking_id: bookingId,
          amount: paymentAmount,
          payment_method: paymentMethod,
          receipt_url: receiptUrl, // Full URL stored
          status: 'pending'
        });
        console.log('✅ Payment record created with full URL stored');
      } catch (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Continue without failing the booking
      }
    }

    const formattedBookingId = `BK${String(bookingId).padStart(6, '0')}`;

    console.log('✅ Client booking created successfully');
    res.status(201).json({ 
      message: "Booking created successfully",
      bookingId: formattedBookingId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Client booking creation error:', error);
    
    if (error.message.includes('Client already has a booking on this date')) {
      return res.status(400).json({ 
        message: "You already have a booking on this date" 
      });
    }
    
    if (error.message.includes('not available on the selected date')) {
      return res.status(400).json({ 
        message: "This package is not available on the selected date" 
      });
    }

    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Cancel client's own booking
export const cancelMyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const clientId = req.user?.userId;

    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is a client
    if (req.user?.role !== 'client') {
      return res.status(403).json({ message: "Access denied. Client role required." });
    }

    // Verify booking belongs to this client
    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.client_id !== clientId) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed') {
      return res.status(400).json({ message: "Cannot cancel completed bookings" });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // Cancel the booking
    await cancelBooking(id);
    
    // Add cancellation reason if provided
    if (reason) {
      await updateBookingStatus(id, 'cancelled', reason);
    }

    res.json({ 
      message: "Booking cancelled successfully",
      bookingId: id,
      status: 'cancelled'
    });

  } catch (error) {
    console.error('Error cancelling client booking:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get specific booking details for client
export const getMyBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user?.userId;

    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is a client
    if (req.user?.role !== 'client') {
      return res.status(403).json({ message: "Access denied. Client role required." });
    }

    const booking = await getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify booking belongs to this client
    if (booking.client_id !== clientId) {
      return res.status(403).json({ message: "You can only view your own bookings" });
    }

    res.json(booking);

  } catch (error) {
    console.error('Error fetching client booking details:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};