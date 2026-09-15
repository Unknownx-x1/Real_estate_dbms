import React, { useState } from 'react';
import type { PropertyItem } from '../types/property';
import { ArrowUpRight, Compass, Layers } from 'lucide-react';

interface ExploreSectionProps {
  properties: PropertyItem[];
  currentProperty: PropertyItem;
  onSelectProperty: (index: number) => void;
}

/**
 * Section: Spatial Discovery & Architectural Archive (#explore)
 * 3D perspective grid showcasing residences with structural blueprints and material specs.
 */
export const ExploreSection: React.FC<ExploreSectionProps> = ({
  properties,
  currentProperty,
  onSelectProperty,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
          Curated for volumetric proportion, geological siting, and structural integrity.
        </p>
      </div>

      {/* 3D Perspective Property Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 perspective-stage">
        {properties.map((item, index) => {
          const isHovered = hoveredId === item.id;
          
          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                onSelectProperty(index);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative flex flex-col cursor-pointer transition-all duration-500 ease-out will-change-transform"
              style={{
                transform: isHovered 
                  ? 'translateY(-12px) rotateX(4deg) scale(1.02)' 
                  : 'translateY(0) rotateX(0deg) scale(1)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3.2] overflow-hidden border-hairline transition-all duration-500"
                style={{ borderColor: item.borderTone }}
              >
                <img
                  src={item.heroImage}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter group-hover:contrast-[1.05]"
                  loading="lazy"
                />

                {/* Floating Architectural Badge */}
                <div 
                  className="absolute top-3 left-3 text-[9px] font-mono tracking-widest px-2 py-0.5 backdrop-blur-md uppercase"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#F4F1EA',
                  }}
                >
                  {item.code}
                </div>

                <div 
                  className="absolute bottom-3 right-3 p-2 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', color: '#1A1817' }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Metadata Block */}
              <div className="mt-4 flex flex-col space-y-1.5">
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
                  className="text-lg md:text-xl font-editorial font-bold uppercase tracking-tight transition-colors duration-300 group-hover:opacity-75"
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

                {/* Architectural Material Blueprint pill */}
                <div 
                  className="pt-2 text-[9px] font-mono uppercase tracking-widest opacity-50 flex items-center space-x-1.5"
                  style={{ color: currentProperty.subtleTone }}
                >
                  <Layers className="w-3 h-3" />
                  <span className="truncate">{item.materials}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
