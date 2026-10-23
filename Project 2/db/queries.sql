-- ============================================================================
-- REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
-- File: db/queries.sql
-- Section 8 & 18: Core SQL Demonstrations, Joins, Aggregates, CTEs, & EXPLAIN ANALYZE
-- ============================================================================

-- ============================================================================
-- 1. BASIC CRUD DEMONSTRATIONS
-- ============================================================================

-- Create / Insert new Listing
INSERT INTO LISTING (PropertyID, AgentID, ListPrice, ListedDate, Status)
VALUES (1, 1, 430000.00, CURRENT_DATE, 'ACTIVE');

-- Read single listing with agent and property details
SELECT 
    l.ListingID, l.ListPrice, l.Status,
    p.Description, p.AreaSqFt, pt.TypeName,
    CONCAT(per.FirstName, ' ', per.LastName) AS AgentName
FROM LISTING l
JOIN PROPERTY p ON l.PropertyID = p.PropertyID
JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
JOIN AGENT a ON l.AgentID = a.AgentID
JOIN PERSON per ON a.PersonID = per.PersonID
WHERE l.ListingID = 1;

-- Update listing price
UPDATE LISTING 
SET ListPrice = 415000.00 
WHERE ListingID = 1;

-- Delete an offer
DELETE FROM OFFER 
WHERE OfferID = 999;


-- ============================================================================
-- 2. FIVE-TABLE JOIN (PROPERTY, PROPERTY_TYPE, LISTING, AGENT, PERSON)
-- ============================================================================
SELECT 
    l.ListingID,
    l.ListPrice,
    l.ListedDate,
    l.Status AS ListingStatus,
    p.PropertyID,
    p.AreaSqFt,
    p.Price AS AppraisedValue,
    pt.TypeName AS PropertyCategory,
    a.AgentID,
    CONCAT(per.FirstName, ' ', COALESCE(per.MiddleName || ' ', ''), per.LastName) AS AgentFullName,
    per.Email AS AgentEmail,
    per.PhoneNo AS AgentPhone
FROM LISTING l
INNER JOIN PROPERTY p ON l.PropertyID = p.PropertyID
INNER JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
INNER JOIN AGENT a ON l.AgentID = a.AgentID
INNER JOIN PERSON per ON a.PersonID = per.PersonID
ORDER BY l.ListPrice DESC;


-- ============================================================================
-- 3. AGGREGATE & GROUP BY REPORTS (Section 8 Explicit Requirements)
-- ============================================================================

-- A. Count listings per agent
SELECT 
    a.AgentID,
    CONCAT(per.FirstName, ' ', per.LastName) AS AgentName,
    COUNT(l.ListingID) AS TotalListings,
    COUNT(CASE WHEN l.Status = 'ACTIVE' THEN 1 END) AS ActiveCount,
    COUNT(CASE WHEN l.Status = 'SOLD' THEN 1 END) AS SoldCount
FROM AGENT a
JOIN PERSON per ON a.PersonID = per.PersonID
LEFT JOIN LISTING l ON a.AgentID = l.AgentID
GROUP BY a.AgentID, per.FirstName, per.LastName
ORDER BY TotalListings DESC;

-- B. Average price by property type
SELECT 
    pt.PropertyTypeID,
    pt.TypeName,
    COUNT(p.PropertyID) AS TotalProperties,
    ROUND(AVG(p.Price), 2) AS AveragePropertyPrice,
    ROUND(MIN(p.Price), 2) AS MinimumPrice,
    ROUND(MAX(p.Price), 2) AS MaximumPrice
FROM PROPERTY_TYPE pt
LEFT JOIN PROPERTY p ON pt.PropertyTypeID = p.PropertyTypeID
GROUP BY pt.PropertyTypeID, pt.TypeName
ORDER BY AveragePropertyPrice DESC;

-- C. Total payment settled per transaction
SELECT 
    t.TransactionID,
    t.TransactionType,
    t.TransactionDate,
    l.ListingID,
    CASE 
        WHEN t.TransactionType = 'SALE' THEN st.SalePrice
        WHEN t.TransactionType = 'RENTAL' THEN rc.MonthlyRent
    END AS ContractedAmount,
    COALESCE(SUM(pay.Amount), 0.00) AS TotalPaidSoFar,
    COUNT(pay.PaymentID) AS PaymentInstallmentCount
