import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal, User, Briefcase, LogOut, Network } from 'lucide-react';
import { Logo } from './HorizonLogo';
import type { UserSession } from '../services/api';

interface NavbarProps {
  session?: UserSession | null;
  onOpenSignIn?: () => void;
  onSignOut?: () => void;
  onOpenInquire?: () => void;
  onOpenPortal?: (view: 'patron' | 'agent' | 'sql' | 'graph') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onOpenSignIn,
  onSignOut,
  onOpenInquire,
  onOpenPortal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Background blur when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'Story', target: 'story' },
    { label: 'Estates', target: 'estates' },
    { label: 'Lifestyle', target: 'lifestyle' },
    { label: 'Views', target: 'views' },
    { label: 'Acquire', target: 'inquire' },
  ];

  const handleLinkClick = (target: string) => {
    setIsMenuOpen(false);
    if (target === 'inquire' && onOpenInquire) {
      onOpenInquire();
      return;
    }
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-5 md:px-12 py-3.5 md:py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-black/85 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
        }`}
      >
        {/* Left - Logo SVG & Brand Title */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative z-50 cursor-pointer flex items-center gap-3 group"
          aria-label="Horizon Estates Home"
        >
          <Logo className="w-7 h-7 md:w-9 md:h-9 text-white relative z-50 transition-transform group-hover:scale-105" />
          <div className="flex flex-col text-left">
            <span className="font-heading text-base md:text-lg tracking-[0.25em] text-[#f7f6f2] uppercase leading-none">
              Horizon
            </span>
            <span className="text-[8px] font-geist tracking-[0.35em] text-[#c5a880] uppercase mt-0.5">
              Estates · Malibu
            </span>
          </div>
        </button>

        {/* Center - Nav Links (hidden mobile, visible lg+) */}
        <div className="hidden lg:flex items-center gap-9 text-[#dedad2] text-xs uppercase tracking-[0.22em] font-geist font-light">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleLinkClick(item.target)}
              className="hover:text-[#c5a880] transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#c5a880] hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right - Authentication, DBMS Suite, & CTA (hidden mobile, visible md+) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Curated DBMS & Graph Engine Suite */}
          {onOpenPortal && (
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#121110]/80 border border-[#c5a880]/25 backdrop-blur-md shadow-inner">
              <button
                onClick={() => onOpenPortal('patron')}
                className="px-3 py-1 rounded-full hover:bg-white/10 text-[10px] font-geist tracking-[0.14em] text-[#dedad2] hover:text-white uppercase transition-all"
                title="Open Patron Customer Portal"
              >
                Patron
              </button>

              <button
                onClick={() => onOpenPortal('agent')}
                className="px-3 py-1 rounded-full hover:bg-white/10 text-[10px] font-geist tracking-[0.14em] text-[#dedad2] hover:text-white uppercase transition-all"
                title="Open Atelier Broker Desk"
              >
                Atelier
              </button>

              <span className="w-[1px] h-3 bg-[#c5a880]/30 mx-0.5" />

              <button
                onClick={() => onOpenPortal('sql')}
                className="px-2.5 py-1 rounded-full hover:bg-[#c5a880]/15 text-[10px] font-geist tracking-[0.14em] text-[#e4d7c5] hover:text-white uppercase transition-all flex items-center gap-1"
                title="Open Interactive SQL Query Console"
              >
                <Terminal className="w-3 h-3 text-[#c5a880]" />
                <span>SQL</span>
              </button>

              <button
                onClick={() => onOpenPortal('graph')}
                className="px-2.5 py-1 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/40 hover:bg-[#c5a880]/30 text-[10px] font-geist tracking-[0.14em] text-[#f7f6f2] uppercase transition-all flex items-center gap-1 shadow-sm font-medium"
                title="Open FalkorDB Graph Engine & Visualizer"
              >
                <Network className="w-3 h-3 text-[#c5a880]" />
                <span>Graph</span>
              </button>
            </div>
          )}

          {/* User Session Pill or Sign In Trigger */}
          {session ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#c5a880]/20">
              <button
                onClick={() => {
                  if (session.role === 'CUSTOMER' && onOpenPortal) onOpenPortal('patron');
                  else if (session.role === 'AGENT' && onOpenPortal) onOpenPortal('agent');
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181716]/80 hover:bg-[#22201d] border border-[#c5a880]/30 text-[#f7f6f2] transition-all cursor-pointer"
                title="View Active Profile"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                <span className="text-[10px] font-geist uppercase tracking-widest max-w-[120px] truncate">
                  {session.name.split(' ')[0]} ({session.role === 'CUSTOMER' ? 'PATRON' : 'ATELIER'})
                </span>
              </button>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenSignIn && (
              <button
                onClick={onOpenSignIn}
                className="px-4 py-1.5 rounded-full border border-[#c5a880]/30 hover:border-[#c5a880] text-[10px] font-geist uppercase tracking-[0.25em] text-[#e4d7c5] hover:text-white transition-all cursor-pointer bg-[#141312]/40"
              >
                Sign In
              </button>
            )
          )}

          {/* Primary CTA button: Inquire Privately */}
          <button
            onClick={onOpenInquire}
            className="group flex items-center gap-2.5 bg-[#f7f6f2] hover:bg-[#eadecc] text-[#0a0a0b] rounded-full pl-5 pr-2 py-2 transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span className="text-xs font-geist font-medium tracking-[0.16em] uppercase">
              Inquire Privately
            </span>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#c5a880]/20 group-hover:bg-[#c5a880]/30 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-[#0a0a0b]" />
            </span>
          </button>
        </div>

        {/* Mobile Hamburger (visible below md) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-50 md:hidden flex flex-col items-center justify-center w-10 h-10 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span
            className={`block w-5 h-[1.5px] bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)] ${
              isMenuOpen ? 'rotate-45 translate-y-[3px]' : '-translate-y-[3px]'
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)] ${
              isMenuOpen ? '-rotate-45 -translate-y-[0px]' : 'translate-y-[3px]'
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)] ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity duration-500" />

        <div className="relative h-full flex flex-col items-center justify-center px-8">
          <div className="flex flex-col items-center gap-6">
            {navLinks.map((item, i) => (
              <button
                key={item.label}
                onClick={() => handleLinkClick(item.target)}
                className={`text-white text-2xl font-heading tracking-wider uppercase hover:text-white/70 transition-all duration-500 cursor-pointer ${
                  isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${100 + i * 60}ms` }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (onOpenInquire) onOpenInquire();
            }}
            className={`mt-8 group flex items-center gap-2 bg-white text-black rounded-full pl-5 pr-1.5 py-2 hover:bg-gray-200 transition-all duration-500 shadow-lg cursor-pointer ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '420ms' }}
          >
            <span className="text-xs font-geist font-medium tracking-wider uppercase">
              Submit Acquisition Offer
            </span>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-black/10 group-hover:bg-black/20 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </span>
          </button>

          {/* User state in mobile drawer */}
          <div className="mt-6 flex flex-col items-center gap-3 text-xs font-mono">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-white/80 uppercase">
                  {session.name} ({session.role})
                </span>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onSignOut) onSignOut();
                  }}
                  className="text-rose-400 hover:text-rose-300 underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              onOpenSignIn && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSignIn();
                  }}
                  className="text-white/80 hover:text-white underline uppercase tracking-widest text-[11px]"
                >
                  Sign In to Patron / Atelier
                </button>
              )
            )}
          </div>

          {/* Quick DBMS links inside mobile drawer */}
          {onOpenPortal && (
            <div className="mt-8 flex items-center gap-4 text-[10px] font-mono tracking-widest text-white/50 uppercase">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPortal('patron');
                }}
                className="hover:text-white flex items-center gap-1"
              >
                <User className="w-3 h-3" /> Patron
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPortal('agent');
                }}
                className="hover:text-white flex items-center gap-1"
              >
                <Briefcase className="w-3 h-3" /> Atelier
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPortal('sql');
                }}
                className="hover:text-emerald-400 flex items-center gap-1"
              >
                <Terminal className="w-3 h-3 text-emerald-400" /> SQL
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPortal('graph');
                }}
                className="hover:text-amber-400 flex items-center gap-1"
              >
                <Network className="w-3 h-3 text-amber-400" /> Graph
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
