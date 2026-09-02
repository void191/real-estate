'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from '@/components/navigation/AdminNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { Building2, Users, Calendar, BarChart3, TrendingUp, Navigation, ArrowRight } from 'lucide-react';

export default function AdminOverviewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/agent/login');
      } else if (user.role !== 'admin') {
        router.push('/agent/queue');
      } else {
        fetch('/api/admin/reports')
          .then((res) => res.json())
          .then((data) => setReports(data))
          .catch(console.error)
          .finally(() => setIsLoading(false));
      }
    }
  }, [user, authLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone/10">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-muted animate-pulse">
          Loading agency executive dashboard...
        </div>
      </div>
    );
  }

  const viewingStats = reports?.viewing_performance || {};
  const listingStats = reports?.listing_performance || [];
  const agentStats = reports?.agent_activity || [];

  return (
    <div className="min-h-screen bg-stone/10 text-ink pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-dim/80 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
              Executive Directorate
            </span>
            <h1 className="font-headline text-2xl sm:text-3xl font-medium text-ink">
              Agency Overview
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Comprehensive operations, portfolio management, and viewing metrics.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/listings"
              className="text-xs uppercase tracking-wider font-semibold px-3.5 py-2 rounded-lg bg-ink text-white hover:bg-ink/90 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-brass" />
              <span>Manage Portfolio</span>
            </Link>
            <Link
              href="/admin/viewings"
              className="text-xs uppercase tracking-wider font-semibold px-3.5 py-2 rounded-lg border border-stone-dim bg-white text-ink hover:bg-stone/30 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-brass" />
              <span>Agency Viewings</span>
            </Link>
          </div>
        </div>

        {/* Agency Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-xl border border-stone shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span className="uppercase tracking-wider font-medium">Active Portfolio</span>
              <Building2 className="w-4 h-4 text-brass" />
            </div>
            <div className="font-headline text-3xl font-semibold text-ink">
              {listingStats.length}
            </div>
            <div className="text-[11px] text-muted">
              Prime luxury residences listed
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span className="uppercase tracking-wider font-medium">Total Viewings</span>
              <Calendar className="w-4 h-4 text-brass" />
            </div>
            <div className="font-headline text-3xl font-semibold text-ink">
              {viewingStats.total_viewings || 0}
            </div>
            <div className="text-[11px] text-live flex items-center gap-1 font-medium">
              <span>{viewingStats.active_pipeline || 0} currently active in pipeline</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span className="uppercase tracking-wider font-medium">Active Agents</span>
              <Users className="w-4 h-4 text-brass" />
            </div>
            <div className="font-headline text-3xl font-semibold text-ink">
              {agentStats.filter((a: any) => a.is_active).length}
            </div>
            <div className="text-[11px] text-muted">
              Licensed property consultants
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span className="uppercase tracking-wider font-medium">Completion Rate</span>
              <TrendingUp className="w-4 h-4 text-live" />
            </div>
            <div className="font-headline text-3xl font-semibold text-brass">
              {viewingStats.completion_rate_percent || 0}%
            </div>
            <div className="text-[11px] text-muted">
              Successful viewing conversion
            </div>
          </div>
        </div>

        {/* Viewing Pipeline Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-medium text-ink">
                Viewing Pipeline Distribution
              </h2>
              <Link
                href="/admin/viewings"
                className="text-xs text-brass font-medium hover:underline flex items-center gap-1"
              >
                <span>View All Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-stone/20 border border-stone-dim/60 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Requested
                </span>
                <div className="font-headline text-2xl font-semibold text-ink">
                  {viewingStats.requested || 0}
                </div>
                <span className="text-[11px] text-muted">Pending confirmation</span>
              </div>

              <div className="p-4 rounded-lg bg-brass/10 border border-brass/30 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-brass font-semibold">
                  Accepted
                </span>
                <div className="font-headline text-2xl font-semibold text-brass">
                  {viewingStats.accepted || 0}
                </div>
                <span className="text-[11px] text-muted">Upcoming itinerary</span>
              </div>

              <div className="p-4 rounded-lg bg-live/10 border border-live/30 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-live font-semibold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  En Route
                </span>
                <div className="font-headline text-2xl font-semibold text-live">
                  {(viewingStats.en_route || 0) + (viewingStats.arrived || 0)}
                </div>
                <span className="text-[11px] text-muted">In transit / on site</span>
              </div>

              <div className="p-4 rounded-lg bg-stone/30 border border-stone-dim/60 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Completed
                </span>
                <div className="font-headline text-2xl font-semibold text-ink">
                  {viewingStats.completed || 0}
                </div>
                <span className="text-[11px] text-muted">Concluded viewings</span>
              </div>
            </div>
          </div>

          {/* Quick Agent Roster Preview */}
          <div className="bg-white rounded-xl border border-stone p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-medium text-ink">
                Consultant Roster
              </h2>
              <Link
                href="/admin/agents"
                className="text-xs text-brass font-medium hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {agentStats.slice(0, 4).map((agent: any) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-stone/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {agent.avatar_url && (
                      <img
                        src={agent.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-dim"
                      />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-ink">{agent.name}</div>
                      <div className="text-[10px] text-muted">{agent.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-brass">
                      {agent.active_listings} listings
                    </div>
                    <div className="text-[10px] text-muted font-mono">
                      {agent.completed_viewings} completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
