import React, { useState, useRef } from 'react';
import type { PropertyItem } from '../types/property';
import { Rotate3d } from 'lucide-react';

interface ThreeDArchitecturalModelProps {
  currentProperty: PropertyItem;
}

/**
 * Interactive 3D Spatial Architectural Model
 * Features real 3D CSS perspective transforms with interactive rotation,
 * layered floor plates, structural columns, and elevation wireframes.
 */
export const ThreeDArchitecturalModel: React.FC<ThreeDArchitecturalModelProps> = ({ currentProperty }) => {
  const [rotation, setRotation] = useState({ x: 60, z: -35 });
  const [activeLayer, setActiveLayer] = useState<'all' | 'massing' | 'structure'>('all');
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    setRotation((prev) => ({
      x: Math.max(15, Math.min(85, prev.x - deltaY * 0.5)),
      z: prev.z + deltaX * 0.5,
    }));

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetRotation = () => {
    setRotation({ x: 60, z: -35 });
  };

  return (
    <div 
      className="relative w-full my-16 p-8 md:p-14 border-hairline transition-all duration-650 flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: currentProperty.borderTone,
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header Bar */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline"
        style={{ borderColor: currentProperty.borderTone }}
      >
        <div className="flex items-center space-x-3">
          <Rotate3d className="w-4 h-4 animate-spin-slow opacity-70" style={{ color: currentProperty.textTone }} />
          <div>
            <span className="text-[9px] font-mono tracking-super-wide uppercase opacity-60 block">3D VOLUMETRIC STUDY</span>
            <h4 className="text-sm font-editorial font-bold uppercase tracking-wider" style={{ color: currentProperty.textTone }}>
              AXONOMETRIC STRUCTURAL PROJECTION
            </h4>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 text-[9px] font-mono uppercase">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1.5 border-hairline transition-all ${activeLayer === 'all' ? 'opacity-100 font-bold' : 'opacity-40'}`}
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            [ALL LAYERS]
          </button>
          <button
            onClick={() => setActiveLayer('structure')}
            className={`px-3 py-1.5 border-hairline transition-all ${activeLayer === 'structure' ? 'opacity-100 font-bold' : 'opacity-40'}`}
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            [STRUCTURE]
          </button>
          <button
            onClick={resetRotation}
            className="px-3 py-1.5 border-hairline opacity-60 hover:opacity-100 transition-opacity"
            style={{ borderColor: currentProperty.borderTone, color: currentProperty.textTone }}
          >
            RESET VIEW
          </button>
        </div>
      </div>

      {/* 3D Viewport Stage */}
      <div 
        className="w-full h-[380px] sm:h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: 1200 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* The 3D World container */}
        <div
          className="relative w-64 h-64 transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg)`,
          }}
        >
          {/* 1. Ground Grid Foundation Plane */}
          <div 
            className="absolute inset-[-40px] border-hairline border-dashed transition-all"
            style={{
              transform: 'translateZ(0px)',
              borderColor: currentProperty.borderTone,
              backgroundImage: `linear-gradient(${currentProperty.borderTone} 1px, transparent 1px), linear-gradient(90deg, ${currentProperty.borderTone} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              opacity: 0.35,
            }}
          />

          {/* 2. Ground Floor Concrete Slab */}
          <div
            className="absolute inset-0 border-hairline backdrop-blur-sm transition-all shadow-2xl"
            style={{
              transform: 'translateZ(20px)',
              borderColor: currentProperty.textTone,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="absolute top-2 left-2 text-[8px] font-mono opacity-50">SLAB: 01 (LEVEL ±0.00)</div>
          </div>

          {/* 3. Structural Columns Layer */}
          {(activeLayer === 'all' || activeLayer === 'structure') && (
            <>
              {[
                { top: '10%', left: '10%' },
                { top: '10%', left: '90%' },
                { top: '90%', left: '10%' },
                { top: '90%', left: '90%' },
                { top: '50%', left: '50%' },
                { top: '25%', left: '75%' },
              ].map((pos, idx) => (
                <div
                  key={idx}
                  className="absolute w-2 h-20 border-hairline origin-bottom transition-all"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    transform: 'translateZ(20px) rotateX(-90deg)',
                    borderColor: currentProperty.textTone,
                    backgroundColor: currentProperty.textTone,
                    opacity: 0.6,
                  }}
                />
              ))}
            </>
          )}

          {/* 4. Cantilever Intermediate Pavilion Floor */}
          {activeLayer === 'all' && (
            <div
              className="absolute inset-[-20px] w-56 h-40 border-hairline backdrop-blur-sm transition-all"
              style={{
                transform: 'translateZ(80px) translateX(30px)',
                borderColor: currentProperty.textTone,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }}
            >
              <div className="absolute top-2 left-2 text-[8px] font-mono opacity-60">CANTILEVER WING // 34° OVERHANG</div>
            </div>
          )}

          {/* 5. Roof Volumetric Slab with Sky Aperture */}
          <div
            className="absolute inset-0 border-hairline backdrop-blur-md transition-all flex items-center justify-center"
            style={{
              transform: 'translateZ(140px)',
              borderColor: currentProperty.textTone,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
            }}
          >
            {/* Skylight Aperture */}
            <div 
              className="w-20 h-20 border-hairline border-dashed flex items-center justify-center text-[7px] font-mono opacity-70"
              style={{ borderColor: currentProperty.textTone }}
            >
              OCULUS
            </div>
          </div>

          {/* 6. 3D Elevation Axis Indicator */}
          <div
            className="absolute -bottom-8 -left-8 text-[9px] font-mono opacity-60"
            style={{ transform: 'translateZ(160px)' }}
          >
            Z: +14.2m
          </div>
        </div>
      </div>

      {/* Footer Helper */}
      <div 
        className="w-full pt-4 border-t border-hairline flex items-center justify-between text-[8px] font-mono uppercase tracking-widest opacity-60"
        style={{ borderColor: currentProperty.borderTone, color: currentProperty.subtleTone }}
      >
        <span>CLICK & DRAG TO ROTATE 3D VOLUMETRIC MODEL IN REAL-TIME</span>
        <span>AZIMUTH: {Math.round(rotation.z)}° • INCLINE: {Math.round(rotation.x)}°</span>
      </div>
    </div>
  );
};
