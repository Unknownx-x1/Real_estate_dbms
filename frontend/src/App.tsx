import React, { useState } from 'react';
import { Navbar } from './components/HorizonNavbar';
import { Hero } from './components/HorizonHero';
import { HorizonSections } from './components/HorizonSections';
import { HorizonInquireModal } from './components/HorizonInquireModal';
import { PatronDashboard } from './components/dashboards/PatronDashboard';
import { AgentDashboard } from './components/dashboards/AgentDashboard';
import { SqlQueryWindow } from './components/SqlQueryWindow';
import type { UserSession } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'patron' | 'agent' | 'sql'>('landing');
  const [session, setSession] = useState<UserSession | null>(null);
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('The Horizon Villa • Malibu ($18,500,000)');

  const openPatronPortal = () => {
    if (!session || session.role !== 'CUSTOMER') {
      setSession({
        personId: 1,
        name: 'Alice Smith (Patron)',
        email: 'alice.smith@example.com',
        role: 'CUSTOMER',
        customerId: 1,
        token: 'patron-active-session',
      });
    }
    setCurrentView('patron');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openAgentPortal = () => {
    if (!session || session.role !== 'AGENT') {
      setSession({
        personId: 5,
        name: 'Ethan Miller (Atelier)',
        email: 'ethan.realtor@example.com',
        role: 'AGENT',
        agentId: 1,
        token: 'agent-active-session',
      });
    }
    setCurrentView('agent');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openSqlConsole = () => {
    setCurrentView('sql');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // --- RENDER SQL QUERY WINDOW ---
  if (currentView === 'sql') {
    return (
      <SqlQueryWindow
        onBack={() => {
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        onNavigatePatron={openPatronPortal}
        onNavigateAgent={openAgentPortal}
      />
    );
  }

  // --- RENDER PATRON DASHBOARD ---
  if (currentView === 'patron') {
    const activePatronSession: UserSession = session && session.role === 'CUSTOMER'
      ? session
      : {
          personId: 1,
          name: 'Alice Smith (Patron)',
          email: 'alice.smith@example.com',
          role: 'CUSTOMER',
          customerId: 1,
          token: 'patron-active-session',
        };

    return (
      <PatronDashboard
        session={activePatronSession}
        onNavigateHome={() => setCurrentView('landing')}
        onSwitchToAgent={openAgentPortal}
        onOpenSqlQuery={openSqlConsole}
      />
    );
  }

  // --- RENDER ATELIER / AGENT DASHBOARD ---
  if (currentView === 'agent') {
    const activeAgentSession: UserSession = session && session.role === 'AGENT'
      ? session
      : {
          personId: 5,
          name: 'Ethan Miller (Atelier)',
          email: 'ethan.realtor@example.com',
          role: 'AGENT',
          agentId: 1,
          token: 'agent-active-session',
        };

    return (
      <AgentDashboard
        session={activeAgentSession}
        onNavigateHome={() => setCurrentView('landing')}
        onSwitchToPatron={openPatronPortal}
        onOpenSqlQuery={openSqlConsole}
      />
    );
  }

  // --- RENDER HORIZON ESTATES LANDING PAGE ---
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Fixed Navigation */}
      <Navbar
        onOpenInquire={() => setIsInquireOpen(true)}
        onOpenPortal={(view) => {
          if (view === 'patron') openPatronPortal();
          else if (view === 'agent') openAgentPortal();
          else if (view === 'sql') openSqlConsole();
        }}
      />

      {/* Dual-Video Sticky Scroll Hero with Property Listing Presentation */}
      <Hero
        onOpenInquire={() => {
          setSelectedProperty('The Horizon Villa • Malibu ($18,500,000)');
          setIsInquireOpen(true);
        }}
      />

      {/* Real Estate Property Listings, Story, Lifestyle, Views, and Inquire Sections */}
      <HorizonSections
        onSelectPropertyToInquire={(propertyTitle) => {
          setSelectedProperty(propertyTitle);
          setIsInquireOpen(true);
        }}
        onOpenPortal={(view) => {
          if (view === 'patron') openPatronPortal();
          else if (view === 'agent') openAgentPortal();
          else if (view === 'sql') openSqlConsole();
        }}
      />

      {/* Interactive Inquire & Viewing Modal */}
      <HorizonInquireModal
        isOpen={isInquireOpen}
        onClose={() => setIsInquireOpen(false)}
        selectedProperty={selectedProperty}
        onOpenPortal={(view) => {
          setIsInquireOpen(false);
          if (view === 'patron') openPatronPortal();
          else if (view === 'agent') openAgentPortal();
          else if (view === 'sql') openSqlConsole();
        }}
      />
    </div>
  );
};

export default App;
