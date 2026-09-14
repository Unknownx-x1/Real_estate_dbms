-- ============================================================================
-- REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
-- File: db/indexes.sql
-- Section 7.1, 8, & 17: Performance Indexes for Search, Sort, and Joins
-- ============================================================================

-- 1. Foreign Key Performance Indexes (Optimizes JOIN performance)
CREATE INDEX IF NOT EXISTS idx_fk_customer_person ON CUSTOMER(PersonID);
CREATE INDEX IF NOT EXISTS idx_fk_agent_person ON AGENT(PersonID);
CREATE INDEX IF NOT EXISTS idx_fk_property_type ON PROPERTY(PropertyTypeID);
CREATE INDEX IF NOT EXISTS idx_fk_ownership_property ON OWNERSHIP(PropertyID);
CREATE INDEX IF NOT EXISTS idx_fk_ownership_customer ON OWNERSHIP(CustomerID);
CREATE INDEX IF NOT EXISTS idx_fk_listing_property ON LISTING(PropertyID);
CREATE INDEX IF NOT EXISTS idx_fk_listing_agent ON LISTING(AgentID);
CREATE INDEX IF NOT EXISTS idx_fk_offer_customer ON OFFER(CustomerID);
CREATE INDEX IF NOT EXISTS idx_fk_offer_listing ON OFFER(ListingID);
CREATE INDEX IF NOT EXISTS idx_fk_transaction_listing ON TRANSACTION(ListingID);
CREATE INDEX IF NOT EXISTS idx_fk_payment_transaction ON PAYMENT(TransactionID);
CREATE INDEX IF NOT EXISTS idx_fk_review_customer ON REVIEW(CustomerID);
CREATE INDEX IF NOT EXISTS idx_fk_review_listing ON REVIEW(ListingID);

-- 2. Search, Filter, and Sort Indexes
-- Speeds up browse queries filtering by status and price, sorted by date
CREATE INDEX IF NOT EXISTS idx_listing_status ON LISTING(Status);
CREATE INDEX IF NOT EXISTS idx_listing_price ON LISTING(ListPrice);
CREATE INDEX IF NOT EXISTS idx_listing_status_price ON LISTING(Status, ListPrice);
CREATE INDEX IF NOT EXISTS idx_listing_date_desc ON LISTING(ListedDate DESC);

-- Speeds up property size and price filtering
CREATE INDEX IF NOT EXISTS idx_property_areasqft ON PROPERTY(AreaSqFt);
CREATE INDEX IF NOT EXISTS idx_property_price ON PROPERTY(Price);

-- Speeds up offer status lookups
CREATE INDEX IF NOT EXISTS idx_offer_status ON OFFER(Status);
