// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/services/reviewService.js
// Review Business Logic Service
// ============================================================================

const reviewRepo = require('../repositories/reviewRepo');
const customerRepo = require('../repositories/customerRepo');
const listingRepo = require('../repositories/listingRepo');

const reviewService = {
    async createReview({ customerId, listingId, rating, comment }) {
        if (!customerId || !listingId || rating === undefined) {
            const err = new Error('customerId, listingId, and rating are required.');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            throw err;
        }

        const numRating = Number(rating);
        if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
            const err = new Error('Rating must be an integer between 1 and 5.');
            err.statusCode = 400;
            err.code = 'INVALID_RATING';
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

        return await reviewRepo.create({ customerId, listingId, rating: numRating, comment });
    },

    async getReviewById(reviewId) {
        const review = await reviewRepo.findById(reviewId);
        if (!review) {
            const err = new Error(`Review ID ${reviewId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return review;
    },

    async getReviewsByListing(listingId) {
        return await reviewRepo.findByListingId(listingId);
    },

    async getReviewsByCustomer(customerId) {
        return await reviewRepo.findByCustomerId(customerId);
    },

    async updateReview(reviewId, customerId, { rating, comment }) {
        const existing = await reviewRepo.findById(reviewId);
        if (!existing) {
            const err = new Error(`Review ID ${reviewId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        if (existing.customerid !== customerId) {
            const err = new Error('Forbidden: You can only edit your own reviews.');
            err.statusCode = 403;
            err.code = 'FORBIDDEN';
            throw err;
        }

        let numRating = undefined;
        if (rating !== undefined) {
            numRating = Number(rating);
            if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
                const err = new Error('Rating must be an integer between 1 and 5.');
                err.statusCode = 400;
                err.code = 'INVALID_RATING';
                throw err;
            }
        }

        return await reviewRepo.update(reviewId, { rating: numRating, comment });
    },

    async deleteReview(reviewId, customerId) {
        const existing = await reviewRepo.findById(reviewId);
        if (!existing) {
            const err = new Error(`Review ID ${reviewId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }

        if (existing.customerid !== customerId) {
            const err = new Error('Forbidden: You can only delete your own reviews.');
            err.statusCode = 403;
            err.code = 'FORBIDDEN';
            throw err;
        }

        return await reviewRepo.delete(reviewId);
    }
};

module.exports = reviewService;
