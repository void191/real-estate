'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Heart, Calendar, Home, User as UserIcon, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

export function BuyerNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-dim">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex flex-col">
          <span className="font-headline text-lg sm:text-xl font-medium tracking-wider text-ink">
            KENSINGTON & CO.
          </span>
          <span className="text-[10px] tracking-widest text-muted uppercase font-sans -mt-1">
            Private Residences
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-brass font-semibold' : 'text-ink/80 hover:text-ink'
            }`}
          >
            Properties
          </Link>
          <Link
            href="/favorites"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/favorites') ? 'text-brass font-semibold' : 'text-ink/80 hover:text-ink'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved</span>
          </Link>
          <Link
            href="/viewings"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/viewings') ? 'text-brass font-semibold' : 'text-ink/80 hover:text-ink'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Viewings</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-stone-dim">
              <span className="text-xs text-muted font-sans font-medium">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-xs text-muted hover:text-ink transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 pl-3 border-l border-stone-dim">
              <Link
                href="/login"
                className="text-xs font-medium text-ink/80 hover:text-ink"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-medium px-3 py-1.5 rounded-sm bg-ink text-white hover:bg-ink/90 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Role switcher link if agent/admin */}
          {user && (user.role === 'agent' || user.role === 'admin') && (
            <Link
              href={user.role === 'admin' ? '/admin' : '/agent/queue'}
              className="text-xs px-2.5 py-1 rounded bg-stone text-ink font-medium hover:bg-stone-dim transition-colors"
            >
              Staff Portal
            </Link>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <span className="text-xs text-muted truncate max-w-[120px]">
              {user.name.split(' ')[0]}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink hover:text-brass"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-dim bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 py-2 text-sm font-medium ${
              isActive('/') ? 'text-brass font-semibold' : 'text-ink'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Properties</span>
          </Link>
          <Link
            href="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 py-2 text-sm font-medium ${
              isActive('/favorites') ? 'text-brass font-semibold' : 'text-ink'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Properties</span>
          </Link>
          <Link
            href="/viewings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 py-2 text-sm font-medium ${
              isActive('/viewings') ? 'text-brass font-semibold' : 'text-ink'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Viewings</span>
          </Link>

          {user && (user.role === 'agent' || user.role === 'admin') && (
            <Link
              href={user.role === 'admin' ? '/admin' : '/agent/queue'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-brass"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Go to Staff Portal ({user.role})</span>
            </Link>
          )}

          <div className="pt-3 border-t border-stone-dim flex items-center justify-between">
            {user ? (
              <>
                <span className="text-xs text-muted">{user.email}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-red-600 flex items-center gap-1 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="w-full flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium border border-stone-dim rounded text-ink"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium bg-ink text-white rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
