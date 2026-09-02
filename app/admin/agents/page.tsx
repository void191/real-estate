'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/navigation/AdminNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { Plus, Users, Phone, Mail, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAgentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
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
      }
    }
  }, [user, authLoading]);

  const toggleAgentActive = async (agent: any) => {
    const nextState = !agent.is_active;
    const confirmMsg = nextState
      ? `Reactivate account for ${agent.name}?`
      : `Deactivate account for ${agent.name}? They will no longer be able to log in.`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      });

      if (res.ok) {
        setAgents((prev) =>
          prev.map((a) => (a.id === agent.id ? { ...a, is_active: nextState } : a))
        );
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update agent status');
      }
    } catch {
      alert('Error updating agent');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create agent');
      }

      setIsModalOpen(false);
      fetchAgents();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone/10 text-ink pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-dim/80 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
              Human Resources & Governance
            </span>
            <h1 className="font-headline text-2xl sm:text-3xl font-medium text-ink">
              Agency Consultant Roster
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Manage licensed viewing coordinators, credentials, and activation states.
            </p>
          </div>

          <button
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: 'password123',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              });
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg bg-ink text-white hover:bg-ink/90 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-brass" />
            <span>Appoint New Agent</span>
          </button>
        </div>

        {/* Agents Grid / Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-muted animate-pulse">
              Loading agent roster...
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className={`bg-white rounded-xl border p-6 shadow-sm space-y-4 transition-all ${
                  agent.is_active ? 'border-stone' : 'border-stone-dim/50 opacity-60 bg-stone/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {agent.avatar_url ? (
                      <img
                        src={agent.avatar_url}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-dim"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-stone flex items-center justify-center font-bold text-ink">
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-headline text-lg font-medium text-ink">
                        {agent.name}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-brass font-semibold">
                        Property Consultant
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                      agent.is_active
                        ? 'bg-live/20 text-live'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {agent.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted pt-2 border-t border-stone-dim/50">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-brass" />
                    <span className="font-mono text-ink/90 truncate">{agent.email}</span>
                  </div>
                  {agent.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brass" />
                      <span className="font-mono text-ink/90">{agent.phone}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-dim/50 text-xs">
                  <div className="p-2 rounded bg-stone/20 text-center">
                    <div className="font-headline text-base font-semibold text-ink">
                      {agent._count?.listings || 0}
                    </div>
                    <div className="text-[10px] text-muted uppercase">Listings</div>
                  </div>
                  <div className="p-2 rounded bg-stone/20 text-center">
                    <div className="font-headline text-base font-semibold text-ink">
                      {agent._count?.agent_viewings || 0}
                    </div>
                    <div className="text-[10px] text-muted uppercase">Viewings</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-dim/50 flex justify-end">
                  <button
                    onClick={() => toggleAgentActive(agent)}
                    className={`text-xs font-semibold py-1.5 px-3 rounded transition-colors ${
                      agent.is_active
                        ? 'border border-red-200 text-red-700 hover:bg-red-50'
                        : 'bg-live text-white hover:bg-live/90'
                    }`}
                  >
                    {agent.is_active ? 'Deactivate Agent' : 'Reactivate Agent'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Appoint Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-stone relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-muted hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
                  New Appointment
                </span>
                <h3 className="font-headline text-2xl font-medium text-ink mt-0.5">
                  Appoint Agency Agent
                </h3>
              </div>

              {formError && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-ink mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    placeholder="e.g. Arabella Sterling"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Agency Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    placeholder="arabella@agency.com"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Direct Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    placeholder="+44 20 7946 0113"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Portrait Avatar URL</label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-dim flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded border border-stone-dim text-ink hover:bg-stone/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded bg-ink text-white hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Appoint Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
