# Database Normalization Report

**Project**: Real Estate Property Listing & Management System  
**Objective**: Comprehensive relation-by-relation normalization analysis ($1\text{NF} \rightarrow 2\text{NF} \rightarrow 3\text{NF} \rightarrow \text{BCNF}$), functional dependency audit, and EER integrity verification.

---

## 1. Normalization Strategy & Principles

In accordance with the system specification:
1. **Relation-by-Relation Demonstration**: Normalization is demonstrated per entity/relationship rather than manufacturing an artificial, bloated monolithic relation.
2. **Preservation of EER Semantics**: Dependencies reflect real-world business rules without artificial decompositions.
3. **Derived Attribute Removal**: Derived attributes (such as `Age` from `DateOfBirth`) are explicitly eliminated from physical persistence.
4. **Subtype & Composite Integrity**: The $N:N$ `OWNERSHIP` composite key and ISA specialization hierarchies (`CUSTOMER`/`AGENT` and `SALE_TRANSACTION`/`RENTAL_CONTRACT`) are strictly maintained.

---

## 2. Relation-by-Relation Analysis

### 2.1 `PERSON`
*   **Attributes**: `(PersonID, FirstName, MiddleName, LastName, Email, PhoneNo, DateOfBirth, PasswordHash, CreatedAt)`
*   **Candidate Keys**: `{PersonID}`, `{Email}`
*   **Primary Key**: `PersonID`
*   **Functional Dependencies (FDs)**:
    *   $\text{PersonID} \rightarrow \text{FirstName}, \text{MiddleName}, \text{LastName}, \text{Email}, \text{PhoneNo}, \text{DateOfBirth}, \text{PasswordHash}, \text{CreatedAt}$
    *   $\text{Email} \rightarrow \text{PersonID}, \text{FirstName}, \dots$
*   **1NF Evaluation**: All attributes are atomic (scalar). First, middle, and last names are decomposed. Multi-valued phone numbers are modeled with separate contact records or standard scalar representation. **Status: 1NF satisfied.**
*   **2NF Evaluation**: Candidate keys are single attributes (`PersonID`, `Email`). Therefore, no partial key dependencies can exist ($\text{Proper Subset of Candidate Key} \rightarrow \text{Non-prime attribute}$). **Status: 2NF satisfied.**
*   **3NF & BCNF Evaluation**:
    *   *Pre-normalization issue*: If `Age` were stored, the dependency $\text{DateOfBirth} \rightarrow \text{Age}$ would form a transitive dependency ($\text{PersonID} \rightarrow \text{DateOfBirth} \rightarrow \text{Age}$).
    *   *Resolution*: `Age` is removed from the persistent schema and computed dynamically via `AGE(CURRENT_DATE, DateOfBirth)`.
    *   Every determinant in the relation ($\text{PersonID}$, $\text{Email}$) is a superkey.
*   **Conclusion**: `PERSON` is in **BCNF**.

---

### 2.2 `CUSTOMER` & `AGENT` (Subtypes of `PERSON`)
*   **`CUSTOMER` Attributes**: `(CustomerID, PersonID)`
*   **`AGENT` Attributes**: `(AgentID, PersonID)`
*   **Candidate Keys**: 
    *   `CUSTOMER`: `{CustomerID}`, `{PersonID}`
    *   `AGENT`: `{AgentID}`, `{PersonID}`
*   **Primary Keys**: `CustomerID`, `AgentID`
*   **FDs**:
    *   $\text{CustomerID} \leftrightarrow \text{PersonID}$
    *   $\text{AgentID} \leftrightarrow \text{PersonID}$
*   **Analysis**:
    *   **1NF**: Atomic scalar values.
    *   **2NF**: All candidate keys are simple (single-attribute), eliminating partial dependencies.
    *   **3NF / BCNF**: Both $\text{CustomerID}$ and $\text{PersonID}$ are superkeys. Every determinant is a candidate key.
*   **Conclusion**: Both `CUSTOMER` and `AGENT` are in **BCNF**.

---

### 2.3 `PROPERTY_TYPE`
*   **Attributes**: `(PropertyTypeID, TypeName)`
*   **Candidate Keys**: `{PropertyTypeID}`, `{TypeName}`
*   **Primary Key**: `PropertyTypeID`
*   **FDs**: $\text{PropertyTypeID} \leftrightarrow \text{TypeName}$
*   **Analysis**: Single-attribute candidate keys, every determinant is a superkey. Eliminates repeating string anomalies across properties.
*   **Conclusion**: `PROPERTY_TYPE` is in **BCNF**.

---

