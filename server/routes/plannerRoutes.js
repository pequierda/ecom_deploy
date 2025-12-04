// routes/plannerRoutes.js - Example implementation with approval middleware
import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { 
  requirePlannerApproval, 
  allowPendingPlanners, 
  checkPlannerOwnership,
  requireApprovedPlannerWithOwnership 
} from '../middleware/plannerApproval.js';

const router = express.Router();

/* =========================
   ROUTES THAT ALLOW PENDING PLANNERS
   (Profile, Status, Registration-related)
========================= */

// Get planner profile - allows pending planners
router.get('/profile', 
  authenticateToken, 
  allowPendingPlanners, 
  async (req, res) => {
    try {
      // req.userProfile and req.plannerProfile are available from middleware
      const plannerData = {
        user_id: req.userProfile.user_id,
        first_name: req.userProfile.first_name,
        last_name: req.userProfile.last_name,
        email: req.userProfile.email,
        phone: req.userProfile.phone,
        bio: req.userProfile.bio,
        location: req.userProfile.location,
        profile_picture: req.userProfile.profile_picture,
        plannerProfile: req.plannerProfile
      };

      res.json(plannerData);
    } catch (err) {
      console.error('Get planner profile error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Update planner profile - allows pending planners
router.put('/profile', 
  authenticateToken, 
  allowPendingPlanners, 
  async (req, res) => {
    try {
      const { business_name, business_address, business_email, business_phone, experience_years, bio, location } = req.body;
      const plannerId = req.userProfile.user_id;

      // Import database connection
      const db = await import('../config/database.js').then(module => module.default);

      // Update user table
      if (bio || location) {
        await db.execute(
          'UPDATE users SET bio = COALESCE(?, bio), location = COALESCE(?, location) WHERE user_id = ?',
          [bio, location, plannerId]
        );
      }

      // Update planner table
      if (business_name || business_address || business_email || business_phone || experience_years) {
        await db.execute(
          'UPDATE planners SET business_name = COALESCE(?, business_name), business_address = COALESCE(?, business_address), business_email = COALESCE(?, business_email), business_phone = COALESCE(?, business_phone), experience_years = COALESCE(?, experience_years) WHERE planner_id = ?',
          [business_name, business_address, business_email, business_phone, experience_years, plannerId]
        );
      }

      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      console.error('Update planner profile error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* =========================
   ROUTES THAT REQUIRE APPROVED PLANNERS
   (Services, Bookings, Business Operations)
========================= */

// Get planner dashboard data - requires approval
router.get('/dashboard', 
  authenticateToken, 
  requirePlannerApproval, 
  async (req, res) => {
    try {
      const plannerId = req.userProfile.user_id;
      const db = await import('../config/database.js').then(module => module.default);

      // Get dashboard statistics
      const [serviceStats] = await db.execute(
        'SELECT COUNT(*) as total_services, AVG(rating) as avg_rating FROM package_services WHERE planner_id = ?',
        [plannerId]
      );

      const [bookingStats] = await db.execute(
        `SELECT 
          COUNT(*) as total_bookings,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings
        FROM bookings b 
        INNER JOIN package_services ps ON b.package_id = ps.package_id 
        WHERE ps.planner_id = ?`,
        [plannerId]
      );

      res.json({
        services: serviceStats[0],
        bookings: bookingStats[0],
        planner_status: req.plannerProfile.status
      });
    } catch (err) {
      console.error('Get planner dashboard error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Create new service - requires approval
router.post('/services', 
  authenticateToken, 
  requirePlannerApproval, 
  async (req, res) => {
    try {
      const { title, description, detailed_description, price, category_id, inclusions } = req.body;
      const plannerId = req.userProfile.user_id;

      if (!title || !description || !price || !category_id) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const db = await import('../config/database.js').then(module => module.default);

      // Insert new service
      const [result] = await db.execute(
        'INSERT INTO package_services (planner_id, title, description, detailed_description, price, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [plannerId, title, description, detailed_description, price, category_id]
      );

      const packageId = result.insertId;

      // Insert inclusions if provided
      if (inclusions && inclusions.length > 0) {
        const inclusionValues = inclusions.map(inc => [packageId, inc.inclusion_name]);
        await db.execute(
          'INSERT INTO inclusions (package_id, inclusion_name) VALUES ?',
          [inclusionValues]
        );
      }

      res.status(201).json({ 
        message: 'Service created successfully', 
        package_id: packageId 
      });
    } catch (err) {
      console.error('Create service error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Get planner's services - requires approval
router.get('/services', 
  authenticateToken, 
  requirePlannerApproval, 
  async (req, res) => {
    try {
      const plannerId = req.userProfile.user_id;
      const db = await import('../config/database.js').then(module => module.default);

      const [services] = await db.execute(
        `SELECT ps.*, c.name as category_name 
        FROM package_services ps 
        LEFT JOIN categories c ON ps.category_id = c.category_id 
        WHERE ps.planner_id = ? 
        ORDER BY ps.created_at DESC`,
        [plannerId]
      );

      res.json(services);
    } catch (err) {
      console.error('Get planner services error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Update specific service - requires approval + ownership
router.put('/services/:id', 
  authenticateToken, 
  ...requireApprovedPlannerWithOwnership('id', 'package_services'), 
  async (req, res) => {
    try {
      const packageId = req.params.id;
      const { title, description, detailed_description, price, category_id, is_active } = req.body;
      
      const db = await import('../config/database.js').then(module => module.default);

      await db.execute(
        'UPDATE package_services SET title = COALESCE(?, title), description = COALESCE(?, description), detailed_description = COALESCE(?, detailed_description), price = COALESCE(?, price), category_id = COALESCE(?, category_id), is_active = COALESCE(?, is_active) WHERE package_id = ?',
        [title, description, detailed_description, price, category_id, is_active, packageId]
      );

      res.json({ message: 'Service updated successfully' });
    } catch (err) {
      console.error('Update service error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Delete specific service - requires approval + ownership
router.delete('/services/:id', 
  authenticateToken, 
  ...requireApprovedPlannerWithOwnership('id', 'package_services'), 
  async (req, res) => {
    try {
      const packageId = req.params.id;
      const db = await import('../config/database.js').then(module => module.default);

      await db.execute('DELETE FROM package_services WHERE package_id = ?', [packageId]);

      res.json({ message: 'Service deleted successfully' });
    } catch (err) {
      console.error('Delete service error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Get planner's bookings - requires approval
router.get('/bookings', 
  authenticateToken, 
  requirePlannerApproval, 
  async (req, res) => {
    try {
      const plannerId = req.userProfile.user_id;
      const db = await import('../config/database.js').then(module => module.default);

      const [bookings] = await db.execute(
        `SELECT b.*, ps.title as service_title, ps.price,
                u.first_name as client_first_name, u.last_name as client_last_name, u.email as client_email
        FROM bookings b 
        INNER JOIN package_services ps ON b.package_id = ps.package_id 
        INNER JOIN clients c ON b.client_id = c.client_id
        INNER JOIN users u ON c.client_id = u.user_id
        WHERE ps.planner_id = ? 
        ORDER BY b.created_at DESC`,
        [plannerId]
      );

      res.json(bookings);
    } catch (err) {
      console.error('Get planner bookings error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Update booking status - requires approval + ownership
router.put('/bookings/:id/status', 
  authenticateToken, 
  ...requireApprovedPlannerWithOwnership('id', 'bookings'), 
  async (req, res) => {
    try {
      const bookingId = req.params.id;
      const { status, reason } = req.body;

      if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'confirmed' or 'cancelled'" });
      }

      const db = await import('../config/database.js').then(module => module.default);

      await db.execute(
        'UPDATE bookings SET status = ?, reason = ?, updated_at = NOW() WHERE booking_id = ?',
        [status, reason, bookingId]
      );

      res.json({ message: 'Booking status updated successfully' });
    } catch (err) {
      console.error('Update booking status error:', err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;