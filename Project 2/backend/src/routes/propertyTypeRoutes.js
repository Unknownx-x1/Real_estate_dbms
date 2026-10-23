// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/propertyTypeRoutes.js
// Express Routes for Property Types
// ============================================================================

const express = require('express');
const router = express.Router();
const propertyTypeController = require('../controllers/propertyTypeController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Public catalog read
router.get('/', propertyTypeController.getAll);

// Protected create (Agent or Admin)
router.post('/', auth, roleGuard('AGENT', 'ADMIN'), propertyTypeController.create);

module.exports = router;
