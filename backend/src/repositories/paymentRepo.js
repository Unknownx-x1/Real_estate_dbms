// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/paymentRepo.js
// Parameterized SQL Repository for PAYMENT Entity
// ============================================================================

const db = require('../config/db');

const paymentRepo = {
    async create({ transactionId, amount, paymentMode, referenceNo }, client = null) {
        const sql = `
            INSERT INTO PAYMENT (TransactionID, Amount, PaymentMode, ReferenceNo)
            VALUES ($1, $2, $3, $4)
            RETURNING PaymentID, TransactionID, Amount, PaymentDate, PaymentMode, ReferenceNo;
        `;
        const params = [transactionId, amount, paymentMode, referenceNo];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(paymentId) {
        const sql = `
            SELECT PaymentID, TransactionID, Amount, PaymentDate, PaymentMode, ReferenceNo
            FROM PAYMENT
            WHERE PaymentID = $1;
        `;
        const res = await db.query(sql, [paymentId]);
        return res.rows[0] || null;
    },

    async findByTransactionId(transactionId) {
        const sql = `
            SELECT PaymentID, TransactionID, Amount, PaymentDate, PaymentMode, ReferenceNo
            FROM PAYMENT
            WHERE TransactionID = $1
            ORDER BY PaymentDate DESC;
        `;
        const res = await db.query(sql, [transactionId]);
        return res.rows;
    },

    async findAll({ limit = 50, offset = 0 } = {}) {
        const sql = `
            SELECT 
                p.PaymentID, p.TransactionID, p.Amount, p.PaymentDate, p.PaymentMode, p.ReferenceNo,
                t.TransactionType, t.ListingID
            FROM PAYMENT p
            JOIN TRANSACTION t ON p.TransactionID = t.TransactionID
            ORDER BY p.PaymentDate DESC
            LIMIT $1 OFFSET $2;
        `;
        const res = await db.query(sql, [limit, offset]);
        return res.rows;
    }
};

module.exports = paymentRepo;
