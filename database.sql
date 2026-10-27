-- ============================================
-- database.sql — Database Schema Setup
-- Project: Department Website (IWT Lab)
-- ============================================

-- 1. Create database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS department_db;
USE department_db;

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Sample query to verify table structure:
-- DESCRIBE users;
-- ============================================
