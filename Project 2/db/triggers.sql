-- ============================================================================
-- REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
-- File: db/triggers.sql
-- Section 7.1 & Section 8: Database Triggers for Business Integrity
-- ============================================================================

-- ============================================================================
-- 1. TRIGGER: Enforce Exclusive Transaction Subtype (SALE vs RENTAL)
-- ============================================================================

-- Function to check SALE_TRANSACTION exclusivity
CREATE OR REPLACE FUNCTION fn_check_sale_transaction_subtype()
RETURNS TRIGGER AS $$
DECLARE
    v_trans_type VARCHAR(20);
    v_rental_exists BOOLEAN;
BEGIN
    -- Check TransactionType from parent TRANSACTION table
    SELECT TransactionType INTO v_trans_type
    FROM TRANSACTION
    WHERE TransactionID = NEW.TransactionID;

    IF v_trans_type IS NULL THEN
        RAISE EXCEPTION 'Transaction ID % does not exist.', NEW.TransactionID;
    END IF;

    IF v_trans_type <> 'SALE' THEN
        RAISE EXCEPTION 'Cannot insert into SALE_TRANSACTION: Parent Transaction % has TransactionType ''%'', expected ''SALE''.',
            NEW.TransactionID, v_trans_type;
    END IF;

    -- Check if record already exists in RENTAL_CONTRACT
    SELECT EXISTS (
        SELECT 1 FROM RENTAL_CONTRACT WHERE TransactionID = NEW.TransactionID
    ) INTO v_rental_exists;

    IF v_rental_exists THEN
        RAISE EXCEPTION 'Exclusive subtype violation: Transaction % already exists as a RENTAL_CONTRACT.', NEW.TransactionID;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_sale_subtype ON SALE_TRANSACTION;
CREATE TRIGGER trg_check_sale_subtype
BEFORE INSERT OR UPDATE ON SALE_TRANSACTION
FOR EACH ROW EXECUTE FUNCTION fn_check_sale_transaction_subtype();

-- Function to check RENTAL_CONTRACT exclusivity
CREATE OR REPLACE FUNCTION fn_check_rental_contract_subtype()
RETURNS TRIGGER AS $$
DECLARE
    v_trans_type VARCHAR(20);
    v_sale_exists BOOLEAN;
BEGIN
    SELECT TransactionType INTO v_trans_type
    FROM TRANSACTION
    WHERE TransactionID = NEW.TransactionID;

    IF v_trans_type IS NULL THEN
        RAISE EXCEPTION 'Transaction ID % does not exist.', NEW.TransactionID;
    END IF;

    IF v_trans_type <> 'RENTAL' THEN
        RAISE EXCEPTION 'Cannot insert into RENTAL_CONTRACT: Parent Transaction % has TransactionType ''%'', expected ''RENTAL''.',
            NEW.TransactionID, v_trans_type;
    END IF;

    -- Check if record already exists in SALE_TRANSACTION
    SELECT EXISTS (
        SELECT 1 FROM SALE_TRANSACTION WHERE TransactionID = NEW.TransactionID
    ) INTO v_sale_exists;

    IF v_sale_exists THEN
        RAISE EXCEPTION 'Exclusive subtype violation: Transaction % already exists as a SALE_TRANSACTION.', NEW.TransactionID;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_rental_subtype ON RENTAL_CONTRACT;
CREATE TRIGGER trg_check_rental_subtype
BEFORE INSERT OR UPDATE ON RENTAL_CONTRACT
FOR EACH ROW EXECUTE FUNCTION fn_check_rental_contract_subtype();


-- ============================================================================
-- 2. TRIGGER: Auto-Update Listing Status on Transaction Creation
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_auto_close_listing_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.TransactionType = 'SALE' THEN
        UPDATE LISTING 
        SET Status = 'SOLD' 
        WHERE ListingID = NEW.ListingID;
    ELSIF NEW.TransactionType = 'RENTAL' THEN
        UPDATE LISTING 
        SET Status = 'RENTED' 
        WHERE ListingID = NEW.ListingID;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_close_listing ON TRANSACTION;
CREATE TRIGGER trg_auto_close_listing
AFTER INSERT ON TRANSACTION
FOR EACH ROW EXECUTE FUNCTION fn_auto_close_listing_on_transaction();


-- ============================================================================
-- 3. TRIGGER: Prevent Total Ownership Share Exceeding 100% per Property
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_validate_ownership_total_share()
RETURNS TRIGGER AS $$
DECLARE
    v_current_total NUMERIC(7, 2);
BEGIN
    SELECT COALESCE(SUM(OwnershipShare), 0.00)
    INTO v_current_total
    FROM OWNERSHIP
    WHERE PropertyID = NEW.PropertyID
      AND (TG_OP = 'INSERT' OR CustomerID <> OLD.CustomerID);

    IF (v_current_total + NEW.OwnershipShare) > 100.00 THEN
        RAISE EXCEPTION 'Total ownership share for Property % exceeds 100%%. Current total: %, Attempted to add: %',
            NEW.PropertyID, v_current_total, NEW.OwnershipShare;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_ownership_share ON OWNERSHIP;
CREATE TRIGGER trg_validate_ownership_share
BEFORE INSERT OR UPDATE ON OWNERSHIP
FOR EACH ROW EXECUTE FUNCTION fn_validate_ownership_total_share();
