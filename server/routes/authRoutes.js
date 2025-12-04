import express from "express";
import { login, logout, getCurrentUser, refreshToken } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 2-second delay middleware (optional - remove if you don't want delays)
const authDelay = (req, res, next) => {
  setTimeout(() => next(), 2000);
};

// Public routes
router.post("/login", authDelay, login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

// Private route
router.get("/me", authenticateToken, getCurrentUser);

export default router;