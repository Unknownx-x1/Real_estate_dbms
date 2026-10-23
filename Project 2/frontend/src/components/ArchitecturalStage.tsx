import React from 'react';
import type { PropertyItem } from '../types/property';

interface ArchitecturalStageProps {
  properties: PropertyItem[];
  currentIndex: number;
  onSelectProperty: (index: number) => void;
  mouseOffset: { x: number; y: number };
}

/**
 * Section 5, 13, 14, 17: 3D Architectural Stage & Carousel
 * Center dominant architectural visual with surrounding previous/next objects waiting to move into focus.
 * Positional movement with depth, scale, blur, and opacity transitions.
 */
export const ArchitecturalStage: React.FC<ArchitecturalStageProps> = ({
  properties,
  currentIndex,
  onSelectProperty,
  mouseOffset,
}) => {
  const total = properties.length;

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-stage preserve-3d pointer-events-none z-10 select-none">
      {properties.map((property, index) => {
        // Calculate shortest relative circular distance
        let dist = (index - currentIndex + total) % total;
        if (dist > total / 2) dist -= total;

        const isCenter = dist === 0;
        const isPrev = dist === -1;
        const isNext = dist === 1;
        const isFar = Math.abs(dist) >= 2;

        // 3D positioning calculation
        let translateX = 0;
        let translateY = 0;
        let translateZ = 0;
        let rotateY = 0;
        let scale = 1;
        let opacity = 1;
        let blur = 'blur(0px)';
        let zIndex = 30;
        let pointerEvents: 'auto' | 'none' = 'none';

        if (isCenter) {
          // Center: Sharp, large, dominant with mouse parallax
          translateX = mouseOffset.x * 24;
          translateY = mouseOffset.y * 16;
          translateZ = 40;
          rotateY = mouseOffset.x * 4;
          scale = 1;
          opacity = 1;
          blur = 'blur(0px)';
          zIndex = 35;
          pointerEvents = 'auto';
        } else if (isPrev) {
          // Left: Smaller, slightly blurred, lower opacity, offset left
          translateX = -480;
          translateY = 0;
          translateZ = -140;
          rotateY = 16;
          scale = 0.74;
          opacity = 0.42;
          blur = 'blur(3px)';
          zIndex = 20;
          pointerEvents = 'auto';
        } else if (isNext) {
          // Right: Smaller, slightly blurred, lower opacity, offset right
          translateX = 480;
          translateY = 0;
          translateZ = -140;
          rotateY = -16;
          scale = 0.74;
          opacity = 0.42;
          blur = 'blur(3px)';
          zIndex = 20;
          pointerEvents = 'auto';
        } else {
          // Far behind: small, blurred, low opacity
          translateX = dist < 0 ? -700 : 700;
          translateY = -40;
          translateZ = -320;
          rotateY = dist < 0 ? 25 : -25;
          scale = 0.52;
          opacity = 0;
          blur = 'blur(10px)';
          zIndex = 10;
          pointerEvents = 'none';
        }

        return (
          <div
            key={property.id}
            onClick={() => {
              if (!isCenter && !isFar) onSelectProperty(index);
            }}
            className="absolute flex flex-col items-center justify-center transition-all duration-650 ease-cinematic cursor-pointer will-change-transform"
            style={{
              transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
              opacity,
              filter: blur,
              zIndex,
              pointerEvents,
              width: 'min(88vw, 620px)',
            }}
          >
            {/* Architectural Plinth / Canvas Container */}
            <div className="relative w-full aspect-[4/4.8] sm:aspect-[4/4.5] md:aspect-[4/4.2] max-h-[62vh] rounded-none overflow-hidden group">
              {/* Architectural Image */}
              <img
                src={property.heroImage}
                alt={property.name}
                loading="eager"
                className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
              />

              {/* Editorial architectural hairline frame */}
              <div 
                className="absolute inset-0 border-hairline transition-colors duration-650"
                style={{ borderColor: property.borderTone }}
              />

              {/* Architectural Monolith Stamp (Top Right of image) */}
              {isCenter && (
                <div 
                  className="absolute top-4 right-4 text-[9px] uppercase tracking-super-wide px-2.5 py-1 backdrop-blur-md transition-colors duration-650 font-sans"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    color: property.textTone,
                    border: `0.5px solid ${property.borderTone}`
                  }}
                >
                  MONOGRAPH {property.code}
                </div>
              )}

              {/* Sub-plinth material indicator (Bottom Left of image) */}
              {isCenter && (
                <div 
                  className="absolute bottom-4 left-4 text-[8px] sm:text-[9px] uppercase tracking-widest-editorial px-2.5 py-1 backdrop-blur-md font-sans hidden sm:block"
                  style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.65)',
                    color: '#F4F1EA',
                  }}
                >
                  PLINTH: {property.materials.split('•')[0]}
                </div>
              )}
            </div>

            {/* Realistic Pedestal Shadow beneath central object */}
            {isCenter && (
              <div 
                className="w-[85%] h-8 mt-2 rounded-full blur-xl opacity-35 transition-all duration-650"
                style={{
                  backgroundColor: '#000',
                  transform: `translateX(${mouseOffset.x * 10}px) scaleY(0.4)`,
                }}
              />
            )}

            {/* Click-to-focus preview label for side properties */}
            {!isCenter && (
              <div 
                className="mt-3 text-[10px] uppercase tracking-widest-editorial font-sans transition-opacity duration-300 group-hover:opacity-100 opacity-60"
                style={{ color: property.textTone }}
              >
                {property.name} ↗
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
