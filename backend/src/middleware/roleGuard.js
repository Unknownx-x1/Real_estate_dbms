// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/middleware/roleGuard.js
// Role-based Access Control Guard (CUSTOMER, AGENT, ADMIN)
// ============================================================================

module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User authentication required.',
                    details: null
                }
            });
        }

        const userRole = req.user.role ? req.user.role.toUpperCase() : null;
        const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

        if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${userRole}`,
                    details: null
                }
            });
        }

        next();
    };
};
