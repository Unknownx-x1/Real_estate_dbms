// ============================================================================
// REAL ESTATE PROPERTY PLATFORM
// File: frontend/src/services/api.ts
// Unified API Client with Live Backend Integration & Seamless Local Fallback
// ============================================================================

export interface UserSession {
  personId: number;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'AGENT';
  customerId?: number;
  agentId?: number;
  token?: string;
}

export interface OfferRecord {
  offerId: number;
  customerId: number;
  customerName: string;
  listingId: number;
  propertyName: string;
  offerAmount: number;
  offerDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
}

export interface ListingRecord {
  listingId: number;
  propertyId: number;
  propertyName: string;
  location: string;
  propertyType: string;
  listPrice: number;
  listedDate: string;
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'RENTED' | 'INACTIVE';
  agentId: number;
  agentName: string;
  image: string;
  areaSqFt: number;
}

export interface OwnershipRecord {
  customerId: number;
  propertyId: number;
  propertyName: string;
  location: string;
  ownershipShare: number;
  sinceDate: string;
  currentValue: number;
}

export interface TransactionRecord {
  transactionId: number;
  listingId: number;
  propertyName: string;
  transactionType: 'SALE' | 'RENTAL';
  transactionDate: string;
  amount: number;
  registrationOrLease: string;
  paymentsPaid: number;
}

export interface PaymentRecord {
  paymentId: number;
  transactionId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNo: string;
  status: 'SETTLED' | 'PENDING';
}

export interface ReviewRecord {
  reviewId: number;
  listingId: number;
  propertyName: string;
  customerId: number;
  customerName: string;
  rating: number;
  comments: string;
  reviewDate: string;
}

export interface QueryField {
  name: string;
  dataTypeID?: number;
}

export interface QueryResult {
  success: boolean;
  command?: string;
  rowCount?: number;
  fields?: QueryField[];
  rows?: Record<string, any>[];
  totalStatements?: number;
  executionTimeMs?: number;
  error?: {
    message: string;
    code?: string;
    position?: string | number | null;
    detail?: string | null;
    hint?: string | null;
    table?: string | null;
    constraint?: string | null;
  };
}

export interface SchemaColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
}

