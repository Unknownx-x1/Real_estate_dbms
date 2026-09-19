import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ArrowUpRight, 
  Terminal, 
  User, 
  Briefcase, 
  ShieldCheck
} from 'lucide-react';
import { NoiseOverlay } from './components/NoiseOverlay';
import { PatronDashboard } from './components/dashboards/PatronDashboard';
import { AgentDashboard } from './components/dashboards/AgentDashboard';
import { SqlQueryWindow } from './components/SqlQueryWindow';
import type { UserSession } from './services/api';

// ============================================================================
// CONSTANTS (EXACT SPECIFICATIONS)
// ============================================================================
const GRASS_GREEN = '#213138'; // deep teal / preloader background & default logo color
const FULL_TEXT = 'Velar.';
const HOUSE_IMG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780471903/building_bzziky.png';
const BG_IMG = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260603_073200_7082add5-f1f8-4873-8696-d6f78a44089b.png&w=1920&q=85';

const GALLERY_VIDEOS = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154759_4cdc8175-8261-497c-b688-9477c76545d4.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154751_39b1b9bb-2708-4211-b6a2-d39f93309e52.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154737_eba7900c-0313-483c-a30a-632c747ccc42.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_144009_4348fe33-f885-4345-8e92-3fe1c2625d32.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_145337_e44eaa8c-6bb1-4a6e-a70f-ed0231cbaccb.mp4',
];

// ============================================================================
// COUNTUP COMPONENT (Easing: 1 - (1 - t)^3 over 2000ms)
// ============================================================================
interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
}

