// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/offerRoutes.js
// Express Routes for Offers
// ============================================================================

const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All offer actions require authentication
router.post('/', auth, roleGuard('CUSTOMER'), offerController.create);
router.get('/:id', auth, offerController.getById);
router.get('/', auth, offerController.getAll);
router.patch('/:id/status', auth, offerController.updateStatus);

module.exports = router;
