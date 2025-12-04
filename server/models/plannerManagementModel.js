// models/plannerManagementModel.js
import pool from "../config/db.js";

/* =======================
   PLANNER MANAGEMENT MODEL - UPDATED
======================= */

// Get all planners with their details and stats
export const getAllPlannersForAdmin = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.planner_id,
      p.business_name,
      p.business_email,
      p.business_phone,
      p.experience_years,
      p.status as planner_status,
      p.verification_notes,
      p.permit_number,
      p.rejection_reason,
      p.created_at as registration_date,
      p.updated_at,
      u.first_name,
      u.last_name,
      u.email as personal_email,
      u.phone as personal_phone,
      u.profile_picture,
      u.bio,
      u.location,
      u.created_at as user_created_at,
      COUNT(DISTINCT ps.package_id) as total_packages,
      COUNT(DISTINCT b.booking_id) as total_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END) as completed_bookings,
      AVG(f.rating) as avg_rating,
      COUNT(DISTINCT f.feedback_id) as total_reviews,
      -- Document status counts
      COUNT(DISTINCT pa.attachment_id) as total_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'approved' THEN pa.attachment_id END) as approved_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'pending' THEN pa.attachment_id END) as pending_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'rejected' THEN pa.attachment_id END) as rejected_documents
    FROM planners p
    JOIN users u ON p.planner_id = u.user_id
    LEFT JOIN package_services ps ON p.planner_id = ps.planner_id AND ps.is_active = TRUE
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    LEFT JOIN feedback f ON b.booking_id = f.booking_id
    LEFT JOIN permits perm ON p.planner_id = perm.submitted_by
    LEFT JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
    GROUP BY p.planner_id
    ORDER BY p.created_at DESC
  `);
  return rows;
};

// Get planner by ID with detailed information
export const getPlannerByIdForAdmin = async (plannerId) => {
  const [rows] = await pool.query(`
    SELECT 
      p.planner_id,
      p.business_name,
      p.business_email,
      p.business_phone,
      p.experience_years,
      p.status as planner_status,
      p.verification_notes,
      p.permit_number,
      p.rejection_reason,
      p.created_at as registration_date,
      p.updated_at,
      u.first_name,
      u.last_name,
      u.email as personal_email,
      u.phone as personal_phone,
      u.profile_picture,
      u.bio,
      u.location,
      u.created_at as user_created_at,
      COUNT(DISTINCT ps.package_id) as total_packages,
      COUNT(DISTINCT b.booking_id) as total_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END) as completed_bookings,
      AVG(f.rating) as avg_rating,
      COUNT(DISTINCT f.feedback_id) as total_reviews,
      -- Document status counts
      COUNT(DISTINCT pa.attachment_id) as total_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'approved' THEN pa.attachment_id END) as approved_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'pending' THEN pa.attachment_id END) as pending_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'rejected' THEN pa.attachment_id END) as rejected_documents
    FROM planners p
    JOIN users u ON p.planner_id = u.user_id
    LEFT JOIN package_services ps ON p.planner_id = ps.planner_id AND ps.is_active = TRUE
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    LEFT JOIN feedback f ON b.booking_id = f.booking_id
    LEFT JOIN permits perm ON p.planner_id = perm.submitted_by
    LEFT JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
    WHERE p.planner_id = ?
    GROUP BY p.planner_id
  `, [plannerId]);
  
  return rows[0] || null;
};

// Get planners by status
export const getPlannersByStatus = async (status) => {
  const [rows] = await pool.query(`
    SELECT 
      p.planner_id,
      p.business_name,
      p.business_email,
      p.business_phone,
      p.experience_years,
      p.status as planner_status,
      p.verification_notes,
      p.permit_number,
      p.rejection_reason,
      p.created_at as registration_date,
      p.updated_at,
      u.first_name,
      u.last_name,
      u.email as personal_email,
      u.phone as personal_phone,
      u.profile_picture,
      u.bio,
      u.location,
      COUNT(DISTINCT ps.package_id) as total_packages,
      COUNT(DISTINCT b.booking_id) as total_bookings,
      AVG(f.rating) as avg_rating,
      -- Document status counts
      COUNT(DISTINCT pa.attachment_id) as total_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'approved' THEN pa.attachment_id END) as approved_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'pending' THEN pa.attachment_id END) as pending_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'rejected' THEN pa.attachment_id END) as rejected_documents
    FROM planners p
    JOIN users u ON p.planner_id = u.user_id
    LEFT JOIN package_services ps ON p.planner_id = ps.planner_id AND ps.is_active = TRUE
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    LEFT JOIN feedback f ON b.booking_id = f.booking_id
    LEFT JOIN permits perm ON p.planner_id = perm.submitted_by
    LEFT JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
    WHERE p.status = ?
    GROUP BY p.planner_id
    ORDER BY p.created_at DESC
  `, [status]);
  
  return rows;
};

// Update planner status (unchanged)
export const updatePlannerStatus = async (plannerId, status, verificationNotes = null, rejectionReason = null, permitNumber = null) => {
  const updateData = {
    status,
    verification_notes: verificationNotes,
    updated_at: new Date()
  };

  if (status === 'rejected' && rejectionReason) {
    updateData.rejection_reason = rejectionReason;
  }

  if (status === 'approved' && permitNumber) {
    updateData.permit_number = permitNumber;
    updateData.rejection_reason = null;
  }

  const values = Object.values(updateData);

  const [result] = await pool.query(`
    UPDATE planners 
    SET ${Object.keys(updateData).map(key => `${key} = ?`).join(', ')}
    WHERE planner_id = ?
  `, [...values, plannerId]);

  return result.affectedRows;
};

// Auto-approve planner if all documents are approved
export const checkAndAutoApprovePlanner = async (plannerId) => {
  // Get document counts
  const [docCounts] = await pool.query(`
    SELECT 
      COUNT(*) as total_docs,
      COUNT(CASE WHEN pa.permit_status = 'approved' THEN 1 END) as approved_docs,
      COUNT(CASE WHEN pa.permit_status = 'rejected' THEN 1 END) as rejected_docs
    FROM permits perm
    JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
    WHERE perm.submitted_by = ?
  `, [plannerId]);

  const { total_docs, approved_docs, rejected_docs } = docCounts[0];

  // Auto-approve if all documents are approved and there's at least one document
  if (total_docs > 0 && approved_docs === total_docs) {
    await updatePlannerStatus(plannerId, 'approved', 'Auto-approved: All documents verified');
    return 'approved';
  }
  // Auto-reject if any document is rejected
  else if (rejected_docs > 0) {
    await updatePlannerStatus(plannerId, 'rejected', 'Auto-rejected: Some documents were rejected');
    return 'rejected';
  }
  // Set under review if has documents but not all approved
  else if (total_docs > 0) {
    await updatePlannerStatus(plannerId, 'under_review', 'Under review: Document verification in progress');
    return 'under_review';
  }

  return null;
};

// Approve planner (unchanged)
export const approvePlanner = async (plannerId, verificationNotes = null, permitNumber = null) => {
  if (!permitNumber) {
    const year = new Date().getFullYear();
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as count FROM planners WHERE status = 'approved' AND YEAR(updated_at) = ?`,
      [year]
    );
    const nextNumber = (countResult[0].count + 1).toString().padStart(3, '0');
    permitNumber = `WP-${year}-${nextNumber}`;
  }

  return await updatePlannerStatus(plannerId, 'approved', verificationNotes, null, permitNumber);
};

