// middleware/auth.js - Updated authentication middleware
import jwt from "jsonwebtoken";
import { getUserWithProfile } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "wedding_planner_key";

/* =========================
   AUTHENTICATE TOKEN (Enhanced with profile data)
========================= */
export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get full user profile for role-based checks
    const userWithProfile = await getUserWithProfile(decoded.userId);
    
    if (!userWithProfile) {
      return res.status(401).json({ message: "User not found." });
    }

    // Add user data to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };

    // Add full profile data for use in other middleware
    req.userWithProfile = userWithProfile;

    // Add specific profile data based on role
    if (userWithProfile.role === 'planner' && userWithProfile.plannerProfile) {
      req.plannerProfile = userWithProfile.plannerProfile;
    } else if (userWithProfile.role === 'client' && userWithProfile.clientProfile) {
      req.clientProfile = userWithProfile.clientProfile;
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.clearCookie("authToken");
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

/* =========================
   REQUIRE ROLE(S)
========================= */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied. User not authenticated." });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied. Role '${req.user.role}' not allowed.` });
    }

    next();
  };
};

/* =========================
   ENHANCED ROLE CHECKING WITH APPROVAL
========================= */
export const requireRoleWithApproval = (roles, requireApproval = false) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied. User not authenticated." });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied. Role '${req.user.role}' not allowed.` });
    }

    // Special handling for planners requiring approval
    if (req.user.role === 'planner' && requireApproval) {
      const plannerStatus = req.plannerProfile?.status;
      
      if (plannerStatus === 'rejected') {
        return res.status(403).json({ 
          message: "Access denied. Your planner account has been rejected.",
          status: 'rejected'
        });
      }

      if (plannerStatus === 'pending') {
        return res.status(403).json({ 
          message: "Access denied. Your planner account is pending approval.",
          status: 'pending'
        });
      }

      if (plannerStatus !== 'approved') {
        return res.status(403).json({ 
          message: "Access denied. Invalid planner status.",
          status: plannerStatus || 'unknown'
        });
      }
    }

    next();
  };
};