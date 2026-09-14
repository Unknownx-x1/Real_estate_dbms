// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/reviewRepo.js
// Parameterized SQL Repository for REVIEW Entity
// ============================================================================

const db = require('../config/db');

const reviewRepo = {
    async create({ customerId, listingId, rating, comment }, client = null) {
        const sql = `
            INSERT INTO REVIEW (CustomerID, ListingID, Rating, Comment)
            VALUES ($1, $2, $3, $4)
            RETURNING ReviewID, CustomerID, ListingID, ReviewDate, Rating, Comment;
        `;
        const params = [customerId, listingId, rating, comment || null];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(reviewId) {
        const sql = `
            SELECT 
                r.ReviewID, r.CustomerID, r.ListingID, r.ReviewDate, r.Rating, r.Comment,
                CONCAT(per.FirstName, ' ', per.LastName) AS CustomerName
            FROM REVIEW r
            JOIN CUSTOMER c ON r.CustomerID = c.CustomerID
            JOIN PERSON per ON c.PersonID = per.PersonID
            WHERE r.ReviewID = $1;
        `;
        const res = await db.query(sql, [reviewId]);
        return res.rows[0] || null;
    },

    async findByListingId(listingId) {
        const sql = `
            SELECT 
                r.ReviewID, r.CustomerID, r.ListingID, r.ReviewDate, r.Rating, r.Comment,
                CONCAT(per.FirstName, ' ', per.LastName) AS CustomerName,
                per.Email AS CustomerEmail
            FROM REVIEW r
            JOIN CUSTOMER c ON r.CustomerID = c.CustomerID
            JOIN PERSON per ON c.PersonID = per.PersonID
            WHERE r.ListingID = $1
            ORDER BY r.ReviewDate DESC;
        `;
        const res = await db.query(sql, [listingId]);
        return res.rows;
    },

    async findByCustomerId(customerId) {
        const sql = `
            SELECT 
                r.ReviewID, r.CustomerID, r.ListingID, r.ReviewDate, r.Rating, r.Comment,
                l.ListPrice, p.Description AS PropertyDescription
            FROM REVIEW r
            JOIN LISTING l ON r.ListingID = l.ListingID
            JOIN PROPERTY p ON l.PropertyID = p.PropertyID
            WHERE r.CustomerID = $1
            ORDER BY r.ReviewDate DESC;
        `;
        const res = await db.query(sql, [customerId]);
        return res.rows;
    },

    async update(reviewId, { rating, comment }) {
        const sql = `
            UPDATE REVIEW
            SET Rating = COALESCE($2, Rating),
                Comment = COALESCE($3, Comment)
            WHERE ReviewID = $1
            RETURNING ReviewID, CustomerID, ListingID, ReviewDate, Rating, Comment;
        `;
        const res = await db.query(sql, [reviewId, rating, comment]);
        return res.rows[0] || null;
    },

    async delete(reviewId) {
        const sql = `DELETE FROM REVIEW WHERE ReviewID = $1 RETURNING ReviewID;`;
        const res = await db.query(sql, [reviewId]);
        return res.rows[0] || null;
    }
};

module.exports = reviewRepo;
