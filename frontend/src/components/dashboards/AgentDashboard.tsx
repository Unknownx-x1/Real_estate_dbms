import React, { useState, useEffect } from 'react';
import {
  apiClient,
  type UserSession,
  type OfferRecord,
  type ListingRecord,
  type TransactionRecord,
} from '../../services/api';
import {
  Briefcase,
  Building,
  CheckCircle,
  XCircle,
  FileCheck2,
  TrendingUp,
  Plus,
  RefreshCw,
  X,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Layers,
  Edit2,
} from 'lucide-react';

interface AgentDashboardProps {
  session: UserSession;
  onNavigateHome: () => void;
  onSwitchToPatron: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  session,
  onNavigateHome,
  onSwitchToPatron,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'offers' | 'transactions' | 'analytics'>('inventory');
  const [loading, setLoading] = useState(true);

  // Data states
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  // Modal states
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ListingRecord | null>(null);
  const [confirmAcceptOffer, setConfirmAcceptOffer] = useState<OfferRecord | null>(null);

  // Form states for new listing
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('Brutalist Cliff Residence');
  const [newPrice, setNewPrice] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newImage, setNewImage] = useState('');

  // Form states for price update
  const [editPrice, setEditPrice] = useState('');
  const [editStatus, setEditStatus] = useState<ListingRecord['status']>('ACTIVE');

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allListings, allOffers, allTxns] = await Promise.all([
        apiClient.getListings(),
        apiClient.getOffers(),
        apiClient.getTransactions(),
      ]);

      setListings(allListings);
      setOffers(allOffers);
      setTransactions(allTxns);
    } catch (err) {
      console.error('Failed to load atelier broker data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Publish New Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation || !newPrice || !newArea) return;

    await apiClient.createListing({
      propertyName: newName,
      location: newLocation,
      propertyType: newType,
      listPrice: Number(newPrice),
      areaSqFt: Number(newArea),
      agentId: session.agentId || 1,
      agentName: session.name,
      image: newImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    });

    setIsNewListingOpen(false);
    setNewName('');
    setNewLocation('');
    setNewPrice('');
    setNewArea('');
    setNewImage('');
    showNotification(`Architectural monograph for "${newName}" published to global inventory.`);
    await loadAllData();
  };

  // Handle Price / Status Update
  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    await apiClient.updateListing(editingListing.listingId, {
      listPrice: Number(editPrice),
      status: editStatus,
    });

    setEditingListing(null);
    showNotification(`Inventory specifications for ${editingListing.propertyName} updated.`);
    await loadAllData();
  };

  // Handle Atomic Offer Acceptance
  const handleExecuteAtomicAcceptance = async () => {
    if (!confirmAcceptOffer) return;

    try {
      const result = await apiClient.acceptOfferAndCreateTransaction({
        offerId: confirmAcceptOffer.offerId,
        listingId: confirmAcceptOffer.listingId,
        transactionType: 'SALE',
        salePrice: confirmAcceptOffer.offerAmount,
        registrationNo: `NOTARY-REG-${Date.now().toString().slice(-6)}`,
      });

      setConfirmAcceptOffer(null);
      showNotification(
        `ATOMIC TRANSACTION EXECUTED: ${confirmAcceptOffer.propertyName} deed transferred. Notary Reg: ${result.transaction.registrationOrLease}. Competing offers rejected.`
      );
      await loadAllData();
    } catch (err) {
      showNotification('Atomic transaction execution failed. Rollback triggered.');
    }
  };

  // Handle Reject Offer
  const handleRejectOffer = async (offerId: number) => {
    if (!confirm('Reject this acquisition tender?')) return;
    await apiClient.updateOfferStatus(offerId, 'REJECTED');
    showNotification('Acquisition tender rejected.');
    await loadAllData();
  };

  // Aggregate Metrics
  const totalVolumeListed = listings.reduce((sum, l) => sum + l.listPrice, 0);
  const totalSettledVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingOffersCount = offers.filter((o) => o.status === 'PENDING').length;
  const closedDealsCount = transactions.length;
  const estimatedCommission = totalSettledVolume * 0.03; // Standard 3% luxury atelier broker fee

  return (
    <div className="min-h-screen bg-[#1A1C1E] text-[#D8D2C6] font-sans selection:bg-[#D8D2C6] selection:text-[#1A1C1E]">
      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-5 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#141517]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-5">
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT TO HERO ARCHIVE</span>
          </button>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-3">
            <span className="font-display tracking-widest text-lg font-bold">MONOLITH</span>
            <span className="text-[9px] font-mono tracking-super-wide px-2 py-0.5 bg-[#D8D2C6] text-[#1A1C1E] uppercase font-bold">
              ATELIER / BROKER PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-[11px] font-mono">
          <div className="flex flex-col text-right">
            <span className="font-bold uppercase tracking-wider">{session.name}</span>
            <span className="opacity-50 text-[9px]">ID: BROKER-00{session.agentId || 1} • LICENSED NOTARY ATELIER</span>
          </div>

          <button
            onClick={onSwitchToPatron}
            className="px-3 py-1.5 border border-white/20 hover:border-white transition-colors text-[9px] uppercase tracking-widest flex items-center space-x-1.5"
          >
            <span>SWITCH TO PATRON</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-[#D8D2C6] text-[#1A1C1E] border border-white/40 shadow-2xl flex items-center space-x-3 text-xs font-mono animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:px-12">
        {/* Atelier Header & Metrics */}
        <section className="mb-10">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-super-wide opacity-50 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>EXECUTIVE BROKERAGE DESK // CONSIGNMENT OPERATIONS</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tight leading-none">
                ATELIER CURATION DESK
              </h1>
              <p className="mt-3 text-sm max-w-xl text-[#D8D2C6]/75 font-sans">
                Active architectural inventory, atomic tender execution engine, multi-party deed settlement, and luxury commission yield.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsNewListingOpen(true)}
                className="px-5 py-3 bg-[#D8D2C6] text-[#1A1C1E] text-[10px] font-mono uppercase tracking-widest font-bold flex items-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>PUBLISH NEW RESIDENCE</span>
              </button>
              <button
                onClick={loadAllData}
                className="p-3 border border-white/20 hover:border-white transition-colors"
                title="Refresh Live Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-5 border border-white/10 bg-white/5">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                TOTAL LISTED VOLUME
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight text-white">
                ${totalVolumeListed.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">{listings.length} RESIDENCES IN REPOSITORY</div>
            </div>

            <div className="p-5 border border-white/10 bg-white/5">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                SETTLED TRANSACTION VOLUME
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight text-emerald-400">
                ${totalSettledVolume.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">{closedDealsCount} CLOSED NOTARY CONTRACTS</div>
            </div>

            <div className="p-5 border border-white/10 bg-white/5">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                PENDING DELIBERATIONS
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight text-amber-400">
                {pendingOffersCount}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">REQUIRING BROKER REVIEW</div>
            </div>

            <div className="p-5 border border-white/10 bg-white/5">
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1">
                ATELIER YIELD (3% FEE)
              </div>
              <div className="text-2xl md:text-3xl font-display tracking-tight text-[#D8D2C6]">
                ${estimatedCommission.toLocaleString()}
              </div>
              <div className="text-[9px] font-mono opacity-50 mt-1">CUSTODIAL ACCRUAL</div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 border-b border-white/10 mb-8 text-[11px] font-mono uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-[#D8D2C6] font-bold text-white'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>MANAGED RESIDENCES ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'offers'
                ? 'border-[#D8D2C6] font-bold text-white'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>INCOMING TENDERS ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-[#D8D2C6] font-bold text-white'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>EXECUTED CONTRACTS ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-[#D8D2C6] font-bold text-white'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ATELIER ANALYTICS</span>
          </button>
        </nav>

        {/* TAB 1: INVENTORY */}
        {activeTab === 'inventory' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display uppercase tracking-tight text-white">Residence Consignments</h2>
                <p className="text-xs text-[#D8D2C6]/60 font-sans mt-0.5">
                  Full lifecycle property listing inventory with atomic price revision & status controls.
                </p>
              </div>
              <button
                onClick={() => setIsNewListingOpen(true)}
                className="text-[10px] font-mono uppercase tracking-widest text-[#D8D2C6] underline underline-offset-4 hover:opacity-80"
              >
                + PUBLISH RESIDENCE
              </button>
            </div>

            <div className="overflow-x-auto border border-white/10 bg-white/5">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[9px] uppercase tracking-widest opacity-60">
                    <th className="p-4">LISTING ID</th>
                    <th className="p-4">RESIDENCE & ARCHITECTURE</th>
                    <th className="p-4">LOCATION</th>
                    <th className="p-4">ASKING PRICE</th>
                    <th className="p-4">AREA</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4 text-right">CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listings.map((l) => (
                    <tr key={l.listingId} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white/80">LST-00{l.listingId}</td>
                      <td className="p-4">
                        <div className="font-sans font-medium text-white text-sm">{l.propertyName}</div>
                        <div className="text-[10px] opacity-60 font-mono mt-0.5">{l.propertyType}</div>
                      </td>
                      <td className="p-4 opacity-80">{l.location}</td>
                      <td className="p-4 font-bold text-white text-sm">${l.listPrice.toLocaleString()}</td>
                      <td className="p-4 opacity-75">{l.areaSqFt.toLocaleString()} SQ FT</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            l.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                              : l.status === 'SOLD'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700/40'
                              : 'bg-white/10 text-white/60 border border-white/20'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setEditingListing(l);
                            setEditPrice(l.listPrice.toString());
                            setEditStatus(l.status);
                          }}
                          className="px-2.5 py-1 border border-white/20 hover:border-white text-[9px] uppercase tracking-widest transition-colors flex items-center space-x-1 ml-auto"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>REVISE</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: INCOMING OFFERS & ATOMIC EXECUTION */}
        {activeTab === 'offers' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-display uppercase tracking-tight text-white">
                Incoming Acquisition Tenders & Atomic Engine
              </h2>
              <p className="text-xs text-[#D8D2C6]/60 font-sans mt-0.5">
                Deliberate prospective patron tenders. Accepting an offer atomically issues deeds, rejects competing bids, and marks residence SOLD.
              </p>
            </div>

            {offers.length === 0 ? (
              <div className="p-12 border border-dashed border-white/20 text-center">
                <p className="text-sm font-editorial italic opacity-70">No pending acquisition offers received.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => {
                  const targetListing = listings.find((l) => l.listingId === offer.listingId);
                  const isUnderAsk = targetListing ? offer.offerAmount < targetListing.listPrice : false;

                  return (
                    <div
                      key={offer.offerId}
                      className="border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3 text-[10px] font-mono">
                          <span className="font-bold text-white/60">TENDER // #{offer.offerId}</span>
                          <span className="px-2 py-0.5 bg-white/10 uppercase">{offer.offerDate}</span>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                              offer.status === 'ACCEPTED'
                                ? 'bg-emerald-950 text-emerald-300'
                                : offer.status === 'PENDING'
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>

                        <h3 className="text-xl font-display uppercase tracking-tight text-white">
                          {offer.propertyName}
                        </h3>

                        <div className="text-xs font-mono text-[#D8D2C6]/80 flex items-center space-x-4 pt-1">
                          <span>PATRON: <strong className="text-white">{offer.customerName}</strong></span>
                          <span>•</span>
                          <span>TENDER VALUATION: <strong className="text-white text-sm">${offer.offerAmount.toLocaleString()}</strong></span>
                          {targetListing && (
                            <>
                              <span>•</span>
                              <span className="opacity-60">ASK: ${targetListing.listPrice.toLocaleString()}</span>
                              {isUnderAsk && (
                                <span className="text-amber-400 text-[10px] font-mono">
                                  (-${(targetListing.listPrice - offer.offerAmount).toLocaleString()})
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center space-x-3 shrink-0">
                        {offer.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => setConfirmAcceptOffer(offer)}
                              className="px-4 py-2.5 bg-emerald-500 text-black font-bold text-[10px] font-mono uppercase tracking-widest flex items-center space-x-1.5 hover:bg-emerald-400 active:scale-95 transition-all shadow-md"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>ACCEPT & EXECUTE ATOMIC SALE</span>
                            </button>

                            <button
                              onClick={() => handleRejectOffer(offer.offerId)}
                              className="px-3 py-2.5 border border-white/20 hover:border-rose-400 text-rose-400 text-[10px] font-mono uppercase tracking-widest transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                            DECISION RECORDED // {offer.status}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-display uppercase tracking-tight text-white">Closed Notary Transactions</h2>
              <p className="text-xs text-[#D8D2C6]/60 font-sans mt-0.5">
                Immutable deed settlement registry, legal notary registration numbers, and custodial fund flows.
              </p>
            </div>

            <div className="overflow-x-auto border border-white/10 bg-white/5">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[9px] uppercase tracking-widest opacity-60">
                    <th className="p-4">REGISTRATION CODE</th>
                    <th className="p-4">RESIDENCE</th>
                    <th className="p-4">CONTRACT TYPE</th>
                    <th className="p-4">SETTLED CONSIDERATION</th>
                    <th className="p-4">FUNDS REMITTED</th>
                    <th className="p-4">DATE OF SETTLEMENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t) => (
                    <tr key={t.transactionId} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white">{t.registrationOrLease}</td>
                      <td className="p-4 font-sans font-medium text-white">{t.propertyName}</td>
                      <td className="p-4 opacity-80 uppercase">{t.transactionType}</td>
                      <td className="p-4 font-bold text-white text-sm">${t.amount.toLocaleString()}</td>
                      <td className="p-4 font-bold text-emerald-400">${(t.paymentsPaid || 0).toLocaleString()}</td>
                      <td className="p-4 opacity-60">{t.transactionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-xl font-display uppercase tracking-tight text-white">Atelier Performance Analytics</h2>
              <p className="text-xs text-[#D8D2C6]/60 font-sans mt-0.5">
                Quantitative velocity metrics, average square footage realization, and gross broker yields.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-white/10 p-6 bg-white/5">
                <span className="text-[9px] font-mono uppercase tracking-widest opacity-60 block mb-1">
                  AVERAGE SQUARE FOOTAGE VALUATION
                </span>
                <div className="text-3xl font-display text-white">
                  ${Math.round(totalVolumeListed / (listings.reduce((s, l) => s + l.areaSqFt, 0) || 1)).toLocaleString()} / SQ FT
                </div>
                <p className="text-xs font-sans opacity-60 mt-2">
                  Benchmark for brutalist & high-thermal concrete residential assets.
                </p>
              </div>

              <div className="border border-white/10 p-6 bg-white/5">
                <span className="text-[9px] font-mono uppercase tracking-widest opacity-60 block mb-1">
                  OFFER-TO-TRANSACTION RATIO
                </span>
                <div className="text-3xl font-display text-white">
                  {offers.length > 0 ? `${Math.round((closedDealsCount / offers.length) * 100)}%` : '0%'}
                </div>
                <p className="text-xs font-sans opacity-60 mt-2">
                  High-intent patron conversions cleared through custodial escrow.
                </p>
              </div>

              <div className="border border-white/10 p-6 bg-white/5">
                <span className="text-[9px] font-mono uppercase tracking-widest opacity-60 block mb-1">
                  INVENTORY TURNOVER STATUS
                </span>
                <div className="text-3xl font-display text-emerald-400">
                  {listings.filter((l) => l.status === 'SOLD').length} SOLD / {listings.length} TOTAL
                </div>
                <p className="text-xs font-sans opacity-60 mt-2">
                  Sovereign demand remains at an all-time peak for off-market structures.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: PUBLISH NEW RESIDENCE */}
      {/* ========================================================================= */}
      {isNewListingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#1A1C1E] text-[#D8D2C6] border border-white/20 p-8 shadow-2xl font-mono">
            <button
              onClick={() => setIsNewListingOpen(false)}
              className="absolute top-6 right-6 p-1.5 border border-white/20 hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide opacity-60 mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>NEW CONSIGNMENT</span>
            </div>

            <h3 className="text-2xl font-display uppercase tracking-tight text-white mb-2">
              PUBLISH ARCHITECTURAL RESIDENCE
            </h3>
            <p className="text-xs font-sans opacity-70 mb-6">
              Create a new monograph entry in the Monolith global property catalogue.
            </p>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  RESIDENCE TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Monolith Pavilion"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reykjavik, Iceland"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                    ARCHITECTURAL TYPOLOGY
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none text-[#D8D2C6]"
                  >
                    <option value="Brutalist Cliff Residence">Brutalist Cliff Residence</option>
                    <option value="Geometric Monolith Villa">Geometric Monolith Villa</option>
                    <option value="Nordic Earth Pavilion">Nordic Earth Pavilion</option>
                    <option value="Desert Rammed-Earth Retreat">Desert Rammed-Earth Retreat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                    ASKING PRICE (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="500000"
                    step="50000"
                    placeholder="e.g. 6400000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                    INTERIOR AREA (SQ FT)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 5500"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  HERO ARCHIVAL IMAGE URL (OPTIONAL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none text-white/70"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D8D2C6] text-[#1A1C1E] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <span>PUBLISH TO GLOBAL ARCHIVE</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REVISE PRICE & STATUS */}
      {/* ========================================================================= */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#1A1C1E] text-[#D8D2C6] border border-white/20 p-8 shadow-2xl font-mono">
            <button
              onClick={() => setEditingListing(null)}
              className="absolute top-6 right-6 p-1.5 border border-white/20 hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-display uppercase tracking-tight text-white mb-1">
              REVISE INVENTORY RECORD
            </h3>
            <p className="text-xs font-sans opacity-70 mb-5">{editingListing.propertyName}</p>

            <form onSubmit={handleUpdateListing} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  REVISED ASKING PRICE (USD)
                </label>
                <input
                  type="number"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest opacity-60 mb-1.5">
                  LISTING STATUS
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-black/40 border border-white/20 text-xs focus:outline-none text-[#D8D2C6]"
                >
                  <option value="ACTIVE">ACTIVE (Accepting Tenders)</option>
                  <option value="PENDING">PENDING (In Negotiation)</option>
                  <option value="SOLD">SOLD (Settled)</option>
                  <option value="INACTIVE">INACTIVE (Withdrawn)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D8D2C6] text-[#1A1C1E] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <span>APPLY REVISION</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM ATOMIC CONTRACT EXECUTION */}
      {/* ========================================================================= */}
      {confirmAcceptOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#141517] text-[#D8D2C6] border border-amber-500/40 p-8 shadow-2xl font-mono">
            <button
              onClick={() => setConfirmAcceptOffer(null)}
              className="absolute top-6 right-6 p-1.5 border border-white/20 hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-super-wide text-amber-400 mb-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>ATOMIC DBMS TRANSACTION // IRREVOCABLE SETTLEMENT</span>
            </div>

            <h3 className="text-2xl font-display uppercase tracking-tight text-white mb-2">
              EXECUTE ACQUISITION CONTRACT
            </h3>

            <p className="text-xs font-sans opacity-80 mb-6">
              Executing this action commits an atomic multi-table transaction within the Monolith DBMS layer.
            </p>

            <div className="space-y-2 p-4 bg-black/60 border border-white/10 text-xs mb-6">
              <div className="flex justify-between">
                <span className="opacity-60">TARGET RESIDENCE:</span>
                <strong className="text-white">{confirmAcceptOffer.propertyName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">ACQUIRING PATRON:</span>
                <strong className="text-white">{confirmAcceptOffer.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">CONTRACT VALUATION:</span>
                <strong className="text-emerald-400 text-sm font-bold">
                  ${confirmAcceptOffer.offerAmount.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-600/30 text-[10px] space-y-1 mb-6 text-amber-200">
              <span className="font-bold block uppercase tracking-wider">DBMS Atomic Execution Cascade:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                <li>Offer #{confirmAcceptOffer.offerId} set to ACCEPTED</li>
                <li>All other competing pending offers set to REJECTED</li>
                <li>Residence listing status updated to SOLD</li>
                <li>Legal notary transaction generated and deed created in Custodial Registry</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setConfirmAcceptOffer(null)}
                className="py-3 border border-white/20 hover:border-white text-[10px] uppercase tracking-widest transition-colors"
              >
                ABORT
              </button>

              <button
                type="button"
                onClick={handleExecuteAtomicAcceptance}
                className="py-3 bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-emerald-400 transition-colors"
              >
                <span>COMMIT TRANSACTION</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
