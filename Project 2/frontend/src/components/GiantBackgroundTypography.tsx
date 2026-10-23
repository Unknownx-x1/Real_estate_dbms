import React from 'react';
import type { PropertyItem } from '../types/property';

interface GiantBackgroundTypographyProps {
  currentProperty: PropertyItem;
  mouseOffset: { x: number; y: number };
}

/**
 * Section 7: Enormous Architectural Background Typography
 * Uses Anton condensed display font bleeding beyond the viewport edges.
 * Behaves like an architectural structural wall behind the stage.
 */
export const GiantBackgroundTypography: React.FC<GiantBackgroundTypographyProps> = ({
  currentProperty,
  mouseOffset,
}) => {
  // Counter-parallax shift for depth illusion
  const translateX = mouseOffset.x * -18;
  const translateY = mouseOffset.y * -12;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0"
      style={{
        transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
        transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)',
      }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Giant Monolithic Word */}
        <span
          key={currentProperty.id}
          className="font-display uppercase tracking-[-0.03em] leading-[0.78] text-center whitespace-nowrap opacity-[0.14] transition-all duration-650 ease-cinematic"
          style={{
            fontSize: 'clamp(140px, 22vw, 360px)',
            color: currentProperty.textTone,
            textShadow: '0 20px 60px rgba(0,0,0,0.08)',
          }}
        >
          {currentProperty.bgWord}
        </span>

        {/* Subtle secondary architectural line watermark */}
        <div 
          className="absolute bottom-[24%] left-0 right-0 flex justify-between px-12 text-[11px] uppercase tracking-super-wide opacity-20 font-sans"
          style={{ color: currentProperty.textTone }}
        >
          <span>SPATIAL CURATION • SERIES {currentProperty.year}</span>
          <span className="hidden sm:inline">ARCHITECTURAL MONOLITHS • EDITION {currentProperty.code}</span>
        </div>
      </div>
    </div>
  );
};
