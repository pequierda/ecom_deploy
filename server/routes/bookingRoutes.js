import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  addBooking,
  listAllBookings,
  getBooking,
  listClientBookings,
  listPlannerBookings,
  listPackageBookings,
  updateBookingStatusController,
  confirmBooking,
  cancelBookingController,
  editBooking,
  removeBooking,
  getBookingStatistics,
  searchBookingsController,
  getMyBookings,
  createClientBooking,
  cancelMyBooking,
  getMyBookingDetails
} from "../controllers/bookingController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure receipts directory exists
const receiptsDir = 'uploads/receipts';
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
  console.log(`✅ Created directory: ${receiptsDir}`);
}

// Configure multer for file uploads (receipts)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Double check directory exists before each upload
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }
    cb(null, receiptsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `receipt-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log(`📄 Uploading receipt: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

/* ============ CLIENT-SPECIFIC ROUTES ============ */

// Get current client's bookings (requires client role)
router.get("/my-bookings", 
  authenticateToken, 
  requireRole(["client"]), 
  getMyBookings
);

// Create booking for authenticated client
router.post("/my-bookings", 
  authenticateToken, 
  requireRole(["client"]),
  (req, res, next) => {
    upload.single('receiptFile')(req, res, (err) => {
      if (err) {
        console.error('📄 Upload error:', err);
        return handleUploadError(err, req, res, next);
      }
      
      // Log successful upload
      if (req.file) {
        console.log('✅ File uploaded successfully:', {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        });
      }
      
      next();
    });
  },
  createClientBooking
);

// Get specific booking details for client
router.get("/my-bookings/:id", 
  authenticateToken, 
  requireRole(["client"]), 
  getMyBookingDetails
);

// Cancel client's own booking
router.put("/my-bookings/:id/cancel", 
  authenticateToken, 
  requireRole(["client"]), 
  cancelMyBooking
);

/* ============ SPECIFIC ROUTES FIRST (before wildcards) ============ */

// Search bookings (admin and planners can search their own)
router.get("/search", authenticateToken, searchBookingsController);

// Get booking statistics (admin and planners for their own)
router.get("/stats/overview", authenticateToken, requireRole(["planner", "admin"]), getBookingStatistics);

// Get bookings by client ID
router.get("/client/:clientId", authenticateToken, listClientBookings);

// Get bookings by planner ID
router.get("/planner/:plannerId", authenticateToken, requireRole(["planner", "admin"]), listPlannerBookings);

// Get bookings by package ID
router.get("/package/:packageId", authenticateToken, requireRole(["planner", "admin"]), listPackageBookings);

/* ============ BOOKING CRUD ============ */

// Admin - Get all bookings with filters
router.get("/all", authenticateToken, requireRole(["admin"]), listAllBookings);

// AUTHENTICATED - Create new booking (requires login) - KEEP for backward compatibility
router.post("/", 
  authenticateToken, 
  (req, res, next) => {
    upload.single('receiptFile')(req, res, (err) => {
      if (err) {
        console.error('📄 Upload error:', err);
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  addBooking
);

// Public - Get specific booking by ID (for confirmation pages)
router.get("/:id", getBooking);

// Update booking details (client can update their own, planner/admin can update any)
router.put("/:id", authenticateToken, editBooking);

// Delete booking (admin only)
router.delete("/:id", authenticateToken, requireRole(["admin"]), removeBooking);

/* ============ BOOKING STATUS MANAGEMENT ============ */

// Update booking status (planner/admin only)
router.put("/:id/status", authenticateToken, requireRole(["planner", "admin"]), updateBookingStatusController);

// Confirm booking (planner/admin only)
router.put("/:id/confirm", authenticateToken, requireRole(["planner", "admin"]), confirmBooking);

// Cancel booking (client can cancel their own, planner/admin can cancel any)
router.put("/:id/cancel", authenticateToken, cancelBookingController);

export default router;