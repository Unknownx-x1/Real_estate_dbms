// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/ownershipRepo.js
// Parameterized SQL Repository for OWNERSHIP Composite Entity
// ============================================================================

const db = require('../config/db');

const ownershipRepo = {
    async create({ customerId, propertyId, ownershipShare, sinceDate }, client = null) {
        const sql = `
            INSERT INTO OWNERSHIP (CustomerID, PropertyID, OwnershipShare, SinceDate)
            VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
            RETURNING CustomerID, PropertyID, OwnershipShare, SinceDate;
        `;
        const params = [customerId, propertyId, ownershipShare, sinceDate || null];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findByProperty(propertyId) {
        const sql = `
            SELECT 
                o.CustomerID, o.PropertyID, o.OwnershipShare, o.SinceDate,
                per.FirstName, per.LastName, per.Email, per.PhoneNo
            FROM OWNERSHIP o
            JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
            JOIN PERSON per ON c.PersonID = per.PersonID
            WHERE o.PropertyID = $1
            ORDER BY o.OwnershipShare DESC;
        `;
        const res = await db.query(sql, [propertyId]);
        return res.rows;
    },

    async findByCustomer(customerId) {
        const sql = `
            SELECT 
                o.CustomerID, o.PropertyID, o.OwnershipShare, o.SinceDate,
                p.AreaSqFt, p.Price, p.Description, pt.TypeName AS PropertyType
            FROM OWNERSHIP o
            JOIN PROPERTY p ON o.PropertyID = p.PropertyID
            JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
            WHERE o.CustomerID = $1
            ORDER BY o.SinceDate DESC;
        `;
        const res = await db.query(sql, [customerId]);
        return res.rows;
    },

    async findAll() {
        const sql = `
            SELECT 
                o.CustomerID, o.PropertyID, o.OwnershipShare, o.SinceDate,
                CONCAT(per.FirstName, ' ', per.LastName) AS CustomerName,
                p.Description AS PropertyDescription
            FROM OWNERSHIP o
            JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
            JOIN PERSON per ON c.PersonID = per.PersonID
            JOIN PROPERTY p ON o.PropertyID = p.PropertyID
            ORDER BY o.SinceDate DESC;
        `;
        const res = await db.query(sql);
        return res.rows;
    },

    async delete(customerId, propertyId) {
        const sql = `
            DELETE FROM OWNERSHIP 
            WHERE CustomerID = $1 AND PropertyID = $2
            RETURNING CustomerID, PropertyID;
        `;
        const res = await db.query(sql, [customerId, propertyId]);
        return res.rows[0] || null;
    }
};

module.exports = ownershipRepo;
