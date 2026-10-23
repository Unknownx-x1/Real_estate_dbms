import React from 'react';
import { Search, LogOut, User, Briefcase, Terminal } from 'lucide-react';
import type { PropertyItem } from '../types/property';
import type { UserSession } from '../services/api';

interface HeaderNavProps {
  currentProperty: PropertyItem;
  onOpenIndex?: () => void;
  onOpenSignIn?: () => void;
  onOpenPatronPortal?: () => void;
  onOpenAgentPortal?: () => void;
  onOpenSqlQuery?: () => void;
  session?: UserSession | null;
  onSignOut?: () => void;
}

/**
 * Minimal Editorial Navigation
 * Small, uppercase, precise, widely tracked typography.
 * Supports direct role portal navigation & session status indicator.
 */
export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentProperty,
  onOpenIndex,
  onOpenSignIn,
  onOpenPatronPortal,
  onOpenAgentPortal,
  onOpenSqlQuery,
  session,
  onSignOut,
}) => {
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
      <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
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

        {/* Quick Portal Switchers */}
        <div className="h-3 w-[1px] opacity-30" style={{ backgroundColor: currentProperty.textTone }} />

        <button
          onClick={onOpenPatronPortal}
          className="text-[10px] uppercase tracking-widest-editorial font-medium transition-all duration-300 hover:opacity-100 flex items-center space-x-1"
          style={{ color: currentProperty.textTone, opacity: 0.85 }}
          title="Open Patron / Customer Portal"
        >
          <User className="w-3 h-3 opacity-60" />
          <span>PATRON</span>
        </button>

        <button
          onClick={onOpenAgentPortal}
          className="text-[10px] uppercase tracking-widest-editorial font-medium transition-all duration-300 hover:opacity-100 flex items-center space-x-1"
          style={{ color: currentProperty.textTone, opacity: 0.85 }}
          title="Open Atelier / Agent Portal"
        >
          <Briefcase className="w-3 h-3 opacity-60" />
          <span>ATELIER</span>
        </button>

        {onOpenSqlQuery && (
          <button
            onClick={onOpenSqlQuery}
            className="text-[10px] uppercase tracking-widest-editorial font-medium transition-all duration-300 hover:opacity-100 flex items-center space-x-1.5 px-2.5 py-1 rounded border border-current/20 hover:bg-current/10"
            style={{ color: currentProperty.textTone, opacity: 0.95 }}
            title="Open Interactive SQL Query Console"
          >
            <Terminal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">SQL QUERY</span>
          </button>
        )}
      </nav>

      {/* Top Right: Search, Session Status & Sign In */}
      <div className="flex items-center space-x-4 md:space-x-6">
        <button
          onClick={onOpenIndex}
          className="flex items-center space-x-2 text-[10px] uppercase tracking-widest-editorial transition-opacity hover:opacity-100"
          style={{
            color: currentProperty.textTone,
            opacity: 0.75,
          }}
          aria-label="Open Archive Index"
        >
          <Search className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline">INDEX</span>
        </button>

        {session ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={session.role === 'CUSTOMER' ? onOpenPatronPortal : onOpenAgentPortal}
              className="px-2.5 py-1 border text-[9px] uppercase tracking-widest font-mono flex items-center space-x-1.5 transition-all hover:bg-black/10"
              style={{
                borderColor: currentProperty.borderTone,
                color: currentProperty.textTone,
              }}
              title="Open active dashboard"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">{session.role === 'CUSTOMER' ? 'PATRON' : 'ATELIER'}</span>
            </button>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: currentProperty.textTone }}
                title="Sign Out of Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenSignIn}
            className="text-[10px] uppercase tracking-widest-editorial transition-opacity hover:opacity-100 px-2.5 py-1 border"
            style={{
              borderColor: currentProperty.borderTone,
              color: currentProperty.textTone,
              opacity: 0.85,
            }}
          >
            SIGN IN
          </button>
        )}
      </div>
    </header>
  );
};
