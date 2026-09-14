// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/middleware/auth.js
// JWT Authentication Middleware: Verifies Bearer Token
// ============================================================================

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication token is required. Format: Bearer <token>',
                details: null
            }
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_realestate_management_system_2024');
        req.user = decoded; // { personId, role, customerId, agentId, email }
        next();
    } catch (err) {
        return res.status(401).json({
            error: {
                code: 'INVALID_TOKEN',
                message: 'Authentication token is invalid or expired.',
                details: err.message
            }
        });
    }
};
