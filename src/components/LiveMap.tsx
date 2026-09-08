import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Play, Pause } from 'lucide-react';
import { useAppStore } from '../store/useStore';

interface LiveMapProps {
  viewingId: string;
  propertyLat: number;
  propertyLng: number;
  propertyTitle: string;
  buyerLat?: number;
  buyerLng?: number;
  buyerName?: string;
  heightClass?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  viewingId,
  propertyLat,
  propertyLng,
  propertyTitle,
  buyerLat,
  buyerLng,
  buyerName = 'Client',
  heightClass = 'h-72',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const buyerMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const { advanceGpsSimulation } = useAppStore();
  const [isSimulating, setIsSimulating] = React.useState(false);

  // Auto advance GPS timer when simulation is toggled on
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        advanceGpsSimulation(viewingId);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, viewingId, advanceGpsSimulation]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = buyerLat ?? propertyLat;
      const initialLng = buyerLng ?? propertyLng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Destination Icon (Brass / Gold Pin)
      const destIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div style="background:#B08D45; width:32px; height:32px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:2px solid #FCFAF8; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
            <div style="transform:rotate(45deg); color:#1E2A32; font-weight:bold; font-size:14px;">✦</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const destMarker = L.marker([propertyLat, propertyLng], { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`<b>${propertyTitle}</b><br/>Destination Property`);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Render / Update Buyer Pin if coords provided
    if (buyerLat !== undefined && buyerLng !== undefined) {
      const buyerIcon = L.divIcon({
        className: 'custom-buyer-pin',
        html: `
          <div style="position:relative; width:36px; height:36px;">
            <div class="radar-pulse-ring" style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(62,124,89,0.4);"></div>
            <div style="position:absolute; top:6px; left:6px; width:24px; height:24px; border-radius:50%; background:#3E7C59; border:2px solid #FCFAF8; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.3);">
              <div style="width:8px; height:8px; border-radius:50%; background:#FCFAF8;"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      if (!buyerMarkerRef.current) {
        buyerMarkerRef.current = L.marker([buyerLat, buyerLng], { icon: buyerIcon }).addTo(map);
        buyerMarkerRef.current.bindPopup(`<b>${buyerName}</b><br/>En Route (Live Radar)`);
      } else {
        buyerMarkerRef.current.setLatLng([buyerLat, buyerLng]);
      }

      // Draw trajectory dashed line
      const latlngs: [number, number][] = [
        [buyerLat, buyerLng],
        [propertyLat, propertyLng],
      ];

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latlngs, {
          color: '#3E7C59',
          dashArray: '6, 8',
          weight: 3,
          opacity: 0.8,
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latlngs);
      }

      // Fit bounds to show both pins
      const bounds = L.latLngBounds([
        [buyerLat, buyerLng],
        [propertyLat, propertyLng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }

    // Leaflet container resize check
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => clearTimeout(timeout);
  }, [propertyLat, propertyLng, propertyTitle, buyerLat, buyerLng, buyerName]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-300 shadow-inner">
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* GPS Simulation Controls & Live Badge Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <div className="bg-ink/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 shadow-lg border border-stone/30">
          <span className="w-2 h-2 rounded-full bg-live animate-ping" />
          <span className="text-stone-200">GPS STREAM ACTIVE</span>
        </div>

        <button
          onClick={() => {
            if (!isSimulating) {
              advanceGpsSimulation(viewingId);
            }
            setIsSimulating(!isSimulating);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 shadow-lg border transition ${
            isSimulating
              ? 'bg-amber-600/90 text-white border-amber-400'
              : 'bg-stone-900/90 hover:bg-stone-800 text-stone-200 border-stone-700'
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-300" /> Pausing Simulation
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Step Live GPS
            </>
          )}
        </button>
      </div>
    </div>
  );
};
