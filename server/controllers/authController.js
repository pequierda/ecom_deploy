// controllers/authController.js - Fixed login with complete profile data
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, getUserWithProfile } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "wedding_planner_key";

// 📌 Login - Fixed to return complete profile data
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Get complete user profile with role-specific data
    const userWithProfile = await getUserWithProfile(user.user_id);
    
    if (!userWithProfile) {
      return res.status(500).json({ message: "Failed to load user profile" });
    }

    // For planners, check if they're rejected (but still allow login to show status)
    if (userWithProfile.role === 'planner') {
      const plannerStatus = userWithProfile.plannerProfile?.status;
      
      // Log the actual status for debugging
      console.log('🔍 Login - Planner status from DB:', plannerStatus);
      
      if (plannerStatus === 'rejected') {
        // Allow login but include rejection info in response
        console.log('⚠️ Planner account is rejected, but allowing login to show status');
      }
      
      if (plannerStatus === 'pending') {
        console.log('⏳ Planner account is pending approval');
      }
    }

    const token = jwt.sign(
      { 
        userId: user.user_id, 
        role: user.role, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return complete user data with profile information
    const response = {
      message: "Login successful",
      user: {
        user_id: userWithProfile.user_id,
        first_name: userWithProfile.first_name,
        last_name: userWithProfile.last_name,
        email: userWithProfile.email,
        phone: userWithProfile.phone,
        role: userWithProfile.role,
        bio: userWithProfile.bio,
        location: userWithProfile.location,
        profile_picture: userWithProfile.profile_picture,
        created_at: userWithProfile.created_at,
      }
    };

    // Add role-specific profile data
    if (userWithProfile.role === 'planner' && userWithProfile.plannerProfile) {
      response.user.plannerProfile = {
        business_name: userWithProfile.plannerProfile.business_name,
        business_address: userWithProfile.plannerProfile.business_address,
        business_email: userWithProfile.plannerProfile.business_email,
        business_phone: userWithProfile.plannerProfile.business_phone,
        experience_years: userWithProfile.plannerProfile.experience_years,
        status: userWithProfile.plannerProfile.status,
      };
      
      console.log('✅ Login response - Planner profile included:', response.user.plannerProfile);
    } else if (userWithProfile.role === 'client' && userWithProfile.clientProfile) {
      response.user.clientProfile = {
        wedding_date: userWithProfile.clientProfile.wedding_date,
        wedding_location: userWithProfile.clientProfile.wedding_location,
      };
    }

    console.log('📤 Login response being sent:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Logout (unchanged)
export const logout = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Current User (unchanged)
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserWithProfile(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive data
    delete user.password_hash;

    // Structure response based on role
    const response = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bio: user.bio,
      location: user.location,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
    };

    // Add role-specific data
    if (user.role === 'planner' && user.plannerProfile) {
      response.plannerProfile = {
        business_name: user.plannerProfile.business_name,
        business_address: user.plannerProfile.business_address,
        business_email: user.plannerProfile.business_email,
        business_phone: user.plannerProfile.business_phone,
        experience_years: user.plannerProfile.experience_years,
        status: user.plannerProfile.status,
      };
    } else if (user.role === 'client' && user.clientProfile) {
      response.clientProfile = {
        wedding_date: user.clientProfile.wedding_date,
        wedding_location: user.clientProfile.wedding_location,
      };
    }

    res.json(response);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      res.clearCookie("authToken");
      return res.status(401).json({ message: "Token expired" });
    }
    console.error('Get current user error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Refresh Token (unchanged)
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserByEmail(decoded.email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user.user_id, 
        role: user.role, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("authToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};