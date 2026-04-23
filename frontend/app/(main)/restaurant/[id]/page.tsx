"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: string;
  michelinStars: number | null;
  greenStar: boolean;
  address: string;
  location: string;
  country: string | null;
  zone: string | null;
  description: string;
  ambiance: string | null;
  tags: string[];
  websiteUrl: string | null;
  michelinUrl: string | null;
  imageUrl: string | null;
}

const MICHELIN_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ETOILE:       { label: "Étoile Michelin",  bg: "var(--or)",              text: "#000" },
  BIB_GOURMAND: { label: "Bib Gourmand",     bg: "var(--rouge)",           text: "#fff" },
  ETOILE_VERTE: { label: "Étoile Verte",     bg: "#2d6a4f",                text: "#fff" },
  SELECTION:    { label: "Sélection",         bg: "var(--muted-foreground)", text: "#fff" },
};

function priceSymbol(n: number) {
  return "€".repeat(Math.min(n, 4));
}

function StarDots({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5 items-center">
      {Array.from({ length: stars }).map((_, i) => (
        <span key={i} className="text-[10px]">⭐</span>
      ))}
    </span>
  );
}

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/restaurants/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error(`${res.status}`);
        setRestaurant(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--or)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (notFound || !restaurant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Ce restaurant est introuvable.
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-xl"
          style={{ background: "var(--rouge)", color: "white" }}
        >
          Retour
        </button>
      </div>
    );
  }

  const badge = MICHELIN_BADGE[restaurant.michelinType] ?? MICHELIN_BADGE.SELECTION;
  const zone = restaurant.zone ?? restaurant.location.split(",")[0];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {/* Back */}
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          ← Retour
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 pt-4 pb-5 flex flex-col gap-3">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: badge.bg, color: badge.text }}
          >
            {restaurant.greenStar ? "🌿 " : ""}{badge.label}
          </span>
          {restaurant.michelinStars && restaurant.michelinStars > 0 && (
            <StarDots stars={restaurant.michelinStars} />
          )}
          <span
            className="text-sm font-bold font-mono ml-auto"
            style={{ color: "var(--or)" }}
          >
            {priceSymbol(restaurant.priceRange)}
          </span>
        </div>

        {/* Name */}
        <h1
          className="text-2xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {restaurant.name}
        </h1>

        {/* Cuisine + zone */}
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {restaurant.cuisine} · {zone}
          {restaurant.country && restaurant.country !== "France" && ` · ${restaurant.country}`}
        </p>

        {/* Tags */}
        {restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--marine)",
                  color: "var(--or)",
                  border: "1px solid oklch(0.807 0.094 78 / 0.15)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Details */}
      <div className="px-4 py-5 flex flex-col gap-5">

        {/* Description */}
        {restaurant.description && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--or)" }}>
              À propos
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              {restaurant.description}
            </p>
          </div>
        )}

        {/* Ambiance */}
        {restaurant.ambiance && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--or)" }}>
              Ambiance
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {restaurant.ambiance}
            </p>
          </div>
        )}

        {/* Adresse */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--or)" }}>
            Adresse
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {restaurant.address}
            <br />
            {restaurant.location}
          </p>
        </div>

      </div>

      {/* CTAs */}
      <div className="px-4 pb-8 flex flex-col gap-3 mt-auto">
        {/* Réservation TheFork */}
        <Link
          href={`https://www.thefork.fr/restaurants/?q=${encodeURIComponent(restaurant.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: "var(--rouge)", color: "white" }}
        >
          🍽️ Réserver une table
        </Link>

        {restaurant.websiteUrl && (
          <Link
            href={restaurant.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            🌐 Visiter le site
          </Link>
        )}
        {restaurant.michelinUrl && (
          <Link
            href={restaurant.michelinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: "var(--card)", color: "var(--or)", border: "1px solid var(--border)" }}
          >
            ⭐ Voir sur le Guide Michelin
          </Link>
        )}
        <button
          onClick={() => router.back()}
          className="h-11 rounded-xl flex items-center justify-center text-sm transition-all active:scale-[0.98]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Retour à la sélection
        </button>
      </div>
    </div>
  );
}
