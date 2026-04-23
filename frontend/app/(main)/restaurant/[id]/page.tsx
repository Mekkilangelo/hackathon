"use client";

<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { restaurantsApi, type RestaurantDetailDTO } from "@/lib/api";
import { SebastianLogo } from "@/components/layout/Header";
import Link from "next/link";

const MICHELIN_BADGE: Record<string, { label: string; color: string }> = {
  ETOILE: { label: "⭐ Étoilé Michelin", color: "var(--or)" },
  BIB_GOURMAND: { label: "😊 Bib Gourmand", color: "var(--rouge)" },
  ETOILE_VERTE: { label: "🌿 Étoile Verte", color: "#4caf50" },
  SELECTION: { label: "◆ Sélection Michelin", color: "var(--muted-foreground)" },
};

const PRICE: Record<number, string> = { 1: "€", 2: "€€", 3: "€€€", 4: "€€€€" };

const DAY_FR: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    restaurantsApi
      .getById(id)
      .then(setRestaurant)
      .catch(() => setError("Restaurant introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3">
        <div className="animate-[spin_3s_linear_infinite] opacity-60">
          <SebastianLogo size={40} />
        </div>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4 text-center py-12">
        <p className="text-sm text-muted-foreground">{error || "Restaurant introuvable."}</p>
        <button
          onClick={() => router.back()}
          className="text-sm underline"
          style={{ color: "var(--or)" }}
        >
          ← Retour
        </button>
      </div>
    );
  }

  const badge = MICHELIN_BADGE[restaurant.michelinType] ?? MICHELIN_BADGE.SELECTION;

  return (
    <div className="flex flex-col flex-1 pb-6 -mt-0">
      {/* Hero image */}
      <div className="relative w-full h-56 shrink-0">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: "var(--muted)" }}
          >
            🍽️
          </div>
        )}
        {/* Bouton retour flottant */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
          aria-label="Retour"
        >
          ←
        </button>
        {/* Badge Michelin flottant */}
        <span
          className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm"
          style={{ background: badge.color + "dd", color: "white" }}
        >
          {badge.label}
        </span>
      </div>

      {/* Galerie horizontale */}
      {restaurant.gallery && restaurant.gallery.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
          {restaurant.gallery.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${restaurant.name} ${i + 1}`}
              className="h-20 w-28 object-cover rounded-xl shrink-0"
            />
          ))}
        </div>
      )}

      {/* Contenu */}
      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Nom + infos rapides */}
        <div className="flex flex-col gap-1.5">
          <h1
            className="text-2xl font-bold text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {restaurant.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{restaurant.cuisine}</span>
            <span>·</span>
            <span>{PRICE[restaurant.priceRange] ?? "€"}</span>
            {restaurant.zone && (
              <>
                <span>·</span>
                <span>{restaurant.zone}</span>
              </>
            )}
            {restaurant.location && (
              <>
                <span>·</span>
                <span>{restaurant.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{restaurant.description}</p>
        )}

        {/* Ambiance */}
        {restaurant.ambiance && (
          <div
            className="rounded-xl p-3 text-sm italic"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            « {restaurant.ambiance} »
          </div>
        )}

        {/* Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
>>>>>>> main
              >
                {tag}
              </span>
            ))}
          </div>
        )}
<<<<<<< HEAD
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
=======

        {/* Adresse */}
        {restaurant.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-0.5">📍</span>
            <span>{restaurant.address}</span>
          </div>
        )}

        {/* Horaires */}
        {restaurant.hours && Object.keys(restaurant.hours).length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Horaires
            </p>
            <div
              className="rounded-xl overflow-hidden border border-border"
              style={{ background: "var(--card)" }}
            >
              {Object.entries(restaurant.hours).map(([day, hours], i) => (
                <div
                  key={day}
                  className="flex justify-between items-center px-3 py-2 text-sm"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <span className="text-muted-foreground">{DAY_FR[day] ?? day}</span>
                  <span className="font-medium text-foreground">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Réserver */}
        <div className="flex flex-col gap-2 pt-2">
          {restaurant.websiteUrl ? (
            <a
              href={restaurant.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-13 rounded-xl font-semibold text-sm tracking-wide transition-all active:scale-95"
              style={{ background: "var(--rouge)", color: "white", height: "52px" }}
            >
              Réserver une table →
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center h-13 rounded-xl font-semibold text-sm opacity-40 cursor-not-allowed"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
                height: "52px",
              }}
            >
              Réservation non disponible
            </button>
          )}

          {restaurant.michelinUrl && (
            <a
              href={restaurant.michelinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-10 rounded-xl text-xs font-medium border border-border text-muted-foreground transition-all active:scale-95 hover:text-foreground"
            >
              Voir sur Guide Michelin
            </a>
          )}
        </div>

        {/* Lien retour chat */}
        <Link href="/chat" className="text-xs text-center text-muted-foreground underline pb-2">
          ← Retour à Sebastian
        </Link>
>>>>>>> main
      </div>
    </div>
  );
}
