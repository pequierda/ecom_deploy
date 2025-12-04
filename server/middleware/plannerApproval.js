// middleware/plannerApproval.js - Updated to allow rejected planners to access profile routes
import jwt from "jsonwebtoken";
import { getUserWithProfile } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "wedding_planner_key";

/* =========================
   REQUIRE PLANNER APPROVAL (Business Operations Only)
========================= */
export const requirePlannerApproval = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Access denied. User not authenticated." });
    }

    // Check if user is a planner
    if (req.user.role !== 'planner') {
      return res.status(403).json({ 
        message: "Access denied. This endpoint is only for planners." 
      });
    }

    // Get full user profile including planner status
    const userWithProfile = await getUserWithProfile(req.user.userId);
    
    if (!userWithProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check planner approval status - ONLY BLOCK for business operations
    const plannerStatus = userWithProfile.plannerProfile?.status;
    
    if (plannerStatus === 'rejected') {
      return res.status(403).json({ 
        message: "Access denied. Your planner account has been rejected. Please resubmit your documents through your profile.",
        status: 'rejected',
        canAppeal: true
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

    // Add planner profile to request for use in route handlers
    req.plannerProfile = userWithProfile.plannerProfile;
    req.userProfile = userWithProfile;
    
    next();
  } catch (err) {
    console.error('Planner approval check error:', err);
    res.status(500).json({ 
      message: "Server error during approval check", 
      error: err.message 
    });
  }
};

/* =========================
   ALLOW ALL PLANNERS (Including Rejected - for profile access)
========================= */
export const allowAllPlanners = async (req, res, next) => {
  try {
    console.log('PLANNER DEBUG - allowAllPlanners middleware started');
    console.log('PLANNER DEBUG - req.user:', req.user);
    console.log('PLANNER DEBUG - req.userWithProfile exists:', !!req.userWithProfile);
    
    // First check if user is authenticated
    if (!req.user) {
      console.log('PLANNER DEBUG - No req.user found');
      return res.status(401).json({ message: "Access denied. User not authenticated." });
    }

    console.log('PLANNER DEBUG - User role:', req.user.role);

    // Check if user is a planner
    if (req.user.role !== 'planner') {
      console.log('PLANNER DEBUG - User is not a planner, role:', req.user.role);
      return res.status(403).json({ 
        message: "Access denied. This endpoint is only for planners." 
      });
    }

    // Get full user profile including planner status
    let userWithProfile = req.userWithProfile;
    
    if (!userWithProfile) {
      console.log('PLANNER DEBUG - No userWithProfile in req, fetching from database');
      userWithProfile = await getUserWithProfile(req.user.userId);
    }
    
    if (!userWithProfile) {
      console.log('PLANNER DEBUG - User not found in database');
      return res.status(404).json({ message: "User not found" });
    }

    console.log('PLANNER DEBUG - Planner status:', userWithProfile.plannerProfile?.status);

    // Allow ALL planners (pending, approved, rejected) - they all need profile access
    req.plannerProfile = userWithProfile.plannerProfile;
    req.userProfile = userWithProfile;
    
    console.log('PLANNER DEBUG - allowAllPlanners middleware completed successfully');
    next();
  } catch (err) {
    console.error('PLANNER DEBUG - Error in allowAllPlanners:', err);
    res.status(500).json({ 
      message: "Server error during status check", 
      error: err.message 
    });
  }
};

/* =========================
   ALLOW PENDING PLANNERS (for profile/status routes) - DEPRECATED, use allowAllPlanners
========================= */
export const allowPendingPlanners = async (req, res, next) => {
  return allowAllPlanners(req, res, next);
};

/* =========================
   CHECK PLANNER OWNS RESOURCE
========================= */
export const checkPlannerOwnership = (resourceIdParam = 'id', resourceTable = 'package_services') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const plannerId = req.userProfile?.user_id;

      if (!resourceId) {
        return res.status(400).json({ message: "Resource ID is required" });
      }

      if (!plannerId) {
        return res.status(401).json({ message: "Planner ID not found" });
      }

      // Import the database connection
      const db = await import('../config/database.js').then(module => module.default);
      
      // Check ownership based on resource type
      let query;
      let params = [resourceId];

      switch (resourceTable) {
        case 'package_services':
          query = `
            SELECT ps.planner_id 
            FROM package_services ps 
            INNER JOIN planners p ON ps.planner_id = p.planner_id 
            WHERE ps.package_id = ? AND p.planner_id = ?
          `;
          params.push(plannerId);
          break;
          
        case 'bookings':
          query = `
            SELECT ps.planner_id 
            FROM bookings b 
            INNER JOIN package_services ps ON b.package_id = ps.package_id 
            INNER JOIN planners p ON ps.planner_id = p.planner_id 
            WHERE b.booking_id = ? AND p.planner_id = ?
          `;
          params.push(plannerId);
          break;
          
        default:
          return res.status(400).json({ message: "Unsupported resource type" });
      }

      const [rows] = await db.execute(query, params);

      if (rows.length === 0) {
        return res.status(404).json({ 
          message: "Resource not found or you don't have permission to access it" 
        });
      }

      next();
    } catch (err) {
      console.error('Ownership check error:', err);
      res.status(500).json({ 
        message: "Server error during ownership check", 
        error: err.message 
      });
    }
  };
};

/* =========================
   COMBINED MIDDLEWARE HELPER
========================= */
export const requireApprovedPlannerWithOwnership = (resourceIdParam, resourceTable) => {
  return [
    requirePlannerApproval,
    checkPlannerOwnership(resourceIdParam, resourceTable)
  ];
};