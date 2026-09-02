'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { BarChart3, Building2, Calendar, Users, ShieldCheck, LogOut } from 'lucide-react';

export function AdminNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: ShieldCheck },
    { label: 'Viewings', href: '/admin/viewings', icon: Calendar },
    { label: 'Listings', href: '/admin/listings', icon: Building2 },
    { label: 'Agents', href: '/admin/agents', icon: Users },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink text-white border-b border-ink/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-headline text-lg font-medium text-white tracking-wide">
              KENSINGTON & CO.
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-900/40 text-red-300 font-sans tracking-wider uppercase border border-red-800/50">
              Admin
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs uppercase tracking-wider font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-stone-dim hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-xs text-stone-dim font-sans font-medium">
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="text-stone-dim hover:text-white p-2 rounded transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 bg-ink/90 border-t border-white/10 space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs whitespace-nowrap px-3 py-1 rounded flex items-center gap-1.5 ${
                active ? 'bg-white/20 text-white font-medium' : 'text-stone-dim'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
