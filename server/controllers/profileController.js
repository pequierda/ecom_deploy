// controllers/profileController.js
import { 
  getUserWithProfile, 
  updateUserProfile, 
  updatePlannerProfile,
  getPlannerStatistics,
  getPlannerRecentReviews
} from "../models/userModel.js";
import pool from "../config/db.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for profile picture uploads
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for permit document uploads
const permitStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/permits';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'permit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const permitUpload = multer({
  storage: permitStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for documents
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed!'), false);
    }
  }
});

// Get permit attachment data for a planner
const getPermitAttachments = async (plannerId) => {
  try {
    const [permitRows] = await pool.query(`
      SELECT p.permit_id, p.submitted_at, p.reviewed_at, p.is_approved,
             pl.verification_notes, pl.rejection_reason
      FROM permits p
      LEFT JOIN planners pl ON p.submitted_by = pl.planner_id
      WHERE p.submitted_by = ?
      ORDER BY p.submitted_at DESC
      LIMIT 1
    `, [plannerId]);

    if (!permitRows.length) {
      return null;
    }

    const permit = permitRows[0];

    const [attachmentRows] = await pool.query(`
      SELECT attachment_id, permit_id, file_url, file_type, 
             gov_id_type, gov_id_number, permit_status, 
             notes, uploaded_at
      FROM permit_attachments
      WHERE permit_id = ?
      ORDER BY uploaded_at DESC
    `, [permit.permit_id]);

    return {
      permit_id: permit.permit_id,
      status: permit.is_approved === null ? 'pending' : (permit.is_approved ? 'approved' : 'rejected'),
      attachments: attachmentRows,
      submitted_at: permit.submitted_at,
      reviewed_at: permit.reviewed_at,
      rejection_reason: permit.rejection_reason,
      verification_notes: permit.verification_notes
    };
  } catch (error) {
    console.error('Error fetching permit attachments:', error);
    return null;
  }
};

