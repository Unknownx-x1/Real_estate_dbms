// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/transactionRepo.js
// Parameterized SQL Repository for TRANSACTION Base Supertype
// ============================================================================

const db = require('../config/db');

const transactionRepo = {
    async create({ listingId, transactionDate, transactionType }, client = null) {
        const sql = `
            INSERT INTO TRANSACTION (ListingID, TransactionDate, TransactionType)
            VALUES ($1, COALESCE($2, CURRENT_DATE), $3)
            RETURNING TransactionID, ListingID, TransactionDate, TransactionType;
        `;
        const params = [listingId, transactionDate || null, transactionType];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(transactionId) {
        const sql = `
            SELECT 
                t.TransactionID, t.ListingID, t.TransactionDate, t.TransactionType,
                l.ListPrice, l.PropertyID, l.AgentID,
                p.Description AS PropertyDescription, pt.TypeName AS PropertyType,
                st.SalePrice, st.RegistrationNo,
                rc.MonthlyRent, rc.LeaseStartDate, rc.LeaseEndDate,
                COALESCE(SUM(pay.Amount), 0.00) AS TotalPaid
            FROM TRANSACTION t
            JOIN LISTING l ON t.ListingID = l.ListingID
            JOIN PROPERTY p ON l.PropertyID = p.PropertyID
            JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
            LEFT JOIN SALE_TRANSACTION st ON t.TransactionID = st.TransactionID
            LEFT JOIN RENTAL_CONTRACT rc ON t.TransactionID = rc.TransactionID
            LEFT JOIN PAYMENT pay ON t.TransactionID = pay.TransactionID
            WHERE t.TransactionID = $1
            GROUP BY 
                t.TransactionID, t.ListingID, t.TransactionDate, t.TransactionType,
                l.ListPrice, l.PropertyID, l.AgentID,
                p.Description, pt.TypeName,
                st.SalePrice, st.RegistrationNo,
                rc.MonthlyRent, rc.LeaseStartDate, rc.LeaseEndDate;
        `;
        const res = await db.query(sql, [transactionId]);
        return res.rows[0] || null;
    },

    async findAll({ transactionType, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT 
                t.TransactionID, t.ListingID, t.TransactionDate, t.TransactionType,
                l.ListPrice,
                st.SalePrice, st.RegistrationNo,
                rc.MonthlyRent, rc.LeaseStartDate, rc.LeaseEndDate,
                COALESCE(SUM(pay.Amount), 0.00) AS TotalPaid
            FROM TRANSACTION t
            JOIN LISTING l ON t.ListingID = l.ListingID
            LEFT JOIN SALE_TRANSACTION st ON t.TransactionID = st.TransactionID
            LEFT JOIN RENTAL_CONTRACT rc ON t.TransactionID = rc.TransactionID
            LEFT JOIN PAYMENT pay ON t.TransactionID = pay.TransactionID
            WHERE 1=1
        `;
        const params = [];

        if (transactionType) {
            params.push(transactionType);
            sql += ` AND t.TransactionType = $${params.length}`;
        }

        sql += `
            GROUP BY 
                t.TransactionID, t.ListingID, t.TransactionDate, t.TransactionType,
                l.ListPrice, st.SalePrice, st.RegistrationNo, rc.MonthlyRent, rc.LeaseStartDate, rc.LeaseEndDate
        `;

        params.push(limit);
        sql += ` ORDER BY t.TransactionID DESC LIMIT $${params.length}`;
        params.push(offset);
        sql += ` OFFSET $${params.length}`;

        const res = await db.query(sql, params);
        return res.rows;
    }
};

module.exports = transactionRepo;
