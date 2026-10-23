// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/offerController.js
// Controller for Customer Offers
// ============================================================================

const offerService = require('../services/offerService');

const offerController = {
    async create(req, res, next) {
        try {
            const { listingId, offerAmount } = req.body;
            const customerId = req.user && req.user.customerId ? req.user.customerId : req.body.customerId;

            if (!customerId) {
                return res.status(403).json({
                    error: {
                        code: 'CUSTOMER_REQUIRED',
                        message: 'Only registered customers can make offers.',
                        details: null
                    }
                });
            }

            const offer = await offerService.createOffer({
                customerId: Number(customerId),
                listingId: Number(listingId),
                offerAmount: Number(offerAmount)
            });

            res.status(201).json({ offer });
        } catch (err) {
            next(err);
        }
    },

    async getById(req, res, next) {
        try {
            const offer = await offerService.getOfferById(Number(req.params.id));
            res.status(200).json({ offer });
        } catch (err) {
            next(err);
        }
    },

    async getAll(req, res, next) {
        try {
            const { listingId, customerId } = req.query;
            let offers = [];

            if (listingId) {
                offers = await offerService.getOffersByListing(Number(listingId));
            } else if (customerId) {
                offers = await offerService.getOffersByCustomer(Number(customerId));
            } else if (req.user && req.user.customerId) {
                offers = await offerService.getOffersByCustomer(req.user.customerId);
            } else {
                return res.status(400).json({
                    error: {
                        code: 'QUERY_REQUIRED',
                        message: 'Must provide listingId or customerId query parameter.',
                        details: null
                    }
                });
            }

            res.status(200).json({ offers });
        } catch (err) {
            next(err);
        }
    },

    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const offer = await offerService.updateOfferStatus(Number(req.params.id), status);
            res.status(200).json({ offer });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = offerController;
