-- ============================================================================
-- REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
-- File: db/views.sql
-- Database Views for Browse and Reporting
-- ============================================================================

-- 1. Non-Trivial Browse View: active_listings_full
-- Recommended in Section 7.1 / Section 8 for browse and listing inspection endpoints.
-- Joins LISTING, PROPERTY, PROPERTY_TYPE, AGENT, and PERSON.
CREATE OR REPLACE VIEW active_listings_full AS
SELECT 
    l.ListingID,
    l.ListPrice,
    l.ListedDate,
    l.Status AS ListingStatus,
    p.PropertyID,
    p.AreaSqFt,
    p.Price AS PropertyOriginalPrice,
    p.Description AS PropertyDescription,
    pt.PropertyTypeID,
    pt.TypeName AS PropertyType,
    a.AgentID,
    per.PersonID AS AgentPersonID,
    per.FirstName AS AgentFirstName,
    per.LastName AS AgentLastName,
    CONCAT(per.FirstName, ' ', per.LastName) AS AgentFullName,
    per.Email AS AgentEmail,
    per.PhoneNo AS AgentPhone,
    COALESCE(COUNT(DISTINCT r.ReviewID), 0) AS TotalReviews,
    COALESCE(ROUND(AVG(r.Rating), 2), 0.00) AS AverageRating,
    COALESCE(COUNT(DISTINCT o.OfferID), 0) AS TotalOffersCount
FROM LISTING l
JOIN PROPERTY p ON l.PropertyID = p.PropertyID
JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
JOIN AGENT a ON l.AgentID = a.AgentID
JOIN PERSON per ON a.PersonID = per.PersonID
LEFT JOIN REVIEW r ON l.ListingID = r.ListingID
LEFT JOIN OFFER o ON l.ListingID = o.ListingID
WHERE l.Status = 'ACTIVE'
GROUP BY 
    l.ListingID, l.ListPrice, l.ListedDate, l.Status,
    p.PropertyID, p.AreaSqFt, p.Price, p.Description,
    pt.PropertyTypeID, pt.TypeName,
    a.AgentID, per.PersonID, per.FirstName, per.LastName, per.Email, per.PhoneNo;

-- 2. Reporting View: agent_performance_summary
-- Aggregates listings, active offers, completed transactions, and total sales volume per agent.
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
    a.AgentID,
    CONCAT(per.FirstName, ' ', per.LastName) AS AgentName,
    per.Email AS AgentEmail,
    COUNT(DISTINCT l.ListingID) AS TotalListingsCount,
    COUNT(DISTINCT CASE WHEN l.Status = 'ACTIVE' THEN l.ListingID END) AS ActiveListingsCount,
    COUNT(DISTINCT CASE WHEN l.Status = 'SOLD' THEN l.ListingID END) AS SoldListingsCount,
    COUNT(DISTINCT CASE WHEN l.Status = 'RENTED' THEN l.ListingID END) AS RentedListingsCount,
    COUNT(DISTINCT t.TransactionID) AS CompletedTransactionsCount,
    COALESCE(SUM(st.SalePrice), 0.00) AS TotalSalesVolume
FROM AGENT a
JOIN PERSON per ON a.PersonID = per.PersonID
LEFT JOIN LISTING l ON a.AgentID = l.AgentID
LEFT JOIN TRANSACTION t ON l.ListingID = t.ListingID
LEFT JOIN SALE_TRANSACTION st ON t.TransactionID = st.TransactionID
GROUP BY a.AgentID, per.FirstName, per.LastName, per.Email;

-- 3. Reporting View: property_ownership_summary
-- Summarizes all owners and percentage shares for every property.
CREATE OR REPLACE VIEW property_ownership_summary AS
SELECT 
    p.PropertyID,
    pt.TypeName AS PropertyType,
    p.Price,
    p.AreaSqFt,
    COALESCE(SUM(o.OwnershipShare), 0.00) AS TotalRegisteredShare,
    COUNT(o.CustomerID) AS TotalOwnersCount,
    STRING_AGG(CONCAT(per.FirstName, ' ', per.LastName, ' (', o.OwnershipShare, '%)'), ', ') AS OwnersList
FROM PROPERTY p
JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
LEFT JOIN OWNERSHIP o ON p.PropertyID = o.PropertyID
LEFT JOIN CUSTOMER c ON o.CustomerID = c.CustomerID
LEFT JOIN PERSON per ON c.PersonID = per.PersonID
GROUP BY p.PropertyID, pt.TypeName, p.Price, p.AreaSqFt;