// Reject planner (unchanged)
export const rejectPlanner = async (plannerId, rejectionReason, verificationNotes = null) => {
  return await updatePlannerStatus(plannerId, 'rejected', verificationNotes, rejectionReason);
};

// Set planner under review (unchanged)
export const setPlannerUnderReview = async (plannerId, verificationNotes = null) => {
  return await updatePlannerStatus(plannerId, 'under_review', verificationNotes);
};

// Allow resubmission (unchanged)
export const allowPlannerResubmission = async (plannerId, verificationNotes = null) => {
  return await updatePlannerStatus(plannerId, 'pending', verificationNotes, null);
};

// Search planners with filters (add document counts)
export const searchPlanners = async (searchQuery = '', status = '', sortBy = 'created_at', sortOrder = 'DESC') => {
  let query = `
    SELECT 
      p.planner_id,
      p.business_name,
      p.business_email,
      p.business_phone,
      p.experience_years,
      p.status as planner_status,
      p.verification_notes,
      p.permit_number,
      p.rejection_reason,
      p.created_at as registration_date,
      p.updated_at,
      u.first_name,
      u.last_name,
      u.email as personal_email,
      u.phone as personal_phone,
      u.profile_picture,
      u.bio,
      u.location,
      COUNT(DISTINCT ps.package_id) as total_packages,
      COUNT(DISTINCT b.booking_id) as total_bookings,
      AVG(f.rating) as avg_rating,
      -- Document status counts
      COUNT(DISTINCT pa.attachment_id) as total_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'approved' THEN pa.attachment_id END) as approved_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'pending' THEN pa.attachment_id END) as pending_documents,
      COUNT(DISTINCT CASE WHEN pa.permit_status = 'rejected' THEN pa.attachment_id END) as rejected_documents
    FROM planners p
    JOIN users u ON p.planner_id = u.user_id
    LEFT JOIN package_services ps ON p.planner_id = ps.planner_id AND ps.is_active = TRUE
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    LEFT JOIN feedback f ON b.booking_id = f.booking_id
    LEFT JOIN permits perm ON p.planner_id = perm.submitted_by
    LEFT JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
    WHERE 1=1
  `;

  const params = [];

  if (searchQuery) {
    query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR p.business_name LIKE ? OR p.business_email LIKE ?)`;
    const searchTerm = `%${searchQuery}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (status) {
    query += ` AND p.status = ?`;
    params.push(status);
  }

  query += ` GROUP BY p.planner_id`;

  switch (sortBy) {
    case 'name':
      query += ` ORDER BY u.first_name ${sortOrder}, u.last_name ${sortOrder}`;
      break;
    case 'business_name':
      query += ` ORDER BY p.business_name ${sortOrder}`;
      break;
    case 'registration_date':
      query += ` ORDER BY p.created_at ${sortOrder}`;
      break;
    case 'status':
      query += ` ORDER BY p.status ${sortOrder}`;
      break;
    default:
      query += ` ORDER BY p.created_at ${sortOrder}`;
  }

  const [rows] = await pool.query(query, params);
  return rows;
};

