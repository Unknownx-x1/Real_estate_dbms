// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/services/propertyService.js
// Property & PropertyType Business Logic Service
// ============================================================================

const propertyRepo = require('../repositories/propertyRepo');
const propertyTypeRepo = require('../repositories/propertyTypeRepo');
const ownershipRepo = require('../repositories/ownershipRepo');

const propertyService = {
    async createProperty({ areaSqFt, price, description, propertyTypeId, ownerCustomerId, ownershipShare }) {
        if (!areaSqFt || !price || !propertyTypeId) {
            const err = new Error('areaSqFt, price, and propertyTypeId are required.');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }

        const type = await propertyTypeRepo.findById(propertyTypeId);
        if (!type) {
            const err = new Error(`Property type ID ${propertyTypeId} does not exist.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        const property = await propertyRepo.create({ areaSqFt, price, description, propertyTypeId });

        // Optionally associate initial ownership if provided
        if (ownerCustomerId) {
            const share = ownershipShare || 100.00;
            await ownershipRepo.create({
                customerId: ownerCustomerId,
                propertyId: property.propertyid,
                ownershipShare: share
            });
        }

        return property;
    },

    async getPropertyById(propertyId) {
        const property = await propertyRepo.findById(propertyId);
        if (!property) {
            const err = new Error(`Property ID ${propertyId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        const owners = await ownershipRepo.findByProperty(propertyId);
        return { ...property, owners };
    },

    async getAllProperties(filters) {
        return await propertyRepo.findAll(filters);
    },

    async updateProperty(propertyId, data) {
        const property = await propertyRepo.update(propertyId, data);
        if (!property) {
            const err = new Error(`Property ID ${propertyId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return property;
    },

    async deleteProperty(propertyId) {
        const property = await propertyRepo.delete(propertyId);
        if (!property) {
            const err = new Error(`Property ID ${propertyId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return property;
    },

    // Property Types
    async getAllPropertyTypes() {
        return await propertyTypeRepo.findAll();
    },

    async createPropertyType(typeName) {
        if (!typeName) {
            const err = new Error('TypeName is required.');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }
        return await propertyTypeRepo.create(typeName);
    }
};

module.exports = propertyService;
