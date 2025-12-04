import pool from "../config/db.js";

/* =======================
   PACKAGE SERVICES (Main Package Table)
======================= */
export const createPackage = async (
  planner_id,
  title,
  description,
  detailed_description,
  price,
  category_id
) => {
  const [result] = await pool.query(
    `INSERT INTO package_services (planner_id, title, description, detailed_description, price, category_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [planner_id, title, description, detailed_description, price, category_id]
  );
  return result.insertId;
};

export const getAllPackages = async () => {
  const [rows] = await pool.query(
    `SELECT ps.*, c.name AS category_name, c.description AS category_description,
            u.first_name, u.last_name, u.phone, u.profile_picture, u.bio, u.location,
            p.business_name, p.experience_years, p.status as planner_status,
            pda.total_slots as default_slots
     FROM package_services ps
     JOIN categories c ON ps.category_id = c.category_id
     JOIN planners p ON ps.planner_id = p.planner_id
     JOIN users u ON p.planner_id = u.user_id
     LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
     WHERE ps.is_active = TRUE AND p.status = 'approved'
     ORDER BY ps.created_at DESC`
  );
  return rows;
};

export const getPackageById = async (packageId) => {
  // Get package details with aggregate stats
  const [rows] = await pool.query(
    `SELECT ps.*, c.name AS category_name, c.description AS category_description,
            u.first_name, u.last_name, p.business_email, p.business_phone, 
            u.profile_picture, u.bio, u.location, u.created_at as planner_joined,
            p.business_name, p.experience_years, p.status as planner_status,
            pda.total_slots as default_slots,
            COUNT(DISTINCT b.booking_id) as total_bookings,
            COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END) as completed_bookings,
            AVG(f.rating) as avg_rating,
            COUNT(DISTINCT f.feedback_id) as total_reviews
     FROM package_services ps
     JOIN categories c ON ps.category_id = c.category_id
     JOIN planners p ON ps.planner_id = p.planner_id
     JOIN users u ON p.planner_id = u.user_id
     LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
     LEFT JOIN bookings b ON ps.package_id = b.package_id
     LEFT JOIN feedback f ON b.booking_id = f.booking_id
     WHERE ps.package_id = ?
     GROUP BY ps.package_id`,
    [packageId]
  );

  if (!rows[0]) {
    return null;
  }

  const packageData = rows[0];

  // Get inclusions for this package
  const inclusions = await getInclusionsByPackage(packageId);

  // Get attachments for this package
  const attachments = await getAttachmentsByPackage(packageId);

  // Get reviews for this package
  const [reviewRows] = await pool.query(
    `SELECT f.feedback_id, f.rating, f.comment, f.wedding_date, f.created_at,
            cu.first_name as client_first_name, cu.last_name as client_last_name,
            cu.profile_picture as client_profile_picture
     FROM feedback f
     JOIN bookings b ON f.booking_id = b.booking_id
     JOIN clients c ON f.client_id = c.client_id
     JOIN users cu ON c.client_id = cu.user_id
     WHERE b.package_id = ?
     ORDER BY f.created_at DESC`,
    [packageId]
  );

  // Format reviews
  const reviews = reviewRows.map((review) => ({
    feedback_id: review.feedback_id,
    rating: review.rating,
    comment: review.comment,
    wedding_date: review.wedding_date,
    created_at: review.created_at,
    client: {
      first_name: review.client_first_name,
      last_name: review.client_last_name,
      profile_picture: review.client_profile_picture,
    },
  }));

  return {
    ...packageData,
    inclusions,
    attachments,
    reviews,
  };
};

export const getPackagesByPlanner = async (plannerId) => {
  const [rows] = await pool.query(
    `SELECT ps.*, c.name AS category_name, c.description AS category_description,
            u.first_name, u.last_name, u.phone, u.profile_picture, u.bio, u.location,
            p.business_name, p.experience_years, p.status as planner_status,
            pda.total_slots as default_slots
     FROM package_services ps
     JOIN categories c ON ps.category_id = c.category_id
     JOIN planners p ON ps.planner_id = p.planner_id
     JOIN users u ON p.planner_id = u.user_id
     LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
     WHERE ps.planner_id = ? AND ps.is_active = TRUE
     ORDER BY ps.created_at DESC`,
    [plannerId]
  );
  return rows;
};

export const getPackagesByCategory = async (categoryId) => {
  const [rows] = await pool.query(
    `SELECT ps.*, c.name AS category_name, c.description AS category_description,
            u.first_name, u.last_name, u.phone, u.profile_picture, u.bio, u.location,
            p.business_name, p.experience_years, p.status as planner_status,
            pda.total_slots as default_slots
     FROM package_services ps
     JOIN categories c ON ps.category_id = c.category_id
     JOIN planners p ON ps.planner_id = p.planner_id
     JOIN users u ON p.planner_id = u.user_id
     LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
     WHERE ps.category_id = ? AND ps.is_active = TRUE AND p.status = 'approved'
     ORDER BY ps.created_at DESC`,
    [categoryId]
  );
  return rows;
};

export const updatePackage = async (
  packageId,
  title,
  description,
  detailed_description,
  price,
  is_active,
  category_id
) => {
  const [result] = await pool.query(
    `UPDATE package_services 
     SET title = ?, description = ?, detailed_description = ?, price = ?, is_active = ?, category_id = ?
     WHERE package_id = ?`,
    [
      title,
      description,
      detailed_description,
      price,
      is_active,
      category_id,
      packageId,
    ]
  );
  return result.affectedRows;
};

export const updatePackageRating = async (
  packageId,
  newRating,
  reviewCount
) => {
  const [result] = await pool.query(
    `UPDATE package_services 
     SET rating = ?, review_count = ?
     WHERE package_id = ?`,
    [newRating, reviewCount, packageId]
  );
  return result.affectedRows;
};

export const softDeletePackage = async (packageId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Delete package attachments from database
    await connection.query(
      `DELETE FROM package_attachments WHERE package_id = ?`,
      [packageId]
    );

    // 2. Delete inclusions
    await connection.query(
      `DELETE FROM inclusions WHERE package_id = ?`,
      [packageId]
    );

    // 3. Delete unavailable dates
    await connection.query(
      `DELETE FROM package_unavailable_dates WHERE package_id = ?`,
      [packageId]
    );

    // 4. Delete date-specific availability
    await connection.query(
      `DELETE FROM package_availability_by_date WHERE package_id = ?`,
      [packageId]
    );

    // 5. Delete default availability
    await connection.query(
      `DELETE FROM package_default_availability WHERE package_id = ?`,
      [packageId]
    );

    // 6. Soft delete the package itself
    const [result] = await connection.query(
      `UPDATE package_services SET is_active = FALSE WHERE package_id = ?`,
      [packageId]
    );

    await connection.commit();
    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get planner's complete profile with stats
export const getPlannerProfile = async (plannerId) => {
  const [plannerRows] = await pool.query(
    `SELECT u.first_name, u.last_name, u.phone, u.profile_picture, u.bio, u.location, u.created_at as joined_date,
            p.business_name, p.experience_years, p.status as planner_status,
            COUNT(DISTINCT ps.package_id) as total_packages,
            COUNT(DISTINCT b.booking_id) as total_bookings,
            COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END) as completed_bookings,
            AVG(f.rating) as avg_rating,
            COUNT(DISTINCT f.feedback_id) as total_reviews
     FROM planners p
     JOIN users u ON p.planner_id = u.user_id
     LEFT JOIN package_services ps ON p.planner_id = ps.planner_id AND ps.is_active = TRUE
     LEFT JOIN bookings b ON ps.package_id = b.package_id
     LEFT JOIN feedback f ON b.booking_id = f.booking_id
     WHERE p.planner_id = ?
     GROUP BY p.planner_id`,
    [plannerId]
  );
  return plannerRows[0];
};

/* =======================
   INCLUSIONS (Package Inclusions/Features)
======================= */
export const addInclusion = async (package_id, inclusion_name) => {
  const [result] = await pool.query(
    `INSERT INTO inclusions (package_id, inclusion_name) VALUES (?, ?)`,
    [package_id, inclusion_name]
  );
  return result.insertId;
};

export const getInclusionsByPackage = async (package_id) => {
  const [rows] = await pool.query(
    `SELECT inclusion_id, inclusion_name FROM inclusions WHERE package_id = ?`,
    [package_id]
  );
  return rows;
};

export const deleteInclusion = async (inclusion_id) => {
  const [result] = await pool.query(
    `DELETE FROM inclusions WHERE inclusion_id = ?`,
    [inclusion_id]
  );
  return result.affectedRows;
};

/* =======================
   PACKAGE ATTACHMENTS
======================= */
export const addPackageAttachment = async (
  package_id,
  file_url,
  file_type,
  is_thumbnail = false
) => {
  try {
    console.log('addPackageAttachment called with:', {
      package_id,
      file_url,
      file_type,
      is_thumbnail
    });

    const [result] = await pool.query(
      `INSERT INTO package_attachments (package_id, file_url, file_type, is_thumbnail) VALUES (?, ?, ?, ?)`,
      [package_id, file_url, file_type, is_thumbnail]
    );

    console.log('Database insertion result:', result);
    console.log('Inserted attachment with ID:', result.insertId);

    return result.insertId;
  } catch (error) {
    console.error('Error in addPackageAttachment:', error);
    console.error('SQL Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    throw error;
  }
};

export const getAttachmentsByPackage = async (package_id) => {
  const [rows] = await pool.query(
    `SELECT attachment_id, file_url, file_type, is_thumbnail, uploaded_at 
     FROM package_attachments 
     WHERE package_id = ? 
     ORDER BY is_thumbnail DESC, uploaded_at DESC`,
    [package_id]
  );
  return rows;
};

export const getAttachmentById = async (attachment_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM package_attachments WHERE attachment_id = ?`,
    [attachment_id]
  );
  return rows[0];
};

