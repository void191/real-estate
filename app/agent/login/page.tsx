'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Lock, Mail, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export default function StaffLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('sarah.jenkins@agency.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password }, true);
    } catch (err: any) {
      setError(err.message || 'Staff authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone/20 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-stone-dim rounded-2xl p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-ink text-white mb-1 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-brass" />
          </div>
          <h1 className="font-headline text-3xl font-medium text-ink">
            Staff Portal
          </h1>
          <p className="text-xs text-muted">
            Authorized access for Kensington & Co. agents and administrative executives.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brass" />
              Agency Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-brass"
              placeholder="agent@agency.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brass" />
              Security Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-brass"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg bg-ink text-white font-sans text-xs uppercase tracking-wider font-semibold hover:bg-ink/90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-brass" />
          </button>
        </form>

        {/* Quick Demo Credentials for Testing */}
        <div className="pt-4 border-t border-stone-dim/60 space-y-2 text-[11px] text-muted">
          <span className="font-semibold text-ink uppercase tracking-wider block">
            Demo Staff Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('sarah.jenkins@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors"
            >
              <div className="font-medium">Sarah Jenkins</div>
              <div className="text-[10px] text-muted">Agent (Eaton Sq, Cadogan)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('marcus.vance@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors"
            >
              <div className="font-medium">Marcus Vance</div>
              <div className="text-[10px] text-muted">Agent (Mount St, Glasshouse)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('elena.rostova@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors"
            >
              <div className="font-medium">Elena Rostova</div>
              <div className="text-[10px] text-muted">Agent (Chester Sq, Holland Pk)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('william.thornbury@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors"
            >
              <div className="font-medium">William Thornbury</div>
              <div className="text-[10px] text-muted">Agent (Bishops Ave, Marylebone)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('charlotte.sinclair@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors"
            >
              <div className="font-medium">Charlotte Sinclair</div>
              <div className="text-[10px] text-muted">Agent (Carlton House, Knightsbridge)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('alan.barzan@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors border border-live/30"
            >
              <div className="font-medium text-live">Alan Barzani</div>
              <div className="text-[10px] text-muted">Erbil Agent (Empire, English Vill)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('layla.erbil@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors border border-live/30"
            >
              <div className="font-medium text-live">Layla Hawrami</div>
              <div className="text-[10px] text-muted">Erbil Agent (Dream City, Italian Vill)</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@agency.com');
                setPassword('password123');
              }}
              className="p-2 rounded bg-stone/40 hover:bg-stone text-left text-ink transition-colors border border-brass/40"
            >
              <div className="font-medium text-brass">Eleanor Kensington</div>
              <div className="text-[10px] text-muted">Admin (All Operations)</div>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs">
          <Link href="/" className="text-muted hover:text-ink transition-colors">
            ← Return to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
