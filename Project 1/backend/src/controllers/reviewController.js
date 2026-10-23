// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/reviewController.js
// Controller for Listing Reviews
// ============================================================================

const reviewService = require('../services/reviewService');

const reviewController = {
    async getByListing(req, res, next) {
        try {
            const reviews = await reviewService.getReviewsByListing(Number(req.params.id));
            res.status(200).json({ reviews });
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            const { rating, comment } = req.body;
            const listingId = Number(req.params.id);
            const customerId = req.user && req.user.customerId ? req.user.customerId : req.body.customerId;

            if (!customerId) {
                return res.status(403).json({
                    error: {
                        code: 'CUSTOMER_REQUIRED',
                        message: 'Only registered customers can leave reviews.',
                        details: null
                    }
                });
            }

            const review = await reviewService.createReview({
                customerId,
                listingId,
                rating,
                comment
            });

            res.status(201).json({ review });
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            const { rating, comment } = req.body;
            const customerId = req.user && req.user.customerId ? req.user.customerId : null;
            const review = await reviewService.updateReview(Number(req.params.id), customerId, {
                rating,
                comment
            });
            res.status(200).json({ review });
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            const customerId = req.user && req.user.customerId ? req.user.customerId : null;
            await reviewService.deleteReview(Number(req.params.id), customerId);
            res.status(200).json({ message: 'Review deleted successfully.' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = reviewController;
