// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/propertyRepo.js
// Parameterized SQL Repository for PROPERTY Entity
// ============================================================================

const db = require('../config/db');

const propertyRepo = {
    async create({ areaSqFt, price, description, propertyTypeId }, client = null) {
        const sql = `
            INSERT INTO PROPERTY (AreaSqFt, Price, Description, PropertyTypeID)
            VALUES ($1, $2, $3, $4)
            RETURNING PropertyID, AreaSqFt, Price, Description, PropertyTypeID;
        `;
        const params = [areaSqFt, price, description || null, propertyTypeId];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(propertyId) {
        const sql = `
            SELECT 
                p.PropertyID, p.AreaSqFt, p.Price, p.Description, 
                p.PropertyTypeID, pt.TypeName AS PropertyType
            FROM PROPERTY p
            JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
            WHERE p.PropertyID = $1;
        `;
        const res = await db.query(sql, [propertyId]);
        return res.rows[0] || null;
    },

    async findAll({ minPrice, maxPrice, propertyTypeId, minArea, maxArea, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT 
                p.PropertyID, p.AreaSqFt, p.Price, p.Description, 
                p.PropertyTypeID, pt.TypeName AS PropertyType
            FROM PROPERTY p
            JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
            WHERE 1=1
        `;
        const params = [];

        if (minPrice) {
            params.push(minPrice);
            sql += ` AND p.Price >= $${params.length}`;
        }
        if (maxPrice) {
            params.push(maxPrice);
            sql += ` AND p.Price <= $${params.length}`;
        }
        if (propertyTypeId) {
            params.push(propertyTypeId);
            sql += ` AND p.PropertyTypeID = $${params.length}`;
        }
        if (minArea) {
            params.push(minArea);
            sql += ` AND p.AreaSqFt >= $${params.length}`;
        }
        if (maxArea) {
            params.push(maxArea);
            sql += ` AND p.AreaSqFt <= $${params.length}`;
        }

        params.push(limit);
        sql += ` ORDER BY p.PropertyID DESC LIMIT $${params.length}`;
        params.push(offset);
        sql += ` OFFSET $${params.length}`;

        const res = await db.query(sql, params);
        return res.rows;
    },

    async update(propertyId, { areaSqFt, price, description, propertyTypeId }) {
        const sql = `
            UPDATE PROPERTY
            SET AreaSqFt = COALESCE($2, AreaSqFt),
                Price = COALESCE($3, Price),
                Description = COALESCE($4, Description),
                PropertyTypeID = COALESCE($5, PropertyTypeID)
            WHERE PropertyID = $1
            RETURNING PropertyID, AreaSqFt, Price, Description, PropertyTypeID;
        `;
        const res = await db.query(sql, [propertyId, areaSqFt, price, description, propertyTypeId]);
        return res.rows[0] || null;
    },

    async delete(propertyId) {
        const sql = `DELETE FROM PROPERTY WHERE PropertyID = $1 RETURNING PropertyID;`;
        const res = await db.query(sql, [propertyId]);
        return res.rows[0] || null;
    }
};

module.exports = propertyRepo;
