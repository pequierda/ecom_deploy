import express from "express"; 
import { 
  registerUser, 
  getUserProfile, 
  updateUserProfileController,
  getAllUsers,
  deleteUser 
} from "../controllers/userController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: anyone can register
router.post("/register", registerUser);

// Protected: user profile management
router.get("/profile/:userId", authenticateToken, getUserProfile);
router.put("/profile/:userId", authenticateToken, updateUserProfileController);

// Admin only: user management
router.get("/", authenticateToken, requireRole(["admin"]), getAllUsers);
router.delete("/:userId", authenticateToken, requireRole(["admin"]), deleteUser);

export default router;