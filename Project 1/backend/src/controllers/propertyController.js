// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/propertyController.js
// Controller for Property Operations
// ============================================================================

const propertyService = require('../services/propertyService');

const propertyController = {
    async getAll(req, res, next) {
        try {
            const { minPrice, maxPrice, propertyTypeId, minArea, maxArea, limit, offset } = req.query;
            const properties = await propertyService.getAllProperties({
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                propertyTypeId: propertyTypeId ? Number(propertyTypeId) : undefined,
                minArea: minArea ? Number(minArea) : undefined,
                maxArea: maxArea ? Number(maxArea) : undefined,
                limit: limit ? Number(limit) : 50,
                offset: offset ? Number(offset) : 0
            });
            res.status(200).json({ properties });
        } catch (err) {
            next(err);
        }
    },

    async getById(req, res, next) {
        try {
            const property = await propertyService.getPropertyById(Number(req.params.id));
            res.status(200).json({ property });
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            const { areaSqFt, price, description, propertyTypeId, ownershipShare } = req.body;
            // Associate owner if current authenticated user is a CUSTOMER
            const ownerCustomerId = req.user && req.user.customerId ? req.user.customerId : null;

            const property = await propertyService.createProperty({
                areaSqFt,
                price,
                description,
                propertyTypeId,
                ownerCustomerId,
                ownershipShare
            });
            res.status(201).json({ property });
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            const { areaSqFt, price, description, propertyTypeId } = req.body;
            const property = await propertyService.updateProperty(Number(req.params.id), {
                areaSqFt,
                price,
                description,
                propertyTypeId
            });
            res.status(200).json({ property });
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            await propertyService.deleteProperty(Number(req.params.id));
            res.status(200).json({ message: `Property ${req.params.id} deleted successfully.` });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = propertyController;
