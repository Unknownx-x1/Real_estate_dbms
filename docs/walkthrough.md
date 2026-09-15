# Monolith Real Estate Platform — Architecture, Backend & Role Frontend Walkthrough

All requirements for the **Database Layer**, **Express Backend**, and **Role-Based Portals (Patron & Atelier)** have been completed and pushed to GitHub: [Unknownx-x1/Real_estate_dbms](https://github.com/Unknownx-x1/Real_estate_dbms).

---

## 1. Role-Based Frontends Built (`frontend/src/components/dashboards/`)

Both roles have been built preserving the established architectural magazine editorial aesthetic (warm limestone `#D5CEC3` / `#D8D2C6`, concrete `#C7CCD1`, dark basalt `#1A1C1E`, `Anton`, `Syne`, `Inter`, `JetBrains Mono`, and hairline borders).

### A. Patron / Customer Portal (`PatronDashboard.tsx`)
* **Confidential Client Dossier Header**:
  * Real-time portfolio valuation, total deeded residences count, active tenders under broker deliberation, and settled contracts.
  * Direct "Back to Archive" navigation and quick "Switch to Atelier" option.
* **Tab 1: Offers & Tenders**:
  * Table of binding purchase tenders with dynamic status pills (`PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).
  * Direct **"Withdraw Offer"** action for pending tenders (`PATCH /api/offers/:id/status`).
  * **"Submit Binding Offer" Modal**: Select curated residence, input binding offer price, review custodial terms, and transmit live (`POST /api/offers`).
* **Tab 2: Deeded Sovereign Portfolio (`OWNERSHIP`)**:
  * Reflects the backend `OWNERSHIP` table.
  * Displays owned properties, deed record ID, percentage ownership share (e.g. 100% Freehold vs. 50% Co-Ownership), acquisition timestamp, and estimated asset value.
* **Tab 3: Settlement & Escrow (`TRANSACTION` + `PAYMENT`)**:
  * Contractual transaction breakdown showing legal registration codes (`REG-2024-KYOTO-0081`), total consideration, paid-to-date, and remaining balance.
  * **"Record Settlement Payment" Modal**: Remit funds against transaction contracts via Swiss Escrow Wire, Fedwire, or Custodial Transfer (`POST /api/payments`).
  * Real-time payment audit log ledger.
* **Tab 4: Curatorial Reviews (`REVIEW`)**:
  * Displays patron architectural critiques.
  * **"Write Review" Modal**: Rating (1-5 stars) and spatial commentary (`POST /api/listings/:id/reviews`).

---

### B. Atelier / Agent Portal (`AgentDashboard.tsx`)
* **Executive Brokerage Desk Header**:
  * High-contrast dark basalt theme (`#1A1C1E`) tailored for executive broker consignment management.
  * Top metrics: Total Listed Gross Volume, Total Settled Transaction Volume, Pending Broker Deliberations, and Atelier Yield (standard 3% broker commission).
* **Tab 1: Managed Residences Inventory (`LISTING`)**:
  * Master inventory table of residences under representation.
  * **"Revise Inventory Record" Modal**: Update asking price (`PUT /api/listings/:id`) and toggle status (`ACTIVE`, `PENDING`, `SOLD`, `INACTIVE`).
  * **"Publish New Residence" Modal**: Publish new monographs with property title, location, architectural typology, asking price, square footage, and archival imagery (`POST /api/listings`).
* **Tab 2: Incoming Tenders & Atomic Execution Engine**:
  * Displays all incoming tenders from patrons with comparison to asking price.
  * **ATOMIC TRANSACTION COMMIT WORKFLOW**:
    * Clicking **"ACCEPT & EXECUTE ATOMIC SALE"** opens the atomic transaction modal.
    * Commits the DBMS atomic cascade:
      1. Marks the target tender as `ACCEPTED`.
      2. Automatically marks all competing tenders on that residence as `REJECTED`.
      3. Updates residence listing status to `SOLD`.
      4. Creates a legal notary transaction record (`POST /api/transactions`).
      5. Automatically deeds the property title to the acquiring patron in the `OWNERSHIP` table.
    * Direct **"Reject Tender"** button (`PATCH /api/offers/:id/status` $\rightarrow$ `REJECTED`).
* **Tab 3: Closed Notary Transactions**:
  * Master ledger of settled sale contracts and leases with legal registration codes.
* **Tab 4: Atelier Analytics**:
  * Average square footage valuation benchmark ($\$/\text{sq ft}$), offer-to-transaction conversion ratio, and turnover velocity.

---

### C. Unified API Client & Offline Sync (`frontend/src/services/api.ts`)
* Communicates directly with the Express backend at `http://localhost:5000/api`.
* Seamless synchronized in-memory fallback store ensuring **100% full-fidelity local testing** even when the PostgreSQL server is offline or being migrated.
* Implements the exact atomic transaction simulation matching backend stored functions and triggers.

---

### D. Seamless Navigation & 1-Click Test Clearance (`HeaderNav.tsx`, `SignInModal.tsx`, `App.tsx`)
* **Editorial Header Switcher**:
  * Header nav includes `PROPERTIES`, `EXPLORE`, `CURATION`, `ABOUT`, plus direct jump links `PATRON` and `ATELIER`.
  * Active session chip displays current logged-in role (`PATRON` or `ATELIER`) with a pulse indicator and sign-out action.
* **1-Click Test Clearance in `SignInModal.tsx`**:
  * Added instant test buttons:
    * `PATRON (ALICE)` $\rightarrow$ Instantly loads Alice Smith's patron session and transitions to the Patron Portal.
    * `ATELIER (ETHAN)` $\rightarrow$ Instantly loads Ethan Miller's broker session and transitions to the Atelier Portal.
  * Full password form with role selector also functional.

---

## 2. Verification & Build Status

* **TypeScript Compilation (`tsc -b`)**: Clean, 0 errors.
* **Vite Bundling (`vite build`)**: Build successful (`dist/assets/` generated cleanly).
* **Git Status**: Pushed to `origin/main` on GitHub (`commit e502d21`).
