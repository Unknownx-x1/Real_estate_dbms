// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/listingRoutes.js
// Express Routes for Listings and Nested Reviews
// ============================================================================

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Public listing browsing & inspection
router.get('/', listingController.getAll);
router.get('/:id', listingController.getById);

// Agent listing management
router.post('/', auth, roleGuard('AGENT'), listingController.create);
router.put('/:id', auth, roleGuard('AGENT'), listingController.update);
router.delete('/:id', auth, roleGuard('AGENT'), listingController.delete);

// Nested reviews endpoints
router.get('/:id/reviews', reviewController.getByListing);
router.post('/:id/reviews', auth, roleGuard('CUSTOMER'), reviewController.create);

module.exports = router;