// Get planner status counts (unchanged)
export const getPlannerStatusCounts = async () => {
  const [rows] = await pool.query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM planners
    GROUP BY status
  `);

  const counts = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0
  };

  rows.forEach(row => {
    counts[row.status] = row.count;
    counts.total += row.count;
  });

  return counts;
};

// Updated: Get planner permit documents with individual status
export const getPlannerPermitDocuments = async (plannerId) => {
  const [rows] = await pool.query(`
    SELECT 
      pa.attachment_id,
      pa.permit_id,
      pa.uploaded_by,
      pa.file_url,
      pa.file_type,
      pa.gov_id_type,
      pa.gov_id_number,
      pa.permit_status,
      pa.notes,
      pa.uploaded_at,
      perm.submitted_at,
      perm.reviewed_by,
      perm.reviewed_at,
      perm.is_approved as permit_approved,
      uploader.first_name as uploader_first_name,
      uploader.last_name as uploader_last_name,
      reviewer.first_name as reviewer_first_name,
      reviewer.last_name as reviewer_last_name
    FROM permits perm
    JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
    LEFT JOIN users uploader ON pa.uploaded_by = uploader.user_id
    LEFT JOIN users reviewer ON perm.reviewed_by = reviewer.user_id
    WHERE perm.submitted_by = ?
    ORDER BY pa.uploaded_at DESC
  `, [plannerId]);

  return rows;
};

// New: Update individual document status
export const updateDocumentStatus = async (attachmentId, status, notes = null, reviewedBy = null) => {
  const [result] = await pool.query(`
    UPDATE permit_attachments
    SET permit_status = ?, notes = ?
    WHERE attachment_id = ?
  `, [status, notes, attachmentId]);

  // Update the permit's reviewed info if provided
  if (reviewedBy && result.affectedRows > 0) {
    // Get the permit_id from the attachment
    const [attachmentInfo] = await pool.query(`
      SELECT permit_id FROM permit_attachments WHERE attachment_id = ?
    `, [attachmentId]);

    if (attachmentInfo.length > 0) {
      await pool.query(`
        UPDATE permits
        SET reviewed_by = ?, reviewed_at = NOW()
        WHERE permit_id = ?
      `, [reviewedBy, attachmentInfo[0].permit_id]);

      // Get planner_id and check for auto-approval/rejection
      const [permitInfo] = await pool.query(`
        SELECT submitted_by FROM permits WHERE permit_id = ?
      `, [attachmentInfo[0].permit_id]);

      if (permitInfo.length > 0) {
        await checkAndAutoApprovePlanner(permitInfo[0].submitted_by);
      }
    }
  }

  return result.affectedRows;
};

// New: Get document by ID - Fixed query
export const getDocumentById = async (attachmentId) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pa.attachment_id,
        pa.permit_id,
        pa.uploaded_by,
        pa.file_url,
        pa.file_type,
        pa.gov_id_type,
        pa.gov_id_number,
        pa.permit_status,
        pa.notes,
        pa.uploaded_at,
        perm.submitted_by as planner_id,
        u.first_name,
        u.last_name
      FROM permit_attachments pa
      JOIN permits perm ON pa.permit_id = perm.permit_id
      JOIN users u ON perm.submitted_by = u.user_id
      WHERE pa.attachment_id = ?
    `, [attachmentId]);

    return rows[0] || null;
  } catch (error) {
    console.error('Error in getDocumentById:', error);
    throw error;
  }
};

