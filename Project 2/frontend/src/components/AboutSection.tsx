import React from 'react';
import type { PropertyItem } from '../types/property';
import { ArrowUpRight, Box } from 'lucide-react';
import { ThreeDTiltCard } from './ThreeDTiltCard';

interface AboutSectionProps {
  currentProperty: PropertyItem;
}

/**
 * Section: About & Spatial Manifesto (#about)
 * Architectural values, global metrics, and 3D perspective stats.
 */
export const AboutSection: React.FC<AboutSectionProps> = ({ currentProperty }) => {
  const metrics = [
    { label: 'CURATED EDITIONS', value: '05', detail: 'INDIVISIBLE WORKS' },
    { label: 'GLOBAL ARCHIVES', value: '14', detail: 'ACROSS 8 BIOMES' },
    { label: 'TOTAL ASSET EVALUATION', value: '€ 185M', detail: 'VERIFIED APPRAISAL' },
    { label: 'SPECULATIVE VOLUME', value: '0.0%', detail: 'PURE CUSTODIANSHIP' },
  ];

  return (
    <section 
      id="about" 
      className="relative z-20 py-24 md:py-36 px-6 md:px-16 transition-colors duration-650 ease-cinematic border-t border-hairline"
      style={{ 
        backgroundColor: currentProperty.bgTone,
        borderColor: currentProperty.borderTone 
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Editorial Split Manifesto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-20 md:mb-28">
          <div className="lg:col-span-7">
            <span 
              className="text-[10px] font-mono uppercase tracking-super-wide opacity-60 block mb-4"
              style={{ color: currentProperty.subtleTone }}
            >
              MANIFESTO // MONOLITH 2024
            </span>
            <h2 
              className="text-3xl sm:text-5xl md:text-6xl font-editorial font-bold uppercase tracking-tight leading-[1.05]"
              style={{ color: currentProperty.textTone }}
            >
              ARCHITECTURE IS NOT MERE REAL ESTATE. IT IS SPATIAL SCULPTURE, GEOLOGICAL CONVERSATION, AND ENDURING LEGACY.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col space-y-6">
            <p 
              className="text-xs sm:text-sm font-sans leading-relaxed tracking-wide opacity-80"
              style={{ color: currentProperty.subtleTone }}
            >
              Founded in Zurich and Lisbon, Monolith operates at the rare intersection of architectural critique, fine art provenance, and private property transactions.
            </p>
            <p 
              className="text-xs sm:text-sm font-sans leading-relaxed tracking-wide opacity-80"
              style={{ color: currentProperty.subtleTone }}
            >
              We treat residential buildings as unrepeatable masterpieces. Every client receives comprehensive volumetric scans, engineering archives, and bespoke architectural counsel.
            </p>

            <div className="pt-4">
              <a 
                href="#explore"
                className="inline-flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest border-b pb-1 transition-opacity hover:opacity-100"
                style={{ color: currentProperty.textTone, borderColor: currentProperty.textTone }}
              >
                <span>REQUEST MONOLITH ANNUAL MONOGRAPH</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 3D Perspective Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-hairline"
          style={{ borderColor: currentProperty.borderTone }}
        >
          {metrics.map((m) => (
            <ThreeDTiltCard
              key={m.label}
              maxTilt={10}
              className="p-6 border-hairline flex flex-col justify-between"
            >
              <div style={{ transform: 'translateZ(25px)' }}>
                <div className="flex items-center justify-between mb-4">
                  <Box className="w-3.5 h-3.5 opacity-40" style={{ color: currentProperty.textTone }} />
                  <span className="text-[8px] font-mono opacity-50 tracking-widest uppercase" style={{ color: currentProperty.subtleTone }}>
                    {m.detail}
                  </span>
                </div>
                <span 
                  className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none block"
                  style={{ color: currentProperty.textTone }}
                >
                  {m.value}
                </span>
                <span 
                  className="text-[9px] font-mono tracking-super-wide uppercase opacity-60 mt-3 block"
                  style={{ color: currentProperty.subtleTone }}
                >
                  {m.label}
                </span>
              </div>
            </ThreeDTiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};
