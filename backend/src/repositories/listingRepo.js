// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/listingRepo.js
// Parameterized SQL Repository for LISTING Entity
// ============================================================================

const db = require('../config/db');

const listingRepo = {
    async create({ propertyId, agentId, listPrice, listedDate, status = 'ACTIVE' }, client = null) {
        const sql = `
            INSERT INTO LISTING (PropertyID, AgentID, ListPrice, ListedDate, Status)
            VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
            RETURNING ListingID, PropertyID, AgentID, ListPrice, ListedDate, Status;
        `;
        const params = [propertyId, agentId, listPrice, listedDate || null, status];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(listingId) {
        const sql = `
            SELECT 
                l.ListingID, l.ListPrice, l.ListedDate, l.Status,
                p.PropertyID, p.AreaSqFt, p.Price AS PropertyPrice, p.Description,
                pt.PropertyTypeID, pt.TypeName AS PropertyType,
                a.AgentID, per.PersonID AS AgentPersonID,
                per.FirstName AS AgentFirstName, per.LastName AS AgentLastName,
                per.Email AS AgentEmail, per.PhoneNo AS AgentPhone
            FROM LISTING l
            JOIN PROPERTY p ON l.PropertyID = p.PropertyID
            JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
            JOIN AGENT a ON l.AgentID = a.AgentID
            JOIN PERSON per ON a.PersonID = per.PersonID
            WHERE l.ListingID = $1;
        `;
        const res = await db.query(sql, [listingId]);
        return res.rows[0] || null;
    },

    /**
     * Fetch active listings utilizing the active_listings_full view (or base tables if filters require)
     */
    async findAllActive({ propertyTypeId, minPrice, maxPrice, sortBy = 'ListedDate', sortOrder = 'DESC', limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT * FROM active_listings_full
            WHERE 1=1
        `;
        const params = [];

        if (propertyTypeId) {
            params.push(propertyTypeId);
            sql += ` AND PropertyTypeID = $${params.length}`;
        }
        if (minPrice) {
            params.push(minPrice);
            sql += ` AND ListPrice >= $${params.length}`;
        }
        if (maxPrice) {
            params.push(maxPrice);
            sql += ` AND ListPrice <= $${params.length}`;
        }

        const validSorts = {
            'ListedDate': 'ListedDate',
            'ListPrice': 'ListPrice',
            'AreaSqFt': 'AreaSqFt'
        };
        const sortColumn = validSorts[sortBy] || 'ListedDate';
        const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        params.push(limit);
        sql += ` ORDER BY ${sortColumn} ${direction} LIMIT $${params.length}`;
        params.push(offset);
        sql += ` OFFSET $${params.length}`;

        const res = await db.query(sql, params);
        return res.rows;
    },

    async findAll({ status, agentId, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT 
                l.ListingID, l.ListPrice, l.ListedDate, l.Status,
                p.PropertyID, p.AreaSqFt, p.Description, pt.TypeName AS PropertyType,
                a.AgentID, CONCAT(per.FirstName, ' ', per.LastName) AS AgentName
            FROM LISTING l
            JOIN PROPERTY p ON l.PropertyID = p.PropertyID
            JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
            JOIN AGENT a ON l.AgentID = a.AgentID
            JOIN PERSON per ON a.PersonID = per.PersonID
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            params.push(status);
            sql += ` AND l.Status = $${params.length}`;
        }
        if (agentId) {
            params.push(agentId);
            sql += ` AND l.AgentID = $${params.length}`;
        }

        params.push(limit);
        sql += ` ORDER BY l.ListingID DESC LIMIT $${params.length}`;
        params.push(offset);
        sql += ` OFFSET $${params.length}`;

        const res = await db.query(sql, params);
        return res.rows;
    },

    async update(listingId, { listPrice, status }, client = null) {
        const sql = `
            UPDATE LISTING
            SET ListPrice = COALESCE($2, ListPrice),
                Status = COALESCE($3, Status)
            WHERE ListingID = $1
            RETURNING ListingID, PropertyID, AgentID, ListPrice, ListedDate, Status;
        `;
        const params = [listingId, listPrice, status];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0] || null;
    },

    async updateStatus(listingId, status, client = null) {
        const sql = `
            UPDATE LISTING
            SET Status = $2
            WHERE ListingID = $1
            RETURNING ListingID, Status;
        `;
        const res = client ? await client.query(sql, [listingId, status]) : await db.query(sql, [listingId, status]);
        return res.rows[0] || null;
    },

    async delete(listingId) {
        const sql = `DELETE FROM LISTING WHERE ListingID = $1 RETURNING ListingID;`;
        const res = await db.query(sql, [listingId]);
        return res.rows[0] || null;
    }
};

module.exports = listingRepo;