export const deletePackageAttachment = async (attachment_id) => {
  const [result] = await pool.query(
    `DELETE FROM package_attachments WHERE attachment_id = ?`,
    [attachment_id]
  );
  return result.affectedRows;
};

export const deleteAllPackageAttachments = async (package_id) => {
  const [result] = await pool.query(
    `DELETE FROM package_attachments WHERE package_id = ?`,
    [package_id]
  );
  return result.affectedRows;
};

/* =======================
   PACKAGE DEFAULT AVAILABILITY MANAGEMENT
======================= */
export const getDefaultSlots = async (package_id) => {
  const [rows] = await pool.query(
    `SELECT total_slots FROM package_default_availability WHERE package_id = ?`,
    [package_id]
  );
  return rows[0] ? rows[0].total_slots : null;
};

export const updateDefaultSlots = async (package_id, total_slots) => {
  const [result] = await pool.query(
    `UPDATE package_default_availability SET total_slots = ? WHERE package_id = ?`,
    [total_slots, package_id]
  );

  // If no rows affected, the record doesn't exist, so create it
  if (result.affectedRows === 0) {
    await pool.query(
      `INSERT INTO package_default_availability (package_id, total_slots) VALUES (?, ?)`,
      [package_id, total_slots]
    );
  }

  return result.affectedRows || 1;
};

