// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/graphRoutes.js
// FalkorDB Graph Routes (Health, Network, Recommendations, Cypher, Benchmarks)
// ============================================================================

const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');

// Health & Graph Stats
router.get('/health', graphController.getGraphHealth);

// Full Network / Node-Edge Visualizer payload
router.get('/network', graphController.getGraphNetwork);

// Property Recommendations via multi-hop Graph Traversal
router.get('/recommendations/:customerId', graphController.getRecommendations);

// Performance Benchmark: Postgres vs FalkorDB GraphBLAS
router.get('/benchmark', graphController.runBenchmark);

// Interactive OpenCypher Query Console
router.post('/query', graphController.executeCypherQuery);

module.exports = router;
