import React, { useState, useEffect } from 'react';
import {
  apiClient,
  type UserSession,
  type OfferRecord,
  type ListingRecord,
  type OwnershipRecord,
  type TransactionRecord,
  type PaymentRecord,
  type ReviewRecord,
} from '../../services/api';
import {
  Shield,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  CreditCard,
  Star,
  Plus,
  RefreshCw,
  X,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface PatronDashboardProps {
  session: UserSession;
  onNavigateHome: () => void;
  onSwitchToAgent: () => void;
}

export const PatronDashboard: React.FC<PatronDashboardProps> = ({
  session,
  onNavigateHome,
  onSwitchToAgent,
}) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'portfolio' | 'settlement' | 'reviews'>('offers');
  const [loading, setLoading] = useState(true);

  // Data states
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [ownerships, setOwnerships] = useState<OwnershipRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  // Modal states
  const [isNewOfferOpen, setIsNewOfferOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [isNewReviewOpen, setIsNewReviewOpen] = useState(false);

  // Form states
  const [selectedListingId, setSelectedListingId] = useState<number | ''>('');
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [selectedTxnId, setSelectedTxnId] = useState<number | ''>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Swiss Escrow Wire Transfer');
  const [reviewListingId, setReviewListingId] = useState<number | ''>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allListings, patronOffers, patronOwnerships, allTxns, allPayments, allReviews] =
        await Promise.all([
          apiClient.getListings(),
          apiClient.getOffers({ customerId: session.customerId || 1 }),
          apiClient.getOwnerships(session.customerId || 1),
          apiClient.getTransactions(),
          apiClient.getPayments(),
          apiClient.getReviews(),
        ]);

      setListings(allListings);
      setOffers(patronOffers);
      setOwnerships(patronOwnerships);
      setTransactions(allTxns);
      setPayments(allPayments);
      setReviews(allReviews.filter((r) => r.customerId === (session.customerId || 1)));
    } catch (err) {
      console.error('Failed to load patron data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [session.customerId]);

  // Actions
  const handleWithdrawOffer = async (offerId: number) => {
    if (!confirm('Are you certain you wish to withdraw this binding acquisition tender?')) return;
    await apiClient.updateOfferStatus(offerId, 'WITHDRAWN');
    showNotification('Acquisition offer withdrawn from registry.');
    await loadAllData();
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingId || !offerAmount) return;
    const targetListing = listings.find((l) => l.listingId === Number(selectedListingId));
    if (!targetListing) return;

    await apiClient.createOffer({
      customerId: session.customerId || 1,
      customerName: session.name,
      listingId: targetListing.listingId,
      propertyName: targetListing.propertyName,
      offerAmount: Number(offerAmount),
    });

    setIsNewOfferOpen(false);
    setSelectedListingId('');
    setOfferAmount('');
    showNotification(`Binding offer of $${Number(offerAmount).toLocaleString()} registered for ${targetListing.propertyName}.`);
    await loadAllData();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxnId || !paymentAmount) return;

    await apiClient.createPayment({
      transactionId: Number(selectedTxnId),
      amount: Number(paymentAmount),
      paymentMethod,
    });

    setIsNewPaymentOpen(false);
    setSelectedTxnId('');
    setPaymentAmount('');
    showNotification(`Settlement remittance of $${Number(paymentAmount).toLocaleString()} verified.`);
    await loadAllData();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewListingId || !reviewComment) return;
    const target = listings.find((l) => l.listingId === Number(reviewListingId));

    await apiClient.createReview({
      listingId: Number(reviewListingId),
      propertyName: target?.propertyName || 'Curated Residence',
      customerId: session.customerId || 1,
      customerName: session.name,
      rating: reviewRating,
      comments: reviewComment,
    });

    setIsNewReviewOpen(false);
    setReviewListingId('');
    setReviewComment('');
    showNotification('Curatorial review published to architectural archive.');
    await loadAllData();
  };

  // Metrics calculations
  const totalPortfolioValue = ownerships.reduce((sum, item) => sum + (item.currentValue || 0), 0);
  const activeOffersCount = offers.filter((o) => o.status === 'PENDING').length;
  const acceptedOffersCount = offers.filter((o) => o.status === 'ACCEPTED').length;

  return (
    <div className="min-h-screen bg-[#D8D2C6] text-[#1A1C1E] font-sans selection:bg-[#1A1C1E] selection:text-[#D8D2C6]">
      {/* Top Banner & Context Nav */}
      <header className="border-b border-black/15 px-6 py-5 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#D5CEC3]/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-5">
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ARCHIVE</span>
          </button>
          <div className="h-4 w-[1px] bg-black/20" />
          <div className="flex items-center space-x-3">
            <span className="font-display tracking-widest text-lg font-bold">MONOLITH</span>
            <span className="text-[9px] font-mono tracking-super-wide px-2 py-0.5 bg-[#1A1C1E] text-[#D8D2C6] uppercase">
              PATRON PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-[11px] font-mono">
          <div className="flex flex-col text-right">
            <span className="font-bold uppercase tracking-wider">{session.name}</span>
            <span className="opacity-50 text-[9px]">ID: PATRON-00{session.customerId || 1} • VERIFIED ACCREDITATION</span>
          </div>

          <button
            onClick={onSwitchToAgent}
            className="px-3 py-1.5 border border-black/20 hover:border-black transition-colors text-[9px] uppercase tracking-widest flex items-center space-x-1.5"
          >
            <span>SWITCH TO ATELIER</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-[#1A1C1E] text-[#D8D2C6] border border-black/40 shadow-2xl flex items-center space-x-3 text-xs font-mono animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:px-12">
        {/* Editorial Title & Overview */}
        <section className="mb-10">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-super-wide opacity-50 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>CONFIDENTIAL PRIVATE CLIENT DOSSIER</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/15">
            <div>
              <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tight leading-none">
                ACQUISITIONS & DEEDS
              </h1>
              <p className="mt-3 text-sm max-w-xl text-[#1A1C1E]/75 font-sans">
                Real-time spatial portfolio ledger, verified freehold deeds, active tender submissions, and custodial escrow settlements.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsNewOfferOpen(true)}
                className="px-5 py-3 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] font-mono uppercase tracking-widest flex items-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>SUBMIT BINDING OFFER</span>
              </button>
              <button
                onClick={loadAllData}
                className="p-3 border border-black/20 hover:border-black transition-colors"
                title="Sync from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-5 border border-black/15 bg-[#D5CEC3]/40">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                PORTFOLIO VALUATION
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight">
                ${totalPortfolioValue.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">100% SECURED TITLES</div>
            </div>

            <div className="p-5 border border-black/15 bg-[#D5CEC3]/40">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                DEEDED RESIDENCES
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight">
                {ownerships.length}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">CROSS-CONTINENTAL SITES</div>
            </div>

            <div className="p-5 border border-black/15 bg-[#D5CEC3]/40">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                ACTIVE TENDERS
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight">
                {activeOffersCount}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">UNDER BROKER DELIBERATION</div>
            </div>

            <div className="p-5 border border-black/15 bg-[#D5CEC3]/40">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                SETTLED CONTRACTS
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight">
                {acceptedOffersCount}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">CLEARED THROUGH ESCROW</div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 border-b border-black/15 mb-8 text-[11px] font-mono uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'offers'
                ? 'border-[#1A1C1E] font-bold text-[#1A1C1E]'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>OFFERS & TENDERS ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'border-[#1A1C1E] font-bold text-[#1A1C1E]'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>OWNED PORTFOLIO ({ownerships.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'settlement'
                ? 'border-[#1A1C1E] font-bold text-[#1A1C1E]'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>SETTLEMENT & ESCROW ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-[#1A1C1E] font-bold text-[#1A1C1E]'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>CURATORIAL REVIEWS ({reviews.length})</span>
          </button>
        </nav>

        {/* TAB 1: OFFERS */}
        {activeTab === 'offers' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display uppercase tracking-tight">Active & Historical Tenders</h2>
                <p className="text-xs text-[#1A1C1E]/60 font-sans mt-0.5">
                  Direct legally-binding offers submitted through the Monolith cryptographic acquisition pipeline.
                </p>
              </div>
              <button
                onClick={() => setIsNewOfferOpen(true)}
                className="text-[10px] font-mono uppercase tracking-widest underline underline-offset-4 hover:opacity-80"
              >
                + NEW OFFER
              </button>
            </div>

            {offers.length === 0 ? (
              <div className="p-12 border border-dashed border-black/20 text-center">
                <p className="text-sm font-editorial italic opacity-70">No acquisition tenders currently filed.</p>
                <button
                  onClick={() => setIsNewOfferOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] font-mono uppercase tracking-widest"
                >
                  Submit First Tender
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-black/15 bg-[#D5CEC3]/30">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-black/15 bg-black/5 text-[9px] uppercase tracking-widest opacity-60">
                      <th className="p-4">OFFER REF</th>
                      <th className="p-4">RESIDENCE</th>
                      <th className="p-4">OFFER VALUATION</th>
                      <th className="p-4">FILED DATE</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {offers.map((offer) => (
                      <tr key={offer.offerId} className="hover:bg-black/5 transition-colors">
                        <td className="p-4 font-bold">TNDR-00{offer.offerId}</td>
                        <td className="p-4 font-sans font-medium text-sm">{offer.propertyName}</td>
                        <td className="p-4 font-bold text-sm">${offer.offerAmount.toLocaleString()}</td>
                        <td className="p-4 opacity-70">{offer.offerDate}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold ${
                              offer.status === 'ACCEPTED'
                                ? 'bg-emerald-900/20 text-emerald-800 border border-emerald-800/30'
                                : offer.status === 'PENDING'
                                ? 'bg-amber-900/15 text-amber-900 border border-amber-900/30'
                                : offer.status === 'REJECTED'
                                ? 'bg-rose-900/15 text-rose-900 border border-rose-900/30'
                                : 'bg-black/10 text-black/60 border border-black/20'
                            }`}
                          >
                            {offer.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3" />}
                            {offer.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {offer.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                            <span>{offer.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {offer.status === 'PENDING' && (
                            <button
                              onClick={() => handleWithdrawOffer(offer.offerId)}
                              className="px-2.5 py-1 border border-black/20 hover:border-black text-[9px] uppercase tracking-widest transition-colors text-rose-900"
                            >
                              WITHDRAW
                            </button>
                          )}
                          {offer.status === 'ACCEPTED' && (
                            <span className="text-[9px] uppercase tracking-widest text-emerald-800 font-bold">
                              CONTRACT CLEARED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-display uppercase tracking-tight">Deeded Sovereign Portfolio</h2>
              <p className="text-xs text-[#1A1C1E]/60 font-sans mt-0.5">
                Cryptographically registered freehold titles held in Monolith Custodial Registry.
              </p>
            </div>

            {ownerships.length === 0 ? (
              <div className="p-12 border border-dashed border-black/20 text-center">
                <p className="text-sm font-editorial italic opacity-70">No deeded property assets on record.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownerships.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-black/20 bg-[#D5CEC3]/40 p-6 flex flex-col justify-between group hover:border-black transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest opacity-60 mb-2">
                        <span>DEED RECORD // #{item.propertyId}</span>
                        <span className="px-2 py-0.5 bg-black/10 font-bold">{item.ownershipShare}% TITLE SHARE</span>
                      </div>
                      <h3 className="text-2xl font-display uppercase tracking-tight leading-none mb-1">
                        {item.propertyName}
                      </h3>
                      <p className="text-xs font-mono opacity-70 mb-4">{item.location}</p>
                    </div>

                    <div className="pt-4 border-t border-black/15 grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[9px] uppercase opacity-50 block">ESTIMATED ASSET VALUE</span>
                        <span className="font-bold text-base">${item.currentValue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase opacity-50 block">ACQUISITION DATE</span>
                        <span className="opacity-80">{item.sinceDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: SETTLEMENT & ESCROW */}
        {activeTab === 'settlement' && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display uppercase tracking-tight">Settlement Ledgers & Escrow Disbursements</h2>
                <p className="text-xs text-[#1A1C1E]/60 font-sans mt-0.5">
                  Multi-tier custodial payments executed against official notary deed contracts.
                </p>
              </div>
              <button
                onClick={() => setIsNewPaymentOpen(true)}
                className="px-4 py-2 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] font-mono uppercase tracking-widest flex items-center space-x-1.5 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>RECORD SETTLEMENT PAYMENT</span>
              </button>
            </div>

            {/* Transactions Breakdown */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-super-wide opacity-60 mb-3">
                REGISTERED CONTRACTUAL TRANSACTIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transactions.map((txn) => {
                  const balanceDue = txn.amount - (txn.paymentsPaid || 0);
                  return (
                    <div key={txn.transactionId} className="border border-black/20 p-5 bg-[#D5CEC3]/30">
                      <div className="flex items-center justify-between text-[9px] font-mono mb-2">
                        <span className="font-bold uppercase tracking-widest">{txn.registrationOrLease}</span>
                        <span className="px-2 py-0.5 bg-black/10 uppercase">{txn.transactionType}</span>
                      </div>
                      <h4 className="font-display text-lg uppercase tracking-tight">{txn.propertyName}</h4>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono border-t border-black/10 pt-3">
                        <div>
                          <span className="text-[9px] opacity-50 block">CONSIDERATION</span>
                          <span className="font-bold">${txn.amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] opacity-50 block">PAID TO DATE</span>
                          <span className="font-bold text-emerald-800">${(txn.paymentsPaid || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] opacity-50 block">BALANCE DUE</span>
                          <span className={`font-bold ${balanceDue > 0 ? 'text-amber-900' : 'text-black/40'}`}>
                            ${balanceDue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Ledger Table */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-super-wide opacity-60 mb-3">
                PAYMENT DISBURSEMENT AUDIT LOG
              </h3>
              <div className="overflow-x-auto border border-black/15 bg-[#D5CEC3]/20">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-black/15 bg-black/5 text-[9px] uppercase tracking-widest opacity-60">
                      <th className="p-3.5">AUDIT REF</th>
                      <th className="p-3.5">SETTLEMENT AMOUNT</th>
                      <th className="p-3.5">DATE</th>
                      <th className="p-3.5">METHOD</th>
                      <th className="p-3.5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {payments.map((p) => (
                      <tr key={p.paymentId} className="hover:bg-black/5">
                        <td className="p-3.5 font-bold">{p.referenceNo}</td>
                        <td className="p-3.5 font-bold text-sm">${p.amount.toLocaleString()}</td>
                        <td className="p-3.5 opacity-70">{p.paymentDate}</td>
                        <td className="p-3.5 opacity-80">{p.paymentMethod}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-emerald-800 uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{p.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display uppercase tracking-tight">Curatorial Monograph Reviews</h2>
                <p className="text-xs text-[#1A1C1E]/60 font-sans mt-0.5">
                  Patron reviews on architectural execution, acoustic performance, and materiality.
                </p>
              </div>
              <button
                onClick={() => setIsNewReviewOpen(true)}
                className="px-4 py-2 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] font-mono uppercase tracking-widest flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>WRITE REVIEW</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-12 border border-dashed border-black/20 text-center">
                <p className="text-sm font-editorial italic opacity-70">No curatorial reviews recorded yet.</p>
                <button
                  onClick={() => setIsNewReviewOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] font-mono uppercase tracking-widest"
                >
                  Publish Curatorial Critique
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div key={rev.reviewId} className="border border-black/20 p-6 bg-[#D5CEC3]/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                          {rev.propertyName}
                        </span>
                        <div className="flex items-center space-x-1 text-amber-700">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-700" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-sans italic opacity-85 leading-relaxed mt-3">
                        "{rev.comments}"
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-black/10 flex items-center justify-between text-[9px] font-mono opacity-50">
                      <span>VERIFIED RESIDENT CRITIQUE</span>
                      <span>{rev.reviewDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT BINDING OFFER */}
      {/* ========================================================================= */}
      {isNewOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#D8D2C6] text-[#1A1C1E] border border-black/30 p-8 shadow-2xl font-mono">
            <button
              onClick={() => setIsNewOfferOpen(false)}
              className="absolute top-6 right-6 p-1.5 border border-black/20 hover:border-black"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide opacity-60 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFICIAL BINDING TENDER</span>
            </div>

            <h3 className="text-2xl font-display uppercase tracking-tight mb-2">
              SUBMIT ACQUISITION TENDER
            </h3>
            <p className="text-xs font-sans opacity-70 mb-6">
              Transmits an immutable binding purchase tender directly to the representing Monolith Atelier broker.
            </p>

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  SELECT TARGET RESIDENCE
                </label>
                <select
                  required
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(Number(e.target.value))}
                  className="w-full p-2.5 bg-transparent border border-black/20 text-xs focus:outline-none"
                >
                  <option value="">-- Choose Curated Property --</option>
                  {listings.map((l) => (
                    <option key={l.listingId} value={l.listingId}>
                      {l.propertyName} — Listed at ${l.listPrice.toLocaleString()} ({l.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  BINDING OFFER VALUATION (USD)
                </label>
                <input
                  type="number"
                  required
                  min="100000"
                  step="10000"
                  placeholder="e.g. 5200000"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-black/20 text-xs focus:outline-none font-bold"
                />
              </div>

              <div className="p-3 bg-black/5 border border-black/10 text-[10px] space-y-1">
                <span className="font-bold block uppercase tracking-wider">Custodial Terms:</span>
                <p className="opacity-70">
                  Offers submitted via Monolith are cryptographically sealed. Upon Atelier acceptance, an escrow transaction is generated atomically.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <span>TRANSMIT BINDING OFFER</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD SETTLEMENT PAYMENT */}
      {/* ========================================================================= */}
      {isNewPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#D8D2C6] text-[#1A1C1E] border border-black/30 p-8 shadow-2xl font-mono">
            <button
              onClick={() => setIsNewPaymentOpen(false)}
              className="absolute top-6 right-6 p-1.5 border border-black/20 hover:border-black"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide opacity-60 mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>ESCROW DISBURSEMENT</span>
            </div>

            <h3 className="text-2xl font-display uppercase tracking-tight mb-2">
              RECORD SETTLEMENT PAYMENT
            </h3>
            <p className="text-xs font-sans opacity-70 mb-6">
              Apply funds directly against an active property acquisition transaction contract.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  TARGET TRANSACTION CONTRACT
                </label>
                <select
                  required
                  value={selectedTxnId}
                  onChange={(e) => setSelectedTxnId(Number(e.target.value))}
                  className="w-full p-2.5 bg-transparent border border-black/20 text-xs focus:outline-none"
                >
                  <option value="">-- Select Transaction Contract --</option>
                  {transactions.map((t) => (
                    <option key={t.transactionId} value={t.transactionId}>
                      {t.propertyName} ({t.registrationOrLease}) — Total: ${t.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  PAYMENT DISBURSEMENT AMOUNT (USD)
                </label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="5000"
                  placeholder="e.g. 500000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-black/20 text-xs focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  SETTLEMENT CHANNEL / METHOD
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-black/20 text-xs focus:outline-none"
                >
                  <option value="Swiss Escrow Wire Transfer">Swiss Escrow Wire Transfer</option>
                  <option value="Federal Reserve Wire Network">Federal Reserve Wire Network</option>
                  <option value="Custodial Irrevocable Letter of Credit">Custodial Irrevocable Letter of Credit</option>
                  <option value="Certified Notary Bank Guarantee">Certified Notary Bank Guarantee</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <span>CONFIRM ESCROW DISBURSEMENT</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WRITE CURATORIAL REVIEW */}
      {/* ========================================================================= */}
      {isNewReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#D8D2C6] text-[#1A1C1E] border border-black/30 p-8 shadow-2xl font-mono">
            <button
              onClick={() => setIsNewReviewOpen(false)}
              className="absolute top-6 right-6 p-1.5 border border-black/20 hover:border-black"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide opacity-60 mb-2">
              <Star className="w-3.5 h-3.5" />
              <span>SPATIAL CRITIQUE</span>
            </div>

            <h3 className="text-2xl font-display uppercase tracking-tight mb-2">
              CURATORIAL REVIEW
            </h3>
            <p className="text-xs font-sans opacity-70 mb-6">
              Share critical observations regarding light orientation, structural materials, and spatial integrity.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  TARGET RESIDENCE
                </label>
                <select
                  required
                  value={reviewListingId}
                  onChange={(e) => setReviewListingId(Number(e.target.value))}
                  className="w-full p-2.5 bg-transparent border border-black/20 text-xs focus:outline-none"
                >
                  <option value="">-- Select Residence --</option>
                  {listings.map((l) => (
                    <option key={l.listingId} value={l.listingId}>
                      {l.propertyName} ({l.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  RATING (1-5 STARS)
                </label>
                <div className="flex items-center space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 border transition-all ${
                        reviewRating >= star
                          ? 'border-black bg-[#1A1C1E] text-[#D8D2C6]'
                          : 'border-black/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  CURATORIAL CRITIQUE / NOTES
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the thermal dynamics, acoustic attenuation, and architectural harmony..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-black/20 text-xs font-sans focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1A1C1E] text-[#D8D2C6] text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <span>PUBLISH ARCHITECTURAL CRITIQUE</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