const CountUp: React.FC<CountUpProps> = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          const startTime = performance.now();
          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function: 1 - (1 - t)^3
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={elRef}>
      {count}{suffix}
    </span>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export const App: React.FC = () => {
  // Navigation views: 'landing' (Velar.) | 'patron' | 'agent' | 'sql'
  const [currentView, setCurrentView] = useState<'landing' | 'patron' | 'agent' | 'sql'>('landing');
  const [session, setSession] = useState<UserSession | null>(null);

  // Section 1: Preloader typewriter state & timings
  const [typedChars, setTypedChars] = useState<number>(0);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [overlayLifting, setOverlayLifting] = useState<boolean>(false);
  const [heroTextVisible, setHeroTextVisible] = useState<boolean>(false);
  const [liftDone, setLiftDone] = useState<boolean>(false);

  // Section 2: Nav color & Menu toggle
  const [navOnDark, setNavOnDark] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Section 6: Hover gallery expand
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);

  // DOM Refs for scroll calculations
  const heroRef = useRef<HTMLElement>(null);
  const darkSectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const houseWrapperRef = useRef<HTMLDivElement>(null);
  const houseImgRef = useRef<HTMLImageElement>(null);

  // ==========================================================================
  // SECTION 1 TIMINGS (Exact setTimeout specifications)
  // CHAR_INTERVAL = 140ms, TYPE_START = 600ms
  // LIFT_AT = TYPE_START + 6 * CHAR_INTERVAL + 700ms
  // ==========================================================================
  useEffect(() => {
    const CHAR_INTERVAL = 140;
    const TYPE_START = 600;
    const fullTextLen = FULL_TEXT.length; // 6 ('Velar.')
    const LIFT_AT = TYPE_START + fullTextLen * CHAR_INTERVAL + 700; // 2140ms

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Reveal letters one at a time at TYPE_START + i * CHAR_INTERVAL
    for (let i = 1; i <= fullTextLen; i++) {
      timeouts.push(
        setTimeout(() => {
          setTypedChars(i);
        }, TYPE_START + (i - 1) * CHAR_INTERVAL)
      );
    }

    // Hide cursor at LIFT_AT - 150ms
    timeouts.push(
      setTimeout(() => {
        setShowCursor(false);
      }, LIFT_AT - 150)
    );

    // Start "lifting" overlay at LIFT_AT (translateY -100%)
    timeouts.push(
      setTimeout(() => {
        setOverlayLifting(true);
      }, LIFT_AT)
    );

    // At LIFT_AT + 1300ms, fade in hero text
    timeouts.push(
      setTimeout(() => {
        setHeroTextVisible(true);
      }, LIFT_AT + 1300)
    );

    // At LIFT_AT + 2100ms, set liftDone true and disable overlay transition
    timeouts.push(
      setTimeout(() => {
        setLiftDone(true);
      }, LIFT_AT + 2100)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // ==========================================================================
  // SECTION 2 & 4: SCROLL LISTENER (NAV COLOR & SCROLL-DRIVEN HOUSE ANIMATION)
  // ==========================================================================
  const updatePositions = useCallback(() => {
    // 1. Dark section detection for nav
    const darkSections = [darkSectionRef.current, galleryRef.current];
    let isDark = false;
    for (const sec of darkSections) {
      if (sec) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) {
          isDark = true;
          break;
        }
      }
    }
    setNavOnDark(isDark);

    // 2. House animation (active only after liftDone)
    if (!liftDone) return;
    if (!heroRef.current || !darkSectionRef.current || !houseWrapperRef.current || !houseImgRef.current) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const baseW = Math.max(vw, 1400);

    const heroRect = heroRef.current.getBoundingClientRect();
    const darkRect = darkSectionRef.current.getBoundingClientRect();

    const heroH = heroRect.height;
    const triggerPoint = -(heroH * 0.30);
    const endPoint = heroRect.top - (darkRect.bottom - vh);

    const rawProgress = (heroRect.top - triggerPoint) / (endPoint - triggerPoint);
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    const wrapper = houseWrapperRef.current;

    if (progress <= 0) {
      // Reset to resting (bottom-centered, scale 1)
      wrapper.style.top = '';
      wrapper.style.bottom = '0px';
      wrapper.style.left = '50%';
      wrapper.style.transform = 'translateX(-50%)';
      wrapper.style.transformOrigin = '';
      wrapper.style.width = '100%';
      wrapper.style.minWidth = '1400px';
      return;
    }

    // Double smoothstep easing: smoothstep(smoothstep(progress))
    const smoothstep = (x: number) => x * x * (3 - 2 * x);
    const t = smoothstep(smoothstep(progress));

    const imgNaturalW = houseImgRef.current.naturalWidth || 1400;
    const imgNaturalH = houseImgRef.current.naturalHeight || 900;
    const aspect = imgNaturalW / imgNaturalH;
    const imgH = baseW / aspect;

    const startX = (vw - baseW) / 2;
    const startY = vh - imgH;

    const finalScale = 1.45;
    const finalX = (vw - baseW * finalScale) / 2;
    const mobileOffset = vw < 1024 ? -250 : 4;
    const finalY = darkRect.bottom - imgH * finalScale + 500 + mobileOffset;

    const currentX = startX + (finalX - startX) * t;
    const currentY = startY + (finalY - startY) * t;
    const currentScale = 1 + (finalScale - 1) * t;

    wrapper.style.bottom = 'auto';
    wrapper.style.top = '0px';
    wrapper.style.left = '0px';
    wrapper.style.width = `${baseW}px`;
    wrapper.style.minWidth = '1400px';
    wrapper.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
    wrapper.style.transformOrigin = 'top left';
  }, [liftDone]);

  useEffect(() => {
    window.addEventListener('scroll', updatePositions, { passive: true });
    window.addEventListener('resize', updatePositions);
    updatePositions();
    return () => {
      window.removeEventListener('scroll', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, [updatePositions]);

  // Lock scroll when mobile menu is open
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

  // Portal switchers
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
    setIsMenuOpen(false);
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
    setIsMenuOpen(false);
    setCurrentView('agent');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openSqlConsole = () => {
    setIsMenuOpen(false);
    setCurrentView('sql');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navColor = navOnDark ? '#ffffff' : GRASS_GREEN;

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

  // --- RENDER VELAR. LANDING PAGE ---
  return (
    <div className="relative w-full min-h-screen bg-[#f5f0ea] text-[#213138] overflow-x-clip selection:bg-[#213138] selection:text-[#f5f0ea]">
      {/* 0. Inline CSS Specs (Fonts, Keyframes, & Responsive Typography) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@400;700;800;900&display=swap');

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: blink 0.7s step-end infinite;
        }

        @keyframes tickerDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerDrift 45s linear infinite;
          will-change: transform;
        }

        /* Hero Responsive Type Sizes */
        @media (max-width: 639px) {
          .hero-subtitle-desktop { display: none !important; }
          .hero-subtitle-mobile { display: block !important; }
          .hero-text-block { padding-top: 90px !important; }
          .hero-heading-top { justify-content: flex-start !important; }
          .hero-own-the { font-size: 7.5vw !important; }
          .hero-extraordinary { font-size: 14.5vw !important; white-space: normal !important; word-break: break-word !important; line-height: 0.9 !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .hero-subtitle-desktop { display: none !important; }
          .hero-subtitle-mobile { display: block !important; }
          .hero-text-block { padding-top: 110px !important; }
          .hero-heading-top { justify-content: flex-start !important; }
          .hero-own-the { font-size: 5.5vw !important; }
          .hero-extraordinary { font-size: 11vw !important; white-space: normal !important; word-break: break-word !important; line-height: 0.9 !important; }
        }
        @media (min-width: 1024px) {
          .hero-subtitle-desktop { display: block !important; }
          .hero-subtitle-mobile { display: none !important; }
          .hero-text-block { padding-top: calc(28vh - 50px) !important; }
          .hero-own-the { font-size: 3vw !important; }
          .hero-extraordinary { font-size: clamp(52px, 6.5vw, 9vw) !important; white-space: nowrap !important; line-height: 0.88 !important; }
        }

        /* Section 5 Responsive Rules */
        @media (max-width: 767px) {
          .s2-statement-wrap, .s2-stats-row { padding-left: 0 !important; }
          .s2-statement { white-space: normal !important; font-size: 22px !important; }
          .s2-stats-row { flex-direction: column !important; gap: 28px !important; }
          .s2-stats-row > div { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.2) !important; padding-top: 18px !important; }
          .s2-stats-row > div:first-child { border-top: none !important; padding-top: 0 !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .s2-statement-wrap, .s2-stats-row { padding-left: 15% !important; }
          .s2-statement { white-space: normal !important; }
          .s2-section { min-height: 70vh !important; }
        }

        /* Section 6 Gallery Responsive Rules */
        @media (max-width: 1023px) {
          .s3-gallery-section { height: auto !important; min-height: 100vh !important; overflow: visible !important; }
          .s3-ticker-wrap { position: sticky !important; top: 0 !important; height: 100vh !important; width: 100% !important; margin-bottom: -100vh !important; }
          .s3-gallery-content { height: auto !important; align-items: flex-start !important; padding: 80px 16px 60px !important; }
          .gallery-expand-row { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; height: auto !important; width: 100% !important; max-width: 700px !important; }
          .gallery-expand-item { flex: none !important; height: auto !important; aspect-ratio: 4/5 !important; border-radius: 10px !important; transition: transform 0.3s ease !important; }
          .gallery-expand-item:hover { flex: none !important; transform: scale(1.02) !important; }
          .gallery-expand-item:last-child:nth-child(odd) { grid-column: 1 / -1 !important; max-width: calc(50% - 4px) !important; justify-self: center !important; }
        }
        @media (max-width: 479px) {
          .s3-gallery-content { padding: 60px 12px 48px !important; }
          .gallery-expand-row { gap: 6px !important; }
        }
      `}</style>

      {/* Subtle Tactile Film-Grain Overlay */}
      <NoiseOverlay />

      {/* ===================================================================== */}
      {/* SECTION 1: PRELOADER / INTRO OVERLAY */}
      {/* ===================================================================== */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{
          zIndex: 100,
          backgroundColor: GRASS_GREEN,
          transform: overlayLifting ? 'translateY(-100%)' : 'translateY(0%)',
          transition: liftDone
            ? 'none'
            : 'transform 1.5s cubic-bezier(0.45, 0, 0.15, 1)',
        }}
        aria-hidden={liftDone}
      >
        <div className="flex items-center" style={{ fontFamily: 'Syne, sans-serif' }}>
          <span
            className="text-white text-[2.6rem] tracking-[-0.02em] select-none"
          >
            {FULL_TEXT.slice(0, typedChars).split('').map((char, idx) => (
              <span key={idx} className={char === '.' ? 'font-black' : 'font-bold'}>
                {char}
              </span>
            ))}
          </span>

          {showCursor && (
            <span
              className="inline-block bg-white rounded-full ml-1 animate-cursor-blink"
              style={{
                width: '3px',
                height: '1.1em',
              }}
            />
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: FIXED NAVIGATION */}
      {/* ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 lg:px-16 py-5 md:py-6 flex items-center justify-between pointer-events-auto">
        {/* Left: Brand Mark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xl tracking-tight transition-colors duration-350 cursor-pointer"
          style={{ fontFamily: 'Syne, sans-serif', color: navColor }}
        >
          <span className="font-bold">Velar</span>
          <span className="font-black">.</span>
        </button>

        {/* Center/Right: Quick Portals & Hamburger */}
        <div className="flex items-center space-x-4 md:space-x-8">
          {/* Quick links to existing DBMS portals */}
          <nav className="hidden md:flex items-center space-x-6 text-[10px] font-mono uppercase tracking-widest">
            <button
              onClick={openPatronPortal}
              className="flex items-center space-x-1.5 transition-opacity hover:opacity-100 opacity-75"
              style={{ color: navColor }}
              title="Open Patron / Customer Portal"
            >
              <User className="w-3 h-3 opacity-60" />
              <span>PATRON</span>
            </button>

            <button
              onClick={openAgentPortal}
              className="flex items-center space-x-1.5 transition-opacity hover:opacity-100 opacity-75"
              style={{ color: navColor }}
              title="Open Atelier Broker Desk"
            >
              <Briefcase className="w-3 h-3 opacity-60" />
              <span>ATELIER</span>
            </button>

            <button
              onClick={openSqlConsole}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded border transition-all hover:bg-black/10"
              style={{ 
                borderColor: navOnDark ? 'rgba(255,255,255,0.2)' : 'rgba(33,49,56,0.2)',
                color: navColor 
              }}
              title="Open Interactive SQL Query Console"
            >
              <Terminal className="w-3 h-3 text-emerald-500" />
              <span className="font-bold">SQL QUERY</span>
            </button>
          </nav>

          {/* Hamburger Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="group relative flex flex-col justify-center items-end w-8 h-8 space-y-2 cursor-pointer z-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={24} style={{ color: navColor, transition: 'color 0.35s ease' }} />
            ) : (
              <>
                <span 
                  className="block h-[1px] w-7 transition-all duration-300 group-hover:w-5" 
                  style={{ backgroundColor: navColor, transition: 'background-color 0.35s ease, width 0.3s ease' }} 
                />
                <span 
                  className="block h-[1px] w-7 transition-all duration-300" 
                  style={{ backgroundColor: navColor, transition: 'background-color 0.35s ease' }} 
                />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Fullscreen Mobile/Overlay Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#f5f0ea] flex flex-col justify-center items-center px-6 animate-in fade-in duration-300"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          <nav className="flex flex-col items-center space-y-7 text-center">
            {['Residences', 'Story', 'Listings', 'Inquire'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl md:text-5xl font-light tracking-widest uppercase text-black hover:text-gray-500 transition-colors"
              >
                {link}
              </a>
            ))}

            <div className="w-16 h-[1px] bg-black/20 my-4" />

            <div className="flex flex-col sm:flex-row items-center gap-4 font-mono text-xs tracking-widest">
              <button
                onClick={openPatronPortal}
                className="px-4 py-2 border border-black/30 hover:border-black uppercase flex items-center space-x-2"
              >
                <User className="w-3.5 h-3.5" />
                <span>Patron Portal</span>
              </button>

              <button
                onClick={openAgentPortal}
                className="px-4 py-2 border border-black/30 hover:border-black uppercase flex items-center space-x-2"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Atelier Desk</span>
              </button>

              <button
                onClick={openSqlConsole}
                className="px-4 py-2 bg-[#213138] text-white uppercase flex items-center space-x-2"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL Console</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: SCROLL-DRIVEN HOUSE ANIMATION (FIXED CENTERPIECE) */}
      {/* ===================================================================== */}
      <div
        ref={houseWrapperRef}
        className="fixed z-22 pointer-events-none will-change-transform"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          minWidth: '1400px',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            transform: overlayLifting ? 'translateY(0)' : 'translateY(102vh)',
            transition: liftDone
              ? 'none'
              : 'transform 1.5s cubic-bezier(0.45, 0, 0.15, 1) 0.4s',
          }}
        >
          <img
            ref={houseImgRef}
            src={HOUSE_IMG}
            alt=""
            className="w-full block select-none pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 3: HERO */}
      {/* ===================================================================== */}
      <section
        ref={heroRef}
        id="residences"
        className="relative min-h-screen overflow-visible bg-cover bg-center bg-no-repeat flex flex-col justify-start"
        style={{ backgroundImage: `url("${BG_IMG}")` }}
      >
        <div
          className="hero-text-block relative z-10 w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] delay-100"
          style={{
            opacity: heroTextVisible ? 1 : 0,
            transform: heroTextVisible ? 'translateY(0)' : 'translateY(-28px)',
          }}
        >
          {/* Top Row: "LIVE IN" & Desktop Subtitle */}
          <div className="hero-heading-top px-6 md:px-10 lg:px-16 flex items-end justify-between mb-[-0.04em]">
            <h2
              className="hero-own-the font-extrabold uppercase text-black leading-none tracking-[-0.03em]"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
            >
              LIVE IN
            </h2>

            <p
              className="hero-subtitle-desktop text-right text-black/70 mb-[0.2em] leading-relaxed tracking-[0.02em] select-none"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(10px, 0.95vw, 14px)',
                maxWidth: '300px',
              }}
            >
              Stately homes built with vision,<br />
              scope, and architectural finesse.
            </p>
          </div>

          {/* Headline Row: "IRREPLACEABLE" */}
          <div className="overflow-hidden">
            <h1
              className="hero-extraordinary font-extrabold uppercase text-black tracking-[-0.03em] px-6 md:px-10 lg:px-16"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
            >
              IRREPLACEABLE
            </h1>
          </div>

          {/* Mobile/Tablet Subtitle */}
          <p
            className="hero-subtitle-mobile px-6 mt-[0.9em] text-black/65 leading-normal"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(12px, 3vw, 15px)',
            }}
          >
            Premium real estate with vision,<br />
            depth, and architectural clarity.
          </p>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 5: DARK STATEMENT + STATS (STICKY 200VH) */}
      {/* ===================================================================== */}
      <div className="relative z-20" style={{ height: '200vh' }}>
        {/* 4vh scroll spacer */}
        <div className="w-full" style={{ height: '4vh', backgroundColor: '#1a1a1a' }} />

        <section
          ref={darkSectionRef}
          id="story"
          className="s2-section sticky top-0 h-screen overflow-hidden flex flex-col justify-center"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <div
            className="s2-content flex flex-col px-6 md:px-10 lg:px-16"
            style={{
              paddingTop: 'clamp(30px, 4vw, 60px)',
              paddingBottom: 'clamp(60px, 8vw, 120px)',
            }}
          >
            {/* Statement Text */}
            <div
              className="s2-statement-wrap w-full mx-auto"
              style={{ maxWidth: '1200px', paddingLeft: '25%' }}
            >
              <p
                className="s2-statement text-[#e8e4df] leading-[1.35] tracking-[-0.02em] whitespace-nowrap"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 300,
                  fontSize: 'clamp(22px, 2.6vw, 42px)',
                }}
              >
                Every estate we present is hand-chosen<br />
                through a frame of permanence, refinement,<br />
                and timeless detail. Standards are not<br />
                a flourish. It is our discipline.
              </p>
            </div>

            {/* Stats Row */}
            <div
              className="s2-stats-row w-full mx-auto flex items-start"
              style={{
                maxWidth: '1200px',
                paddingLeft: '25%',
                marginTop: 'clamp(48px, 6vw, 80px)',
              }}
            >
              {/* Stat 1: 120+ */}
              <div className="flex-1">
                <div
                  className="text-white leading-[1.1]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: 'clamp(36px, 4.5vw, 72px)',
                  }}
                >
                  <CountUp end={120} suffix="+" />
                </div>
                <div
                  className="text-white/60 tracking-[0.01em]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.1vw, 16px)',
                    marginTop: 'clamp(4px, 0.5vw, 8px)',
                  }}
                >
                  Portfolio Holdings
                </div>
              </div>

              {/* Stat 2: 12 */}
              <div
                className="flex-1 border-l border-white/20"
                style={{ paddingLeft: 'clamp(20px, 2.5vw, 40px)' }}
              >
                <div
                  className="text-white leading-[1.1]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: 'clamp(36px, 4.5vw, 72px)',
                  }}
                >
                  <CountUp end={12} />
                </div>
                <div
                  className="text-white/60 tracking-[0.01em]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.1vw, 16px)',
                    marginTop: 'clamp(4px, 0.5vw, 8px)',
                  }}
                >
                  Global Locations
                </div>
              </div>

              {/* Stat 3: 98% */}
              <div
                className="flex-1 border-l border-white/20"
                style={{ paddingLeft: 'clamp(20px, 2.5vw, 40px)' }}
              >
                <div
                  className="text-white leading-[1.1]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: 'clamp(36px, 4.5vw, 72px)',
                  }}
                >
                  <CountUp end={98} suffix="%" />
                </div>
                <div
                  className="text-white/60 tracking-[0.01em]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.1vw, 16px)',
                    marginTop: 'clamp(4px, 0.5vw, 8px)',
                  }}
                >
                  Patron Loyalty Rate
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 6: HOVER-EXPAND GALLERY (SLIDES OVER SECTION 5) */}
      {/* ===================================================================== */}
      <section
        ref={galleryRef}
        id="listings"
        className="s3-gallery-section relative z-25 overflow-hidden"
        style={{
          marginTop: '-100vh',
          backgroundColor: '#1a1a1a',
          height: '100vh',
        }}
      >
        {/* Background Ticker */}
        <div className="s3-ticker-wrap absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
          <div className="ticker-track">
            <span
              className="text-white/10 uppercase tracking-[-0.02em] whitespace-nowrap select-none pr-8 font-extrabold"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(100px, 14vw, 220px)',
              }}
            >
              Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;
            </span>
            <span
              className="text-white/10 uppercase tracking-[-0.02em] whitespace-nowrap select-none pr-8 font-extrabold"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(100px, 14vw, 220px)',
              }}
            >
              Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;Velar.&nbsp;&nbsp;
            </span>
          </div>
        </div>

        {/* Gallery Content */}
        <div
          className="s3-gallery-content relative z-10 flex items-center justify-center h-full w-full"
          style={{ padding: 'clamp(24px, 4vw, 60px)' }}
        >
          <div className="gallery-expand-row flex gap-[6px] h-[70%] max-w-[1200px] w-full">
            {GALLERY_VIDEOS.map((src, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredVideo(index)}
                onMouseLeave={() => setHoveredVideo(null)}
                className="gallery-expand-item relative h-full overflow-hidden rounded-[12px] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  flex: hoveredVideo === null ? '1 1 0%' : hoveredVideo === index ? '4 1 0%' : '1 1 0%',
                }}
              >
                <video
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25 hover:bg-transparent transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/80 font-mono text-[10px] tracking-widest opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <span>RESIDENCE / 0{index + 1}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 7: EDITORIAL INQUIRE & SYSTEM PORTALS FOOTER */}
      {/* ===================================================================== */}
      <footer id="inquire" className="relative z-30 bg-[#f5f0ea] border-t border-black/10 py-20 px-6 md:px-10 lg:px-16 text-[#213138]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Brand & Manifesto */}
          <div className="max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              Velar.
            </h2>
            <p className="text-sm text-black/70 font-sans leading-relaxed">
              An architectural archive of sovereign estates, verified freehold deeds, and custodial brokerage operations. Built with uncompromising discipline and mathematical precision.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-[10px] font-mono opacity-60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>BOYCE-CODD NORMAL FORM (BCNF) • 13 RELATIONS ENGINE</span>
            </div>
          </div>

          {/* Quick Access to Real Estate DBMS Engines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full md:w-auto">
            {/* Patron Portal Card */}
            <button
              onClick={openPatronPortal}
              className="p-5 border border-black/15 bg-white/40 hover:bg-white text-left transition-all rounded group"
            >
              <div className="flex items-center justify-between mb-2">
                <User className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-bold text-xs uppercase tracking-wider font-mono">Patron Portal</div>
              <div className="text-[11px] text-black/60 mt-1">Acquisitions, verified deeds, & binding tenders</div>
            </button>

            {/* Atelier Broker Desk */}
            <button
              onClick={openAgentPortal}
              className="p-5 border border-black/15 bg-white/40 hover:bg-white text-left transition-all rounded group"
            >
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="font-bold text-xs uppercase tracking-wider font-mono">Atelier Desk</div>
              <div className="text-[11px] text-black/60 mt-1">Full consignment CRUD & atomic sale execution</div>
            </button>

            {/* SQL Terminal Card */}
            <button
              onClick={openSqlConsole}
              className="p-5 border border-black/15 bg-[#213138] text-white text-left transition-all rounded group shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <ArrowUpRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <div className="font-bold text-xs uppercase tracking-wider font-mono text-white">SQL Console</div>
              <div className="text-[11px] text-white/70 mt-1">Direct PostgreSQL query execution & schema audit</div>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-black/50 gap-4">
          <div>© {new Date().getFullYear()} VELAR. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center space-x-6">
            <span>SPATIAL ARCHIVE // 01</span>
            <span>POSTGRESQL 15+</span>
            <span>REACT 19 + VITE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
