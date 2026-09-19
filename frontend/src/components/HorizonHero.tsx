import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './HorizonLogo';
import { ArrowRight, ChevronDown } from 'lucide-react';

const VIDEO_1 = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260625_174131_395bc785-bb21-4e65-abf6-27c56f0764b6.mp4';
const VIDEO_2 = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260624_055914_ee2b3b56-9a58-4885-989e-5b72a68b630d.mp4';

interface HeroProps {
  onOpenInquire?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenInquire }) => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const wasScrolled = useRef(false);

  // Animate in center elements on mount after 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Dual video scroll choreography
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
      const v = video2Ref.current;
      if (!v) return;
      if (isScrolled && !wasScrolled.current) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else if (!isScrolled && wasScrolled.current) {
        v.pause();
      }
      wasScrolled.current = isScrolled;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToEstates = () => {
    const el = document.getElementById('estates');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-[200dvh]">
      <section className="sticky top-0 w-full h-[100dvh] overflow-hidden">
        {/* Video 2 (BEHIND, rendered first in DOM) */}
        <video
          ref={video2Ref}
          muted
          playsInline
          preload="auto"
          src={VIDEO_2}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Video 1 (ON TOP, rendered second in DOM so it stacks above) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <source src={VIDEO_1} type="video/mp4" />
        </video>

        {/* Center Logo with Concentric Circles */}
        <div className="absolute inset-0 flex items-center justify-center pb-[25vh] sm:pb-[30vh]">
          <div className="relative flex items-center justify-center w-[45vw] h-[45vw] max-w-[320px] max-h-[320px] md:w-[30vw] md:h-[30vw] md:max-w-[400px] md:max-h-[400px]">
            {/* 1. Outer circle ring */}
            <div
              className={`absolute inset-0 rounded-full border border-white/35 transition-all duration-[1200ms] ease-out ${
                visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{ transitionDelay: '0ms' }}
            />

            {/* 2. Inner circle ring */}
            <div
              className={`absolute inset-[12%] rounded-full border border-white/25 transition-all duration-[1200ms] ease-out ${
                visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{ transitionDelay: '150ms' }}
            />

            {/* 3. Logo SVG */}
            <div
              className={`transition-all duration-[1000ms] ease-out ${
                visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transitionDelay: '350ms' }}
            >
              <Logo className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 text-white" />
            </div>
          </div>
        </div>

        {/* Bottom Property Listing Presentation Block */}
        <div className="absolute bottom-0 left-0 right-0 pb-10 sm:pb-12 md:pb-16 px-5 sm:px-6 md:px-12 text-center z-20">
          {/* Top Pill / Listing Identifier */}
          <div
            className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 mb-3 sm:mb-4 transition-all duration-[1000ms] ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '450ms' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.22em] text-white/90">
              FEATURED ESTATE // MALIBU BLUFFS • FREEHOLD DEED
            </span>
          </div>

          {/* Cinematic Estate Title */}
          <h1
            className={`font-heading text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal tracking-[0.18em] uppercase leading-[1.1] transition-all duration-[1000ms] ease-out drop-shadow-lg ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            The Horizon Villa
          </h1>

          {/* Clean Price Line (Cormorant Garamond / Sans) */}
          <div
            className={`mt-2 text-white/90 text-sm sm:text-base md:text-lg font-mono tracking-[0.25em] uppercase font-light transition-all duration-[1000ms] ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            $18,500,000 USD
          </div>

          {/* Uncluttered Clean Specs Line */}
          <div
            className={`mt-3.5 sm:mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-5 text-[11px] sm:text-xs md:text-sm font-geist font-light text-white/90 uppercase tracking-[0.2em] transition-all duration-[1000ms] ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <span><strong className="font-medium text-white">6</strong> Beds</span>
            <span className="opacity-30">|</span>
            <span><strong className="font-medium text-white">8</strong> Baths</span>
            <span className="opacity-30">|</span>
            <span><strong className="font-medium text-white">9,400</strong> Sq.Ft</span>
            <span className="opacity-30">|</span>
            <span>Private Beach</span>
            <span className="opacity-30">|</span>
            <span>Infinity Pool</span>
          </div>

          {/* Architectural Description */}
          <p
            className={`mt-3 sm:mt-4 text-white/75 font-geist font-light text-xs sm:text-sm md:text-base max-w-xs sm:max-w-xl mx-auto leading-relaxed tracking-wide transition-all duration-[1000ms] ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            An iconic contemporary coastal compound sculptured into the coastline, featuring 270° panoramic Pacific ocean views, cantilevered glass pavilions, and verified sovereign freehold title.
          </p>

          {/* Action CTAs */}
          <div
            className={`mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3 transition-all duration-[1000ms] ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '1000ms' }}
          >
            <button
              onClick={onOpenInquire}
              className="group flex items-center gap-2 bg-white text-gray-900 rounded-full pl-5 pr-2 py-2 hover:bg-gray-100 transition-all shadow-xl cursor-pointer text-xs md:text-sm font-geist font-medium tracking-wider uppercase"
            >
              <span>Schedule Private Tour</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-200/70 group-hover:bg-rose-300 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-gray-800" />
              </span>
            </button>

            <button
              onClick={scrollToEstates}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-white/30 text-white/90 hover:text-white hover:border-white text-xs md:text-sm font-geist font-medium tracking-wider uppercase transition-colors cursor-pointer backdrop-blur-sm"
            >
              <span>Explore Portfolio</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
