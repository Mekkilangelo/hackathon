"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { RestaurantCardData } from "./RestaurantCard";

// Fix default leaflet marker icons (webpack issue)
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -40],
  shadowSize: [48, 48],
  className: "hue-rotate-[160deg]",
});

interface GeocodedRestaurant extends RestaurantCardData {
  lat: number;
  lng: number;
}

async function nominatimGeocode(r: RestaurantCardData): Promise<{ lat: number; lng: number } | null> {
  const cacheKey = `geo_${r.id}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }

  try {
    const q = encodeURIComponent(`${r.name}, ${r.location}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "SebastianMichelinApp/1.0" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}

const MICHELIN_BADGE: Record<string, string> = {
  ETOILE: "⭐ Étoile Michelin",
  BIB_GOURMAND: "🍽️ Bib Gourmand",
  ETOILE_VERTE: "🌿 Étoile Verte",
  SELECTION: "Sélection",
};

export default function RestaurantMap({ restaurants }: { restaurants: RestaurantCardData[] }) {
  const [geocoded, setGeocoded] = useState<GeocodedRestaurant[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setGeocoded([]);
    setProgress(0);
    setDone(false);

    (async () => {
      const results: GeocodedRestaurant[] = [];
      for (let i = 0; i < restaurants.length; i++) {
        if (abortRef.current) return;
        const coords = await nominatimGeocode(restaurants[i]);
        if (coords) results.push({ ...restaurants[i], ...coords });
        if (i > 0) await new Promise((r) => setTimeout(r, 350)); // Nominatim rate limit
        setProgress(i + 1);
      }
      setGeocoded(results);
      setDone(true);
    })();

    return () => { abortRef.current = true; };
  }, [restaurants]);

  if (!done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full py-16">
        <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "var(--or)", borderTopColor: "transparent" }} />
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Localisation {progress}/{restaurants.length}…
        </p>
      </div>
    );
  }

  if (!geocoded.length) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          Aucun restaurant n'a pu être géolocalisé.
        </p>
      </div>
    );
  }

  const center: [number, number] = [
    geocoded.reduce((s, r) => s + r.lat, 0) / geocoded.length,
    geocoded.reduce((s, r) => s + r.lng, 0) / geocoded.length,
  ];

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden" style={{ minHeight: 380 }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", minHeight: 380 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geocoded.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={r.matchScore && r.matchScore >= 70 ? activeIcon : markerIcon}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{r.name}</p>
                <p style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                  {MICHELIN_BADGE[r.michelinType] ?? r.michelinType} · {"€".repeat(r.priceRange)}
                </p>
                {r.matchScore != null && r.matchScore > 0 && (
                  <p style={{ fontSize: 11, color: "#C9A227", marginBottom: 6, fontWeight: 600 }}>
                    Match {r.matchScore}%
                  </p>
                )}
                <Link
                  href={`/restaurant/${r.id}`}
                  style={{ fontSize: 11, color: "#001F5F", fontWeight: 600 }}
                >
                  Voir la fiche →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
