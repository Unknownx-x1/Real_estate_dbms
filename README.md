# Real Estate Property Listing & Management System

> **Full-Stack Relational Database Management System** built with **PostgreSQL**, **Node.js/Express (Raw SQL with `pg`)**, and **React/Vite**.  
> Designed and implemented according to the rigorous DBMS specification, covering 13 normalized relations, 14 EER cardinalities, database constraints, triggers, views, stored functions, and atomic multi-table transactions.

---

## 1. System Architecture

```
[ Frontend: React / Vite ] 
          ↓ (REST API / JSON / Bearer JWT)
[ Backend: Node.js / Express ]
          ↓ (Route → Controller → Service → Repository)
[ Database Layer: node-postgres (pg-pool) ]
          ↓ (Raw Parameterized SQL)
[ PostgreSQL Database (13 Relations, Views, Triggers, Indexes) ]
```

### Key Architectural Decisions (From Build Plan)
* **Raw SQL (`node-postgres`)**: No ORM (Prisma avoided) so that all joins, constraints, foreign keys, and transactions are visible and auditable for DBMS grading.
* **Separation of Concerns**: `Route → Controller → Service → Repository → Parameterized SQL`. Controllers contain zero SQL strings.
* **Database Enforced Rules**: Foreign key constraints, CHECKs, triggers (subtype exclusivity, auto-status updates, 100% ownership cap).
* **Multi-Table Transactions**: Real `BEGIN/COMMIT/ROLLBACK` SQL transactions for atomic flows (user registration, offer acceptance).

---

## 2. Relational Schema & Normalization (13 Tables)

| Table | Primary Key | Foreign Keys | Normal Form | Key Purpose |
| :--- | :--- | :--- | :---: | :--- |
| **`PERSON`** | `PersonID` | None | BCNF | Base person entity (Age derived from DOB, not stored). |
| **`CUSTOMER`** | `CustomerID` | `PersonID` $\rightarrow$ `PERSON` (1:1) | BCNF | Subtype representing property buyers/renters. |
| **`AGENT`** | `AgentID` | `PersonID` $\rightarrow$ `PERSON` (1:1) | BCNF | Subtype representing licensed real estate agents. |
| **`PROPERTY_TYPE`**| `PropertyTypeID` | None | BCNF | Lookup catalog for property categories. |
| **`PROPERTY`** | `PropertyID` | `PropertyTypeID` $\rightarrow$ `PROPERTY_TYPE` | BCNF | Property inventory details. |
| **`OWNERSHIP`** | `(CustomerID, PropertyID)`| Composite PK $\rightarrow$ `CUSTOMER`, `PROPERTY`| BCNF | $N:N$ ownership junction table. |
| **`LISTING`** | `ListingID` | `PropertyID` $\rightarrow$ `PROPERTY`, `AgentID` $\rightarrow$ `AGENT` | BCNF | Property listing managed by an agent. |
| **`OFFER`** | `OfferID` | `CustomerID` $\rightarrow$ `CUSTOMER`, `ListingID` $\rightarrow$ `LISTING` | BCNF | Formal offer made by customer on a listing. |
| **`TRANSACTION`** | `TransactionID`| `ListingID` $\rightarrow$ `LISTING` | BCNF | Supertype for completed agreements. |
| **`SALE_TRANSACTION`**| `TransactionID`| `TransactionID` $\rightarrow$ `TRANSACTION` (1:1) | BCNF | Subtype for property purchases. |
| **`RENTAL_CONTRACT`** | `TransactionID`| `TransactionID` $\rightarrow$ `TRANSACTION` (1:1) | BCNF | Subtype for property leases. |
| **`PAYMENT`** | `PaymentID` | `TransactionID` $\rightarrow$ `TRANSACTION` | BCNF | Installments and deposits settling a transaction. |
| **`REVIEW`** | `ReviewID` | `CustomerID` $\rightarrow$ `CUSTOMER`, `ListingID` $\rightarrow$ `LISTING` | BCNF | Feedback and ratings (1 to 5 stars). |

*See [`docs/NORMALIZATION.md`](docs/NORMALIZATION.md) for the mathematical proof and relation-by-relation decomposition.*

---

## 3. Database Artifacts Directory (`db/`)

