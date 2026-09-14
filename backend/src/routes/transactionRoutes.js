// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/transactionRoutes.js
// Express Routes for Transactions
// ============================================================================

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Agent creates transaction by accepting an offer
router.post('/', auth, roleGuard('AGENT'), transactionController.create);

// Inspect transactions
router.get('/:id', auth, transactionController.getById);
router.get('/', auth, transactionController.getAll);

module.exports = router;
