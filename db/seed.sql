-- ============================================================================
-- REAL ESTATE PROPERTY LISTING & MANAGEMENT SYSTEM
-- File: db/seed.sql
-- Realistic Demo Data satisfying all PK/FK/CHECK constraints across 13 tables
-- Default test password for seeded users: "password123"
-- Bcrypt Hash: $2b$10$eO1v0d8N8VwU1jJb.Ue1x.6Gf5W7b6c7Qj.xG9bI9yZ5kG1X7bYmC
-- ============================================================================

-- Clean out tables in reverse dependency order
TRUNCATE TABLE REVIEW, PAYMENT, RENTAL_CONTRACT, SALE_TRANSACTION, TRANSACTION, OFFER, LISTING, OWNERSHIP, PROPERTY, PROPERTY_TYPE, AGENT, CUSTOMER, PERSON RESTART IDENTITY CASCADE;

-- 1. SEED PERSONS (Customers, Agents)
-- bcrypt hash for 'password123': $2b$10$epR3Y0pU85dI647xP9qjV.iFw72vY/f1jZ4Hn1tJ1c6t4kRzW8q2m
INSERT INTO PERSON (PersonID, FirstName, MiddleName, LastName, Email, PhoneNo, DateOfBirth, PasswordHash) VALUES
(1, 'Alice', 'Marie', 'Smith', 'alice.smith@example.com', '+1-555-0101', '1985-04-12', '$2b$10$epR3Y0pU85dI647xP9qjV.iFw72vY/f1jZ4Hn1tJ1c6t4kRzW8q2m'),
(2, 'Bob', 'Edward', 'Johnson', 'bob.johnson@example.com', '+1-555-0102', '1990-08-23', '$2b$10$epR3Y0pU85dI647xP9qjV.iFw72vY/f1jZ4Hn1tJ1c6t4kRzW8q2m'),
(3, 'Charlie', NULL, 'Williams', 'charlie.w@example.com', '+1-555-0103', '1978-12-05', '$2b$10$epR3Y0pU85dI647xP9qjV.iFw72vY/f1jZ4Hn1tJ1c6t4kRzW8q2m'),
(4, 'Diana', 'Rose', 'Davis', 'diana.davis@example.com', '+1-555-0104', '1995-02-18', '$2b$10$epR3Y0pU85dI647xP9qjV.iFw72vY/f1jZ4Hn1tJ1c6t4kRzW8q2m'),
(5, 'Ethan', 'Blake', 'Miller', 'ethan.realtor@example.com', '+1-555-0201', '1982-11-30', '$2b$10$epR3Y0pU85dI647xP9qjV.iFw72vY/f1jZ4Hn1tJ1c6t4kRzW8q2m'),
(6, 'Fiona', 'Grace', 'Clark', 'fiona.clark@example.com', '+1-555-0202', '1988-06-14', '$2b$10$epR3Y0pU85dI647xP9qjV.iFw72vY/f1jZ4Hn1tJ1c6t4kRzW8q2m');

SELECT setval('person_personid_seq', (SELECT MAX(PersonID) FROM PERSON));

-- 2. SEED CUSTOMERS (1:1 with Person 1, 2, 3, 4)
INSERT INTO CUSTOMER (CustomerID, PersonID) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

SELECT setval('customer_customerid_seq', (SELECT MAX(CustomerID) FROM CUSTOMER));

-- 3. SEED AGENTS (1:1 with Person 5, 6)
INSERT INTO AGENT (AgentID, PersonID) VALUES
(1, 5),
(2, 6);

SELECT setval('agent_agentid_seq', (SELECT MAX(AgentID) FROM AGENT));

-- 4. SEED PROPERTY_TYPE
INSERT INTO PROPERTY_TYPE (PropertyTypeID, TypeName) VALUES
(1, 'Apartment'),
(2, 'Single Family Home'),
(3, 'Luxury Villa'),
(4, 'Commercial Office'),
(5, 'Penthouse');

SELECT setval('property_type_propertytypeid_seq', (SELECT MAX(PropertyTypeID) FROM PROPERTY_TYPE));

-- 5. SEED PROPERTY
INSERT INTO PROPERTY (PropertyID, AreaSqFt, Price, Description, PropertyTypeID) VALUES
(1, 1450.00, 420000.00, 'Modern 2-bedroom downtown apartment with floor-to-ceiling windows and balcony.', 1),
(2, 2800.50, 750000.00, 'Spacious suburban 4-bedroom house with backyard, pool, and two-car garage.', 2),
(3, 4500.00, 1850000.00, 'Ultra-luxury sea-view villa with private infinity pool and smart home automation.', 3),
(4, 2100.00, 620000.00, 'Prime commercial office space in financial district with high-speed fiber connectivity.', 4),
(5, 3200.00, 1250000.00, 'Top-floor duplex penthouse with 360-degree panoramic skyline views.', 5);

