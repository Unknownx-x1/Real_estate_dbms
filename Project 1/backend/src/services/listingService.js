// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/services/listingService.js
// Listing Business Logic Service
// ============================================================================

const listingRepo = require('../repositories/listingRepo');
const propertyRepo = require('../repositories/propertyRepo');
const agentRepo = require('../repositories/agentRepo');
const reviewRepo = require('../repositories/reviewRepo');
const offerRepo = require('../repositories/offerRepo');

const listingService = {
    async createListing({ propertyId, agentId, listPrice, listedDate, status = 'ACTIVE' }) {
        if (!propertyId || !agentId || !listPrice) {
            const err = new Error('propertyId, agentId, and listPrice are required.');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }

        const property = await propertyRepo.findById(propertyId);
        if (!property) {
            const err = new Error(`Property ID ${propertyId} does not exist.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        const agent = await agentRepo.findById(agentId);
        if (!agent) {
            const err = new Error(`Agent ID ${agentId} does not exist.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        return await listingRepo.create({ propertyId, agentId, listPrice, listedDate, status });
    },

    async getListingById(listingId) {
        const listing = await listingRepo.findById(listingId);
        if (!listing) {
            const err = new Error(`Listing ID ${listingId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        // Include reviews and offer count
        const reviews = await reviewRepo.findByListingId(listingId);
        return {
            ...listing,
            reviews
        };
    },

    async browseActiveListings(filters) {
        return await listingRepo.findAllActive(filters);
    },

    async getAllListings(filters) {
        return await listingRepo.findAll(filters);
    },

    async updateListing(listingId, { listPrice, status }) {
        const listing = await listingRepo.update(listingId, { listPrice, status });
        if (!listing) {
            const err = new Error(`Listing ID ${listingId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return listing;
    },

    async deleteListing(listingId) {
        const listing = await listingRepo.delete(listingId);
        if (!listing) {
            const err = new Error(`Listing ID ${listingId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return listing;
    }
};

module.exports = listingService;
