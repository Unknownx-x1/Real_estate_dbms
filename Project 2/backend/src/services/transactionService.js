// ============================================================================
// REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
// File: backend/src/services/transactionService.js
// Transaction Service: Multi-table Atomic Workflow for Offer Acceptance & Settlement
// ============================================================================

const db = require('../config/db');
const transactionRepo = require('../repositories/transactionRepo');
const saleTransactionRepo = require('../repositories/saleTransactionRepo');
const rentalContractRepo = require('../repositories/rentalContractRepo');
const offerRepo = require('../repositories/offerRepo');
const listingRepo = require('../repositories/listingRepo');

const transactionService = {
    /**
     * Critical Multi-Table Atomic Transaction (Flow 3 in Build Plan):
     * 1. Check Offer validity (must be PENDING)
     * 2. Mark Offer as ACCEPTED
     * 3. Mark competing pending offers for the same listing as REJECTED
     * 4. Create base TRANSACTION record
     * 5. Create SALE_TRANSACTION or RENTAL_CONTRACT subtype record
     * 6. Update LISTING status to SOLD or RENTED
     */
    async acceptOfferAndCreateTransaction({
        offerId,
        transactionType,
        salePrice,
        registrationNo,
        monthlyRent,
        leaseStartDate,
        leaseEndDate
    }) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Fetch Offer with lock
            const offerRes = await client.query('SELECT * FROM OFFER WHERE OfferID = $1 FOR UPDATE', [offerId]);
            if (offerRes.rows.length === 0) {
                const err = new Error(`Offer ID ${offerId} not found.`);
                err.statusCode = 404;
                err.code = 'NOT_FOUND';
                throw err;
            }

            const offer = offerRes.rows[0];
            if (offer.status !== 'PENDING') {
                const err = new Error(`Offer ID ${offerId} cannot be accepted because status is ${offer.status}.`);
                err.statusCode = 400;
                err.code = 'INVALID_OFFER_STATUS';
                throw err;
            }

            const normalizedType = transactionType ? transactionType.toUpperCase() : 'SALE';
            if (!['SALE', 'RENTAL'].includes(normalizedType)) {
                const err = new Error('Invalid TransactionType. Must be either SALE or RENTAL.');
                err.statusCode = 400;
                err.code = 'INVALID_TRANSACTION_TYPE';
                throw err;
            }

            // 2. Accept this offer
            await offerRepo.updateStatus(offerId, 'ACCEPTED', client);

            // 3. Reject competing pending offers
            await offerRepo.rejectOtherOffers(offer.listingid, offerId, client);

            // 4. Create parent TRANSACTION
            const transaction = await transactionRepo.create({
                listingId: offer.listingid,
                transactionType: normalizedType
            }, client);

            // 5. Create exclusive subtype
            let subtypeRecord = null;
            if (normalizedType === 'SALE') {
                if (!salePrice || !registrationNo) {
                    const err = new Error('salePrice and registrationNo are required for SALE transactions.');
                    err.statusCode = 400;
                    err.code = 'MISSING_SUBTYPE_DATA';
                    throw err;
                }
                subtypeRecord = await saleTransactionRepo.create({
                    transactionId: transaction.transactionid,
                    salePrice,
                    registrationNo
                }, client);
            } else if (normalizedType === 'RENTAL') {
                if (!monthlyRent || !leaseStartDate || !leaseEndDate) {
                    const err = new Error('monthlyRent, leaseStartDate, and leaseEndDate are required for RENTAL contracts.');
                    err.statusCode = 400;
                    err.code = 'MISSING_SUBTYPE_DATA';
                    throw err;
                }
                subtypeRecord = await rentalContractRepo.create({
                    transactionId: transaction.transactionid,
                    monthlyRent,
                    leaseStartDate,
                    leaseEndDate
                }, client);
            }

            // 6. Update Listing status
            const newListingStatus = normalizedType === 'SALE' ? 'SOLD' : 'RENTED';
            await listingRepo.updateStatus(offer.listingid, newListingStatus, client);

            await client.query('COMMIT');

            return {
                transactionId: transaction.transactionid,
                listingId: offer.listingid,
                transactionType: normalizedType,
                transactionDate: transaction.transactiondate,
                subtype: subtypeRecord,
                acceptedOfferId: offerId
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    async getTransactionById(transactionId) {
        const txn = await transactionRepo.findById(transactionId);
        if (!txn) {
            const err = new Error(`Transaction ID ${transactionId} not found.`);
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        return txn;
    },

    async getAllTransactions(filters) {
        return await transactionRepo.findAll(filters);
    }
};

module.exports = transactionService;
