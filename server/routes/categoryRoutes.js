import express from "express";
import {
  addCategory,
  listCategories,
  getCategory,
  editCategory,
  removeCategory,
} from "../controllers/categoryController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============ CATEGORY CRUD ============ */
// Public view
router.get("/", listCategories);
router.get("/:id", getCategory);

// Modify (admin only)
router.post("/", authenticateToken, requireRole(["admin"]), addCategory);
router.put("/:id", authenticateToken, requireRole(["admin"]), editCategory);
router.delete("/:id", authenticateToken, requireRole(["admin"]), removeCategory);

export default router;
