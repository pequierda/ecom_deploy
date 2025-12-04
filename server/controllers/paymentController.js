// controllers/paymentController.js
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByClient,
  getPaymentsByPlanner,
  getPaymentsByBooking,
  updatePaymentStatus,
  updatePayment,
  deletePayment,
  searchPayments,
  getPaymentStats,
  getInvoiceData
} from "../models/paymentModel.js";
import { getBookingById } from "../models/bookingModel.js";

/* =======================
   PAYMENT CRUD OPERATIONS
======================= */

// Create a new payment record
export const addPayment = async (req, res) => {
  console.log('\n=== PAYMENT CREATION START ===');
  console.log('💳 Payment creation request received at:', new Date().toISOString());
  
  try {
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from token:', req.user);
    console.log('📄 File upload:', req.file ? {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');

    const {
      bookingId,
      amount
    } = req.body;

    // Validate required fields
    if (!bookingId || !amount) {
      return res.status(400).json({ 
        message: "Booking ID and amount are required" 
      });
    }

    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ 
        message: "Amount must be a valid positive number" 
      });
    }

    // Check if booking exists
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        message: "Booking not found" 
      });
    }

    // For clients, verify they own the booking
    if (req.user?.role === 'client' && booking.client_id !== req.user.userId) {
      return res.status(403).json({ 
        message: "You can only create payments for your own bookings" 
      });
    }

    // Handle file upload for receipt
    let receiptUrl = null;
    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
      console.log('📄 Receipt file processed, URL:', receiptUrl);
    }

    // Create the payment record
    const paymentId = await createPayment({
      booking_id: bookingId,
      amount: paymentAmount,
      receipt_url: receiptUrl,
      status: 'pending'
    });

    console.log('✅ Payment created successfully with ID:', paymentId);

    res.status(201).json({ 
      message: "Payment record created successfully",
      paymentId: paymentId,
      status: 'pending'
    });

  } catch (error) {
    console.error('\n❌ PAYMENT CREATION ERROR');
    console.error('💥 Error details:', error);
    
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  } finally {
    console.log('=== PAYMENT CREATION END ===\n');
  }
};