FROM TRANSACTION t
JOIN LISTING l ON t.ListingID = l.ListingID
LEFT JOIN SALE_TRANSACTION st ON t.TransactionID = st.TransactionID
LEFT JOIN RENTAL_CONTRACT rc ON t.TransactionID = rc.TransactionID
LEFT JOIN PAYMENT pay ON t.TransactionID = pay.TransactionID
GROUP BY t.TransactionID, t.TransactionType, t.TransactionDate, l.ListingID, st.SalePrice, rc.MonthlyRent;

-- D. Offer counts and average offer amount per listing
SELECT 
    l.ListingID,
    l.ListPrice,
    l.Status,
    COUNT(o.OfferID) AS TotalOffersReceived,
    COALESCE(ROUND(AVG(o.OfferAmount), 2), 0.00) AS AverageOfferAmount,
    COALESCE(MAX(o.OfferAmount), 0.00) AS HighestOfferAmount,
    ROUND(l.ListPrice - COALESCE(MAX(o.OfferAmount), 0.00), 2) AS DifferenceFromAskingPrice
FROM LISTING l
LEFT JOIN OFFER o ON l.ListingID = o.ListingID
GROUP BY l.ListingID, l.ListPrice, l.Status
ORDER BY TotalOffersReceived DESC;


-- ============================================================================
-- 4. ADVANCED SQL: CTE & WINDOW FUNCTIONS
-- ============================================================================

-- CTE: Rank offers per listing using DENSE_RANK()
WITH RankedOffers AS (
    SELECT 
        o.OfferID,
        o.ListingID,
        o.CustomerID,
        CONCAT(per.FirstName, ' ', per.LastName) AS CustomerName,
        o.OfferAmount,
        o.OfferDate,
        DENSE_RANK() OVER (PARTITION BY o.ListingID ORDER BY o.OfferAmount DESC) as OfferRank
    FROM OFFER o
    JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
    JOIN PERSON per ON c.PersonID = per.PersonID
)
SELECT * FROM RankedOffers WHERE OfferRank <= 3;


-- ============================================================================
-- 5. MULTI-TABLE ATOMIC SQL TRANSACTION (BEGIN / COMMIT / ROLLBACK)
-- Demonstrating Offer Acceptance -> Transaction Creation -> Subtype Creation
-- ============================================================================
BEGIN;

-- 1. Lock and fetch offer details
SELECT OfferID, ListingID, CustomerID, OfferAmount 
FROM OFFER 
WHERE OfferID = 1 FOR UPDATE;

-- 2. Accept this offer
UPDATE OFFER 
SET Status = 'ACCEPTED' 
WHERE OfferID = 1;

-- 3. Reject competing pending offers on the same listing
UPDATE OFFER 
SET Status = 'REJECTED' 
WHERE ListingID = 1 AND OfferID <> 1 AND Status = 'PENDING';

-- 4. Create TRANSACTION record
INSERT INTO TRANSACTION (ListingID, TransactionDate, TransactionType)
VALUES (1, CURRENT_DATE, 'SALE');

-- 5. Create SALE_TRANSACTION subtype row using the generated TransactionID
INSERT INTO SALE_TRANSACTION (TransactionID, SalePrice, RegistrationNo)
VALUES (CURRVAL('transaction_transactionid_seq'), 410000.00, 'REG-DEMO-2024-001');

-- (Trigger automatically sets LISTING.Status = 'SOLD')

COMMIT;


-- ============================================================================
-- 6. EXPLAIN ANALYZE PROFILING (Before vs After Index Demonstration)
-- ============================================================================

-- Browse query with price filtering and status sorting:
EXPLAIN ANALYZE
SELECT 
    l.ListingID, l.ListPrice, l.ListedDate, p.AreaSqFt, pt.TypeName
FROM LISTING l
JOIN PROPERTY p ON l.PropertyID = p.PropertyID
JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
WHERE l.Status = 'ACTIVE' 
  AND l.ListPrice BETWEEN 300000 AND 900000
ORDER BY l.ListedDate DESC;
