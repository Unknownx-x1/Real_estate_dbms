import React, { useState, useEffect } from 'react';
import { ArrowRight, Terminal, User, Briefcase } from 'lucide-react';
import { Logo } from './HorizonLogo';

interface NavbarProps {
  onOpenPortal?: (view: 'patron' | 'agent' | 'sql') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPortal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navLinks = ['Story', 'Estates', 'Lifestyle', 'Views', 'Inquire'];

  const handleLinkClick = (link: string) => {
    setIsMenuOpen(false);
    if (link === 'Inquire' && onOpenPortal) {
      onOpenPortal('patron');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 md:px-12 py-4 md:py-5 flex items-center justify-between">
        {/* Left - Logo SVG */}
        <a href="#" className="relative z-50 cursor-pointer" aria-label="Horizon Estates Home">
          <Logo className="w-7 h-7 md:w-10 md:h-10 text-white relative z-50" />
        </a>

        {/* Center - Nav Links (hidden mobile, visible md+) */}
        <div className="hidden md:flex items-center gap-8 text-white/90 text-sm font-geist font-light tracking-wide">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => handleLinkClick(link)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {link}
            </button>
          ))}
        </div>

        {/* Right - CTA Button (hidden mobile, visible md+) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => onOpenPortal ? onOpenPortal('patron') : null}
            className="hidden md:flex group items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full pl-5 pr-1.5 py-1.5 hover:bg-white transition-all shadow-lg cursor-pointer"
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
            {navLinks.map((link, i) => (
              <button
                key={link}
                onClick={() => handleLinkClick(link)}
                className={`text-white text-2xl font-heading tracking-wider uppercase hover:text-white/70 transition-all duration-500 cursor-pointer ${
                  isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${100 + i * 60}ms` }}
              >
                {link}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (onOpenPortal) onOpenPortal('patron');
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
