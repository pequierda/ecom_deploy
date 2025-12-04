import mysql from 'mysql2/promise';

const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wedding_mart_db',
    timezone: process.env.DB_TIMEZONE || '+08:00',
    waitForConnections: true,
    connectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
    queueLimit: 0,
    charset: process.env.DB_CHARSET || 'utf8mb4',
    connectTimeout: toNumber(process.env.DB_CONNECT_TIMEOUT, 60000),
    acquireTimeout: toNumber(process.env.DB_ACQUIRE_TIMEOUT, 60000),
    timeout: toNumber(process.env.DB_TIMEOUT, 60000)
});

export default pool;