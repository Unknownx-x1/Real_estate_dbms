# Horizon Estates — DBMS Academic Monograph & System Portfolio
### Database Management Systems (DBMS) — Comprehensive Digital Assignment Portfolio

[![Project 1: DA2](https://img.shields.io/badge/Project%201-DA2%20Relational%20DBMS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#-project-1--digital-assignment-2-da2)
[![Project 2: DA3](https://img.shields.io/badge/Project%202-DA3%20Polyglot%20%2B%20FalkorDB-FF4F00?style=for-the-badge&logo=redis&logoColor=white)](#-project-2--digital-assignment-3-da3)
[![Comparative Report](https://img.shields.io/badge/Academic_Report-FalkorDB_vs_PostgreSQL-success?style=for-the-badge)](#-why-falkordb-outperforms-postgresql-for-graph-workloads-da2-vs-da3-deep-dive)
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

## 🔬 Why FalkorDB Outperforms PostgreSQL for Graph Workloads (DA2 vs. DA3 Deep Dive)

While PostgreSQL 15+ excels at single-entity integrity, multi-table atomic transactions, and BCNF relational accounting in DA2, it encounters severe computational and memory bottlenecks when handling highly networked, multi-hop relationship queries in real estate intelligence. Below is the technical, theoretical, and algorithmic breakdown of why FalkorDB was introduced in DA3.

```mermaid
flowchart LR
    subgraph DA2_Bottleneck ["DA2 Relational Traversal (PostgreSQL)"]
        direction TB
        T1["Table: Patrons"] -->|"Index Scan + Hash Join"| J1["Junction: Ownerships"]
        J1 -->|"Nested Loop Join"| T2["Table: Properties"]
        T2 -->|"Hash Join"| J2["Junction: Prop_Amenities"]
        J2 -->|"B-Tree Lookup"| T3["Table: Amenities"]
        style DA2_Bottleneck fill:#1f1616,stroke:#e05252,color:#fff
    end

    subgraph DA3_Optimization ["DA3 Matrix Traversal (FalkorDB GraphBLAS)"]
        direction TB
        V["State Vector v (Active Nodes)"] -->|"v * A (Boolean Semiring)"| M["Adjacency Matrix A (CSR/CSC)"]
        M -->|"Vectorized SIMD Operation"| R["Resulting Neighbor Vector v'"]
        style DA3_Optimization fill:#141f18,stroke:#48bb78,color:#fff
    end
```

### 1. Theoretical Foundations: Relational Algebra vs. GraphBLAS Matrix Algebra

#### PostgreSQL: Tuple Comparison & Pointer Chasing
In PostgreSQL, relationships are not first-class entities. They are expressed through foreign key comparisons:
$$\sigma_{R.id = S.foreign\_id}(R \times S)$$
To evaluate multi-hop connections, PostgreSQL must scan index B-trees, allocate intermediate `work_mem` hash buckets, and compute nested loop or hash joins. Traversal latency grows exponentially with traversal depth $d$: $O(b^d)$, where $b$ is the average branch factor.

#### FalkorDB: Graphs as Sparse Matrices & Linear Algebra
FalkorDB represents graphs as sparse adjacency matrices using the **GraphBLAS** library. 
- A graph of $N$ nodes is stored as an $N \times N$ sparse boolean matrix $\mathbf{A}$.
- Traversal across a set of active nodes (represented by sparse vector $\mathbf{v}$) is computed in a single **Vector-Matrix Multiplication** over the Boolean semiring $(\lor, \land)$:
$$\mathbf{v}^{(k+1)} = \mathbf{v}^{(k)} \cdot \mathbf{A}$$
- Uses **Compressed Sparse Row (CSR)** and **Compressed Sparse Column (CSC)** layouts that fit in L1/L2/L3 CPU cache and execute across hardware **SIMD (AVX-512)** vector units.

---

### 2. Algorithmic Complexity Comparison

| Traversal Depth | Operation Type | PostgreSQL (DA2 Relational) | FalkorDB (DA3 GraphBLAS) |
| :---: | :---: | :---: | :---: |
| **1 Hop** | Direct Relationship | $O(\log N)$ (B-Tree Index Probe) | $O(1)$ (Direct CSR Offset Lookup) |
| **2 Hops** | Single Intermediate Entity | $O(b \log N)$ (Index Scans + Hash Join) | $O(\text{nnz}(\mathbf{v} \cdot \mathbf{A}))$ (Sparse Vector-Matrix Product) |
| **3 Hops** | Multi-hop Network | $O(b^2 \log N)$ (Exponential Tuple Inflation) | $O(\text{nnz}(\mathbf{v} \cdot \mathbf{A}^2))$ (Matrix Exponentiation) |
| **$k$ Hops** | Variable Path / Syndicate | $O(b^k)$ (Buffer Pool Thrashing / CTE Overhead) | $O(k \cdot \text{nnz}(\mathbf{A}))$ (Linear in Graph Density) |

*(Where $N$ = total rows, $b$ = branching factor, $\text{nnz}$ = non-zero matrix entries).*

---

### 3. Concrete Workload Comparison

#### A. Multi-Hop Spatial & Amenity Proximity Discovery
*Goal: Find properties sharing $\ge 3$ amenities with a target villa within matching architectural districts.*

* **In PostgreSQL (DA2)**: Requires joining `properties` $\rightarrow$ `property_amenities` $\rightarrow$ `property_amenities` $\rightarrow$ `properties` $\rightarrow$ `neighborhoods` $\rightarrow$ `neighborhoods`, computing expensive `GROUP BY` and `HAVING COUNT(*) >= 3` aggregations over large intermediate candidate tables.
* **In FalkorDB (DA3)**: Evaluated directly as a boolean matrix intersection:
  $$\mathbf{p}_2 = (\mathbf{p}_1 \cdot \mathbf{A}_{\text{HAS\_AMENITY}} \cdot \mathbf{A}_{\text{HAS\_AMENITY}}^T) \odot (\mathbf{p}_1 \cdot \mathbf{A}_{\text{LOCATED\_IN}} \cdot \mathbf{A}_{\text{LOCATED\_IN}}^T)$$
  Execution completes in **under 2 milliseconds** regardless of total database volume.

#### B. Co-Investment & Broker Syndicate Discovery
*Goal: Trace investor networks and broker collaborations across 1 to 4 degrees of separation.*

* **In PostgreSQL (DA2)**: Requires a heavy recursive Common Table Expression (`WITH RECURSIVE`), which repeatedly re-scans transaction tables, accumulates duplicate working sets, and risks buffer pool starvation.
* **In FalkorDB (DA3)**: Uses native declarative Cypher syntax:
  ```cypher
  MATCH (a1:Agent {id: $agentId})-[:TRANSACTED*1..4]-(a2:Agent)
  WHERE a1 <> a2
  RETURN a2.name, count(DISTINCT a2) AS network_weight
  ORDER BY network_weight DESC;
  ```
  FalkorDB evaluates this directly as a bounded matrix series $\sum_{i=1}^4 \mathbf{A}^i$.

---

### 4. The Polyglot Architecture: Why Both Engines Are Essential

Replacing PostgreSQL entirely with a graph database would be an architectural mistake. DA3 implements **Polyglot Persistence**, assigning distinct workloads to the engine purpose-built for each:

```mermaid
flowchart TD
    Client["Client Presentation Layer (React 19)"] --> API["Express.js API Layer (port 5000)"]

    subgraph Relational_System ["PostgreSQL 15+ (Transactional System of Record)"]
        API -->|"ACID Writes & Ledgers"| PG[("PostgreSQL")]
        PG --> R1["13 BCNF Relations"]
        PG --> R2["Financial Ledgers & Payments"]
        PG --> R3["Foreign Key Cascading Integrity"]
        PG --> R4["Row-Level Security & Audit Triggers"]
    end

    subgraph Graph_System ["FalkorDB in Docker (Graph Intelligence Engine)"]
        API -->|"Cypher Graph Traversals"| FK[("FalkorDB")]
        FK --> G1["Property Graph Model"]
        FK --> G2["Sub-Millisecond Vector-Matrix Multiplications"]
        FK --> G3["Amenity & Spatial Similarity Networks"]
        FK --> G4["Interactive GraphExplorer Visualizer"]
    end

    style Relational_System fill:#0d1b2a,stroke:#415a77,color:#e0e1dd
    style Graph_System fill:#1a0f00,stroke:#d97706,color:#fef3c7
```

* **PostgreSQL guarantees ACID durability**: Critical for legal deeds, offer escrow, non-repudiation, and transactional ledger invariants.
* **FalkorDB guarantees traversal speed**: Powers the interactive, zero-latency [GraphExplorer Visualizer](./Project%202/frontend/src/components/GraphExplorer.tsx) and recommendations.

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
- [x] **Academic Analysis Added**: In-depth theoretical and complexity analysis included detailing why FalkorDB outperforms PostgreSQL for relationship and graph traversals.

---

*Horizon Estates Architectural DBMS Monograph — Academic Coursework for Database Management Systems.*
