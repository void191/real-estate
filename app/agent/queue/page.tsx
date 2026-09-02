'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AgentNav } from '@/components/navigation/AgentNav';
import { ProposeTimeModal } from '@/components/agent/ProposeTimeModal';
import { CompleteViewingModal } from '@/components/agent/CompleteViewingModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSocketClient } from '@/lib/socket-client';
import { calculateDistanceKm, formatDistance, calculateEtaMinutes, formatEta } from '@/lib/geo';
import {
  Clock,
  MapPin,
  User as UserIcon,
  Check,
  X,
  Calendar,
  Navigation,
  CheckCircle,
  AlertTriangle,
  FileText,
  Phone,
} from 'lucide-react';
import { format } from 'date-fns';

// Dynamically import Leaflet map with no SSR
const AgentLiveMap = dynamic(() => import('@/components/agent/AgentLiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-stone/30 rounded-lg flex items-center justify-center text-xs text-muted">
      Loading satellite coordinates...
    </div>
  ),
});

interface Viewing {
  id: string;
  status: 'requested' | 'accepted' | 'declined' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  requested_time: string;
  notes?: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    price: number;
    photos: string[];
    latitude: number;
    longitude: number;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  location_pings?: Array<{ latitude: number; longitude: number; recorded_at: string }>;
}

