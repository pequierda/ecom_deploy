-- ==============================
-- USERS (All Accounts: Admin, Planner, Client)
-- ==============================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role ENUM('admin', 'planner', 'client') NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,                       
    location VARCHAR(255),           
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- CLIENTS
-- ==============================
CREATE TABLE clients (
    client_id INT PRIMARY KEY,
    wedding_date DATE,
    wedding_location VARCHAR(255),
    FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- PLANNERS
-- ==============================
CREATE TABLE planners (
    planner_id INT PRIMARY KEY,
    business_name VARCHAR(150),
    business_address VARCHAR(255),
    business_email VARCHAR(150),
    business_phone VARCHAR(30),
    experience_years INT DEFAULT 0,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verification_notes TEXT NULL,
    rejection_reason TEXT NULL,
    permit_number VARCHAR(50) NULL,
    FOREIGN KEY (planner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- PERMIT 
-- ==============================
CREATE TABLE permits (
    permit_id INT AUTO_INCREMENT PRIMARY KEY,
    submitted_by INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    is_approved BOOLEAN DEFAULT NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ==============================
-- PERMIT ATTACHMENTS
-- ==============================
CREATE TABLE permit_attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    permit_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    gov_id_type VARCHAR(100),
    gov_id_number VARCHAR(100),
    permit_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permit_id) REFERENCES permits(permit_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- CATEGORIES
-- ==============================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- ==============================
-- PACKAGE SERVICES
-- ==============================
CREATE TABLE package_services (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    planner_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    preparation_days INT DEFAULT 1,
    detailed_description TEXT,
    price DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    category_id INT NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (planner_id) REFERENCES planners(planner_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- PACKAGE DEFAULT AVAILABILITY (Global settings)
-- ==============================
CREATE TABLE package_default_availability (
    package_id INT PRIMARY KEY,
    total_slots INT NOT NULL DEFAULT 1,
    FOREIGN KEY (package_id) REFERENCES package_services(package_id) ON DELETE CASCADE
);

-- ==============================
-- PACKAGE AVAILABILITY BY DATE (Slots per specific date)
-- ==============================
CREATE TABLE package_availability_by_date (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    available_date DATE NOT NULL,
    total_slots INT NOT NULL DEFAULT 1,
    booked_slots INT NOT NULL DEFAULT 0,
    FOREIGN KEY (package_id) REFERENCES package_services(package_id) ON DELETE CASCADE,
    UNIQUE (package_id, available_date)
);

-- ==============================
-- PACKAGE UNAVAILABLE DATES (Blackout dates per package)
-- ==============================
CREATE TABLE package_unavailable_dates (
    unavailable_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    unavailable_date DATE NOT NULL,
    block_type ENUM('blackout', 'preparation') DEFAULT 'blackout',
    reason VARCHAR(255),
    FOREIGN KEY (package_id) REFERENCES package_services(package_id) ON DELETE CASCADE,
    UNIQUE (package_id, unavailable_date)
);

-- ==============================
-- INCLUSIONS
-- ==============================
CREATE TABLE inclusions (
    inclusion_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    inclusion_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (package_id) REFERENCES package_services(package_id) ON DELETE CASCADE
);

-- ==============================
-- PACKAGE ATTACHMENTS
-- ==============================
CREATE TABLE package_attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    is_thumbnail BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES package_services(package_id) ON DELETE CASCADE
);

-- ==============================
-- BOOKINGS
-- ==============================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    package_id INT NOT NULL,
    wedding_date DATE NOT NULL,
    wedding_time TIME NOT NULL,
    wedding_location VARCHAR(255) NOT NULL,
    status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
    notes TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES package_services(package_id) ON DELETE CASCADE
);


-- ==============================
-- PAYMENTS
-- ==============================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    receipt_url VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','verified','rejected') DEFAULT 'pending',
    verified_by INT,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ==============================
-- FEEDBACK
-- ==============================
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    client_id INT NOT NULL,
    planner_id INT NULL,  -- ADD THIS: planner who replied
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    reply TEXT,
    wedding_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (planner_id) REFERENCES planners(planner_id) ON DELETE SET NULL  -- ADD THIS
);

-- ==============================
-- FEEDBACK HISTORY
-- ==============================
-- CREATE TABLE feedback_history (
--     permit_id INT AUTO_INCREMENT PRIMARY KEY,
--     feedback_id INT NOT NULL,
--     planner_id INT NULL,  -- ADD THIS: planner who made the change
--     rating INT CHECK (rating BETWEEN 1 AND 5),
--     comment TEXT,
--     reply TEXT,
--     is_read BOOLEAN DEFAULT FALSE,
--     changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE,
--     FOREIGN KEY (planner_id) REFERENCES planners(planner_id) ON DELETE SET NULL  -- ADD THIS
-- );

-- ==============================
-- ANALYTICS SNAPSHOTS
-- ==============================
CREATE TABLE analytics_snapshots (
    snapshot_id INT AUTO_INCREMENT PRIMARY KEY,
    snapshot_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    total_users INT DEFAULT 0,
    total_clients INT DEFAULT 0,
    total_planners INT DEFAULT 0,
    planners_pending INT DEFAULT 0,
    planners_approved INT DEFAULT 0,
    planners_rejected INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    planner_clients_count INT DEFAULT 0,
    packages_created INT DEFAULT 0,
    packages_booked INT DEFAULT 0,
    bookings_pending INT DEFAULT 0,
    bookings_confirmed INT DEFAULT 0,
    bookings_completed INT DEFAULT 0,
    client_bookings_count INT DEFAULT 0,
    client_completed_count INT DEFAULT 0,
    client_cancelled_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$

-- =================================================================
-- NEW: Stored Procedures for Preparation Days Management (UPDATED)
-- =================================================================

-- Procedure to block preparation days
CREATE PROCEDURE sp_block_preparation_days(
    IN p_package_id INT,
    IN p_wedding_date DATE,
    IN p_preparation_days INT,
    IN p_booking_id INT
)
BEGIN
    DECLARE v_current_date DATE;
    DECLARE v_counter INT DEFAULT 1;
    
    WHILE v_counter <= p_preparation_days DO
        SET v_current_date = DATE_ADD(p_wedding_date, INTERVAL v_counter DAY);
        
        -- Insert preparation day block with block_type
        INSERT IGNORE INTO package_unavailable_dates (
            package_id, 
            unavailable_date, 
            reason,
            block_type
        ) VALUES (
            p_package_id,
            v_current_date,
            CONCAT('Preparation period for booking #', p_booking_id),
            'preparation'
        );
        
        SET v_counter = v_counter + 1;
    END WHILE;
END$$

-- Procedure to unblock preparation days
CREATE PROCEDURE sp_unblock_preparation_days(
    IN p_package_id INT,
    IN p_wedding_date DATE,
    IN p_preparation_days INT,
    IN p_booking_id INT
)
BEGIN
    DECLARE v_current_date DATE;
    DECLARE v_counter INT DEFAULT 1;
    
    WHILE v_counter <= p_preparation_days DO
        SET v_current_date = DATE_ADD(p_wedding_date, INTERVAL v_counter DAY);
        
        -- Remove preparation day block for this specific booking
        DELETE FROM package_unavailable_dates 
        WHERE package_id = p_package_id 
          AND unavailable_date = v_current_date
          AND reason = CONCAT('Preparation period for booking #', p_booking_id)
          AND block_type = 'preparation';
        
        SET v_counter = v_counter + 1;
    END WHILE;
END$$

-- =================================================================
-- 1. Auto-create default availability for new packages (KEEP)
-- =================================================================
CREATE TRIGGER trg_auto_create_default_availability
AFTER INSERT ON package_services
FOR EACH ROW
BEGIN
    INSERT INTO package_default_availability (package_id, total_slots)
    VALUES (NEW.package_id, 1)
    ON DUPLICATE KEY UPDATE package_id = NEW.package_id;
END$$

-- =================================================================
-- 2. UPDATED: Booking Insert with Date-Specific Slot Management + Preparation Days
-- =================================================================
CREATE TRIGGER trg_booking_date_specific_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_total_slots INT;
    DECLARE v_booked_slots INT;
    DECLARE v_blocked INT;
    DECLARE v_client_booking INT;
    DECLARE v_booking_date DATE;
    DECLARE v_preparation_days INT DEFAULT 0;

    SET v_booking_date = DATE(NEW.wedding_date);

    -- ALWAYS check for date conflicts (except cancelled)
    IF NEW.status != 'cancelled' THEN
        SELECT COUNT(*) INTO v_client_booking
        FROM bookings
        WHERE client_id = NEW.client_id
          AND DATE(wedding_date) = v_booking_date
          AND status != 'cancelled'
          AND status != 'deleted';

        IF v_client_booking > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Client already has a booking on this date';
        END IF;
    END IF;

    -- UPDATED: Check if date is blocked (only blackout dates, exclude preparation days)
    SELECT COUNT(*) INTO v_blocked
    FROM package_unavailable_dates
    WHERE package_id = NEW.package_id
      AND unavailable_date = v_booking_date
      AND block_type = 'blackout';

    IF v_blocked > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'This package is not available on the selected date';
    END IF;

    -- ONLY handle slot management and preparation days if status is confirmed
    IF NEW.status = 'confirmed' THEN
        -- Get or create date-specific availability
        SELECT total_slots, booked_slots
        INTO v_total_slots, v_booked_slots
        FROM package_availability_by_date
        WHERE package_id = NEW.package_id AND available_date = v_booking_date;

        -- If no record exists, create one using default slots
        IF v_total_slots IS NULL THEN
            SELECT total_slots INTO v_total_slots
            FROM package_default_availability
            WHERE package_id = NEW.package_id;
            
            INSERT INTO package_availability_by_date (package_id, available_date, total_slots, booked_slots)
            VALUES (NEW.package_id, v_booking_date, v_total_slots, 0);
            
            SET v_booked_slots = 0;
        END IF;

        -- Check availability
        IF v_booked_slots >= v_total_slots THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'No available slots for this package on the selected date';
        ELSE
            UPDATE package_availability_by_date
            SET booked_slots = booked_slots + 1
            WHERE package_id = NEW.package_id AND available_date = v_booking_date;
        END IF;

        -- Get preparation days for this package and block them
        SELECT preparation_days INTO v_preparation_days
        FROM package_services
        WHERE package_id = NEW.package_id;

        -- Block preparation days after the wedding date
        IF v_preparation_days > 0 THEN
            CALL sp_block_preparation_days(NEW.package_id, v_booking_date, v_preparation_days, NEW.booking_id);
        END IF;
    END IF;
END$$

-- =================================================================
-- 3. UPDATED: Booking Update with Date-Specific Slot Management + Preparation Days
-- =================================================================
CREATE TRIGGER trg_booking_date_specific_update
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_total_slots INT;
    DECLARE v_booked_slots INT;
    DECLARE v_blocked INT;
    DECLARE v_client_booking INT;
    DECLARE v_booking_date DATE;
    DECLARE v_old_booking_date DATE;
    DECLARE v_preparation_days INT DEFAULT 0;

    SET v_booking_date = DATE(NEW.wedding_date);
    SET v_old_booking_date = DATE(OLD.wedding_date);

    -- ALWAYS check for date conflicts when changing to non-cancelled status
    IF NEW.status != 'cancelled' AND (OLD.status != NEW.status OR OLD.wedding_date != NEW.wedding_date) THEN
        SELECT COUNT(*) INTO v_client_booking
        FROM bookings
        WHERE client_id = NEW.client_id
          AND DATE(wedding_date) = v_booking_date
          AND status != 'cancelled'
          AND status != 'deleted'
          AND booking_id != OLD.booking_id;

        IF v_client_booking > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Client already has a booking on this date';
        END IF;
    END IF;

    -- UPDATED: Check if date is blocked when not cancelled (only blackout dates)
    IF NEW.status != 'cancelled' AND (OLD.status != NEW.status OR OLD.wedding_date != NEW.wedding_date) THEN
        SELECT COUNT(*) INTO v_blocked
        FROM package_unavailable_dates
        WHERE package_id = NEW.package_id
          AND unavailable_date = v_booking_date
          AND block_type = 'blackout';

        IF v_blocked > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'This package is not available on the selected date';
        END IF;
    END IF;

    -- Get preparation days for this package
    SELECT preparation_days INTO v_preparation_days
    FROM package_services
    WHERE package_id = NEW.package_id;

    -- Handle slot management and preparation days for status changes AND date changes
    IF OLD.status != NEW.status OR OLD.wedding_date != NEW.wedding_date THEN
        -- Case 1: OLD booking was confirmed - free up the old slot and remove preparation days
        IF OLD.status = 'confirmed' THEN
            UPDATE package_availability_by_date
            SET booked_slots = booked_slots - 1
            WHERE package_id = OLD.package_id AND available_date = v_old_booking_date;
            
            -- Remove old preparation days blocking
            IF v_preparation_days > 0 THEN
                CALL sp_unblock_preparation_days(OLD.package_id, v_old_booking_date, v_preparation_days, OLD.booking_id);
            END IF;
        END IF;

        -- Case 2: NEW booking is confirmed - reserve a new slot and block preparation days
        IF NEW.status = 'confirmed' THEN
            -- Get or create date-specific availability for the NEW date
            SELECT total_slots, booked_slots
            INTO v_total_slots, v_booked_slots
            FROM package_availability_by_date
            WHERE package_id = NEW.package_id AND available_date = v_booking_date;

            IF v_total_slots IS NULL THEN
                -- Create new date-specific record using default slots
                SELECT total_slots INTO v_total_slots
                FROM package_default_availability
                WHERE package_id = NEW.package_id;
                
                INSERT INTO package_availability_by_date (package_id, available_date, total_slots, booked_slots)
                VALUES (NEW.package_id, v_booking_date, v_total_slots, 1);
            ELSE
                -- Check availability for existing date record
                IF v_booked_slots >= v_total_slots THEN
                    SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'No available slots for this package on the selected date';
                ELSE
                    UPDATE package_availability_by_date
                    SET booked_slots = booked_slots + 1
                    WHERE package_id = NEW.package_id AND available_date = v_booking_date;
                END IF;
            END IF;

            -- Block new preparation days
            IF v_preparation_days > 0 THEN
                CALL sp_block_preparation_days(NEW.package_id, v_booking_date, v_preparation_days, NEW.booking_id);
            END IF;
        END IF;
    END IF;
END$$

-- =================================================================
-- 4. UPDATED: Booking Deletion with Date-Specific Slot Management + Preparation Days
-- =================================================================
CREATE TRIGGER trg_booking_date_specific_deleted
AFTER DELETE ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_booking_date DATE;
    DECLARE v_preparation_days INT DEFAULT 0;
    
    SET v_booking_date = DATE(OLD.wedding_date);

    -- Get preparation days for this package
    SELECT preparation_days INTO v_preparation_days
    FROM package_services
    WHERE package_id = OLD.package_id;

    -- If the deleted booking was confirmed, free up the slot for that date
    IF OLD.status = 'confirmed' THEN
        UPDATE package_availability_by_date
        SET booked_slots = booked_slots - 1
        WHERE package_id = OLD.package_id AND available_date = v_booking_date;
        
        -- Remove preparation days blocking
        IF v_preparation_days > 0 THEN
            CALL sp_unblock_preparation_days(OLD.package_id, v_booking_date, v_preparation_days, OLD.booking_id);
        END IF;
    END IF;
END$$

-- =================================================================
-- 5. Prevent Invalid Slot Values (KEEP)
-- =================================================================
CREATE TRIGGER trg_prevent_invalid_date_slots
BEFORE UPDATE ON package_availability_by_date
FOR EACH ROW
BEGIN
    -- Prevent negative booked_slots
    IF NEW.booked_slots < 0 THEN
        SET NEW.booked_slots = 0;
    END IF;
    
    -- Prevent booked_slots exceeding total_slots
    IF NEW.booked_slots > NEW.total_slots THEN
        SET NEW.booked_slots = NEW.total_slots;
    END IF;
    
    -- Ensure total_slots is at least 1
    IF NEW.total_slots < 1 THEN
        SET NEW.total_slots = 1;
    END IF;
END$$

-- =================================================================
-- 6. Update Package Rating on New Feedback (KEEP)
-- =================================================================
CREATE TRIGGER trg_update_package_rating
AFTER INSERT ON feedback
FOR EACH ROW
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE total_reviews INT;
    
    -- Calculate new average rating and total reviews
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, total_reviews
    FROM feedback
    WHERE booking_id IN (
        SELECT booking_id FROM bookings WHERE package_id = (
            SELECT package_id FROM bookings WHERE booking_id = NEW.booking_id
        )
    );
    
    -- Update package services table
    UPDATE package_services
    SET rating = COALESCE(avg_rating, 0),
        review_count = total_reviews
    WHERE package_id = (
        SELECT package_id FROM bookings WHERE booking_id = NEW.booking_id
    );
END$$


-- =================================================================
-- 7. Update Permit and Planner Status + Auto Notes (Corrected)
-- =================================================================
CREATE PROCEDURE sp_sync_permit_and_planner(IN p_permit_id INT)
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_approved INT DEFAULT 0;
    DECLARE v_rejected INT DEFAULT 0;
    DECLARE v_pending INT DEFAULT 0;

    -- Count attachments for this permit
    SELECT COUNT(*),
           SUM(CASE WHEN permit_status = 'approved' THEN 1 ELSE 0 END),
           SUM(CASE WHEN permit_status = 'rejected' THEN 1 ELSE 0 END),
           SUM(CASE WHEN permit_status = 'pending' THEN 1 ELSE 0 END)
    INTO v_total, v_approved, v_rejected, v_pending
    FROM permit_attachments
    WHERE permit_id = p_permit_id;

    -- Update permit's is_approved
    UPDATE permits
    SET is_approved = (v_total > 0 AND v_total = v_approved)
    WHERE permit_id = p_permit_id;

    -- Sync planner status dynamically
    UPDATE planners
    SET status = CASE
                    WHEN v_total = v_approved AND v_total > 0 THEN 'approved'
                    WHEN v_total = v_rejected AND v_total > 0 THEN 'rejected'
                    WHEN v_total = v_pending AND v_total > 0 THEN 'pending'
                    ELSE 'pending'  -- mixed case: approved + rejected + pending
                 END
    WHERE planner_id = (SELECT planner_id FROM permits WHERE permit_id = p_permit_id);
END$$

-- =================================================================
-- BEFORE INSERT on permit_attachments (auto-fill notes if empty)
-- =================================================================
CREATE TRIGGER trg_permit_attachment_bi
BEFORE INSERT ON permit_attachments
FOR EACH ROW
BEGIN
    IF NEW.notes IS NULL OR TRIM(NEW.notes) = '' THEN
        SET NEW.notes = CASE NEW.permit_status
                           WHEN 'approved' THEN 'Attachment approved (system note)'
                           WHEN 'rejected' THEN 'Attachment rejected (system note)'
                           ELSE 'Pending review (system note)'
                        END;
    END IF;
END$$

-- =================================================================
-- BEFORE UPDATE on permit_attachments (dynamic notes, preserve manual notes)
-- =================================================================
CREATE TRIGGER trg_permit_attachment_bu
BEFORE UPDATE ON permit_attachments
FOR EACH ROW
BEGIN
    -- Only auto-update notes if empty or same as old system note
    IF NEW.notes IS NULL 
       OR TRIM(NEW.notes) = '' 
       OR NEW.notes = CASE OLD.permit_status
                        WHEN 'approved' THEN 'Attachment approved (system note)'
                        WHEN 'rejected' THEN 'Attachment rejected (system note)'
                        ELSE 'Pending review (system note)'
                      END
    THEN
        SET NEW.notes = CASE NEW.permit_status
                           WHEN 'approved' THEN 'Attachment approved (system note)'
                           WHEN 'rejected' THEN 'Attachment rejected (system note)'
                           ELSE 'Pending review (system note)'
                        END;
    END IF;
END$$

-- =================================================================
-- AFTER INSERT on permit_attachments (sync permit & planner)
-- =================================================================
CREATE TRIGGER trg_permit_attachment_ai
AFTER INSERT ON permit_attachments
FOR EACH ROW
BEGIN
    CALL sp_sync_permit_and_planner(NEW.permit_id);
END$$

-- =================================================================
-- AFTER UPDATE on permit_attachments (sync permit & planner)
-- =================================================================
CREATE TRIGGER trg_permit_attachment_au
AFTER UPDATE ON permit_attachments
FOR EACH ROW
BEGIN
    CALL sp_sync_permit_and_planner(NEW.permit_id);
END$$

-- =================================================================
-- AFTER DELETE on permit_attachments (sync permit & planner)
-- =================================================================
CREATE TRIGGER trg_permit_attachment_ad
AFTER DELETE ON permit_attachments
FOR EACH ROW
BEGIN
    CALL sp_sync_permit_and_planner(OLD.permit_id);
END$$

-- =================================================================
-- 9. Update Payment Status when Booking is Confirmed (KEEP)
-- =================================================================
CREATE TRIGGER trg_update_payment_on_booking_confirmed
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    -- Check if status changed to 'confirmed'
    IF OLD.status != NEW.status AND NEW.status = 'confirmed' THEN
        -- Update all payments associated with this booking to 'verified'
        UPDATE payments 
        SET status = 'verified',
            verified_at = NOW(),
            verified_by = (SELECT planner_id FROM package_services WHERE package_id = NEW.package_id)
        WHERE booking_id = NEW.booking_id
        AND status = 'pending';
    END IF;
    
    -- Optional: If booking is cancelled or set back to pending, revert payment status
    IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
        UPDATE payments 
        SET status = 'pending',
            verified_at = NULL,
            verified_by = NULL
        WHERE booking_id = NEW.booking_id
        AND status = 'verified';
    END IF;
END$$

DELIMITER ;


UPDATE package_unavailable_dates 
SET block_type = 'preparation' 
WHERE reason LIKE 'Preparation period for booking #%';

-- Set existing non-preparation records as blackout dates
UPDATE package_unavailable_dates 
SET block_type = 'blackout' 
WHERE block_type = 'blackout' OR reason NOT LIKE 'Preparation period for booking #%' OR reason IS NULL;