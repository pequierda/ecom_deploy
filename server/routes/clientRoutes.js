import express from "express";
import { 
  getPlannerClientsController,
  getPlannerClientStatsController,
  getClientDetailsController,
  sendMessageToClient,
  updateClientNotes
} from "../controllers/clientController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================
   PLANNER CLIENT ROUTES
   All routes require planner or admin role
======================= */

// Get all clients for a specific planner
// GET /api/clients/:planner_id
router.get(
  "/:planner_id", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  getPlannerClientsController
);

// Get client statistics for planner dashboard
// GET /api/clients/:planner_id/stats
router.get(
  "/:planner_id/stats", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  getPlannerClientStatsController
);

// Get specific client details
// GET /api/clients/:planner_id/client/:client_id
router.get(
  "/:planner_id/client/:client_id", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  getClientDetailsController
);

// Send message to client (placeholder for future messaging system)
// POST /api/clients/:planner_id/client/:client_id/message
router.post(
  "/:planner_id/client/:client_id/message", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  sendMessageToClient
);

// Update client notes (optional feature)
// PUT /api/clients/:planner_id/client/:client_id/notes
router.put(
  "/:planner_id/client/:client_id/notes", 
  authenticateToken, 
  requireRole(["planner", "admin"]), 
  updateClientNotes
);

export default router;
