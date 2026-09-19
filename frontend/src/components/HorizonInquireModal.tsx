import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, User, Briefcase, Terminal } from 'lucide-react';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: string;
  onOpenPortal?: (view: 'patron' | 'agent' | 'sql') => void;
}

export const HorizonInquireModal: React.FC<InquireModalProps> = ({
  isOpen,
  onClose,
  selectedProperty = 'The Horizon Villa • Malibu ($18,500,000)',
  onOpenPortal,
}) => {
  const [property, setProperty] = useState(selectedProperty);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState<'tour' | 'dossier' | 'offer'>('tour');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-2xl uppercase tracking-wider text-white">
              Inquiry Registered
            </h3>
            <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
              Thank you, {name || 'Patron'}. Your confidential inquiry for <span className="text-white font-medium">{property}</span> has been logged with our custodial brokerage desk. A private partner will contact you shortly.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-black font-medium text-xs tracking-wider uppercase hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Return to Portfolio
              </button>
              {onOpenPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPortal('patron');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-white/20 text-white font-medium text-xs tracking-wider uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Open Patron Portal</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                CONFIDENTIAL ACQUISITION DESK
              </span>
              <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white mt-1">
                Private Estate Inquiry
              </h2>
              <p className="text-white/60 text-xs md:text-sm mt-1">
                Schedule an exclusive private viewing or request verified freehold deed provenance.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Selected Residence
                </label>
                <select
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40"
                >
                  <option value="The Horizon Villa • Malibu ($18,500,000)" className="bg-[#121212] text-white">
                    The Horizon Villa • Malibu ($18,500,000 USD)
                  </option>
                  <option value="The Cantilever House • Algarve (€4,850,000)" className="bg-[#121212] text-white">
                    The Cantilever House • Algarve (€4,850,000 EUR)
                  </option>
                  <option value="Villa Obsidian • Ticino (CHF 7,200,000)" className="bg-[#121212] text-white">
                    Villa Obsidian • Ticino (CHF 7,200,000)
                  </option>
                  <option value="The Ochre Sanctuary • Kyoto (¥680,000,000)" className="bg-[#121212] text-white">
                    The Ochre Sanctuary • Kyoto (¥680,000,000 JPY)
                  </option>
                </select>
              </div>

              {/* Inquiry Type Pills */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Inquiry Purpose
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'tour', label: 'Private Tour' },
                    { id: 'dossier', label: 'Deed Dossier' },
                    { id: 'offer', label: 'Submit Offer' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setInquiryType(tab.id as any)}
                      className={`py-2 px-2 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                        inquiryType === tab.id
                          ? 'border-white bg-white/10 text-white font-medium'
                          : 'border-white/10 text-white/50 hover:text-white hover:border-white/25'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    Patron Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2831"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1">
                  Confidential Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="patron@estate-holdings.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full group flex items-center justify-center gap-2 bg-white text-black py-3 rounded-full font-medium text-xs md:text-sm tracking-wider uppercase hover:bg-gray-200 transition-all shadow-lg cursor-pointer"
                >
                  <span>Submit Confidential Inquiry</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>

            {/* DBMS Portal Quick Access */}
            {onOpenPortal && (
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BCNF VERIFIED SYSTEM</span>
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
