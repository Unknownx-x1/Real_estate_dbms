-- ============================================================================
-- REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
-- File: db/constraints.sql
-- Section 5: Referential-Integrity & Business Constraint Rules
-- ============================================================================

-- 1. PERSON: Avoid duplicate identity/contact records
ALTER TABLE PERSON 
    ADD CONSTRAINT uq_person_email UNIQUE (Email);

ALTER TABLE PERSON 
    ADD CONSTRAINT uq_person_phone UNIQUE (PhoneNo);

-- 2. PROPERTY: Valid property inventory
ALTER TABLE PROPERTY 
    ADD CONSTRAINT chk_property_price CHECK (Price > 0);

ALTER TABLE PROPERTY 
    ADD CONSTRAINT chk_property_areasqft CHECK (AreaSqFt > 0);

-- 3. OWNERSHIP: Valid percentage range
ALTER TABLE OWNERSHIP 
    ADD CONSTRAINT chk_ownership_share CHECK (OwnershipShare > 0 AND OwnershipShare <= 100);

-- 4. LISTING: Prevent invalid listings & restrict status enum
ALTER TABLE LISTING 
    ADD CONSTRAINT chk_listing_price CHECK (ListPrice > 0);

ALTER TABLE LISTING 
    ADD CONSTRAINT chk_listing_status CHECK (Status IN ('ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'INACTIVE'));

-- 5. OFFER: Prevent invalid offers
ALTER TABLE OFFER 
    ADD CONSTRAINT chk_offer_amount CHECK (OfferAmount > 0);

ALTER TABLE OFFER 
    ADD CONSTRAINT chk_offer_status CHECK (Status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'));

-- 6. TRANSACTION: Drive exclusive subtype logic
ALTER TABLE TRANSACTION 
    ADD CONSTRAINT chk_transaction_type CHECK (TransactionType IN ('SALE', 'RENTAL'));

-- 7. SALE_TRANSACTION: Avoid duplicate registrations & valid sale price
ALTER TABLE SALE_TRANSACTION 
    ADD CONSTRAINT chk_saletransaction_price CHECK (SalePrice > 0);

-- 8. RENTAL_CONTRACT: Valid lease dates and rent
ALTER TABLE RENTAL_CONTRACT 
    ADD CONSTRAINT chk_rental_rent CHECK (MonthlyRent > 0);

ALTER TABLE RENTAL_CONTRACT 
    ADD CONSTRAINT chk_rental_dates CHECK (LeaseStartDate < LeaseEndDate);

-- 9. PAYMENT: Valid and traceable payment
ALTER TABLE PAYMENT 
    ADD CONSTRAINT chk_payment_amount CHECK (Amount > 0);

-- 10. REVIEW: Valid rating range
ALTER TABLE REVIEW 
    ADD CONSTRAINT chk_review_rating CHECK (Rating BETWEEN 1 AND 5);
