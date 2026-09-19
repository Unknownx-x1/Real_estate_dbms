import React, { useState } from 'react';
import { Navbar } from './components/HorizonNavbar';
import { Hero } from './components/HorizonHero';
import { PatronDashboard } from './components/dashboards/PatronDashboard';
import { AgentDashboard } from './components/dashboards/AgentDashboard';
import { SqlQueryWindow } from './components/SqlQueryWindow';
import type { UserSession } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'patron' | 'agent' | 'sql'>('landing');
  const [session, setSession] = useState<UserSession | null>(null);

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
    <div className="bg-black">
      <Navbar
        onOpenPortal={(view) => {
          if (view === 'patron') openPatronPortal();
          else if (view === 'agent') openAgentPortal();
          else if (view === 'sql') openSqlConsole();
        }}
      />
      <Hero />
    </div>
  );
};

export default App;
