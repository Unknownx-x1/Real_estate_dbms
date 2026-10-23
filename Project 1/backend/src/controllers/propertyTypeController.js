// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/propertyTypeController.js
// Controller for Property Types
// ============================================================================

const propertyService = require('../services/propertyService');

const propertyTypeController = {
    async getAll(req, res, next) {
        try {
            const types = await propertyService.getAllPropertyTypes();
            res.status(200).json({ propertyTypes: types });
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            const { typeName } = req.body;
            const newType = await propertyService.createPropertyType(typeName);
            res.status(201).json({ propertyType: newType });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = propertyTypeController;
