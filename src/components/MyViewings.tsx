import React, { useState } from 'react';
import { useAppStore } from '../store/useStore';
import { LiveMap } from './LiveMap';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  XCircle,
  Check,
  Building,
} from 'lucide-react';
import { format } from 'date-fns';

export const MyViewings: React.FC = () => {
  const { currentUser, viewings, listings, users, updateViewingStatus } = useAppStore();
  const [subTab, setSubTab] = useState<'upcoming' | 'past'>('upcoming');

  const myViewings = viewings.filter((v) => v.buyer_id === currentUser.id);

  const upcomingViewings = myViewings.filter(
    (v) =>
      v.status === 'requested' ||
      v.status === 'accepted' ||
      v.status === 'en_route' ||
      v.status === 'arrived'
  );

  const pastViewings = myViewings.filter(
    (v) =>
      v.status === 'completed' ||
      v.status === 'declined' ||
      v.status === 'cancelled'
  );

  const displayed = subTab === 'upcoming' ? upcomingViewings : pastViewings;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Sub-Tabs */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">My Private Viewings</h1>
          <p className="text-xs font-mono text-muted mt-1">
            Appointments & live GPS tracking for {currentUser.name}
          </p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setSubTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              subTab === 'upcoming'
                ? 'bg-paper text-ink shadow font-semibold'
                : 'text-stone-600 hover:text-ink'
            }`}
          >
            Upcoming ({upcomingViewings.length})
          </button>
          <button
            onClick={() => setSubTab('past')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              subTab === 'past'
                ? 'bg-paper text-ink shadow font-semibold'
                : 'text-stone-600 hover:text-ink'
            }`}
          >
            Past History ({pastViewings.length})
          </button>
        </div>
      </div>

      {/* Viewing Cards List */}
      <div className="space-y-6">
        {displayed.map((viewing) => {
          const listing = listings.find((l) => l.id === viewing.listing_id);
          const agent = users.find((u) => u.id === viewing.agent_id);

          if (!listing) return null;

          const isEnRoute = viewing.status === 'en_route';

          return (
            <div
              key={viewing.id}
              className={`bg-paper rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${
                isEnRoute
                  ? 'border-live/60 ring-2 ring-live/20 shadow-lg'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div className="flex items-center space-x-4">
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted mb-0.5">
                        <MapPin className="w-3 h-3 text-brass" />
                        {listing.city} Portfolio • {listing.address}
                      </div>
                      <h3 className="font-serif font-bold text-lg text-ink">
                        {listing.title}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {viewing.status === 'requested' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-mono bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Awaiting Confirmation
                      </span>
                    )}
                    {viewing.status === 'accepted' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-mono bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Appointment
                      </span>
                    )}
                    {viewing.status === 'en_route' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-mono bg-live/15 text-live border border-live/30 flex items-center gap-1.5 font-bold animate-pulse">
                        <Navigation className="w-3.5 h-3.5 animate-spin" /> Sharing Live GPS
                      </span>
                    )}
                    {viewing.status === 'arrived' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 font-bold">
                        <Check className="w-3.5 h-3.5" /> Arrived at Residence
                      </span>
                    )}
                    {viewing.status === 'completed' && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-mono bg-stone-100 text-stone-700 border border-stone-300 flex items-center gap-1.5">
                        ✓ Viewing Concluded
                      </span>
                    )}
                  </div>
                </div>

                {/* Appointment Info & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs">
                  <div className="flex items-center space-x-2 text-stone-700">
                    <Calendar className="w-4 h-4 text-brass" />
                    <div>
                      <div className="text-[10px] uppercase font-mono text-muted">Scheduled Time</div>
                      <div className="font-semibold text-ink">
                        {format(new Date(viewing.requested_time), 'EEE, MMM d, yyyy • h:mm a')}
                      </div>
                    </div>
                  </div>

                  {agent && (
                    <div className="flex items-center space-x-2 text-stone-700">
                      <img
                        src={agent.avatar_url || ''}
                        alt={agent.name}
                        className="w-7 h-7 rounded-full object-cover border border-brass"
                      />
                      <div>
                        <div className="text-[10px] uppercase font-mono text-muted">Assigned Broker</div>
                        <div className="font-semibold text-ink">{agent.name}</div>
                      </div>
                    </div>
                  )}

                  {agent && (
                    <div className="flex items-center space-x-2 self-center md:justify-end">
                      {agent.phone && (
                        <a
                          href={`tel:${agent.phone}`}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-ink flex items-center gap-1 font-mono transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-brass" /> Call
                        </a>
                      )}
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-ink flex items-center gap-1 font-mono transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-brass" /> Email
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {viewing.notes && (
                  <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 whitespace-pre-line">
                    <span className="font-semibold text-ink">Notes: </span>
                    {viewing.notes}
                  </div>
                )}

                {/* Live Radar Map Section if en_route */}
                {isEnRoute && (
                  <div className="mt-6 pt-6 border-t border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-live animate-ping" />
                        <span className="font-mono text-xs font-semibold text-live uppercase tracking-wider">
                          Live Navigation Stream Active
                        </span>
                      </div>

                      {viewing.current_location && (
                        <div className="flex items-center space-x-4 font-mono text-xs text-ink bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-300">
                          <span>
                            Distance:{' '}
                            <b className="text-brass">
                              {viewing.current_location.distance_km} km
                            </b>
                          </span>
                          <span>
                            Est. Arrival:{' '}
                            <b className="text-live">
                              ~{viewing.current_location.eta_minutes} mins
                            </b>
                          </span>
                        </div>
                      )}
                    </div>

                    <LiveMap
                      viewingId={viewing.id}
                      propertyLat={listing.latitude}
                      propertyLng={listing.longitude}
                      propertyTitle={listing.title}
                      buyerLat={viewing.current_location?.latitude}
                      buyerLng={viewing.current_location?.longitude}
                      buyerName={currentUser.name}
                      heightClass="h-72"
                    />

                    {/* Arrival Action Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => updateViewingStatus(viewing.id, 'arrived')}
                        className="py-2.5 px-6 rounded-xl bg-live hover:bg-live-light text-white font-serif font-bold text-xs flex items-center gap-2 shadow-md transition"
                      >
                        <Check className="w-4 h-4" /> I Have Arrived at the Residence
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons for upcoming viewings */}
                {viewing.status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between">
                    <button
                      onClick={() => updateViewingStatus(viewing.id, 'cancelled')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Cancel Appointment
                    </button>

                    <button
                      onClick={() => updateViewingStatus(viewing.id, 'en_route')}
                      className="py-2.5 px-6 rounded-xl bg-brass hover:bg-brass-hover text-ink font-serif font-bold text-xs flex items-center gap-2 shadow-md transition"
                    >
                      <Navigation className="w-4 h-4" /> I'm On My Way (Broadcast GPS)
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div className="py-20 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
            <Building className="w-10 h-10 text-muted mx-auto" />
            <div className="font-serif text-lg font-semibold text-ink">
              {subTab === 'upcoming'
                ? 'No Upcoming Viewings Scheduled'
                : 'No Past Viewing History'}
            </div>
            <p className="text-xs text-muted">
              Explore the property catalog and book a private tour with our brokers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
