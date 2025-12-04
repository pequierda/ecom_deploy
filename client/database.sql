
    -- Users table (includes client, planner, admin roles)
    CREATE TABLE users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role ENUM('client', 'planner', 'admin') NOT NULL,
        profile_image VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Permit submission by planners
    CREATE TABLE planner_permits (
        permit_id INT AUTO_INCREMENT PRIMARY KEY,
        planner_id INT NOT NULL,
        permit_file VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        FOREIGN KEY (planner_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- Packages/services offered by planners
    CREATE TABLE packages (
        package_id INT AUTO_INCREMENT PRIMARY KEY,
        planner_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (planner_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- Client bookings
    CREATE TABLE bookings (
        booking_id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        package_id INT NOT NULL,
        booking_date DATE NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE
    );

    -- Payment records for bookings
    CREATE TABLE payments (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        client_id INT NOT NULL,
        payment_proof VARCHAR(255), -- path to uploaded receipt
        amount DECIMAL(10,2),
        method ENUM('GCash', 'PayMaya', 'PayPal', 'BankTransfer') DEFAULT 'GCash',
        status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- Client feedback on services
    CREATE TABLE reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        client_id INT NOT NULL,
        planner_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 10),
        comment TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (planner_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- Optional: products for sale (gowns, decorations, etc.)
    CREATE TABLE products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        planner_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        price DECIMAL(10,2) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (planner_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    status ENUM('pending', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

