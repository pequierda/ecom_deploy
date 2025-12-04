import bcrypt from "bcryptjs";
import { 
  createUser, 
  findUserByEmail, 
  createPlannerProfile, 
  createClientProfile,
  getUserWithProfile,
  updateUserProfile,
  updatePlannerProfile,
  updateClientProfile
} from "../models/userModel.js";

/* =======================
   USER REGISTRATION
======================= */
export const registerUser = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      password, 
      role,
      bio,
      location,
      // Planner-specific fields
      business_name,
      experience_years,
      // Client-specific fields
      wedding_date,
      wedding_location
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ 
        message: "First name, last name, email, password, and role are required" 
      });
    }

    // Validate role
    if (!['admin', 'planner', 'client'].includes(role)) {
      return res.status(400).json({ 
        message: "Role must be 'admin', 'planner', or 'client'" 
      });
    }

    // Role-specific validation
    if (role === 'planner' && !business_name) {
      return res.status(400).json({ 
        message: "Business name is required for planners" 
      });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await createUser(
      first_name, 
      last_name, 
      email, 
      phone, 
      hashedPassword, 
      role, 
      bio, 
      location
    );

    // Create role-specific profile
    if (role === 'planner') {
      await createPlannerProfile(
        userId, 
        business_name, 
        experience_years || 0
      );
    } else if (role === 'client') {
      await createClientProfile(
        userId, 
        wedding_date, 
        wedding_location
      );
    }

    res.status(201).json({ 
      message: "User registered successfully", 
      userId,
      role 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   GET USER PROFILE
======================= */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is accessing their own profile or is admin
    if (req.user.userId !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await getUserWithProfile(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive data
    delete user.password_hash;

    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   UPDATE USER PROFILE
======================= */
export const updateUserProfileController = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is updating their own profile or is admin
    if (req.user.userId !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      first_name,
      last_name,
      phone,
      bio,
      location,
      profile_picture,
      // Planner-specific fields
      business_name,
      experience_years,
      // Client-specific fields
      wedding_date,
      wedding_location
    } = req.body;

    // Update user basic info
    await updateUserProfile(userId, {
      first_name,
      last_name,
      phone,
      bio,
      location,
      profile_picture
    });

    // Get user to check role
    const user = await getUserWithProfile(userId);
    
    // Update role-specific profile
    if (user.role === 'planner' && (business_name || experience_years !== undefined)) {
      await updatePlannerProfile(userId, {
        business_name,
        experience_years
      });
    } else if (user.role === 'client' && (wedding_date || wedding_location)) {
      await updateClientProfile(userId, {
        wedding_date,
        wedding_location
      });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   GET ALL USERS (Admin only)
======================= */
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.role, 
             u.bio, u.location, u.profile_picture, u.created_at,
             p.business_name, p.experience_years, p.status as planner_status,
             c.wedding_date, c.wedding_location
      FROM users u
      LEFT JOIN planners p ON u.user_id = p.planner_id
      LEFT JOIN clients c ON u.user_id = c.client_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    
    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const [users] = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN planners p ON u.user_id = p.planner_id
      WHERE 1=1
    `;
    
    const countParams = [];
    if (role && role !== 'all') {
      countQuery += ` AND u.role = ?`;
      countParams.push(role);
    }
    if (status && status !== 'all') {
      countQuery += ` AND p.status = ?`;
      countParams.push(status);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   DELETE USER (Admin only)
======================= */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.userId === parseInt(userId)) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    // Delete user (CASCADE will handle related records)
    const [result] = await pool.query(`DELETE FROM users WHERE user_id = ?`, [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};