/* =======================
   DATE-SPECIFIC AVAILABILITY MANAGEMENT
======================= */
export const setDateSpecificSlots = async (package_id, date, total_slots) => {
  const [result] = await pool.query(
    `INSERT INTO package_availability_by_date (package_id, available_date, total_slots, booked_slots) 
     VALUES (?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE total_slots = ?`,
    [package_id, date, total_slots, total_slots]
  );
  return result.insertId || result.affectedRows;
};

export const updateDateSpecificSlots = async (
  package_id,
  date,
  total_slots
) => {
  const [result] = await pool.query(
    `UPDATE package_availability_by_date 
     SET total_slots = ? 
     WHERE package_id = ? AND available_date = ?`,
    [total_slots, package_id, date]
  );
  return result.affectedRows;
};

export const getDateSpecificSlots = async (package_id, date) => {
  const [rows] = await pool.query(
    `SELECT total_slots, booked_slots 
     FROM package_availability_by_date 
     WHERE package_id = ? AND available_date = ?`,
    [package_id, date]
  );
  return rows[0];
};

/* =======================
   PACKAGE UNAVAILABLE DATES
======================= */
export const addUnavailableDate = async (
  package_id,
  unavailable_date,
  reason = null
) => {
  const [result] = await pool.query(
    `INSERT INTO package_unavailable_dates (package_id, unavailable_date, reason) VALUES (?, ?, ?)`,
    [package_id, unavailable_date, reason]
  );
  return result.insertId;
};

export const getUnavailableDates = async (package_id) => {
  const [rows] = await pool.query(
    `SELECT unavailable_id, unavailable_date, reason 
     FROM package_unavailable_dates 
     WHERE package_id = ? 
     ORDER BY unavailable_date`,
    [package_id]
  );
  return rows;
};

export const deleteUnavailableDate = async (unavailable_id) => {
  const [result] = await pool.query(
    `DELETE FROM package_unavailable_dates WHERE unavailable_id = ?`,
    [unavailable_id]
  );
  return result.affectedRows;
};

