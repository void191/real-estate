'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LiveMapProps {
  propertyCoords: { latitude: number; longitude: number; title: string };
  buyerCoords: { latitude: number; longitude: number } | null;
  heightClass?: string;
  isBuyerPerspective?: boolean;
}

export default function AgentLiveMap({
  propertyCoords,
  buyerCoords,
  heightClass = 'h-64 sm:h-72',
  isBuyerPerspective = false,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const buyerMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultLat = propertyCoords.latitude || 51.5074;
    const defaultLng = propertyCoords.longitude || -0.1278;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Standard OpenStreetMap tiles (100% reliable worldwide)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Invalidate size after layout renders to prevent grey tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
    setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Custom Icon for Property (Destination)
    const propertyIcon = L.divIcon({
      className: 'custom-property-pin',
      html: `
        <div style="
          background-color: #1E2A32;
          color: #FCFAF8;
          border: 2px solid #B08D45;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B08D45" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    L.marker([propertyCoords.latitude, propertyCoords.longitude], { icon: propertyIcon })
      .addTo(map)
      .bindPopup(`<strong>${propertyCoords.title}</strong><br/>Destination Residence`);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertyCoords.latitude, propertyCoords.longitude, propertyCoords.title]);

  // Update Buyer Location Pin and Polyline when buyer coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (buyerCoords && typeof buyerCoords.latitude === 'number' && typeof buyerCoords.longitude === 'number') {
      const buyerLat = buyerCoords.latitude;
      const buyerLng = buyerCoords.longitude;

      // Custom Icon for Moving Buyer Pin (Live Green Pulse #3E7C59)
      const buyerIcon = L.divIcon({
        className: 'custom-buyer-pin',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 36px;
              height: 36px;
              background-color: rgba(62, 124, 89, 0.4);
              border-radius: 50%;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 20px;
              height: 20px;
              background-color: #3E7C59;
              border: 3px solid #FCFAF8;
              border-radius: 50%;
              box-shadow: 0 2px 10px rgba(0,0,0,0.35);
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (buyerMarkerRef.current) {
        buyerMarkerRef.current.setLatLng([buyerLat, buyerLng]);
      } else {
        buyerMarkerRef.current = L.marker([buyerLat, buyerLng], { icon: buyerIcon })
          .addTo(map)
          .bindPopup(isBuyerPerspective ? '<strong>Your Current Location</strong>' : '<strong>Buyer Location</strong> (Live GPS)');
      }

      // Draw dashed connecting path between buyer and destination
      const points: [number, number][] = [
        [buyerLat, buyerLng],
        [propertyCoords.latitude, propertyCoords.longitude],
      ];

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(points);
      } else {
        polylineRef.current = L.polyline(points, {
          color: '#3E7C59',
          dashArray: '6, 8',
          weight: 3.5,
          opacity: 0.85,
        }).addTo(map);
      }

      // Auto-fit bounds to frame both pins smoothly
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } catch {}
    } else {
      if (buyerMarkerRef.current) {
        buyerMarkerRef.current.remove();
        buyerMarkerRef.current = null;
      }
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    }
  }, [buyerCoords, propertyCoords, isBuyerPerspective]);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-live/30 shadow-md`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
