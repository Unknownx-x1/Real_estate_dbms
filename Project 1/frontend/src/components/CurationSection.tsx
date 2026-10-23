import React from 'react';
import type { PropertyItem } from '../types/property';
import { ShieldCheck, Box, Compass } from 'lucide-react';
import { ThreeDTiltCard } from './ThreeDTiltCard';
import { ThreeDVillaViewer } from './ThreeDVillaViewer';

interface CurationSectionProps {
  currentProperty: PropertyItem;
}

/**
 * Section: Curation & Methodology (#curation)
 * Enriched with a Real 3D Architectural Villa Simulation and 3D Extruded Pillar Slabs.
 */
export const CurationSection: React.FC<CurationSectionProps> = ({ currentProperty }) => {
  const pillars = [
    {
      num: '01',
      title: 'ARCHITECTURAL PEDIGREE',
      subtitle: 'PROVENANCE & AUTHORSHIP',
      description:
        'We reject speculative developments and generic luxury builds. Every work in our archive is designed by recognized architectural ateliers—vetted for structural originality and timeless spatial proportion.',
      icon: Box,
    },
    {
      num: '02',
      title: 'MATERIAL AUTHENTICITY',
      subtitle: 'GEOLOGY & CRAFTSMANSHIP',
      description:
        'Raw poured concrete, thermal volcanic basalt, charred Japanese cedar, and unpolished travertine. We celebrate properties built with noble materials that age with dignity across centuries.',
      icon: Compass,
    },
    {
      num: '03',
      title: 'DISCREET ACQUISITION',
      subtitle: 'PATRON-TO-CUSTODIAN',
      description:
        'A confidential settlement protocol connecting global architectural custodians with discerning patrons. Full structural monographs, solar trajectory studies, and provenance dossiers accompany every sale.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section 
      id="curation" 
      className="relative z-20 py-24 md:py-36 px-6 md:px-16 transition-colors duration-650 ease-cinematic border-t border-hairline"
      style={{ 
        backgroundColor: currentProperty.bgTone,
        borderColor: currentProperty.borderTone 
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-baseline mb-12 md:mb-16">
          <div className="lg:col-span-8">
            <span 
              className="text-[10px] font-mono uppercase tracking-super-wide opacity-60 block mb-4"
              style={{ color: currentProperty.subtleTone }}
            >
              PHILOSOPHY // SPATIAL CURATION
            </span>
            <h2 
              className="text-4xl sm:text-6xl md:text-8xl font-display uppercase tracking-tight leading-[0.88]"
              style={{ color: currentProperty.textTone }}
            >
              WHAT WE DO & <br />
              HOW WE CURATE
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p 
              className="text-xs sm:text-sm font-sans leading-relaxed tracking-wide opacity-80"
              style={{ color: currentProperty.subtleTone }}
            >
              Monolith is not an MLS aggregator or a mass-market broker. It is an invitation-only spatial archive representing the pinnacle of residential contemporary architecture worldwide.
            </p>
          </div>
        </div>

        {/* Real-time 3D Architectural Villa Simulation */}
        <ThreeDVillaViewer currentProperty={currentProperty} />

        {/* 3 Pillars in 3D Extruded Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mt-14">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <ThreeDTiltCard
                key={pillar.num}
                maxTilt={12}
                className="relative p-8 md:p-10 border-hairline flex flex-col justify-between shadow-lg"
              >
                <div style={{ transform: 'translateZ(30px)' }}>
                  {/* Pillar Number in Display Font */}
                  <div className="flex items-center justify-between mb-8">
                    <span 
                      className="font-display text-4xl sm:text-5xl opacity-40 transition-opacity duration-300 group-hover:opacity-90"
                      style={{ color: currentProperty.textTone }}
                    >
                      {pillar.num}
                    </span>
                    <Icon 
                      className="w-5 h-5 stroke-[1.2] opacity-60 transition-transform duration-500 group-hover:rotate-12" 
                      style={{ color: currentProperty.textTone }}
                    />
                  </div>

                  <div 
                    className="text-[9px] font-mono tracking-super-wide uppercase opacity-60 mb-2"
                    style={{ color: currentProperty.subtleTone }}
                  >
                    {pillar.subtitle}
                  </div>

                  <h3 
                    className="text-xl font-editorial font-bold uppercase tracking-tight mb-4"
                    style={{ color: currentProperty.textTone }}
                  >
                    {pillar.title}
                  </h3>

                  <p 
                    className="text-xs sm:text-[13px] font-sans leading-relaxed tracking-wide opacity-75"
                    style={{ color: currentProperty.subtleTone }}
                  >
                    {pillar.description}
                  </p>
                </div>

                <div 
                  className="mt-8 pt-4 border-t border-hairline text-[9px] font-mono uppercase tracking-widest opacity-40 flex items-center justify-between"
                  style={{ 
                    borderColor: currentProperty.borderTone, 
                    color: currentProperty.subtleTone,
                    transform: 'translateZ(20px)'
                  }}
                >
                  <span>CRITERION SPEC // 0{pillar.num}</span>
                  <span>VERIFIED</span>
                </div>
              </ThreeDTiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
