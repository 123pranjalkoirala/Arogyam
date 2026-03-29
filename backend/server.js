// ========================================
// AROGYAM BACKEND SERVER - Main Server Entry Point
// 
// PURPOSE: This is the main entry point for AROGYAM healthcare management system backend.
// It initializes Express.js server, configures middleware, registers routes,
// and starts server to handle API requests from frontend.
// 
// ARCHITECTURE: Follows Express.js best practices with modular routing,
// middleware configuration, and proper error handling.
// 
// AUTHOR: Arogyam Healthcare System Development Team
// VERSION: 2.0 (Enhanced with comprehensive commenting)
// LAST UPDATED: 2026

// IMPORT SECTION - Required Dependencies and Modules
// 
// This section imports all necessary modules and dependencies for the server.
// Each import serves a specific purpose in the application architecture.

// Express.js Framework - Core web application framework
// Purpose: Provides web server functionality and routing capabilities
// Usage: Creates Express application instance and handles HTTP requests
import express from "express";

// CORS Middleware - Cross-Origin Resource Sharing
// Purpose: Enables cross-origin requests from frontend to backend
// Usage: Allows React frontend (localhost:5173) to communicate with this backend
import cors from "cors";

// Dotenv - Environment Variable Management
// Purpose: Loads environment variables from .env file into process.env
// Usage: Manages configuration like database URLs, JWT secrets, and API keys
import dotenv from "dotenv";

// Database Connection - MongoDB Connection Module
// Purpose: Establishes and maintains connection to MongoDB database
// Usage: Called during server startup to connect to the database
import connectDB from "./config/db.js";

// ========================================
// ROUTE IMPORTS - API Route Handlers
// ========================================
// 
// These imports bring in all the API route handlers for different features.
// Each route file handles specific functionality and follows RESTful principles.

// Authentication Routes - User registration, login, and authentication
// Endpoints: /api/auth/register, /api/auth/login, /api/auth/me
// Purpose: Handles user authentication and JWT token management
import authRoutes from "./routes/auth.js";

// Appointments Routes - Appointment management system
// Endpoints: /api/appointments (GET, POST, PUT, DELETE)
// Purpose: Manages appointment booking, approval, completion, and history
import appointmentsRoutes from "./routes/appointments.js";

// Doctors Routes - Doctor profile and information management
// Endpoints: /api/doctors (GET, PUT)
// Purpose: Handles doctor profiles, availability, and professional information
import doctorsRoutes from "./routes/doctors.js";

// Admin Routes - Administrative functions and system management
// Endpoints: /api/admin/*
// Purpose: Provides admin-only functionality for system management
import adminRoutes from "./routes/admin.js";

// Reports Routes - Medical reports and prescription management
// Endpoints: /api/reports (GET, POST, DELETE)
// Purpose: Handles uploading, viewing, and managing medical reports and prescriptions
import reportsRoutes from "./routes/reports.js";

// Payment Routes - Payment processing and transaction management
// Endpoints: /api/payments/*
// Purpose: Manages payment processing, refunds, and transaction history
import paymentRoutes from "./routes/payments.js";

// eSewa Routes - eSewa payment gateway integration
// Endpoints: /api/esewa/*
// Purpose: Handles eSewa payment gateway integration for Nepali market
import eSewaRoutes from "./routes/eSewaRoutes.js";

// Ratings Routes - Doctor rating and review system
// Endpoints: /api/ratings/*
// Purpose: Manages patient ratings and reviews for doctors
import ratingsRoutes from "./routes/ratings.js";

// SOAP Notes Routes - Medical documentation system
// Endpoints: /api/soap/*
// Purpose: Handles SOAP note creation, retrieval, and management
import soapRoutes from "./routes/soap.js";

// Doctor Schedule Routes - Doctor availability scheduling
// Endpoints: /api/doctor-schedule/*
// Purpose: Manages doctor availability schedules and time slots
import doctorScheduleRoutes from "./routes/doctorSchedule.js";

// Notifications Routes - User notification system
// Endpoints: /api/notifications/*
// Purpose: Handles user notifications, alerts, and messaging
import notificationsRoutes from "./routes/notifications.js";

// Path Module - File system path utilities
// Purpose: Provides utilities for working with file and directory paths
// Usage: Used for serving static files from the uploads directory
import path from "path";

// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================
// 
// Load environment variables from .env file into process.env
// This must be done before accessing any environment variables
// 
// Expected variables in .env file:
// - MONGODB_URI: MongoDB connection string
// - JWT_SECRET: Secret key for JWT token signing
// - PORT: Server port number (defaults to 5000)
// - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS: Email configuration
dotenv.config();

