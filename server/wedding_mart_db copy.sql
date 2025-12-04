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
    FOREIGN KEY (planner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- PERMITS (Current permit state per planner)
-- ==============================
CREATE TABLE permits (
    permit_id INT AUTO_INCREMENT PRIMARY KEY,
    planner_id INT NOT NULL,
    current_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (planner_id) REFERENCES planners(planner_id) ON DELETE CASCADE
);

-- ==============================
-- PERMIT HISTORY
-- ==============================
CREATE TABLE permit_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    permit_id INT NOT NULL,
    submitted_by INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    reason TEXT,
    FOREIGN KEY (permit_id) REFERENCES permits(permit_id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ==============================
-- PERMIT ATTACHMENTS
-- ==============================
CREATE TABLE permit_attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    history_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (history_id) REFERENCES permit_history(history_id) ON DELETE CASCADE,
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
    preparation_days INT DEFAULT 0,
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
CREATE TABLE feedback_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id INT NOT NULL,
    planner_id INT NULL,  -- ADD THIS: planner who made the change
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    reply TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE,
    FOREIGN KEY (planner_id) REFERENCES planners(planner_id) ON DELETE SET NULL  -- ADD THIS
);

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
-- 2. Booking Insert with Date-Specific Slot Management (REMOVE HISTORY)
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

    -- Check if date is blocked
    SELECT COUNT(*) INTO v_blocked
    FROM package_unavailable_dates
    WHERE package_id = NEW.package_id
      AND unavailable_date = v_booking_date;

    IF v_blocked > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'This package is not available on the selected date';
    END IF;

    -- ONLY handle slot management if status is confirmed
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
    END IF;
END$$

-- =================================================================
-- 3. Booking Update with Date-Specific Slot Management (REMOVE HISTORY)
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

    -- ALWAYS check if date is blocked when not cancelled
    IF NEW.status != 'cancelled' AND (OLD.status != NEW.status OR OLD.wedding_date != NEW.wedding_date) THEN
        SELECT COUNT(*) INTO v_blocked
        FROM package_unavailable_dates
        WHERE package_id = NEW.package_id
          AND unavailable_date = v_booking_date;

        IF v_blocked > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'This package is not available on the selected date';
        END IF;
    END IF;

    -- Handle slot management for status changes AND date changes
    IF OLD.status != NEW.status OR OLD.wedding_date != NEW.wedding_date THEN
        -- Case 1: OLD booking was confirmed - free up the old slot
        IF OLD.status = 'confirmed' THEN
            UPDATE package_availability_by_date
            SET booked_slots = booked_slots - 1
            WHERE package_id = OLD.package_id AND available_date = v_old_booking_date;
        END IF;

        -- Case 2: NEW booking is confirmed - reserve a new slot
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
        END IF;
    END IF;
END$$

-- =================================================================
-- 4. Booking Deletion with Date-Specific Slot Management (REMOVE HISTORY)
-- =================================================================
CREATE TRIGGER trg_booking_date_specific_deleted
AFTER DELETE ON bookings
FOR EACH ROW
BEGIN
    DECLARE v_booking_date DATE;
    SET v_booking_date = DATE(OLD.wedding_date);

    -- If the deleted booking was confirmed, free up the slot for that date
    IF OLD.status = 'confirmed' THEN
        UPDATE package_availability_by_date
        SET booked_slots = booked_slots - 1
        WHERE package_id = OLD.package_id AND available_date = v_booking_date;
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
-- 7. Handle Permit Status Changes (KEEP)
-- =================================================================
CREATE TRIGGER trg_permit_status_history
AFTER UPDATE ON permits
FOR EACH ROW
BEGIN
    -- Insert into permit_history for every status change
    IF OLD.current_status != NEW.current_status THEN
        INSERT INTO permit_history (
            permit_id, 
            submitted_by, 
            reviewed_by, 
            reviewed_at, 
            status, 
            reason,
            submitted_at
        )
        VALUES (
            NEW.permit_id,
            NEW.planner_id,  -- submitted_by (using planner_id as the submitter)
            NULL,            -- reviewed_by (can be updated later)
            NOW(),           -- reviewed_at (current time)
            NEW.current_status,
            CONCAT('Status changed from ', OLD.current_status, ' to ', NEW.current_status),
            NOW()            -- submitted_at
        );
    END IF;
END$$

-- =================================================================
-- 8. Feedback History Triggers (REMOVE IF NOT NEEDED)
-- =================================================================
-- Remove these if you don't need feedback history either
CREATE TRIGGER trg_feedback_history_insert
AFTER INSERT ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO feedback_history (feedback_id, planner_id, rating, comment, reply, is_read, changed_at)
    VALUES (NEW.feedback_id, NEW.planner_id, NEW.rating, NEW.comment, NEW.reply, FALSE, NOW());
END$$

CREATE TRIGGER trg_feedback_history_update
AFTER UPDATE ON feedback
FOR EACH ROW
BEGIN
    -- Check if rating, comment, reply, OR planner_id changed
    IF OLD.rating != NEW.rating 
       OR OLD.comment != NEW.comment 
       OR OLD.reply != NEW.reply
       OR OLD.planner_id != NEW.planner_id THEN
        
        INSERT INTO feedback_history (feedback_id, planner_id, rating, comment, reply, is_read, changed_at)
        VALUES (NEW.feedback_id, NEW.planner_id, NEW.rating, NEW.comment, NEW.reply, FALSE, NOW());
    END IF;
END$$
-- =================================================================
-- 9. Update Payment Status when Booking is Confirmed
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