export default function AgentQueuePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLocations, setActiveLocations] = useState<
    Record<string, { latitude: number; longitude: number; recorded_at: string } | null>
  >({});

  // Modals state
  const [proposeModalViewing, setProposeModalViewing] = useState<Viewing | null>(null);
  const [completeModalViewing, setCompleteModalViewing] = useState<Viewing | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/agent/viewings');
      if (res.ok) {
        const data = await res.json();
        setViewings(data.all || []);

        // Initialize location pings from existing records
        const initialLocs: Record<string, any> = {};
        (data.all || []).forEach((v: Viewing) => {
          if (v.location_pings && v.location_pings.length > 0) {
            initialLocs[v.id] = v.location_pings[0];
          }
        });
        setActiveLocations(initialLocs);
      }
    } catch (err) {
      console.error('Error fetching agent queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/agent/login');
      } else if (user.role !== 'agent' && user.role !== 'admin') {
        router.push('/');
      } else {
        fetchQueue();

        const socket = getSocketClient();

        // 1. Listen for real-time viewing updates (Stream A)
        const handleViewingUpdate = (updatedViewing: any) => {
          setViewings((prev) => {
            const index = prev.findIndex((v) => v.id === updatedViewing.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = { ...updated[index], ...updatedViewing };
              return updated;
            } else {
              return [updatedViewing, ...prev];
            }
          });

          // Join viewing room if now en_route
          if (updatedViewing.status === 'en_route') {
            socket.emit('join_viewing_room', { viewingId: updatedViewing.id });
          }
        };

        // 2. Listen for live location pings (Stream B)
        const handleLocationPing = (pingData: {
          viewingId: string;
          latitude: number;
          longitude: number;
          recorded_at: string;
        }) => {
          setActiveLocations((prev) => ({
            ...prev,
            [pingData.viewingId]: {
              latitude: pingData.latitude,
              longitude: pingData.longitude,
              recorded_at: pingData.recorded_at,
            },
          }));
        };

        socket.on('viewing:updated', handleViewingUpdate);
        socket.on('location:ping', handleLocationPing);

        return () => {
          socket.off('viewing:updated', handleViewingUpdate);
          socket.off('location:ping', handleLocationPing);
        };
      }
    }
  }, [user, authLoading]);

  // Join rooms for any en_route viewings currently active
  useEffect(() => {
    if (!viewings.length) return;
    const socket = getSocketClient();
    viewings.forEach((v) => {
      if (v.status === 'en_route') {
        socket.emit('join_viewing_room', { viewingId: v.id });
      }
    });
  }, [viewings]);

  // Agent Quick Actions
  const handleUpdateStatus = async (viewingId: string, status: string) => {
    setActionLoadingId(viewingId);
    try {
      const res = await fetch(`/api/agent/viewings/${viewingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update viewing status');
      } else {
        const data = await res.json();
        setViewings((prev) =>
          prev.map((v) => (v.id === viewingId ? { ...v, ...data.viewing } : v))
        );
      }
    } catch {
      alert('Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter columns
  const requestedViewings = viewings.filter((v) => v.status === 'requested');
  const acceptedViewings = viewings.filter((v) => v.status === 'accepted');
  const enRouteViewings = viewings.filter(
    (v) => v.status === 'en_route' || v.status === 'arrived'
  );
  const completedViewings = viewings.filter(
    (v) => v.status === 'completed' || v.status === 'declined' || v.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-stone/10 text-ink pb-16">
      <AgentNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-dim/80 gap-4 mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
              Live Logistics
            </span>
            <h1 className="font-headline text-2xl sm:text-3xl font-medium text-ink">
              Viewing Queue
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Appointments exclusively assigned to {user?.name}. Updates appear in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-live bg-live/10 px-3 py-1.5 rounded-full font-medium border border-live/20">
              <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
              <span>Real-time Sync Active</span>
            </div>
          </div>
        </div>

        {/* 4-Column Queue Grid: Requested | Accepted | En Route | Completed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* COLUMN 1: REQUESTED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-stone-dim">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-ink flex items-center gap-2">
                <span>Requested</span>
                <span className="px-2 py-0.5 rounded-full bg-stone text-xs font-mono">
                  {requestedViewings.length}
                </span>
              </h2>
            </div>

            {requestedViewings.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-dim rounded-lg text-xs text-muted bg-white/40">
                No pending requests
              </div>
            ) : (
              <div className="space-y-3">
                {requestedViewings.map((viewing) => (
                  <div
                    key={viewing.id}
                    className="bg-white rounded-lg border border-stone p-4 shadow-sm space-y-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-brass shrink-0" />
                        <span>{viewing.buyer.name}</span>
                      </div>
                      {viewing.buyer.phone && (
                        <div className="text-[11px] text-muted font-mono mt-0.5 ml-5">
                          {viewing.buyer.phone}
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-1 pt-2 border-t border-stone-dim/50">
                      <div className="font-headline text-sm font-medium text-ink line-clamp-1">
                        {viewing.listing.title}
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brass shrink-0" />
                        <span className="line-clamp-1">{viewing.listing.address}</span>
                      </div>
                      <div className="text-[11px] text-ink/80 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3 text-brass shrink-0" />
                        <span>
                          {format(new Date(viewing.requested_time), 'EEE, d MMM • HH:mm')}
                        </span>
                      </div>
                    </div>

                    {/* Actions for Requested: Accept | Decline | Propose Time */}
                    <div className="pt-2 border-t border-stone-dim/50 flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(viewing.id, 'accepted')}
                        disabled={actionLoadingId === viewing.id}
                        className="flex-1 py-1.5 px-2 rounded bg-ink text-white text-xs font-medium hover:bg-ink/90 transition-colors flex items-center justify-center gap-1"
                        title="Accept Viewing"
                      >
                        <Check className="w-3 h-3 text-live" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => setProposeModalViewing(viewing)}
                        className="py-1.5 px-2 rounded border border-stone-dim text-xs font-medium hover:bg-stone/30 transition-colors"
                        title="Propose New Time"
                      >
                        <Calendar className="w-3 h-3 text-brass" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(viewing.id, 'declined')}
                        disabled={actionLoadingId === viewing.id}
                        className="py-1.5 px-2 rounded border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 transition-colors"
                        title="Decline Viewing"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2: ACCEPTED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-brass">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-brass flex items-center gap-2">
                <span>Accepted</span>
                <span className="px-2 py-0.5 rounded-full bg-brass/20 text-xs font-mono">
                  {acceptedViewings.length}
                </span>
              </h2>
            </div>

            {acceptedViewings.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-dim rounded-lg text-xs text-muted bg-white/40">
                No confirmed upcoming viewings
              </div>
            ) : (
              <div className="space-y-3">
                {acceptedViewings.map((viewing) => (
                  <div
                    key={viewing.id}
                    className="bg-white rounded-lg border border-stone p-4 shadow-sm space-y-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-brass shrink-0" />
                        <span>{viewing.buyer.name}</span>
                      </div>
                      {viewing.buyer.phone && (
                        <div className="text-[11px] text-muted font-mono mt-0.5 ml-5">
                          {viewing.buyer.phone}
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-1 pt-2 border-t border-stone-dim/50">
                      <div className="font-headline text-sm font-medium text-ink line-clamp-1">
                        {viewing.listing.title}
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brass shrink-0" />
                        <span className="line-clamp-1">{viewing.listing.address}</span>
                      </div>
                      <div className="text-[11px] text-ink/80 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3 text-brass shrink-0" />
                        <span>
                          {format(new Date(viewing.requested_time), 'EEE, d MMM • HH:mm')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-dim/50 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                        Awaiting journey start
                      </span>
                      <button
                        onClick={() => handleUpdateStatus(viewing.id, 'cancelled')}
                        className="text-[11px] text-muted hover:text-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 3: EN ROUTE (EXPANDS INTO LIVE MAP) */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between pb-2 border-b-2 border-live">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-live flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-live animate-ping" />
                <span>En Route & Live</span>
                <span className="px-2 py-0.5 rounded-full bg-live/20 text-xs font-mono">
                  {enRouteViewings.length}
                </span>
              </h2>
            </div>

            {enRouteViewings.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-dim rounded-lg text-xs text-muted bg-white/40">
                No active journeys in transit
              </div>
            ) : (
              <div className="space-y-4">
                {enRouteViewings.map((viewing) => {
                  const location = activeLocations[viewing.id];
                  const hasLocation = Boolean(location && location.latitude && location.longitude);

                  let distanceKm: number | null = null;
                  let etaMins: number | null = null;

                  if (hasLocation) {
                    distanceKm = calculateDistanceKm(
                      location!.latitude,
                      location!.longitude,
                      viewing.listing.latitude,
                      viewing.listing.longitude
                    );
                    etaMins = calculateEtaMinutes(distanceKm);
                  }

                  return (
                    <div
                      key={viewing.id}
                      className="bg-white rounded-xl border-2 border-live p-4 sm:p-5 shadow-lg space-y-4 relative overflow-hidden"
                    >
                      {/* Live Badge Indicator with Live Token */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-live font-semibold uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full bg-live animate-pulse" />
                          <span>{viewing.status === 'arrived' ? 'Buyer Arrived' : 'In Transit'}</span>
                        </div>
                        <span className="text-[10px] text-muted font-mono">
                          {format(new Date(viewing.requested_time), 'HH:mm')}
                        </span>
                      </div>

                      {/* Buyer & Property Context */}
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-ink flex items-center justify-between">
                          <span>{viewing.buyer.name}</span>
                          {viewing.buyer.phone && (
                            <a
                              href={`tel:${viewing.buyer.phone}`}
                              className="text-xs text-brass flex items-center gap-1 hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span className="font-mono">{viewing.buyer.phone}</span>
                            </a>
                          )}
                        </div>
                        <div className="font-headline text-base font-medium text-ink">
                          {viewing.listing.title}
                        </div>
                        <div className="text-[11px] text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brass shrink-0" />
                          <span className="line-clamp-1">{viewing.listing.address}</span>
                        </div>
                      </div>

                      {/* JetBrains Mono Data Readouts: Distance & ETA (Section 26 & 16) */}
                      {hasLocation ? (
                        <div className="grid grid-cols-2 gap-2 p-3 bg-stone/20 rounded-lg border border-stone-dim/60 font-mono text-xs">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted font-sans font-medium">
                              Distance
                            </div>
                            <div className="text-sm font-bold text-ink mt-0.5">
                              {formatDistance(distanceKm!)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted font-sans font-medium">
                              Est. Arrival
                            </div>
                            <div className="text-sm font-bold text-live mt-0.5">
                              {formatEta(etaMins!)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Section 11: Location Denied Notice */
                        <div className="p-3 bg-stone/30 border border-stone-dim rounded-lg text-xs text-muted flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Buyer has not shared live location.</span>
                        </div>
                      )}

                      {/* EXPANDED LIVE MAP (Section 16: ONLY on En Route Card) */}
                      <div className="pt-1">
                        <AgentLiveMap
                          propertyCoords={{
                            latitude: viewing.listing.latitude,
                            longitude: viewing.listing.longitude,
                            title: viewing.listing.title,
                          }}
                          buyerCoords={hasLocation ? { latitude: location!.latitude, longitude: location!.longitude } : null}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-stone-dim/60 flex flex-col gap-2">
                        {viewing.status === 'en_route' && (
                          <button
                            onClick={() => handleUpdateStatus(viewing.id, 'arrived')}
                            disabled={actionLoadingId === viewing.id}
                            className="w-full py-2 px-3 rounded-lg border border-stone-dim text-xs font-semibold hover:bg-stone/30 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-muted" />
                            <span>Mark Arrived (Fallback)</span>
                          </button>
                        )}

                        {/* When arrived, can complete */}
                        {viewing.status === 'arrived' && (
                          <button
                            onClick={() => setCompleteModalViewing(viewing)}
                            className="w-full py-2.5 px-3 rounded-lg bg-live text-white text-xs uppercase tracking-wider font-semibold hover:bg-live/90 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Complete Viewing</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMN 4: COMPLETED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-stone-dim">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted flex items-center gap-2">
                <span>Completed</span>
                <span className="px-2 py-0.5 rounded-full bg-stone text-xs font-mono">
                  {completedViewings.length}
                </span>
              </h2>
            </div>

            {completedViewings.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-dim rounded-lg text-xs text-muted bg-white/40">
                No past viewing records
              </div>
            ) : (
              <div className="space-y-3">
                {completedViewings.map((viewing) => (
                  <div
                    key={viewing.id}
                    className="bg-white/80 rounded-lg border border-stone p-4 shadow-sm space-y-2 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">{viewing.buyer.name}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-dim text-muted">
                        {viewing.status}
                      </span>
                    </div>

                    <div className="font-headline text-sm font-medium text-ink line-clamp-1">
                      {viewing.listing.title}
                    </div>

                    <div className="text-[11px] text-muted">
                      {format(new Date(viewing.requested_time), 'd MMM yyyy • HH:mm')}
                    </div>

                    {viewing.notes && (
                      <div className="pt-2 border-t border-stone-dim/40 text-[11px] text-ink/80 italic bg-stone/20 p-2 rounded">
                        <FileText className="w-3 h-3 inline mr-1 text-muted" />
                        {viewing.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Propose Time Modal */}
      {proposeModalViewing && (
        <ProposeTimeModal
          viewingId={proposeModalViewing.id}
          buyerName={proposeModalViewing.buyer.name}
          listingTitle={proposeModalViewing.listing.title}
          currentRequestedTime={proposeModalViewing.requested_time}
          isOpen={Boolean(proposeModalViewing)}
          onClose={() => setProposeModalViewing(null)}
          onSuccess={(updated) => {
            setViewings((prev) =>
              prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v))
            );
          }}
        />
      )}

      {/* Complete Viewing Modal */}
      {completeModalViewing && (
        <CompleteViewingModal
          viewingId={completeModalViewing.id}
          buyerName={completeModalViewing.buyer.name}
          listingTitle={completeModalViewing.listing.title}
          isOpen={Boolean(completeModalViewing)}
          onClose={() => setCompleteModalViewing(null)}
          onSuccess={(updated) => {
            setViewings((prev) =>
              prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v))
            );
          }}
        />
      )}
    </div>
  );
}
