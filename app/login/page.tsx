'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { BuyerNav } from '@/components/navigation/BuyerNav';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function BuyerLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('buyer1@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password }, false);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <BuyerNav />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-stone rounded-2xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
              Client Access
            </span>
            <h1 className="font-headline text-3xl font-medium text-ink">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-muted">
              Access your saved residences and viewing itinerary.
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
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-brass"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brass" />
                Password
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
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="pt-4 border-t border-stone-dim/60 space-y-2 text-[11px] text-muted">
            <span className="font-semibold text-ink uppercase tracking-wider block">
              Demo Buyer Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('buyer1@example.com');
                  setPassword('password123');
                }}
                className="p-1.5 text-left rounded bg-stone/50 hover:bg-stone text-ink transition-colors"
              >
                <div className="font-medium">Oliver Sterling</div>
                <div className="text-[10px] text-muted">buyer1@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('buyer2@example.com');
                  setPassword('password123');
                }}
                className="p-1.5 text-left rounded bg-stone/50 hover:bg-stone text-ink transition-colors"
              >
                <div className="font-medium">Sophia Montgomery</div>
                <div className="text-[10px] text-muted">buyer2@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('buyer5@example.com');
                  setPassword('password123');
                }}
                className="p-1.5 text-left rounded bg-stone/50 hover:bg-stone text-ink transition-colors"
              >
                <div className="font-medium">Lord Henry Cavendish</div>
                <div className="text-[10px] text-muted">buyer5@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('buyer7@example.com');
                  setPassword('password123');
                }}
                className="p-1.5 text-left rounded bg-stone/50 hover:bg-stone text-ink transition-colors"
              >
                <div className="font-medium">Alexander Wright</div>
                <div className="text-[10px] text-muted">buyer7@example.com</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-muted">
            Do not have an account yet?{' '}
            <Link href="/register" className="text-brass font-medium hover:underline">
              Create Client Account
            </Link>
          </div>

          <div className="text-center pt-1 border-t border-stone-dim/40 text-xs">
            <Link href="/agent/login" className="text-muted hover:text-ink transition-colors">
              Agent or Administrator? <span className="underline">Staff Portal</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
