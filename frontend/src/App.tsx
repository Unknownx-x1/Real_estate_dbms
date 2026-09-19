import React, { useState, useEffect } from 'react';
import { Navbar } from './components/HorizonNavbar';
import { Hero } from './components/HorizonHero';
import { HorizonSections } from './components/HorizonSections';
import { HorizonInquireModal } from './components/HorizonInquireModal';
import { SignInModal } from './components/SignInModal';
import { PatronDashboard } from './components/dashboards/PatronDashboard';
import { AgentDashboard } from './components/dashboards/AgentDashboard';
import { SqlQueryWindow } from './components/SqlQueryWindow';
import type { UserSession } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'patron' | 'agent' | 'sql'>('landing');
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('horizon_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('The Horizon Villa • Malibu ($18,500,000)');
  const [selectedListingId, setSelectedListingId] = useState<number>(1);

  // Sync session to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem('horizon_user_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('horizon_user_session');
    }
  }, [session]);

  const openPatronPortal = () => {
    if (!session || session.role !== 'CUSTOMER') {
      const defaultPatron: UserSession = {
        personId: 1,
        name: 'Alice Smith (Patron)',
        email: 'alice.smith@example.com',
        role: 'CUSTOMER',
        customerId: 1,
        token: 'patron-active-session',
      };
      setSession(defaultPatron);
    }
    setCurrentView('patron');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openAgentPortal = () => {
    if (!session || session.role !== 'AGENT') {
      const defaultAgent: UserSession = {
        personId: 5,
        name: 'Ethan Miller (Atelier)',
        email: 'ethan.realtor@example.com',
        role: 'AGENT',
        agentId: 1,
        token: 'agent-active-session',
      };
      setSession(defaultAgent);
    }
    setCurrentView('agent');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openSqlConsole = () => {
    setCurrentView('sql');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setIsSignInOpen(false);
    if (newSession.role === 'CUSTOMER') {
      setCurrentView('patron');
    } else {
      setCurrentView('agent');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSignOut = () => {
    setSession(null);
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="bg-black min-h-screen text-white selection:bg-white selection:text-black">
      {/* Fixed Navigation with session, authentication, and portal triggers */}
      <Navbar
        session={session}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onSignOut={handleSignOut}
        onOpenInquire={() => {
          setSelectedProperty('The Horizon Villa • Malibu ($18,500,000)');
          setSelectedListingId(1);
          setIsInquireOpen(true);
        }}
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
          setSelectedListingId(1);
          setIsInquireOpen(true);
        }}
      />

      {/* Real Estate Property Listings, Story, Lifestyle, Views, and Inquire Sections */}
      <HorizonSections
        onSelectPropertyToInquire={(propertyTitle, listingId) => {
          setSelectedProperty(propertyTitle);
          if (listingId) setSelectedListingId(listingId);
          setIsInquireOpen(true);
        }}
        onOpenPortal={(view) => {
          if (view === 'patron') openPatronPortal();
          else if (view === 'agent') openAgentPortal();
          else if (view === 'sql') openSqlConsole();
        }}
      />

      {/* Confidential Acquisition Tender / Offer Submission Modal (Connected to backend OFFER table) */}
      <HorizonInquireModal
        isOpen={isInquireOpen}
        onClose={() => setIsInquireOpen(false)}
        selectedListingId={selectedListingId}
        selectedProperty={selectedProperty}
        session={session}
        onRequireSignIn={() => setIsSignInOpen(true)}
        onOpenPortal={(view) => {
          setIsInquireOpen(false);
          if (view === 'patron') openPatronPortal();
          else if (view === 'agent') openAgentPortal();
          else if (view === 'sql') openSqlConsole();
        }}
      />

      {/* Sign In / Session Authentication Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
