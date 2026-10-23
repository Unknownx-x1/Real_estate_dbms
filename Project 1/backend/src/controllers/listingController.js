// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/controllers/listingController.js
// Controller for LISTING Operations & Public Browse
// ============================================================================

const listingService = require('../services/listingService');

const listingController = {
    async getAll(req, res, next) {
        try {
            const { propertyTypeId, minPrice, maxPrice, status, agentId, sortBy, sortOrder, limit, offset } = req.query;

            // If status is specifically ACTIVE (or unprovided), browse active listings using the view
            if (!status || status.toUpperCase() === 'ACTIVE') {
                const listings = await listingService.browseActiveListings({
                    propertyTypeId: propertyTypeId ? Number(propertyTypeId) : undefined,
                    minPrice: minPrice ? Number(minPrice) : undefined,
                    maxPrice: maxPrice ? Number(maxPrice) : undefined,
                    sortBy,
                    sortOrder,
                    limit: limit ? Number(limit) : 50,
                    offset: offset ? Number(offset) : 0
                });
                return res.status(200).json({ listings });
            }

            // Otherwise query all listings matching status/agent
            const listings = await listingService.getAllListings({
                status: status.toUpperCase(),
                agentId: agentId ? Number(agentId) : undefined,
                limit: limit ? Number(limit) : 50,
                offset: offset ? Number(offset) : 0
            });
            res.status(200).json({ listings });
        } catch (err) {
            next(err);
        }
    },

    async getById(req, res, next) {
        try {
            const listing = await listingService.getListingById(Number(req.params.id));
            res.status(200).json({ listing });
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            const { propertyId, listPrice, listedDate, status } = req.body;
            // The authenticated user's agentId
            const agentId = req.user && req.user.agentId ? req.user.agentId : req.body.agentId;

            if (!agentId) {
                return res.status(403).json({
                    error: {
                        code: 'AGENT_REQUIRED',
                        message: 'Only registered agents can create property listings.',
                        details: null
                    }
                });
            }

            const listing = await listingService.createListing({
                propertyId: Number(propertyId),
                agentId: Number(agentId),
                listPrice: Number(listPrice),
                listedDate,
                status
            });

            res.status(201).json({ listing });
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            const { listPrice, status } = req.body;
            const listing = await listingService.updateListing(Number(req.params.id), {
                listPrice: listPrice ? Number(listPrice) : undefined,
                status
            });
            res.status(200).json({ listing });
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            await listingService.deleteListing(Number(req.params.id));
            res.status(200).json({ message: `Listing ${req.params.id} deleted successfully.` });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = listingController;
