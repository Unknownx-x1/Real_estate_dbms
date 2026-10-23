# Horizon Estates — DBMS Academic Monograph & System Portfolio
### Database Management Systems (DBMS) — Comprehensive Digital Assignment Portfolio

[![Project 1: DA2](https://img.shields.io/badge/Project%201-DA2%20Relational%20DBMS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#-project-1--digital-assignment-2-da2)
[![Project 2: DA3](https://img.shields.io/badge/Project%202-DA3%20Polyglot%20%2B%20FalkorDB-FF4F00?style=for-the-badge&logo=redis&logoColor=white)](#-project-2--digital-assignment-3-da3)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

An enterprise-grade, luxury spatial architectural platform and comprehensive database management systems monograph engineered across two progressive academic milestones: **Digital Assignment 2 (DA2)** and **Digital Assignment 3 (DA3)**.

The repository is decoupled into two self-contained project directories:
1. **[Project 1](./Project%201)**: **Relational DBMS & Spatial Platform (DA2)** — Powered by PostgreSQL 15+, 13 BCNF-normalized relations, 14 EER cardinalities, raw SQL repositories, database triggers, views, stored functions, multi-table atomic transactions, and an in-browser live SQL terminal.
2. **[Project 2](./Project%202)**: **Polyglot Real Estate DBMS & Spatial Graph Platform (DA3)** — Expands the architecture into a **Polyglot Persistence** system by introducing an in-memory **FalkorDB (GraphBLAS / RedisGraph)** graph database containerized via Docker alongside PostgreSQL, delivering OpenCypher multi-hop graph traversals and a bespoke architectural graph visualizer.

---

## Repository Structure

```
Real_estate_dbms/
├── README.md                                          # Master Portfolio Documentation (This File)
├── .gitignore                                         # Global Repository Ignore Configuration
│
├── Project 1/                                         # 📁 Digital Assignment 2 (DA2) — Pure Relational DBMS
│   ├── README.md                                      # Comprehensive DA2 Technical Specification & Documentation
│   ├── .env.example                                   # Environment Configuration Template for DA2
│   ├── .gitignore                                     # DA2 Specific Git Ignore
│   ├── real-estate-system-build-plan-detailed...pdf   # Detailed System Build Plan & Team Allocation
│   ├── backend/                                       # Layered Express.js REST API (Parameterized Raw SQL)
│   ├── db/                                            # DDL, BCNF Schema, Pre-Seeded DML, Triggers, Views & Functions
│   ├── docs/                                          # Formal BCNF Normalization Proofs & Architecture Walkthrough
│   ├── frontend/                                      # React 19, Three.js, Tailwind CSS Editorial Interface
│   └── postman/                                       # Postman API Collection
│
└── Project 2/                                         # 📁 Digital Assignment 3 (DA3) — Polyglot Relational + FalkorDB Graph
    ├── README.md                                      # Comprehensive DA3 Technical Specification & Documentation
    ├── docker-compose.yml                             # Containerization Specification for FalkorDB Graph Engine
    ├── .env.example                                   # Environment Configuration Template for DA3
    ├── .gitignore                                     # DA3 Specific Git Ignore
    ├── real-estate-system-build-plan-detailed...pdf   # Detailed System Build Plan & Team Allocation
    ├── backend/                                       # Polyglot Express.js API (PostgreSQL Pool + FalkorDB Graph Client)
    ├── db/                                            # Relational DDL, BCNF Schema, DML Seed Data
    ├── docs/                                          # Technical Documentation & Normalization Proofs
    ├── frontend/                                      # React 19 UI with Interactive FalkorDB Graph Visualizer Terminal
    └── postman/                                       # Postman API Collection
```

> **Note on Sub-Projects**: Both [Project 1](./Project%201) and [Project 2](./Project%202) retain their full, independent technical documentation in their respective `README.md` files:
> - Direct link to **[Project 1 README](./Project%201/README.md)**
> - Direct link to **[Project 2 README](./Project%202/README.md)**

---

## Architectural Evolution: DA2 vs. DA3

| Dimension | Project 1 (DA2 — Relational Focus) | Project 2 (DA3 — Polyglot Persistence Focus) |
| :--- | :--- | :--- |
| **Persistence Model** | Single ACID Relational Store | **Polyglot Persistence** (Dual Database Engine) |
| **Relational Database** | PostgreSQL 15+ (13 BCNF Relations) | PostgreSQL 15+ (Transactional System of Record) |
| **Graph Database** | *None* | **FalkorDB** (RedisGraph GraphBLAS Engine in Docker) |
| **Query Paradigms** | Parameterized Raw SQL, Joins, Aggregations | SQL + **OpenCypher Property Graph Traversals** |
| **Containerization** | Host-native PostgreSQL | **Docker Compose** containerized FalkorDB (`port 6379`) |
| **Specialized UI Tools** | In-Browser SQL Terminal & Schema Explorer | **Interactive Bespoke Architectural Graph Visualizer** |
| **Relationship Traversal** | Multi-table relational `JOIN` operations | Sub-millisecond Matrix-Multiplication Graph Traversals |
| **Complex Relationship Queries** | Relational foreign key index scans | Multi-hop proximity, developer portfolios & investor networks |

---

## 🏛️ Project 1 — Digital Assignment 2 (DA2)

### Relational Real Estate DBMS & Spatial Platform
*Detailed documentation: **[Project 1 / README.md](./Project%201/README.md)***

Project 1 establishes an enterprise-grade relational foundation adhering strictly to formal database theory and modern web architectural standards.

### Key Academic Highlights
* **Decoupled 3-Tier Architecture**: A clear separation of concerns between presentation (React 19 SPA), application logic (Express.js layered REST services with zero ORM overhead), and persistent storage (PostgreSQL 15+).
* **Boyce-Codd Normal Form (BCNF)**: 13 granular relations engineered without insertion, deletion, or update anomalies. All functional dependencies $X \rightarrow Y$ satisfy the condition where $X$ is a superkey.
* **14 EER Cardinalities**: Fully articulated relationships covering mandatory-1 to optional-$N$, many-to-many junction tables, and inheritance hierarchies for persons (`PATRON` vs. `ATELIER`).
* **Database Logic at Engine Level**:
  * **Triggers**: Automated triggers (`fn_enforce_single_accepted_offer`, `fn_audit_sale_price_stamp`, `fn_record_status_audit`) preventing race conditions and invalid states at the database layer.
  * **Analytical Views**: Materialized view logic and complex queries for portfolio performance and agent metrics.
  * **Multi-Table Atomic Transactions**: `BEGIN ... COMMIT / ROLLBACK` transaction boundaries handling simultaneous offer acceptance, contract instantiation, and property status transition.
* **In-Browser SQL Query Terminal**: A live interactive database sandbox embedded in the client UI allowing evaluators to run arbitrary raw SQL queries, inspect table schemas, and execute pre-configured assessment benchmarks.

### Quick Start — Project 1
```bash
# Navigate to Project 1 backend
cd "Project 1/backend"
cp .env.example .env
npm install

# Initialize PostgreSQL schema and seed test data
npm run db:init
npm run db:seed

# Launch backend (port 5000)
npm run dev

# In a separate terminal, launch Project 1 frontend (port 5173)
cd "../frontend"
npm install
npm run dev
```

---

## 🌐 Project 2 — Digital Assignment 3 (DA3)

### Polyglot Real Estate DBMS & Spatial Graph Architecture Platform
*Detailed documentation: **[Project 2 / README.md](./Project%202/README.md)***

Project 2 expands the relational system into a **Polyglot Persistence Architecture**, integrating an ultra-fast in-memory graph database alongside the transactional relational database.

### Key Academic Highlights
* **Polyglot Persistence Strategy**:
  * **PostgreSQL 15+**: Handles financial transactions, user authentication, legal ownership contracts, offers, and payment ledgers requiring strict ACID compliance.
  * **FalkorDB (GraphBLAS)**: Encodes complex networked relationships into an adjacency matrix property graph, computing multi-hop traversals via sparse matrix linear algebra.
* **Property Graph Schema**:
  * **Nodes**: `:Property`, `:Buyer`, `:Agent`, `:Developer`, `:Neighborhood`, `:Amenity`, `:Transaction`
  * **Relationships**: `[:OWNS]`, `[:LISTED_BY]`, `[:DEVELOPED]`, `[:LOCATED_IN]`, `[:HAS_AMENITY]`, `[:TRANSACTED]`
* **OpenCypher Traversal Engine**:
  * Real-time spatial proximity discovery (e.g. properties sharing luxury amenities across specific neighborhoods).
  * Agent collaboration and portfolio density analysis.
  * Multi-hop investor co-investment network analysis.
* **Architectural Graph Visualizer**: A bespoke luxury architectural terminal embedded in the React 19 frontend featuring real-time node-physics visualization, interactive Cypher query presets, graph entity inspector, and performance telemetry.

### Quick Start — Project 2
```bash
# Navigate to Project 2
cd "Project 2"

# Start the FalkorDB Graph Engine in Docker
docker-compose up -d

# Setup Project 2 backend
cd backend
cp .env.example .env
npm install

# Initialize relational database and seed the FalkorDB graph
npm run db:init
npm run db:seed
npm run db:seed-graph

# Launch backend (port 5000)
npm run dev

# In a separate terminal, launch Project 2 frontend (port 5173)
cd "../frontend"
npm install
npm run dev
```

---

## Unified System Portals & Test Credentials

Both projects share a common pre-seeded demonstration dataset with role-based authentication:

| Role | Username / Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Patron (Buyer / Client)** | `patron@horizon.estates` | `Patron123!` | Property search, luxury portfolio inquiry, offer submissions, transaction history |
| **Atelier (Broker / Agent)** | `atelier@horizon.estates` | `Atelier123!` | Listing management, offer approvals/counter-offers, client contracts, commission ledgers |
| **Evaluator / Administrator** | In-Browser Terminal | *None Required* | Live SQL query terminal (Project 1) / Live Cypher graph visualizer (Project 2) |

---

## Technology Stack Summary

```mermaid
flowchart TD
    subgraph Presentation_Tier ["Client Presentation Tier (Browser)"]
        UI["React 19 + TypeScript + Tailwind CSS"]
        Canvas["Three.js Luxury 3D Architectural Stage"]
        Terminal1["Project 1: In-Browser SQL Terminal"]
        Terminal2["Project 2: FalkorDB GraphBLAS Explorer"]
    end

    subgraph Application_Tier ["Application Tier (Node.js & Express.js)"]
        API["Layered RESTful API Gateway (port 5000)"]
        Auth["JWT & Role-Based Middleware"]
        Controllers["Resource Controllers & Business Logic"]
        SQLRepo["Parameterized Raw SQL Repositories"]
        GraphClient["FalkorDB Client (GraphBLAS Cypher Driver)"]
    end

    subgraph Persistence_Tier ["Polyglot Persistence Tier"]
        PG[("PostgreSQL 15+\nRelational ACID Ledger\n(13 BCNF Relations)")]
        Falkor[("FalkorDB in Docker\nIn-Memory Property Graph\n(Sparse Matrix Engine)")]
    end

    UI --> API
    Terminal1 --> API
    Terminal2 --> API
    API --> Auth --> Controllers
    Controllers --> SQLRepo --> PG
    Controllers --> GraphClient --> Falkor
```

---

## Academic Verification & Delivery Checklist

- [x] **Project 1 (DA2)**: Contained completely inside [`/Project 1`](./Project%201) with standalone `README.md`, source code, DDL scripts, BCNF proofs, and Postman collection.
- [x] **Project 2 (DA3)**: Contained completely inside [`/Project 2`](./Project%202) with standalone `README.md`, Docker Compose setup, FalkorDB client, Cypher seed scripts, GraphExplorer visualizer, and Postman collection.
- [x] **Separated Documentation**: Existing comprehensive documentation preserved for each project.
- [x] **Unified Overview**: Root `README.md` synthesizes both milestones, detailing design rationale, comparative analysis, and operational guides.

---

*Horizon Estates Architectural DBMS Monograph — Academic Coursework for Database Management Systems.*
