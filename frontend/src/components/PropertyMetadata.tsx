import React from 'react';
import type { PropertyItem } from '../types/property';

interface PropertyMetadataProps {
  property: PropertyItem;
}

/**
 * Section 11: Bottom-Left Property Architectural Catalogue Information
 * Pure typography hierarchy without cards, containers, or generic white boxes.
 */
export const PropertyMetadata: React.FC<PropertyMetadataProps> = ({ property }) => {
  return (
    <div className="flex flex-col items-start select-none z-30 transition-all duration-650 ease-cinematic max-w-sm sm:max-w-md">
      {/* 1. Property ID & Classification */}
      <div 
        className="flex items-center space-x-3 text-[10px] md:text-[11px] font-mono tracking-widest uppercase transition-colors duration-650"
        style={{ color: property.subtleTone }}
      >
        <span className="font-semibold">{property.code}</span>
        <span className="opacity-40">•</span>
        <span className="tracking-super-wide">{property.type}</span>
      </div>

      {/* 2. Property Name (Prominent Architectural Title) */}
      <h2 
        className="mt-2 text-2xl sm:text-3xl md:text-4xl font-editorial font-bold tracking-tight uppercase leading-[0.95] transition-colors duration-650"
        style={{ color: property.textTone }}
      >
        {property.name}
      </h2>

      {/* 3. Location */}
      <p 
        className="mt-2 text-xs sm:text-[11px] font-sans tracking-widest-editorial uppercase opacity-80 transition-colors duration-650"
        style={{ color: property.subtleTone }}
      >
        {property.location}
      </p>

      {/* 4. Price and Spatial Area */}
      <div 
        className="mt-3.5 flex items-baseline space-x-4 text-sm sm:text-base font-sans tracking-wide transition-colors duration-650"
        style={{ color: property.textTone }}
      >
        <span className="font-semibold tracking-wider text-base sm:text-lg">{property.price}</span>
        <span className="text-xs opacity-50 tracking-widest font-mono">•</span>
        <span className="text-xs uppercase tracking-widest opacity-85 font-mono">{property.size}</span>
      </div>

      {/* 5. Architect & Studio Attribution */}
      <div 
        className="mt-2 text-[9px] font-mono uppercase tracking-widest opacity-60 transition-colors duration-650 hidden sm:block"
        style={{ color: property.subtleTone }}
      >
        DESIGN: {property.architect} ({property.year})
      </div>
    </div>
  );
};
