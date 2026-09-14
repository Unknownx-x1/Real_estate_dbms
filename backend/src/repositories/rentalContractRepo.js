// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/rentalContractRepo.js
// Parameterized SQL Repository for RENTAL_CONTRACT 1:1 Subtype
// ============================================================================

const db = require('../config/db');

const rentalContractRepo = {
    async create({ transactionId, monthlyRent, leaseStartDate, leaseEndDate }, client = null) {
        const sql = `
            INSERT INTO RENTAL_CONTRACT (TransactionID, MonthlyRent, LeaseStartDate, LeaseEndDate)
            VALUES ($1, $2, $3, $4)
            RETURNING TransactionID, MonthlyRent, LeaseStartDate, LeaseEndDate;
        `;
        const params = [transactionId, monthlyRent, leaseStartDate, leaseEndDate];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(transactionId) {
        const sql = `
            SELECT TransactionID, MonthlyRent, LeaseStartDate, LeaseEndDate
            FROM RENTAL_CONTRACT
            WHERE TransactionID = $1;
        `;
        const res = await db.query(sql, [transactionId]);
        return res.rows[0] || null;
    }
};

module.exports = rentalContractRepo;
