import React from 'react';

/**
 * Section 9: Subtle Film-Grain Texture
 * SVG fractal-noise overlay that makes the entire hero feel tactile, editorial, and physical.
 */
export const NoiseOverlay: React.FC = () => {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.038] mix-blend-multiply"
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="editorial-noise-filter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.75" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#editorial-noise-filter)" />
      </svg>
    </div>
  );
};
