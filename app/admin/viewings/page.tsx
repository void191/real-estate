'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/navigation/AdminNav';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Filter,
  Check,
  X,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminViewingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [viewings, setViewings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchViewings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterAgent) params.set('agent_id', filterAgent);
      if (filterStatus) params.set('status', filterStatus);
      if (filterDate) params.set('date', filterDate);

      const res = await fetch(`/api/admin/viewings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setViewings(data.viewings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/agent/login');
      } else if (user.role !== 'admin') {
        router.push('/agent/queue');
      } else {
        fetchAgents();
        fetchViewings();
      }
    }
  }, [user, authLoading, filterAgent, filterStatus, filterDate]);

  // Admin action execution
  const handleUpdateStatus = async (viewingId: string, status: string) => {
    try {
      const res = await fetch(`/api/agent/viewings/${viewingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchViewings();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch {
      alert('Error updating status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-stone text-ink font-semibold uppercase">
            Requested
          </span>
        );
      case 'accepted':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-brass/20 text-brass font-semibold uppercase">
            Accepted
          </span>
        );
      case 'en_route':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-live/20 text-live font-semibold uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-live animate-ping" />
            En Route
          </span>
        );
      case 'arrived':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-live/20 text-live font-semibold uppercase">
            Arrived
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-dim text-muted font-semibold uppercase">
            Completed
          </span>
        );
      case 'declined':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold uppercase">
            Declined
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded bg-stone text-muted font-semibold uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone/10 text-ink pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-dim/80 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
              Agency Operations
            </span>
            <h1 className="font-headline text-2xl sm:text-3xl font-medium text-ink">
              Agency Viewing Queue
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Inspect and oversee appointments across all assigned agents.
            </p>
          </div>
        </div>

        {/* Filters Bar: Agent | Status | Date */}
        <div className="bg-white p-4 rounded-xl border border-stone shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">
              Filter By Agent
            </label>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="w-full text-xs bg-stone/20 border border-stone-dim rounded px-2.5 py-2 text-ink focus:outline-none focus:border-brass"
            >
              <option value="">All Agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">
              Filter By Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs bg-stone/20 border border-stone-dim rounded px-2.5 py-2 text-ink focus:outline-none focus:border-brass"
            >
              <option value="">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="accepted">Accepted</option>
              <option value="en_route">En Route</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">
              Filter By Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full text-xs bg-stone/20 border border-stone-dim rounded px-2.5 py-2 text-ink focus:outline-none focus:border-brass"
            />
          </div>

          <div>
            <button
              onClick={() => {
                setFilterAgent('');
                setFilterStatus('');
                setFilterDate('');
              }}
              className="w-full text-xs font-semibold py-2 px-3 border border-stone-dim rounded bg-stone/30 hover:bg-stone text-ink flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Viewings Table */}
        <div className="bg-white rounded-xl border border-stone shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone/30 border-b border-stone-dim text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Client / Buyer</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Scheduled Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-dim/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted animate-pulse">
                      Loading viewing records...
                    </td>
                  </tr>
                ) : viewings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      No viewing appointments match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  viewings.map((v) => (
                    <tr key={v.id} className="hover:bg-stone/10 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-headline text-sm font-medium text-ink">
                          {v.listing.title}
                        </div>
                        <div className="text-[11px] text-muted line-clamp-1">{v.listing.address}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink">{v.buyer.name}</div>
                        <div className="text-[11px] text-muted font-mono">{v.buyer.phone || v.buyer.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {v.agent.avatar_url && (
                            <img
                              src={v.agent.avatar_url}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="font-medium text-ink">{v.agent.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-ink/90">
                        {format(new Date(v.requested_time), 'EEE, d MMM yyyy • HH:mm')}
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(v.status)}</td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        {v.status === 'requested' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(v.id, 'accepted')}
                              className="p-1.5 rounded bg-ink text-white hover:bg-ink/90"
                              title="Accept"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(v.id, 'declined')}
                              className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50"
                              title="Decline"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {v.status === 'arrived' && (
                          <button
                            onClick={() => handleUpdateStatus(v.id, 'completed')}
                            className="px-2.5 py-1 rounded bg-live text-white text-[11px] font-semibold hover:bg-live/90"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
