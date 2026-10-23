import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { PropertyItem } from '../types/property';

interface CarouselControlsProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  currentProperty: PropertyItem;
}

/**
 * Section 12 & 16: Circular Minimal Navigation Controls & Counter
 * Transparent circular controls with hairline borders and subtle catalogue counter.
 */
export const CarouselControls: React.FC<CarouselControlsProps> = ({
  currentIndex,
  total,
  onPrev,
  onNext,
  currentProperty,
}) => {
  const formatNum = (n: number) => (n < 9 ? `0${n + 1}` : `${n + 1}`);

  return (
    <div className="flex items-center space-x-6 select-none z-30 pointer-events-auto">
      {/* Navigation Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onPrev}
          aria-label="Previous architectural work"
          className="group relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border-hairline"
          style={{
            borderColor: currentProperty.borderTone,
            backgroundColor: 'transparent',
            color: currentProperty.textTone,
          }}
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.5] transition-transform duration-300 group-hover:-translate-x-0.5" />
          <span 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            style={{ backgroundColor: currentProperty.textTone }}
          />
        </button>

        <button
          onClick={onNext}
          aria-label="Next architectural work"
          className="group relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border-hairline"
          style={{
            borderColor: currentProperty.borderTone,
            backgroundColor: 'transparent',
            color: currentProperty.textTone,
          }}
        >
          <ArrowRight className="w-4 h-4 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-0.5" />
          <span 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            style={{ backgroundColor: currentProperty.textTone }}
          />
        </button>
      </div>

      {/* Subtle Catalogue Counter: 01 ──── 05 */}
      <div 
        className="flex items-center space-x-2.5 font-mono text-[11px] tracking-widest transition-colors duration-650"
        style={{ color: currentProperty.textTone }}
      >
        <span className="font-semibold">{formatNum(currentIndex)}</span>
        <span 
          className="inline-block w-8 h-[1px] opacity-40 transition-colors duration-650" 
          style={{ backgroundColor: currentProperty.textTone }}
        />
        <span className="opacity-40">{formatNum(total - 1)}</span>
      </div>
    </div>
  );
};