// Get all payments (admin only)
export const listAllPayments = async (req, res) => {
  try {
    const {
      status,
      planner_id,
      client_id,
      booking_id,
      date_from,
      date_to,
      amount_min,
      amount_max,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await searchPayments({
      status,
      planner_id,
      client_id,
      booking_id,
      date_from,
      date_to,
      amount_min,
      amount_max,
      search_term: search,
      limit: parseInt(limit),
      offset
    });

    // Get total count for pagination
    const stats = await getPaymentStats({
      planner_id,
      client_id,
      date_from,
      date_to
    });

    res.json({
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalItems: stats.total_payments,
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(stats.total_payments / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get payment by ID
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // For clients, verify they own the booking
    if (req.user?.role === 'client') {
      const booking = await getBookingById(payment.booking_id);
      if (booking.client_id !== req.user.userId) {
        return res.status(403).json({ 
          message: "You can only view payments for your own bookings" 
        });
      }
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get current client's payments
export const getMyPayments = async (req, res) => {
  try {
    const clientId = req.user?.userId;
    
    if (!clientId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure user is a client
    if (req.user?.role !== 'client') {
      return res.status(403).json({ message: "Access denied. Client role required." });
    }

    const payments = await getPaymentsByClient(clientId);
    
    // Group payments by booking for invoice generation
    const paymentsByBooking = {};
    const invoices = [];
    
    payments.forEach(payment => {
      if (!paymentsByBooking[payment.booking_id]) {
        paymentsByBooking[payment.booking_id] = {
          booking_id: payment.booking_id,
          package_title: payment.package_title,
          package_price: parseFloat(payment.package_price), // Ensure numeric
          business_name: payment.business_name,
          wedding_date: payment.wedding_date,
          booking_status: payment.booking_status,
          payments: [],
          total_paid: 0,
          balance: parseFloat(payment.package_price)
        };
      }
      
      paymentsByBooking[payment.booking_id].payments.push(payment);
      if (payment.status === 'verified') {
        paymentsByBooking[payment.booking_id].total_paid += parseFloat(payment.amount);
      }
    });

    // Convert to invoices array
    Object.values(paymentsByBooking).forEach(booking => {
      booking.balance = booking.package_price - booking.total_paid;
      
      // FIXED: Correct invoice status logic
      if (booking.total_paid >= booking.package_price) {
        booking.invoice_status = 'paid';
      } else if (booking.total_paid > 0) {
        booking.invoice_status = 'partial';
      } else {
        // No verified payments yet
        if (booking.booking_status === 'confirmed' || booking.booking_status === 'completed') {
          booking.invoice_status = 'unpaid';
        } else {
          booking.invoice_status = 'pending';
        }
      }
      
      invoices.push(booking);
    });

    // Calculate summary statistics - FIXED: Ensure numeric calculations
    const summary = {
      total_payments: payments.length,
      total_amount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
      verified_amount: payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + parseFloat(p.amount), 0),
      pending_amount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0),
      total_invoices: invoices.length
    };

    res.json({
      payments,
      invoices,
      summary
    });
    
  } catch (error) {
    console.error('Error fetching client payments:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get payments by planner ID
export const listPlannerPayments = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const {
      status,
      date_from,
      date_to,
      page = 1,
      limit = 20
    } = req.query;

    // For planners, ensure they can only see their own payments
    if (req.user?.role === 'planner' && req.user.userId !== parseInt(plannerId)) {
      return res.status(403).json({ 
        message: "You can only view payments for your own bookings" 
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const payments = await searchPayments({
      planner_id: plannerId,
      status,
      date_from,
      date_to,
      limit: parseInt(limit),
      offset
    });

    // Get stats for this planner
    const stats = await getPaymentStats({
      planner_id: plannerId,
      date_from,
      date_to
    });

    res.json({
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalItems: stats.total_payments,
        itemsPerPage: parseInt(limit),
        totalPages: Math.ceil(stats.total_payments / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching planner payments:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get payments by booking ID
export const listBookingPayments = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Check if booking exists
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // For clients, verify they own the booking
    if (req.user?.role === 'client' && booking.client_id !== req.user.userId) {
      return res.status(403).json({ 
        message: "You can only view payments for your own bookings" 
      });
    }

    const payments = await getPaymentsByBooking(bookingId);
    
    res.json({
      booking,
      payments
    });
  } catch (error) {
    console.error('Error fetching booking payments:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   PAYMENT STATUS MANAGEMENT
======================= */

// Verify payment (planner/admin only)
export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // For planners, ensure they can only verify payments for their own packages
    if (req.user?.role === 'planner') {
      const booking = await getBookingById(payment.booking_id);
      // We need to check if this payment belongs to the planner's package
      // This is already handled in the payment model by joining with planner data
      if (payment.planner_first_name && req.user.userId !== payment.planner_id) {
        return res.status(403).json({ 
          message: "You can only verify payments for your own bookings" 
        });
      }
    }

    const updated = await updatePaymentStatus(id, 'verified', req.user.userId);
    
    if (!updated) {
      return res.status(404).json({ message: "Payment not found or not updated" });
    }

    res.json({ 
      message: "Payment verified successfully",
      paymentId: id,
      status: 'verified'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Reject payment (planner/admin only)
export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const updated = await updatePaymentStatus(id, 'rejected', req.user.userId);
    
    if (!updated) {
      return res.status(404).json({ message: "Payment not found or not updated" });
    }

    res.json({ 
      message: "Payment rejected",
      paymentId: id,
      status: 'rejected'
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update payment details
export const editPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if payment exists
    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Only allow editing pending payments
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        message: "Only pending payments can be edited" 
      });
    }

    // For clients, verify they own the booking
    if (req.user?.role === 'client') {
      const booking = await getBookingById(payment.booking_id);
      if (booking.client_id !== req.user.userId) {
        return res.status(403).json({ 
          message: "You can only edit payments for your own bookings" 
        });
      }
    }

    const updated = await updatePayment(id, updateData);
    
    if (!updated) {
      return res.status(404).json({ message: "Payment not found or not updated" });
    }

    res.json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete payment (admin only)
export const removePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deletePayment(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   PAYMENT STATISTICS
======================= */

// Get payment statistics
export const getPaymentStatistics = async (req, res) => {
  try {
    const {
      planner_id,
      client_id,
      date_from,
      date_to
    } = req.query;

    // For planners, only allow their own stats
    if (req.user?.role === 'planner') {
      if (planner_id && req.user.userId !== parseInt(planner_id)) {
        return res.status(403).json({ 
          message: "You can only view your own payment statistics" 
        });
      }
      // Force the planner_id to be the current user
      req.query.planner_id = req.user.userId.toString();
    }

    const stats = await getPaymentStats({
      planner_id: req.query.planner_id,
      client_id,
      date_from,
      date_to
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   INVOICE GENERATION
======================= */

// Generate invoice data for a booking
export const generateInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Check if booking exists
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // For clients, verify they own the booking
    if (req.user?.role === 'client' && booking.client_id !== req.user.userId) {
      return res.status(403).json({ 
        message: "You can only generate invoices for your own bookings" 
      });
    }

    // Only allow invoice generation for confirmed bookings
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      return res.status(400).json({ 
        message: "Invoices can only be generated for confirmed or completed bookings" 
      });
    }

    const invoiceData = await getInvoiceData(bookingId);
    
    if (!invoiceData) {
      return res.status(404).json({ message: "Invoice data not found" });
    }

    // Calculate invoice totals
    const verifiedPayments = invoiceData.payments.filter(p => p.status === 'verified');
    const totalPaid = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = invoiceData.package_price - totalPaid;

    const invoice = {
      ...invoiceData,
      invoice_number: `INV-${bookingId.toString().padStart(6, '0')}`,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: invoiceData.wedding_date,
      total_amount: invoiceData.package_price,
      total_paid: totalPaid,
      balance,
      status: balance <= 0 ? 'paid' : (totalPaid > 0 ? 'partial' : 'unpaid'),
      verified_payments: verifiedPayments
    };

    res.json(invoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};