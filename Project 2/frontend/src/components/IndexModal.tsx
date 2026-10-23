import React from 'react';
import type { PropertyItem } from '../types/property';
import { X, ArrowRight } from 'lucide-react';

interface IndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyItem[];
  currentProperty: PropertyItem;
  onSelectProperty: (index: number) => void;
}

export const IndexModal: React.FC<IndexModalProps> = ({
  isOpen,
  onClose,
  properties,
  currentProperty,
  onSelectProperty,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-md bg-black/60 transition-opacity duration-300">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 sm:p-12 border-hairline shadow-2xl transition-all duration-350"
        style={{ 
          backgroundColor: currentProperty.bgTone,
          borderColor: currentProperty.borderTone,
          color: currentProperty.textTone 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-hairline" style={{ borderColor: currentProperty.borderTone }}>
          <div>
            <span className="text-[10px] font-mono tracking-super-wide uppercase opacity-60">CATALOGUE DOSSIER</span>
            <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight">MASTER ARCHIVE INDEX</h3>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full border-hairline hover:rotate-90 transition-transform duration-300"
            style={{ borderColor: currentProperty.borderTone }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of properties */}
        <div className="mt-8 flex flex-col divide-y border-hairline" style={{ borderColor: currentProperty.borderTone }}>
          {properties.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectProperty(index);
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer group hover:opacity-80 transition-all"
            >
              <div className="flex items-center space-x-6">
                <span className="font-mono text-xs opacity-40">{item.code}</span>
                <div className="w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border-hairline" style={{ borderColor: item.borderTone }}>
                  <img src={item.heroImage} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h4 className="font-editorial text-lg sm:text-xl font-bold uppercase">{item.name}</h4>
                  <p className="text-xs opacity-70 font-sans">{item.location} • {item.architect}</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end sm:space-x-8">
                <span className="font-mono text-xs sm:text-sm font-semibold">{item.price}</span>
                <div className="w-8 h-8 rounded-full border-hairline flex items-center justify-center group-hover:translate-x-1 transition-transform" style={{ borderColor: currentProperty.borderTone }}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
