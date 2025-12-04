import mysql from 'mysql2/promise';

// Create MySQL connection pool with Philippine timezone
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'wedding_mart_db',
    timezone: '+08:00', // Add this line for Philippine timezone (UTC+8)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4', // Also good to include for proper character support
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
});

export default pool;