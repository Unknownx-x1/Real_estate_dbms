// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/propertyTypeRepo.js
// Parameterized SQL Repository for PROPERTY_TYPE Catalog
// ============================================================================

const db = require('../config/db');

const propertyTypeRepo = {
    async findAll() {
        const sql = `SELECT PropertyTypeID, TypeName FROM PROPERTY_TYPE ORDER BY PropertyTypeID ASC;`;
        const res = await db.query(sql);
        return res.rows;
    },

    async findById(propertyTypeId) {
        const sql = `SELECT PropertyTypeID, TypeName FROM PROPERTY_TYPE WHERE PropertyTypeID = $1;`;
        const res = await db.query(sql, [propertyTypeId]);
        return res.rows[0] || null;
    },

    async create(typeName) {
        const sql = `INSERT INTO PROPERTY_TYPE (TypeName) VALUES ($1) RETURNING PropertyTypeID, TypeName;`;
        const res = await db.query(sql, [typeName]);
        return res.rows[0];
    },

    async update(propertyTypeId, typeName) {
        const sql = `UPDATE PROPERTY_TYPE SET TypeName = $2 WHERE PropertyTypeID = $1 RETURNING PropertyTypeID, TypeName;`;
        const res = await db.query(sql, [propertyTypeId, typeName]);
        return res.rows[0] || null;
    },

    async delete(propertyTypeId) {
        const sql = `DELETE FROM PROPERTY_TYPE WHERE PropertyTypeID = $1 RETURNING PropertyTypeID;`;
        const res = await db.query(sql, [propertyTypeId]);
        return res.rows[0] || null;
    }
};

module.exports = propertyTypeRepo;