// Get complete user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userWithProfile = await getUserWithProfile(userId);

    if (!userWithProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Build profile data structure
    const profileData = {
      personalInfo: {
        firstName: userWithProfile.first_name,
        lastName: userWithProfile.last_name,
        email: userWithProfile.email,
        phone: userWithProfile.phone || '',
        address: userWithProfile.location || '',
        bio: userWithProfile.bio || '',
        profilePicture: userWithProfile.profile_picture || null
      },
      businessInfo: {
        businessName: userWithProfile.plannerProfile?.business_name || '',
        businessType: 'Wedding Planning Services',
        businessAddress: userWithProfile.plannerProfile?.business_address || '',
        businessEmail: userWithProfile.plannerProfile?.business_email || userWithProfile.email,
        businessPhone: userWithProfile.plannerProfile?.business_phone || userWithProfile.phone || '',
        yearsInBusiness: userWithProfile.plannerProfile?.experience_years?.toString() || '0',
        servicesOffered: [],
        socialMedia: {
          facebook: '',
          instagram: '',
          website: ''
        }
      },
      permitInfo: {
        businessPermit: {
          number: '',
          issueDate: '',
          expiryDate: '',
          status: 'pending'
        },
        mayorPermit: {
          number: '',
          issueDate: '',
          expiryDate: '',
          status: 'pending'
        },
        birRegistration: {
          number: '',
          issueDate: '',
          status: 'pending'
        }
      },
      // Add planner status
      plannerStatus: userWithProfile.plannerProfile?.status || 'pending'
    };

    // For planners, especially rejected ones, fetch permit attachment data
    if (userWithProfile.role === 'planner') {
      const permitData = await getPermitAttachments(userId);
      if (permitData) {
        profileData.permitInfo.permitApproval = permitData;
      }

      try {
        const statistics = await getPlannerStatistics(userId);
        profileData.statistics = statistics;
        
        const recentReviews = await getPlannerRecentReviews(userId, 5);
        profileData.recentReviews = recentReviews;
      } catch (error) {
        console.error('Error fetching planner statistics/reviews:', error);
        profileData.statistics = {
          totalBookings: 0,
          completedWeddings: 0,
          averageRating: 0,
          totalReviews: 0,
          clientRetention: 0,
          responseTime: '2 hours'
        };
        profileData.recentReviews = [];
      }
    }

    res.json(profileData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update personal information
// Update personal information
export const updatePersonalInfo = async (req, res) => {
  console.log('🔍 CONTROLLER DEBUG - updatePersonalInfo started');
  console.log('🔍 CONTROLLER DEBUG - req.user:', req.user);
  console.log('🔍 CONTROLLER DEBUG - req.body:', req.body);
  
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      console.error('❌ CONTROLLER DEBUG - No user or userId found');
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.userId;
    const { firstName, lastName, phone, address, bio } = req.body;

    console.log('🔍 CONTROLLER DEBUG - About to call updateUserProfile with userId:', userId);
    
    await updateUserProfile(userId, {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      location: address,
      bio: bio
    });

    console.log('✅ CONTROLLER DEBUG - updateUserProfile completed successfully');

    const updatedUser = await getUserWithProfile(userId);
    console.log('✅ CONTROLLER DEBUG - getUserWithProfile completed');
    
    const personalInfo = {
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      address: updatedUser.location || '',
      bio: updatedUser.bio || '',
      profilePicture: updatedUser.profile_picture || null
    };

    console.log('✅ CONTROLLER DEBUG - Sending success response');
    res.json({ 
      message: "Personal information updated successfully",
      personalInfo
    });
  } catch (error) {
    console.error('❌ CONTROLLER DEBUG - Error in updatePersonalInfo:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Upload profile picture
export const uploadProfilePicture = [
  profileUpload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.userId;
      const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;

      await updateUserProfile(userId, {
        profile_picture: profilePictureUrl
      });

      res.json({ 
        message: "Profile picture uploaded successfully",
        profilePictureUrl
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
];

// Upload permit document - Enhanced for proper replacement
export const uploadPermitDocument = [
  permitUpload.single('permitDocument'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.userId;
      const { govIdType, govIdNumber, replaceAttachmentId } = req.body;

      if (!govIdType || !govIdNumber) {
        return res.status(400).json({ 
          message: "Government ID type and number are required" 
        });
      }

      // Construct full URL for the file
      const protocol = req.protocol;
      const host = req.get('host');
      const fileUrl = `${protocol}://${host}/uploads/permits/${req.file.filename}`;

      // Get or create permit record for this user
      let [permitRows] = await pool.query(`
        SELECT permit_id FROM permits WHERE submitted_by = ?
        ORDER BY submitted_at DESC LIMIT 1
      `, [userId]);

      let permitId;
      if (!permitRows.length) {
        // Create new permit record
        const [result] = await pool.query(`
          INSERT INTO permits (submitted_by) VALUES (?)
        `, [userId]);
        permitId = result.insertId;
      } else {
        permitId = permitRows[0].permit_id;
      }

      // If replacing an existing attachment
      if (replaceAttachmentId) {
        // Get the old file path to delete it
        const [oldAttachment] = await pool.query(`
          SELECT file_url FROM permit_attachments 
          WHERE attachment_id = ? AND uploaded_by = ?
        `, [replaceAttachmentId, userId]);

        if (oldAttachment.length > 0) {
          const oldFileUrl = oldAttachment[0].file_url;
          // Extract filename from URL (handles both relative and absolute URLs)
          const oldFileName = oldFileUrl.split('/').pop();
          const oldFilePath = path.join('uploads/permits', oldFileName);
          
          // Delete the old file from filesystem
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`Deleted old file: ${oldFilePath}`);
          }

          // Update the existing record instead of creating a new one
          await pool.query(`
            UPDATE permit_attachments 
            SET file_url = ?, 
                file_type = ?, 
                gov_id_type = ?, 
                gov_id_number = ?, 
                permit_status = 'pending',
                notes = 'Document resubmitted for review',
                uploaded_at = NOW()
            WHERE attachment_id = ? AND uploaded_by = ?
          `, [fileUrl, req.file.mimetype, govIdType, govIdNumber, replaceAttachmentId, userId]);
        } else {
          return res.status(404).json({ message: "Original document not found" });
        }
      } else {
        // Insert new permit attachment
        await pool.query(`
          INSERT INTO permit_attachments 
          (permit_id, uploaded_by, file_url, file_type, gov_id_type, gov_id_number, permit_status, notes)
          VALUES (?, ?, ?, ?, ?, ?, 'pending', 'Document submitted for review')
        `, [permitId, userId, fileUrl, req.file.mimetype, govIdType, govIdNumber]);
      }

      // Update planner status back to pending if they were rejected and resubmitting
      const userWithProfile = await getUserWithProfile(userId);
      if (userWithProfile?.plannerProfile?.status === 'rejected') {
        await pool.query(`
          UPDATE planners SET status = 'pending', rejection_reason = NULL
          WHERE planner_id = ?
        `, [userId]);
      }

      res.json({ 
        message: replaceAttachmentId 
          ? "Document replaced successfully and is now under review"
          : "Permit document uploaded successfully",
        fileUrl,
        isResubmission: !!replaceAttachmentId
      });
    } catch (error) {
      console.error('Upload permit document error:', error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
];

// Get user statistics
export const getStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const statistics = await getPlannerStatistics(userId);
    res.json(statistics);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get recent reviews
export const getRecentReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviews = await getPlannerRecentReviews(userId, 5);
    res.json({ reviews });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};