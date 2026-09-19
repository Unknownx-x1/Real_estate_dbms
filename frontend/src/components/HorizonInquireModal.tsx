import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, User, Briefcase, Terminal, Sparkles, AlertCircle } from 'lucide-react';
import { apiClient, type UserSession, type ListingRecord } from '../services/api';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedListingId?: number;
  selectedProperty?: string;
  session?: UserSession | null;
  onOpenPortal?: (view: 'patron' | 'agent' | 'sql') => void;
  onRequireSignIn?: () => void;
}

export const HorizonInquireModal: React.FC<InquireModalProps> = ({
  isOpen,
  onClose,
  selectedListingId,
  selectedProperty = 'The Horizon Villa • Malibu ($18,500,000)',
  session,
  onOpenPortal,
  onRequireSignIn,
}) => {
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [activeListingId, setActiveListingId] = useState<number>(selectedListingId || 1);
  const [offerAmount, setOfferAmount] = useState<number>(18500000);
  const [intentType, setIntentType] = useState<'offer' | 'tour' | 'dossier'>('offer');
  const [patronName, setPatronName] = useState<string>(session?.name || 'Alice Smith');
  const [patronEmail, setPatronEmail] = useState<string>(session?.email || 'alice.smith@example.com');
  const [submitting, setSubmitting] = useState(false);
  const [resultOfferId, setResultOfferId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load database listings on open
  useEffect(() => {
    if (!isOpen) return;
    apiClient.getListings().then((data) => {
      if (data && data.length > 0) {
        setListings(data);
        const match = selectedListingId
          ? data.find((l) => l.listingId === selectedListingId)
          : data.find((l) => l.propertyName.toLowerCase().includes('horizon')) || data[0];
        if (match) {
          setActiveListingId(match.listingId);
          setOfferAmount(match.listPrice);
        }
      }
    });
  }, [isOpen, selectedListingId]);

  // Sync session changes
  useEffect(() => {
    if (session) {
      setPatronName(session.name);
      setPatronEmail(session.email);
    }
  }, [session]);

  if (!isOpen) return null;

  const currentListing = listings.find((l) => l.listingId === activeListingId);

  const handleListingChange = (listingId: number) => {
    setActiveListingId(listingId);
    const found = listings.find((l) => l.listingId === listingId);
    if (found) {
      setOfferAmount(found.listPrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Canonical Customer ID (1 for Alice Smith if unauthenticated or session customerId)
      const customerId = session?.customerId || 1;
      
      const newOffer = await apiClient.createOffer({
        customerId,
        customerName: patronName || 'Alice Smith (Patron)',
        listingId: activeListingId,
        propertyName: currentListing?.propertyName || selectedProperty,
        offerAmount: Number(offerAmount),
      });

      setResultOfferId(newOffer.offerId);
      setSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error logging offer in DBMS');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl p-6 md:p-8 text-white z-10 font-geist">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {resultOfferId ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
              <Sparkles className="w-3 h-3" />
              <span>DBMS RECORD CREATED // OFFER #{resultOfferId}</span>
            </div>

            <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white">
              Acquisition Tender Logged
            </h3>

            <p className="text-white/70 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Tender registered in PostgreSQL <code className="text-rose-200">OFFER</code> table for{' '}
              <strong className="text-white">{currentListing?.propertyName || selectedProperty}</strong> at{' '}
              <strong className="text-white">${Number(offerAmount).toLocaleString()} USD</strong> under Patron accreditation{' '}
              <span className="text-rose-200">{patronName}</span>. Status is <span className="text-amber-300 font-mono">PENDING</span>.
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs font-mono space-y-1.5 text-white/80">
              <div className="flex justify-between">
                <span className="text-white/50">OFFER ID:</span>
                <span className="text-white font-bold">OFFER-00{resultOfferId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">LISTING:</span>
                <span className="text-white">{currentListing?.propertyName || 'Estate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">PROPOSED AMOUNT:</span>
                <span className="text-emerald-400 font-bold">${Number(offerAmount).toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">ESCROW STATUS:</span>
                <span className="text-amber-400">PENDING BROKER REVIEW</span>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {onOpenPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPortal('patron');
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-white text-black font-medium text-xs tracking-wider uppercase hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View in Patron Dossier</span>
                </button>
              )}

              {onOpenPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPortal('agent');
                  }}
                  className="w-full py-2.5 px-4 rounded-full border border-white/20 text-white font-medium text-xs tracking-wider uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Review on Atelier Desk</span>
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setResultOfferId(null);
                  onClose();
                }}
                className="text-xs text-white/50 hover:text-white uppercase tracking-wider font-mono cursor-pointer"
              >
                Return to Portfolio
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400 uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CONFIDENTIAL ACQUISITION DESK // BCNF POSTGRESQL</span>
              </div>
              <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white">
                Submit Acquisition Tender
              </h2>
              <p className="text-white/60 text-xs md:text-sm mt-1">
                Submit a binding acquisition offer directly into the sovereign real estate database.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Target Estate (Database Listing)
                </label>
                {listings.length > 0 ? (
                  <select
                    value={activeListingId}
                    onChange={(e) => handleListingChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40"
                  >
                    {listings.map((l) => (
                      <option key={l.listingId} value={l.listingId} className="bg-[#121212] text-white">
                        {l.propertyName} • {l.location} (${l.listPrice.toLocaleString()} USD)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm font-mono">
                    {selectedProperty}
                  </div>
                )}
              </div>

              {/* Offer Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-white/70">
                    Acquisition Tender Amount (USD)
                  </label>
                  {currentListing && (
                    <span className="text-[10px] font-mono text-white/50">
                      LIST PRICE: ${currentListing.listPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min={100000}
                    step={50000}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-white/40"
                    placeholder="18500000"
                  />
                </div>
              </div>

              {/* Inquiry Intent Pills */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Acquisition Modality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'offer', label: 'Binding Offer' },
                    { id: 'tour', label: 'Optical Tour' },
                    { id: 'dossier', label: 'Deed Dossier' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setIntentType(tab.id as any)}
                      className={`py-2 px-2 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                        intentType === tab.id
                          ? 'border-white bg-white/15 text-white font-medium'
                          : 'border-white/10 text-white/50 hover:text-white hover:border-white/25'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patron Identity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    Patron Accreditation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alice Smith"
                    value={patronName}
                    onChange={(e) => setPatronName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    Confidential Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alice.smith@example.com"
                    value={patronEmail}
                    onChange={(e) => setPatronEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {!session && onRequireSignIn && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequireSignIn();
                    }}
                    className="text-[10px] font-mono text-rose-300 hover:text-rose-200 underline cursor-pointer"
                  >
                    Authenticate with registered Patron / Broker key
                  </button>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full group flex items-center justify-center gap-2 bg-white text-black py-3 rounded-full font-medium text-xs md:text-sm tracking-wider uppercase hover:bg-gray-200 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Registering in PostgreSQL...' : 'Submit Binding Tender to DBMS'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>

            {/* Portal Quick Access Footer */}
            {onOpenPortal && (
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>13 BCNF RELATIONS</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { onClose(); onOpenPortal('patron'); }}
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <User className="w-3 h-3" /> Patron
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => { onClose(); onOpenPortal('agent'); }}
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Briefcase className="w-3 h-3" /> Atelier
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => { onClose(); onOpenPortal('sql'); }}
                    className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Terminal className="w-3 h-3" /> SQL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