### 2.4 `PROPERTY`
*   **Attributes**: `(PropertyID, AreaSqFt, Price, Description, PropertyTypeID)`
*   **Candidate Keys**: `{PropertyID}`
*   **Primary Key**: `PropertyID`
*   **FDs**: $\text{PropertyID} \rightarrow \text{AreaSqFt}, \text{Price}, \text{Description}, \text{PropertyTypeID}$
*   **Analysis**:
    *   **1NF**: All attributes are atomic scalars.
    *   **2NF**: Candidate key is single-attribute (`PropertyID`). No partial dependencies possible.
    *   **3NF**: Notice `PropertyTypeID` is stored rather than embedding `TypeName` inside `PROPERTY`. If `TypeName` were embedded, the transitive dependency $\text{PropertyID} \rightarrow \text{PropertyTypeID} \rightarrow \text{TypeName}$ would violate 3NF. Separating `PROPERTY_TYPE` satisfies 3NF.
    *   **BCNF**: The only determinant is `PropertyID`, which is the candidate key.
*   **Conclusion**: `PROPERTY` is in **BCNF**.

---

### 2.5 `OWNERSHIP` (N:N Junction Table)
*   **Attributes**: `(CustomerID, PropertyID, OwnershipShare, SinceDate)`
*   **Candidate Keys**: `{(CustomerID, PropertyID)}` (Composite Key)
*   **Primary Key**: `(CustomerID, PropertyID)`
*   **FDs**:
    *   $(\text{CustomerID}, \text{PropertyID}) \rightarrow \text{OwnershipShare}, \text{SinceDate}$
*   **1NF Evaluation**: Atomic attributes. **1NF satisfied.**
*   **2NF Evaluation**:
    *   The primary key is composite: $\{\text{CustomerID}, \text{PropertyID}\}$.
    *   Does $\text{CustomerID} \rightarrow \text{OwnershipShare}$? No. A customer holds different shares across different properties.
    *   Does $\text{PropertyID} \rightarrow \text{OwnershipShare}$? No. A property can be owned by multiple customers.
    *   Neither non-prime attribute (`OwnershipShare`, `SinceDate`) is functionally dependent on a proper subset of the candidate key.
    *   **Status: 2NF strictly satisfied.**
*   **3NF / BCNF Evaluation**:
    *   There are no non-trivial dependencies between non-prime attributes ($\text{OwnershipShare} \not\rightarrow \text{SinceDate}$ and vice versa).
    *   The determinant $(\text{CustomerID}, \text{PropertyID})$ is the superkey.
*   **Conclusion**: `OWNERSHIP` is in **BCNF**.

---

### 2.6 `LISTING`
*   **Attributes**: `(ListingID, PropertyID, AgentID, ListPrice, ListedDate, Status)`
*   **Candidate Keys**: `{ListingID}`
*   **Primary Key**: `ListingID`
*   **FDs**:
    *   $\text{ListingID} \rightarrow \text{PropertyID}, \text{AgentID}, \text{ListPrice}, \text{ListedDate}, \text{Status}$
*   **Analysis**:
    *   *Pre-normalization check*: If descriptive agent fields (e.g. `AgentName`, `AgentEmail`, `AgentPhone`) or property details (`AreaSqFt`, `Description`) were stored in `LISTING`, transitive dependencies would exist:
        $$\text{ListingID} \rightarrow \text{AgentID} \rightarrow (\text{AgentName}, \text{AgentEmail})$$
        $$\text{ListingID} \rightarrow \text{PropertyID} \rightarrow (\text{AreaSqFt}, \text{Description})$$
    *   *Resolution*: Descriptive data lives in `PERSON`/`AGENT` and `PROPERTY`. `LISTING` holds only the foreign keys `PropertyID` and `AgentID`.
    *   Candidate key is single-attribute $\rightarrow$ no partial key dependencies.
    *   No transitive dependencies exist.
*   **Conclusion**: `LISTING` is in **BCNF**.

---

### 2.7 `OFFER`
*   **Attributes**: `(OfferID, CustomerID, ListingID, OfferAmount, OfferDate, Status)`
*   **Candidate Keys**: `{OfferID}`
*   **Primary Key**: `OfferID`
*   **FDs**: $\text{OfferID} \rightarrow \text{CustomerID}, \text{ListingID}, \text{OfferAmount}, \text{OfferDate}, \text{Status}$
*   **Analysis**:
    *   *Pre-normalization check*: Storing customer contact details (`CustomerName`, `CustomerEmail`) would violate 3NF via $\text{OfferID} \rightarrow \text{CustomerID} \rightarrow \text{CustomerName}$.
    *   *Resolution*: Only `CustomerID` is persisted as an FK. All non-prime attributes depend solely and directly on `OfferID`.
*   **Conclusion**: `OFFER` is in **BCNF**.

---

### 2.8 `TRANSACTION`
*   **Attributes**: `(TransactionID, ListingID, TransactionDate, TransactionType)`
*   **Candidate Keys**: `{TransactionID}`
*   **Primary Key**: `TransactionID`
*   **FDs**: $\text{TransactionID} \rightarrow \text{ListingID}, \text{TransactionDate}, \text{TransactionType}$
*   **Analysis**:
    *   `ListingID` determines property and agent context transitively via `LISTING`. Redundant property or buyer/seller data is strictly omitted from `TRANSACTION`.
    *   `TransactionType` acts as the discriminator for exclusive subtype enforcement.
    *   Determinant is the candidate key.
