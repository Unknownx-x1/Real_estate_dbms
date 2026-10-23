// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/middleware/errorHandler.js
// Standardized JSON error responder adhering to API contract:
// { error: { code, message, details } }
// ============================================================================

module.exports = (err, req, res, next) => {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

    const statusCode = err.statusCode || 500;
    const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
    const message = err.message || 'An unexpected error occurred.';
    const details = err.details || null;

    res.status(statusCode).json({
        error: {
            code: errorCode,
            message: message,
            details: details
        }
    });
};
