-- ============================================================================
-- REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
-- File: db/functions.sql
-- Section 7.1 & Section 8: Stored Procedures / Functions
-- ============================================================================

-- 1. Function: Atomic Offer Acceptance & Transaction Creation
CREATE OR REPLACE FUNCTION fn_accept_offer(
    p_offer_id INT,
    p_transaction_type VARCHAR(20),
    p_sale_price NUMERIC(14, 2) DEFAULT NULL,
    p_registration_no VARCHAR(100) DEFAULT NULL,
    p_monthly_rent NUMERIC(12, 2) DEFAULT NULL,
    p_lease_start DATE DEFAULT NULL,
    p_lease_end DATE DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
    v_listing_id INT;
    v_offer_status VARCHAR(20);
    v_new_transaction_id INT;
BEGIN
    -- Validate offer
    SELECT ListingID, Status INTO v_listing_id, v_offer_status
    FROM OFFER
    WHERE OfferID = p_offer_id;

    IF v_listing_id IS NULL THEN
        RAISE EXCEPTION 'Offer ID % does not exist.', p_offer_id;
    END IF;

    IF v_offer_status <> 'PENDING' THEN
        RAISE EXCEPTION 'Offer ID % is already % and cannot be accepted.', p_offer_id, v_offer_status;
    END IF;

    IF p_transaction_type NOT IN ('SALE', 'RENTAL') THEN
        RAISE EXCEPTION 'Invalid TransactionType %. Must be SALE or RENTAL.', p_transaction_type;
    END IF;

    -- Mark selected offer as ACCEPTED
    UPDATE OFFER SET Status = 'ACCEPTED' WHERE OfferID = p_offer_id;

    -- Mark competing pending offers for the same listing as REJECTED
    UPDATE OFFER 
    SET Status = 'REJECTED' 
    WHERE ListingID = v_listing_id AND OfferID <> p_offer_id AND Status = 'PENDING';

    -- Create parent TRANSACTION
    INSERT INTO TRANSACTION (ListingID, TransactionDate, TransactionType)
    VALUES (v_listing_id, CURRENT_DATE, p_transaction_type)
    RETURNING TransactionID INTO v_new_transaction_id;

    -- Create subtype record
    IF p_transaction_type = 'SALE' THEN
        IF p_sale_price IS NULL OR p_registration_no IS NULL THEN
            RAISE EXCEPTION 'SalePrice and RegistrationNo are required for SALE transactions.';
        END IF;
        INSERT INTO SALE_TRANSACTION (TransactionID, SalePrice, RegistrationNo)
        VALUES (v_new_transaction_id, p_sale_price, p_registration_no);
    ELSIF p_transaction_type = 'RENTAL' THEN
        IF p_monthly_rent IS NULL OR p_lease_start IS NULL OR p_lease_end IS NULL THEN
            RAISE EXCEPTION 'MonthlyRent, LeaseStartDate, and LeaseEndDate are required for RENTAL contracts.';
        END IF;
        INSERT INTO RENTAL_CONTRACT (TransactionID, MonthlyRent, LeaseStartDate, LeaseEndDate)
        VALUES (v_new_transaction_id, p_monthly_rent, p_lease_start, p_lease_end);
    END IF;

    -- Note: Listing status is automatically updated by trigger trg_auto_close_listing

    RETURN v_new_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Function: Calculate Agent Statistics
CREATE OR REPLACE FUNCTION fn_get_agent_statistics(p_agent_id INT)
RETURNS TABLE (
    total_listings BIGINT,
    active_listings BIGINT,
    sold_listings BIGINT,
    total_sales_volume NUMERIC(16, 2),
    avg_listing_price NUMERIC(14, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(l.ListingID)::BIGINT AS total_listings,
        COUNT(CASE WHEN l.Status = 'ACTIVE' THEN 1 END)::BIGINT AS active_listings,
        COUNT(CASE WHEN l.Status = 'SOLD' THEN 1 END)::BIGINT AS sold_listings,
        COALESCE(SUM(st.SalePrice), 0.00) AS total_sales_volume,
        COALESCE(ROUND(AVG(l.ListPrice), 2), 0.00) AS avg_listing_price
    FROM LISTING l
    LEFT JOIN TRANSACTION t ON l.ListingID = t.ListingID
    LEFT JOIN SALE_TRANSACTION st ON t.TransactionID = st.TransactionID
    WHERE l.AgentID = p_agent_id;
END;
$$ LANGUAGE plpgsql;
