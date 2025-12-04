import {
  createPackage,
  getAllPackages,
  getPackageById,
  getPackagesByPlanner,
  getPackagesByCategory,
  updatePackage,
  updatePackageRating,
  softDeletePackage,
  addInclusion,
  getInclusionsByPackage,
  deleteInclusion,
  addPackageAttachment,
  getAttachmentsByPackage,
  getAttachmentById,
  deletePackageAttachment,
  deleteAllPackageAttachments,
  updateDefaultSlots,
  getDefaultSlots,
  addUnavailableDate,
  getUnavailableDates,
  deleteUnavailableDate,
  checkDateAvailability,
  searchPackages,
  getPackageAvailabilityByDate,
  getPackageAvailabilityRange,
  setDateSpecificSlots,
  updateDateSpecificSlots,
  getPackagePreparationDays,
  isDateInPreparationPeriod,
  getUpcomingAvailableDates
} from "../models/packageModel.js";
import pool from "../config/db.js";
import fs from 'fs';
import path from 'path';

/* =======================
   HELPERS
======================= */
const attachInclusionsAndAttachments = async (packageData) => {
  if (!packageData) return null;

  // Get inclusions for this package
  const inclusions = await getInclusionsByPackage(packageData.package_id);

  // Get attachments for this package
  const attachments = await getAttachmentsByPackage(packageData.package_id);

  // Get unavailable dates for this package
  const unavailableDates = await getUnavailableDates(packageData.package_id);

  return { 
    ...packageData, 
    inclusions,
    attachments,
    unavailable_dates: unavailableDates
  };
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

/* =======================
   PACKAGE CRUD
======================= */
export const addPackage = async (req, res) => {
  try {
    const { 
      planner_id, 
      title, 
      description, 
      detailed_description, 
      price, 
      default_slots = 1, 
      category_id 
    } = req.body;

    if (!planner_id || !title || !price || !category_id) {
      return res.status(400).json({ 
        message: "Planner ID, title, price, and category are required" 
      });
    }

    // Create package (trigger will automatically create default availability)
    const packageId = await createPackage(
      planner_id, 
      title, 
      description, 
      detailed_description || null,
      price, 
      category_id
    );

    // Update default slots if different from 1
    if (default_slots !== 1) {
      await updateDefaultSlots(packageId, default_slots);
    }

    res.status(201).json({ 
      message: "Package created successfully", 
      packageId 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listPackages = async (req, res) => {
  try {
    const packages = await getAllPackages();
    const enriched = [];

    for (let pkg of packages) {
      enriched.push(await attachInclusionsAndAttachments(pkg));
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const packageData = await getPackageById(id);

    if (!packageData) return res.status(404).json({ message: "Package not found" });

    const enriched = await attachInclusionsAndAttachments(packageData);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listPlannerPackages = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const { is_active, search } = req.query;
    
    let query = `
      SELECT ps.*, c.name AS category_name, c.description AS category_description,
             u.first_name, u.last_name, u.phone, u.profile_picture, u.bio, u.location,
             p.business_name, p.experience_years, p.status as planner_status,
             pda.total_slots as default_slots
      FROM package_services ps
      JOIN categories c ON ps.category_id = c.category_id
      JOIN planners p ON ps.planner_id = p.planner_id
      JOIN users u ON p.planner_id = u.user_id
      LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
      WHERE ps.planner_id = ?
    `;
    
    const params = [plannerId];
    
    // Add status filter if provided
    if (is_active !== undefined) {
      query += ` AND ps.is_active = ?`;
      params.push(is_active === 'true');
    }
    
    // Add search filter if provided
    if (search) {
      query += ` AND (ps.title LIKE ? OR ps.description LIKE ? OR ps.detailed_description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY ps.created_at DESC`;
    
    const [packages] = await pool.query(query, params);
    const enriched = [];

    for (let pkg of packages) {
      enriched.push(await attachInclusionsAndAttachments(pkg));
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const listCategoryPackages = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const packages = await getPackagesByCategory(categoryId);
    const enriched = [];

    for (let pkg of packages) {
      enriched.push(await attachInclusionsAndAttachments(pkg));
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const editPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      detailed_description, 
      price, 
      default_slots, 
      is_active, 
      category_id 
    } = req.body;

    const updated = await updatePackage(
      id, 
      title, 
      description, 
      detailed_description, 
      price, 
      is_active, 
      category_id
    );

    // Update default slots if provided
    if (default_slots !== undefined) {
      await updateDefaultSlots(id, default_slots);
    }

    if (!updated) return res.status(404).json({ message: "Package not found or not updated" });

    res.json({ message: "Package updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    // Get all attachments before deletion to remove files
    const attachments = await getAttachmentsByPackage(id);
    
    // Delete the package (this will handle database cleanup)
    const deleted = await softDeletePackage(id);

    if (!deleted) return res.status(404).json({ message: "Package not found" });

    // Delete all associated files from the filesystem
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.file_url) {
          try {
            // Extract the filename from the URL
            const urlParts = attachment.file_url.split('/');
            const filename = urlParts[urlParts.length - 1];
            
            // Build the correct file path using process.cwd()
            const filePath = path.join(process.cwd(), 'uploads', 'packages', filename);
            
            // Check if file exists and delete it
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Successfully deleted file: ${filename}`);
            } else {
              console.log(`File not found: ${filename}`);
            }
          } catch (fileError) {
            console.error(`Error deleting file: ${attachment.file_url}`, fileError);
            // Continue with other files even if one fails
          }
        }
      }
    }

    res.json({ message: "Package and associated files deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   PACKAGE RATING UPDATE
======================= */
export const updatePackageRatingController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { rating, reviewCount } = req.body;

    if (!rating || !reviewCount) {
      return res.status(400).json({ message: "Rating and review count are required" });
    }

    const updated = await updatePackageRating(packageId, rating, reviewCount);

    if (!updated) return res.status(404).json({ message: "Package not found" });

    res.json({ message: "Package rating updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   SEARCH & FILTER
======================= */
export const searchAndFilterPackages = async (req, res) => {
  try {
    const { 
      search = '', 
      categories = '', 
      planners = '', 
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 12
    } = req.query;

    // Parse category and planner filters
    const categoryIds = categories ? categories.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
    const plannerIds = planners ? planners.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [];

    // Get filtered packages
    const packages = await searchPackages(search, categoryIds, plannerIds, sortBy, sortOrder);
    
    // Enrich with inclusions and attachments
    const enriched = [];
    for (let pkg of packages) {
      enriched.push(await attachInclusionsAndAttachments(pkg));
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPackages = enriched.slice(startIndex, endIndex);

    // Response with metadata
    res.json({
      packages: paginatedPackages,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(enriched.length / limitNum),
        totalItems: enriched.length,
        itemsPerPage: limitNum,
        hasNext: endIndex < enriched.length,
        hasPrev: pageNum > 1
      },
      filters: {
        search,
        categories: categoryIds,
        planners: plannerIds,
        sortBy,
        sortOrder
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   INCLUSIONS CRUD
======================= */
export const addPackageInclusion = async (req, res) => {
  try {
    const { package_id, inclusion_name } = req.body;
    if (!package_id || !inclusion_name) {
      return res.status(400).json({ message: "Package ID and inclusion name required" });
    }

    // Verify package exists
    const packageData = await getPackageById(package_id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const inclusionId = await addInclusion(package_id, inclusion_name);
    res.status(201).json({ message: "Inclusion added", inclusionId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removePackageInclusion = async (req, res) => {
  try {
    const { inclusionId } = req.params;
    const deleted = await deleteInclusion(inclusionId);
    if (!deleted) return res.status(404).json({ message: "Inclusion not found" });
    res.json({ message: "Inclusion removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   PACKAGE DEFAULT SLOTS MANAGEMENT
======================= */
export const getPackageDefaultSlotsController = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const defaultSlots = await getDefaultSlots(packageId);

    res.json({
      packageId: parseInt(packageId),
      defaultSlots: defaultSlots || 1
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updatePackageDefaultSlotsController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { default_slots } = req.body;
    
    if (default_slots === undefined || default_slots < 1) {
      return res.status(400).json({ message: "Default slots must be at least 1" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    await updateDefaultSlots(packageId, default_slots);
    res.json({ message: "Package default slots updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   DATE-SPECIFIC SLOTS MANAGEMENT
======================= */
export const setDateSpecificSlotsController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { date, total_slots } = req.body;
    
    if (!date || total_slots === undefined || total_slots < 0) {
      return res.status(400).json({ message: "Date and valid total slots are required" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    await setDateSpecificSlots(packageId, date, total_slots);
    res.json({ message: "Date-specific slots set successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateDateSpecificSlotsController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { date, total_slots } = req.body;
    
    if (!date || total_slots === undefined || total_slots < 0) {
      return res.status(400).json({ message: "Date and valid total slots are required" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    await updateDateSpecificSlots(packageId, date, total_slots);
    res.json({ message: "Date-specific slots updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   PACKAGE UNAVAILABLE DATES
======================= */
export const addPackageUnavailableDate = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { unavailable_date, reason } = req.body;
    
    if (!unavailable_date) {
      return res.status(400).json({ message: "Unavailable date is required" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const unavailableId = await addUnavailableDate(packageId, unavailable_date, reason);
    res.status(201).json({ 
      message: "Unavailable date added successfully", 
      unavailableId 
    });
  } catch (err) {
    // Handle duplicate date constraint
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "This date is already marked as unavailable" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getPackageUnavailableDates = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const unavailableDates = await getUnavailableDates(packageId);
    res.json(unavailableDates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removePackageUnavailableDate = async (req, res) => {
  try {
    const { unavailableId } = req.params;
    
    const deleted = await deleteUnavailableDate(unavailableId);
    if (!deleted) return res.status(404).json({ message: "Unavailable date not found" });
    
    res.json({ message: "Unavailable date removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const checkDateAvailabilityController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const availability = await checkDateAvailability(packageId, date);
    res.json({ 
      packageId: parseInt(packageId),
      date,
      ...availability
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   PACKAGE AVAILABILITY BY DATE (UPDATED WITH PREPARATION DAYS)
======================= */

// Get detailed availability for a specific date
export const getPackageAvailabilityByDateController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const availability = await getPackageAvailabilityByDate(packageId, date);
    res.json({
      packageId: parseInt(packageId),
      date,
      ...availability
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get availability for a range of dates (for calendar)
export const getPackageAvailabilityRangeController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date parameters are required" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const availabilityMap = await getPackageAvailabilityRange(packageId, startDate, endDate);
    res.json({
      packageId: parseInt(packageId),
      startDate,
      endDate,
      availability: availabilityMap
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   NEW: UPCOMING AVAILABILITY WITH PREPARATION DAYS
======================= */

// Get upcoming available dates excluding preparation periods
export const getUpcomingAvailabilityController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { daysAhead = 30, limit = 7 } = req.query;
    
    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Get preparation days for this package
    const preparationDays = await getPackagePreparationDays(packageId);
    
    const upcomingDates = await getUpcomingAvailableDates(
      packageId, 
      parseInt(daysAhead), 
      parseInt(limit)
    );

    res.json({
      packageId: parseInt(packageId),
      preparationDays,
      upcomingDates,
      daysAhead: parseInt(daysAhead),
      limit: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =======================
   NEW: PREPARATION DAYS MANAGEMENT
======================= */

// Get preparation days for a package
export const getPackagePreparationDaysController = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const preparationDays = await getPackagePreparationDays(packageId);
    
    res.json({
      packageId: parseInt(packageId),
      preparationDays: preparationDays || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Check if a specific date is in preparation period
export const checkPreparationPeriodController = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const isInPreparationPeriod = await isDateInPreparationPeriod(packageId, date);
    const preparationDays = await getPackagePreparationDays(packageId);
    
    res.json({
      packageId: parseInt(packageId),
      date,
      isInPreparationPeriod,
      preparationDays,
      reason: isInPreparationPeriod ? 
        "Date falls within preparation period of another confirmed booking" : 
        null
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

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

    // Debug logging
    console.log('Upload request - package_id:', package_id);
    console.log('Upload request - req.user:', req.user);
    console.log('Upload request - files:', req.files?.length);

    // Verify package exists and belongs to the planner
    const packageData = await getPackageById(package_id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    console.log('Package data - planner_id:', packageData.planner_id);
    console.log('Package data - planner_id type:', typeof packageData.planner_id);

    // Simplified authorization check
    if (req.user && req.user.user_id) {
      console.log('Auth check - user_id:', req.user.user_id, 'type:', typeof req.user.user_id);
      console.log('Auth check - planner_id:', packageData.planner_id, 'type:', typeof packageData.planner_id);

      if (parseInt(req.user.user_id) !== parseInt(packageData.planner_id)) {
        console.log('Authorization failed - IDs do not match');
        return res.status(403).json({ message: "Not authorized to modify this package" });
      }
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedAttachments = [];
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Build absolute file URL
      const fileUrl = `${baseUrl}/uploads/packages/${file.filename}`;

      const isThumbnail = req.body.thumbnails && req.body.thumbnails[i] === 'true';

      console.log(`Processing file ${i + 1}: ${file.filename}, thumbnail: ${isThumbnail}`);

      if (isThumbnail) {
        console.log('Clearing existing thumbnails for package:', package_id);
        await clearPackageThumbnails(package_id);
      }

      console.log('Adding attachment to database:', {
        package_id,
        fileUrl,
        file_type: 'image',
        is_thumbnail: isThumbnail
      });

      const attachmentId = await addPackageAttachment(
        package_id,
        fileUrl,
        'image',
        isThumbnail
      );

      console.log('Attachment added with ID:', attachmentId);

      uploadedAttachments.push({
        attachmentId,
        fileUrl,
        fileName: file.originalname,
        isThumbnail
      });
    }

    console.log('All attachments processed successfully:', uploadedAttachments);

    res.status(201).json({
      message: "Images uploaded successfully",
      attachments: uploadedAttachments
    });
  } catch (err) {
    console.error('Upload error details:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add attachment via URL
export const addPackageAttachmentByUrl = async (req, res) => {
  try {
    const { package_id, file_url, file_type = 'image', is_thumbnail = false } = req.body;
    
    console.log('addPackageAttachmentByUrl called with:', {
      package_id,
      file_url,
      file_type,
      is_thumbnail,
      user: req.user
    });

    if (!package_id || !file_url) {
      return res.status(400).json({ message: "Package ID and file URL are required" });
    }

    // Verify package exists
    const packageData = await getPackageById(package_id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    console.log('Package data:', packageData);

    // If setting as thumbnail, remove thumbnail status from other images
    if (is_thumbnail) {
      await clearPackageThumbnails(package_id);
    }

    console.log('Adding attachment to database...');
    const attachmentId = await addPackageAttachment(package_id, file_url, file_type, is_thumbnail);
    console.log('Attachment added with ID:', attachmentId);
    
    res.status(201).json({ 
      message: "Attachment added successfully", 
      attachmentId,
      file_url,
      is_thumbnail
    });
  } catch (err) {
    console.error('addPackageAttachmentByUrl error:', err);
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

    if (req.user && parseInt(req.user.user_id) !== parseInt(packageData.planner_id)) {
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

/* =======================
   LEGACY PACKAGE ATTACHMENTS CRUD
======================= */
export const addPackageAttachmentController = async (req, res) => {
  try {
    const { package_id, file_url, file_type, is_thumbnail = false } = req.body;
    
    if (!package_id || !file_url) {
      return res.status(400).json({ message: "Package ID and file URL required" });
    }

    // Verify package exists
    const packageData = await getPackageById(package_id);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const attachmentId = await addPackageAttachment(package_id, file_url, file_type, is_thumbnail);
    res.status(201).json({ 
      message: "Attachment added successfully", 
      attachmentId 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getPackageAttachments = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const attachments = await getAttachmentsByPackage(packageId);
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removePackageAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    // Verify attachment exists
    const attachment = await getAttachmentById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const deleted = await deletePackageAttachment(attachmentId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Attachment not found" });
    }
    
    res.json({ message: "Attachment removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeAllPackageAttachments = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Verify package exists
    const packageData = await getPackageById(packageId);
    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    const deletedCount = await deleteAllPackageAttachments(packageId);
    
    res.json({ 
      message: `${deletedCount} attachment(s) removed successfully`,
      deletedCount 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};