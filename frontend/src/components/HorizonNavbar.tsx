import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal, User, Briefcase } from 'lucide-react';
import { Logo } from './HorizonLogo';

interface NavbarProps {
  onOpenInquire?: () => void;
  onOpenPortal?: (view: 'patron' | 'agent' | 'sql') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenInquire, onOpenPortal }) => {
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
    { label: 'Inquire', target: 'inquire' },
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
        className={`fixed top-0 left-0 right-0 z-50 px-5 md:px-12 py-4 md:py-5 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
        }`}
      >
        {/* Left - Logo SVG */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative z-50 cursor-pointer flex items-center gap-3 group"
          aria-label="Horizon Estates Home"
        >
          <Logo className="w-7 h-7 md:w-10 md:h-10 text-white relative z-50 transition-transform group-hover:scale-105" />
          <span className="hidden sm:inline-block font-heading text-lg tracking-widest text-white uppercase">
            Horizon
          </span>
        </button>

        {/* Center - Nav Links (hidden mobile, visible md+) */}
        <div className="hidden md:flex items-center gap-8 text-white/90 text-sm font-geist font-light tracking-wide">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleLinkClick(item.target)}
              className="hover:text-white transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right - CTA Button & DBMS quick links (hidden mobile, visible md+) */}
        <div className="hidden md:flex items-center gap-5">
          {/* Quick Portal buttons */}
          {onOpenPortal && (
            <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest text-white/60 uppercase">
              <button
                onClick={() => onOpenPortal('patron')}
                className="hover:text-white flex items-center gap-1 transition-opacity opacity-75 hover:opacity-100 cursor-pointer"
                title="Open Patron Customer Portal"
              >
                <User className="w-3 h-3" />
                <span>Patron</span>
              </button>

              <button
                onClick={() => onOpenPortal('agent')}
                className="hover:text-white flex items-center gap-1 transition-opacity opacity-75 hover:opacity-100 cursor-pointer"
                title="Open Atelier Broker Desk"
              >
                <Briefcase className="w-3 h-3" />
                <span>Atelier</span>
              </button>

              <button
                onClick={() => onOpenPortal('sql')}
                className="hover:text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/30 transition-all cursor-pointer"
                title="Open Interactive SQL Query Console"
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>SQL</span>
              </button>
            </div>
          )}

          {/* Primary CTA button */}
          <button
            onClick={onOpenInquire}
            className="group flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full pl-5 pr-1.5 py-1.5 hover:bg-white transition-all shadow-lg cursor-pointer"
          >
            <span className="text-gray-800 text-xs md:text-sm font-geist font-medium tracking-wider uppercase">
              Inquire
            </span>
            <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-rose-200/60 group-hover:bg-rose-300/70 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-gray-700" />
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
            className={`mt-10 group flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full pl-5 pr-1.5 py-1.5 hover:bg-white transition-all duration-500 shadow-lg cursor-pointer ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '420ms' }}
          >
            <span className="text-gray-800 text-xs font-geist font-medium tracking-wider uppercase">
              Inquire
            </span>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-200/60 group-hover:bg-rose-300/70 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-gray-700" />
            </span>
          </button>

          {/* Quick DBMS links inside mobile drawer */}
          {onOpenPortal && (
            <div className="mt-8 flex items-center gap-4 text-[10px] font-mono tracking-widest text-white/50 uppercase">
              <button onClick={() => { setIsMenuOpen(false); onOpenPortal('patron'); }} className="hover:text-white flex items-center gap-1">
                <User className="w-3 h-3" /> Patron
              </button>
              <span>•</span>
              <button onClick={() => { setIsMenuOpen(false); onOpenPortal('agent'); }} className="hover:text-white flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Atelier
              </button>
              <span>•</span>
              <button onClick={() => { setIsMenuOpen(false); onOpenPortal('sql'); }} className="hover:text-emerald-400 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-emerald-400" /> SQL
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