*   **Conclusion**: `TRANSACTION` is in **BCNF**.

---

### 2.9 `SALE_TRANSACTION` & `RENTAL_CONTRACT` (ISA Subtypes of `TRANSACTION`)
*   **`SALE_TRANSACTION` Attributes**: `(TransactionID, SalePrice, RegistrationNo)`
    *   **Candidate Keys**: `{TransactionID}`, `{RegistrationNo}`
    *   **Primary Key**: `TransactionID` (Foreign Key referencing `TRANSACTION(TransactionID)`)
    *   **FDs**:
        *   $\text{TransactionID} \rightarrow \text{SalePrice}, \text{RegistrationNo}$
        *   $\text{RegistrationNo} \rightarrow \text{TransactionID}, \text{SalePrice}$
*   **`RENTAL_CONTRACT` Attributes**: `(TransactionID, MonthlyRent, LeaseStartDate, LeaseEndDate)`
    *   **Candidate Keys**: `{TransactionID}`
    *   **Primary Key**: `TransactionID` (Foreign Key referencing `TRANSACTION(TransactionID)`)
    *   **FDs**: $\text{TransactionID} \rightarrow \text{MonthlyRent}, \text{LeaseStartDate}, \text{LeaseEndDate}$
*   **Analysis**:
    *   Modeling sales and rentals as separate subtype tables rather than a single wide table with nullable attributes eliminates NULL anomalies and satisfies 3NF and BCNF.
    *   Every determinant is a superkey.
*   **Conclusion**: Both subtype relations are in **BCNF**.

---

### 2.10 `PAYMENT`
*   **Attributes**: `(PaymentID, TransactionID, Amount, PaymentDate, PaymentMode, ReferenceNo)`
*   **Candidate Keys**: `{PaymentID}`, `{ReferenceNo}`
*   **Primary Key**: `PaymentID`
*   **FDs**:
    *   $\text{PaymentID} \rightarrow \text{TransactionID}, \text{Amount}, \text{PaymentDate}, \text{PaymentMode}, \text{ReferenceNo}$
    *   $\text{ReferenceNo} \rightarrow \text{PaymentID}, \dots$
*   **Analysis**: Single-attribute candidate keys. All determinants are candidate keys.
*   **Conclusion**: `PAYMENT` is in **BCNF**.

---

### 2.11 `REVIEW`
*   **Attributes**: `(ReviewID, CustomerID, ListingID, ReviewDate, Rating, Comment)`
*   **Candidate Keys**: `{ReviewID}`
*   **Primary Key**: `ReviewID`
*   **FDs**: $\text{ReviewID} \rightarrow \text{CustomerID}, \text{ListingID}, \text{ReviewDate}, \text{Rating}, \text{Comment}$
*   **Analysis**: Customer details and listing details are not duplicated; only foreign keys are stored. All non-prime attributes directly depend on `ReviewID`.
*   **Conclusion**: `REVIEW` is in **BCNF**.

---

## 3. Summary of Normal Form Verification

| Relation | 1NF | 2NF | 3NF | BCNF | Key Normalization Actions Taken |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **PERSON** | ✓ | ✓ | ✓ | ✓ | Derived `Age` removed; atomic names & emails. |
| **CUSTOMER** | ✓ | ✓ | ✓ | ✓ | 1:1 ISA subtype mapping with `PERSON`. |
| **AGENT** | ✓ | ✓ | ✓ | ✓ | 1:1 ISA subtype mapping with `PERSON`. |
| **PROPERTY_TYPE** | ✓ | ✓ | ✓ | ✓ | Extracted to independent catalog to remove repetitive text anomalies. |
| **PROPERTY** | ✓ | ✓ | ✓ | ✓ | References `PropertyTypeID`; no transitive descriptions. |
| **OWNERSHIP** | ✓ | ✓ | ✓ | ✓ | Composite PK `(CustomerID, PropertyID)`; full functional dependency. |
| **LISTING** | ✓ | ✓ | ✓ | ✓ | Removed transitive agent/property columns. |
| **OFFER** | ✓ | ✓ | ✓ | ✓ | Retains only `CustomerID` and `ListingID` FKs. |
| **TRANSACTION** | ✓ | ✓ | ✓ | ✓ | Retains only `ListingID` FK and discriminator. |
| **SALE_TRANSACTION** | ✓ | ✓ | ✓ | ✓ | Specialized subtype; avoids NULL anomalies. |
| **RENTAL_CONTRACT** | ✓ | ✓ | ✓ | ✓ | Specialized subtype; avoids NULL anomalies. |
| **PAYMENT** | ✓ | ✓ | ✓ | ✓ | Multiple payment settlement per transaction; unique references. |
| **REVIEW** | ✓ | ✓ | ✓ | ✓ | Decoupled reviews tying customer to listing. |
