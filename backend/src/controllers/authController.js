// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/authController.js
// Controller for User Registration, Login, and Session Inspection
// ============================================================================

const authService = require('../services/authService');

const authController = {
    async register(req, res, next) {
        try {
            const { firstName, middleName, lastName, email, phoneNo, dateOfBirth, password, role } = req.body;
            if (!firstName || !lastName || !email || !dateOfBirth || !password) {
                return res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'firstName, lastName, email, dateOfBirth, and password are required fields.',
                        details: null
                    }
                });
            }

            const result = await authService.register({
                firstName,
                middleName,
                lastName,
                email,
                phoneNo,
                dateOfBirth,
                password,
                role
            });

            res.status(201).json({
                message: 'User registered successfully.',
                token: result.token,
                user: result.user
            });
        } catch (err) {
            next(err);
        }
    },

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });
            res.status(200).json({
                message: 'Login successful.',
                token: result.token,
                user: result.user
            });
        } catch (err) {
            next(err);
        }
    },

    async me(req, res, next) {
        try {
            const user = await authService.getCurrentUser(req.user.personId);
            res.status(200).json({ user });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = authController;
