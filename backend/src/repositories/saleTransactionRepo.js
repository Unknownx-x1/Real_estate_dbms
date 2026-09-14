// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/saleTransactionRepo.js
// Parameterized SQL Repository for SALE_TRANSACTION 1:1 Subtype
// ============================================================================

const db = require('../config/db');

const saleTransactionRepo = {
    async create({ transactionId, salePrice, registrationNo }, client = null) {
        const sql = `
            INSERT INTO SALE_TRANSACTION (TransactionID, SalePrice, RegistrationNo)
            VALUES ($1, $2, $3)
            RETURNING TransactionID, SalePrice, RegistrationNo;
        `;
        const params = [transactionId, salePrice, registrationNo];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(transactionId) {
        const sql = `
            SELECT TransactionID, SalePrice, RegistrationNo
            FROM SALE_TRANSACTION
            WHERE TransactionID = $1;
        `;
        const res = await db.query(sql, [transactionId]);
        return res.rows[0] || null;
    },

    async findByRegistrationNo(registrationNo) {
        const sql = `
            SELECT TransactionID, SalePrice, RegistrationNo
            FROM SALE_TRANSACTION
            WHERE RegistrationNo = $1;
        `;
        const res = await db.query(sql, [registrationNo]);
        return res.rows[0] || null;
    }
};

module.exports = saleTransactionRepo;