// Get permit documents with detailed status info
export const getPermitDocumentsDetailed = async (plannerId) => {
  const [rows] = await pool.query(`
    SELECT 
      pa.attachment_id,
      pa.permit_id,
      pa.file_url,
      pa.file_type,
      pa.gov_id_type,
      pa.gov_id_number,
      pa.permit_status,
      pa.notes,
      pa.uploaded_at,
      perm.submitted_at,
      perm.is_approved as permit_approved,
      CASE pa.permit_status
        WHEN 'approved' THEN 'Approved'
        WHEN 'rejected' THEN 'Rejected'
        ELSE 'Pending Review'
      END as status_display,
      CASE pa.permit_status
        WHEN 'approved' THEN 'success'
        WHEN 'rejected' THEN 'error'
        ELSE 'warning'
      END as status_color
    FROM permits perm
    JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
    WHERE perm.submitted_by = ?
    ORDER BY pa.uploaded_at DESC
  `, [plannerId]);

  return rows;
};

// New: Get admin dashboard statistics
export const getAdminDashboardStats = async () => {
  try {
    // Get comprehensive statistics
    const [statsRows] = await pool.query(`
      SELECT 
        COUNT(DISTINCT p.planner_id) as total_planners,
        COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.planner_id END) as pending_planners,
        COUNT(DISTINCT CASE WHEN p.status = 'approved' THEN p.planner_id END) as approved_planners,
        COUNT(DISTINCT CASE WHEN p.status = 'rejected' THEN p.planner_id END) as rejected_planners,
        COUNT(DISTINCT CASE WHEN p.status = 'under_review' THEN p.planner_id END) as under_review_planners,
        COUNT(DISTINCT pa.attachment_id) as total_documents,
        COUNT(DISTINCT CASE WHEN pa.permit_status = 'pending' THEN pa.attachment_id END) as pending_documents,
        COUNT(DISTINCT CASE WHEN pa.permit_status = 'approved' THEN pa.attachment_id END) as approved_documents,
        COUNT(DISTINCT CASE WHEN pa.permit_status = 'rejected' THEN pa.attachment_id END) as rejected_documents,
        COUNT(DISTINCT ps.package_id) as total_packages,
        COUNT(DISTINCT b.booking_id) as total_bookings,
        AVG(f.rating) as avg_rating
      FROM planners p
      LEFT JOIN permits perm ON p.planner_id = perm.submitted_by
      LEFT JOIN permit_attachments pa ON perm.permit_id = pa.permit_id
      LEFT JOIN package_services ps ON p.planner_id = ps.planner_id AND ps.is_active = TRUE
      LEFT JOIN bookings b ON ps.package_id = b.package_id
      LEFT JOIN feedback f ON b.booking_id = f.booking_id
    `);

    // Get recent registrations (last 30 days)
    const [recentRows] = await pool.query(`
      SELECT COUNT(*) as recent_registrations
      FROM planners
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const stats = statsRows[0];
    
    return {
      planners: {
        total: stats.total_planners || 0,
        pending: stats.pending_planners || 0,
        approved: stats.approved_planners || 0,
        rejected: stats.rejected_planners || 0,
        under_review: stats.under_review_planners || 0,
        recent_registrations: recentRows[0].recent_registrations || 0
      },
      documents: {
        total: stats.total_documents || 0,
        pending: stats.pending_documents || 0,
        approved: stats.approved_documents || 0,
        rejected: stats.rejected_documents || 0
      },
      business: {
        total_packages: stats.total_packages || 0,
        total_bookings: stats.total_bookings || 0,
        avg_rating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(2) : null
      }
    };
  } catch (error) {
    console.error('Error in getAdminDashboardStats:', error);
    throw error;
  }
};