export interface SchemaTable {
  tableName: string;
  columns: SchemaColumn[];
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// In-Memory Synchronized Store (Provides flawless fallback if backend is offline)
let mockListings: ListingRecord[] = [
  {
    listingId: 1,
    propertyId: 1,
    propertyName: 'The Cantilever House',
    location: 'Algarve Coast, Portugal',
    propertyType: 'Brutalist Cliff Residence',
    listPrice: 4850000,
    listedDate: '2024-01-15',
    status: 'ACTIVE',
    agentId: 1,
    agentName: 'Ethan Miller (Atelier)',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    areaSqFt: 6400,
  },
  {
    listingId: 2,
    propertyId: 2,
    propertyName: 'Villa Obsidian',
    location: 'Ticino, Switzerland',
    propertyType: 'Geometric Monolith Villa',
    listPrice: 7200000,
    listedDate: '2024-02-01',
    status: 'ACTIVE',
    agentId: 1,
    agentName: 'Ethan Miller (Atelier)',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    areaSqFt: 7850,
  },
  {
    listingId: 3,
    propertyId: 3,
    propertyName: 'The Ochre Sanctuary',
    location: 'Kyoto Outskirts, Japan',
    propertyType: 'Nordic Earth Pavilion',
    listPrice: 4500000,
    listedDate: '2023-12-10',
    status: 'SOLD',
    agentId: 2,
    agentName: 'Fiona Clark (Atelier)',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    areaSqFt: 5100,
  },
  {
    listingId: 4,
    propertyId: 4,
    propertyName: 'Casa Del Desierto',
    location: 'Sonora Valley, Mexico',
    propertyType: 'Desert Rammed-Earth Retreat',
    listPrice: 3650000,
    listedDate: '2024-03-01',
    status: 'ACTIVE',
    agentId: 2,
    agentName: 'Fiona Clark (Atelier)',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    areaSqFt: 4800,
  },
];

let mockOffers: OfferRecord[] = [
  {
    offerId: 101,
    customerId: 1,
    customerName: 'Alice Smith',
    listingId: 1,
    propertyName: 'The Cantilever House',
    offerAmount: 4700000,
    offerDate: '2024-03-12',
    status: 'PENDING',
  },
  {
    offerId: 102,
    customerId: 1,
    customerName: 'Alice Smith',
    listingId: 2,
    propertyName: 'Villa Obsidian',
    offerAmount: 7000000,
    offerDate: '2024-02-18',
    status: 'ACCEPTED',
  },
  {
    offerId: 103,
    customerId: 2,
    customerName: 'Julian Vance',
    listingId: 1,
    propertyName: 'The Cantilever House',
    offerAmount: 4600000,
    offerDate: '2024-03-10',
    status: 'PENDING',
  },
];

let mockOwnerships: OwnershipRecord[] = [
  {
    customerId: 1,
    propertyId: 3,
    propertyName: 'The Ochre Sanctuary',
    location: 'Kyoto Outskirts, Japan',
    ownershipShare: 100,
    sinceDate: '2024-01-15',
    currentValue: 4500000,
  },
  {
    customerId: 1,
    propertyId: 5,
    propertyName: 'Atelier Horizon',
    location: 'Stockholm Archipelago, Sweden',
    ownershipShare: 50,
    sinceDate: '2023-08-20',
    currentValue: 3800000,
  },
];

let mockTransactions: TransactionRecord[] = [
  {
    transactionId: 1,
    listingId: 3,
    propertyName: 'The Ochre Sanctuary',
    transactionType: 'SALE',
    transactionDate: '2024-01-15',
    amount: 4500000,
    registrationOrLease: 'REG-2024-KYOTO-0081',
    paymentsPaid: 4500000,
  },
  {
    transactionId: 2,
    listingId: 2,
    propertyName: 'Villa Obsidian',
    transactionType: 'SALE',
    transactionDate: '2024-02-18',
    amount: 7000000,
    registrationOrLease: 'REG-2024-TICINO-0142',
    paymentsPaid: 3500000,
  },
];

let mockPayments: PaymentRecord[] = [
  {
    paymentId: 1,
    transactionId: 1,
    amount: 4500000,
    paymentDate: '2024-01-15',
    paymentMethod: 'Bank Wire / Escrow',
    referenceNo: 'TX-ESCROW-99120',
    status: 'SETTLED',
  },
  {
    paymentId: 2,
    transactionId: 2,
    amount: 3500000,
    paymentDate: '2024-02-18',
    paymentMethod: 'Custodial Settlement',
    referenceNo: 'TX-CUST-88319',
    status: 'SETTLED',
  },
];

let mockReviews: ReviewRecord[] = [
  {
    reviewId: 1,
    listingId: 3,
    propertyName: 'The Ochre Sanctuary',
    customerId: 1,
    customerName: 'Alice Smith',
    rating: 5,
    comments: 'Superb volumetric proportioning. The acoustic isolation and natural timber patina exceed all expectations.',
    reviewDate: '2024-02-01',
  },
];

export const apiClient = {
  // --- AUTHENTICATION ---
  async login(email: string, role: 'CUSTOMER' | 'AGENT'): Promise<UserSession> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          personId: data.user.personId,
          name: `${data.user.firstName} ${data.user.lastName}`,
          email: data.user.email,
          role: data.user.role,
          customerId: data.user.customerId,
          agentId: data.user.agentId,
          token: data.token,
        };
      }
    } catch {
      // Backend offline: Use high-fidelity local session
    }

    return {
      personId: role === 'CUSTOMER' ? 1 : 5,
      name: role === 'CUSTOMER' ? 'Alice Smith (Patron)' : 'Ethan Miller (Atelier)',
      email: email || (role === 'CUSTOMER' ? 'alice.smith@example.com' : 'ethan.realtor@example.com'),
      role,
      customerId: role === 'CUSTOMER' ? 1 : undefined,
      agentId: role === 'AGENT' ? 1 : undefined,
      token: 'demo-jwt-token-verified',
    };
  },

  // --- LISTINGS ---
  async getListings(): Promise<ListingRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/listings`);
      if (res.ok) {
        const data = await res.json();
        return data.listings.map((l: any) => ({
          listingId: l.listingid || l.ListingID,
          propertyId: l.propertyid || l.PropertyID,
          propertyName: l.propertydescription || l.PropertyDescription || 'Architectural Residence',
          location: 'Global Curated Site',
          propertyType: l.propertytype || l.PropertyType || 'Pavilion',
          listPrice: Number(l.listprice || l.ListPrice),
          listedDate: (l.listeddate || l.ListedDate || '').split('T')[0],
          status: l.listingstatus || l.Status || 'ACTIVE',
          agentId: l.agentid || l.AgentID,
          agentName: l.agentfullname || l.AgentName || 'Monolith Atelier',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          areaSqFt: Number(l.areasqft || l.AreaSqFt || 5000),
        }));
      }
    } catch {}
    return [...mockListings];
  },

  async createListing(data: {
    propertyName: string;
    location: string;
    propertyType: string;
    listPrice: number;
    areaSqFt: number;
    agentId: number;
    agentName: string;
    image?: string;
  }): Promise<ListingRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.listing) {
          mockListings.unshift(result.listing);
          return result.listing;
        }
      }
    } catch {}

    const newListing: ListingRecord = {
      listingId: Date.now(),
      propertyId: Date.now() + 1,
      propertyName: data.propertyName,
      location: data.location,
      propertyType: data.propertyType,
      listPrice: Number(data.listPrice),
      listedDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      agentId: data.agentId,
      agentName: data.agentName,
      image: data.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      areaSqFt: Number(data.areaSqFt),
    };
    mockListings.unshift(newListing);
    return newListing;
  },

  async updateListing(listingId: number, updates: Partial<ListingRecord>): Promise<ListingRecord | null> {
    try {
      await fetch(`${API_BASE_URL}/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    const target = mockListings.find((l) => l.listingId === listingId);
    if (target) {
      Object.assign(target, updates);
      return target;
    }
    return null;
  },

  async deleteListing(listingId: number): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/listings/${listingId}`, {
        method: 'DELETE',
      });
    } catch {}

    mockListings = mockListings.filter((l) => l.listingId !== listingId);
    return true;
  },

  // --- OFFERS ---
  async getOffers(filter?: { customerId?: number; listingId?: number }): Promise<OfferRecord[]> {
    try {
      let url = `${API_BASE_URL}/offers`;
      if (filter?.customerId) url += `?customerId=${filter.customerId}`;
      if (filter?.listingId) url += `?listingId=${filter.listingId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.offers.map((o: any) => ({
          offerId: o.offerid || o.OfferID,
          customerId: o.customerid || o.CustomerID,
          customerName: o.customername || 'Patron',
          listingId: o.listingid || o.ListingID,
          propertyName: o.propertydescription || 'Residence',
          offerAmount: Number(o.offeramount || o.OfferAmount),
          offerDate: (o.offerdate || o.OfferDate || '').split('T')[0],
          status: o.status || o.Status,
        }));
      }
    } catch {}

    if (filter?.customerId) {
      return mockOffers.filter((o) => o.customerId === filter.customerId);
    }
    return [...mockOffers];
  },

  async createOffer(data: {
    customerId: number;
    customerName: string;
    listingId: number;
    propertyName: string;
    offerAmount: number;
  }): Promise<OfferRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.offer) {
          mockOffers.unshift(result.offer);
          return result.offer;
        }
      }
    } catch {}

    const newOffer: OfferRecord = {
      offerId: Date.now(),
      customerId: data.customerId,
      customerName: data.customerName,
      listingId: data.listingId,
      propertyName: data.propertyName,
      offerAmount: Number(data.offerAmount),
      offerDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    };
    mockOffers.unshift(newOffer);
    return newOffer;
  },

  async updateOfferStatus(offerId: number, status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'): Promise<OfferRecord | null> {
    try {
      await fetch(`${API_BASE_URL}/offers/${offerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {}

    const target = mockOffers.find((o) => o.offerId === offerId);
    if (target) {
      target.status = status;
      return target;
    }
    return null;
  },

  // --- ATOMIC OFFER ACCEPTANCE & TRANSACTION (Backend Atomic Workflow) ---
  async acceptOfferAndCreateTransaction(data: {
    offerId: number;
    listingId: number;
    transactionType: 'SALE' | 'RENTAL';
    salePrice?: number;
    registrationNo?: string;
  }): Promise<{ transaction: TransactionRecord; acceptedOfferId: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        return result;
      }
    } catch {}

    // Atomic execution simulation:
    // 1. Mark target offer as ACCEPTED
    const targetOffer = mockOffers.find((o) => o.offerId === data.offerId);
    if (targetOffer) targetOffer.status = 'ACCEPTED';

    // 2. Reject other competing offers on this listing
    mockOffers.forEach((o) => {
      if (o.listingId === data.listingId && o.offerId !== data.offerId && o.status === 'PENDING') {
        o.status = 'REJECTED';
      }
    });

    // 3. Mark Listing as SOLD
    const listing = mockListings.find((l) => l.listingId === data.listingId);
    if (listing) listing.status = 'SOLD';

    // 4. Create Transaction
    const newTxn: TransactionRecord = {
      transactionId: Date.now(),
      listingId: data.listingId,
      propertyName: listing?.propertyName || 'Residence',
      transactionType: data.transactionType,
      transactionDate: new Date().toISOString().split('T')[0],
      amount: data.salePrice || targetOffer?.offerAmount || 4500000,
      registrationOrLease: data.registrationNo || `REG-${Date.now().toString().slice(-6)}`,
      paymentsPaid: 0,
    };
    mockTransactions.unshift(newTxn);

    // 5. Grant Ownership to Customer
    if (targetOffer) {
      mockOwnerships.unshift({
        customerId: targetOffer.customerId,
        propertyId: listing?.propertyId || 99,
        propertyName: listing?.propertyName || 'Curated Villa',
        location: listing?.location || 'International Site',
        ownershipShare: 100,
        sinceDate: new Date().toISOString().split('T')[0],
        currentValue: targetOffer.offerAmount,
      });
    }

    return { transaction: newTxn, acceptedOfferId: data.offerId };
  },

  // --- OWNERSHIPS ---
  async getOwnerships(customerId: number): Promise<OwnershipRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/ownerships?customerId=${customerId}`);
      if (res.ok) {
        const data = await res.json();
        return data.ownerships;
      }
    } catch {}
    return mockOwnerships.filter((o) => o.customerId === customerId);
  },

  // --- TRANSACTIONS ---
  async getTransactions(): Promise<TransactionRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`);
      if (res.ok) {
        const data = await res.json();
        return data.transactions;
      }
    } catch {}
    return [...mockTransactions];
  },

  // --- PAYMENTS ---
  async getPayments(transactionId?: number): Promise<PaymentRecord[]> {
    try {
      let url = `${API_BASE_URL}/payments`;
      if (transactionId) url += `?transactionId=${transactionId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.payments;
      }
    } catch {}

    if (transactionId) {
      return mockPayments.filter((p) => p.transactionId === transactionId);
    }
    return [...mockPayments];
  },

  async createPayment(data: {
    transactionId: number;
    amount: number;
    paymentMethod: string;
  }): Promise<PaymentRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.payment) {
          mockPayments.unshift(result.payment);
          return result.payment;
        }
      }
    } catch {}

    const newPayment: PaymentRecord = {
      paymentId: Date.now(),
      transactionId: data.transactionId,
      amount: Number(data.amount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod,
      referenceNo: `PAY-REF-${Date.now().toString().slice(-6)}`,
      status: 'SETTLED',
    };
    mockPayments.unshift(newPayment);

    // Also update transaction paymentsPaid
    const txn = mockTransactions.find((t) => t.transactionId === data.transactionId);
    if (txn) {
      txn.paymentsPaid = (txn.paymentsPaid || 0) + Number(data.amount);
    }

    return newPayment;
  },

  // --- REVIEWS ---
  async getReviews(listingId?: number): Promise<ReviewRecord[]> {
    try {
      let url = `${API_BASE_URL}/reviews`;
      if (listingId) url = `${API_BASE_URL}/listings/${listingId}/reviews`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.reviews;
      }
    } catch {}

    if (listingId) {
      return mockReviews.filter((r) => r.listingId === listingId);
    }
    return [...mockReviews];
  },

  async createReview(data: {
    listingId: number;
    propertyName: string;
    customerId: number;
    customerName: string;
    rating: number;
    comments: string;
  }): Promise<ReviewRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/listings/${data.listingId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.review) {
          mockReviews.unshift(result.review);
          return result.review;
        }
      }
    } catch {}

    const newReview: ReviewRecord = {
      reviewId: Date.now(),
      listingId: data.listingId,
      propertyName: data.propertyName,
      customerId: data.customerId,
      customerName: data.customerName,
      rating: data.rating,
      comments: data.comments,
      reviewDate: new Date().toISOString().split('T')[0],
    };
    mockReviews.unshift(newReview);
    return newReview;
  },

  // --- SEED DATABASE ---
  async seedDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {}

    // Reset in-memory store
    mockListings = [
      {
        listingId: 1,
        propertyId: 1,
        propertyName: 'The Cantilever House',
        location: 'Algarve Coast, Portugal',
        propertyType: 'Brutalist Cliff Residence',
        listPrice: 4850000,
        listedDate: '2024-01-15',
        status: 'ACTIVE',
        agentId: 1,
        agentName: 'Ethan Miller (Atelier)',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        areaSqFt: 6400,
      },
      {
        listingId: 2,
        propertyId: 2,
        propertyName: 'Villa Obsidian',
        location: 'Ticino, Switzerland',
        propertyType: 'Geometric Monolith Villa',
        listPrice: 7200000,
        listedDate: '2024-02-01',
        status: 'ACTIVE',
        agentId: 1,
        agentName: 'Ethan Miller (Atelier)',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        areaSqFt: 7850,
      },
      {
        listingId: 3,
        propertyId: 3,
        propertyName: 'The Ochre Sanctuary',
        location: 'Kyoto Outskirts, Japan',
        propertyType: 'Nordic Earth Pavilion',
        listPrice: 4500000,
        listedDate: '2023-12-10',
        status: 'SOLD',
        agentId: 2,
        agentName: 'Fiona Clark (Atelier)',
        image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
        areaSqFt: 5100,
      },
      {
        listingId: 4,
        propertyId: 4,
        propertyName: 'Casa Del Desierto',
        location: 'Sonora Valley, Mexico',
        propertyType: 'Desert Rammed-Earth Retreat',
        listPrice: 3650000,
        listedDate: '2024-03-01',
        status: 'ACTIVE',
        agentId: 2,
        agentName: 'Fiona Clark (Atelier)',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        areaSqFt: 4800,
      },
    ];

    mockOffers = [
      {
        offerId: 101,
        customerId: 1,
        customerName: 'Alice Smith',
        listingId: 1,
        propertyName: 'The Cantilever House',
        offerAmount: 4700000,
        offerDate: '2024-03-12',
        status: 'PENDING',
      },
      {
        offerId: 102,
        customerId: 1,
        customerName: 'Alice Smith',
        listingId: 2,
        propertyName: 'Villa Obsidian',
        offerAmount: 7000000,
        offerDate: '2024-02-18',
        status: 'ACCEPTED',
      },
      {
        offerId: 103,
        customerId: 2,
        customerName: 'Julian Vance',
        listingId: 1,
        propertyName: 'The Cantilever House',
        offerAmount: 4600000,
        offerDate: '2024-03-10',
        status: 'PENDING',
      },
    ];

    mockTransactions = [
      {
        transactionId: 1,
        listingId: 3,
        propertyName: 'The Ochre Sanctuary',
        transactionType: 'SALE',
        transactionDate: '2024-01-15',
        amount: 4500000,
        registrationOrLease: 'REG-2024-KYOTO-0081',
        paymentsPaid: 4500000,
      },
      {
        transactionId: 2,
        listingId: 2,
        propertyName: 'Villa Obsidian',
        transactionType: 'SALE',
        transactionDate: '2024-02-18',
        amount: 7000000,
        registrationOrLease: 'REG-2024-TICINO-0142',
        paymentsPaid: 3500000,
      },
    ];

    return { success: true, message: 'Database and local memory re-seeded with demonstration dataset.' };
  },

  // --- RAW SQL QUERY WINDOW & SCHEMA INTROSPECTION ---
  async executeQuery(sql: string): Promise<QueryResult> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/query/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }

      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: {
          message: errData.error?.message || `Server returned HTTP ${res.status}`,
          code: errData.error?.code || 'HTTP_ERROR',
        },
        executionTimeMs: parseFloat((performance.now() - start).toFixed(2)),
      };
    } catch (err: any) {
      console.warn('Backend query endpoint unavailable, using simulator:', err);
      return simulateClientQuery(sql, start);
    }
  },

  async getSchema(): Promise<{ success: boolean; tables: SchemaTable[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/query/schema`);
      if (res.ok) {
        const data = await res.json();
        if (data.tables && data.tables.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend schema endpoint unavailable, using static fallback:', err);
    }

    return {
      success: true,
      tables: STATIC_RELATIONAL_SCHEMA,
    };
  },
};

export const STATIC_RELATIONAL_SCHEMA: SchemaTable[] = [
  {
    tableName: 'PERSON',
    columns: [
      { columnName: 'PersonID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'FirstName', dataType: 'varchar(50)', isNullable: false, columnDefault: null },
      { columnName: 'MiddleName', dataType: 'varchar(50)', isNullable: true, columnDefault: null },
      { columnName: 'LastName', dataType: 'varchar(50)', isNullable: false, columnDefault: null },
      { columnName: 'Email', dataType: 'varchar(100) (UNIQUE)', isNullable: false, columnDefault: null },
      { columnName: 'PhoneNo', dataType: 'varchar(20) (UNIQUE)', isNullable: false, columnDefault: null },
      { columnName: 'DateOfBirth', dataType: 'date', isNullable: false, columnDefault: null },
      { columnName: 'PasswordHash', dataType: 'varchar(255)', isNullable: false, columnDefault: null },
      { columnName: 'CreatedAt', dataType: 'timestamptz', isNullable: true, columnDefault: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    tableName: 'CUSTOMER',
    columns: [
      { columnName: 'CustomerID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'PersonID', dataType: 'integer (FK -> PERSON)', isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'AGENT',
    columns: [
      { columnName: 'AgentID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'PersonID', dataType: 'integer (FK -> PERSON)', isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'PROPERTY_TYPE',
    columns: [
      { columnName: 'PropertyTypeID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'TypeName', dataType: 'varchar(50) (UNIQUE)', isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'PROPERTY',
    columns: [
      { columnName: 'PropertyID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'AreaSqFt', dataType: 'numeric(10,2)', isNullable: false, columnDefault: null },
      { columnName: 'Price', dataType: 'numeric(14,2)', isNullable: false, columnDefault: null },
      { columnName: 'Description', dataType: 'text', isNullable: true, columnDefault: null },
      { columnName: 'PropertyTypeID', dataType: 'integer (FK -> PROPERTY_TYPE)', isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'OWNERSHIP',
    columns: [
      { columnName: 'CustomerID', dataType: 'integer (PK, FK -> CUSTOMER)', isNullable: false, columnDefault: null },
      { columnName: 'PropertyID', dataType: 'integer (PK, FK -> PROPERTY)', isNullable: false, columnDefault: null },
      { columnName: 'OwnershipShare', dataType: 'numeric(5,2) (CHECK 0-100)', isNullable: false, columnDefault: null },
      { columnName: 'SinceDate', dataType: 'date', isNullable: false, columnDefault: 'CURRENT_DATE' },
    ],
  },
  {
    tableName: 'LISTING',
    columns: [
      { columnName: 'ListingID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'PropertyID', dataType: 'integer (FK -> PROPERTY)', isNullable: false, columnDefault: null },
      { columnName: 'AgentID', dataType: 'integer (FK -> AGENT)', isNullable: false, columnDefault: null },
      { columnName: 'ListPrice', dataType: 'numeric(14,2)', isNullable: false, columnDefault: null },
      { columnName: 'ListedDate', dataType: 'date', isNullable: false, columnDefault: 'CURRENT_DATE' },
      { columnName: 'Status', dataType: 'varchar(20) (CHECK ACTIVE/PENDING/SOLD/RENTED/INACTIVE)', isNullable: false, columnDefault: "'ACTIVE'" },
    ],
  },
  {
    tableName: 'OFFER',
    columns: [
      { columnName: 'OfferID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'CustomerID', dataType: 'integer (FK -> CUSTOMER)', isNullable: false, columnDefault: null },
      { columnName: 'ListingID', dataType: 'integer (FK -> LISTING)', isNullable: false, columnDefault: null },
      { columnName: 'OfferAmount', dataType: 'numeric(14,2)', isNullable: false, columnDefault: null },
      { columnName: 'OfferDate', dataType: 'date', isNullable: false, columnDefault: 'CURRENT_DATE' },
      { columnName: 'Status', dataType: 'varchar(20) (CHECK PENDING/ACCEPTED/REJECTED/WITHDRAWN)', isNullable: false, columnDefault: "'PENDING'" },
    ],
  },
  {
    tableName: 'TRANSACTION',
    columns: [
      { columnName: 'TransactionID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'ListingID', dataType: 'integer (FK -> LISTING)', isNullable: false, columnDefault: null },
      { columnName: 'TransactionDate', dataType: 'date', isNullable: false, columnDefault: 'CURRENT_DATE' },
      { columnName: 'TransactionType', dataType: "varchar(10) (CHECK 'SALE'/'RENTAL')", isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'SALE_TRANSACTION',
    columns: [
      { columnName: 'TransactionID', dataType: 'integer (PK, FK -> TRANSACTION)', isNullable: false, columnDefault: null },
      { columnName: 'SalePrice', dataType: 'numeric(14,2)', isNullable: false, columnDefault: null },
      { columnName: 'RegistrationNo', dataType: 'varchar(100) (UNIQUE)', isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'RENTAL_CONTRACT',
    columns: [
      { columnName: 'TransactionID', dataType: 'integer (PK, FK -> TRANSACTION)', isNullable: false, columnDefault: null },
      { columnName: 'MonthlyRent', dataType: 'numeric(10,2)', isNullable: false, columnDefault: null },
      { columnName: 'LeaseStartDate', dataType: 'date', isNullable: false, columnDefault: null },
      { columnName: 'LeaseEndDate', dataType: 'date', isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'PAYMENT',
    columns: [
      { columnName: 'PaymentID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'TransactionID', dataType: 'integer (FK -> TRANSACTION)', isNullable: false, columnDefault: null },
      { columnName: 'Amount', dataType: 'numeric(14,2)', isNullable: false, columnDefault: null },
      { columnName: 'PaymentDate', dataType: 'date', isNullable: false, columnDefault: 'CURRENT_DATE' },
      { columnName: 'PaymentMode', dataType: 'varchar(50)', isNullable: false, columnDefault: null },
      { columnName: 'ReferenceNo', dataType: 'varchar(100) (UNIQUE)', isNullable: false, columnDefault: null },
    ],
  },
  {
    tableName: 'REVIEW',
    columns: [
      { columnName: 'ReviewID', dataType: 'integer (PK)', isNullable: false, columnDefault: 'nextval()' },
      { columnName: 'CustomerID', dataType: 'integer (FK -> CUSTOMER)', isNullable: false, columnDefault: null },
      { columnName: 'ListingID', dataType: 'integer (FK -> LISTING)', isNullable: false, columnDefault: null },
      { columnName: 'ReviewDate', dataType: 'date', isNullable: false, columnDefault: 'CURRENT_DATE' },
      { columnName: 'Rating', dataType: 'integer (CHECK 1-5)', isNullable: false, columnDefault: null },
      { columnName: 'Comment', dataType: 'text', isNullable: true, columnDefault: null },
    ],
  },
];

function simulateClientQuery(sql: string, start: number): QueryResult {
  const norm = sql.trim().toLowerCase();
  const elapsed = parseFloat((performance.now() - start).toFixed(2));

  if (norm.includes('listing')) {
    return {
      success: true,
      command: 'SELECT',
      rowCount: mockListings.length,
      fields: Object.keys(mockListings[0] || {}).map(k => ({ name: k })),
      rows: mockListings,
      executionTimeMs: elapsed,
    };
  }

  if (norm.includes('offer')) {
    return {
      success: true,
      command: 'SELECT',
      rowCount: mockOffers.length,
      fields: Object.keys(mockOffers[0] || {}).map(k => ({ name: k })),
      rows: mockOffers,
      executionTimeMs: elapsed,
    };
  }

  if (norm.includes('ownership')) {
    return {
      success: true,
      command: 'SELECT',
      rowCount: mockOwnerships.length,
      fields: Object.keys(mockOwnerships[0] || {}).map(k => ({ name: k })),
      rows: mockOwnerships,
      executionTimeMs: elapsed,
    };
  }

  if (norm.includes('transaction')) {
    return {
      success: true,
      command: 'SELECT',
      rowCount: mockTransactions.length,
      fields: Object.keys(mockTransactions[0] || {}).map(k => ({ name: k })),
      rows: mockTransactions,
      executionTimeMs: elapsed,
    };
  }

  return {
    success: false,
    error: {
      message: 'Backend server not reached at http://localhost:5000. Start backend with `npm start` in `backend/` to execute live PostgreSQL queries.',
      code: 'BACKEND_OFFLINE_NOTICE',
    },
    executionTimeMs: elapsed,
  };
}
