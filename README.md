# Monolith — Real Estate DBMS & Spatial Architecture Platform

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r182-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

An enterprise-grade, relational real estate management system and luxury spatial monograph platform. Designed with **PostgreSQL 15+** parameterized raw SQL repositories, an **Express.js** layered REST API, and a 3D architectural magazine editorial frontend built in **React 19**, **Three.js**, and **Tailwind CSS**.

The system implements **13 relations normalized to Boyce-Codd Normal Form (BCNF)**, **14 EER cardinalities**, cascading referential integrity, database triggers, views, stored functions, multi-table atomic transactions, and dedicated portals for **Patrons (Buyers/Clients)** and **Ateliers (Brokers/Agents)**.

---

## Table of Contents

1. [Executive Overview & Design Philosophy](#1-executive-overview--design-philosophy)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Enhanced Entity-Relationship (EER) Model](#3-enhanced-entity-relationship-eer-model)
4. [Granular 13-Relation Relational Schema & BCNF Specifications](#4-granular-13-relation-relational-schema--bcnf-specifications)
5. [Database Advanced Logic (Triggers, Views, Functions & Indexes)](#5-database-advanced-logic-triggers-views-functions--indexes)
6. [Multi-Table Atomic Transaction Cascade](#6-multi-table-atomic-transaction-cascade)
7. [Frontend Role Portals & Interactive Interfaces](#7-frontend-role-portals--interactive-interfaces)
8. [Complete REST API Reference](#8-complete-rest-api-reference)
9. [Automated Pre-Seeding & Demonstration Dataset](#9-automated-pre-seeding--demonstration-dataset)
10. [Step-by-Step Production Deployment Guide](#10-step-by-step-production-deployment-guide)
11. [Environment Variables Dictionary](#11-environment-variables-dictionary)
12. [Project Directory Tree & File Inventory](#12-project-directory-tree--file-inventory)

---

## 1. Executive Overview & Design Philosophy

### Architectural Magazine Aesthetic
Unlike conventional commercial SaaS templates with saturated purple gradients and generic dashboard cards, Monolith is inspired by elite European architectural monographs (*El Croquis*, *Detail*, *C3*):
* **Palette**: Warm limestone (`#D8D2C6` / `#D5CEC3`), cast concrete (`#BFC5C9` / `#C7CCD1`), deep basalt charcoal (`#1A1C1E`), and muted ivory (`#F4F1EA`).
* **Typography**: Structural display headlines in `Anton`, editorial titling in `Syne`, body text in `Inter`, and cryptographic hashes, notary deed numbers, and valuations in `JetBrains Mono`.
* **Micro-Interactions**: Real-time film-grain noise overlay, 360° orbital WebGL villa rendering, daylight/dusk lighting toggles, 3D perspective tilt cards with specular reflection sheens, and 2-finger horizontal trackpad scrolling.

### Engineering & Database Philosophy
* **Zero-ORM Policy**: Built entirely without ORM abstraction layers (no Prisma, Sequelize, or TypeORM). All queries are written in raw, parameterized SQL using `node-postgres` (`pg-pool`) to guarantee auditable query plans, lock discipline, and explicit relational algebra.
* **Architectural Layering**: Strict unidirectional dependency flow:
  $$\text{Client (React / Three.js)} \longrightarrow \text{Routes} \longrightarrow \text{Controllers} \longrightarrow \text{Services} \longrightarrow \text{Repositories (DAO)} \longrightarrow \text{PostgreSQL Connection Pool}$$
* **Database-Enforced Invariants**: Business rules are enforced at the database engine level through `CHECK` constraints, foreign key cascades, and procedural triggers rather than relying solely on client-side validation.

---

## 2. End-to-End System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER (React 19 / Vite)                              │
│                                                                                         │
│   ┌───────────────────────────┐ ┌───────────────────────────┐ ┌──────────────────────┐  │
│   │ 3D Spatial Hero Monograph │ │ Patron Portal             │ │ Atelier Portal       │  │
│   │ Three.js / WebGL / Canvas │ │ (Tenders, Deeds, Escrow)  │ │ (Inventory, Atomic)  │  │
│   └─────────────┬─────────────┘ └─────────────┬─────────────┘ └──────────┬───────────┘  │
│                 │                             │                          │              │
│                 └─────────────────────────────┼──────────────────────────┘              │
│                                               ▼                                         │
│                                   Unified API Client (api.ts)                           │
│                     (Live Fetch API + In-Memory Fallback State Sync)                    │
└───────────────────────────────────────────────┬─────────────────────────────────────────┘
                                                │ (HTTP / REST / JSON / Bearer JWT)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                       APPLICATION & SERVICE TIER (Node.js / Express)                    │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Central API Router (backend/src/routes/index.js)                                │   │
│   │ [/api/auth, /api/properties, /api/listings, /api/offers, /api/transactions, ...]│   │
│   └──────────────────────────────────────────┬──────────────────────────────────────┘   │
│                                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Controllers Layer (backend/src/controllers/)                                    │   │
│   │ Request validation, query param parsing, payload sanitization, HTTP status codes │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────┘   │
│                                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Services Layer (backend/src/services/)                                          │   │
│   │ Atomic transaction orchestration, business invariant checks, bcrypt hashing     │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────┘   │
│                                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │ 13 Repositories / DAOs (backend/src/repositories/)                              │   │
│   │ Raw parameterized SQL statements with node-postgres connection pool ($1, $2, ...)│  │
│   └──────────────────────────────────────────┬──────────────────────────────────────┘   │
└───────────────────────────────────────────────┼─────────────────────────────────────────┘
                                                │ (Raw SQL / TCP / SSL)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE TIER (PostgreSQL 15+)                             │
│                                                                                         │
│   ┌─────────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐   │
│   │ 13 BCNF Relations           │  │ Stored Functions        │  │ Procedural        │   │
│   │ Composite Keys, PKs & FKs   │  │ (fn_accept_offer, etc.) │  │ Triggers (4)      │   │
│   └──────────────┬──────────────┘  └────────────┬────────────┘  └─────────┬─────────┘   │
│                  │                              │                         │             │
│                  ▼                              ▼                         ▼             │
│   ┌─────────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐   │
│   │ B-Tree Search Indexes       │  │ Materialized & Rel      │  │ Integrity CHECKs  │   │
│   │ (Filter, Foreign Key, Sort) │  │ Views (3 Reports)       │  │ & Unique Rules    │   │
│   └─────────────────────────────┘  └─────────────────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Enhanced Entity-Relationship (EER) Model

The database captures **13 relations** and **14 cardinalities**, strictly enforcing ISA specialization hierarchies, composite junction associations, and exclusive transaction subtypes:

```
                       ┌─────────────────────────┐
                       │         PERSON          │
                       │ (Identity, Auth, Names) │
                       └────────────┬────────────┘
                                    │ (ISA Specialization 1:1)
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
           ┌───────────────────┐         ┌───────────────────┐
           │     CUSTOMER      │         │       AGENT       │
           │  (Patron Portal)  │         │ (Atelier Portal)  │
           └─────────┬─────────┘         └─────────┬─────────┘
                     │                             │
        ┌────────────┼────────────┐                │
        │ (Owns N:M) │ (Submits)  │ (Reviews)      │ (Consigns/Represents)
        ▼            ▼            ▼                ▼
  ┌───────────┐ ┌─────────┐ ┌──────────┐     ┌───────────┐
  │ OWNERSHIP │ │  OFFER  │ │  REVIEW  │     │  LISTING  │◄───┐
  └─────┬─────┘ └────┬────┘ └────┬─────┘     └─────┬─────┘    │
        │            │           │                 │          │
        │            └─────┬─────┴─────────────────┘          │
        │                  │                                  │
        ▼                  ▼ (Accept Offer: Atomic Sale)      │
  ┌───────────┐     ┌─────────────┐                           │
  │ PROPERTY  │     │ TRANSACTION │───────────────────────────┘
  └─────┬─────┘     └──────┬──────┘
        │                  │ (ISA Exclusive Subtypes)
        ▼                  ├────────────────────────┐
  ┌───────────────┐        ▼                        ▼
  │ PROPERTY_TYPE │ ┌──────────────────┐ ┌───────────────────┐
  └───────────────┘ │ SALE_TRANSACTION │ │  RENTAL_CONTRACT  │
                    └────────┬─────────┘ └─────────┬─────────┘
                             │                     │
                             └──────────┬──────────┘
                                        ▼ (1:N Payments)
                                   ┌─────────┐
                                   │ PAYMENT │
                                   └─────────┘
```

### Relational Cardinality & Participation Matrix

| Entity A | Relationship | Cardinality | Entity B | Participation | Enforcement Mechanism |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `PERSON` | Subtyped into | 1:1 | `CUSTOMER` | Optional (A) / Mandatory (B) | FK `CUSTOMER.PersonID` with `UNIQUE` |
| `PERSON` | Subtyped into | 1:1 | `AGENT` | Optional (A) / Mandatory (B) | FK `AGENT.PersonID` with `UNIQUE` |
| `PROPERTY_TYPE` | Categorizes | 1:N | `PROPERTY` | Mandatory (A) / Mandatory (B) | FK `PROPERTY.PropertyTypeID` |
| `CUSTOMER` | Owns title in | N:M | `PROPERTY` | Optional (A) / Mandatory (B) | Junction table `OWNERSHIP(CustomerID, PropertyID)` |
| `AGENT` | Represents | 1:N | `LISTING` | Optional (A) / Mandatory (B) | FK `LISTING.AgentID` |
| `PROPERTY` | Listed as | 1:N | `LISTING` | Optional (A) / Mandatory (B) | FK `LISTING.PropertyID` |
| `CUSTOMER` | Submits | 1:N | `OFFER` | Optional (A) / Mandatory (B) | FK `OFFER.CustomerID` |
| `LISTING` | Receives | 1:N | `OFFER` | Optional (A) / Mandatory (B) | FK `OFFER.ListingID` |
| `LISTING` | Settles in | 1:N | `TRANSACTION` | Optional (A) / Mandatory (B) | FK `TRANSACTION.ListingID` |
| `TRANSACTION` | Specializes as | 1:1 | `SALE_TRANSACTION`| Optional (A) / Mandatory (B) | Trigger `trg_check_sale_subtype` |
| `TRANSACTION` | Specializes as | 1:1 | `RENTAL_CONTRACT` | Optional (A) / Mandatory (B) | Trigger `trg_check_rental_subtype` |
| `TRANSACTION` | Settled by | 1:N | `PAYMENT` | Mandatory (A) / Mandatory (B) | FK `PAYMENT.TransactionID` |
| `CUSTOMER` | Authors | 1:N | `REVIEW` | Optional (A) / Mandatory (B) | FK `REVIEW.CustomerID` |
| `LISTING` | Subject of | 1:N | `REVIEW` | Optional (A) / Mandatory (B) | FK `REVIEW.ListingID` |

---

## 4. Granular 13-Relation Relational Schema & BCNF Specifications

Every relation was audited to confirm compliance with **Boyce-Codd Normal Form (BCNF)**: for every non-trivial functional dependency $X \rightarrow Y$, $X$ is a superkey.

### 4.1 `PERSON`
Holds the root identity for all users (customers and agents alike).
```sql
CREATE TABLE PERSON (
    PersonID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    MiddleName VARCHAR(50),
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PhoneNo VARCHAR(20) UNIQUE NOT NULL,
    DateOfBirth DATE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
* **Keys**: Primary Key `{PersonID}`, Candidate Key `{Email}`, Candidate Key `{PhoneNo}`.
* **Derived Attribute Elimination**: As required by database normalization, `Age` is **not stored** to avoid the transitive dependency `PersonID` &rarr; `DateOfBirth` &rarr; `Age`. It is computed dynamically:
  ```sql
  Age = EXTRACT(YEAR FROM AGE(CURRENT_DATE, DateOfBirth))
  ```
* **BCNF Evaluation**: Determinants `{PersonID}`, `{Email}`, and `{PhoneNo}` are all superkeys. Status: **BCNF**.

### 4.2 `CUSTOMER` (ISA Subtype)
Represents prospective and deeded property buyers/renters (Patrons).
```sql
CREATE TABLE CUSTOMER (
    CustomerID SERIAL PRIMARY KEY,
    PersonID INT UNIQUE NOT NULL REFERENCES PERSON(PersonID) ON DELETE CASCADE
);
```
* **Keys**: Primary Key `{CustomerID}`, Candidate Key `{PersonID}`.
* **BCNF Evaluation**: Simple single-attribute keys. Both determinants are candidate keys. Status: **BCNF**.

### 4.3 `AGENT` (ISA Subtype)
Represents licensed real estate brokers and consignment curation specialists (Atelier).
```sql
CREATE TABLE AGENT (
    AgentID SERIAL PRIMARY KEY,
    PersonID INT UNIQUE NOT NULL REFERENCES PERSON(PersonID) ON DELETE CASCADE
);
```
* **Keys**: Primary Key `{AgentID}`, Candidate Key `{PersonID}`.
* **BCNF Evaluation**: Both determinants are superkeys. Status: **BCNF**.

### 4.4 `PROPERTY_TYPE` (Catalog Lookup)
Lookup catalog defining architectural categorizations to prevent string anomalies.
```sql
CREATE TABLE PROPERTY_TYPE (
    PropertyTypeID SERIAL PRIMARY KEY,
    TypeName VARCHAR(50) UNIQUE NOT NULL
);
```
* **Keys**: Primary Key `{PropertyTypeID}`, Candidate Key `{TypeName}`.
* **BCNF Evaluation**: Fully independent 2-column catalog. Status: **BCNF**.

### 4.5 `PROPERTY` (Physical Asset)
Physical structural asset detached from market listings to eliminate transitive update anomalies.
```sql
CREATE TABLE PROPERTY (
    PropertyID SERIAL PRIMARY KEY,
    AreaSqFt NUMERIC(10,2) NOT NULL CHECK (AreaSqFt > 0),
    Price NUMERIC(14,2) NOT NULL CHECK (Price > 0),
    Description TEXT NOT NULL,
    PropertyTypeID INT NOT NULL REFERENCES PROPERTY_TYPE(PropertyTypeID) ON DELETE RESTRICT
);
```
* **Keys**: Primary Key `{PropertyID}`.
* **BCNF Evaluation**: All non-prime attributes functionally depend solely on `{PropertyID}`. Status: **BCNF**.

### 4.6 `OWNERSHIP` (N:M Associative Junction)
Tracks sovereign title deeds, co-ownership percentages, and deed acquisition dates.
```sql
CREATE TABLE OWNERSHIP (
    CustomerID INT NOT NULL REFERENCES CUSTOMER(CustomerID) ON DELETE CASCADE,
    PropertyID INT NOT NULL REFERENCES PROPERTY(PropertyID) ON DELETE CASCADE,
    OwnershipShare NUMERIC(5,2) NOT NULL CHECK (OwnershipShare > 0 AND OwnershipShare <= 100),
    SinceDate DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (CustomerID, PropertyID)
);
```
* **Keys**: Composite Primary Key `{(CustomerID, PropertyID)}`.
* **BCNF Evaluation**: Neither `CustomerID` nor `PropertyID` alone determines `OwnershipShare` or `SinceDate`. Full functional dependency holds across the composite candidate key. Status: **BCNF**.

### 4.7 `LISTING` (Agent-Property Consignment)
Market listing consignment associating a property with a managing agent.
```sql
CREATE TABLE LISTING (
    ListingID SERIAL PRIMARY KEY,
    PropertyID INT NOT NULL REFERENCES PROPERTY(PropertyID) ON DELETE CASCADE,
    AgentID INT NOT NULL REFERENCES AGENT(AgentID) ON DELETE RESTRICT,
    ListPrice NUMERIC(14,2) NOT NULL CHECK (ListPrice > 0),
    ListedDate DATE NOT NULL DEFAULT CURRENT_DATE,
    Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (Status IN ('ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'INACTIVE'))
);
```
* **Keys**: Primary Key `{ListingID}`.
* **BCNF Evaluation**: Holds only FK references to `PROPERTY` and `AGENT`, preventing agent contact details or property square footage from causing transitive dependencies. Status: **BCNF**.

### 4.8 `OFFER` (Acquisition Tender)
Formal purchase tenders submitted by a customer on a listing.
```sql
CREATE TABLE OFFER (
    OfferID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL REFERENCES CUSTOMER(CustomerID) ON DELETE CASCADE,
    ListingID INT NOT NULL REFERENCES LISTING(ListingID) ON DELETE CASCADE,
    OfferAmount NUMERIC(14,2) NOT NULL CHECK (OfferAmount > 0),
    OfferDate TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (Status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'))
);
```
* **Keys**: Primary Key `{OfferID}`.
* **BCNF Evaluation**: Non-prime attributes depend exclusively on the single-attribute key `{OfferID}`. Status: **BCNF**.

### 4.9 `TRANSACTION` (Financial Agreement Supertype)
Root financial contract record for all closed agreements.
```sql
CREATE TABLE TRANSACTION (
    TransactionID SERIAL PRIMARY KEY,
    ListingID INT NOT NULL REFERENCES LISTING(ListingID) ON DELETE RESTRICT,
    TransactionDate DATE NOT NULL DEFAULT CURRENT_DATE,
    TransactionType VARCHAR(20) NOT NULL CHECK (TransactionType IN ('SALE', 'RENTAL'))
);
```
* **Keys**: Primary Key `{TransactionID}`.
* **BCNF Evaluation**: Determinant `{TransactionID}` is a superkey. Status: **BCNF**.

### 4.10 `SALE_TRANSACTION` (ISA Subtype)
Specialized outright acquisition agreement holding official land registry deed identifiers.
```sql
CREATE TABLE SALE_TRANSACTION (
    TransactionID INT PRIMARY KEY REFERENCES TRANSACTION(TransactionID) ON DELETE CASCADE,
    SalePrice NUMERIC(14,2) NOT NULL CHECK (SalePrice > 0),
    RegistrationNo VARCHAR(100) UNIQUE NOT NULL
);
```
* **Keys**: Primary Key `{TransactionID}`, Candidate Key `{RegistrationNo}`.
* **BCNF Evaluation**: Both determinants are candidate keys. Eliminates NULL anomalies. Status: **BCNF**.

### 4.11 `RENTAL_CONTRACT` (ISA Subtype)
Specialized lease contract holding temporal start and termination dates.
```sql
CREATE TABLE RENTAL_CONTRACT (
    TransactionID INT PRIMARY KEY REFERENCES TRANSACTION(TransactionID) ON DELETE CASCADE,
    MonthlyRent NUMERIC(14,2) NOT NULL CHECK (MonthlyRent > 0),
    LeaseStartDate DATE NOT NULL,
    LeaseEndDate DATE NOT NULL,
    CHECK (LeaseEndDate > LeaseStartDate)
);
```
* **Keys**: Primary Key `{TransactionID}`.
* **BCNF Evaluation**: Determinant `{TransactionID}` is the candidate key. Status: **BCNF**.

### 4.12 `PAYMENT` (Escrow Settlement Ledger)
Multi-installment settlement ledger supporting staggered deposits and escrow wire remittances.
```sql
CREATE TABLE PAYMENT (
    PaymentID SERIAL PRIMARY KEY,
    TransactionID INT NOT NULL REFERENCES TRANSACTION(TransactionID) ON DELETE CASCADE,
    Amount NUMERIC(14,2) NOT NULL CHECK (Amount > 0),
    PaymentDate TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PaymentMode VARCHAR(50) NOT NULL,
    ReferenceNo VARCHAR(100) UNIQUE NOT NULL
);
```
* **Keys**: Primary Key `{PaymentID}`, Candidate Key `{ReferenceNo}`.
* **BCNF Evaluation**: All determinants are candidate keys. Status: **BCNF**.

### 4.13 `REVIEW` (Curatorial Architectural Critique)
Formal reviews and 1–5 star ratings authored by patrons on listings.
```sql
CREATE TABLE REVIEW (
    ReviewID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL REFERENCES CUSTOMER(CustomerID) ON DELETE CASCADE,
    ListingID INT NOT NULL REFERENCES LISTING(ListingID) ON DELETE CASCADE,
    ReviewDate TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT NOT NULL
);
```
* **Keys**: Primary Key `{ReviewID}`.
* **BCNF Evaluation**: Determinant `{ReviewID}` is the candidate key. Status: **BCNF**.

---

## 5. Database Advanced Logic (Triggers, Views, Functions & Indexes)

### 5.1 Database Views (`db/views.sql`)
1. **`active_listings_full`**:
   Comprehensive 5-table join (`LISTING` + `PROPERTY` + `PROPERTY_TYPE` + `AGENT` + `PERSON`) calculating average star ratings and total offer counts per listing:
   ```sql
   CREATE VIEW active_listings_full AS
   SELECT 
       l.ListingID, l.ListPrice, l.ListedDate, l.Status,
       p.PropertyID, p.AreaSqFt, p.Description, pt.TypeName AS PropertyType,
       a.AgentID, CONCAT(per.FirstName, ' ', per.LastName) AS AgentName, per.Email AS AgentEmail,
       COALESCE(AVG(r.Rating), 0.0) AS AverageRating, COUNT(DISTINCT o.OfferID) AS TotalOffers
   FROM LISTING l
   JOIN PROPERTY p ON l.PropertyID = p.PropertyID
   JOIN PROPERTY_TYPE pt ON p.PropertyTypeID = pt.PropertyTypeID
   JOIN AGENT a ON l.AgentID = a.AgentID
   JOIN PERSON per ON a.PersonID = per.PersonID
   LEFT JOIN REVIEW r ON l.ListingID = r.ListingID
   LEFT JOIN OFFER o ON l.ListingID = o.ListingID
   GROUP BY l.ListingID, p.PropertyID, pt.TypeName, a.AgentID, per.PersonID;
   ```
2. **`agent_performance_summary`**:
   Grouped performance aggregation computing total active consignments, closed sale volume, and gross commission yield (3%) per agent.
3. **`property_ownership_summary`**:
   Aggregated ownership matrix detailing multi-owner allocations and remaining unassigned title percentages.

### 5.2 Procedural Triggers (`db/triggers.sql`)
* **Exclusive Subtype Enforcers (`trg_check_sale_subtype` & `trg_check_rental_subtype`)**:
  Prevents invalid specialization records. If a transaction is created with `TransactionType = 'SALE'`, inserting into `RENTAL_CONTRACT` raises an immediate SQL state exception (`ERRCODE_CHECK_VIOLATION`), and vice-versa.
* **Automatic Listing Transition (`trg_auto_close_listing`)**:
  Fires upon `INSERT` on `TRANSACTION`. Automatically updates the parent listing:
  ```sql
  UPDATE LISTING 
  SET Status = CASE WHEN NEW.TransactionType = 'SALE' THEN 'SOLD' ELSE 'RENTED' END
  WHERE ListingID = NEW.ListingID;
  ```
* **100% Ownership Cap Validation (`trg_validate_ownership_share`)**:
  Fires before `INSERT` or `UPDATE` on `OWNERSHIP`. Calculates:
  ```sql
  SUM(existing.OwnershipShare) + NEW.OwnershipShare <= 100.00
  ```
  If greater than 100.00%, raises `EXCLUSION_VIOLATION` with message `"Total ownership share for property cannot exceed 100%"`.

### 5.3 Stored Functions (`db/functions.sql`)
* **`fn_accept_offer(p_offer_id, p_sale_price, p_reg_no)`**:
  Encapsulates the complete atomic offer acceptance sequence within a procedural PostgreSQL function, returning the newly created `TransactionID`.
* **`fn_get_agent_statistics(p_agent_id)`**:
  Calculates cumulative listed volume, closed volume, and settlement velocity for a specific agent.

### 5.4 B-Tree Search Indexes (`db/indexes.sql`)
* `idx_listing_status_price`: Composite index on `LISTING(Status, ListPrice)` for fast catalog filtering.
* `idx_property_area_price`: Composite index on `PROPERTY(AreaSqFt, Price)`.
* Foreign key indexes on `LISTING(PropertyID)`, `LISTING(AgentID)`, `OFFER(ListingID)`, `OFFER(CustomerID)`, and `PAYMENT(TransactionID)` ensuring $O(\log n)$ join operations.

---

## 6. Multi-Table Atomic Transaction Cascade

When an Atelier broker clicks **"ACCEPT & EXECUTE ATOMIC SALE"**, the backend executes a transaction using an isolated PostgreSQL client with explicit `BEGIN / COMMIT / ROLLBACK` statements:

```
                  Atelier Broker Clicks: "ACCEPT & EXECUTE ATOMIC SALE"
                                            │
                                            ▼
                           POST /api/transactions (JSON Payload)
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           BEGIN TRANSACTION (PostgreSQL Client)                         │
│                                                                                         │
│  Step 1: Lock target offer row:                                                         │
│          SELECT * FROM OFFER WHERE OfferID = $1 FOR UPDATE;                             │
│                                                                                         │
│  Step 2: Update target offer status:                                                    │
│          UPDATE OFFER SET Status = 'ACCEPTED' WHERE OfferID = $1;                       │
│                                                                                         │
│  Step 3: Atomically reject all other competing tenders on this residence:               │
│          UPDATE OFFER SET Status = 'REJECTED'                                           │
│          WHERE ListingID = $2 AND OfferID <> $1 AND Status = 'PENDING';                 │
│                                                                                         │
│  Step 4: Create root financial transaction:                                             │
│          INSERT INTO TRANSACTION (ListingID, TransactionDate, TransactionType)          │
│          VALUES ($2, CURRENT_DATE, 'SALE') RETURNING TransactionID;                     │
│                                                                                         │
│  Step 5: Create specialized sale contract with notary deed identifier:                  │
│          INSERT INTO SALE_TRANSACTION (TransactionID, SalePrice, RegistrationNo)        │
│          VALUES ($txnId, $amount, $regNo);                                              │
│                                                                                         │
│  Step 6: Update listing inventory status (Trigger trg_auto_close_listing executes):     │
│          UPDATE LISTING SET Status = 'SOLD' WHERE ListingID = $2;                       │
│                                                                                         │
│  Step 7: Grant 100% legal title deed in the Custodial Registry:                         │
│          INSERT INTO OWNERSHIP (CustomerID, PropertyID, OwnershipShare, SinceDate)      │
│          VALUES ($customerId, $propertyId, 100.00, CURRENT_DATE);                       │
│                                                                                         │
│                           COMMIT TRANSACTION                                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
                        [Real-Time State Synchronization in UI]
   • Residence listing is marked SOLD in public archive and broker inventory table.
   • Competing patron bids transition to REJECTED.
   • Title deed immediately reflects in buyer's "Owned Portfolio" tab.
   • Permanent Notary contract logged in "Executed Contracts" ledger.
```

---

## 7. Frontend Role Portals & Interactive Interfaces

### 7.1 Minimal Editorial Header Navigation (`HeaderNav.tsx`)
* **Brand Mark (`MONOLITH / SPATIAL ARCHIVES / 01`)**: Smooth scroll to top.
* **Direct Role Portal Jumps**:
  * **`PATRON` Button**: Opens the Customer/Patron dashboard (loads Alice Smith’s session).
  * **`ATELIER` Button**: Opens the Broker/Agent dashboard (loads Ethan Miller’s session).
* **`INDEX`**: Opens the master modal archive of all properties.
* **Session Status Chip**: Live indicator with green pulse dot displaying current role (`PATRON` or `ATELIER`), with an instant Sign Out button.
* **`SIGN IN`**: Opens the Privé Clearance modal.

### 7.2 Privé Clearance Sign-In Modal (`SignInModal.tsx`)
* **1-Click Instant Test Clearance**:
  * **`PATRON (ALICE)` Button**: Authenticates as `alice.smith@example.com` (`CustomerID: 1`) and navigates directly to the Patron Portal.
  * **`ATELIER (ETHAN)` Button**: Authenticates as `ethan.realtor@example.com` (`AgentID: 1`) and navigates directly to the Atelier Portal.
* **Manual Form**: Toggle between `PRIVATE PATRON` and `ATELIER / AGENT` with email and passphrase inputs.

---

### 7.3 Patron / Customer Portal (`PatronDashboard.tsx`)
* **Aesthetic**: Warm limestone (`#D8D2C6` / `#D5CEC3`), concrete tones, Anton figures, and JetBrains Mono audit codes.
* **Header Context Bar**:
  * `BACK TO ARCHIVE` button (returns to 3D landing page).
  * Patron Identity Badge (`Alice Smith`, `PATRON-001 • VERIFIED ACCREDITATION`).
  * `SWITCH TO ATELIER` 1-click role switcher.
* **Top Metric Cards**:
  * `PORTFOLIO VALUATION`: Sum of current values of all owned property deeds (e.g. `$8,300,000`).
  * `DEEDED RESIDENCES`: Total count of properties owned.
  * `ACTIVE TENDERS`: Count of offers in `PENDING` status.
  * `SETTLED CONTRACTS`: Count of offers accepted through escrow.
* **Tab 1: Offers & Tenders (`OFFER`)**:
  * Table of submitted tenders with status badges (`PENDING` [amber], `ACCEPTED` [emerald], `REJECTED` [rose], `WITHDRAWN` [gray]).
  * **`WITHDRAW` Action**: Prompts confirmation and updates offer status to `'WITHDRAWN'` (`PATCH /api/offers/:id/status`).
  * **`+ SUBMIT BINDING OFFER` Modal**: Select property, input binding USD valuation, view custodial terms, and transmit live (`POST /api/offers`).
* **Tab 2: Owned Portfolio (`OWNERSHIP`)**:
  * Deeded property cards displaying `DEED RECORD // #{PropertyID}`, ownership share badge (`100% TITLE SHARE` or `50% TITLE SHARE`), estimated value, and acquisition date.
* **Tab 3: Settlement & Escrow (`TRANSACTION` & `PAYMENT`)**:
  * Contract summary cards with legal notary registration code (`REG-2024-KYOTO-0081`), total consideration, paid-to-date, and outstanding balance due.
  * **`RECORD SETTLEMENT PAYMENT` Modal**: Remit funds via Swiss Escrow Wire, Fedwire, Custodial Letter of Credit, or Certified Notary Guarantee (`POST /api/payments`).
  * Audit log ledger tracking payment reference numbers and dates.
* **Tab 4: Curatorial Reviews (`REVIEW`)**:
  * Critique cards with 1–5 filled star ratings and resident commentary.
  * **`WRITE REVIEW` Modal**: Select residence, select 1–5 stars, write commentary, and publish (`POST /api/listings/:id/reviews`).

---

### 7.4 Atelier / Agent Portal (`AgentDashboard.tsx`)
* **Aesthetic**: Dark basalt (`#1A1C1E`) executive brokerage desk.
* **Header Context Bar**:
  * `EXIT TO HERO ARCHIVE` link.
  * Broker Identity Badge (`Ethan Miller`, `BROKER-001 • LICENSED NOTARY ATELIER`).
  * `SWITCH TO PATRON` 1-click role switcher.
  * `RE-SEED DATA` button: 1-click complete database reset and pre-seeding across all 13 relations.
  * `Refresh Live Database` button.
* **Top Metric Cards**:
  * `TOTAL LISTED VOLUME`: Sum of all asking prices in inventory.
  * `SETTLED TRANSACTION VOLUME`: Total closed notary volume.
  * `PENDING DELIBERATIONS`: Count of incoming tenders awaiting broker review.
  * `ATELIER YIELD (3% FEE)`: Broker commission earned (3% of settled volume).
* **Tab 1: Managed Residences (`LISTING` & `PROPERTY`) — Full CRUD**:
  * **Create (`+ PUBLISH NEW RESIDENCE` Modal)**: Inputs for property title, location, architectural typology, asking price, area, and hero image URL (`POST /api/listings`).
  * **Update (`REVISE` Modal)**: Edit residence title, location, typology, asking price, area, status (`ACTIVE`, `PENDING`, `SOLD`, `RENTED`, `INACTIVE`), and hero image (`PUT /api/listings/:id`).
  * **Delete (`DELETE` Modal)**: Confirmation safety dialog detailing residence name and listed price; confirming permanently deletes the listing (`DELETE /api/listings/:id`).
* **Tab 2: Incoming Tenders & Atomic Engine**:
  * Review all patron tenders with comparative variance against asking price.
  * **`ACCEPT & EXECUTE ATOMIC SALE` Action**: Opens the atomic confirmation modal, executing the multi-table cascade (`POST /api/transactions`).
  * **`Reject` Action**: Rejects invalid tenders (`PATCH /api/offers/:id/status` &rarr; `'REJECTED'`).
* **Tab 3: Executed Contracts Ledger**:
  * Permanent ledger of closed sale contracts and leases with notary registration codes.
* **Tab 4: Atelier Analytics**:
  * Analytical metrics: Average square footage valuation ($/sq ft), offer-to-transaction ratio, and turnover velocity.

---

### 7.5 3D Architectural Landing Page (`App.tsx`)
* **Interactive Three.js 3D Villa (`ThreeDVillaViewer.tsx`)**:
  * 3D modern villa with board-formed concrete, cedar timber battens, travertine terrace, and infinity pool.
  * **Day / Dusk Lighting Toggle**: Switch between natural daylight and golden-hour evening interior illumination.
  * **360° Interactive Orbit**: Drag to rotate, scroll to zoom.
  * **Camera Presets**: `PERSPECTIVE`, `ELEVATION`, `PLAN VIEW`.
* **Editorial Carousel**: Huge `Anton` background typography, two-finger horizontal trackpad scrolling, and mouse drag swipe.
* **Explore Gallery (`ExploreSection.tsx`)**: 3D perspective tilt cards with specular sheen highlights reacting to mouse position.

---

## 8. Complete REST API Reference

All endpoints return uniform JSON responses. Protected endpoints require the header `Authorization: Bearer <jwt_token>`.

### Authentication (`/api/auth`)
* `POST /api/auth/register`: Atomic registration of a new `PERSON` and either `CUSTOMER` or `AGENT`.
  ```json
  // Request
  {
    "firstName": "Julian",
    "lastName": "Vance",
    "email": "julian.vance@example.com",
    "phoneNo": "+1-555-0999",
    "dateOfBirth": "1988-03-21",
    "password": "password123",
    "role": "CUSTOMER"
  }
  // Response 201 Created
  {
    "user": { "personId": 7, "customerId": 5, "email": "julian.vance@example.com", "role": "CUSTOMER" },
    "token": "eyJhbGciOi..."
  }
  ```
* `POST /api/auth/login`: Authenticate and receive JWT.
  ```json
  // Request
  { "email": "alice.smith@example.com", "password": "password123" }
  // Response 200 OK
  { "token": "eyJhbGciOi...", "user": { "personId": 1, "customerId": 1, "role": "CUSTOMER" } }
  ```
* `GET /api/auth/me`: Get current authenticated user profile.

### Property Typologies (`/api/property-types`)
* `GET /api/property-types`: List all property typologies.

### Properties (`/api/properties`)
* `GET /api/properties`: List properties with optional query filters (`minPrice`, `maxPrice`, `propertyTypeId`, `minArea`, `maxArea`, `limit`, `offset`).
* `GET /api/properties/:id`: Get property specifications and title ownership distribution.
* `POST /api/properties`: Create physical property record.

### Listings (`/api/listings`)
* `GET /api/listings`: Browse listings via database view `active_listings_full`.
* `GET /api/listings/:id`: Detailed listing monograph including representing broker and reviews.
* `POST /api/listings`: Publish a new listing (Agent only).
  ```json
  // Request
  {
    "propertyName": "The Monolith Pavilion",
    "location": "Reykjavik, Iceland",
    "propertyType": "Brutalist Cliff Residence",
    "listPrice": 6400000,
    "areaSqFt": 5500,
    "agentId": 1
  }
  ```
* `PUT /api/listings/:id`: Revise listing specifications, price, or status (Agent only).
* `DELETE /api/listings/:id`: De-list and permanently delete listing (Agent only).

### Offers (`/api/offers`)
* `POST /api/offers`: Submit formal purchase tender (Customer only).
  ```json
  // Request
  { "listingId": 1, "offerAmount": 4700000 }
  ```
* `GET /api/offers`: Query tenders by `customerId` or `listingId`.
* `PATCH /api/offers/:id/status`: Update tender status (`WITHDRAWN`, `REJECTED`).

### Transactions (`/api/transactions`)
* `POST /api/transactions`: Accept offer & execute atomic multi-table transaction (Agent only).
  ```json
  // Request
  {
    "offerId": 101,
    "listingId": 1,
    "transactionType": "SALE",
    "salePrice": 4700000,
    "registrationNo": "NOTARY-REG-2024-0081"
  }
  ```
* `GET /api/transactions`: List closed notary transactions.
* `GET /api/transactions/:id`: Retrieve transaction contract with exclusive subtype details.

### Payments (`/api/payments`)
* `POST /api/payments`: Record installment payment against a transaction.
  ```json
  // Request
  {
    "transactionId": 1,
    "amount": 500000,
    "paymentMethod": "Swiss Escrow Wire Transfer"
  }
  ```
* `GET /api/payments`: Query payment audit log by `transactionId`.

### Reviews (`/api/reviews`)
* `GET /api/listings/:id/reviews`: Get all reviews for a listing.
* `POST /api/listings/:id/reviews`: Submit curatorial critique with 1–5 star rating (Customer only).

### Database Initialization & Seeding (`/api/seed`)
* `POST /api/seed`: Re-seed database with clean 13-relation demonstration dataset.
* `POST /api/db-init`: Full automated schema rebuild and initialization.

---

## 9. Automated Pre-Seeding & Demonstration Dataset

### Pre-Seeded Demonstration Records
* **`PERSON`**:
  * `PersonID: 1` — Alice Marie Smith (`alice.smith@example.com`, password: `password123`)
  * `PersonID: 2` — Bob Edward Johnson (`bob.johnson@example.com`)
  * `PersonID: 3` — Charlie Williams (`charlie.w@example.com`)
  * `PersonID: 4` — Diana Rose Davis (`diana.davis@example.com`)
  * `PersonID: 5` — Ethan Blake Miller (`ethan.realtor@example.com`, Broker ID: 1)
  * `PersonID: 6` — Fiona Grace Clark (`fiona.clark@example.com`, Broker ID: 2)
* **`CUSTOMER`**: Customer IDs 1 to 4 mapped 1:1 to Persons 1 to 4.
* **`AGENT`**: Agent IDs 1 and 2 mapped 1:1 to Persons 5 and 6.
* **`PROPERTY_TYPE`**: *Apartment*, *Single Family Home*, *Luxury Villa*, *Commercial Office*, *Penthouse*.
* **`PROPERTY`**: 5 physical properties with realistic square footage, prices, and descriptions.
* **`OWNERSHIP`**: Fractional (60%/40%) and 100% freehold deeds across multiple owners.
* **`LISTING`**: 5 active, sold, and rented residences.
* **`OFFER`**: Pending and accepted buyer tenders.
* **`TRANSACTION` & Subtypes**: Settled notary sale deeds (`SALE_TRANSACTION`) and commercial leases (`RENTAL_CONTRACT`).
* **`PAYMENT`**: Staggered escrow wire and bank transfer payments.
* **`REVIEW`**: Curatorial critiques and 1–5 star ratings.

### 4 Ways to Seed or Reset Data
1. **Automatic Startup Pre-Seeding**: The backend detects on boot if tables exist; if uninitialized, it automatically executes the full SQL pipeline.
2. **In-Browser 1-Click Button**: Click **`RE-SEED DATA`** in the top-right header of the Atelier Portal.
3. **CLI Command**: Run `npm run db:seed` or `npm run db:init` from the `backend/` directory.
4. **REST Endpoint**: Call `POST /api/seed` using curl or Postman.

---

## 10. Step-by-Step Production Deployment Guide

### Deployment Architecture
* **Database**: **[Neon.tech](https://neon.tech)** (Serverless PostgreSQL 16) or Supabase.
* **Backend**: **[Render.com](https://render.com)** (Web Service) or Railway.
* **Frontend**: **[Vercel.com](https://vercel.com)** (Static SPA) or Netlify.

### Step 1: Deploy Database on Neon.tech
1. Create a free project on [Neon.tech](https://neon.tech) (PostgreSQL 16).
2. Copy the connection string:
   ```env
   postgresql://username:password@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Initialize all 13 tables, views, triggers, and seed data from your machine:
   ```powershell
   cd c:\Users\SHIVANSH\real_estate\backend
   $env:DATABASE_URL="postgresql://username:password@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
   npm run db:init
   ```

### Step 2: Deploy Backend on Render.com
1. Create a new **Web Service** on [Render.com](https://render.com) connected to `Unknownx-x1/Real_estate_dbms`.
2. Settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
3. Environment Variables:
   * `DATABASE_URL`: *(your Neon connection string)*
   * `JWT_SECRET`: `supersecret_monolith_jwt_key_2024`
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
4. Copy the assigned URL (e.g. `https://monolith-backend.onrender.com`).

### Step 3: Deploy Frontend on Vercel
1. Import `Unknownx-x1/Real_estate_dbms` on [Vercel.com](https://vercel.com).
2. Settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Environment Variables:
   * `VITE_API_BASE_URL`: `https://monolith-backend.onrender.com/api`
4. Click **Deploy**.

---

## 11. Environment Variables Dictionary

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `5000` | Port on which the Express HTTP server listens. |
| `DATABASE_URL` | **Yes** | `postgresql://...` | PostgreSQL connection string with credentials, host, and database name. |
| `JWT_SECRET` | **Yes** | `secret` | Secret key used to sign and verify HS256 authentication tokens. |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development` or `production`). |
| `CORS_ORIGIN` | Optional | `*` | Allowed CORS origin (set to frontend domain in production). |
| `DB_SSL` | Optional | `false` | Set to `true` to force SSL (auto-detected for cloud hosts). |
| `AUTO_INIT` | Optional | `false` | Set to `true` to force auto-initialization and seeding on startup. |

### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Optional | `http://localhost:5000/api` | Base URL of the deployed Express backend API. |

---

## 12. Project Directory Tree & File Inventory

```
real_estate/
├── backend/                               # Express REST API
│   ├── scripts/
│   │   ├── initDb.js                      # Full schema & seed initialization runner
│   │   └── seedDb.js                      # Seed-only dataset runner
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                      # node-postgres connection pool with auto-SSL
│   │   ├── controllers/                   # 7 Express controllers
│   │   ├── middleware/                    # auth.js, roleGuard.js, errorHandler.js
│   │   ├── repositories/                  # 13 raw parameterized SQL DAOs
│   │   ├── routes/                        # Express route modules
│   │   ├── services/                      # Business logic & atomic transaction orchestration
│   │   ├── app.js                         # Express app pipeline & CORS setup
│   │   └── server.js                      # Server entrypoint with auto-seed detection
│   ├── .env.example
│   └── package.json
├── db/                                    # Database SQL Scripts
│   ├── schema.sql                         # 13 BCNF table DDL definitions
│   ├── constraints.sql                    # CHECK, UNIQUE, and FK constraints
│   ├── views.sql                          # 3 analytical and browse views
│   ├── triggers.sql                       # Subtype check, auto-close, and 100% share cap triggers
│   ├── functions.sql                      # fn_accept_offer and fn_get_agent_statistics
│   ├── indexes.sql                        # B-tree search and FK indexes
│   ├── queries.sql                        # Advanced CRUD, 5-table joins, CTE window queries
│   └── seed.sql                           # 13-table demonstration seed data
├── docs/
│   ├── NORMALIZATION.md                   # Formal 1NF -> 2NF -> 3NF -> BCNF mathematical proofs
│   └── walkthrough.md                     # Engineering and verification walkthrough
├── frontend/                              # React 19 / Vite / Three.js Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboards/
│   │   │   │   ├── PatronDashboard.tsx    # Customer portal (Tenders, Portfolio, Escrow, Reviews)
│   │   │   │   └── AgentDashboard.tsx     # Broker portal (CRUD inventory, Atomic sale engine)
│   │   │   ├── ArchitecturalStage.tsx     # 3D stage and carousel layout
│   │   │   ├── HeaderNav.tsx              # Minimal editorial navigation and role switcher
│   │   │   ├── IndexModal.tsx             # Master property catalog modal
│   │   │   ├── SignInModal.tsx            # Privé authentication with 1-click test buttons
│   │   │   ├── ThreeDTiltCard.tsx         # Perspective tilt cards with specular sheen
│   │   │   └── ThreeDVillaViewer.tsx      # Three.js 3D villa with day/dusk illumination
│   │   ├── data/                          # properties.ts
│   │   ├── services/
│   │   │   └── api.ts                     # Unified API client with offline fallback sync
│   │   ├── App.tsx                        # Master application routing & parallax controller
│   │   ├── index.css                      # Editorial CSS variables & typography rules
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── postman/
│   └── RealEstateAPI.postman_collection.json  # Complete Postman API collection
├── .gitignore
└── README.md                              # Master System Documentation
```
