// routes/statsRoutes.js
import express from "express";
import {
  getClientStats,
  getPlannerStats,
  getAdminStats,
  getEnhancedAdminStats,
  // Admin Reports Controllers
  getAdminReports,
  getMonthlyPerformance,
  getTopPlanners,
  getPermitStatus,
  getComplianceReport,
  getRegionalReport,
  getSystemAlertsReport,
  getFinancialReport,
  // Additional Admin Analytics Controllers
  getPaymentAnalyticsReport,
  getPackageAnalyticsReport,
  getBookingAnalyticsReport,
  getFeedbackAnalyticsReport,
  getPermitAnalyticsReport,
  getUserEngagementReport,
  getAvailabilityAnalyticsReport,
  getBusinessIntelligenceDashboard
} from "../controllers/statsController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================
   ROLE-SPECIFIC STATS ROUTES
======================= */

// Client stats - only for authenticated clients
router.get("/client", 
  authenticateToken, 
  requireRole(["client"]), 
  getClientStats
);

// Planner stats - only for authenticated planners
router.get("/planner", 
  authenticateToken, 
  requireRole(["planner"]), 
  getPlannerStats
);

// Admin stats - only for authenticated admins
router.get("/admin", 
  authenticateToken, 
  requireRole(["admin"]), 
  getAdminStats
);

// Enhanced Admin stats - with additional analytics and KPIs
router.get("/admin/enhanced", 
  authenticateToken, 
  requireRole(["admin"]), 
  getEnhancedAdminStats
);

/* =======================
   ADMIN REPORTS ROUTES
======================= */

// Comprehensive admin reports
// Supports query parameters: 
// - period: 3months, 6months, 1year, all
// - type: overview, financial, compliance, regional, all
router.get("/admin/reports", 
  authenticateToken, 
  requireRole(["admin"]), 
  getAdminReports
);

// Monthly performance data
// Query parameters: months (number, default: 6)
router.get("/admin/reports/monthly-performance", 
  authenticateToken, 
  requireRole(["admin"]), 
  getMonthlyPerformance
);

// Top performing planners
// Query parameters: limit (number, default: 5)
router.get("/admin/reports/top-planners", 
  authenticateToken, 
  requireRole(["admin"]), 
  getTopPlanners
);

// Permit status distribution (pie chart data)
router.get("/admin/reports/permit-status", 
  authenticateToken, 
  requireRole(["admin"]), 
  getPermitStatus
);

// Compliance metrics (business permits, documentation, etc.)
router.get("/admin/reports/compliance", 
  authenticateToken, 
  requireRole(["admin"]), 
  getComplianceReport
);

// Regional performance data (performance by location)
router.get("/admin/reports/regional", 
  authenticateToken, 
  requireRole(["admin"]), 
  getRegionalReport
);

// System alerts and notifications
// Query parameters: limit (number, default: 10)
router.get("/admin/reports/alerts", 
  authenticateToken, 
  requireRole(["admin"]), 
  getSystemAlertsReport
);

// Enhanced financial metrics and trends
router.get("/admin/reports/financial", 
  authenticateToken, 
  requireRole(["admin"]), 
  getFinancialReport
);

/* =======================
   ADDITIONAL ADMIN ANALYTICS ROUTES
======================= */

// Business Intelligence Dashboard - Comprehensive overview with insights
router.get("/admin/dashboard/business-intelligence", 
  authenticateToken, 
  requireRole(["admin"]), 
  getBusinessIntelligenceDashboard
);

// Payment Analytics - Payment processing metrics and trends
// Returns: verification rates, processing times, monthly trends, pending amounts
router.get("/admin/analytics/payments", 
  authenticateToken, 
  requireRole(["admin"]), 
  getPaymentAnalyticsReport
);

// Package Analytics - Package performance by category and trends
// Returns: category performance, creation trends, pricing analysis
router.get("/admin/analytics/packages", 
  authenticateToken, 
  requireRole(["admin"]), 
  getPackageAnalyticsReport
);

