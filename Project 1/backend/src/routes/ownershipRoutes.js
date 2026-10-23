// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/ownershipRoutes.js
// Express Routes for Property Ownership Junction
// ============================================================================

const express = require('express');
const router = express.Router();
const ownershipController = require('../controllers/ownershipController');
const auth = require('../middleware/auth');

router.get('/', auth, ownershipController.getAll);
router.post('/', auth, ownershipController.create);
router.delete('/:customerId/:propertyId', auth, ownershipController.delete);

module.exports = router;
