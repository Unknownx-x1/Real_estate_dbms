import type { PropertyItem } from '../types/property';
import { ArrowUp } from 'lucide-react';

interface EditorialFooterProps {
  currentProperty: PropertyItem;
}

/**
 * Editorial Architectural Footer
 * Minimalist, precise, quiet footer.
 */
export const EditorialFooter: React.FC<EditorialFooterProps> = ({ currentProperty }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      className="relative z-20 py-16 px-6 md:px-16 border-t border-hairline transition-colors duration-650 ease-cinematic"
      style={{ 
        backgroundColor: currentProperty.bgTone,
        borderColor: currentProperty.borderTone 
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col space-y-1">
          <div 
            className="font-display text-2xl uppercase tracking-widest"
            style={{ color: currentProperty.textTone }}
          >
            MONOLITH
          </div>
          <span 
            className="text-[9px] font-mono tracking-super-wide uppercase opacity-60"
            style={{ color: currentProperty.subtleTone }}
          >
            SPATIAL ARCHITECTURAL ARCHIVES • EDITION MMXXIV
          </span>
        </div>

        <div 
          className="text-[10px] font-mono tracking-widest uppercase opacity-60 flex flex-wrap gap-6"
          style={{ color: currentProperty.subtleTone }}
        >
          <span>ZURICH</span>
          <span>LISBON</span>
          <span>TOKYO</span>
          <span>MEXICO CITY</span>
          <span>STOCKHOLM</span>
        </div>

        <button
          onClick={scrollToTop}
          className="group flex items-center space-x-2 text-[10px] font-mono tracking-widest uppercase transition-opacity hover:opacity-100"
          style={{ color: currentProperty.textTone }}
        >
          <span>RETURN TO APEX</span>
          <div 
            className="w-8 h-8 rounded-full border-hairline flex items-center justify-center transition-transform group-hover:-translate-y-1"
            style={{ borderColor: currentProperty.borderTone }}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      <div 
        className="max-w-7xl mx-auto mt-12 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-[8px] font-mono uppercase tracking-super-wide opacity-40 gap-4"
        style={{ borderColor: currentProperty.borderTone, color: currentProperty.subtleTone }}
      >
        <span>© 2024 MONOLITH SPATIAL PLATFORM. ALL ARCHITECTURAL RIGHTS PRESERVED.</span>
        <span>PRIVATE BROKERAGE • CODE OF CURATION</span>
      </div>
    </footer>
  );
};
