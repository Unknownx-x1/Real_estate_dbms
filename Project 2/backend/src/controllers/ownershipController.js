// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/ownershipController.js
// Controller for OWNERSHIP Junction Operations
// ============================================================================

const ownershipRepo = require('../repositories/ownershipRepo');

const ownershipController = {
    async getAll(req, res, next) {
        try {
            const { propertyId, customerId } = req.query;
            let ownerships;
            if (propertyId) {
                ownerships = await ownershipRepo.findByProperty(Number(propertyId));
            } else if (customerId) {
                ownerships = await ownershipRepo.findByCustomer(Number(customerId));
            } else {
                ownerships = await ownershipRepo.findAll();
            }
            res.status(200).json({ ownerships });
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            const { customerId, propertyId, ownershipShare, sinceDate } = req.body;
            if (!customerId || !propertyId || !ownershipShare) {
                return res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'customerId, propertyId, and ownershipShare are required.',
                        details: null
                    }
                });
            }

            const ownership = await ownershipRepo.create({
                customerId: Number(customerId),
                propertyId: Number(propertyId),
                ownershipShare: Number(ownershipShare),
                sinceDate
            });
            res.status(201).json({ ownership });
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            const { customerId, propertyId } = req.params;
            const deleted = await ownershipRepo.delete(Number(customerId), Number(propertyId));
            if (!deleted) {
                return res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: `Ownership record for customer ${customerId} and property ${propertyId} not found.`,
                        details: null
                    }
                });
            }
            res.status(200).json({ message: 'Ownership record deleted successfully.' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = ownershipController;
