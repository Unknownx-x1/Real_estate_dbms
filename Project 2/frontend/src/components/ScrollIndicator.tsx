import React from 'react';
import type { PropertyItem } from '../types/property';

interface ScrollIndicatorProps {
  currentProperty: PropertyItem;
}

/**
 * Section 19: Subtle Scroll Indicator
 * Minimalist editorial cue at bottom center.
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ currentProperty }) => {
  return (
    <div 
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-1.5 opacity-45 pointer-events-none select-none transition-colors duration-650"
      style={{ color: currentProperty.textTone }}
    >
      <span className="text-[8px] sm:text-[9px] font-mono tracking-super-wide uppercase">
        SCROLL TO EXPLORE
      </span>
      <div 
        className="w-[1px] h-5 transition-colors duration-650 animate-pulse"
        style={{ backgroundColor: currentProperty.textTone }}
      />
    </div>
  );
};
