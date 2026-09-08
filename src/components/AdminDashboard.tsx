import React, { useState } from 'react';
import { useAppStore } from '../store/useStore';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Building,
  ShieldCheck,
  Calendar,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const { viewings, listings, users } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const total = viewings.length;
  const completed = viewings.filter((v) => v.status === 'completed').length;
  const activePipeline = viewings.filter(
    (v) =>
      v.status === 'requested' ||
      v.status === 'accepted' ||
      v.status === 'en_route' ||
      v.status === 'arrived'
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const agents = users.filter((u) => u.role === 'agent');

  const filteredViewings =
    statusFilter === 'all'
      ? viewings
      : viewings.filter((v) => v.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Agency Governance & Analytics</h1>
        <p className="text-xs font-mono text-muted mt-1">
          Executive Portfolio Oversight • Eleanor Kensington
        </p>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-paper p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-muted uppercase">Total Viewings</div>
            <div className="font-serif font-bold text-3xl text-ink mt-1">{total}</div>
            <div className="text-[11px] text-stone-500 mt-1">All Recorded Tours</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-brass flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-muted uppercase">Active Pipeline</div>
            <div className="font-serif font-bold text-3xl text-live mt-1">{activePipeline}</div>
            <div className="text-[11px] text-live/80 mt-1">Live in Queue</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-live/10 text-live flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-muted uppercase">Completion Rate</div>
            <div className="font-serif font-bold text-3xl text-ink mt-1">{completionRate}%</div>
            <div className="text-[11px] text-stone-500 mt-1">{completed} Concluded Tours</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-brass flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-paper p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-muted uppercase">Active Brokers</div>
            <div className="font-serif font-bold text-3xl text-ink mt-1">{agents.length}</div>
            <div className="text-[11px] text-stone-500 mt-1">Erbil & London Roster</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-brass flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Agency Viewing Queue Table */}
      <div className="bg-paper rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Agency-Wide Viewing Roster
            </h2>
            <p className="text-xs text-muted">Real-time status across all brokers</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:border-brass cursor-pointer"
            >
              <option value="all">All Statuses ({total})</option>
              <option value="requested">Requested</option>
              <option value="accepted">Accepted</option>
              <option value="en_route">En Route</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/75 text-stone-600 font-mono uppercase text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-6">Residence</th>
                <th className="py-3 px-6">Client</th>
                <th className="py-3 px-6">Assigned Broker</th>
                <th className="py-3 px-6">Appointment Time</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredViewings.map((v) => {
                const listing = listings.find((l) => l.id === v.listing_id);
                const buyer = users.find((u) => u.id === v.buyer_id);
                const agent = users.find((u) => u.id === v.agent_id);

                return (
                  <tr key={v.id} className="hover:bg-stone-50 transition">
                    <td className="py-4 px-6 font-medium text-ink">
                      <div>{listing?.title || 'Unknown Property'}</div>
                      <div className="text-[10px] font-mono text-muted">{listing?.address}</div>
                    </td>
                    <td className="py-4 px-6 text-stone-700">
                      <div>{buyer?.name || 'Private Client'}</div>
                      <div className="text-[10px] text-muted">{buyer?.email}</div>
                    </td>
                    <td className="py-4 px-6 text-stone-700">
                      <div className="font-medium text-ink">{agent?.name || 'Unassigned'}</div>
                      <div className="text-[10px] text-muted">{agent?.phone}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-stone-700">
                      {format(new Date(v.requested_time), 'MMM d, yyyy • h:mm a')}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold capitalize ${
                          v.status === 'en_route'
                            ? 'bg-live/15 text-live animate-pulse'
                            : v.status === 'accepted'
                            ? 'bg-sky-100 text-sky-800'
                            : v.status === 'requested'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broker Roster */}
      <div className="bg-paper rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="font-serif text-xl font-bold text-ink">Licensed Broker Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const agentListingCount = listings.filter((l) => l.agent_id === agent.id).length;
            const agentViewingCount = viewings.filter((v) => v.agent_id === agent.id).length;

            return (
              <div
                key={agent.id}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center space-x-3"
              >
                <img
                  src={agent.avatar_url || ''}
                  alt={agent.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brass flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="font-serif font-bold text-sm text-ink truncate">{agent.name}</div>
                  <div className="text-[11px] text-muted truncate">{agent.email}</div>
                  <div className="text-[10px] font-mono text-brass mt-1">
                    {agentListingCount} Listings • {agentViewingCount} Tours
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
