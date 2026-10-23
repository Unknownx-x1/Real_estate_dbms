# Horizon Estates — Relational Real Estate DBMS & Spatial Platform
### Database Management Systems (DBMS) — Digital Assignment 2 (DA2)

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Database Normalization](https://img.shields.io/badge/Normalization-BCNF-success?style=flat-square)](#4-granular-13-relation-relational-schema--bcnf-specifications)
[![Zero-ORM](https://img.shields.io/badge/Query_Engine-Raw_Parameterized_SQL-orange?style=flat-square)](#1-executive-overview--da2-academic-scope)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r182-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

An enterprise-grade, relational real estate management system and luxury spatial monograph platform developed for **DBMS Digital Assignment 2 (DA2)**. Built with **PostgreSQL 15+** parameterized raw SQL repositories, an **Express.js** layered REST API, and a 3D architectural magazine editorial frontend in **React 19**, **Three.js**, and **Tailwind CSS**.

> **Architecture Specification (Not a Monolith)**: This project is structured as a **decoupled 3-tier distributed architecture** separating a standalone React 19 SPA presentation tier, a modular Express.js micro-layered API tier, and a high-performance PostgreSQL relational database tier. It is **not a monolithic application**.

The system rigorously implements **13 relations normalized to Boyce-Codd Normal Form (BCNF)**, **14 EER cardinalities**, cascading referential integrity, database triggers, views, stored functions, multi-table atomic transactions, and an **Interactive In-Browser SQL Terminal & Schema Explorer** designed specifically for course evaluation and live professor query execution.

---

## Table of Contents

1. [Executive Overview & DA2 Academic Scope](#1-executive-overview--da2-academic-scope)
2. [Decoupled 3-Tier System Architecture](#2-decoupled-3-tier-system-architecture)
3. [Enhanced Entity-Relationship (EER) Model & Cardinality Matrix](#3-enhanced-entity-relationship-eer-model--cardinality-matrix)
4. [Granular 13-Relation Relational Schema & BCNF Specifications](#4-granular-13-relation-relational-schema--bcnf-specifications)
5. [Advanced Database Objects (Triggers, Views, Functions & Indexes)](#5-advanced-database-objects-triggers-views-functions--indexes)
6. [Multi-Table Atomic Transaction Cascade](#6-multi-table-atomic-transaction-cascade)
7. [Interactive In-Browser SQL Query Terminal (Evaluation Tool)](#7-interactive-in-browser-sql-query-terminal-evaluation-tool)
8. [Frontend Role Portals (Patron & Atelier)](#8-frontend-role-portals-patron--atelier)
9. [Complete REST API Reference](#9-complete-rest-api-reference)
10. [Automated Pre-Seeding & Demonstration Dataset](#10-automated-pre-seeding--demonstration-dataset)
11. [Step-by-Step Production & Local Deployment Guide](#11-step-by-step-production--local-deployment-guide)
12. [Environment Variables Dictionary](#12-environment-variables-dictionary)
13. [Project Directory Tree & File Inventory](#13-project-directory-tree--file-inventory)

---

## 1. Executive Overview & DA2 Academic Scope

### DA2 Course Competencies Addressed
* **Relational Schema Design & Normalization**: Complete 1NF $\rightarrow$ 2NF $\rightarrow$ 3NF $\rightarrow$ BCNF progression. For every non-trivial functional dependency $X \rightarrow Y$, $X$ is proven to be a superkey.
* **Integrity & Business Invariant Enforcement**: Multi-tier constraints (`NOT NULL`, `CHECK`, `UNIQUE`, `FOREIGN KEY` with `ON DELETE CASCADE` and `RESTRICT`), preventing data corruption at the database engine level.
* **ISA Specialization & Generalization**:
  * Root identity: `PERSON` specialized into disjoint `CUSTOMER` (Buyer/Renter) and `AGENT` (Broker).
  * Root contract: `TRANSACTION` specialized into exclusive `SALE_TRANSACTION` and `RENTAL_CONTRACT`.
* **Procedural Database Programming (PL/pgSQL)**:
  * **4 Procedural Triggers**: Enforcing transaction subtype exclusivity, automating listing status transitions, and validating $\sum \text{OwnershipShare} \le 100.00\%$ invariant.
  * **2 Stored Functions**: Procedural offer settlement (`fn_accept_offer`) and broker analytical aggregations (`fn_get_agent_statistics`).
  * **3 Database Views**: Complex multi-table joins, market volume aggregations, and co-ownership summaries.
* **ACID Transaction Management**: Multi-statement atomic transaction execution with pessimistic row-level locking (`SELECT ... FOR UPDATE`), transaction isolation, and rollback safety.
* **Indexing Strategy**: B-Tree composite search indexes and foreign key indexes ensuring $O(\log n)$ lookup efficiency.
* **Zero-ORM Policy**: Built entirely without ORM abstractions (no Prisma, Sequelize, or TypeORM). All queries are written in raw, parameterized SQL (`$1, $2, ...`) via `pg-pool` to demonstrate auditable relational algebra, lock discipline, and explicit execution plans (`EXPLAIN ANALYZE`).

---

## 2. Decoupled 3-Tier System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER (React 19 / Vite SPA)                          │
│                                                                                         │
│   ┌───────────────────────────┐ ┌───────────────────────────┐ ┌──────────────────────┐  │
│   │ 3D Spatial Monograph      │ │ Patron Portal             │ │ Atelier Portal       │  │
│   │ Three.js / WebGL / Canvas │ │ (Tenders, Deeds, Escrow)  │ │ (Inventory, Atomic)  │  │
│   └─────────────┬─────────────┘ └─────────────┬─────────────┘ └──────────┬───────────┘  │
│                 │                             │                          │              │
│                 └─────────────────────────────┼──────────────────────────┘              │
│                                               ▼                                         │
│                               Interactive SQL Query Console                             │
│                      (Live Raw Query Execution + Catalog Explorer)                      │
│                                               │                                         │
│                                               ▼                                         │
│                                   Unified API Client (api.ts)                           │
│                          (Fetch API + JWT Bearer Token Authorization)                   │
└───────────────────────────────────────────────┬─────────────────────────────────────────┘
                                                │ (HTTP / REST / JSON / Port 5000)
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
│   │ 13 BCNF Relations           │  │ Stored Functions (2)    │  │ Procedural        │   │
│   │ Composite Keys, PKs & FKs   │  │ (fn_accept_offer, etc.) │  │ Triggers (4)      │   │
│   └──────────────┬──────────────┘  └────────────┬────────────┘  └─────────┬─────────┘   │
│                  │                              │                         │             │
│                  ▼                              ▼                         ▼             │
│   ┌─────────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐   │
│   │ B-Tree Search Indexes       │  │ Database Views (3)      │  │ Integrity CHECKs  │   │
│   │ (Filter, Foreign Key, Sort) │  │ (5-table join reports)  │  │ & Unique Rules    │   │
│   └─────────────────────────────┘  └─────────────────────────┘  └───────────────────┘   │
│                         Hosted on Neon Cloud / Local Port 5432                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Enhanced Entity-Relationship (EER) Model & Cardinality Matrix

The database schema captures **13 relations** and **14 structural cardinalities**, strictly enforcing ISA specialization hierarchies, composite junction associations, and exclusive transaction subtypes:

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
Holds root identity for all users (patrons and agents alike).
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
* **Keys**: Primary Key `{PersonID}`, Candidate Keys `{Email}`, `{PhoneNo}`.
* **Derived Attribute Elimination**: `Age` is **not stored** to eliminate the transitive dependency `PersonID` $\rightarrow$ `DateOfBirth` $\rightarrow$ `Age`. It is computed dynamically via `EXTRACT(YEAR FROM AGE(CURRENT_DATE, DateOfBirth))`.
* **BCNF Evaluation**: Determinants `{PersonID}`, `{Email}`, and `{PhoneNo}` are all superkeys. **Complies with BCNF**.

### 4.2 `CUSTOMER` (ISA Subtype)
Represents prospective and deeded property buyers and renters.
```sql
CREATE TABLE CUSTOMER (
    CustomerID SERIAL PRIMARY KEY,
    PersonID INT UNIQUE NOT NULL REFERENCES PERSON(PersonID) ON DELETE CASCADE
);
```
* **Keys**: Primary Key `{CustomerID}`, Candidate Key `{PersonID}`.
* **BCNF Evaluation**: Both determinants are candidate keys. **Complies with BCNF**.

### 4.3 `AGENT` (ISA Subtype)
Represents licensed real estate brokers and consignment curation specialists.
```sql
CREATE TABLE AGENT (
    AgentID SERIAL PRIMARY KEY,
    PersonID INT UNIQUE NOT NULL REFERENCES PERSON(PersonID) ON DELETE CASCADE
);
```
* **Keys**: Primary Key `{AgentID}`, Candidate Key `{PersonID}`.
* **BCNF Evaluation**: Both determinants are candidate keys. **Complies with BCNF**.

### 4.4 `PROPERTY_TYPE` (Catalog Lookup)
Architectural typology catalog preventing string insertion anomalies.
```sql
CREATE TABLE PROPERTY_TYPE (
    PropertyTypeID SERIAL PRIMARY KEY,
    TypeName VARCHAR(50) UNIQUE NOT NULL
);
```
* **Keys**: Primary Key `{PropertyTypeID}`, Candidate Key `{TypeName}`.
* **BCNF Evaluation**: Independent 2-column catalog. **Complies with BCNF**.

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
* **BCNF Evaluation**: Non-prime attributes depend solely on `{PropertyID}`. **Complies with BCNF**.

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
* **BCNF Evaluation**: Neither `CustomerID` nor `PropertyID` alone determines `OwnershipShare`. Full functional dependency holds across the composite candidate key. **Complies with BCNF**.

### 4.7 `LISTING` (Agent-Property Consignment)
Market listing consignment associating a property with a managing broker.
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
* **BCNF Evaluation**: Foreign keys prevent agent contact details from creating transitive dependencies. **Complies with BCNF**.

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
* **BCNF Evaluation**: Determinant `{OfferID}` is the single-attribute key. **Complies with BCNF**.

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
* **BCNF Evaluation**: Determinant `{TransactionID}` is a superkey. **Complies with BCNF**.

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
* **BCNF Evaluation**: Both determinants are candidate keys. Eliminates NULL anomalies. **Complies with BCNF**.

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
* **BCNF Evaluation**: Determinant `{TransactionID}` is the candidate key. **Complies with BCNF**.

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
* **BCNF Evaluation**: All determinants are candidate keys. **Complies with BCNF**.

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
* **BCNF Evaluation**: Determinant `{ReviewID}` is the candidate key. **Complies with BCNF**.

---

## 5. Advanced Database Objects (Triggers, Views, Functions & Indexes)

### 5.1 Procedural Triggers (`db/triggers.sql`)
1. **Exclusive Subtype Enforcers (`trg_check_sale_subtype` & `trg_check_rental_subtype`)**:
   Prevents specialization errors. If a transaction has `TransactionType = 'SALE'`, inserting into `RENTAL_CONTRACT` raises an immediate SQL state exception (`ERRCODE_CHECK_VIOLATION`), and vice-versa.
2. **Automatic Listing Status Transition (`trg_auto_close_listing`)**:
   Fires automatically upon `INSERT` on `TRANSACTION`. Updates the parent listing status:
   ```sql
   UPDATE LISTING 
   SET Status = CASE WHEN NEW.TransactionType = 'SALE' THEN 'SOLD' ELSE 'RENTED' END
   WHERE ListingID = NEW.ListingID;
   ```
3. **100% Ownership Cap Validation (`trg_validate_ownership_share`)**:
   Fires before `INSERT` or `UPDATE` on `OWNERSHIP`. Calculates:
   ```sql
   SUM(existing.OwnershipShare) + NEW.OwnershipShare <= 100.00
   ```
   If greater than 100.00%, raises an `EXCLUSION_VIOLATION` with message `"Total ownership share for property cannot exceed 100%"`.

### 5.2 Stored Functions (`db/functions.sql`)
1. **`fn_accept_offer(p_offer_id, p_sale_price, p_reg_no)`**:
   Encapsulates the complete atomic offer acceptance sequence within a procedural PostgreSQL function, returning the newly created `TransactionID`.
2. **`fn_get_agent_statistics(p_agent_id)`**:
   Computes active consigned volume, closed notary deals, average closing prices, and settlement velocity for a specific broker.

### 5.3 Database Views (`db/views.sql`)
1. **`active_listings_full`**:
   Comprehensive 5-table join (`LISTING` + `PROPERTY` + `PROPERTY_TYPE` + `AGENT` + `PERSON`) calculating average star ratings and total offer counts:
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
   Grouped analytical aggregation computing total inventory volume, closed sale volume, and gross 3% commission yield per broker.
3. **`property_ownership_summary`**:
   Aggregated ownership matrix detailing multi-owner allocations and remaining unassigned title percentages.

### 5.4 B-Tree Search Indexes (`db/indexes.sql`)
* `idx_listing_status_price`: Composite index on `LISTING(Status, ListPrice)` for catalog filtering.
* `idx_property_area_price`: Composite index on `PROPERTY(AreaSqFt, Price)`.
* Foreign key indexes on `LISTING(PropertyID)`, `LISTING(AgentID)`, `OFFER(ListingID)`, `OFFER(CustomerID)`, and `PAYMENT(TransactionID)` guaranteeing $O(\log n)$ join traversal.

---

## 6. Multi-Table Atomic Transaction Cascade

When an Atelier broker clicks **"ACCEPT & EXECUTE ATOMIC SALE"**, the backend executes a multi-table atomic transaction using an isolated PostgreSQL client with explicit `BEGIN / COMMIT / ROLLBACK` statements:

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

## 7. Interactive In-Browser SQL Query Terminal (Evaluation Tool)

Built directly into the web application (`SqlQueryWindow.tsx`), accessible via the **`SQL`** button in the header navigation:

* **Direct Raw SQL Execution**: Write and execute arbitrary PostgreSQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `EXPLAIN ANALYZE`).
* **Execution Metrics**: High-resolution latency profiling (`performance.now()`) measuring execution time in milliseconds alongside row count and SQL command verbs.
* **1-Click 13-Relation Schema Explorer**: Interactive collapsible sidebar introspecting live database catalog definitions (`information_schema.tables` and `columns`) with single-click query generation.
* **Curated Query Preset Library for Evaluators**:
  1. *5-Table Relational Master Join* (`LISTING` + `PROPERTY` + `PROPERTY_TYPE` + `AGENT` + `PERSON`)
  2. *Agent Consignments & 3% Commission Yield*
  3. *Typology Market Pricing Summary*
  4. *Window Functions: Rank Listings in Typology (`DENSE_RANK()`)*
  5. *Correlated Subquery: Unsold Properties Below Typology Average*
  6. *Query active_listings_full View*
  7. *Trigger Invariant Test: Exceed 100% Ownership Share (Expects Error `P0001`)*
  8. *Trigger Subtype Test: Insert Mismatched Rental Contract on Sale (Expects Error `23514`)*
* **Export Capabilities**: 1-click export of query output to CSV or formatted JSON.
* **Diagnostic Panel**: Displays exact SQLSTATE error codes (`23514`, `23505`, `P0001`), violated constraints, and position markers.

---

## 8. Frontend Role Portals (Patron & Atelier)

### 8.1 Patron / Customer Portal (`PatronDashboard.tsx`)
* **Portfolio Valuation**: Sum of current values of all owned property deeds (e.g. `$8,300,000`).
* **Offers & Tenders (`OFFER`)**: Table of submitted tenders with status badges (`PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`), plus offer withdrawal action.
* **Binding Offer Submission**: Modal to select property, input USD valuation, and transmit live (`POST /api/offers`).
* **Owned Portfolio (`OWNERSHIP`)**: Deeded property cards displaying ownership percentage (`100% TITLE SHARE` or `50% TITLE SHARE`) and acquisition dates.
* **Settlement & Escrow (`TRANSACTION` & `PAYMENT`)**: Notary contract cards and payment remittance modal (`POST /api/payments`).
* **Curatorial Reviews (`REVIEW`)**: 1–5 star rating submissions and critiques (`POST /api/listings/:id/reviews`).

### 8.2 Atelier / Agent Portal (`AgentDashboard.tsx`)
* **Consignment Inventory CRUD (`LISTING` & `PROPERTY`)**:
  * **Create**: Publish new residence with location, typology, price, and specs (`POST /api/listings`).
  * **Update**: Edit residence title, typology, asking price, and status (`PUT /api/listings/:id`).
  * **Delete**: De-list and permanently delete listing (`DELETE /api/listings/:id`).
* **Incoming Tenders & Atomic Engine**:
  * Review all patron tenders with comparative variance against asking price.
  * **`ACCEPT & EXECUTE ATOMIC SALE`**: Executes multi-table atomic transaction cascade (`POST /api/transactions`).
  * **`Reject`**: Rejects invalid tenders (`PATCH /api/offers/:id/status` $\rightarrow$ `'REJECTED'`).
* **Executed Contracts Ledger**: Ledger of closed sales and leases with notary registration codes.
* **Atelier Analytics**: Commission yield (3%), square footage valuation, and turnover velocity.

---

## 9. Complete REST API Reference

All endpoints return uniform JSON responses. Protected endpoints require the header `Authorization: Bearer <jwt_token>`.

### SQL Query Terminal & Schema Introspection (`/api/query`)
* `POST /api/query/execute`: Executes arbitrary raw SQL statement against PostgreSQL connection pool and returns tabular rows, fields, row count, and execution latency in ms.
* `GET /api/query/schema`: Introspects `information_schema` and returns list of tables and columns with data types.

### Authentication (`/api/auth`)
* `POST /api/auth/register`: Atomic registration of a new `PERSON` and either `CUSTOMER` or `AGENT`.
* `POST /api/auth/login`: Authenticate and receive JWT.
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
* `PUT /api/listings/:id`: Revise listing specifications, price, or status (Agent only).
* `DELETE /api/listings/:id`: De-list and permanently delete listing (Agent only).

### Offers (`/api/offers`)
* `POST /api/offers`: Submit formal purchase tender (Customer only).
* `GET /api/offers`: Query tenders by `customerId` or `listingId`.
* `PATCH /api/offers/:id/status`: Update tender status (`WITHDRAWN`, `REJECTED`).

### Transactions (`/api/transactions`)
* `POST /api/transactions`: Accept offer & execute atomic multi-table transaction (Agent only).
* `GET /api/transactions`: List closed notary transactions.
* `GET /api/transactions/:id`: Retrieve transaction contract with exclusive subtype details.

### Payments (`/api/payments`)
* `POST /api/payments`: Record installment payment against a transaction.

---

## 10. Automated Pre-Seeding & Demonstration Dataset

Pre-seeds all 13 relations with coordinated demonstration data:
* 6 People, 4 Customers, 2 Agents
* 5 Property Typologies (Penthouse, Brutalist Cliff Residence, Minimalist Pavilion, etc.)
* 6 Properties with verified square footages and descriptions
* 6 Consignment Listings with active asking prices
* 6 Binding Acquisition Offers across multiple customer accounts
* 2 Settled Transactions (1 Sale with Notary Registration, 1 Rental Contract)
* 2 Settlement Payments logged in the Escrow Ledger
* 4 Curatorial Architectural Reviews with 1–5 star ratings

### 4 Ways to Seed or Reset Data
1. **Automatic Startup Pre-Seeding**: The backend detects on boot if tables exist; if uninitialized, it automatically executes the full SQL pipeline.
2. **In-Browser 1-Click Button**: Click **`RE-SEED DATA`** in the top-right header of the Atelier Portal or the SQL Terminal.
3. **CLI Command**: Run `npm run db:init` or `npm run db:seed` from the `backend/` directory.
4. **REST Endpoint**: Call `POST /api/seed` using curl or Postman.

---

## 11. Step-by-Step Production & Local Deployment Guide

### Local Development Quickstart

#### Step 1: Initialize Database & Start Backend
```bash
cd backend
npm install
cp .env.example .env
# Ensure your DATABASE_URL in .env points to PostgreSQL (e.g. Neon or local pg)
npm run db:init
npm run dev
```
Backend starts on [http://localhost:5000](http://localhost:5000).

#### Step 2: Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend starts on [http://localhost:5173](http://localhost:5173).

---

## 12. Environment Variables Dictionary

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

## 13. Project Directory Tree & File Inventory

```
real_estate/
├── backend/                               # Express REST API & Micro-Layered Service Tier
│   ├── scripts/
│   │   ├── initDb.js                      # Full schema & seed initialization runner
│   │   └── seedDb.js                      # Relational seed-only dataset runner
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
├── db/                                    # PostgreSQL Database SQL Scripts
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
│   │   │   ├── SqlQueryWindow.tsx         # Interactive raw SQL terminal & schema explorer
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
└── README.md                              # DA2 Relational DBMS System Documentation
```
