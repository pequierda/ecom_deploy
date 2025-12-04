// routes/plannerManagementRoutes.js
import express from "express";
import {
  getAllPlannersController,
  getPlannerController,
  getPlannersByStatusController,
  approvePlannerController,
  rejectPlannerController,
  setPlannerUnderReviewController,
  allowPlannerResubmissionController,
  searchPlannersController,
  getPlannerStatusCountsController,
  getPlannerPermitDocumentsController,
  updateDocumentStatusController,
  bulkUpdateDocumentsController,
  getDocumentByIdController,
  getAdminDashboardStatsController
} from "../controllers/plannerManagementController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============ ADMIN PLANNER MANAGEMENT ROUTES - UPDATED ============ */
/* All routes require admin authentication except search */

// Public search and filter (with pagination)
router.get("/search", searchPlannersController);

// Get all planners (admin only)
router.get("/", authenticateToken, requireRole(["admin"]), getAllPlannersController);

// Get planner status counts for dashboard
router.get("/counts", authenticateToken, requireRole(["admin"]), getPlannerStatusCountsController);

// Get statistics for admin dashboard (admin only)
router.get("/stats/overview", 
  authenticateToken, 
  requireRole(["admin"]), 
  getAdminDashboardStatsController
);

// Get planners by status (admin only)
router.get("/status/:status", authenticateToken, requireRole(["admin"]), getPlannersByStatusController);

// Get specific planner details (admin only)
router.get("/:plannerId", authenticateToken, requireRole(["admin"]), getPlannerController);

/* ============ PLANNER STATUS MANAGEMENT ============ */

// Approve planner (admin only)
router.put("/:plannerId/approve", 
  authenticateToken, 
  requireRole(["admin"]), 
  approvePlannerController
);

// Reject planner (admin only)
router.put("/:plannerId/reject", 
  authenticateToken, 
  requireRole(["admin"]), 
  rejectPlannerController
);

// Set planner under review (admin only)
router.put("/:plannerId/under-review", 
  authenticateToken, 
  requireRole(["admin"]), 
  setPlannerUnderReviewController
);

// Allow planner resubmission (admin only)
router.put("/:plannerId/allow-resubmission", 
  authenticateToken, 
  requireRole(["admin"]), 
  allowPlannerResubmissionController
);

/* ============ DOCUMENT MANAGEMENT - UPDATED ============ */

// Get planner documents (admin only)
router.get("/:plannerId/documents", 
  authenticateToken, 
  requireRole(["admin"]), 
  getPlannerPermitDocumentsController
);

// Get document details by ID (admin only)
router.get("/documents/:attachmentId", 
  authenticateToken, 
  requireRole(["admin"]), 
  getDocumentByIdController
);

// Update individual document status (admin only)
router.put("/documents/:attachmentId/status", 
  authenticateToken, 
  requireRole(["admin"]), 
  updateDocumentStatusController
);

// Bulk update documents for a planner (admin only)
router.put("/:plannerId/documents/bulk", 
  authenticateToken, 
  requireRole(["admin"]), 
  bulkUpdateDocumentsController
);

export default router;