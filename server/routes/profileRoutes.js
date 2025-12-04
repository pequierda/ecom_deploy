// routes/profileRoutes.js
import express from "express";
import { 
  getProfile, 
  updatePersonalInfo, 
  uploadProfilePicture,
  uploadPermitDocument,
  getStatistics,
  getRecentReviews 
} from "../controllers/profileController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { allowAllPlanners, requirePlannerApproval } from "../middleware/plannerApproval.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get complete profile data (allows ALL planners including rejected)
router.get("/profile", allowAllPlanners, getProfile);

// Update personal information (allows ALL planners including rejected)
router.put("/profile/personal",requireRole(['planner']), allowAllPlanners, updatePersonalInfo);

// Update business information (allows ALL planners including rejected)
router.put("/profile/business", allowAllPlanners);

// Upload profile picture (allows ALL planners including rejected)
router.post("/profile/picture", allowAllPlanners, uploadProfilePicture);

// Upload permit document (allows ALL planners including rejected - for appeals)
router.post("/profile/permit-document", allowAllPlanners, uploadPermitDocument);

// Get statistics (planners only)
router.get("/statistics", requireRole(['planner']), getStatistics);

// Get recent reviews (planners only)
router.get("/reviews/recent", requireRole(['planner']), getRecentReviews);

export default router;