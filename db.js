// ============================================
// db.js — MySQL Database Connection
// ============================================
// This file creates a reusable connection pool
// to the MySQL database using mysql2 package.
// ============================================

const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool
// A pool manages multiple connections efficiently
// instead of opening/closing a new connection every time
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("   Make sure XAMPP MySQL is running!");
    return;
  }
  console.log("✅ Connected to MySQL database: " + process.env.DB_NAME);
  connection.release(); // Release the connection back to the pool
});

// Export the pool so server.js can use it
module.exports = pool;
