// routes/packageRoutes.js - Updated version with preparation days
import express from "express";
import {
  addPackage,
  listPackages,
  getPackage,
  listPlannerPackages,
  listCategoryPackages,
  editPackage,
  deletePackage,
  updatePackageRatingController,
  searchAndFilterPackages,
  addPackageInclusion,
  removePackageInclusion,
  getPackageDefaultSlotsController,
  updatePackageDefaultSlotsController,
  setDateSpecificSlotsController,
  updateDateSpecificSlotsController,
  addPackageUnavailableDate,
  getPackageUnavailableDates,
  removePackageUnavailableDate,
  checkDateAvailabilityController,
  addPackageAttachmentController,
  getPackageAttachments,
  removePackageAttachment,
  removeAllPackageAttachments,
  getPackageAvailabilityByDateController,
  getPackageAvailabilityRangeController,
  // Enhanced attachment functions
  uploadPackageImages,
  addPackageAttachmentByUrl,
  setPackageThumbnail,
  getPackageAttachmentsEnhanced,
  // NEW: Preparation days functions
  getUpcomingAvailabilityController,
  getPackagePreparationDaysController,
  checkPreparationPeriodController
} from "../controllers/packageController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ============ PACKAGE CRUD ============ */
// Public views
router.get("/", listPackages);
router.get("/search", searchAndFilterPackages);
router.get("/:id", getPackage);
router.get("/planner/:plannerId", listPlannerPackages);
router.get("/category/:categoryId", listCategoryPackages);

// Manage packages (planner only)
router.post("/", authenticateToken, requireRole(["planner"]), addPackage);
router.put("/:id", authenticateToken, requireRole(["planner"]), editPackage);
router.delete("/:id", authenticateToken, requireRole(["planner"]), deletePackage);

// Update package rating (system use - could be admin or automated)
router.put("/:packageId/rating", authenticateToken, requireRole(["admin"]), updatePackageRatingController);

/* ============ PACKAGE INCLUSIONS (planner only) ============ */
router.post("/inclusions", authenticateToken, requireRole(["planner"]), addPackageInclusion);
router.delete("/inclusions/:inclusionId", authenticateToken, requireRole(["planner"]), removePackageInclusion);

/* ============ PACKAGE DEFAULT SLOTS MANAGEMENT ============ */
// Public view - get default slots
router.get("/:packageId/default-slots", getPackageDefaultSlotsController);

// Update default slots (planner only)
router.put("/:packageId/default-slots", authenticateToken, requireRole(["planner"]), updatePackageDefaultSlotsController);

/* ============ DATE-SPECIFIC SLOTS MANAGEMENT ============ */
// Set/update date-specific slots (planner only)
router.post("/:packageId/date-slots", authenticateToken, requireRole(["planner"]), setDateSpecificSlotsController);
router.put("/:packageId/date-slots", authenticateToken, requireRole(["planner"]), updateDateSpecificSlotsController);

/* ============ PACKAGE UNAVAILABLE DATES ============ */
// Public view - check date availability
router.get("/:packageId/availability", checkDateAvailabilityController);

// Manage unavailable dates (planner only)
router.get("/:packageId/unavailable-dates", getPackageUnavailableDates);
router.post("/:packageId/unavailable-dates", authenticateToken, requireRole(["planner"]), addPackageUnavailableDate);
router.delete("/unavailable-dates/:unavailableId", authenticateToken, requireRole(["planner"]), removePackageUnavailableDate);

/* ============ PACKAGE AVAILABILITY BY DATE ============ */
// Get detailed availability for a specific date
router.get("/:packageId/availability/date", getPackageAvailabilityByDateController);

// Get availability for a range of dates (for calendar display)
router.get("/:packageId/availability/range", getPackageAvailabilityRangeController);

/* ============ NEW: PREPARATION DAYS MANAGEMENT ============ */
// Get preparation days for a package (public)
router.get("/:packageId/preparation-days", getPackagePreparationDaysController);

// Check if a specific date is in preparation period (public)
router.get("/:packageId/preparation-period", checkPreparationPeriodController);

// Get upcoming availability excluding preparation periods (public)
router.get("/:packageId/upcoming-availability", getUpcomingAvailabilityController);

/* ============ ENHANCED PACKAGE ATTACHMENTS ============ */
// Public view - get attachments for a specific package (enhanced)
router.get("/:packageId/attachments", getPackageAttachmentsEnhanced);

// Upload multiple image files (planner only)
router.post("/attachments/upload", 
  authenticateToken, 
  requireRole(["planner"]), 
  upload.array('images', 10), // Allow up to 10 images
  uploadPackageImages
);

// Add attachment via URL (planner only)
router.post("/attachments/url", 
  authenticateToken, 
  requireRole(["planner"]), 
  addPackageAttachmentByUrl
);

// Set specific attachment as thumbnail (planner only)
router.put("/attachments/:attachmentId/thumbnail", 
  authenticateToken, 
  requireRole(["planner"]), 
  setPackageThumbnail
);

// Legacy attachment management (keep for backwards compatibility)
router.post("/attachments", authenticateToken, requireRole(["planner"]), addPackageAttachmentController);
router.delete("/attachments/:attachmentId", authenticateToken, requireRole(["planner"]), removePackageAttachment);
router.delete("/:packageId/attachments", authenticateToken, requireRole(["planner"]), removeAllPackageAttachments);

// Serve uploaded images (add this to your main app.js)
// app.use('/uploads', express.static('uploads'));

export default router;