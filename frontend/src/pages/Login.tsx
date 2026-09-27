import React, { useState } from 'react';
import { api } from '../api/client';
import { StarfieldCanvas } from '../components/3d/StarfieldCanvas';
import { Globe2, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

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
        'Authentication failed. Invalid lunar mission credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4 relative overflow-hidden">
      <StarfieldCanvas />

      {/* Orbit Rings in background */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/10 animate-spin-slow pointer-events-none" />
      <div className="absolute w-[800px] h-[800px] rounded-full border border-blue-500/5 animate-spin-reverse pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Glass Card */}
        <div className="lunar-glass rounded-2xl p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/40">
              <Globe2 className="w-8 h-8 text-space-950 font-bold" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              LUNAR HABITAT
            </h1>
            <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-1">
              OPERATIONS MISSION CONTROL
            </p>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Environmental Control • Reclamation • Governance
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Mission Operator ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Security Keyphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-space-950 font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>AUTHENTICATING PROTOCOL...</span>
              ) : (
                <>
                  <span>INITIALIZE MISSION SESSION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>TEST CREDENTIALS (CLICK TO AUTOFILL):</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin', 'admin123')}
                className="p-1.5 rounded-lg border border-slate-700 bg-space-850 hover:border-cyan-500/50 hover:bg-space-800 text-slate-300 transition-colors"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('operator', 'operator123')}
                className="p-1.5 rounded-lg border border-slate-700 bg-space-850 hover:border-cyan-500/50 hover:bg-space-800 text-slate-300 transition-colors"
              >
                OPERATOR
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('accountant', 'accountant123')}
                className="p-1.5 rounded-lg border border-slate-700 bg-space-850 hover:border-cyan-500/50 hover:bg-space-800 text-slate-300 transition-colors"
              >
                FINANCE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
