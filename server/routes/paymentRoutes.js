// routes/paymentRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  addPayment,
  listAllPayments,
  getPayment,
  getMyPayments,
  listPlannerPayments,
  listBookingPayments,
  verifyPayment,
  rejectPayment,
  editPayment,
  removePayment,
  getPaymentStatistics,
  generateInvoice
} from "../controllers/paymentController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'), false);
    }
  }
});

/* ============ CLIENT-SPECIFIC ROUTES ============ */

// Get current client's payments and invoices (requires client role)
router.get("/my-payments", 
  authenticateToken, 
  requireRole(["client"]), 
  getMyPayments
);

// Create payment for authenticated client or planner
router.post("/", 
  authenticateToken, 
  requireRole(["client", "planner", "admin"]),
  upload.single('receiptFile'), 
  addPayment
);

/* ============ INVOICE ROUTES ============ */

// Generate invoice for a booking (client can access their own, planner/admin can access all)
router.get("/invoice/:bookingId", 
  authenticateToken, 
  generateInvoice
);

/* ============ SPECIFIC ROUTES FIRST (before wildcards) ============ */

// Get payment statistics (planner/admin)
router.get("/stats/overview", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  getPaymentStatistics
);

// Get payments by planner ID (planner can only see their own, admin can see all)
router.get("/planner/:plannerId", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  listPlannerPayments
);

// Get payments by booking ID
router.get("/booking/:bookingId", 
  authenticateToken, 
  listBookingPayments
);

/* ============ PAYMENT CRUD ============ */

// Admin - Get all payments with filters
router.get("/all", 
  authenticateToken, 
  requireRole(["admin"]), 
  listAllPayments
);

// Get specific payment by ID
router.get("/:id", 
  authenticateToken, 
  getPayment
);

// Update payment details (client can update their own pending payments)
router.put("/:id", 
  authenticateToken, 
  upload.single('receiptFile'),
  editPayment
);

// Delete payment (admin only)
router.delete("/:id", 
  authenticateToken, 
  requireRole(["admin"]), 
  removePayment
);

/* ============ PAYMENT STATUS MANAGEMENT ============ */

// Verify payment (planner/admin only)
router.put("/:id/verify", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  verifyPayment
);

// Reject payment (planner/admin only)
router.put("/:id/reject", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  rejectPayment
);

export default router;