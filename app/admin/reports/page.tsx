'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/navigation/AdminNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { BarChart3, TrendingUp, Clock, Heart, Eye, CheckCircle2, UserCheck } from 'lucide-react';

export default function AdminReportsPage() {
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

  if (isLoading || !reports) {
    return (
      <div className="min-h-screen bg-stone/10">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted animate-pulse">
          Synthesizing operational reports from database...
        </div>
      </div>
    );
  }

  const { viewing_performance, listing_performance, agent_activity } = reports;

  return (
    <div className="min-h-screen bg-stone/10 text-ink pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="pb-4 border-b border-stone-dim/80">
          <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
            Analytics & Intelligence
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-medium text-ink">
            Agency Performance Reports
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time conversion, response times, listing engagement, and consultant productivity.
          </p>
        </div>

        {/* 1. VIEWING PERFORMANCE (Section 20) */}
        <section className="bg-white rounded-xl border border-stone p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brass" />
            <h2 className="font-headline text-xl font-medium text-ink">
              Viewing Conversion & Completion Metrics
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-stone/20 border border-stone-dim/60">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                Total Viewing Requests
              </div>
              <div className="font-headline text-3xl font-bold text-ink mt-1">
                {viewing_performance.total_viewings}
              </div>
              <div className="text-[11px] text-muted mt-0.5 font-mono">
                {viewing_performance.requested} pending confirmation
              </div>
            </div>

            <div className="p-4 rounded-lg bg-live/10 border border-live/30">
              <div className="text-[10px] uppercase tracking-wider text-live font-semibold">
                Completed Viewings
              </div>
              <div className="font-headline text-3xl font-bold text-live mt-1">
                {viewing_performance.completed}
              </div>
              <div className="text-[11px] text-muted mt-0.5 font-mono">
                Successfully executed appointments
              </div>
            </div>

            <div className="p-4 rounded-lg bg-brass/10 border border-brass/30">
              <div className="text-[10px] uppercase tracking-wider text-brass font-semibold">
                Conversion / Completion Rate
              </div>
              <div className="font-headline text-3xl font-bold text-brass mt-1">
                {viewing_performance.completion_rate_percent}%
              </div>
              <div className="text-[11px] text-muted mt-0.5 font-mono">
                Requested to completed ratio
              </div>
            </div>

            <div className="p-4 rounded-lg bg-stone/20 border border-stone-dim/60">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                Declined / Cancelled
              </div>
              <div className="font-headline text-3xl font-bold text-ink mt-1">
                {viewing_performance.declined + viewing_performance.cancelled}
              </div>
              <div className="text-[11px] text-muted mt-0.5 font-mono">
                {viewing_performance.declined} declined • {viewing_performance.cancelled} cancelled
              </div>
            </div>
          </div>

          {/* Average response time per agent */}
          <div className="pt-4 border-t border-stone-dim/50 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-ink flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brass" />
              Average Agent Response Time (Request to Confirmation)
            </h3>

            {viewing_performance.agent_response_times.length === 0 ? (
              <div className="text-xs text-muted py-2">No historical responses logged yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {viewing_performance.agent_response_times.map((item: any) => (
                  <div
                    key={item.agent_id}
                    className="p-3.5 rounded-lg border border-stone-dim bg-stone/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-ink">{item.agent_name}</div>
                      <div className="text-[10px] text-muted font-mono">
                        {item.viewings_responded} requests processed
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-brass">
                        {item.avg_response_minutes < 60
                          ? `${item.avg_response_minutes} mins`
                          : `${Math.round(item.avg_response_minutes / 60)} hrs`}
                      </div>
                      <div className="text-[10px] text-muted font-sans">Avg turnaround</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 2. LISTING PERFORMANCE (Section 20) */}
        <section className="bg-white rounded-xl border border-stone p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brass" />
            <h2 className="font-headline text-xl font-medium text-ink">
              Listing Engagement & Demand Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone/30 border-b border-stone-dim text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Residence</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Assigned Agent</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Client Favorites</th>
                  <th className="py-2.5 px-3 text-right">Viewing Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-dim/50">
                {listing_performance.map((lp: any) => (
                  <tr key={lp.id} className="hover:bg-stone/10">
                    <td className="py-3 px-3">
                      <div className="font-headline text-sm font-medium text-ink">{lp.title}</div>
                      <div className="text-[11px] text-muted">{lp.address}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-ink font-semibold">
                      £{lp.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-medium text-ink">{lp.agent_name}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone text-ink">
                        {lp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-brass">
                      {lp.favorite_count} saves
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                      {lp.viewing_count} viewings
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. AGENT ACTIVITY (Section 20) */}
        <section className="bg-white rounded-xl border border-stone p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brass" />
            <h2 className="font-headline text-xl font-medium text-ink">
              Agent Activity & Viewing Conversion
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone/30 border-b border-stone-dim text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Property Consultant</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Active Listings</th>
                  <th className="py-2.5 px-3 text-center">Assigned Viewings</th>
                  <th className="py-2.5 px-3 text-center">Confirmed / En Route</th>
                  <th className="py-2.5 px-3 text-center">Completed</th>
                  <th className="py-2.5 px-3 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-dim/50">
                {agent_activity.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-stone/10">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-ink">{agent.name}</div>
                      <div className="text-[10px] text-muted font-mono">{agent.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                          agent.is_active ? 'bg-live/20 text-live' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{agent.active_listings}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-ink">
                      {agent.total_viewings}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-brass">
                      {agent.accepted_viewings}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-live font-semibold">
                      {agent.completed_viewings}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-brass">
                      {agent.conversion_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
