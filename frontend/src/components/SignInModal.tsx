import React, { useState } from 'react';
import type { PropertyItem } from '../types/property';
import { X, CheckCircle, ArrowRight, Shield } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProperty: PropertyItem;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  currentProperty,
}) => {
  const [role, setRole] = useState<'patron' | 'agent'>('patron');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Access clearance verified. Authenticating private monograph session...');
    setTimeout(() => {
      setStatusMessage('Welcome back, Custodian. Private architectural dossier unlocked.');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1400);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/65 transition-all duration-300">
      <div
        className="relative w-full max-w-md p-8 sm:p-10 border-hairline shadow-2xl transition-all duration-350 select-none"
        style={{
          backgroundColor: currentProperty.bgTone,
          borderColor: currentProperty.borderTone,
          color: currentProperty.textTone,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border-hairline hover:rotate-90 transition-transform duration-300"
          style={{ borderColor: currentProperty.borderTone }}
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 text-[9px] font-mono tracking-super-wide uppercase opacity-60 mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>PORTAL // PRIVÉ CLEARANCE</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight leading-none mb-2">
          PATRON SIGN IN
        </h3>

        <p className="text-xs font-sans opacity-70 mb-6 tracking-wide">
          Private access to off-market structural dossiers, direct acquisition channels, and high-fidelity volumetric archives.
        </p>

        {/* Role Segmented Tabs */}
        <div 
          className="grid grid-cols-2 gap-1 p-1 border-hairline mb-6 text-[9px] font-mono uppercase"
          style={{ borderColor: currentProperty.borderTone }}
        >
          <button
            type="button"
            onClick={() => setRole('patron')}
            className={`py-2 transition-all ${role === 'patron' ? 'font-bold' : 'opacity-50 hover:opacity-80'}`}
            style={{
              backgroundColor: role === 'patron' ? currentProperty.textTone : 'transparent',
              color: role === 'patron' ? currentProperty.bgTone : currentProperty.textTone,
            }}
          >
            PRIVATE PATRON
          </button>
          <button
            type="button"
            onClick={() => setRole('agent')}
            className={`py-2 transition-all ${role === 'agent' ? 'font-bold' : 'opacity-50 hover:opacity-80'}`}
            style={{
              backgroundColor: role === 'agent' ? currentProperty.textTone : 'transparent',
              color: role === 'agent' ? currentProperty.bgTone : currentProperty.textTone,
            }}
          >
            ATELIER / AGENT
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1.5">
              {role === 'patron' ? 'PATRON IDENTITY (EMAIL)' : 'BROKER ACCREDITATION ID'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'patron' ? 'patron@domain.com' : 'ATELIER-2024-009'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-transparent border-hairline text-xs font-mono focus:outline-none transition-colors"
              style={{
                borderColor: currentProperty.borderTone,
                color: currentProperty.textTone,
              }}
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono uppercase tracking-widest opacity-60 mb-1.5">
              PASSPHRASE / ACCESS KEY
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-transparent border-hairline text-xs font-mono focus:outline-none transition-colors"
              style={{
                borderColor: currentProperty.borderTone,
                color: currentProperty.textTone,
              }}
            />
          </div>

          {/* Status feedback */}
          {statusMessage && (
            <div className="p-3 border-hairline text-[10px] font-mono flex items-center space-x-2 bg-emerald-900/15 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full mt-2 py-3 flex items-center justify-center space-x-2 font-mono text-[10px] uppercase tracking-widest transition-opacity hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: currentProperty.textTone,
              color: currentProperty.bgTone,
            }}
          >
            <span>AUTHENTICATE SESSION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer info */}
        <div 
          className="mt-6 pt-4 border-t border-hairline text-[8px] font-mono uppercase tracking-super-wide opacity-45 flex items-center justify-between"
          style={{ borderColor: currentProperty.borderTone }}
        >
          <span>ENC: 4096-BIT ARCHITECTURAL HSM</span>
          <span>EDITION MMXXIV</span>
        </div>
      </div>
    </div>
  );
};
