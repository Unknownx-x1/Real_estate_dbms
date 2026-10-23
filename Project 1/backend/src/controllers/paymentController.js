// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/paymentController.js
// Controller for Payments
// ============================================================================

const paymentService = require('../services/paymentService');

const paymentController = {
    async create(req, res, next) {
        try {
            const { transactionId, amount, paymentMode, referenceNo } = req.body;
            const payment = await paymentService.createPayment({
                transactionId: Number(transactionId),
                amount: Number(amount),
                paymentMode,
                referenceNo: referenceNo || `TXN-REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            });
            res.status(201).json({ payment });
        } catch (err) {
            next(err);
        }
    },

    async getById(req, res, next) {
        try {
            const payment = await paymentService.getPaymentById(Number(req.params.id));
            res.status(200).json({ payment });
        } catch (err) {
            next(err);
        }
    },

    async getAll(req, res, next) {
        try {
            const { transactionId, limit, offset } = req.query;
            let payments;
            if (transactionId) {
                payments = await paymentService.getPaymentsByTransaction(Number(transactionId));
            } else {
                payments = await paymentService.getAllPayments({
                    limit: limit ? Number(limit) : 50,
                    offset: offset ? Number(offset) : 0
                });
            }
            res.status(200).json({ payments });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = paymentController;
