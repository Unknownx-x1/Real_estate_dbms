import React from 'react';
import { Search } from 'lucide-react';
import type { PropertyItem } from '../types/property';

interface HeaderNavProps {
  currentProperty: PropertyItem;
  onOpenIndex?: () => void;
}

/**
 * Section 10: Minimal Editorial Navigation
 * Small, uppercase, precise, widely tracked typography.
 * Clicking items smoothly navigates to corresponding sections.
 */
export const HeaderNav: React.FC<HeaderNavProps> = ({ currentProperty, onOpenIndex }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 md:py-8 flex items-center justify-between pointer-events-auto transition-colors duration-650">
      {/* Top Left: Brand Mark */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex flex-col text-left font-sans tracking-widest-editorial text-xs md:text-[11px] uppercase transition-opacity duration-300"
          style={{ color: currentProperty.textTone }}
        >
          <span className="font-bold tracking-super-wide text-[12px] md:text-[13px]">MONOLITH</span>
          <span className="text-[9px] md:text-[8px] tracking-[0.4em] opacity-60">SPATIAL ARCHIVES / 01</span>
        </button>
      </div>

      {/* Center: Editorial Links */}
      <nav className="hidden md:flex items-center space-x-10">
        <button
          onClick={() => scrollTo('hero')}
          className="text-[10px] uppercase tracking-widest-editorial font-medium transition-all duration-300 hover:opacity-100 relative py-1"
          style={{ color: currentProperty.textTone, opacity: 0.75 }}
        >
          PROPERTIES
        </button>
        <button
          onClick={() => scrollTo('explore')}
          className="text-[10px] uppercase tracking-widest-editorial font-medium transition-all duration-300 hover:opacity-100 relative py-1"
          style={{ color: currentProperty.textTone, opacity: 0.75 }}
        >
          EXPLORE
        </button>
        <button
          onClick={() => scrollTo('curation')}
          className="text-[10px] uppercase tracking-widest-editorial font-medium transition-all duration-300 hover:opacity-100 relative py-1"
          style={{ color: currentProperty.textTone, opacity: 0.75 }}
        >
          CURATION
        </button>
        <button
          onClick={() => scrollTo('about')}
          className="text-[10px] uppercase tracking-widest-editorial font-medium transition-all duration-300 hover:opacity-100 relative py-1"
          style={{ color: currentProperty.textTone, opacity: 0.75 }}
        >
          ABOUT
        </button>
      </nav>

      {/* Top Right: Search & Minimal Sign In */}
      <div className="flex items-center space-x-6 md:space-x-8">
        <button 
          onClick={onOpenIndex}
          className="flex items-center space-x-2 text-[10px] uppercase tracking-widest-editorial transition-opacity hover:opacity-100"
          style={{ 
            color: currentProperty.textTone,
            opacity: 0.75 
          }}
          aria-label="Open Archive Index"
        >
          <Search className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline">INDEX</span>
        </button>

        <button 
          onClick={onOpenIndex}
          className="text-[10px] uppercase tracking-widest-editorial transition-opacity hover:opacity-100"
          style={{ 
            color: currentProperty.textTone,
            opacity: 0.75 
          }}
        >
          SIGN IN
        </button>
      </div>
    </header>
  );
};
