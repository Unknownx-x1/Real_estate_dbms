// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/repositories/offerRepo.js
// Parameterized SQL Repository for OFFER Entity
// ============================================================================

const db = require('../config/db');

const offerRepo = {
    async create({ customerId, listingId, offerAmount }, client = null) {
        const sql = `
            INSERT INTO OFFER (CustomerID, ListingID, OfferAmount)
            VALUES ($1, $2, $3)
            RETURNING OfferID, CustomerID, ListingID, OfferAmount, OfferDate, Status;
        `;
        const params = [customerId, listingId, offerAmount];
        const res = client ? await client.query(sql, params) : await db.query(sql, params);
        return res.rows[0];
    },

    async findById(offerId, client = null) {
        const sql = `
            SELECT 
                o.OfferID, o.CustomerID, o.ListingID, o.OfferAmount, o.OfferDate, o.Status,
                per.FirstName AS CustomerFirstName, per.LastName AS CustomerLastName, per.Email AS CustomerEmail,
                l.ListPrice, l.Status AS ListingStatus, l.AgentID
            FROM OFFER o
            JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
            JOIN PERSON per ON c.PersonID = per.PersonID
            JOIN LISTING l ON o.ListingID = l.ListingID
            WHERE o.OfferID = $1;
        `;
        const res = client ? await client.query(sql, [offerId]) : await db.query(sql, [offerId]);
        return res.rows[0] || null;
    },

    async findByListingId(listingId) {
        const sql = `
            SELECT 
                o.OfferID, o.CustomerID, o.ListingID, o.OfferAmount, o.OfferDate, o.Status,
                CONCAT(per.FirstName, ' ', per.LastName) AS CustomerName,
                per.Email AS CustomerEmail, per.PhoneNo AS CustomerPhone
            FROM OFFER o
            JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
            JOIN PERSON per ON c.PersonID = per.PersonID
            WHERE o.ListingID = $1
            ORDER BY o.OfferDate DESC;
        `;
        const res = await db.query(sql, [listingId]);
        return res.rows;
    },

    async findByCustomerId(customerId) {
        const sql = `
            SELECT 
                o.OfferID, o.CustomerID, o.ListingID, o.OfferAmount, o.OfferDate, o.Status,
                l.ListPrice, l.Status AS ListingStatus,
                p.Description AS PropertyDescription, pt.TypeName AS PropertyType
            FROM OFFER o
            JOIN LISTING l ON o.ListingID = l.ListingID
            JOIN PROPERTY p ON l.PropertyID = p.PropertyID
            JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
            WHERE o.CustomerID = $1
            ORDER BY o.OfferDate DESC;
        `;
        const res = await db.query(sql, [customerId]);
        return res.rows;
    },

    async updateStatus(offerId, status, client = null) {
        const sql = `
            UPDATE OFFER
            SET Status = $2
            WHERE OfferID = $1
            RETURNING OfferID, ListingID, CustomerID, OfferAmount, Status;
        `;
        const res = client ? await client.query(sql, [offerId, status]) : await db.query(sql, [offerId, status]);
        return res.rows[0] || null;
    },

    async rejectOtherOffers(listingId, excludeOfferId, client = null) {
        const sql = `
            UPDATE OFFER
            SET Status = 'REJECTED'
            WHERE ListingID = $1 AND OfferID <> $2 AND Status = 'PENDING'
            RETURNING OfferID;
        `;
        const res = client ? await client.query(sql, [listingId, excludeOfferId]) : await db.query(sql, [listingId, excludeOfferId]);
        return res.rows;
    }
};

module.exports = offerRepo;
