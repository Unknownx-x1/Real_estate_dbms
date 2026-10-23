// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/queryRoutes.js
// Query Console API Endpoints
// ============================================================================

const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// POST /api/query/execute - Execute arbitrary SQL query
router.post('/execute', queryController.executeQuery);

// GET /api/query/schema - Get database schema introspection
router.get('/schema', queryController.getSchema);

module.exports = router;
