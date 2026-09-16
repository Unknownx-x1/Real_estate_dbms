# Monolith Real Estate DBMS & Spatial Platform

> **Full-Stack Relational Database Management System** featuring a **PostgreSQL 15+** database with raw parameterized SQL repositories, an **Express.js** REST API service layer, and a luxury architectural magazine editorial frontend built with **React 19**, **Three.js**, and **Tailwind CSS**.
>
> Compliant with the complete DBMS specification: **13 BCNF-normalized relations**, **14 EER cardinalities**, database constraints, triggers, views, stored functions, multi-table atomic transactions, and dedicated role portals for **Patrons (Customers)** and **Ateliers (Agents)**.

---

## Table of Contents
1. [System Architecture Flowchart](#1-system-architecture-flowchart)
2. [EER Model & Entity-Relationship Flowchart](#2-eer-model--entity-relationship-flowchart)
3. [Relational Schema & BCNF Normalization](#3-relational-schema--bcnf-normalization)
4. [Multi-Table Atomic Transaction Cascade](#4-multi-table-atomic-transaction-cascade)
5. [Frontend Role Portals & Features](#5-frontend-role-portals--features)
6. [Database Artifacts Directory](#6-database-artifacts-directory)
7. [API Endpoint Contract Reference](#7-api-endpoint-contract-reference)
8. [Quick Start & Setup Guide](#8-quick-start--setup-guide)
9. [DBMS Viva & Demonstration Checklist](#9-dbms-viva--demonstration-checklist)

---

## 1. System Architecture Flowchart

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT TIER (React 19 + Vite)                        │
│                                                                        │
│   ┌───────────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│   │ 3D Immersive Hero     │  │ Patron Portal    │  │ Atelier Portal │  │
│   │ Three.js Villa Viewer │  │ (Customer Views) │  │ (Agent Views)  │  │
│   └───────────┬───────────┘  └────────┬─────────┘  └───────┬────────┘  │
│               │                       │                    │           │
│               └───────────────────────┼────────────────────┘           │
│                                       ▼                                │
│                     Unified API Client (api.ts)                        │
│                 (Live Fetch + Local Synchronized Sync)                 │
└───────────────────────────────────────┬────────────────────────────────┘
                                        │ (HTTP / JSON / Bearer JWT)
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│               APPLICATION & SERVICE TIER (Node.js / Express)           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Routes Aggregator (backend/src/routes/)                        │   │
│   │ [/auth, /properties, /listings, /offers, /transactions, ...]   │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Controllers Layer (backend/src/controllers/)                   │   │
│   │ (Request validation, payload sanitization, HTTP status codes)   │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Services Layer (backend/src/services/)                         │   │
│   │ (Atomic Transactions, Business Rules, Invariant Validation)    │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Repository DAOs (backend/src/repositories/) - NO ORM           │   │
│   │ (Direct parameterized SQL queries via node-postgres pg-pool)  │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────────┼────────────────────────────────┘
                                        │ (Raw Parameterized SQL)
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DATABASE TIER (PostgreSQL 15+)                       │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │ 13 BCNF Relations         │      │ Database Views              │   │
│   │ (PKs, FKs, CHECKs, UNIQUE)│      │ (active_listings_full, etc.)│   │
│   └─────────────┬─────────────┘      └──────────────┬──────────────┘   │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │ Triggers & Constraints    │      │ Stored Functions            │   │
│   │ (Subtype Check, Auto-Close│      │ (fn_accept_offer,           │   │
│   │  Listing, 100% Share Cap) │      │  fn_get_agent_statistics)   │   │
│   └───────────────────────────┘      └─────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. EER Model & Entity-Relationship Flowchart

The data model captures **13 relations** and **14 cardinalities**, strictly enforcing ISA subtype specializations, $M:N$ composite keys, and referential constraints.

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

---

## 3. Relational Schema & BCNF Normalization

All relations have been normalized and audited mathematically to satisfy **Boyce-Codd Normal Form (BCNF)**. Derived attributes have been removed from storage.

| Relation | Primary Key | Foreign Keys & References | Normal Form | Key Design Invariants |
| :--- | :--- | :--- | :---: | :--- |
| **`PERSON`** | `PersonID` | *None* (Candidate: `Email`) | **BCNF** | Derived `Age` removed. Age is computed on-the-fly via `AGE(CURRENT_DATE, DateOfBirth)`. |
| **`CUSTOMER`** | `CustomerID` | `PersonID` $\rightarrow$ `PERSON(PersonID)` ($1:1$) | **BCNF** | ISA subtype of `PERSON`. Scopes buyer portfolios, bids, and reviews. |
| **`AGENT`** | `AgentID` | `PersonID` $\rightarrow$ `PERSON(PersonID)` ($1:1$) | **BCNF** | ISA subtype of `PERSON`. Scopes broker listings and commission earnings. |
| **`PROPERTY_TYPE`** | `PropertyTypeID` | *None* (Candidate: `TypeName`) | **BCNF** | Lookup entity eliminating repetitive typology strings. |
| **`PROPERTY`** | `PropertyID` | `PropertyTypeID` $\rightarrow$ `PROPERTY_TYPE` | **BCNF** | Physical asset. Decoupled from agent/listing data to eliminate transitive anomalies. |
| **`OWNERSHIP`** | `(CustomerID, PropertyID)` | Composite PK $\rightarrow$ `CUSTOMER`, `PROPERTY` | **BCNF** | $M:N$ junction table. Trigger enforces $\sum \text{OwnershipShare} \le 100\%$. |
| **`LISTING`** | `ListingID` | `PropertyID` $\rightarrow$ `PROPERTY`, `AgentID` $\rightarrow$ `AGENT` | **BCNF** | Market consignment. Status: `ACTIVE`, `PENDING`, `SOLD`, `RENTED`, `INACTIVE`. |
| **`OFFER`** | `OfferID` | `CustomerID` $\rightarrow$ `CUSTOMER`, `ListingID` $\rightarrow$ `LISTING` | **BCNF** | Binding purchase tender. Status: `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`. |
| **`TRANSACTION`** | `TransactionID` | `ListingID` $\rightarrow$ `LISTING` | **BCNF** | Financial agreement supertype. Discriminator: `TransactionType IN ('SALE', 'RENTAL')`. |
| **`SALE_TRANSACTION`**| `TransactionID` | `TransactionID` $\rightarrow$ `TRANSACTION` ($1:1$) | **BCNF** | Outright sale contract. Holds unique notary `RegistrationNo`. |
| **`RENTAL_CONTRACT`** | `TransactionID` | `TransactionID` $\rightarrow$ `TRANSACTION` ($1:1$) | **BCNF** | Lease agreement. Holds `MonthlyRent`, `LeaseStartDate`, `LeaseEndDate`. |
| **`PAYMENT`** | `PaymentID` | `TransactionID` $\rightarrow$ `TRANSACTION` ($1:N$) | **BCNF** | Multi-installment escrow settlement ledger. Unique `ReferenceNo`. |
| **`REVIEW`** | `ReviewID` | `CustomerID` $\rightarrow$ `CUSTOMER`, `ListingID` $\rightarrow$ `LISTING` | **BCNF** | Curatorial critiques and star ratings (`CHECK (Rating BETWEEN 1 AND 5)`). |

*For complete mathematical proofs and functional dependency matrices, see [`docs/NORMALIZATION.md`](docs/NORMALIZATION.md).*

---

## 4. Multi-Table Atomic Transaction Cascade

When an Atelier broker accepts an incoming tender, the platform executes a multi-table atomic transaction (`BEGIN/COMMIT/ROLLBACK`) via `fn_accept_offer` / `transactionService.js`:

```
[Atelier Broker clicks "ACCEPT & EXECUTE ATOMIC SALE" in UI]
                           │
                           ▼
          POST /api/transactions (Atomic Payload)
                           │
                           ▼
┌───────────────────────────────────────────────────────────────┐
│               BEGIN TRANSACTION (PostgreSQL)                  │
│                                                               │
│ 1. Lock and inspect target offer #X                           │
│ 2. UPDATE OFFER SET Status = 'ACCEPTED' WHERE OfferID = X     │
│ 3. UPDATE OFFER SET Status = 'REJECTED'                       │
│    WHERE ListingID = ? AND OfferID <> X AND Status = 'PENDING'│
│ 4. INSERT INTO TRANSACTION (ListingID, Date, 'SALE')          │
│ 5. INSERT INTO SALE_TRANSACTION (TxnID, SalePrice, RegNo)     │
│ 6. UPDATE LISTING SET Status = 'SOLD' WHERE ListingID = ?     │
│ 7. INSERT INTO OWNERSHIP (CustomerID, PropertyID, 100, NOW)   │
│                                                               │
│                     COMMIT TRANSACTION                        │
└───────────────────────────────────────────────────────────────┘
                           │
                           ▼
      [Real-Time Synchronized State Update in Webapp]
   • Listing status immediately changes to 'SOLD' across catalogue.
   • Competing tenders marked 'REJECTED' automatically.
   • Freehold deed appears in acquiring Patron's 'Owned Portfolio'.
   • Permanent Notary record added to 'Closed Contracts' ledger.
```

---

## 5. Frontend Role Portals & Features

The webapp is designed with a luxury architectural editorial theme inspired by international design monographs (*Anton*, *Syne*, *Inter*, *JetBrains Mono*, warm limestone `#D5CEC3`, concrete `#BFC5C9`, dark basalt `#1A1C1E`).

### A. Patron / Customer Portal (`PatronDashboard.tsx`)
* **Confidential Client Dossier Header**: Portfolio valuation, owned properties count, active tenders under deliberation, and settled contracts.
* **Tab 1: Offers & Tenders**:
  * Real-time list of binding acquisition tenders with status badges (`PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).
  * Direct **"Withdraw Offer"** action for pending tenders (`PATCH /api/offers/:id/status`).
  * **"Submit Binding Offer" Modal**: Select curated residence, input binding offer price, review terms, and transmit live (`POST /api/offers`).
* **Tab 2: Deeded Sovereign Portfolio (`OWNERSHIP`)**:
  * Reflects the backend `OWNERSHIP` table.
  * Displays deed record IDs, freehold/fractional shares ($100\%$ Freehold vs. $50\%$ Co-Ownership), acquisition dates, and asset valuations.
* **Tab 3: Settlement & Escrow (`TRANSACTION` + `PAYMENT`)**:
  * Contractual transaction breakdown with legal notary registration codes (`REG-2024-KYOTO-0081`), total consideration, paid-to-date, and balance due.
  * **"Record Settlement Payment" Modal**: Remit multi-installment escrow remittances via Swiss Escrow Wire, Fedwire, or Custodial Transfer (`POST /api/payments`).
  * Live payment audit ledger.
* **Tab 4: Curatorial Reviews (`REVIEW`)**:
  * View verified resident critiques.
  * **"Write Review" Modal**: Rating ($1$ to $5$ stars) and spatial commentary (`POST /api/listings/:id/reviews`).

---

### B. Atelier / Agent Portal (`AgentDashboard.tsx`)
* **Executive Brokerage Desk Header**: Dark basalt theme (`#1A1C1E`). Top metrics tracking Total Listed Gross Volume, Total Settled Transaction Volume, Pending Broker Deliberations, and Atelier Yield ($3\%$ broker commission).
* **Tab 1: Managed Residences Inventory (`LISTING` & `PROPERTY`) — Full CRUD**:
  * **Create**: Click **`+ PUBLISH NEW RESIDENCE`** to publish new monographs with property title, location, architectural typology, asking price, square footage, and hero image (`POST /api/listings`).
  * **Update**: Click **`REVISE`** on any row to update asking price, property description, location, typology, square footage, status, or imagery (`PUT /api/listings/:id`).
  * **Delete**: Click **`DELETE`** on any row. Displays an architectural safety confirmation modal; confirming permanently deletes the listing and recalculates listed gross volume (`DELETE /api/listings/:id`).
* **Tab 2: Incoming Tenders & Atomic Sale Execution Engine**:
  * Deliberate incoming offers with direct price comparison against the asking price.
  * **"ACCEPT & EXECUTE ATOMIC SALE"**: Commits the multi-table atomic transaction in the database.
  * **"Reject Tender"**: Rejects low or invalid offers (`PATCH /api/offers/:id/status` $\rightarrow$ `'REJECTED'`).
* **Tab 3: Executed Contracts Ledger**:
  * Master ledger of closed sale contracts and leases with legal notary registration codes.
* **Tab 4: Atelier Analytics**:
  * Average square footage valuation benchmark ($\$/\text{sq ft}$), offer-to-transaction conversion ratio, and turnover velocity.

---

### C. 3D Immersive Landing Page (`App.tsx`)
* **Interactive Three.js 3D Villa**: Fully modeled modern villa with board-formed concrete, cedar battens, cantilever terrace, infinity pool, daylight vs. dusk illumination toggle, and $360^\circ$ orbit controls.
* **Editorial Carousel**: Huge `Anton` background typography, smooth horizontal movement, trackpad two-finger horizontal scroll listener, and mouse drag swipe.
* **Explore Gallery**: 3D perspective tilt cards with real-time specular sheen highlighting architectural typologies.
* **Master Archive Index Modal**: Searchable catalog of all residences in the database.

---

## 6. Database Artifacts Directory

All SQL files in `db/` are strictly ordered and dependency-checked:

* **[`db/schema.sql`](db/schema.sql)**: DDL definitions for all 13 tables, primary keys, foreign keys, and cascading rules.
* **[`db/constraints.sql`](db/constraints.sql)**: CHECK constraints (`Price > 0`, `AreaSqFt > 0`, `Rating 1-5`), UNIQUE rules (`Email`, `RegistrationNo`, `ReferenceNo`), and referential integrity.
* **[`db/views.sql`](db/views.sql)**:
  * `active_listings_full`: Multi-table join (`LISTING` + `PROPERTY` + `PROPERTY_TYPE` + `AGENT` + `PERSON` + aggregated reviews/offers).
  * `agent_performance_summary`: Performance aggregation view for agents.
  * `property_ownership_summary`: Multi-owner percentage breakdown view.
* **[`db/triggers.sql`](db/triggers.sql)**:
  * `trg_check_sale_subtype` & `trg_check_rental_subtype`: Enforce exclusive transaction specialization.
  * `trg_auto_close_listing`: Automatically updates `LISTING.Status` to `'SOLD'` or `'RENTED'` upon transaction recording.
  * `trg_validate_ownership_share`: Ensures total registered ownership per property does not exceed $100\%$.
* **[`db/functions.sql`](db/functions.sql)**: Stored functions (`fn_accept_offer`, `fn_get_agent_statistics`).
* **[`db/indexes.sql`](db/indexes.sql)**: B-tree indexes for foreign keys, filter attributes (`ListPrice`, `Status`), and sorting attributes (`ListedDate DESC`).
* **[`db/queries.sql`](db/queries.sql)**: Core CRUD queries, 5-table joins, aggregates with `GROUP BY`, CTEs with window functions (`DENSE_RANK()`), multi-statement transaction scripts, and `EXPLAIN ANALYZE` profiling queries.
* **[`db/seed.sql`](db/seed.sql)**: Comprehensive demonstration dataset populating all 13 tables.

---

## 7. API Endpoint Contract Reference

| Method | Endpoint | Description | Role / Clearance |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Atomic registration (`PERSON` + `CUSTOMER`/`AGENT`) | Public |
| `POST` | `/api/auth/login` | Authenticate credentials and receive Bearer JWT | Public |
| `GET` | `/api/auth/me` | Inspect current user session and role metadata | Bearer Token |
| `GET` | `/api/property-types` | Catalog of property typologies | Public |
| `GET` | `/api/properties` | List properties with price/area filtering | Public |
| `GET` | `/api/properties/:id` | Property specifications with ownership breakdown | Public |
| `POST` | `/api/properties` | Add property inventory | Bearer Token |
| `GET` | `/api/listings` | Browse active listings (via `active_listings_full`) | Public |
| `GET` | `/api/listings/:id` | Listing details with representing agent & reviews | Public |
| `POST` | `/api/listings` | Create and publish property listing | Agent Only |
| `PUT` | `/api/listings/:id` | Update listing price, status, or specifications | Agent Only |
| `DELETE` | `/api/listings/:id` | De-list and permanently delete listing | Agent Only |
| `POST` | `/api/offers` | Submit formal acquisition tender | Customer Only |
| `GET` | `/api/offers` | Offers by listing or customer | Bearer Token |
| `PATCH`| `/api/offers/:id/status`| Update offer status (`WITHDRAWN`, `REJECTED`) | Bearer Token |
| `POST` | `/api/transactions` | Accept offer & atomically execute transaction | Agent Only |
| `GET` | `/api/transactions/:id` | Transaction contract details + subtype details | Bearer Token |
| `POST` | `/api/payments` | Record multi-installment escrow payment | Bearer Token |
| `GET` | `/api/listings/:id/reviews`| Curatorial reviews for a listing | Public |
| `POST` | `/api/listings/:id/reviews`| Submit curatorial critique and star rating ($1$–$5$) | Customer Only |

---

## 8. Quick Start & Setup Guide

### Prerequisites
* **Node.js** v18+ installed
* **PostgreSQL** v14+ (Local, Docker, or Cloud e.g. Supabase, Neon, AWS RDS)

### Step 1: Clone Repository & Setup Environment
```bash
git clone https://github.com/Unknownx-x1/Real_estate_dbms.git
cd Real_estate_dbms
cp .env.example backend/.env
```
Edit `backend/.env` with your PostgreSQL database connection string:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/real_estate_db
JWT_SECRET=supersecretjwtkey_monolith_architectural_dbms_2024
```

### Step 2: Initialize Database
```bash
cd backend
npm install
npm run db:init
```
*(Executes: `schema.sql` $\rightarrow$ `constraints.sql` $\rightarrow$ `views.sql` $\rightarrow$ `triggers.sql` $\rightarrow$ `functions.sql` $\rightarrow$ `indexes.sql` $\rightarrow$ `seed.sql`)*

### Step 3: Start Backend API
```bash
npm run dev
```
API runs at `http://localhost:5000/api`. Health check: `http://localhost:5000/api/health`.

### Step 4: Start Frontend Application
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 9. DBMS Viva & Demonstration Checklist

When presenting this project to evaluators or during a DBMS Viva:

1. **Schema & Normalization**:
   - Open [`docs/NORMALIZATION.md`](docs/NORMALIZATION.md) and demonstrate why every table is in BCNF.
   - Explain why `Age` is removed from `PERSON` to prevent transitive dependencies ($\text{PersonID} \rightarrow \text{DOB} \rightarrow \text{Age}$).
   - Show how the $N:N$ `OWNERSHIP` composite key `{CustomerID, PropertyID}` enforces full functional dependency.
2. **Database Integrity & Triggers**:
   - Open `psql` or pgAdmin and demonstrate `trg_check_sale_subtype` preventing a `SALE` transaction from having a record in `RENTAL_CONTRACT`.
   - Show `trg_validate_ownership_share` preventing registered ownership from exceeding $100\%$.
3. **Multi-Table Atomic Transactions**:
   - In the webapp, open the **Atelier Portal $\rightarrow$ Incoming Tenders**.
   - Click **`ACCEPT & EXECUTE ATOMIC SALE`**. Show how one click commits the multi-table transaction in PostgreSQL:
     - Target offer becomes `ACCEPTED`.
     - Competing offers become `REJECTED`.
     - Listing becomes `SOLD`.
     - Notary transaction is registered.
     - Deeded title appears in Patron's **Owned Portfolio**.
4. **Instant 1-Click Role Exploration**:
   - Click **`SIGN IN`** in the header.
   - Click **`PATRON (ALICE)`** for instant customer testing.
   - Click **`ATELIER (ETHAN)`** for instant broker testing.
5. **Postman Collection**:
   - Import [`postman/RealEstateAPI.postman_collection.json`](postman/RealEstateAPI.postman_collection.json) to show organized automated test requests across all relations.
