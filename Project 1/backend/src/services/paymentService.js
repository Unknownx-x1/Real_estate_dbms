// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/services/paymentService.js
// Payment Business Logic Service
// ============================================================================

const paymentRepo = require('../repositories/paymentRepo');
const transactionRepo = require('../repositories/transactionRepo');

const paymentService = {
    async createPayment({ transactionId, amount, paymentMode, referenceNo }) {
        if (!transactionId || !amount || !paymentMode || !referenceNo) {
            const err = new Error('transactionId, amount, paymentMode, and referenceNo are required.');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }

        if (Number(amount) <= 0) {
            const err = new Error('Payment amount must be greater than zero.');
            err.statusCode = 400;
            err.code = 'INVALID_PAYMENT_AMOUNT';
            throw err;
        }

        const transaction = await transactionRepo.findById(transactionId);
        if (!transaction) {
            const err = new Error(`Transaction ID ${transactionId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        return await paymentRepo.create({ transactionId, amount, paymentMode, referenceNo });
    },

    async getPaymentById(paymentId) {
        const payment = await paymentRepo.findById(paymentId);
        if (!payment) {
            const err = new Error(`Payment ID ${paymentId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return payment;
    },

    async getPaymentsByTransaction(transactionId) {
        return await paymentRepo.findByTransactionId(transactionId);
    },

    async getAllPayments(pagination) {
        return await paymentRepo.findAll(pagination);
    }
};

module.exports = paymentService;
