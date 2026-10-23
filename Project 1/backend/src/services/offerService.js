// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/services/offerService.js
// Offer Business Logic Service
// ============================================================================

const offerRepo = require('../repositories/offerRepo');
const listingRepo = require('../repositories/listingRepo');
const customerRepo = require('../repositories/customerRepo');

const offerService = {
    async createOffer({ customerId, listingId, offerAmount }) {
        if (!customerId || !listingId || !offerAmount) {
            const err = new Error('customerId, listingId, and offerAmount are required.');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }

        if (Number(offerAmount) <= 0) {
            const err = new Error('Offer amount must be greater than zero.');
            err.statusCode = 400;
            err.code = 'INVALID_OFFER_AMOUNT';
            throw err;
        }

        const customer = await customerRepo.findById(customerId);
        if (!customer) {
            const err = new Error(`Customer ID ${customerId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        const listing = await listingRepo.findById(listingId);
        if (!listing) {
            const err = new Error(`Listing ID ${listingId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        if (listing.status !== 'ACTIVE') {
            const err = new Error(`Cannot make offer on listing with status '${listing.status}'. Listing must be ACTIVE.`);
            err.statusCode = 400;
            err.code = 'LISTING_NOT_ACTIVE';
            throw err;
        }

        return await offerRepo.create({ customerId, listingId, offerAmount });
    },

    async getOfferById(offerId) {
        const offer = await offerRepo.findById(offerId);
        if (!offer) {
            const err = new Error(`Offer ID ${offerId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return offer;
    },

    async getOffersByListing(listingId) {
        return await offerRepo.findByListingId(listingId);
    },

    async getOffersByCustomer(customerId) {
        return await offerRepo.findByCustomerId(customerId);
    },

    async updateOfferStatus(offerId, status) {
        const allowedStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];
        const normalized = status ? status.toUpperCase() : '';
        if (!allowedStatuses.includes(normalized)) {
            const err = new Error(`Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}`);
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }
        const offer = await offerRepo.updateStatus(offerId, normalized);
        if (!offer) {
            const err = new Error(`Offer ID ${offerId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return offer;
    }
};

module.exports = offerService;
