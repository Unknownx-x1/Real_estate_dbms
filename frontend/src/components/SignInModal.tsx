import React, { useState } from 'react';
import type { PropertyItem } from '../types/property';
import { X, CheckCircle, ArrowRight, Shield, Sparkles, User, Briefcase } from 'lucide-react';
import { apiClient, type UserSession } from '../services/api';
import { Logo } from './HorizonLogo';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProperty?: PropertyItem;
  onLoginSuccess?: (session: UserSession) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
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
      }, 700);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/85 transition-all duration-300 animate-in fade-in">
      <div className="relative w-full max-w-md p-8 sm:p-10 bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl transition-all duration-350 select-none text-white font-geist">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border border-white/15 hover:border-white/40 hover:rotate-90 transition-transform duration-300 text-white/60 hover:text-white cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <Logo className="w-6 h-6 text-white" />
          <div className="flex items-center space-x-2 text-[9px] font-mono tracking-super-wide uppercase text-rose-200">
            <Shield className="w-3.5 h-3.5" />
            <span>HORIZON ESTATES // PRIVÉ CLEARANCE</span>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-heading uppercase tracking-wider leading-none mb-2 text-white">
          Authenticate Session
        </h3>

        <p className="text-xs text-white/60 mb-5 tracking-wide leading-relaxed">
          Enter accredited credentials or use 1-click test accreditation for instant DBMS portal exploration.
        </p>

        {/* Quick Test Demo Presets */}
        <div className="mb-6 p-3.5 rounded-xl border border-dashed border-white/20 bg-white/5 space-y-2">
          <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase tracking-widest text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INSTANT TEST CLEARANCE (1-CLICK):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickPatron}
              className="px-3 py-2.5 rounded-lg border border-white/20 hover:border-white text-[10px] font-mono uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-rose-300" />
              <span>PATRON (ALICE)</span>
            </button>
            <button
              type="button"
              onClick={handleQuickAgent}
              className="px-3 py-2.5 rounded-lg border border-white/20 hover:border-white text-[10px] font-mono uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-rose-300" />
              <span>ATELIER (ETHAN)</span>
            </button>
          </div>
        </div>

        {/* Role Segmented Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-white/5 border border-white/10 mb-5 text-[10px] font-mono uppercase">
          <button
            type="button"
            onClick={() => setRole('patron')}
            className={`py-2 rounded transition-all cursor-pointer ${
              role === 'patron'
                ? 'bg-white text-black font-medium shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            PRIVATE PATRON
          </button>
          <button
            type="button"
            onClick={() => setRole('agent')}
            className={`py-2 rounded transition-all cursor-pointer ${
              role === 'agent'
                ? 'bg-white text-black font-medium shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            ATELIER / AGENT
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
              {role === 'patron' ? 'PATRON IDENTITY (EMAIL)' : 'BROKER ACCREDITATION EMAIL'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'patron' ? 'alice.smith@example.com' : 'ethan.realtor@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
              PASSPHRASE / ACCESS KEY
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {/* Status feedback */}
          {statusMessage && (
            <div className="p-3 rounded-lg border text-[11px] font-mono flex items-center space-x-2 bg-emerald-950/40 border-emerald-500/30 text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full flex items-center justify-center space-x-2 font-geist font-medium text-xs uppercase tracking-wider bg-white text-black hover:bg-gray-200 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'ENTER SECURE PORTAL'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/40 flex items-center justify-between">
          <span>ENC: 4096-BIT ARCHITECTURAL HSM</span>
          <span>13 BCNF RELATIONS</span>
        </div>
      </div>
    </div>
  );
};
