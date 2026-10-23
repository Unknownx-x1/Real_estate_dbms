// ============================================================================
// REAL ESTATE PROPERTY PLATFORM
// File: frontend/src/components/HorizonSections.tsx
// Bespoke Architectural Luxury Sections & DBMS Intelligence Suite
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Briefcase, 
  Terminal, 
  MapPin, 
  Anchor, 
  Compass, 
  Network,
  Zap
} from 'lucide-react';
import { apiClient, type ListingRecord } from '../services/api';

interface HorizonSectionsProps {
  onSelectPropertyToInquire: (propertyName: string, listingId?: number) => void;
  onOpenPortal: (view: 'patron' | 'agent' | 'sql' | 'graph') => void;
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
      location: '1084 Pacific Coast Highway, Malibu, California',
      price: '$18,500,000 USD',
      beds: '6 Bedrooms',
      baths: '8 En-Suites',
      sqft: '9,400 Sq.Ft',
      tag: 'Flagship Coastal Compound',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      features: ['270° Ocean Horizon', 'Private Beach Access', 'Cantilevered Pool', 'Integrated Automation'],
    },
    {
      listingId: 2,
      title: 'THE CANTILEVER HOUSE',
      location: 'Algarve Coastal Bluffs, Portugal',
      price: '$4,850,000 USD',
      beds: '5 Bedrooms',
      baths: '6 En-Suites',
      sqft: '6,400 Sq.Ft',
      tag: 'Brutalist Cliff Pavilion',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      features: ['Board-Formed Concrete', 'Volcanic Stone Terrace', 'Clifftop Belvedere', 'Solar Microgrid'],
    },
    {
      listingId: 3,
      title: 'VILLA OBSIDIAN',
      location: 'Lake Lugano, Ticino, Switzerland',
      price: '$7,200,000 USD',
      beds: '7 Bedrooms',
      baths: '8 En-Suites',
      sqft: '7,850 Sq.Ft',
      tag: 'Geometric Monolith Villa',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
      features: ['Honed Slate Facade', 'Blackened Steel Profiles', 'Private Boat Slip', 'Subterranean Vault'],
    },
    {
      listingId: 4,
      title: 'THE OCHRE SANCTUARY',
      location: 'Kyoto Outskirts, Japan',
      price: '$4,500,000 USD',
      beds: '4 Bedrooms',
      baths: '5 En-Suites',
      sqft: '5,100 Sq.Ft',
      tag: 'Nordic-Japanese Pavilion',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
      features: ['Charred Cedar Siding', 'Rammed Earth Core', 'Thermal Onsen Spring', 'Zen Moss Garden'],
    },
  ];

  // Dynamic merged listings: if database has records, enrich or display them
  const activeShowcase = dbListings.length > 0
    ? dbListings.slice(0, 4).map((l, index) => {
        const fallback = fallbackListings[index] || fallbackListings[0];
        return {
          listingId: l.listingId,
          title: l.propertyName.toUpperCase(),
          location: l.location,
          price: `$${Number(l.listPrice).toLocaleString()} USD`,
          beds: `${l.propertyType.includes('Villa') ? '6' : '5'} Bedrooms`,
          baths: '6 En-Suites',
          sqft: `${l.areaSqFt ? Number(l.areaSqFt).toLocaleString() : '6,500'} Sq.Ft`,
          tag: l.propertyType || fallback.tag,
          image: l.image || fallback.image,
          features: fallback.features,
          status: l.status,
        };
      })
    : fallbackListings;

  return (
    <div className="relative z-30 bg-[#080809] text-[#f7f6f2] selection:bg-[#c5a880] selection:text-[#080809]">
      {/* ===================================================================== */}
      {/* SECTION: ESTATES (#estates) */}
      {/* ===================================================================== */}
      <section id="estates" className="py-28 md:py-36 px-5 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-[#c5a880]/15 pb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-geist tracking-[0.3em] text-[#c5a880] uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
              <span>Curated Sovereign Portfolio · Vol. IV</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-6xl uppercase tracking-[0.16em] text-[#f7f6f2]">
              Featured Coastal Estates
            </h2>
          </div>
          <p className="font-geist text-[#a8a29e] text-xs sm:text-sm max-w-md leading-relaxed font-light">
            Each sovereign holding in our collection is vetted through architectural rigor, sovereign freehold deed provenance, and immutable title verification.
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
          {activeShowcase.map((estate) => (
            <div
              key={estate.listingId}
              className="group relative bg-[#0e0d0c]/80 border border-[#c5a880]/20 rounded-2xl overflow-hidden hover:border-[#c5a880]/60 transition-all duration-700 flex flex-col justify-between shadow-2xl backdrop-blur-sm"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={estate.image}
                  alt={estate.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-black/30 to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-[#0c0b0a]/75 backdrop-blur-md border border-[#c5a880]/30 text-[9px] md:text-[10px] font-geist tracking-[0.2em] text-[#e4d7c5] uppercase">
                    {estate.tag}
                  </span>
                  {(estate as any).status && (estate as any).status !== 'ACTIVE' && (
                    <span className="px-3 py-1 rounded-full bg-[#3d1217]/80 border border-rose-500/40 text-[9px] font-geist tracking-wider uppercase text-rose-300">
                      {(estate as any).status}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[9px] font-geist uppercase tracking-[0.25em] text-[#a8a29e]">ACQUISITION TENDER</span>
                    <div className="font-cormorant text-2xl md:text-3xl text-[#f7f6f2] font-light tracking-wide mt-0.5">
                      {estate.price}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-geist tracking-wider text-[#c5a880] bg-[#121110]/80 px-3 py-1 rounded-full border border-[#c5a880]/30 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>FREEHOLD VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#a8a29e] text-xs font-geist uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>{estate.location}</span>
                  </div>

                  <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-[0.12em] text-[#f7f6f2] mb-4">
                    {estate.title}
                  </h3>

                  {/* Specs Bar */}
                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#c5a880]/15 text-center font-geist text-xs text-[#dedad2] uppercase tracking-wider mb-6">
                    <div>
                      <div className="text-[#f7f6f2] font-medium">{estate.beds}</div>
                      <div className="text-[9px] text-[#8c867e] tracking-widest mt-0.5">Living Suites</div>
                    </div>
                    <div>
                      <div className="text-[#f7f6f2] font-medium">{estate.baths}</div>
                      <div className="text-[9px] text-[#8c867e] tracking-widest mt-0.5">Bathrooms</div>
                    </div>
                    <div>
                      <div className="text-[#f7f6f2] font-medium">{estate.sqft}</div>
                      <div className="text-[9px] text-[#8c867e] tracking-widest mt-0.5">Interior Living</div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {estate.features.map((f) => (
                      <span key={f} className="text-[11px] font-geist px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[#bfbab0]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => onSelectPropertyToInquire(`${estate.title} • ${estate.location} (${estate.price})`, estate.listingId)}
                    className="w-full sm:flex-1 group/btn flex items-center justify-center gap-2.5 bg-[#f7f6f2] hover:bg-[#eadecc] text-[#0a0a0b] py-3 rounded-full font-geist font-medium text-xs tracking-[0.18em] uppercase transition-all duration-300 cursor-pointer shadow-md"
                  >
                    <span>Submit Tender Offer</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>

                  <button
                    onClick={() => onOpenPortal('patron')}
                    className="w-full sm:w-auto px-5 py-3 rounded-full border border-[#c5a880]/30 hover:border-[#c5a880] text-[#e4d7c5] hover:text-[#f7f6f2] text-xs font-geist uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-[#141312]/40"
                    title="View in Patron Portal"
                  >
                    <User className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Patron Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: STORY & ARCHITECTURAL HERITAGE (#story) */}
      {/* ===================================================================== */}
      <section id="story" className="py-28 md:py-36 bg-[#0b0a0a] border-y border-[#c5a880]/15 relative overflow-hidden">
        <div className="px-5 sm:px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[10px] font-geist tracking-[0.3em] text-[#c5a880] uppercase">
              Monolithic Architecture
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.14em] text-[#f7f6f2] mt-2 leading-[1.2]">
              Built for permanence.<br />Sculpted for eternity.
            </h2>
            <div className="mt-6 space-y-4 font-geist text-[#a8a29e] text-sm sm:text-base leading-relaxed font-light">
              <p>
                Horizon Estates was founded on an exacting ethos: to transcend fleeting design fads in favor of monumental coastal permanence. Our estates are engineered using low-carbon poured stone, marine-grade bronze framing, and low-iron acoustic glazing.
              </p>
              <p>
                Every estate in our private collection is backed by irrevocable title deed provenance, atomic financial custodial guarantees, and synchronized graph intelligence for high-net-worth portfolio management.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-[#c5a880]/15 font-geist">
              <div>
                <div className="text-2xl sm:text-4xl font-heading text-[#f7f6f2]">100%</div>
                <div className="text-xs text-[#a8a29e] uppercase tracking-wider mt-1">Freehold Sovereign</div>
              </div>
              <div>
                <div className="text-2xl sm:text-4xl font-heading text-[#c5a880]">270°</div>
                <div className="text-xs text-[#a8a29e] uppercase tracking-wider mt-1">Coastal Elevation</div>
              </div>
              <div>
                <div className="text-2xl sm:text-4xl font-heading text-[#f7f6f2]">82×</div>
                <div className="text-xs text-[#a8a29e] uppercase tracking-wider mt-1">GraphBLAS Velocity</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#c5a880]/20 aspect-[4/3] shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
              alt="Architectural Materiality and Structure"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-geist tracking-[0.2em] text-[#e4d7c5] uppercase">
              <span>Architectural Monograph · Vol. I</span>
              <span>Malibu, California</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: LIFESTYLE (#lifestyle) */}
      {/* ===================================================================== */}
      <section id="lifestyle" className="py-28 md:py-36 px-5 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[10px] font-geist tracking-[0.3em] text-[#c5a880] uppercase">
            Curated Privileges
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.16em] text-[#f7f6f2] mt-2">
            The Horizon Lifestyle
          </h2>
          <p className="font-geist text-[#a8a29e] text-xs sm:text-sm mt-3 leading-relaxed font-light">
            Unrivaled private services curated specifically for sovereign estate owners and custodial patrons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Anchor,
              title: 'Deep-Water Mooring',
              desc: 'Dedicated private yacht slips accommodating up to 180ft vessels with shoreside power and private harbour pilotage.',
            },
            {
              icon: Compass,
              title: 'Helipad & Air Corridor',
              desc: 'FAA-registered coastal helipads ensuring point-to-point transit to international private aviation hubs.',
            },
            {
              icon: ShieldCheck,
              title: 'Custodial Title & Escrow',
              desc: 'Discrete custodial transaction handling combined with atomic database escrow settlement.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[#0e0d0c]/70 border border-[#c5a880]/15 hover:border-[#c5a880]/40 transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#181716] border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880] group-hover:scale-110 transition-transform mb-6">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl uppercase tracking-wider text-[#f7f6f2] mb-3">
                {item.title}
              </h3>
              <p className="font-geist text-[#a8a29e] text-xs sm:text-sm leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: VIEWS (#views) */}
      {/* ===================================================================== */}
      <section id="views" className="py-28 md:py-36 bg-[#0a0a0b] border-t border-[#c5a880]/15">
        <div className="px-5 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-[10px] font-geist tracking-[0.3em] text-[#c5a880] uppercase">
                Panoramic Horizons
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.16em] text-[#f7f6f2] mt-2">
                270° Ocean Elevation
              </h2>
            </div>
            <p className="font-geist text-[#a8a29e] text-xs sm:text-sm max-w-md leading-relaxed font-light">
              Floor-to-ceiling glass expanses bring the rhythmic Pacific tide directly into the master pavilions and living galleries.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#c5a880]/20 aspect-[21/9] shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=85"
              alt="Panoramic Ocean View"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-geist tracking-[0.2em] text-[#e4d7c5] uppercase">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                <span>Pacific Coastal Elevation · Malibu, California</span>
              </div>
              <button
                onClick={() => onSelectPropertyToInquire('The Horizon Villa • Malibu ($18,500,000)', 1)}
                className="px-5 py-2.5 rounded-full bg-[#f7f6f2] hover:bg-[#eadecc] text-[#0a0a0b] font-geist text-xs font-medium uppercase tracking-[0.18em] transition-colors cursor-pointer shadow-lg"
              >
                Inquire on Acquisition
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION: ACQUISITION & DATABASE INTELLIGENCE SUITE (#inquire) */}
      {/* ===================================================================== */}
      <section id="inquire" className="py-28 md:py-36 px-5 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-[#c5a880]/15">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Contact Information & Concierge */}
          <div>
            <span className="text-[10px] font-geist tracking-[0.3em] text-[#c5a880] uppercase">
              Private Concierge
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.16em] text-[#f7f6f2] mt-2">
              Begin Acquisition
            </h2>
            <p className="font-geist text-[#a8a29e] text-sm mt-4 leading-relaxed max-w-lg font-light">
              Submit a formal acquisition tender directly into our private database registry. All transactions are backed by cryptographic escrow and formal title guarantees.
            </p>

            <div className="mt-8 space-y-4 font-geist text-xs text-[#dedad2]">
              <div className="flex items-center gap-3">
                <span className="w-24 text-[#8c867e] uppercase tracking-wider">Private Desk:</span>
                <span>+1 (310) 892-0194</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-[#8c867e] uppercase tracking-wider">Tenders:</span>
                <span>acquisitions@horizon-estates.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-[#8c867e] uppercase tracking-wider">Registry:</span>
                <span className="text-[#c5a880]">Cryptographic & Title Verified</span>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={() => onSelectPropertyToInquire('The Horizon Villa • Malibu ($18,500,000)', 1)}
                className="group flex items-center gap-2.5 bg-[#f7f6f2] hover:bg-[#eadecc] text-[#0a0a0b] px-7 py-3.5 rounded-full text-xs font-geist font-medium tracking-[0.18em] uppercase transition-all shadow-xl cursor-pointer"
              >
                <span>Submit Tender Offer</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right: Direct DBMS & Graph Intelligence Launchpads */}
          <div className="bg-[#0e0d0c] border border-[#c5a880]/20 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl backdrop-blur-sm">
            <div className="text-xs font-geist tracking-[0.25em] text-[#c5a880] uppercase mb-4 flex items-center justify-between">
              <span>DBMS & Graph Intelligence Suite</span>
              <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
            </div>

            {/* Patron Portal Card */}
            <button
              onClick={() => onOpenPortal('patron')}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#c5a880]/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-geist font-medium text-sm text-[#f7f6f2] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#c5a880]" />
                  <span>Patron Customer Portal</span>
                </div>
                <div className="text-xs text-[#a8a29e] font-light mt-1">
                  Browse verified deeds, submit binding purchase tenders, review contracts
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* Atelier Broker Card */}
            <button
              onClick={() => onOpenPortal('agent')}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#c5a880]/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-geist font-medium text-sm text-[#f7f6f2] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#c5a880]" />
                  <span>Atelier Broker Desk</span>
                </div>
                <div className="text-xs text-[#a8a29e] font-light mt-1">
                  Full consignment inventory CRUD, commission ledger, atomic sale transactions
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* SQL Terminal Card */}
            <button
              onClick={() => onOpenPortal('sql')}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#c5a880]/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-geist font-medium text-sm text-[#f7f6f2] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#c5a880]" />
                  <span>PostgreSQL Query Console</span>
                </div>
                <div className="text-xs text-[#a8a29e] font-light mt-1">
                  Live relational SQL query runner with raw schema introspection
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            {/* FalkorDB Graph Engine Card */}
            <button
              onClick={() => onOpenPortal('graph')}
              className="w-full p-4 rounded-xl border border-[#c5a880]/30 bg-[#c5a880]/[0.06] hover:bg-[#c5a880]/[0.12] hover:border-[#c5a880] text-left transition-all flex items-center justify-between group cursor-pointer shadow-sm"
            >
              <div>
                <div className="font-geist font-medium text-sm text-[#f7f6f2] flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#c5a880]" />
                  <span className="text-[#e4d7c5] font-semibold">FalkorDB GraphBLAS Explorer</span>
                </div>
                <div className="text-xs text-[#c5a880]/80 font-light mt-1">
                  Interactive 2D force-graph visualizer, recommendation engine & 82x live benchmark
                </div>
              </div>
              <Zap className="w-4 h-4 text-[#c5a880] transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* FOOTER */}
      {/* ===================================================================== */}
      <footer className="py-14 border-t border-[#c5a880]/15 text-center text-xs font-geist text-[#8c867e] px-5 bg-[#070708]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="tracking-[0.16em] uppercase">
            © {new Date().getFullYear()} Horizon Estates · Sovereign Architectural Portfolio
          </div>
          <div className="flex items-center gap-6 text-[10px] tracking-[0.2em] uppercase text-[#a8a29e]">
            <span>PostgreSQL 15+</span>
            <span className="text-[#c5a880]/40">·</span>
            <span>FalkorDB GraphBLAS</span>
            <span className="text-[#c5a880]/40">·</span>
            <span>React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
