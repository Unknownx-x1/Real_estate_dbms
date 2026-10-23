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
  Terminal,
} from 'lucide-react';
import { Logo } from '../HorizonLogo';

interface PatronDashboardProps {
  session: UserSession;
  onNavigateHome: () => void;
  onSwitchToAgent: () => void;
  onOpenSqlQuery?: () => void;
}

export const PatronDashboard: React.FC<PatronDashboardProps> = ({
  session,
  onNavigateHome,
  onSwitchToAgent,
  onOpenSqlQuery,
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
    <div className="min-h-screen bg-black text-white font-geist selection:bg-white selection:text-black">
      {/* Top Banner & Context Nav */}
      <header className="border-b border-white/10 px-6 py-4 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black/85 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-5">
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ARCHIVE</span>
          </button>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-3">
            <Logo className="w-5 h-5 text-white" />
            <span className="font-heading tracking-widest text-base font-bold text-white uppercase">
              HORIZON ESTATES
            </span>
            <span className="text-[9px] font-mono tracking-super-wide px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 uppercase">
              PATRON PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-[11px] font-mono">
          <div className="flex flex-col text-right">
            <span className="font-bold uppercase tracking-wider text-white">{session.name}</span>
            <span className="text-white/50 text-[9px]">ID: PATRON-00{session.customerId || 1} • VERIFIED ACCREDITATION</span>
          </div>

          {onOpenSqlQuery && (
            <button
              onClick={onOpenSqlQuery}
              className="px-3 py-1.5 border border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/30 hover:bg-emerald-950/60 transition-colors text-[9px] uppercase tracking-widest flex items-center space-x-1.5 text-emerald-300 rounded cursor-pointer"
              title="Launch Interactive Relational SQL Query Console"
            >
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span className="font-bold">SQL CONSOLE</span>
            </button>
          )}

          <button
            onClick={onSwitchToAgent}
            className="px-3 py-1.5 border border-white/20 hover:border-white transition-colors text-[9px] uppercase tracking-widest flex items-center space-x-1.5 rounded cursor-pointer text-white/80 hover:text-white"
          >
            <span>SWITCH TO ATELIER</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-[#121212] text-white border border-white/20 shadow-2xl flex items-center space-x-3 text-xs font-mono animate-in slide-in-from-top duration-300 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:px-12">
        {/* Editorial Title & Overview */}
        <section className="mb-10">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-super-wide text-rose-300 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>CONFIDENTIAL PRIVATE CLIENT DOSSIER</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading uppercase tracking-wider leading-none text-white">
                Acquisitions & Deeds
              </h1>
              <p className="mt-3 text-xs sm:text-sm max-w-xl text-white/70 font-geist font-light leading-relaxed">
                Real-time spatial portfolio ledger, verified freehold deeds, active tender submissions, and custodial escrow settlements.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsNewOfferOpen(true)}
                className="px-5 py-2.5 bg-white text-black text-[10px] font-mono uppercase tracking-widest font-medium flex items-center space-x-2 hover:bg-gray-200 active:scale-[0.98] transition-all shadow-md rounded-full cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>SUBMIT BINDING OFFER</span>
              </button>
              <button
                onClick={loadAllData}
                className="p-2.5 rounded-full border border-white/20 hover:border-white text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Sync from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-5 rounded-xl border border-white/10 bg-[#0d0d0d]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                PORTFOLIO VALUATION
              </div>
              <div className="text-2xl md:text-3xl font-heading tracking-tight text-white">
                ${totalPortfolioValue.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono text-emerald-400 mt-1">100% SECURED TITLES</div>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-[#0d0d0d]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                DEEDED RESIDENCES
              </div>
              <div className="text-2xl md:text-3xl font-heading tracking-tight text-white">
                {ownerships.length}
              </div>
              <div className="text-[9px] font-mono text-white/50 mt-1">CROSS-CONTINENTAL SITES</div>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-[#0d0d0d]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                ACTIVE TENDERS
              </div>
              <div className="text-2xl md:text-3xl font-heading tracking-tight text-amber-300">
                {activeOffersCount}
              </div>
              <div className="text-[9px] font-mono text-white/50 mt-1">UNDER BROKER DELIBERATION</div>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-[#0d0d0d]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                SETTLED CONTRACTS
              </div>
              <div className="text-2xl md:text-3xl font-heading tracking-tight text-emerald-400">
                {acceptedOffersCount}
              </div>
              <div className="text-[9px] font-mono text-white/50 mt-1">CLEARED THROUGH ESCROW</div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 border-b border-white/10 mb-8 text-[11px] font-mono uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'offers'
                ? 'border-white font-medium text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>OFFERS & TENDERS ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-white font-medium text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>OWNED PORTFOLIO ({ownerships.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settlement'
                ? 'border-white font-medium text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>SETTLEMENT & ESCROW ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-white font-medium text-white'
                : 'border-transparent text-white/50 hover:text-white'
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
                <h2 className="text-xl font-heading uppercase tracking-wider text-white">Active & Historical Tenders</h2>
                <p className="text-xs text-white/60 font-geist mt-0.5">
                  Direct legally-binding offers submitted through the Horizon Estates cryptographic acquisition pipeline.
                </p>
              </div>
              <button
                onClick={() => setIsNewOfferOpen(true)}
                className="text-[10px] font-mono uppercase tracking-widest text-rose-300 underline underline-offset-4 hover:text-rose-200 cursor-pointer"
              >
                + NEW OFFER
              </button>
            </div>

            {offers.length === 0 ? (
              <div className="p-12 rounded-xl border border-dashed border-white/20 text-center bg-white/5">
                <p className="text-sm italic text-white/60">No acquisition tenders currently filed.</p>
                <button
                  onClick={() => setIsNewOfferOpen(true)}
                  className="mt-4 px-5 py-2 bg-white text-black text-[10px] font-mono uppercase tracking-widest font-medium rounded-full cursor-pointer hover:bg-gray-200"
                >
                  Submit First Tender
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/10 bg-[#0c0c0c] rounded-xl shadow-2xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-widest text-white/50">
                      <th className="p-4">OFFER REF</th>
                      <th className="p-4">RESIDENCE</th>
                      <th className="p-4">OFFER VALUATION</th>
                      <th className="p-4">FILED DATE</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {offers.map((offer) => (
                      <tr key={offer.offerId} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">TNDR-00{offer.offerId}</td>
                        <td className="p-4 font-geist font-medium text-sm text-white/90">{offer.propertyName}</td>
                        <td className="p-4 font-bold text-sm text-emerald-400">${offer.offerAmount.toLocaleString()}</td>
                        <td className="p-4 text-white/60">{offer.offerDate}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-[9px] uppercase tracking-wider font-bold ${
                              offer.status === 'ACCEPTED'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                : offer.status === 'PENDING'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                : offer.status === 'REJECTED'
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                                : 'bg-white/10 text-white/60 border border-white/20'
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
                              className="px-2.5 py-1 border border-rose-500/30 hover:border-rose-400 text-[9px] uppercase tracking-widest transition-colors text-rose-400 hover:text-rose-300 rounded cursor-pointer"
                            >
                              WITHDRAW
                            </button>
                          )}
                          {offer.status === 'ACCEPTED' && (
                            <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">
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
              <h2 className="text-xl font-heading uppercase tracking-wider text-white">Deeded Sovereign Portfolio</h2>
              <p className="text-xs text-white/60 font-geist mt-0.5">
                Cryptographically registered freehold titles held in Horizon Estates Custodial Registry.
              </p>
            </div>

            {ownerships.length === 0 ? (
              <div className="p-12 rounded-xl border border-dashed border-white/20 text-center bg-white/5">
                <p className="text-sm italic text-white/60">No deeded property assets on record.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownerships.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-white/10 bg-[#0d0d0d] p-6 rounded-xl flex flex-col justify-between group hover:border-white/30 transition-all shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-white/50 mb-2">
                        <span>DEED RECORD // #{item.propertyId}</span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">{item.ownershipShare}% TITLE SHARE</span>
                      </div>
                      <h3 className="text-2xl font-heading uppercase tracking-wide leading-none mb-1 text-white">
                        {item.propertyName}
                      </h3>
                      <p className="text-xs font-mono text-white/60 mb-4">{item.location}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[9px] uppercase text-white/40 block">ESTIMATED ASSET VALUE</span>
                        <span className="font-bold text-base text-emerald-400">${item.currentValue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-white/40 block">ACQUISITION DATE</span>
                        <span className="text-white/80">{item.sinceDate}</span>
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
                <h2 className="text-xl font-heading uppercase tracking-wider text-white">Settlement Ledgers & Escrow Disbursements</h2>
                <p className="text-xs text-white/60 font-geist mt-0.5">
                  Multi-tier custodial payments executed against official notary deed contracts.
                </p>
              </div>
              <button
                onClick={() => setIsNewPaymentOpen(true)}
                className="px-4 py-2 bg-white text-black text-[10px] font-mono uppercase tracking-widest font-medium flex items-center space-x-1.5 hover:bg-gray-200 transition-colors rounded-full cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>RECORD SETTLEMENT PAYMENT</span>
              </button>
            </div>

            {/* Transactions Breakdown */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-super-wide text-white/50 mb-3">
                REGISTERED CONTRACTUAL TRANSACTIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transactions.map((txn) => {
                  const balanceDue = txn.amount - (txn.paymentsPaid || 0);
                  return (
                    <div key={txn.transactionId} className="border border-white/10 rounded-xl p-5 bg-[#0d0d0d] shadow-lg">
                      <div className="flex items-center justify-between text-[9px] font-mono mb-2">
                        <span className="font-bold uppercase tracking-widest text-white/80">{txn.registrationOrLease}</span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white uppercase">{txn.transactionType}</span>
                      </div>
                      <h4 className="font-heading text-lg uppercase tracking-wider text-white">{txn.propertyName}</h4>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono border-t border-white/10 pt-3">
                        <div>
                          <span className="text-[9px] text-white/40 block">CONSIDERATION</span>
                          <span className="font-bold text-white">${txn.amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-white/40 block">PAID TO DATE</span>
                          <span className="font-bold text-emerald-400">${(txn.paymentsPaid || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-white/40 block">BALANCE DUE</span>
                          <span className={`font-bold ${balanceDue > 0 ? 'text-amber-400' : 'text-white/40'}`}>
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
              <h3 className="text-xs font-mono uppercase tracking-super-wide text-white/50 mb-3">
                PAYMENT DISBURSEMENT AUDIT LOG
              </h3>
              <div className="overflow-x-auto border border-white/10 bg-[#0c0c0c] rounded-xl shadow-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[9px] uppercase tracking-widest text-white/50">
                      <th className="p-3.5">AUDIT REF</th>
                      <th className="p-3.5">SETTLEMENT AMOUNT</th>
                      <th className="p-3.5">DATE</th>
                      <th className="p-3.5">METHOD</th>
                      <th className="p-3.5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.map((p) => (
                      <tr key={p.paymentId} className="hover:bg-white/5">
                        <td className="p-3.5 font-bold text-white">{p.referenceNo}</td>
                        <td className="p-3.5 font-bold text-sm text-emerald-400">${p.amount.toLocaleString()}</td>
                        <td className="p-3.5 text-white/60">{p.paymentDate}</td>
                        <td className="p-3.5 text-white/75">{p.paymentMethod}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-emerald-400 uppercase">
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
                <h2 className="text-xl font-heading uppercase tracking-wider text-white">Curatorial Monograph Reviews</h2>
                <p className="text-xs text-white/60 font-geist mt-0.5">
                  Patron reviews on architectural execution, acoustic performance, and materiality.
                </p>
              </div>
              <button
                onClick={() => setIsNewReviewOpen(true)}
                className="px-4 py-2 bg-white text-black text-[10px] font-mono uppercase tracking-widest font-medium rounded-full hover:bg-gray-200 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>WRITE REVIEW</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-12 rounded-xl border border-dashed border-white/20 text-center bg-white/5">
                <p className="text-sm italic text-white/60">No curatorial reviews recorded yet.</p>
                <button
                  onClick={() => setIsNewReviewOpen(true)}
                  className="mt-4 px-5 py-2 bg-white text-black text-[10px] font-mono uppercase tracking-widest font-medium rounded-full cursor-pointer hover:bg-gray-200"
                >
                  Publish Curatorial Critique
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div key={rev.reviewId} className="border border-white/10 rounded-xl p-6 bg-[#0d0d0d] flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-white">
                          {rev.propertyName}
                        </span>
                        <div className="flex items-center space-x-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-geist italic text-white/80 leading-relaxed mt-3">
                        "{rev.comments}"
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-white/40">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0d0d0d] text-white border border-white/15 p-8 rounded-2xl shadow-2xl font-mono">
            <button
              onClick={() => setIsNewOfferOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full border border-white/20 hover:border-white text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide text-emerald-400 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>OFFICIAL BINDING TENDER // BCNF REGISTRY</span>
            </div>

            <h3 className="text-2xl font-heading uppercase tracking-wider mb-2 text-white">
              Submit Acquisition Tender
            </h3>
            <p className="text-xs text-white/60 mb-6 font-geist">
              Transmits an immutable binding purchase tender directly to the representing Horizon Estates broker.
            </p>

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
                  SELECT TARGET RESIDENCE
                </label>
                <select
                  required
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(Number(e.target.value))}
                  className="w-full p-2.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-[#121212] text-white">-- Choose Curated Property --</option>
                  {listings.map((l) => (
                    <option key={l.listingId} value={l.listingId} className="bg-[#121212] text-white">
                      {l.propertyName} — Listed at ${l.listPrice.toLocaleString()} ({l.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
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
                  className="w-full p-2.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-white/40 font-bold"
                />
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] space-y-1 text-white/70">
                <span className="font-bold block uppercase tracking-wider text-rose-200">Custodial Terms:</span>
                <p>
                  Offers submitted via Horizon Estates are cryptographically registered. Upon Atelier acceptance, an escrow transaction is generated atomically in PostgreSQL.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-medium text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors rounded-full cursor-pointer shadow-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0d0d0d] text-white border border-white/15 p-8 rounded-2xl shadow-2xl font-mono">
            <button
              onClick={() => setIsNewPaymentOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full border border-white/20 hover:border-white text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide text-emerald-400 mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>ESCROW SETTLEMENT DISBURSEMENT</span>
            </div>

            <h3 className="text-2xl font-heading uppercase tracking-wider mb-2 text-white">
              Record Escrow Remittance
            </h3>
            <p className="text-xs text-white/60 mb-6 font-geist">
              Applies a verified settlement payment against an active deed purchase contract.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
                  SELECT CONTRACT TRANSACTION
                </label>
                <select
                  required
                  value={selectedTxnId}
                  onChange={(e) => setSelectedTxnId(Number(e.target.value))}
                  className="w-full p-2.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-[#121212] text-white">-- Choose Contract --</option>
                  {transactions.map((t) => (
                    <option key={t.transactionId} value={t.transactionId} className="bg-[#121212] text-white">
                      {t.registrationOrLease} — {t.propertyName} (${t.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
                  REMITTANCE AMOUNT (USD)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="e.g. 250000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-white/40 font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
                  DISBURSEMENT METHOD
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-white/40"
                >
                  <option value="Swiss Escrow Wire Transfer" className="bg-[#121212] text-white">Swiss Escrow Wire Transfer</option>
                  <option value="Notary Escrow Account" className="bg-[#121212] text-white">Notary Escrow Account</option>
                  <option value="Atomic USDC Smart Settlement" className="bg-[#121212] text-white">Atomic USDC Smart Settlement</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-medium text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors rounded-full cursor-pointer shadow-lg"
              >
                <span>LOG ESCROW REMITTANCE</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WRITE CURATORIAL REVIEW */}
      {/* ========================================================================= */}
      {isNewReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0d0d0d] text-white border border-white/15 p-8 rounded-2xl shadow-2xl font-mono">
            <button
              onClick={() => setIsNewReviewOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full border border-white/20 hover:border-white text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide text-rose-300 mb-2">
              <Star className="w-3.5 h-3.5" />
              <span>PATRON CURATORIAL CRITIQUE</span>
            </div>

            <h3 className="text-2xl font-heading uppercase tracking-wider mb-2 text-white">
              Publish Residence Critique
            </h3>
            <p className="text-xs text-white/60 mb-6 font-geist">
              Provide formal verified patron critique regarding spatial ergonomics, materiality, and coastal longevity.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
                  CURATED RESIDENCE
                </label>
                <select
                  required
                  value={reviewListingId}
                  onChange={(e) => setReviewListingId(Number(e.target.value))}
                  className="w-full p-2.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-white/40"
                >
                  <option value="" className="bg-[#121212] text-white">-- Select Residence to Review --</option>
                  {listings.map((l) => (
                    <option key={l.listingId} value={l.listingId} className="bg-[#121212] text-white">
                      {l.propertyName} ({l.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
                  CRITIQUE RATING (1 to 5 STARS)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-2 border border-white/15 hover:border-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-white/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-white/60 mb-1.5">
                  CRITIQUE MONOGRAPH
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail your residence critique, spatial acoustic qualities, and natural lighting characteristics..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-white/40 font-geist"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-medium text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors rounded-full cursor-pointer shadow-lg"
              >
                <span>PUBLISH TO REGISTRY</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
