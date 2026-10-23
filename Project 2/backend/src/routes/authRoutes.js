// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/authRoutes.js
// Express Routes for Authentication
// ============================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected endpoint
router.get('/me', auth, authController.me);

module.exports = router;
