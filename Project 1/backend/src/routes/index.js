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
const queryRoutes = require('./queryRoutes');

router.use('/auth', authRoutes);
router.use('/property-types', propertyTypeRoutes);
router.use('/properties', propertyRoutes);
router.use('/ownerships', ownershipRoutes);
router.use('/listings', listingRoutes);
router.use('/offers', offerRoutes);
router.use('/transactions', transactionRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/query', queryRoutes);

// Seed & Database Rebuild Endpoints (For easy cloud deployment initialization & demo reset)
const { seedDatabase } = require('../../scripts/seedDb');
const { initDatabase } = require('../../scripts/initDb');

router.post('/seed', async (req, res, next) => {
    try {
        const result = await seedDatabase();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.post('/db-init', async (req, res, next) => {
    try {
        const result = await initDatabase();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
