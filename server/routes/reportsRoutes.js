// routes/reportsRoutes.js
import express from "express";
import { getPlannerReports } from "../controllers/reportsController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get planner dashboard reports
router.get("/", authenticateToken, requireRole(["planner"]), getPlannerReports);

export default router;