* **`db/schema.sql`**: Complete DDL definitions for all 13 tables, keys, and foreign keys in dependency order.
* **`db/constraints.sql`**: CHECK constraints, UNIQUE rules, and referential constraints.
* **`db/views.sql`**: Non-trivial browse view (`active_listings_full`), `agent_performance_summary`, and `property_ownership_summary`.
* **`db/triggers.sql`**:
  1. Exclusive transaction subtype check (`SALE` vs `RENTAL`).
  2. Automatic listing status update (`ACTIVE` $\rightarrow$ `'SOLD'` or `'RENTED'`) on transaction insertion.
  3. Total ownership percentage cap ($\le 100\%$) per property.
* **`db/functions.sql`**: Stored functions (`fn_accept_offer`, `fn_get_agent_statistics`).
* **`db/indexes.sql`**: B-tree indexes for foreign keys and filter/sorting columns.
* **`db/queries.sql`**: Core CRUD queries, 5-table joins, aggregates (`GROUP BY`), CTEs with `DENSE_RANK()`, and `EXPLAIN ANALYZE` scripts.
* **`db/seed.sql`**: Realistic demo data populating all 13 tables.

---

## 4. Quick Start & Setup

### Prerequisites
* Node.js v18+ installed
* PostgreSQL database (Local, Docker, or Cloud e.g. Supabase, Neon, AWS RDS)

### Step 1: Clone and Configure Environment
```bash
cp .env.example backend/.env
```
Edit `backend/.env` with your PostgreSQL database credentials:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/real_estate_db
JWT_SECRET=supersecretjwtkey_realestate_management_system_2024
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Run Automated Database Initialization
This command connects to your PostgreSQL instance and executes the entire SQL pipeline in order:
```bash
npm run db:init
```
*(Executes: `schema.sql` $\rightarrow$ `constraints.sql` $\rightarrow$ `views.sql` $\rightarrow$ `triggers.sql` $\rightarrow$ `functions.sql` $\rightarrow$ `indexes.sql` $\rightarrow$ `seed.sql`)*

### Step 4: Start the Backend Server
```bash
npm run dev
# Or for production:
npm start
```
The server will start at `http://localhost:5000`.  
Health check endpoint: `http://localhost:5000/api/health`.

---

## 5. API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Atomic register (`PERSON` + `CUSTOMER`/`AGENT`) | Public |
| `POST` | `/api/auth/login` | Authenticate and receive JWT | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | Bearer Token |
| `GET` | `/api/property-types` | Property categories catalog | Public |
| `GET` | `/api/properties` | List properties with price/area filters | Public |
| `GET` | `/api/properties/:id` | Property details with owners list | Public |
| `POST` | `/api/properties` | Add property inventory | Bearer Token |
| `GET` | `/api/listings` | Browse active listings (via `active_listings_full`) | Public |
| `GET` | `/api/listings/:id` | Listing details with agent & reviews | Public |
| `POST` | `/api/listings` | Create property listing | Agent Only |
| `POST` | `/api/offers` | Submit offer on an active listing | Customer Only |
| `GET` | `/api/offers` | Offers by listing or customer | Bearer Token |
| `POST` | `/api/transactions` | Accept offer & atomically record transaction | Agent Only |
| `GET` | `/api/transactions/:id` | Transaction details + subtype details | Bearer Token |
| `POST` | `/api/payments` | Record payment settlement | Bearer Token |
| `GET` | `/api/listings/:id/reviews` | Reviews for a listing | Public |
| `POST` | `/api/listings/:id/reviews` | Submit a review (Rating 1-5) | Customer Only |

---

## 6. DBMS Viva & Demonstration Artifacts

During the DBMS Viva/Demo, you can demonstrate:
1. **Schema & Keys**: Walkthrough of `db/schema.sql` and `db/constraints.sql`.
2. **Normalization Proofs**: Present `docs/NORMALIZATION.md` showing BCNF verification and derived attribute removal.
3. **Database Views**: Run `SELECT * FROM active_listings_full;` in `psql` or pgAdmin.
4. **Database Triggers**: Show how `trg_check_sale_subtype` rejects invalid subtypes and `trg_auto_close_listing` marks listings as `SOLD`.
5. **Atomic Multi-Table Transactions**: Demonstrate offer acceptance (`POST /api/transactions`) executing `BEGIN/COMMIT/ROLLBACK`.
6. **Query Performance (`EXPLAIN ANALYZE`)**: Run the query in `db/queries.sql` showing index execution plans.
7. **Postman Collection**: Import `postman/RealEstateAPI.postman_collection.json` into Postman and execute the full test flow.
