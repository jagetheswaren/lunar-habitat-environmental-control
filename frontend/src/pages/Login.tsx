import React, { useState } from 'react';
import { api } from '../api/client';
import { StarfieldCanvas } from '../components/3d/StarfieldCanvas';
import { Shield, Lock, User, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
}

export const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login(username, password);
      localStorage.setItem('lunar_token', res.token);
      localStorage.setItem('lunar_user', JSON.stringify(res));
      onLoginSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Authentication failed. Invalid lunar mission operator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  const showDevCredentials = !import.meta.env.PROD && import.meta.env.VITE_ENABLE_DEMO_CREDENTIALS === 'true';

  return (
    <div className="min-h-screen bg-[#080B10] flex items-center justify-center p-4 relative overflow-hidden select-none font-mono">
      <StarfieldCanvas />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-[#111820] rounded border border-[#283443] p-6 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b border-[#283443]">
            <div className="w-10 h-10 mx-auto mb-3 rounded bg-[#161F2A] border border-[#283443] flex items-center justify-center text-[#06B6D4]">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-sm font-semibold tracking-wider text-[#F1F4F6] uppercase">
              LUNAR OPERATIONS SYSTEM
            </h1>
            <p className="text-[10px] text-[#06B6D4] tracking-widest uppercase mt-0.5 font-medium">
              OPERATOR AUTHENTICATION GATEWAY
            </p>
            <p className="text-[11px] text-[#98A3B3] mt-1">
              Autonomous Environmental & ERP Infrastructure
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2.5 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#98A3B3] uppercase tracking-wider mb-1 font-medium">
                Operator Call-Sign
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#657184] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-9 pr-3 py-1.5 rounded bg-[#0C1118] border border-[#283443] text-[#F1F4F6] text-xs placeholder-[#657184] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#98A3B3] uppercase tracking-wider mb-1 font-medium">
                Security Keyphrase
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#657184] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-1.5 rounded bg-[#0C1118] border border-[#283443] text-[#F1F4F6] text-xs placeholder-[#657184] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 rounded bg-[#06B6D4] text-[#080B10] font-bold text-xs uppercase tracking-wider hover:bg-[#22D3EE] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>AUTHENTICATING OPERATOR...</span>
              ) : (
                <>
                  <span>INITIALIZE MISSION SESSION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials - Development Profile Only */}
          {showDevCredentials && (
            <div className="mt-5 pt-3.5 border-t border-[#283443]">
              <div className="text-[10px] text-[#98A3B3] mb-2 flex items-center gap-1.5 uppercase font-medium">
                <KeyRound className="w-3 h-3 text-[#06B6D4]" />
                <span>DEV TEST CREDENTIALS:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin', 'admin123')}
                  className="py-1 px-1.5 rounded border border-[#283443] bg-[#0C1118] hover:bg-[#161F2A] hover:text-[#06B6D4] text-[#98A3B3] transition-colors"
                >
                  ADMIN
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('operator', 'admin123')}
                  className="py-1 px-1.5 rounded border border-[#283443] bg-[#0C1118] hover:bg-[#161F2A] hover:text-[#06B6D4] text-[#98A3B3] transition-colors"
                >
                  OPERATOR
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('accountant', 'admin123')}
                  className="py-1 px-1.5 rounded border border-[#283443] bg-[#0C1118] hover:bg-[#161F2A] hover:text-[#06B6D4] text-[#98A3B3] transition-colors"
                >
                  FINANCE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

