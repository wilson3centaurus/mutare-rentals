"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

interface MapProperty {
  id: string;
  title: string;
  suburb: string;
  price: number;
  latitude: number;
  longitude: number;
  bedrooms: number;
  status: string;
}

interface PropertyMapProps {
  properties: MapProperty[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export default function PropertyMap({
  properties,
  center = { lat: -18.9558, lng: 32.6504 },
  zoom = 13,
  height = "500px",
}: PropertyMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (mapRef.current || !containerRef.current) return;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current).setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      properties.forEach((prop) => {
        const color = prop.status === "AVAILABLE" ? "#10b981" : prop.status === "RENTED" ? "#ef4444" : "#f59e0b";

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:${color};
            color:white;
            padding:4px 8px;
            border-radius:6px;
            font-size:12px;
            font-weight:600;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
            border: 2px solid white;
          ">$${prop.price}</div>`,
          iconAnchor: [30, 16],
        });

        const marker = L.marker([prop.latitude, prop.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:180px;">
            <p style="font-weight:600;margin:0 0 4px 0;">${prop.title}</p>
            <p style="color:#6b7280;margin:0 0 4px 0;font-size:13px;">${prop.suburb}, Mutare</p>
            <p style="color:#10b981;font-weight:700;margin:0 0 4px 0;">$${prop.price}/mo</p>
            <p style="margin:0;font-size:12px;color:#374151;">${prop.bedrooms} Bed</p>
            <a href="/properties/${prop.id}" style="color:#10b981;font-size:13px;">View details →</a>
          </div>
        `);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden z-0 w-full"
        style={{ height }}
      />
    </>
  );
}
