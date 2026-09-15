import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PROPERTIES } from './data/properties';
import { NoiseOverlay } from './components/NoiseOverlay';
import { HeaderNav } from './components/HeaderNav';
import { GiantBackgroundTypography } from './components/GiantBackgroundTypography';
import { ArchitecturalStage } from './components/ArchitecturalStage';
import { PropertyMetadata } from './components/PropertyMetadata';
import { CarouselControls } from './components/CarouselControls';
import { EditorialCTA } from './components/EditorialCTA';
import { ScrollIndicator } from './components/ScrollIndicator';
import { ExploreSection } from './components/ExploreSection';
import { CurationSection } from './components/CurationSection';
import { AboutSection } from './components/AboutSection';
import { EditorialFooter } from './components/EditorialFooter';
import { IndexModal } from './components/IndexModal';
import { SignInModal } from './components/SignInModal';
import { PatronDashboard } from './components/dashboards/PatronDashboard';
import { AgentDashboard } from './components/dashboards/AgentDashboard';
import type { UserSession } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'patron' | 'agent'>('landing');
  const [session, setSession] = useState<UserSession | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const lastHorizontalScrollTimeRef = useRef<number>(0);
  const pointerStartXRef = useRef<number | null>(null);
  const accumulatedDeltaXRef = useRef<number>(0);

  const activeProperty = PROPERTIES[currentIndex];
  const total = PROPERTIES.length;

  // Carousel navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleSelectProperty = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Trackpad horizontal two-finger scroll listener on hero
  useEffect(() => {
    if (currentView !== 'landing') return;
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 10 && Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
        accumulatedDeltaXRef.current += e.deltaX;

        const now = Date.now();
        if (Math.abs(accumulatedDeltaXRef.current) > 30 && now - lastHorizontalScrollTimeRef.current > 550) {
          if (accumulatedDeltaXRef.current > 0) {
            handleNext();
          } else {
            handlePrev();
          }
          lastHorizontalScrollTimeRef.current = now;
          accumulatedDeltaXRef.current = 0;
        }
      }
    };

    heroEl.addEventListener('wheel', handleWheel, { passive: true });
    return () => heroEl.removeEventListener('wheel', handleWheel);
  }, [handleNext, handlePrev, currentView]);

  // Keyboard navigation (Arrow keys on landing page)
  useEffect(() => {
    if (currentView !== 'landing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, currentView]);

  // Mouse Parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    setMouseOffset({ x, y });
  }, []);

  // Pointer / Touch drag handlers for instant left/right swipe or drag
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerStartXRef.current === null) return;
    const deltaX = e.clientX - pointerStartXRef.current;

    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    pointerStartXRef.current = null;
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Role Navigation Handlers
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

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
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
      />
    );
  }

  // --- RENDER IMMERSIVE LANDING PAGE ---
  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen overflow-x-hidden select-none transition-colors duration-650 ease-cinematic scroll-smooth"
      style={{ backgroundColor: activeProperty.bgTone }}
    >
      {/* 1. Subtle Film-Grain Noise Texture */}
      <NoiseOverlay />

      {/* 2. Minimal Editorial Navigation */}
      <HeaderNav 
        currentProperty={activeProperty} 
        onOpenIndex={() => setIsIndexOpen(true)}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onOpenPatronPortal={openPatronPortal}
        onOpenAgentPortal={openAgentPortal}
        session={session}
        onSignOut={handleSignOut}
      />

      {/* 3. Master Archive Index Modal */}
      <IndexModal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        properties={PROPERTIES}
        currentProperty={activeProperty}
        onSelectProperty={handleSelectProperty}
      />

      {/* 4. Private Patron & Atelier Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        currentProperty={activeProperty}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* ========================================================================= */}
      {/* SECTION 1: FULL-VIEWPORT 3D IMMERSIVE HERO (#hero) */}
      {/* Supports Trackpad 2-finger horizontal scroll and mouse/pointer drag */}
      {/* ========================================================================= */}
      <section
        id="hero"
        ref={heroRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between cursor-grab active:cursor-grabbing"
      >
        {/* Enormous Structural Background Typography */}
        <GiantBackgroundTypography 
          currentProperty={activeProperty} 
          mouseOffset={mouseOffset} 
        />

        {/* Central 3D Architectural Stage & Carousel */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ArchitecturalStage
            properties={PROPERTIES}
            currentIndex={currentIndex}
            onSelectProperty={handleSelectProperty}
            mouseOffset={mouseOffset}
          />
        </div>

        {/* Bottom Hero Elements */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-6 md:px-12 md:pb-10 flex flex-col md:flex-row items-end justify-between pointer-events-none gap-6">
          {/* Bottom Left: Architectural Catalogue Metadata + Carousel Controls */}
          <div className="flex flex-col items-start space-y-6 pointer-events-auto">
            <PropertyMetadata property={activeProperty} />
            
            <CarouselControls
              currentIndex={currentIndex}
              total={total}
              onPrev={handlePrev}
              onNext={handleNext}
              currentProperty={activeProperty}
            />
          </div>

          {/* Bottom Center: Minimal Scroll Cue */}
          <div 
            onClick={scrollToExplore}
            className="hidden lg:block pointer-events-auto cursor-pointer hover:opacity-100 transition-opacity"
            title="Scroll to Explore"
          >
            <ScrollIndicator currentProperty={activeProperty} />
          </div>

          {/* Bottom Right: Enormous Editorial CTA */}
          <div 
            onClick={scrollToExplore}
            className="self-end md:self-end pointer-events-auto cursor-pointer"
          >
            <EditorialCTA currentProperty={activeProperty} />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: SPATIAL DISCOVERY & ARCHITECTURAL ARCHIVE (#explore) */}
      {/* ========================================================================= */}
      <ExploreSection
        properties={PROPERTIES}
        currentProperty={activeProperty}
        onSelectProperty={handleSelectProperty}
      />

      {/* ========================================================================= */}
      {/* SECTION 3: CURATION & METHODOLOGY (#curation) */}
      {/* ========================================================================= */}
      <CurationSection currentProperty={activeProperty} />

      {/* ========================================================================= */}
      {/* SECTION 4: MANIFESTO & ABOUT (#about) */}
      {/* ========================================================================= */}
      <AboutSection currentProperty={activeProperty} />

      {/* ========================================================================= */}
      {/* SECTION 5: EDITORIAL FOOTER */}
      {/* ========================================================================= */}
      <EditorialFooter currentProperty={activeProperty} />
    </div>
  );
};

export default App;
