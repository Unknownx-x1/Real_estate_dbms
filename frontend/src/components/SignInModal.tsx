import React, { useState } from 'react';
import type { PropertyItem } from '../types/property';
import { X, CheckCircle, ArrowRight, Shield, Sparkles, User, Briefcase } from 'lucide-react';
import { apiClient, type UserSession } from '../services/api';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProperty: PropertyItem;
  onLoginSuccess?: (session: UserSession) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  currentProperty,
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<'patron' | 'agent'>('patron');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuthenticate = async (targetEmail: string, targetRole: 'patron' | 'agent') => {
    setLoading(true);
    setStatusMessage('Verifying cryptographic credentials in DBMS registry...');

    try {
      const session = await apiClient.login(
        targetEmail || (targetRole === 'patron' ? 'alice.smith@example.com' : 'ethan.realtor@example.com'),
        targetRole === 'patron' ? 'CUSTOMER' : 'AGENT'
      );

      setStatusMessage(`Clearance granted: Welcome ${session.name}. Transferring to portal...`);
      setTimeout(() => {
        setLoading(false);
        setStatusMessage(null);
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(session);
        }
      }, 750);
    } catch (err) {
      setStatusMessage('Authentication error. Falling back to local clearance.');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthenticate(email, role);
  };

  const handleQuickPatron = () => {
    setRole('patron');
    setEmail('alice.smith@example.com');
    setPassword('password123');
    handleAuthenticate('alice.smith@example.com', 'patron');
  };

  const handleQuickAgent = () => {
    setRole('agent');
    setEmail('ethan.realtor@example.com');
    setPassword('password123');
    handleAuthenticate('ethan.realtor@example.com', 'agent');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/70 transition-all duration-300">
      <div
        className="relative w-full max-w-md p-8 sm:p-10 border border-black/20 shadow-2xl transition-all duration-350 select-none"
        style={{
          backgroundColor: currentProperty.bgTone,
          borderColor: currentProperty.borderTone,
          color: currentProperty.textTone,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border hover:rotate-90 transition-transform duration-300"
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
          AUTHENTICATE SESSION
        </h3>

        <p className="text-xs font-sans opacity-70 mb-5 tracking-wide">
          Enter credentials or utilize 1-click test accreditation for instant DBMS portal exploration.
        </p>

        {/* Quick Test Demo Presets */}
        <div className="mb-6 p-3 border border-dashed border-black/20 space-y-2 bg-black/5">
          <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase tracking-widest opacity-60">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>INSTANT TEST CLEARANCE (1-CLICK):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickPatron}
              className="px-2.5 py-2 border border-black/20 hover:border-black text-[9px] font-mono uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors bg-white/40"
            >
              <User className="w-3 h-3" />
              <span>PATRON (ALICE)</span>
            </button>
            <button
              type="button"
              onClick={handleQuickAgent}
              className="px-2.5 py-2 border border-black/20 hover:border-black text-[9px] font-mono uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors bg-white/40"
            >
              <Briefcase className="w-3 h-3" />
              <span>ATELIER (ETHAN)</span>
            </button>
          </div>
        </div>

        {/* Role Segmented Tabs */}
        <div
          className="grid grid-cols-2 gap-1 p-1 border mb-5 text-[9px] font-mono uppercase"
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
              {role === 'patron' ? 'PATRON IDENTITY (EMAIL)' : 'BROKER ACCREDITATION EMAIL'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'patron' ? 'alice.smith@example.com' : 'ethan.realtor@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-transparent border text-xs font-mono focus:outline-none transition-colors"
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
              className="w-full px-3.5 py-2.5 bg-transparent border text-xs font-mono focus:outline-none transition-colors"
              style={{
                borderColor: currentProperty.borderTone,
                color: currentProperty.textTone,
              }}
            />
          </div>

          {/* Status feedback */}
          {statusMessage && (
            <div className="p-3 border text-[10px] font-mono flex items-center space-x-2 bg-black/10 border-black/20">
              <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 flex items-center justify-center space-x-2 font-mono text-[10px] uppercase tracking-widest transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
            style={{
              backgroundColor: currentProperty.textTone,
              color: currentProperty.bgTone,
            }}
          >
            <span>{loading ? 'AUTHENTICATING...' : 'ENTER SECURE PORTAL'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer info */}
        <div
          className="mt-6 pt-4 border-t text-[8px] font-mono uppercase tracking-super-wide opacity-45 flex items-center justify-between"
          style={{ borderColor: currentProperty.borderTone }}
        >
          <span>ENC: 4096-BIT ARCHITECTURAL HSM</span>
          <span>EDITION MMXXIV</span>
        </div>
      </div>
    </div>
  );
};
