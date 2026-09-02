'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { LayoutList, LogOut, Radio } from 'lucide-react';

export function AgentNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-ink text-white border-b border-ink/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/agent/queue" className="flex items-center gap-2">
            <span className="font-headline text-lg font-medium text-white tracking-wide">
              KENSINGTON & CO.
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-brass/20 text-brass font-sans tracking-wider uppercase">
              Agent Portal
            </span>
          </Link>

          <nav className="hidden sm:flex items-center space-x-4 pl-4 border-l border-white/10">
            <Link
              href="/agent/queue"
              className={`text-xs uppercase tracking-wider font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                pathname === '/agent/queue'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-stone-dim hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Viewing Queue
            </Link>
          </nav>
        </div>

        {/* Agent Profile & Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-brass/40"
              />
            )}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-white">{user?.name}</span>
              <span className="text-[10px] text-stone-dim font-mono">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="text-stone-dim hover:text-white p-2 rounded transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
