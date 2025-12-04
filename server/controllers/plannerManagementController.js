// controllers/plannerManagementController.js
import {
  getAllPlannersForAdmin,
  getPlannerByIdForAdmin,
  getPlannersByStatus,
  approvePlanner,
  rejectPlanner,
  setPlannerUnderReview,
  allowPlannerResubmission,
  searchPlanners,
  getPlannerStatusCounts,
  getPlannerPermitDocuments,
  updateDocumentStatus,
  getDocumentById,
  getPermitDocumentsDetailed,
  checkAndAutoApprovePlanner,
  getAdminDashboardStats
} from "../models/plannerManagementModel.js";

/* =======================
   ADMIN PLANNER MANAGEMENT CONTROLLERS - UPDATED
======================= */

// Get all planners with admin details (updated to include document counts)
export const getAllPlannersController = async (req, res) => {
  try {
    const planners = await getAllPlannersForAdmin();
    
    const formattedPlanners = planners.map(planner => ({
      id: planner.planner_id,
      name: `${planner.first_name} ${planner.last_name}`,
      businessName: planner.business_name,
      email: planner.business_email || planner.personal_email,
      phone: planner.business_phone || planner.personal_phone,
      address: planner.location,
      registrationDate: planner.registration_date,
      status: planner.planner_status,
      businessType: "Wedding Planning Services",
      yearsExperience: planner.experience_years,
      rating: planner.avg_rating ? parseFloat(planner.avg_rating).toFixed(1) : null,
      totalBookings: planner.total_bookings || 0,
      totalPackages: planner.total_packages || 0,
      verificationNotes: planner.verification_notes,
      rejectionReason: planner.rejection_reason,
      permitNumber: planner.permit_number,
      profilePicture: planner.profile_picture,
      bio: planner.bio,
      updatedAt: planner.updated_at,
      // Document status info
      documentCounts: {
        total: planner.total_documents || 0,
        approved: planner.approved_documents || 0,
        pending: planner.pending_documents || 0,
        rejected: planner.rejected_documents || 0
      }
    }));

    res.json({
      success: true,
      planners: formattedPlanners,
      total: formattedPlanners.length
    });
  } catch (err) {
    console.error('Error fetching planners:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get planner by ID with detailed information (updated)
export const getPlannerController = async (req, res) => {
  try {
    const { plannerId } = req.params;
    
    const planner = await getPlannerByIdForAdmin(plannerId);
    if (!planner) {
      return res.status(404).json({ 
        success: false,
        message: "Planner not found" 
      });
    }

    // Get detailed documents
    const documents = await getPermitDocumentsDetailed(plannerId);

    const formattedPlanner = {
      id: planner.planner_id,
      name: `${planner.first_name} ${planner.last_name}`,
      businessName: planner.business_name,
      email: planner.business_email || planner.personal_email,
      phone: planner.business_phone || planner.personal_phone,
      address: planner.location,
      registrationDate: planner.registration_date,
      status: planner.planner_status,
      businessType: "Wedding Planning Services",
      yearsExperience: planner.experience_years,
      rating: planner.avg_rating ? parseFloat(planner.avg_rating).toFixed(1) : null,
      totalBookings: planner.total_bookings || 0,
      totalPackages: planner.total_packages || 0,
      completedBookings: planner.completed_bookings || 0,
      totalReviews: planner.total_reviews || 0,
      verificationNotes: planner.verification_notes,
      rejectionReason: planner.rejection_reason,
      permitNumber: planner.permit_number,
      profilePicture: planner.profile_picture,
      bio: planner.bio,
      personalDetails: {
        firstName: planner.first_name,
        lastName: planner.last_name,
        personalEmail: planner.personal_email,
        personalPhone: planner.personal_phone,
        userCreatedAt: planner.user_created_at
      },
      businessDetails: {
        businessEmail: planner.business_email,
        businessPhone: planner.business_phone,
        businessAddress: planner.location,
        businessType: "Wedding Planning Services",
        experienceYears: planner.experience_years
      },
      documentCounts: {
        total: planner.total_documents || 0,
        approved: planner.approved_documents || 0,
        pending: planner.pending_documents || 0,
        rejected: planner.rejected_documents || 0
      },
      documents: documents,
      updatedAt: planner.updated_at
    };

    res.json({
      success: true,
      planner: formattedPlanner
    });
  } catch (err) {
    console.error('Error fetching planner details:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get planners by status (updated to include document counts)
export const getPlannersByStatusController = async (req, res) => {
  try {
    const { status } = req.params;
    
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status. Valid statuses are: " + validStatuses.join(', ')
      });
    }

    const planners = await getPlannersByStatus(status);
    
    const formattedPlanners = planners.map(planner => ({
      id: planner.planner_id,
      name: `${planner.first_name} ${planner.last_name}`,
      businessName: planner.business_name,
      email: planner.business_email || planner.personal_email,
      phone: planner.business_phone || planner.personal_phone,
      address: planner.location,
      registrationDate: planner.registration_date,
      status: planner.planner_status,
      businessType: "Wedding Planning Services",
      yearsExperience: planner.experience_years,
      rating: planner.avg_rating ? parseFloat(planner.avg_rating).toFixed(1) : null,
      totalBookings: planner.total_bookings || 0,
      totalPackages: planner.total_packages || 0,
      verificationNotes: planner.verification_notes,
      rejectionReason: planner.rejection_reason,
      permitNumber: planner.permit_number,
      updatedAt: planner.updated_at,
      documentCounts: {
        total: planner.total_documents || 0,
        approved: planner.approved_documents || 0,
        pending: planner.pending_documents || 0,
        rejected: planner.rejected_documents || 0
      }
    }));

    res.json({
      success: true,
      status,
      planners: formattedPlanners,
      total: formattedPlanners.length
    });
  } catch (err) {
    console.error('Error fetching planners by status:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Approve planner (unchanged)
export const approvePlannerController = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const { verificationNotes, permitNumber } = req.body;
    
    const planner = await getPlannerByIdForAdmin(plannerId);
    if (!planner) {
      return res.status(404).json({ 
        success: false,
        message: "Planner not found" 
      });
    }

    if (planner.planner_status === 'approved') {
      return res.status(400).json({ 
        success: false,
        message: "Planner is already approved" 
      });
    }

    const updated = await approvePlanner(plannerId, verificationNotes, permitNumber);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false,
        message: "Failed to approve planner" 
      });
    }

    const updatedPlanner = await getPlannerByIdForAdmin(plannerId);

    res.json({ 
      success: true,
      message: "Planner approved successfully",
      planner: {
        id: updatedPlanner.planner_id,
        name: `${updatedPlanner.first_name} ${updatedPlanner.last_name}`,
        status: updatedPlanner.planner_status,
        permitNumber: updatedPlanner.permit_number,
        verificationNotes: updatedPlanner.verification_notes
      }
    });
  } catch (err) {
    console.error('Error approving planner:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Reject planner (unchanged)
export const rejectPlannerController = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const { rejectionReason, verificationNotes } = req.body;
    
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Rejection reason is required" 
      });
    }

    const planner = await getPlannerByIdForAdmin(plannerId);
    if (!planner) {
      return res.status(404).json({ 
        success: false,
        message: "Planner not found" 
      });
    }

    const updated = await rejectPlanner(plannerId, rejectionReason, verificationNotes);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false,
        message: "Failed to reject planner" 
      });
    }

    const updatedPlanner = await getPlannerByIdForAdmin(plannerId);

    res.json({ 
      success: true,
      message: "Planner rejected successfully",
      planner: {
        id: updatedPlanner.planner_id,
        name: `${updatedPlanner.first_name} ${updatedPlanner.last_name}`,
        status: updatedPlanner.planner_status,
        rejectionReason: updatedPlanner.rejection_reason,
        verificationNotes: updatedPlanner.verification_notes
      }
    });
  } catch (err) {
    console.error('Error rejecting planner:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Set planner under review (unchanged)
export const setPlannerUnderReviewController = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const { verificationNotes } = req.body;
    
    const planner = await getPlannerByIdForAdmin(plannerId);
    if (!planner) {
      return res.status(404).json({ 
        success: false,
        message: "Planner not found" 
      });
    }

    const updated = await setPlannerUnderReview(plannerId, verificationNotes);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false,
        message: "Failed to set planner under review" 
      });
    }

    res.json({ 
      success: true,
      message: "Planner set under review successfully"
    });
  } catch (err) {
    console.error('Error setting planner under review:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Allow planner resubmission (unchanged)
export const allowPlannerResubmissionController = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const { verificationNotes } = req.body;
    
    const planner = await getPlannerByIdForAdmin(plannerId);
    if (!planner) {
      return res.status(404).json({ 
        success: false,
        message: "Planner not found" 
      });
    }

    if (planner.planner_status !== 'rejected') {
      return res.status(400).json({ 
        success: false,
        message: "Only rejected planners can be allowed to resubmit" 
      });
    }

    const updated = await allowPlannerResubmission(plannerId, verificationNotes);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false,
        message: "Failed to allow planner resubmission" 
      });
    }

    res.json({ 
      success: true,
      message: "Planner resubmission allowed successfully"
    });
  } catch (err) {
    console.error('Error allowing planner resubmission:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Search and filter planners (updated to include document counts)
export const searchPlannersController = async (req, res) => {
  try {
    const { 
      search = '', 
      status = '', 
      sortBy = 'registration_date',
      sortOrder = 'DESC',
      page = 1,
      limit = 12
    } = req.query;

    const validSortFields = ['registration_date', 'name', 'business_name', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'registration_date';
    const order = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const planners = await searchPlanners(search, status, sortField, order);
    
    const formattedPlanners = planners.map(planner => ({
      id: planner.planner_id,
      name: `${planner.first_name} ${planner.last_name}`,
      businessName: planner.business_name,
      email: planner.business_email || planner.personal_email,
      phone: planner.business_phone || planner.personal_phone,
      address: planner.location,
      registrationDate: planner.registration_date,
      status: planner.planner_status,
      businessType: "Wedding Planning Services",
      yearsExperience: planner.experience_years,
      rating: planner.avg_rating ? parseFloat(planner.avg_rating).toFixed(1) : null,
      totalBookings: planner.total_bookings || 0,
      totalPackages: planner.total_packages || 0,
      verificationNotes: planner.verification_notes,
      rejectionReason: planner.rejection_reason,
      permitNumber: planner.permit_number,
      updatedAt: planner.updated_at,
      documentCounts: {
        total: planner.total_documents || 0,
        approved: planner.approved_documents || 0,
        pending: planner.pending_documents || 0,
        rejected: planner.rejected_documents || 0
      }
    }));

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPlanners = formattedPlanners.slice(startIndex, endIndex);

    res.json({
      success: true,
      planners: paginatedPlanners,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(formattedPlanners.length / limitNum),
        totalItems: formattedPlanners.length,
        itemsPerPage: limitNum,
        hasNext: endIndex < formattedPlanners.length,
        hasPrev: pageNum > 1
      },
      filters: {
        search,
        status,
        sortBy: sortField,
        sortOrder: order
      }
    });
  } catch (err) {
    console.error('Error searching planners:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get planner status counts (unchanged)
export const getPlannerStatusCountsController = async (req, res) => {
  try {
    const counts = await getPlannerStatusCounts();
    
    res.json({
      success: true,
      counts
    });
  } catch (err) {
    console.error('Error getting planner status counts:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Updated: Get planner permit documents
export const getPlannerPermitDocumentsController = async (req, res) => {
  try {
    const { plannerId } = req.params;
    
    const planner = await getPlannerByIdForAdmin(plannerId);
    if (!planner) {
      return res.status(404).json({ 
        success: false,
        message: "Planner not found" 
      });
    }

    const documents = await getPlannerPermitDocuments(plannerId);
    
    res.json({
      success: true,
      plannerId: parseInt(plannerId),
      documents: documents.map(doc => ({
        id: doc.attachment_id,
        permitId: doc.permit_id,
        fileUrl: doc.file_url,
        fileType: doc.file_type,
        govIdType: doc.gov_id_type,
        govIdNumber: doc.gov_id_number,
        status: doc.permit_status,
        notes: doc.notes,
        uploadedAt: doc.uploaded_at,
        uploadedBy: {
          name: `${doc.uploader_first_name} ${doc.uploader_last_name}`
        },
        reviewedBy: doc.reviewer_first_name ? {
          name: `${doc.reviewer_first_name} ${doc.reviewer_last_name}`
        } : null,
        reviewedAt: doc.reviewed_at,
        permitApproved: doc.permit_approved
      }))
    });
  } catch (err) {
    console.error('Error getting planner documents:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// New: Update individual document status - Enhanced with better error handling
export const updateDocumentStatusController = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const { status, notes } = req.body;
    const reviewerId = req.user?.user_id; // From auth middleware
    
    console.log('Update document request:', { attachmentId, status, notes, reviewerId });
    
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid document status. Valid statuses are: " + validStatuses.join(', ')
      });
    }

    // Check if document exists with better error handling
    const document = await getDocumentById(attachmentId);
    console.log('Document found:', document);
    
    if (!document) {
      // Check if attachment exists at all
      const pool = (await import("../config/db.js")).default;
      const [attachmentCheck] = await pool.query(
        'SELECT attachment_id FROM permit_attachments WHERE attachment_id = ?', 
        [attachmentId]
      );
      
      if (attachmentCheck.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: `Document with ID ${attachmentId} does not exist`
        });
      } else {
        return res.status(404).json({ 
          success: false,
          message: "Document found but missing required relationships (permit/planner)" 
        });
      }
    }

    const updated = await updateDocumentStatus(attachmentId, status, notes, reviewerId);
    
    if (!updated) {
      return res.status(500).json({ 
        success: false,
        message: "Failed to update document status" 
      });
    }

    // Get updated planner info to check overall status
    const plannerInfo = await getPlannerByIdForAdmin(document.planner_id);

    res.json({ 
      success: true,
      message: `Document ${status} successfully`,
      document: {
        id: parseInt(attachmentId),
        status,
        notes,
        reviewedAt: new Date().toISOString()
      },
      plannerStatus: plannerInfo?.planner_status
    });
  } catch (err) {
    console.error('Error updating document status:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// New: Bulk update documents for a planner
export const bulkUpdateDocumentsController = async (req, res) => {
  try {
    const { plannerId } = req.params;
    const { action, notes } = req.body; // action: 'approve_all', 'reject_all'
    const reviewerId = req.user?.user_id;
    
    if (!['approve_all', 'reject_all'].includes(action)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid action. Use 'approve_all' or 'reject_all'" 
      });
    }

    const planner = await getPlannerByIdForAdmin(plannerId);
    if (!planner) {
      return res.status(404).json({ 
        success: false,
        message: "Planner not found" 
      });
    }

    // Get all pending documents for this planner
    const documents = await getPlannerPermitDocuments(plannerId);
    const pendingDocs = documents.filter(doc => doc.permit_status === 'pending');

    if (pendingDocs.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No pending documents found for this planner" 
      });
    }

    const status = action === 'approve_all' ? 'approved' : 'rejected';
    const updatePromises = pendingDocs.map(doc => 
      updateDocumentStatus(doc.attachment_id, status, notes, reviewerId)
    );

    await Promise.all(updatePromises);

    // Check final planner status after bulk update
    await checkAndAutoApprovePlanner(plannerId);
    const updatedPlanner = await getPlannerByIdForAdmin(plannerId);

    res.json({ 
      success: true,
      message: `${pendingDocs.length} documents ${status} successfully`,
      documentsUpdated: pendingDocs.length,
      plannerStatus: updatedPlanner?.planner_status
    });
  } catch (err) {
    console.error('Error bulk updating documents:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Legacy function for backward compatibility
export const getPlannerDocumentsController = getPlannerPermitDocumentsController;

// New: Get document by ID controller
export const getDocumentByIdController = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const document = await getDocumentById(attachmentId);
    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: "Document not found" 
      });
    }

    res.json({
      success: true,
      document: {
        id: document.attachment_id,
        permitId: document.permit_id,
        plannerId: document.planner_id,
        fileUrl: document.file_url,
        fileType: document.file_type,
        govIdType: document.gov_id_type,
        govIdNumber: document.gov_id_number,
        status: document.permit_status,
        notes: document.notes,
        uploadedAt: document.uploaded_at,
        plannerName: `${document.first_name} ${document.last_name}`
      }
    });
  } catch (err) {
    console.error('Error fetching document:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// New: Get admin dashboard statistics controller
export const getAdminDashboardStatsController = async (req, res) => {
  try {
    const stats = await getAdminDashboardStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Error fetching admin dashboard statistics:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};