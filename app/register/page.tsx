'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { BuyerNav } from '@/components/navigation/BuyerNav';
import { Lock, Mail, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function BuyerRegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await register({ name, email, phone, password });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
              New Client
            </span>
            <h1 className="font-headline text-3xl font-medium text-ink">
              Create Client Account
            </h1>
            <p className="text-xs text-muted">
              Register to schedule private appointments and save luxury residences.
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
                <User className="w-3.5 h-3.5 text-brass" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-brass"
                placeholder="e.g. Lord Harrington"
              />
            </div>

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
                placeholder="client@domain.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brass" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-brass"
                placeholder="+44 7700 900000"
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
              <span>{isLoading ? 'Registering...' : 'Complete Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-muted">
            Already registered?{' '}
            <Link href="/login" className="text-brass font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
