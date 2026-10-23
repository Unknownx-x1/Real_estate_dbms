import React from 'react';
import type { PropertyItem } from '../types/property';
import { ArrowUpRight, Compass, Layers } from 'lucide-react';
import { ThreeDTiltCard } from './ThreeDTiltCard';

interface ExploreSectionProps {
  properties: PropertyItem[];
  currentProperty: PropertyItem;
  onSelectProperty: (index: number) => void;
}

/**
 * Section: Spatial Discovery & Architectural Archive (#explore)
 * Enhanced with genuine interactive 3D Tilt Cards, Z-space depth, and specular glares.
 */
export const ExploreSection: React.FC<ExploreSectionProps> = ({
  properties,
  currentProperty,
  onSelectProperty,
}) => {
  return (
    <section 
      id="explore" 
      className="relative z-20 py-24 md:py-36 px-6 md:px-16 transition-colors duration-650 ease-cinematic"
      style={{ backgroundColor: currentProperty.bgTone }}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 pb-8 border-b border-hairline"
        style={{ borderColor: currentProperty.borderTone }}
      >
        <div>
          <div 
            className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest mb-3"
            style={{ color: currentProperty.subtleTone }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ARCHIVE INDEX // 01</span>
          </div>
          <h2 
            className="text-4xl sm:text-5xl md:text-7xl font-display uppercase tracking-tight leading-[0.9]"
            style={{ color: currentProperty.textTone }}
          >
            SPATIAL DISCOVERY
          </h2>
        </div>

        <p 
          className="mt-6 md:mt-0 max-w-md text-xs sm:text-sm font-sans leading-relaxed tracking-wide opacity-80"
          style={{ color: currentProperty.subtleTone }}
        >
          Each residence in the Monolith collection is an indivisible architectural work. 
          Hover over each monograph to inspect structural dimensions in 3D perspective.
        </p>
      </div>

      {/* 3D Perspective Property Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {properties.map((item, index) => {
          return (
            <ThreeDTiltCard
              key={item.id}
              maxTilt={14}
              onClick={() => {
                onSelectProperty(index);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex flex-col"
            >
              {/* Image Frame with 3D Pop Elements */}
              <div 
                className="relative aspect-[4/3.2] overflow-hidden border-hairline transition-all duration-500 bg-black/10"
                style={{ 
                  borderColor: item.borderTone,
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={item.heroImage}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                />

                {/* Floating Architectural Badge (Elevated in 3D Z-Space) */}
                <div 
                  className="absolute top-3 left-3 text-[9px] font-mono tracking-widest px-2.5 py-1 backdrop-blur-md uppercase shadow-lg transition-transform duration-300"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#F4F1EA',
                    transform: 'translateZ(35px)',
                  }}
                >
                  {item.code}
                </div>

                {/* Hover CTA Button (Elevated in 3D Z-Space) */}
                <div 
                  className="absolute bottom-3 right-3 p-2.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-2xl"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.92)', 
                    color: '#1A1817',
                    transform: 'translateZ(45px)',
                  }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Metadata Block (Elevated in 3D Z-Space) */}
              <div 
                className="mt-4 flex flex-col space-y-1.5 transition-transform duration-300"
                style={{ transform: 'translateZ(25px)' }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono uppercase tracking-widest opacity-60"
                    style={{ color: currentProperty.subtleTone }}
                  >
                    {item.type}
                  </span>
                  <span 
                    className="text-[11px] font-mono font-semibold"
                    style={{ color: currentProperty.textTone }}
                  >
                    {item.price}
                  </span>
                </div>

                <h3 
                  className="text-lg md:text-xl font-editorial font-bold uppercase tracking-tight transition-colors duration-300 group-hover:opacity-80"
                  style={{ color: currentProperty.textTone }}
                >
                  {item.name}
                </h3>

                <p 
                  className="text-xs font-sans tracking-wide opacity-70"
                  style={{ color: currentProperty.subtleTone }}
                >
                  {item.location} • {item.size}
                </p>

                {/* Architectural Material Spec */}
                <div 
                  className="pt-2 text-[9px] font-mono uppercase tracking-widest opacity-50 flex items-center space-x-1.5"
                  style={{ color: currentProperty.subtleTone }}
                >
                  <Layers className="w-3 h-3" />
                  <span className="truncate">{item.materials}</span>
                </div>
              </div>
            </ThreeDTiltCard>
          );
        })}
      </div>
    </section>
  );
};
