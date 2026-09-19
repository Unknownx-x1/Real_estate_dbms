import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, User, Briefcase, Terminal, MapPin, Sparkles, Anchor, Compass } from 'lucide-react';
import { apiClient, type ListingRecord } from '../services/api';

interface HorizonSectionsProps {
  onSelectPropertyToInquire: (propertyName: string, listingId?: number) => void;
  onOpenPortal: (view: 'patron' | 'agent' | 'sql') => void;
}

export const HorizonSections: React.FC<HorizonSectionsProps> = ({
  onSelectPropertyToInquire,
  onOpenPortal,
}) => {
  const [dbListings, setDbListings] = useState<ListingRecord[]>([]);

  useEffect(() => {
    apiClient.getListings().then((data) => {
      if (data && data.length > 0) {
        setDbListings(data);
      }
    });
  }, []);

  // Curated showcase combining database records with high-fidelity architectural assets
  const fallbackListings = [
    {
      listingId: 1,
      title: 'THE HORIZON VILLA',
      location: '1084 PACIFIC COAST HIGHWAY, MALIBU, CA',
      price: '$18,500,000 USD',
      beds: '6 BEDS',
      baths: '8 BATHS',
      sqft: '9,400 SQ.FT',
      tag: 'FLAGSHIP SEASIDE COMPOUND',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      features: ['270° Ocean Views', 'Private Beach Access', 'Cantilevered Pool', 'Smart Automation'],
    },
    {
      listingId: 2,
      title: 'THE CANTILEVER HOUSE',
      location: 'ALGARVE COAST, PORTUGAL',
      price: '€ 4,850,000 EUR',
      beds: '5 BEDS',
      baths: '6 BATHS',
      sqft: '6,400 SQ.FT',
      tag: 'BRUTALIST CLIFF RESIDENCE',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      features: ['Poured Terracotta Concrete', 'Volcanic Stone Patio', 'Clifftop Gazebo', 'Solar Microgrid'],
    },
    {
      listingId: 3,
      title: 'VILLA OBSIDIAN',
      location: 'LAKE LUGANO, TICINO, SWITZERLAND',
      price: 'CHF 7,200,000',
      beds: '7 BEDS',
      baths: '8 BATHS',
      sqft: '7,850 SQ.FT',
      tag: 'GEOMETRIC MONOLITH VILLA',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
      features: ['Slate Stone Facade', 'Blackened Steel Frames', 'Private Boat Slip', 'Wine Vault'],
    },
    {
      listingId: 4,
      title: 'THE OCHRE SANCTUARY',
      location: 'KYOTO OUTSKIRTS, JAPAN',
      price: '¥ 680,000,000 JPY',
      beds: '4 BEDS',
      baths: '5 BATHS',
      sqft: '5,100 SQ.FT',
      tag: 'NORDIC-JAPANESE PAVILION',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
      features: ['Charred Cedar Timber', 'Rammed Earth Walls', 'Hot Spring Onsen', 'Zen Moss Courtyard'],
    },
  ];

  // Dynamic merged listings: if database has records, enrich or display them
  const activeShowcase = dbListings.length > 0
    ? dbListings.slice(0, 4).map((l, index) => {
        const fallback = fallbackListings[index] || fallbackListings[0];
        return {
          listingId: l.listingId,
          title: l.propertyName.toUpperCase(),
          location: l.location.toUpperCase(),
          price: `$${Number(l.listPrice).toLocaleString()} USD`,
          beds: `${l.propertyType.includes('Villa') ? '6' : '5'} BEDS`,
          baths: '6 BATHS',
          sqft: `${l.areaSqFt ? Number(l.areaSqFt).toLocaleString() : '6,500'} SQ.FT`,
          tag: l.propertyType.toUpperCase() || fallback.tag,
          image: l.image || fallback.image,
          features: fallback.features,
          status: l.status,
        };
      })
    : fallbackListings;

  return (
    <div className="relative z-30 bg-black text-white selection:bg-white selection:text-black">
      {/* ===================================================================== */}
      {/* SECTION: ESTATES (#estates) */}
      {/* ===================================================================== */}
      <section id="estates" className="py-24 md:py-32 px-5 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-rose-300 uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CURATED FREEHOLD PORTFOLIO // LIVE POSTGRESQL</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-white">
              Featured Coastal Estates
            </h2>
          </div>
          <p className="font-geist text-white/60 text-xs sm:text-sm max-w-md leading-relaxed font-light">
            Every sovereign holding in our collection is vetted through architectural rigor, verified title deed provenance, and atomic database registry.
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12">
          {activeShowcase.map((estate) => (
            <div
              key={estate.listingId}
              className="group relative bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500 flex flex-col justify-between shadow-2xl"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={estate.image}
                  alt={estate.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest text-white uppercase">
                    {estate.tag}
                  </span>
                  {(estate as any).status && (estate as any).status !== 'ACTIVE' && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-[9px] font-mono uppercase text-rose-300">
                      {(estate as any).status}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">OFFERED AT</span>
                    <div className="font-heading text-xl md:text-2xl text-white tracking-wide">
                      {estate.price}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-black/50 px-2.5 py-1 rounded-md border border-emerald-500/20 backdrop-blur-sm">
                    <ShieldCheck className="w-3 h-3" />
                    <span>DEED VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-white/50 text-xs font-mono uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-300" />
                    <span>{estate.location}</span>
                  </div>

                  <h3 className="font-heading text-2xl uppercase tracking-wider text-white mb-4">
                    {estate.title}
                  </h3>

                  {/* Specs Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center font-geist text-xs text-white/80 uppercase tracking-wider mb-5">
                    <div>
                      <div className="text-white font-medium">{estate.beds}</div>
                      <div className="text-[10px] text-white/40">Accommodations</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{estate.baths}</div>
                      <div className="text-[10px] text-white/40">En-Suites</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{estate.sqft}</div>
                      <div className="text-[10px] text-white/40">Interior Living</div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {estate.features.map((f) => (
                      <span key={f} className="text-[11px] font-geist px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => onSelectPropertyToInquire(`${estate.title} • ${estate.location} (${estate.price})`, estate.listingId)}
                    className="w-full sm:flex-1 group/btn flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-full font-medium text-xs tracking-wider uppercase hover:bg-gray-200 transition-all cursor-pointer shadow-md"
                  >
                    <span>Submit Tender Offer</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>

                  <button
                    onClick={() => onOpenPortal('patron')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="View in Patron Portal"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Patron Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: STORY (#story) */}
      {/* ===================================================================== */}
      <section id="story" className="py-24 md:py-32 bg-[#080808] border-y border-white/10">
        <div className="px-5 sm:px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-rose-300 uppercase">
              ARCHITECTURAL HERITAGE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-white mt-2 leading-[1.15]">
              Built for permanence.<br />Sculpted for eternity.
            </h2>
            <div className="mt-6 space-y-4 font-geist text-white/70 text-sm sm:text-base leading-relaxed font-light">
              <p>
                Horizon Estates was founded on a singular standard: to transcend transient architectural trends in favor of monumental coastal permanence. Our estates are engineered using low-carbon poured stone, marine-grade titanium framing, and acoustic insulated glass.
              </p>
              <p>
                Every estate in the sovereign collection integrates directly with our 13-relation PostgreSQL real estate database, enforcing Boyce-Codd Normal Form (BCNF) data integrity, atomic escrow settlement, and immutable title provenance records.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-white/10 font-geist">
              <div>
                <div className="text-2xl sm:text-3xl font-heading text-white">100%</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Freehold Sovereign</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading text-white">0.08ms</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Query Latency</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading text-white">13</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">BCNF Relations</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-[4/3] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
              alt="Architectural Blueprint and Materials"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-white/80">
              <span>CANONICAL DOSSIER // ARCHIVE 01</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: LIFESTYLE (#lifestyle) */}
      {/* ===================================================================== */}
      <section id="lifestyle" className="py-24 md:py-32 px-5 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-widest text-rose-300 uppercase">
            COASTAL PRIVILEGE
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-white mt-2">
            The Horizon Lifestyle
          </h2>
          <p className="font-geist text-white/60 text-xs sm:text-sm mt-3 leading-relaxed font-light">
            Unrivaled private services curated specifically for sovereign estate owners and custodial patrons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Anchor,
              title: 'Deep-Water Mooring',
              desc: 'Dedicated private yacht slips accommodating up to 180ft vessels with direct harbor pilotage and shoreside power.',
            },
            {
              icon: Compass,
              title: 'Private Helipad & Air Corridor',
              desc: 'FAA-registered coastal helipads ensuring point-to-point transit to international private aviation terminals.',
            },
            {
              icon: ShieldCheck,
              title: 'Custodial Brokerage & Security',
              desc: '24/7 biometric physical perimeter security combined with atomic escrow cryptographic deed verification.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[#0c0c0c] border border-white/10 hover:border-white/25 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-200 group-hover:scale-110 transition-transform mb-6">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl uppercase tracking-wider text-white mb-2">
                {item.title}
              </h3>
              <p className="font-geist text-white/60 text-xs sm:text-sm leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: VIEWS (#views) */}
      {/* ===================================================================== */}
      <section id="views" className="py-24 md:py-32 bg-[#080808] border-t border-white/10">
        <div className="px-5 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-rose-300 uppercase">
                UNOBSTRUCTED PANORAMAS
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-white mt-2">
                270° Ocean Horizon
              </h2>
            </div>
            <p className="font-geist text-white/60 text-xs sm:text-sm max-w-md leading-relaxed font-light">
              Floor-to-ceiling glass expanses bring the rhythmic Pacific tide directly into the master pavilions and living galleries.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-[21/9] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85"
              alt="Panoramic Ocean View"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-white/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>PACIFIC LIVE OPTICAL FEED • 34.0259° N, 118.7798° W</span>
              </div>
              <button
                onClick={() => onSelectPropertyToInquire('The Horizon Villa • Malibu ($18,500,000)', 1)}
                className="px-4 py-2 rounded-full bg-white text-black font-geist text-xs font-medium uppercase tracking-wider hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Submit Acquisition Offer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: ACQUISITION & DATABASE PORTALS (#inquire) */}
      {/* ===================================================================== */}
      <section id="inquire" className="py-24 md:py-32 px-5 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Contact Information & Concierge */}
          <div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
              CONFIDENTIAL BROKERAGE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-white mt-2">
              Begin Acquisition
            </h2>
            <p className="font-geist text-white/70 text-sm mt-3 leading-relaxed max-w-lg font-light">
              Submit a formal acquisition tender directly into our sovereign database. All transactions are backed by encrypted PostgreSQL 15+ BCNF data handling and formal escrow guarantees.
            </p>

            <div className="mt-8 space-y-4 font-mono text-xs text-white/80">
              <div className="flex items-center gap-3">
                <span className="w-20 text-white/40 uppercase">Desk:</span>
                <span>+1 (310) 892-0194</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-white/40 uppercase">Tenders:</span>
                <span>acquisitions@horizon-estates.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-white/40 uppercase">Vault:</span>
                <span>BCNF PostgreSQL 15+ Cluster (Active)</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onSelectPropertyToInquire('The Horizon Villa • Malibu ($18,500,000)', 1)}
                className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-xs font-medium tracking-wider uppercase hover:bg-gray-200 transition-all shadow-xl cursor-pointer"
              >
                <span>Submit Acquisition Tender</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right: Direct DBMS Portal Launchpads */}
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
            <div className="text-xs font-mono tracking-widest text-white/50 uppercase mb-4 flex items-center justify-between">
              <span>REAL ESTATE DBMS ACCESS DESK</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Patron Portal Card */}
            <button
              onClick={() => onOpenPortal('patron')}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-geist font-medium text-sm text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-300" />
                  <span>Patron Customer Portal</span>
                </div>
                <div className="text-xs text-white/50 font-light mt-1">
                  Browse verified deeds, submit binding purchase tenders, review contracts
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* Atelier Broker Card */}
            <button
              onClick={() => onOpenPortal('agent')}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-geist font-medium text-sm text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-rose-300" />
                  <span>Atelier Broker Desk</span>
                </div>
                <div className="text-xs text-white/50 font-light mt-1">
                  Full consignment inventory CRUD, commission ledger, atomic sale transactions
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* SQL Terminal Card */}
            <button
              onClick={() => onOpenPortal('sql')}
              className="w-full p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-400 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-geist font-medium text-sm text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Interactive SQL Terminal</span>
                </div>
                <div className="text-xs text-emerald-200/60 font-light mt-1">
                  Direct live PostgreSQL query runner against the 13 BCNF tables
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* FOOTER */}
      {/* ===================================================================== */}
      <footer className="py-12 border-t border-white/10 text-center text-xs font-mono text-white/40 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} HORIZON ESTATES. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-6">
            <span>BOYCE-CODD NORMAL FORM</span>
            <span>POSTGRESQL 15+</span>
            <span>REACT 19 + TAILWIND</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
