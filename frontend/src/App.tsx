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

export const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

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

  // Wheel / Trackpad Scroll Navigation (Cinematic Throttle)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Prevent default page scroll behavior if any
      e.preventDefault();

      const now = Date.now();
      // 750ms cooldown to match the 650ms animation curve and prevent runaway skips
      if (now - lastScrollTimeRef.current < 750) return;

      const deltaY = e.deltaY;
      const deltaX = e.deltaX;

      // Check vertical or horizontal scroll intent
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (Math.abs(deltaY) > 20) {
          lastScrollTimeRef.current = now;
          if (deltaY > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      } else {
        if (Math.abs(deltaX) > 20) {
          lastScrollTimeRef.current = now;
          if (deltaX > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleNext, handlePrev]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Subtle Mouse Parallax Handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    setMouseOffset({ x, y });
  }, []);

  // Touch Swipe Handlers for mobile (Vertical & Horizontal gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    const now = Date.now();
    if (now - lastScrollTimeRef.current < 650) return;

    // Detect primary swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 35) {
        lastScrollTimeRef.current = now;
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    } else {
      if (Math.abs(deltaY) > 35) {
        lastScrollTimeRef.current = now;
        if (deltaY < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <main
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-screen h-screen overflow-hidden select-none transition-colors duration-650 ease-cinematic"
      style={{ backgroundColor: activeProperty.bgTone }}
    >
      {/* 1. Subtle Film-Grain Noise Texture */}
      <NoiseOverlay />

      {/* 2. Minimal Editorial Top Navigation */}
      <HeaderNav currentProperty={activeProperty} />

      {/* 3. Enormous Structural Background Typography */}
      <GiantBackgroundTypography 
        currentProperty={activeProperty} 
        mouseOffset={mouseOffset} 
      />

      {/* 4. Central 3D Architectural Stage & Carousel */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <ArchitecturalStage
          properties={PROPERTIES}
          currentIndex={currentIndex}
          onSelectProperty={handleSelectProperty}
          mouseOffset={mouseOffset}
        />
      </div>

      {/* 5. Bottom Architectural Elements Layout */}
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

        {/* Bottom Center: Minimal Scroll Indicator */}
        <div className="hidden lg:block pointer-events-auto cursor-pointer" onClick={handleNext}>
          <ScrollIndicator currentProperty={activeProperty} />
        </div>

        {/* Bottom Right: Enormous Editorial CTA */}
        <div className="self-end md:self-end pointer-events-auto">
          <EditorialCTA currentProperty={activeProperty} />
        </div>
      </div>
    </main>
  );
};

export default App;
