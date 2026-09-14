// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/customerRepo.js
// Parameterized SQL Repository for CUSTOMER Subtype
// ============================================================================

const db = require('../config/db');

const customerRepo = {
    async create(personId, client = null) {
        const sql = `
            INSERT INTO CUSTOMER (PersonID)
            VALUES ($1)
            RETURNING CustomerID, PersonID;
        `;
        const res = client ? await client.query(sql, [personId]) : await db.query(sql, [personId]);
        return res.rows[0];
    },

    async findById(customerId) {
        const sql = `
            SELECT c.CustomerID, c.PersonID, p.FirstName, p.MiddleName, p.LastName, p.Email, p.PhoneNo, p.DateOfBirth
            FROM CUSTOMER c
            JOIN PERSON p ON c.PersonID = p.PersonID
            WHERE c.CustomerID = $1;
        `;
        const res = await db.query(sql, [customerId]);
        return res.rows[0] || null;
    },

    async findByPersonId(personId, client = null) {
        const sql = `
            SELECT CustomerID, PersonID
            FROM CUSTOMER
            WHERE PersonID = $1;
        `;
        const res = client ? await client.query(sql, [personId]) : await db.query(sql, [personId]);
        return res.rows[0] || null;
    },

    async findAll() {
        const sql = `
            SELECT c.CustomerID, c.PersonID, p.FirstName, p.LastName, p.Email, p.PhoneNo
            FROM CUSTOMER c
            JOIN PERSON p ON c.PersonID = p.PersonID
            ORDER BY c.CustomerID ASC;
        `;
        const res = await db.query(sql);
        return res.rows;
    }
};

module.exports = customerRepo;