// ========================================
// DATABASE CONNECTION
// ========================================
// 
// Establish connection to MongoDB database
// This must be done before starting the server to ensure database availability
// 
// Connection details are loaded from environment variables
// The connection is established once and maintained for the server lifetime
connectDB();

// ========================================
// EXPRESS APPLICATION INITIALIZATION
// ========================================
// 
// Create Express application instance
// This app object will be used to configure middleware and routes
const app = express();

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================
// 
// Configure middleware functions that process all incoming requests
// Middleware runs in the order they are defined

// JSON Body Parser Middleware
// Purpose: Parses incoming JSON request bodies
// Usage: Converts JSON strings in request bodies to JavaScript objects
// Essential for handling POST and PUT requests with JSON data
app.use(express.json());

// CORS Middleware Configuration
// Purpose: Enables Cross-Origin Resource Sharing for frontend-backend communication
// Configuration: Allows requests from http://localhost:5173 (React development server)
// Credentials: true - Allows cookies and authentication headers to be sent
// Security: Restricts CORS to specific frontend domain for security
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ========================================
// ROUTE REGISTRATION
// ========================================
// 
// Register all API routes with the Express application
// Each route handles a specific feature area of the application
// Routes are mounted with prefixes to organize the API structure

// Authentication Routes - User management and authentication
// Mount Point: /api/auth
// Handles: Registration, login, profile retrieval, token validation
app.use("/api/auth", authRoutes);

// Appointments Routes - Appointment management system
// Mount Point: /api/appointments
// Handles: Booking, viewing, approving, completing, and canceling appointments
app.use("/api/appointments", appointmentsRoutes);

// Doctors Routes - Doctor information and profiles
// Mount Point: /api/doctors
// Handles: Doctor profiles, availability, professional information
app.use("/api/doctors", doctorsRoutes);

// Admin Routes - Administrative functions
// Mount Point: /api/admin
// Handles: System administration, user management, analytics
app.use("/api/admin", adminRoutes);

// Reports Routes - Medical reports and prescriptions
// Mount Point: /api/reports
// Handles: Uploading, viewing, downloading medical reports and prescriptions
app.use("/api/reports", reportsRoutes);

// Payment Routes - Payment processing
// Mount Point: /api/payments
// Handles: Payment processing, transaction history, refunds
app.use("/api/payments", paymentRoutes);

// eSewa Payment Routes - eSewa gateway integration
// Mount Point: /api/esewa
// Handles: eSewa payment gateway integration for Nepali market
app.use("/api/esewa", eSewaRoutes);

// Ratings Routes - Doctor rating system
// Mount Point: /api/ratings
// Handles: Doctor ratings, reviews, and feedback management
app.use("/api/ratings", ratingsRoutes);

// SOAP Notes Routes - Medical documentation
// Mount Point: /api/soap
// Handles: SOAP note creation, retrieval, and management
app.use("/api/soap", soapRoutes);

// Doctor Schedule Routes - Availability management
// Mount Point: /api/doctor-schedule
// Handles: Doctor availability schedules and time slot management
app.use("/api/doctor-schedule", doctorScheduleRoutes);

// Static File Serving - Uploads directory
// Mount Point: /uploads
// Purpose: Serves static files (prescriptions, reports, profile pictures)
// Usage: Allows frontend to access uploaded files via URLs
// Security: Resolves absolute path to prevent directory traversal attacks
app.use("/uploads", express.static(path.resolve("uploads")));

// Notifications Routes - User notification system
// Mount Point: /api/notifications
// Handles: User notifications, alerts, and messaging system
app.use("/api/notifications", notificationsRoutes);

// ========================================
// SERVER STARTUP
// ========================================
// 
// Start the Express server and begin listening for incoming requests
// 
// Port Configuration:
// - Uses PORT from environment variables if available
// - Defaults to 5000 if not specified in environment
// - Environment variables allow flexible deployment configurations

const PORT = process.env.PORT || 5000;

// Server Start - Begin listening for requests
// Callback function logs successful server startup
// This indicates the server is ready to handle API requests
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

// ========================================
// SERVER LIFECYCLE NOTES
// ========================================
// 
// 1. Startup Sequence:
//    - Load environment variables
//    - Connect to database
//    - Initialize Express app
//    - Configure middleware
//    - Register routes
//    - Start server
// 
// 2. Request Handling:
//    - Incoming requests pass through middleware in order
//    - Routes handle specific endpoint logic
//    - Responses are sent back to frontend
// 
// 3. Error Handling:
//    - Global error handler catches unhandled errors
//    - Database errors are logged and handled gracefully
//    - Validation errors return appropriate HTTP status codes
// 
// 4. Security Considerations:
//    - CORS configured for specific frontend domain
//    - Static files served from secure directory
//    - Environment variables protect sensitive configuration
//    - JWT authentication protects API endpoints
