'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BuyerNav } from '@/components/navigation/BuyerNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSocketClient } from '@/lib/socket-client';
import { calculateDistanceKm, formatDistance, calculateEtaMinutes, formatEta } from '@/lib/geo';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
  Navigation,
  Play,
  Pause,
} from 'lucide-react';
import { format } from 'date-fns';

// Dynamically import Leaflet map with no SSR
const LiveMap = dynamic(() => import('@/components/agent/AgentLiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-stone/20 rounded-xl flex items-center justify-center text-xs text-muted">
      Loading satellite map tiles...
    </div>
  ),
});

export default function BuyerEnRoutePage() {
  const params = useParams();
  const router = useRouter();
  const viewingId = params?.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [viewing, setViewing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'streaming' | 'denied' | 'unsupported'>('requesting');
  const [isMarkingArrived, setIsMarkingArrived] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch viewing details
  useEffect(() => {
    if (!viewingId) return;

    const fetchViewing = async () => {
      try {
        const res = await fetch(`/api/viewings/mine`);
        if (res.ok) {
          const data = await res.json();
          const target = (data.all || []).find((v: any) => v.id === viewingId);
          if (target) {
            setViewing(target);
            if (target.status === 'arrived' || target.status === 'completed' || target.status === 'cancelled') {
              router.push('/viewings');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching viewing:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchViewing();
      }
    }
  }, [viewingId, user, authLoading]);

  // 2. Continuous watchPosition and WebSocket streaming
  useEffect(() => {
    if (!viewingId || !user) return;

    const socket = getSocketClient();

    // Join viewing room
    socket.emit('join_viewing_room', { viewingId });

    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported');
      // Set default initial proximity coordinate so live map is immediately visible
      if (viewing) {
        initDefaultCoords(viewing);
      }
      return;
    }

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ latitude, longitude });
        setLocationStatus('streaming');

        // Continuously send location updates through viewing-specific channel
        socket.emit('location:update', {
          viewingId,
          latitude,
          longitude,
        });
      },
      (error) => {
        console.warn('Geolocation access issue:', error.message);
        setLocationStatus('denied');
        // Provide initial coordinate in vicinity so user can see live map
        if (viewing && !currentCoords) {
          initDefaultCoords(viewing);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = id;

    return () => {
      // Immediate clean teardown of watchPosition and stream
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [viewingId, user, viewing]);

  const initDefaultCoords = (v: any) => {
    if (!currentCoords && v.listing?.latitude) {
      // Start ~1.2 km away from property
      const startLat = v.listing.latitude - 0.009;
      const startLng = v.listing.longitude + 0.008;
      setCurrentCoords({ latitude: startLat, longitude: startLng });
    }
  };

  // 3. Movement simulation helper (essential for desktop testing / no-GPS hardware)
  const toggleSimulation = () => {
    if (!viewing) return;

    if (isSimulating) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      setLocationStatus('streaming');

      const destLat = viewing.listing.latitude;
      const destLng = viewing.listing.longitude;
      let currLat = currentCoords?.latitude || destLat - 0.012;
      let currLng = currentCoords?.longitude || destLng + 0.010;

      const socket = getSocketClient();

      simIntervalRef.current = setInterval(() => {
        // Step 5% closer to destination each tick
        const dLat = (destLat - currLat) * 0.08;
        const dLng = (destLng - currLng) * 0.08;

        currLat += dLat;
        currLng += dLng;

        const updated = { latitude: currLat, longitude: currLng };
        setCurrentCoords(updated);

        // Stream via WebSocket
        socket.emit('location:update', {
          viewingId,
          latitude: currLat,
          longitude: currLng,
        });

        // If arrived within 20 meters, stop
        const dist = calculateDistanceKm(currLat, currLng, destLat, destLng);
        if (dist < 0.03) {
          if (simIntervalRef.current) clearInterval(simIntervalRef.current);
          setIsSimulating(false);
        }
      }, 2500);
    }
  };

  // 4. Mark Arrived action
  const handleArrive = async () => {
    if (isMarkingArrived) return;
    setIsMarkingArrived(true);

    try {
      // 1. Immediately stop watchPosition and simulation
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }

      // 2. Set status to arrived via API
      const res = await fetch(`/api/viewings/${viewingId}/arrived`, {
        method: 'PATCH',
      });

      if (res.ok) {
        router.push('/viewings');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to confirm arrival');
      }
    } catch {
      alert('Network error while marking arrival');
    } finally {
      setIsMarkingArrived(false);
    }
  };

  if (isLoading || !viewing) {
    return (
      <div className="min-h-screen bg-white">
        <BuyerNav />
        <div className="max-w-md mx-auto px-4 py-20 text-center text-muted animate-pulse">
          Connecting to live viewing stream...
        </div>
      </div>
    );
  }

  // Distance & ETA calculation
  const targetCoords = currentCoords || {
    latitude: viewing.listing.latitude - 0.008,
    longitude: viewing.listing.longitude + 0.007,
  };

  const distanceKm = calculateDistanceKm(
    targetCoords.latitude,
    targetCoords.longitude,
    viewing.listing.latitude,
    viewing.listing.longitude
  );
  const etaMins = calculateEtaMinutes(distanceKm);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-12">
      <BuyerNav />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between space-y-6">
        <div>
          {/* Top Back Nav */}
          <button
            onClick={() => router.push('/viewings')}
            className="text-xs text-muted hover:text-ink flex items-center gap-1.5 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Viewings</span>
          </button>

          {/* Calm Minimal En-Route UI (Section 10) */}
          <div className="bg-white border border-stone rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Live Pulsing Status Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-live/10 shrink-0">
                  <div className="absolute w-10 h-10 rounded-full bg-live/30 animate-ping-slow" />
                  <div className="w-5 h-5 rounded-full bg-live flex items-center justify-center text-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-live block">
                    Live En Route
                  </span>
                  <h1 className="font-headline text-lg sm:text-xl font-medium text-ink">
                    Sharing live location with {viewing.agent.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* LIVE INTERACTIVE MAP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-live" />
                  <span>Real-time GPS Map</span>
                </span>
                <button
                  onClick={toggleSimulation}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    isSimulating
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone/50 hover:bg-stone text-ink border border-stone-dim'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3 h-3 text-amber-700" /> : <Play className="w-3 h-3 text-live" />}
                  <span>{isSimulating ? 'Pause Movement Simulation' : 'Simulate Movement (Test GPS)'}</span>
                </button>
              </div>

              {/* Render Leaflet Live Map */}
              <LiveMap
                propertyCoords={{
                  latitude: viewing.listing.latitude,
                  longitude: viewing.listing.longitude,
                  title: viewing.listing.title,
                }}
                buyerCoords={targetCoords}
                heightClass="h-72 sm:h-80"
                isBuyerPerspective={true}
              />
            </div>

            {/* JetBrains Mono Data Readout: Distance & ETA */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone/20 rounded-xl border border-stone-dim/60 font-mono text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-sans font-medium">
                  Remaining Distance
                </div>
                <div className="text-base font-bold text-ink mt-0.5">
                  {formatDistance(distanceKm)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-sans font-medium">
                  Estimated Arrival
                </div>
                <div className="text-base font-bold text-live mt-0.5">
                  {formatEta(etaMins)}
                </div>
              </div>
            </div>

            {/* Geolocation Status Badge */}
            <div className="py-2.5 px-4 rounded-lg bg-stone/30 border border-stone-dim text-xs font-sans">
              {locationStatus === 'streaming' && (
                <span className="text-live font-medium flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Live GPS coordinates streaming continuously to {viewing.agent.name}
                </span>
              )}
              {locationStatus === 'requesting' && (
                <span className="text-muted flex items-center justify-center gap-1.5">
                  Waiting for GPS signal...
                </span>
              )}
              {(locationStatus === 'denied' || locationStatus === 'unsupported') && (
                <span className="text-stone-dim text-ink flex items-center justify-center gap-1.5 text-center">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Browser GPS inactive. Simulated coordinates enabled for testing.</span>
                </span>
              )}
            </div>

            {/* Destination Residence Context */}
            <div className="pt-2 border-t border-stone-dim/60 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Destination
                </div>
                <div className="font-headline text-sm font-medium text-ink">
                  {viewing.listing.title}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Appointment Time
                </div>
                <div className="font-medium text-ink flex items-center gap-1 justify-end">
                  <Clock className="w-3.5 h-3.5 text-brass" />
                  <span>{format(new Date(viewing.requested_time), 'HH:mm')}</span>
                </div>
              </div>
            </div>

            {/* "I've Arrived" Button (Section 10) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleArrive}
                disabled={isMarkingArrived}
                className="w-full py-3.5 px-6 rounded-xl bg-ink text-white font-sans text-xs uppercase tracking-wider font-semibold hover:bg-ink/90 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-live" />
                <span>{isMarkingArrived ? 'Concluding Journey...' : "I've arrived"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <p className="text-[11px] text-muted text-center">
          Location streaming is strictly active during this en-route session and terminates immediately upon arrival.
        </p>
      </main>
    </div>
  );
}
