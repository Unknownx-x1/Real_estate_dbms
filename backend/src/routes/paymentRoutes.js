// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/paymentRoutes.js
// Express Routes for Payments
// ============================================================================

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/', auth, paymentController.create);
router.get('/:id', auth, paymentController.getById);
router.get('/', auth, paymentController.getAll);

module.exports = router;
