// ============================================
// server.js — Main Express Server
// ============================================
// This is the entry point of our application.
// It sets up middleware, serves static files,
// and defines API routes for register/login.
// ============================================

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import database connection from db.js
const db = require("./db");

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
// Middleware = functions that run BEFORE our routes
// They process the incoming request first.

// 1. CORS — allows cross-origin requests
app.use(cors());

// 2. Parse JSON data from request body
//    When frontend sends JSON via fetch(), this reads it
app.use(express.json());

// 3. Parse form data (URL-encoded)
//    When HTML forms submit data, this reads it
app.use(express.urlencoded({ extended: true }));

// 4. Session — remembers logged-in users
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// 5. Serve static files from 'public' folder
//    This makes HTML, CSS, JS files accessible in browser
app.use(express.static("public"));

// ============================================
// API ROUTES
// ============================================

// ------------------------------------------
// POST /api/register — Register a new user
// ------------------------------------------
app.post("/api/register", async (req, res) => {
  try {
    // 1. Get data from request body
    const { name, email, password, department, gender, phone } = req.body;

    // 2. Backend validation — check all fields exist
    if (!name || !email || !password || !department || !gender || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // 3. Check if email already exists in database
    //    Using parameterized query (?) to prevent SQL injection
    const checkSql = "SELECT id FROM users WHERE email = ?";

    db.query(checkSql, [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Server error. Please try again.",
        });
      }

      // If email already exists
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already registered.",
        });
      }

      // 4. Hash the password using bcrypt
      //    saltRounds = 10 means bcrypt will hash it 2^10 times
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 5. Insert new user into MySQL
      //    Using ? placeholders — NEVER concatenate user input!
      const insertSql =
        "INSERT INTO users (name, email, password, department, gender, phone) VALUES (?, ?, ?, ?, ?, ?)";

      db.query(
        insertSql,
        [name, email, hashedPassword, department, gender, phone],
        (err, result) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({
              success: false,
              message: "Registration failed. Please try again.",
            });
          }

          // 6. Success!
          console.log("✅ New user registered:", email);
          return res.status(201).json({
            success: true,
            message: "Registration successful! You can now login.",
          });
        }
      );
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// ------------------------------------------
// POST /api/login — Login user
// ------------------------------------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Find user in database by email
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error("Database error during login:", err);
        return res.status(500).json({
          success: false,
          message: "Server error. Please try again.",
        });
      }

      // If email does not exist
      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const user = results[0];

      // Compare supplied password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      // Store user info in session (exclude password hash)
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        gender: user.gender,
        phone: user.phone,
        created_at: user.created_at,
      };

      console.log("✅ User logged in:", user.email);
      return res.status(200).json({
        success: true,
        message: "Login successful!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department,
        },
      });
    });
  } catch (error) {
    console.error("Login server error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// ------------------------------------------
// GET /api/user — Get logged-in user info
// ------------------------------------------
app.get("/api/user", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated. Please log in.",
    });
  }

  return res.status(200).json({
    success: true,
    user: req.session.user,
  });
});

// ------------------------------------------
// POST /api/logout — Logout user
// ------------------------------------------
app.post("/api/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        success: false,
        message: "Could not log out. Please try again.",
      });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log("===========================================");
  console.log("  CS Department Portal Server Started!");
  console.log("===========================================");
  console.log(`  🌐 URL:  http://localhost:${PORT}`);
  console.log(`  📁 Serving files from: ./public`);
  console.log("===========================================");
  console.log("  Press Ctrl+C to stop the server");
  console.log("===========================================");
});
