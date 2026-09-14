// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/routes/index.js
// Main API Router Aggregator
// ============================================================================

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const propertyTypeRoutes = require('./propertyTypeRoutes');
const propertyRoutes = require('./propertyRoutes');
const ownershipRoutes = require('./ownershipRoutes');
const listingRoutes = require('./listingRoutes');
const offerRoutes = require('./offerRoutes');
const transactionRoutes = require('./transactionRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');

router.use('/auth', authRoutes);
router.use('/property-types', propertyTypeRoutes);
router.use('/properties', propertyRoutes);
router.use('/ownerships', ownershipRoutes);
router.use('/listings', listingRoutes);
router.use('/offers', offerRoutes);
router.use('/transactions', transactionRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
