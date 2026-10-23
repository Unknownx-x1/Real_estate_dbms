// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/transactionController.js
// Controller for Transactions and Exclusive Subtypes
// ============================================================================

const transactionService = require('../services/transactionService');

const transactionController = {
    /**
     * Create Transaction (Offer Acceptance Workflow)
     */
    async create(req, res, next) {
        try {
            const {
                offerId,
                transactionType,
                salePrice,
                registrationNo,
                monthlyRent,
                leaseStartDate,
                leaseEndDate
            } = req.body;

            if (!offerId) {
                return res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'offerId is required to create a transaction.',
                        details: null
                    }
                });
            }

            const result = await transactionService.acceptOfferAndCreateTransaction({
                offerId: Number(offerId),
                transactionType,
                salePrice: salePrice ? Number(salePrice) : undefined,
                registrationNo,
                monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
                leaseStartDate,
                leaseEndDate
            });

            res.status(201).json({
                message: 'Offer accepted and transaction recorded atomically.',
                transaction: result
            });
        } catch (err) {
            next(err);
        }
    },

    async getById(req, res, next) {
        try {
            const transaction = await transactionService.getTransactionById(Number(req.params.id));
            res.status(200).json({ transaction });
        } catch (err) {
            next(err);
        }
    },

    async getAll(req, res, next) {
        try {
            const { transactionType, limit, offset } = req.query;
            const transactions = await transactionService.getAllTransactions({
                transactionType,
                limit: limit ? Number(limit) : 50,
                offset: offset ? Number(offset) : 0
            });
            res.status(200).json({ transactions });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = transactionController;
