/**
 * Haversine distance in kilometers between two GPS coordinates
 */
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
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimates ETA in minutes based on distance.
 * Urban transit assumption: ~25 km/h average speed in London/metropolitan traffic
 */
export function calculateEtaMinutes(distanceKm: number, averageSpeedKmh = 25): number {
  const hours = distanceKm / averageSpeedKmh;
  const minutes = Math.round(hours * 60);
  return Math.max(1, minutes);
}

export function formatEta(minutes: number): string {
  if (minutes <= 1) {
    return '< 1 min';
  }
  if (minutes > 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  }
  return `~${minutes} mins`;
}
