// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/reviewRoutes.js
// Express Routes for Direct Review Operations
// ============================================================================

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.put('/:id', auth, roleGuard('CUSTOMER'), reviewController.update);
router.delete('/:id', auth, roleGuard('CUSTOMER'), reviewController.delete);

module.exports = router;
