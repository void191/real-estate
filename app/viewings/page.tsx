'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuyerNav } from '@/components/navigation/BuyerNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSocketClient } from '@/lib/socket-client';
import { Calendar, Clock, MapPin, User as UserIcon, Navigation, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ViewingItem {
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
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
  };
  agent: {
    id: string;
    name: string;
    avatar_url?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

export default function MyViewingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [viewings, setViewings] = useState<ViewingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchViewings = async () => {
    try {
      const res = await fetch('/api/viewings/mine');
      if (res.ok) {
        const data = await res.json();
        setViewings(data.all || []);
      }
    } catch (err) {
      console.error('Error fetching viewings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchViewings();

        // Real-time WebSocket connection for status updates
        const socket = getSocketClient();

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
        };

        socket.on('viewing:updated', handleViewingUpdate);

        return () => {
          socket.off('viewing:updated', handleViewingUpdate);
        };
      }
    }
  }, [user, authLoading]);

  const handleStartEnRoute = async (viewingId: string) => {
    setActionLoadingId(viewingId);
    try {
      const res = await fetch(`/api/viewings/${viewingId}/en-route`, {
        method: 'PATCH',
      });
      if (res.ok) {
        router.push(`/viewings/${viewingId}/en-route`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to start journey');
      }
    } catch {
      alert('Network error while initiating en-route');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: ViewingItem['status']) => {
    switch (status) {
      case 'requested':
        return (
          <span className="text-[11px] px-2.5 py-1 rounded bg-stone text-ink font-semibold uppercase tracking-wider">
            Pending Confirmation
          </span>
        );
      case 'accepted':
        return (
          <span className="text-[11px] px-2.5 py-1 rounded bg-brass/20 text-brass font-semibold uppercase tracking-wider">
            Confirmed
          </span>
        );
      case 'en_route':
        return (
          <span className="text-[11px] px-2.5 py-1 rounded bg-live/20 text-live font-semibold uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-live animate-ping" />
            En Route
          </span>
        );
      case 'arrived':
        return (
          <span className="text-[11px] px-2.5 py-1 rounded bg-live/20 text-live font-semibold uppercase tracking-wider">
            Arrived on Site
          </span>
        );
      case 'completed':
        return (
          <span className="text-[11px] px-2.5 py-1 rounded bg-stone-dim text-muted font-semibold uppercase tracking-wider">
            Completed
          </span>
        );
      case 'declined':
        return (
          <span className="text-[11px] px-2.5 py-1 rounded bg-red-100 text-red-700 font-semibold uppercase tracking-wider">
            Declined
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] px-2.5 py-1 rounded bg-stone text-muted font-semibold uppercase tracking-wider">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const upcomingViewings = viewings.filter(
    (v) =>
      v.status === 'requested' ||
      v.status === 'accepted' ||
      v.status === 'en_route' ||
      v.status === 'arrived'
  );

  const pastViewings = viewings.filter(
    (v) =>
      v.status === 'completed' ||
      v.status === 'declined' ||
      v.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-white">
      <BuyerNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
            Appointments
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-medium text-ink">
            My Viewings
          </h1>
          <p className="text-xs text-muted">
            Track and coordinate scheduled property appointments with your designated agents.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 bg-stone-dim/30 rounded-xl border border-stone" />
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming Viewings Section */}
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted">
                Upcoming Viewings ({upcomingViewings.length})
              </h2>

              {upcomingViewings.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-stone-dim rounded-xl p-6 bg-stone/10">
                  <p className="text-xs text-muted">You have no upcoming viewing appointments.</p>
                  <Link
                    href="/"
                    className="inline-block mt-3 text-xs uppercase tracking-wider font-semibold text-brass hover:underline"
                  >
                    Browse available residences →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingViewings.map((viewing) => {
                    const scheduledDate = new Date(viewing.requested_time);
                    const photo =
                      viewing.listing.photos && viewing.listing.photos.length > 0
                        ? viewing.listing.photos[0]
                        : '';

                    return (
                      <div
                        key={viewing.id}
                        className="bg-white rounded-xl border border-stone p-5 sm:p-6 shadow-sm space-y-4 hover:border-stone-dim transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex gap-4">
                            {photo && (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-stone-dim shrink-0">
                                <img
                                  src={photo}
                                  alt={viewing.listing.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="space-y-1">
                              <Link
                                href={`/listings/${viewing.listing.id}`}
                                className="font-headline text-lg sm:text-xl font-medium text-ink hover:text-brass transition-colors block"
                              >
                                {viewing.listing.title}
                              </Link>
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <MapPin className="w-3.5 h-3.5 text-brass shrink-0" />
                                <span className="line-clamp-1">{viewing.listing.address}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-ink/80">
                                {viewing.agent.avatar_url && (
                                  <img
                                    src={viewing.agent.avatar_url}
                                    alt={viewing.agent.name}
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                )}
                                <span>Agent: <strong className="font-medium text-ink">{viewing.agent.name}</strong></span>
                                {viewing.agent.phone && (
                                  <a
                                    href={`tel:${viewing.agent.phone}`}
                                    className="text-brass hover:underline flex items-center gap-1 font-mono text-[11px] bg-brass/10 px-2 py-0.5 rounded"
                                    title="Call agent directly"
                                  >
                                    <span>Call: {viewing.agent.phone}</span>
                                  </a>
                                )}
                                {viewing.agent.email && (
                                  <a
                                    href={`mailto:${viewing.agent.email}`}
                                    className="text-muted hover:text-ink flex items-center gap-1 text-[11px] underline"
                                    title="Email agent"
                                  >
                                    <span>Email</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="self-start">{getStatusBadge(viewing.status)}</div>
                        </div>

                        {/* Communication / Notes from Buyer or Agent */}
                        {viewing.notes && (
                          <div className="text-xs bg-stone/20 border border-stone-dim/60 rounded-lg p-2.5 text-ink/85 flex items-start gap-2">
                            <div>
                              <span className="font-semibold text-ink">Appointment Notes & Communication: </span>
                              <span className="whitespace-pre-line">{viewing.notes}</span>
                            </div>
                          </div>
                        )}

                        {/* Scheduled time info */}
                        <div className="pt-3 border-t border-stone-dim/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-ink/90">
                            <Clock className="w-4 h-4 text-brass" />
                            <span>
                              Scheduled for{' '}
                              <strong className="font-semibold text-ink">
                                {format(scheduledDate, 'EEEE, d MMMM yyyy • HH:mm')}
                              </strong>
                            </span>
                          </div>

                          {/* ACTION: I'M ON MY WAY BUTTON */}
                          {viewing.status === 'accepted' && (
                            <button
                              onClick={() => handleStartEnRoute(viewing.id)}
                              disabled={actionLoadingId === viewing.id}
                              className="px-4 py-2 rounded-lg bg-live text-white font-sans text-xs uppercase tracking-wider font-semibold hover:bg-live/90 transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{actionLoadingId === viewing.id ? 'Connecting...' : "I'm on my way"}</span>
                            </button>
                          )}

                          {/* ACTIVE EN ROUTE TRACKING SCREEN LINK */}
                          {viewing.status === 'en_route' && (
                            <Link
                              href={`/viewings/${viewing.id}/en-route`}
                              className="px-4 py-2 rounded-lg bg-live text-white font-sans text-xs uppercase tracking-wider font-semibold hover:bg-live/90 transition-all shadow-sm flex items-center gap-1.5 animate-pulse"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Active Location Stream →</span>
                            </Link>
                          )}

                          {/* ARRIVED NOTICE */}
                          {viewing.status === 'arrived' && (
                            <span className="text-xs text-live font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Arrival confirmed on site
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Past Viewings Section */}
            {pastViewings.length > 0 && (
              <section className="space-y-4 pt-6 border-t border-stone">
                <h2 className="text-xs uppercase tracking-wider font-semibold text-muted">
                  Past & Concluded Viewings ({pastViewings.length})
                </h2>

                <div className="space-y-3">
                  {pastViewings.map((viewing) => (
                    <div
                      key={viewing.id}
                      className="bg-stone/20 rounded-xl border border-stone-dim/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 opacity-80"
                    >
                      <div>
                        <div className="font-headline text-base text-ink font-medium">
                          {viewing.listing.title}
                        </div>
                        <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                          <span>Agent: {viewing.agent.name}</span>
                          <span>•</span>
                          <span>{format(new Date(viewing.requested_time), 'd MMM yyyy')}</span>
                        </div>
                        {viewing.notes && (
                          <p className="text-xs text-ink/70 mt-1.5 italic bg-white/60 p-2 rounded border border-stone-dim/40">
                            Notes: {viewing.notes}
                          </p>
                        )}
                      </div>
                      <div>{getStatusBadge(viewing.status)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
