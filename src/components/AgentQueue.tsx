import React, { useState } from 'react';
import { useAppStore } from '../store/useStore';
import { LiveMap } from './LiveMap';
import { Viewing } from '../types';
import {
  Clock,
  MapPin,
  User as UserIcon,
  Check,
  X,
  Calendar,
  Navigation,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

export const AgentQueue: React.FC = () => {
  const { currentUser, viewings, listings, users, updateViewingStatus } = useAppStore();

  const [rescheduleModalViewing, setRescheduleModalViewing] = useState<Viewing | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');

  const [completeModalViewing, setCompleteModalViewing] = useState<Viewing | null>(null);
  const [completeNote, setCompleteNote] = useState('');

  // Filter viewings assigned to current agent, or show all if admin
  const agentViewings =
    currentUser.role === 'admin'
      ? viewings
      : viewings.filter((v) => v.agent_id === currentUser.id);

  // Partition into 4 standard columns
  const requested = agentViewings.filter((v) => v.status === 'requested');
  const accepted = agentViewings.filter((v) => v.status === 'accepted');
  const enRoute = agentViewings.filter(
    (v) => v.status === 'en_route' || v.status === 'arrived'
  );
  const completed = agentViewings.filter(
    (v) =>
      v.status === 'completed' ||
      v.status === 'declined' ||
      v.status === 'cancelled'
  );

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalViewing || !newDateTime) return;

    updateViewingStatus(
      rescheduleModalViewing.id,
      'requested',
      `Agent Reschedule Proposal: Suggested ${newDateTime}. Note: ${rescheduleNote}`
    );

    setRescheduleModalViewing(null);
    setNewDateTime('');
    setRescheduleNote('');
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalViewing) return;

    updateViewingStatus(
      completeModalViewing.id,
      'completed',
      completeNote.trim() ? `Agent Concluding Notes: ${completeNote.trim()}` : undefined
    );

    setCompleteModalViewing(null);
    setCompleteNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Agent Viewing Queue</h1>
          <p className="text-xs font-mono text-muted mt-1">
            4-Column Operational Pipeline • {currentUser.name}
            {currentUser.role === 'admin' && ' (Viewing Agency-Wide Queue)'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-mono text-ink">
            Active: <b>{requested.length + accepted.length + enRoute.length}</b>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-live">
            En Route: <b>{enRoute.length}</b>
          </div>
        </div>
      </div>

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* 1. REQUESTED */}
        <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-300">
            <span className="font-serif font-bold text-sm text-ink flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Requested
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold">
              {requested.length}
            </span>
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto max-h-[72vh]">
            {requested.map((v) => {
              const listing = listings.find((l) => l.id === v.listing_id);
              const buyer = users.find((u) => u.id === v.buyer_id);
              if (!listing) return null;

              return (
                <div
                  key={v.id}
                  className="bg-paper p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow transition space-y-3"
                >
                  <div>
                    <div className="text-[10px] font-mono text-muted mb-0.5">
                      {listing.city} • {listing.address}
                    </div>
                    <div className="font-serif font-bold text-sm text-ink line-clamp-1">
                      {listing.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-700 pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1 font-semibold">
                      <UserIcon className="w-3.5 h-3.5 text-brass" />
                      {buyer?.name || 'Client'}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {format(new Date(v.requested_time), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  {buyer && (
                    <div className="flex gap-2 text-[11px] text-muted">
                      {buyer.phone && (
                        <a
                          href={`tel:${buyer.phone}`}
                          className="hover:text-ink flex items-center gap-0.5"
                        >
                          <Phone className="w-3 h-3 text-brass" /> Call
                        </a>
                      )}
                      {buyer.email && (
                        <a
                          href={`mailto:${buyer.email}`}
                          className="hover:text-ink flex items-center gap-0.5"
                        >
                          <Mail className="w-3 h-3 text-brass" /> Email
                        </a>
                      )}
                    </div>
                  )}

                  {v.notes && (
                    <div className="p-2 bg-stone-50 rounded text-[11px] text-stone-600 line-clamp-2">
                      {v.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    <button
                      onClick={() => updateViewingStatus(v.id, 'accepted')}
                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                      title="Accept Viewing"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>

                    <button
                      onClick={() => setRescheduleModalViewing(v)}
                      className="py-1.5 px-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                      title="Propose Alternative Time"
                    >
                      Reschedule
                    </button>

                    <button
                      onClick={() => updateViewingStatus(v.id, 'declined')}
                      className="py-1.5 px-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition"
                      title="Decline Request"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              );
            })}

            {requested.length === 0 && (
              <div className="text-center py-10 text-xs text-muted">
                No viewing requests pending confirmation
              </div>
            )}
          </div>
        </div>

        {/* 2. ACCEPTED */}
        <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-300">
            <span className="font-serif font-bold text-sm text-ink flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Accepted (Awaiting Transit)
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold">
              {accepted.length}
            </span>
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto max-h-[72vh]">
            {accepted.map((v) => {
              const listing = listings.find((l) => l.id === v.listing_id);
              const buyer = users.find((u) => u.id === v.buyer_id);
              if (!listing) return null;

              return (
                <div
                  key={v.id}
                  className="bg-paper p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow transition space-y-3"
                >
                  <div>
                    <div className="text-[10px] font-mono text-muted mb-0.5">
                      {listing.city} • {listing.address}
                    </div>
                    <div className="font-serif font-bold text-sm text-ink line-clamp-1">
                      {listing.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-700 pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1 font-semibold">
                      <UserIcon className="w-3.5 h-3.5 text-brass" />
                      {buyer?.name || 'Client'}
                    </span>
                    <span className="font-mono text-[11px] text-sky-800 font-medium">
                      {format(new Date(v.requested_time), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Waiting for buyer to press "I'm on my way"
                  </div>

                  <button
                    onClick={() => updateViewingStatus(v.id, 'en_route')}
                    className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition border border-stone-300"
                  >
                    <Navigation className="w-3.5 h-3.5 text-brass" />
                    Simulate Buyer Starting Transit
                  </button>
                </div>
              );
            })}

            {accepted.length === 0 && (
              <div className="text-center py-10 text-xs text-muted">
                No confirmed appointments awaiting transit
              </div>
            )}
          </div>
        </div>

        {/* 3. EN ROUTE (EXPANDED LIVE MAPS) */}
        <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200 flex flex-col md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-300">
            <span className="font-serif font-bold text-sm text-ink flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-live animate-ping" />
              En Route (Live Radar)
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-live/20 text-live font-bold">
              {enRoute.length}
            </span>
          </div>

          <div className="space-y-5 flex-grow overflow-y-auto max-h-[72vh]">
            {enRoute.map((v) => {
              const listing = listings.find((l) => l.id === v.listing_id);
              const buyer = users.find((u) => u.id === v.buyer_id);
              if (!listing) return null;

              const isArrived = v.status === 'arrived';

              return (
                <div
                  key={v.id}
                  className="bg-paper p-4 rounded-xl border border-live/40 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-muted">
                        {listing.city} • {listing.address}
                      </div>
                      <div className="font-serif font-bold text-sm text-ink">
                        {listing.title}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isArrived
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-live/15 text-live animate-pulse'
                      }`}
                    >
                      {isArrived ? 'ARRIVED' : 'IN TRANSIT'}
                    </span>
                  </div>

                  {/* HUD Distance & ETA */}
                  {v.current_location && !isArrived && (
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-center font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-muted uppercase">Distance</div>
                        <div className="font-bold text-brass">
                          {v.current_location.distance_km} km
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted uppercase">Est. Arrival</div>
                        <div className="font-bold text-live">
                          ~{v.current_location.eta_minutes} mins
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expandable Live Leaflet Map */}
                  <LiveMap
                    viewingId={v.id}
                    propertyLat={listing.latitude}
                    propertyLng={listing.longitude}
                    propertyTitle={listing.title}
                    buyerLat={v.current_location?.latitude}
                    buyerLng={v.current_location?.longitude}
                    buyerName={buyer?.name || 'Buyer'}
                    heightClass="h-56"
                  />

                  {/* Complete / Confirm Arrival Controls */}
                  <div className="flex gap-2 pt-2">
                    {!isArrived && (
                      <button
                        onClick={() => updateViewingStatus(v.id, 'arrived')}
                        className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-stone-300"
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm Arrival
                      </button>
                    )}

                    <button
                      onClick={() => setCompleteModalViewing(v)}
                      className="flex-1 py-2 px-3 bg-ink hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-brass" /> Complete Tour
                    </button>
                  </div>
                </div>
              );
            })}

            {enRoute.length === 0 && (
              <div className="text-center py-10 text-xs text-muted">
                No buyers currently en route to viewings
              </div>
            )}
          </div>
        </div>

        {/* 4. COMPLETED */}
        <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-300">
            <span className="font-serif font-bold text-sm text-ink flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              Completed
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold">
              {completed.length}
            </span>
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto max-h-[72vh]">
            {completed.map((v) => {
              const listing = listings.find((l) => l.id === v.listing_id);
              const buyer = users.find((u) => u.id === v.buyer_id);
              if (!listing) return null;

              return (
                <div
                  key={v.id}
                  className="bg-paper p-4 rounded-xl border border-stone-200 opacity-80 hover:opacity-100 transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-serif font-bold text-ink line-clamp-1">
                      {listing.title}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 capitalize">
                      {v.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted">
                    Client: <b>{buyer?.name || 'Private Client'}</b>
                  </div>

                  {v.notes && (
                    <div className="p-2 bg-stone-50 rounded text-[11px] text-stone-600 line-clamp-3">
                      {v.notes}
                    </div>
                  )}
                </div>
              );
            })}

            {completed.length === 0 && (
              <div className="text-center py-10 text-xs text-muted">
                No concluded viewing records
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalViewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm">
          <div className="bg-paper rounded-2xl max-w-md w-full p-6 border border-stone-300 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-ink mb-4">
              Propose New Appointment Time
            </h3>
            <form onSubmit={handleProposeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-1 uppercase">
                  Proposed Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newDateTime}
                  onChange={(e) => setNewDateTime(e.target.value)}
                  required
                  className="w-full text-xs font-mono p-2.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:border-brass"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1 uppercase">
                  Reschedule Explanation (Sent to Client)
                </label>
                <textarea
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="e.g. Due to prior diplomatic viewing, 4:00 PM is available..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:border-brass"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalViewing(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brass hover:bg-brass-hover text-ink font-serif font-bold text-xs"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {completeModalViewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm">
          <div className="bg-paper rounded-2xl max-w-md w-full p-6 border border-stone-300 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-ink mb-4">
              Conclude Property Tour
            </h3>
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-1 uppercase">
                  Viewing Feedback & Buyer Interest
                </label>
                <textarea
                  value={completeNote}
                  onChange={(e) => setCompleteNote(e.target.value)}
                  placeholder="e.g. Client requested secondary architect inspection; interest level high..."
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:border-brass"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalViewing(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-ink hover:bg-stone-800 text-white font-serif font-bold text-xs"
                >
                  Archive as Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
