// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadsPath } from '../config/paths.js';

const uploadDir = getUploadsPath('packages');

const ensureDirectory = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    if (error.code === 'EEXIST') {
      return;
    }
    console.error(`Unable to prepare upload directory "${dir}":`, error);
    throw new Error('Upload storage is not writable. Set UPLOADS_ROOT to a writable path.');
  }
};

ensureDirectory(uploadDir);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: packageId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const packageId = req.body.package_id || 'temp';
    cb(null, `package_${packageId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

export { upload };

// controllers/packageController.js - Add these new functions

/* =======================
   ENHANCED PACKAGE ATTACHMENTS WITH FILE UPLOAD
======================= */

// Upload multiple images for a package
export const uploadPackageImages = async (req, res) => {
  try {
    const { package_id } = req.body;
    
    if (!package_id) {
      return res.status(400).json({ message: "Package ID is required" });
    }

    // Verify package exists and belongs to the planner
    const packageData = await getPackageById(package_id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Check if planner owns this package (if user authentication is available)
    if (req.user && req.user.user_id !== packageData.planner_id) {
      return res.status(403).json({ message: "Not authorized to modify this package" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedAttachments = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileUrl = `/uploads/packages/${file.filename}`;
      const isThumbail = req.body.thumbnails && req.body.thumbnails[i] === 'true';
      
      // If setting as thumbnail, remove thumbnail status from other images
      if (isThumbail) {
        await clearPackageThumbnails(package_id);
      }
      
      const attachmentId = await addPackageAttachment(
        package_id,
        fileUrl,
        'image',
        isThumbail
      );
      
      uploadedAttachments.push({
        attachmentId,
        fileUrl,
        fileName: file.originalname,
        isThumbail
      });
    }

    res.status(201).json({
      message: "Images uploaded successfully",
      attachments: uploadedAttachments
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add attachment via URL
export const addPackageAttachmentByUrl = async (req, res) => {
  try {
    const { package_id, file_url, file_type = 'image', is_thumbnail = false } = req.body;
    
    if (!package_id || !file_url) {
      return res.status(400).json({ message: "Package ID and file URL are required" });
    }

    // Verify package exists
    const packageData = await getPackageById(package_id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Check if planner owns this package
    if (req.user && req.user.user_id !== packageData.planner_id) {
      return res.status(403).json({ message: "Not authorized to modify this package" });
    }

    // If setting as thumbnail, remove thumbnail status from other images
    if (is_thumbnail) {
      await clearPackageThumbnails(package_id);
    }

    const attachmentId = await addPackageAttachment(package_id, file_url, file_type, is_thumbnail);
    
    res.status(201).json({ 
      message: "Attachment added successfully", 
      attachmentId,
      file_url,
      is_thumbnail
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Set thumbnail for existing attachment
export const setPackageThumbnail = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    // Get attachment details
    const attachment = await getAttachmentById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Verify package exists and ownership
    const packageData = await getPackageById(attachment.package_id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (req.user && req.user.user_id !== packageData.planner_id) {
      return res.status(403).json({ message: "Not authorized to modify this package" });
    }

    // Clear existing thumbnails for this package
    await clearPackageThumbnails(attachment.package_id);
    
    // Set this attachment as thumbnail
    await setAttachmentAsThumbnail(attachmentId);
    
    res.json({ message: "Thumbnail set successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Helper function to clear all thumbnails for a package
const clearPackageThumbnails = async (packageId) => {
  const [result] = await pool.query(
    `UPDATE package_attachments SET is_thumbnail = FALSE WHERE package_id = ?`,
    [packageId]
  );
  return result.affectedRows;
};

// Helper function to set specific attachment as thumbnail
const setAttachmentAsThumbnail = async (attachmentId) => {
  const [result] = await pool.query(
    `UPDATE package_attachments SET is_thumbnail = TRUE WHERE attachment_id = ?`,
    [attachmentId]
  );
  return result.affectedRows;
};

// Get package attachments with better organization
export const getPackageAttachmentsEnhanced = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const attachments = await getAttachmentsByPackage(packageId);
    
    // Organize attachments
    const thumbnail = attachments.find(att => att.is_thumbnail);
    const images = attachments.filter(att => att.file_type === 'image');
    const others = attachments.filter(att => att.file_type !== 'image');

    res.json({
      thumbnail,
      images,
      others,
      total: attachments.length
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};