// Booking Analytics - Conversion rates, cancellations, seasonal trends
// Returns: conversion metrics, cancellation reasons, seasonal patterns
router.get("/admin/analytics/bookings", 
  authenticateToken, 
  requireRole(["admin"]), 
  getBookingAnalyticsReport
);

// Feedback Analytics - Reviews, ratings, and response metrics
// Returns: rating distribution, reply rates, monthly trends
router.get("/admin/analytics/feedback", 
  authenticateToken, 
  requireRole(["admin"]), 
  getFeedbackAnalyticsReport
);

// Permit Analytics - Permit processing efficiency and trends
// Returns: processing times, approval rates, monthly trends
router.get("/admin/analytics/permits", 
  authenticateToken, 
  requireRole(["admin"]), 
  getPermitAnalyticsReport
);

// User Engagement Analytics - User activity and conversion metrics
// Returns: user growth, engagement rates, conversion analysis
router.get("/admin/analytics/engagement", 
  authenticateToken, 
  requireRole(["admin"]), 
  getUserEngagementReport
);

// Availability Analytics - Slot utilization and booking patterns
// Returns: slot utilization, popular days, blackout analysis
router.get("/admin/analytics/availability", 
  authenticateToken, 
  requireRole(["admin"]), 
  getAvailabilityAnalyticsReport
);

/* =======================
   GENERAL STATS ROUTE
======================= */

// General stats route that returns appropriate stats based on user role
// This is useful for dashboard components that adapt based on user role
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    // Route to appropriate stats based on role
    switch (userRole) {
      case 'client':
        return getClientStats(req, res);
      case 'planner':
        return getPlannerStats(req, res);
      case 'admin':
        return getAdminStats(req, res);
      default:
        return res.status(403).json({ 
          success: false,
          message: "Invalid user role" 
        });
    }
  } catch (error) {
    console.error('Error in dashboard stats route:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// Enhanced dashboard route with analytics for admin users
router.get("/dashboard/enhanced", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    // Route to appropriate stats based on role
    switch (userRole) {
      case 'client':
        return getClientStats(req, res);
      case 'planner':
        return getPlannerStats(req, res);
      case 'admin':
        return getEnhancedAdminStats(req, res);
      default:
        return res.status(403).json({ 
          success: false,
          message: "Invalid user role" 
        });
    }
  } catch (error) {
    console.error('Error in enhanced dashboard stats route:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

/* =======================
   UTILITY ROUTES
======================= */

// Health check route for stats service
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Stats service is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get available analytics endpoints for admin users
router.get("/admin/analytics", authenticateToken, requireRole(["admin"]), (req, res) => {
  res.json({
    success: true,
    message: "Available admin analytics endpoints",
    endpoints: {
      dashboard: {
        business_intelligence: "/api/stats/admin/dashboard/business-intelligence",
        enhanced_stats: "/api/stats/admin/enhanced"
      },
      analytics: {
        payments: "/api/stats/admin/analytics/payments",
        packages: "/api/stats/admin/analytics/packages", 
        bookings: "/api/stats/admin/analytics/bookings",
        feedback: "/api/stats/admin/analytics/feedback",
        permits: "/api/stats/admin/analytics/permits",
        engagement: "/api/stats/admin/analytics/engagement",
        availability: "/api/stats/admin/analytics/availability"
      },
      reports: {
        comprehensive: "/api/stats/admin/reports",
        monthly_performance: "/api/stats/admin/reports/monthly-performance",
        top_planners: "/api/stats/admin/reports/top-planners",
        permit_status: "/api/stats/admin/reports/permit-status",
        compliance: "/api/stats/admin/reports/compliance",
        regional: "/api/stats/admin/reports/regional",
        alerts: "/api/stats/admin/reports/alerts",
        financial: "/api/stats/admin/reports/financial"
      }
    },
    query_parameters: {
      reports: {
        period: "3months | 6months | 1year | all",
        type: "overview | financial | compliance | regional | all"
      },
      monthly_performance: {
        months: "number (default: 6)"
      },
      top_planners: {
        limit: "number (default: 5)"
      },
      alerts: {
        limit: "number (default: 10)"
      }
    }
  });
});

export default router;