// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/propertyRoutes.js
// Express Routes for Properties
// ============================================================================

const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Public search/view properties
router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);

// Protected mutations
router.post('/', auth, propertyController.create);
router.put('/:id', auth, propertyController.update);
router.delete('/:id', auth, roleGuard('ADMIN', 'AGENT'), propertyController.delete);

module.exports = router;