/* =======================
   NEW: PREPARATION DAYS HELPER FUNCTIONS
======================= */

// Helper function to get preparation days for a package
// Helper function to get preparation days for a package
export const getPackagePreparationDays = async (package_id) => {
  const [rows] = await pool.query(
    `SELECT preparation_days FROM package_services WHERE package_id = ?`,
    [package_id]
  );
  return rows[0] ? rows[0].preparation_days : 0;
};

// UPDATED: Check if a date falls within preparation period of any confirmed booking
export const isDateInPreparationPeriod = async (package_id, date) => {
  try {
    // Get preparation days for this package
    const preparationDays = await getPackagePreparationDays(package_id);
    
    if (preparationDays === 0) {
      return false; // No preparation period needed
    }

    // Check if the date falls within preparation days of any confirmed booking
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM bookings b
      WHERE b.package_id = ? 
        AND b.status = 'confirmed'
        AND ? > DATE(b.wedding_date)
        AND ? <= DATE_ADD(DATE(b.wedding_date), INTERVAL ? DAY)
    `, [package_id, date, date, preparationDays]);

    return rows[0].count > 0;
  } catch (error) {
    console.error('Error checking preparation period:', error);
    return false;
  }
};

// UPDATED: Comprehensive availability check for a specific date
export const checkDateAvailability = async (packageId, date) => {
  try {
    console.log("🔍 Checking package availability for:", packageId, "on", date);

    // 1. Check if date is manually blacklisted
    const [blackoutCheck] = await pool.query(
      `SELECT COUNT(*) as is_blocked, reason
       FROM package_unavailable_dates 
       WHERE package_id = ? AND unavailable_date = ?`,
      [packageId, date]
    );

    if (blackoutCheck[0].is_blocked > 0) {
      console.log("❌ Date is manually blacklisted:", blackoutCheck[0].reason);
      return {
        available: false,
        reason: blackoutCheck[0].reason || "This date is not available",
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        isBlocked: true,
        isPreparationPeriod: false,
      };
    }

    // 2. Check for preparation period (application level)
    const inPreparationPeriod = await isDateInPreparationPeriod(packageId, date);
    if (inPreparationPeriod) {
      console.log("❌ Date is in preparation period");
      return {
        available: false,
        reason: "This date falls within the preparation period of another booking",
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        isBlocked: true,
        isPreparationPeriod: true,
      };
    }

    // 3. Get slot information for this date
    const [availabilityCheck] = await pool.query(
      `SELECT 
         COALESCE(pabd.total_slots, pda.total_slots) as total_slots,
         COALESCE(pabd.booked_slots, 0) as booked_slots
       FROM package_services ps
       LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
       LEFT JOIN package_availability_by_date pabd ON ps.package_id = pabd.package_id 
         AND pabd.available_date = ?
       WHERE ps.package_id = ? AND ps.is_active = TRUE`,
      [date, packageId]
    );

    if (availabilityCheck.length === 0) {
      console.log("❌ Package not found or inactive");
      return {
        available: false,
        reason: "Package not found or inactive",
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        isBlocked: false,
        isPreparationPeriod: false,
      };
    }

    const { total_slots, booked_slots } = availabilityCheck[0];
    const availableSlots = total_slots - booked_slots;

    console.log("📊 Availability check result:", {
      total_slots,
      booked_slots,
      availableSlots,
      available: availableSlots > 0,
    });

    return {
      available: availableSlots > 0,
      reason: availableSlots > 0 ? null : "No available slots for this date",
      totalSlots: total_slots,
      bookedSlots: booked_slots,
      availableSlots: availableSlots,
      isBlocked: false,
      isPreparationPeriod: false,
    };
  } catch (error) {
    console.error("Error checking date availability:", error);
    return {
      available: false,
      reason: "Error checking availability",
      totalSlots: 0,
      bookedSlots: 0,
      availableSlots: 0,
      isBlocked: false,
      isPreparationPeriod: false,
    };
  }
};

// UPDATED: Get slot availability for a specific date
export const getPackageAvailabilityByDate = async (packageId, date) => {
  try {
    // 1. Check if date is manually blacklisted
    const [blackoutCheck] = await pool.query(
      `SELECT reason FROM package_unavailable_dates 
       WHERE package_id = ? AND unavailable_date = ?`,
      [packageId, date]
    );

    if (blackoutCheck.length > 0) {
      return {
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        available: false,
        isBlocked: true,
        isPreparationPeriod: false,
        reason: blackoutCheck[0].reason || "Date not available",
      };
    }

    // 2. Check for preparation period (application level)
    const inPreparationPeriod = await isDateInPreparationPeriod(packageId, date);
    if (inPreparationPeriod) {
      return {
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        available: false,
        isBlocked: true,
        isPreparationPeriod: true,
        reason: "Date falls within preparation period of another booking",
      };
    }

    // 3. Get slot information using the schema
    const [availability] = await pool.query(
      `SELECT 
         COALESCE(pabd.total_slots, pda.total_slots) as total_slots,
         COALESCE(pabd.booked_slots, 0) as booked_slots
       FROM package_services ps
       LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
       LEFT JOIN package_availability_by_date pabd ON ps.package_id = pabd.package_id 
         AND pabd.available_date = ?
       WHERE ps.package_id = ?`,
      [date, packageId]
    );

    if (!availability[0]) {
      return {
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        available: false,
        isBlocked: false,
        isPreparationPeriod: false,
        reason: "Package not found",
      };
    }

    const { total_slots, booked_slots } = availability[0];
    const availableSlots = total_slots - booked_slots;

    return {
      totalSlots: total_slots,
      bookedSlots: booked_slots,
      availableSlots: availableSlots,
      available: availableSlots > 0,
      isBlocked: false,
      isPreparationPeriod: false,
      reason: availableSlots > 0 ? null : "No slots available",
    };
  } catch (error) {
    console.error("Error getting package availability by date:", error);
    throw error;
  }
};

// UPDATED: Get availability for a range of dates with preparation days calculated dynamically
export const getPackageAvailabilityRange = async (
  packageId,
  startDate,
  endDate
) => {
  try {
    // Get default slots for the package
    const defaultSlots = await getDefaultSlots(packageId);
    if (!defaultSlots) {
      return {};
    }

    // Get preparation days for this package
    const preparationDays = await getPackagePreparationDays(packageId);

    // Get manually unavailable dates in the range
    const [unavailableDates] = await pool.query(
      `SELECT DATE_FORMAT(unavailable_date, '%Y-%m-%d') as unavailable_date, reason 
       FROM package_unavailable_dates 
       WHERE package_id = ? AND unavailable_date BETWEEN ? AND ?`,
      [packageId, startDate, endDate]
    );

    // Get date-specific availability and bookings in the range
    const [dateSpecificData] = await pool.query(
      `SELECT 
         DATE_FORMAT(pabd.available_date, '%Y-%m-%d') as available_date,
         pabd.total_slots,
         pabd.booked_slots
       FROM package_availability_by_date pabd
       WHERE pabd.package_id = ? AND pabd.available_date BETWEEN ? AND ?`,
      [packageId, startDate, endDate]
    );

    // Get confirmed bookings to calculate preparation periods dynamically
    const [confirmedBookings] = await pool.query(
      `SELECT DATE_FORMAT(DATE(wedding_date), '%Y-%m-%d') as wedding_date
       FROM bookings 
       WHERE package_id = ? AND status = 'confirmed'`,
      [packageId]
    );

    // Create availability map
    const availabilityMap = {};

    // Mark manually unavailable dates
    unavailableDates.forEach((item) => {
      const dateStr = item.unavailable_date;
      
      availabilityMap[dateStr] = {
        totalSlots: defaultSlots,
        bookedSlots: 0,
        availableSlots: 0,
        available: false,
        isBlocked: true,
        isPreparationPeriod: false,
        reason: item.reason || "Date not available",
      };
    });

    // Calculate preparation periods for confirmed bookings dynamically
    if (preparationDays > 0) {
      confirmedBookings.forEach((booking) => {
        const weddingDate = new Date(booking.wedding_date + "T00:00:00");
        
        for (let i = 1; i <= preparationDays; i++) {
          const prepDate = new Date(weddingDate);
          prepDate.setDate(prepDate.getDate() + i);
          
          const year = prepDate.getFullYear();
          const month = String(prepDate.getMonth() + 1).padStart(2, "0");
          const day = String(prepDate.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          
          // Only mark if within our date range and not already manually blocked
          if (dateStr >= startDate && dateStr <= endDate && !availabilityMap[dateStr]) {
            availabilityMap[dateStr] = {
              totalSlots: defaultSlots,
              bookedSlots: 0,
              availableSlots: 0,
              available: false,
              isBlocked: true,
              isPreparationPeriod: true,
              reason: "Preparation period for another booking",
            };
          }
        }
      });
    }

    // Add date-specific slot information (don't override blocked dates)
    dateSpecificData.forEach((item) => {
      const dateStr = item.available_date;
      if (!availabilityMap[dateStr]) {
        const availableSlots = item.total_slots - item.booked_slots;
        availabilityMap[dateStr] = {
          totalSlots: item.total_slots,
          bookedSlots: item.booked_slots,
          availableSlots: availableSlots,
          available: availableSlots > 0,
          isBlocked: false,
          isPreparationPeriod: false,
        };
      }
    });

    // Generate all dates in range with default availability
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (!availabilityMap[dateStr]) {
        availabilityMap[dateStr] = {
          totalSlots: defaultSlots,
          bookedSlots: 0,
          availableSlots: defaultSlots,
          available: true,
          isBlocked: false,
          isPreparationPeriod: false,
        };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availabilityMap;
  } catch (error) {
    console.error("Error getting package availability range:", error);
    throw error;
  }
};

// UPDATED: Get upcoming available dates excluding preparation periods
export const getUpcomingAvailableDates = async (packageId, daysAhead = 30, limit = 7) => {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + daysAhead);

    const startDateStr = today.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log('🔍 Fetching upcoming availability for package:', packageId);

    const availability = await getPackageAvailabilityRange(
      packageId,
      startDateStr,
      endDateStr
    );

    // Filter for available dates (not blocked, not preparation period, not past)
    const availableDates = Object.entries(availability)
      .filter(([date, avail]) => {
        const dateObj = new Date(date + "T00:00:00");
        return (
          dateObj > today && 
          avail.available && 
          avail.availableSlots > 0 &&
          !avail.isBlocked &&
          !avail.isPreparationPeriod
        );
      })
      .slice(0, limit)
      .map(([date, avail]) => ({
        date,
        availability: avail
      }));

    console.log('📅 Found upcoming dates:', availableDates.length);
    
    return availableDates;
  } catch (error) {
    console.error("Error fetching upcoming available dates:", error);
    return [];
  }
};

/* =======================
   SEARCH AND FILTER HELPERS
======================= */
export const searchPackages = async (
  searchQuery,
  categoryIds = [],
  plannerIds = [],
  sortBy = "created_at",
  sortOrder = "DESC"
) => {
  let query = `
    SELECT ps.*, c.name AS category_name, c.description AS category_description,
           u.first_name, u.last_name, u.phone, u.profile_picture, u.bio, u.location,
           p.business_name, p.experience_years, p.status as planner_status,
           pda.total_slots as default_slots,
           COUNT(DISTINCT b.booking_id) as booking_count,
           AVG(f.rating) as avg_rating
    FROM package_services ps
    JOIN categories c ON ps.category_id = c.category_id
    JOIN planners p ON ps.planner_id = p.planner_id
    JOIN users u ON p.planner_id = u.user_id
    LEFT JOIN package_default_availability pda ON ps.package_id = pda.package_id
    LEFT JOIN bookings b ON ps.package_id = b.package_id
    LEFT JOIN feedback f ON b.booking_id = f.booking_id
    WHERE ps.is_active = TRUE AND p.status = 'approved'
  `;

  const params = [];

  // Add search filter
  if (searchQuery) {
    query += ` AND (ps.title LIKE ? OR ps.description LIKE ? OR ps.detailed_description LIKE ? OR c.name LIKE ? OR p.business_name LIKE ?)`;
    const searchTerm = `%${searchQuery}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Add category filter
  if (categoryIds.length > 0) {
    query += ` AND ps.category_id IN (${categoryIds.map(() => "?").join(",")})`;
    params.push(...categoryIds);
  }

  // Add planner filter
  if (plannerIds.length > 0) {
    query += ` AND ps.planner_id IN (${plannerIds.map(() => "?").join(",")})`;
    params.push(...plannerIds);
  }

  query += ` GROUP BY ps.package_id`;

  // Add sorting
  switch (sortBy) {
    case "price_low":
      query += ` ORDER BY ps.price ASC`;
      break;
    case "price_high":
      query += ` ORDER BY ps.price DESC`;
      break;
    case "rating":
      query += ` ORDER BY ps.rating DESC, booking_count DESC`;
      break;
    case "popular":
      query += ` ORDER BY booking_count DESC, ps.rating DESC`;
      break;
    default:
      query += ` ORDER BY ps.created_at ${sortOrder}`;
  }

  const [rows] = await pool.query(query, params);
  return rows;
};