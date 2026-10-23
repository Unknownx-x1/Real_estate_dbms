import React from 'react';
import type { PropertyItem } from '../types/property';

interface EditorialCTAProps {
  currentProperty: PropertyItem;
}

/**
 * Section 15: Enormous Editorial Bottom-Right CTA
 * Giant text-based display link in Anton with zero SaaS button cliches.
 */
export const EditorialCTA: React.FC<EditorialCTAProps> = ({ currentProperty }) => {
  return (
    <div className="z-30 pointer-events-auto select-none flex flex-col items-end">
      <a
        href="#explore-residence"
        className="group flex items-center space-x-3 transition-transform duration-300 hover:-translate-x-2"
        style={{ color: currentProperty.textTone }}
      >
        <span 
          className="font-display tracking-tight uppercase leading-none transition-colors duration-650 text-4xl sm:text-6xl md:text-7xl lg:text-8xl hover:opacity-90"
          style={{ textShadow: '0 10px 30px rgba(0,0,0,0.06)' }}
        >
          DISCOVER
        </span>
        <span 
          className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-none transition-transform duration-300 group-hover:translate-x-3"
        >
          →
        </span>
      </a>

      {/* Micro-editorial sub-label */}
      <span 
        className="mt-1 text-[9px] font-sans tracking-widest-editorial uppercase opacity-50 transition-colors duration-650"
        style={{ color: currentProperty.subtleTone }}
      >
        REQUEST MONOGRAPH DOSSIER
      </span>
    </div>
  );
};
