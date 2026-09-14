// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/app.js
// Express Application Setup & Middleware Pipeline
// ============================================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'Real Estate Management API',
        timestamp: new Date().toISOString()
    });
});

// Mount Main API Routes
app.use('/api', apiRoutes);

// 404 Route Not Found Handler
app.use((req, res, next) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
            details: null
        }
    });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