SELECT setval('property_propertyid_seq', (SELECT MAX(PropertyID) FROM PROPERTY));

-- 6. SEED OWNERSHIP (Composite key CustomerID, PropertyID)
-- Property 1 owned 100% by Alice (Customer 1)
-- Property 2 co-owned 60% / 40% by Bob (Customer 2) and Charlie (Customer 3)
-- Property 3 owned 100% by Charlie (Customer 3)
-- Property 4 owned 100% by Diana (Customer 4)
-- Property 5 owned 100% by Alice (Customer 1)
INSERT INTO OWNERSHIP (CustomerID, PropertyID, OwnershipShare, SinceDate) VALUES
(1, 1, 100.00, '2021-03-15'),
(2, 2, 60.00, '2020-07-20'),
(3, 2, 40.00, '2020-07-20'),
(4, 4, 100.00, '2022-01-10'),
(3, 3, 100.00, '2019-11-05'),
(1, 5, 100.00, '2023-05-18');

-- 7. SEED LISTINGS (Managed by Agents 1 & 2)
INSERT INTO LISTING (ListingID, PropertyID, AgentID, ListPrice, ListedDate, Status) VALUES
(1, 1, 1, 425000.00, '2024-01-15', 'ACTIVE'),
(2, 2, 1, 745000.00, '2024-02-01', 'ACTIVE'),
(3, 3, 2, 1800000.00, '2023-12-10', 'SOLD'),
(4, 4, 2, 3500.00, '2024-03-01', 'RENTED'),
(5, 5, 1, 1200000.00, '2024-03-10', 'ACTIVE');

SELECT setval('listing_listingid_seq', (SELECT MAX(ListingID) FROM LISTING));

-- 8. SEED OFFERS
INSERT INTO OFFER (OfferID, CustomerID, ListingID, OfferAmount, OfferDate, Status) VALUES
(1, 2, 1, 410000.00, '2024-01-20 10:30:00+00', 'PENDING'),
(2, 3, 1, 420000.00, '2024-01-22 14:15:00+00', 'PENDING'),
(3, 4, 2, 730000.00, '2024-02-10 09:00:00+00', 'PENDING'),
(4, 1, 3, 1800000.00, '2024-01-05 16:45:00+00', 'ACCEPTED');

SELECT setval('offer_offerid_seq', (SELECT MAX(OfferID) FROM OFFER));

-- 9. SEED TRANSACTIONS
-- Transaction 1: Sale of Listing 3 (Villa)
-- Transaction 2: Rental of Listing 4 (Commercial Office)
INSERT INTO TRANSACTION (TransactionID, ListingID, TransactionDate, TransactionType) VALUES
(1, 3, '2024-01-15', 'SALE'),
(2, 4, '2024-03-05', 'RENTAL');

SELECT setval('transaction_transactionid_seq', (SELECT MAX(TransactionID) FROM TRANSACTION));

-- 10. SEED SALE_TRANSACTION (1:1 subtype for Transaction 1)
INSERT INTO SALE_TRANSACTION (TransactionID, SalePrice, RegistrationNo) VALUES
(1, 1800000.00, 'REG-2024-VILLA-0091');

-- 11. SEED RENTAL_CONTRACT (1:1 subtype for Transaction 2)
INSERT INTO RENTAL_CONTRACT (TransactionID, MonthlyRent, LeaseStartDate, LeaseEndDate) VALUES
(2, 3500.00, '2024-04-01', '2025-03-31');

-- 12. SEED PAYMENTS
-- Transaction 1 settled in 2 installments
-- Transaction 2 advance deposit payment
INSERT INTO PAYMENT (PaymentID, TransactionID, Amount, PaymentDate, PaymentMode, ReferenceNo) VALUES
(1, 1, 500000.00, '2024-01-16 11:00:00+00', 'BANK_TRANSFER', 'TXN-PAY-20240116-001'),
(2, 1, 1300000.00, '2024-01-25 15:30:00+00', 'ESCROW_WIRE', 'TXN-PAY-20240125-002'),
(3, 2, 7000.00, '2024-03-06 10:15:00+00', 'CREDIT_CARD', 'TXN-PAY-20240306-003');

SELECT setval('payment_paymentid_seq', (SELECT MAX(PaymentID) FROM PAYMENT));

-- 13. SEED REVIEWS
INSERT INTO REVIEW (ReviewID, CustomerID, ListingID, ReviewDate, Rating, Comment) VALUES
(1, 1, 3, '2024-01-28 12:00:00+00', 5, 'Exquisite property! The closing process with Agent Fiona was seamless and transparent.'),
(2, 4, 4, '2024-03-10 14:20:00+00', 4, 'Great location for our business. Clean handover and responsive management.'),
(3, 2, 1, '2024-01-25 09:30:00+00', 4, 'Visited during the open house. Lovely layout and lighting, great neighborhood.');

SELECT setval('review_reviewid_seq', (SELECT MAX(ReviewID) FROM REVIEW));
