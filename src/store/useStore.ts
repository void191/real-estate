import { useState, useEffect } from 'react';
import { User, Listing, Viewing, ViewingStatus } from '../types';
import { SEED_USERS, SEED_LISTINGS, SEED_VIEWINGS } from '../data/seed';

const STORAGE_KEY = 'real_estate_viewing_state_v2';

export interface AppState {
  currentUser: User;
  users: User[];
  listings: Listing[];
  viewings: Viewing[];
  favorites: string[];
}

function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.listings && parsed.viewings && parsed.currentUser) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not parse stored state, using fresh seed data', e);
  }

  return {
    currentUser: SEED_USERS[5], // Default to Oliver Sterling (Buyer)
    users: SEED_USERS,
    listings: SEED_LISTINGS,
    viewings: SEED_VIEWINGS,
    favorites: ['lst_empire', 'lst_eaton'],
  };
}

let globalState: AppState = getInitialState();
const listeners = new Set<(state: AppState) => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.error('Storage save error:', e);
  }
  listeners.forEach((listener) => listener(globalState));
}

// Distance in km using Haversine
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setCurrentUser = (user: User) => {
    globalState = { ...globalState, currentUser: user };
    notify();
  };

  const toggleFavorite = (listingId: string) => {
    const isFav = globalState.favorites.includes(listingId);
    const newFavs = isFav
      ? globalState.favorites.filter((id) => id !== listingId)
      : [...globalState.favorites, listingId];
    globalState = { ...globalState, favorites: newFavs };
    notify();
  };

  const requestViewing = (
    listingId: string,
    requestedTime: string,
    notes?: string
  ) => {
    const listing = globalState.listings.find((l) => l.id === listingId);
    if (!listing) return;

    const newViewing: Viewing = {
      id: 'vw_' + Date.now(),
      listing_id: listingId,
      buyer_id: globalState.currentUser.id,
      agent_id: listing.agent_id,
      requested_time: requestedTime,
      status: 'requested',
      notes: notes ? `Buyer: ${notes}` : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    globalState = {
      ...globalState,
      viewings: [newViewing, ...globalState.viewings],
    };
    notify();
  };

  const updateViewingStatus = (
    viewingId: string,
    status: ViewingStatus,
    newNotes?: string
  ) => {
    globalState = {
      ...globalState,
      viewings: globalState.viewings.map((v) => {
        if (v.id !== viewingId) return v;

        let notes = v.notes;
        if (newNotes) {
          notes = notes ? `${notes}\n${newNotes}` : newNotes;
        }

        // When transitioning to en_route, initialize location near property
        let current_location = v.current_location;
        if (status === 'en_route') {
          const listing = globalState.listings.find((l) => l.id === v.listing_id);
          const destLat = listing ? listing.latitude : 36.2085;
          const destLng = listing ? listing.longitude : 43.9854;

          // Start 1.5km south-west
          const startLat = destLat - 0.012;
          const startLng = destLng - 0.012;
          const dist = calculateDistanceKm(startLat, startLng, destLat, destLng);
          const eta = Math.max(2, Math.round(dist * 3.5));

          current_location = {
            latitude: startLat,
            longitude: startLng,
            distance_km: dist,
            eta_minutes: eta,
          };
        } else if (status === 'arrived' || status === 'completed') {
          current_location = undefined;
        }

        return {
          ...v,
          status,
          notes,
          current_location,
          updated_at: new Date().toISOString(),
        };
      }),
    };
    notify();
  };

  const advanceGpsSimulation = (viewingId: string) => {
    globalState = {
      ...globalState,
      viewings: globalState.viewings.map((v) => {
        if (v.id !== viewingId || v.status !== 'en_route' || !v.current_location) {
          return v;
        }

        const listing = globalState.listings.find((l) => l.id === v.listing_id);
        if (!listing) return v;

        // Step 20% closer to destination
        const currLat = v.current_location.latitude;
        const currLng = v.current_location.longitude;
        const destLat = listing.latitude;
        const destLng = listing.longitude;

        const nextLat = currLat + (destLat - currLat) * 0.25;
        const nextLng = currLng + (destLng - currLng) * 0.25;
        const dist = calculateDistanceKm(nextLat, nextLng, destLat, destLng);
        const eta = Math.max(1, Math.round(dist * 3.5));

        // Auto-arrival if less than 100 meters
        if (dist <= 0.1) {
          return {
            ...v,
            status: 'arrived',
            current_location: undefined,
            updated_at: new Date().toISOString(),
          };
        }

        return {
          ...v,
          current_location: {
            latitude: nextLat,
            longitude: nextLng,
            distance_km: dist,
            eta_minutes: eta,
          },
          updated_at: new Date().toISOString(),
        };
      }),
    };
    notify();
  };

  const resetStateToDefault = () => {
    globalState = {
      currentUser: SEED_USERS[5],
      users: SEED_USERS,
      listings: SEED_LISTINGS,
      viewings: SEED_VIEWINGS,
      favorites: ['lst_empire', 'lst_eaton'],
    };
    notify();
  };

  return {
    state,
    currentUser: state.currentUser,
    users: state.users,
    listings: state.listings,
    viewings: state.viewings,
    favorites: state.favorites,
    setCurrentUser,
    toggleFavorite,
    requestViewing,
    updateViewingStatus,
    advanceGpsSimulation,
    resetStateToDefault,
  };
}
