"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import SebastianAvatar from "@/components/chat/SebastianAvatar";
import RestaurantCardSkeleton from "@/components/restaurant/RestaurantCardSkeleton";
import { RestaurantCardData } from "@/components/restaurant/RestaurantCard";

const RestaurantMap = dynamic(
  () => import("@/components/restaurant/RestaurantMap"),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--or)", borderTopColor: "transparent" }} />
    </div>
  )}
);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const LS_FAVORITES = "sebastianFavorites";
const LS_DISMISSED = "sebastianDismissed";
const LS_VISITED = "sebastianVisited";

type Tab = "all" | "favorites" | "map";

function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

const MICHELIN_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ETOILE:       { label: "Étoile Michelin",  bg: "var(--or)",               text: "#000" },
  BIB_GOURMAND: { label: "Bib Gourmand",     bg: "var(--rouge)",            text: "#fff" },
  ETOILE_VERTE: { label: "Étoile Verte",     bg: "#2d6a4f",                 text: "#fff" },
  SELECTION:    { label: "Sélection",         bg: "var(--muted-foreground)", text: "#fff" },
};

function priceSymbol(n: number) {
  return "€".repeat(Math.min(n, 4));
}

function SelectionCard({
  restaurant,
  index,
  isFav,
  isVisited,
  onFav,
  onVisit,
  onDismiss,
}: {
  restaurant: RestaurantCardData;
  index: number;
  isFav: boolean;
  isVisited: boolean;
  onFav: () => void;
  onVisit: () => void;
  onDismiss: () => void;
}) {
  const badge = MICHELIN_BADGE[restaurant.michelinType] ?? MICHELIN_BADGE.SELECTION;
  const zone = restaurant.zone ?? restaurant.location.split(",")[0];

  return (
    <div
      className="flex gap-2 items-stretch opacity-0"
      style={{ animation: "fadeSlideUp 0.35s ease forwards", animationDelay: `${index * 60}ms` }}
    >
      {/* Carte principale — cliquable vers fiche */}
      <Link href={`/restaurant/${restaurant.id}`} className="flex-1 min-w-0">
        <div
          className="rounded-2xl p-4 flex flex-col gap-2.5 h-full transition-all active:scale-[0.98]"
          style={{
            background: "var(--card)",
            border: `1px solid ${isFav ? "var(--or)" : isVisited ? "#2d6a4f" : "var(--border)"}`,
            opacity: isVisited ? 0.75 : 1,
          }}
        >
          {/* Badge + prix */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: badge.bg, color: badge.text }}
            >
              {restaurant.greenStar ? "🌿 " : ""}{badge.label}
            </span>
            <div className="flex items-center gap-1.5">
              {isVisited && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#2d6a4f22", color: "#2d6a4f" }}>
                  ✓ Essayé
                </span>
              )}
              <span className="text-xs font-bold font-mono" style={{ color: "var(--or)" }}>
                {priceSymbol(restaurant.priceRange)}
              </span>
            </div>
          </div>

          {/* Nom + lieu */}
          <div>
            <h3 className="font-bold text-sm leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {restaurant.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {restaurant.cuisine} · {zone}
            </p>
          </div>

          {/* Tags */}
          {restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "var(--marine)", color: "var(--or)", border: "1px solid oklch(0.807 0.094 78 / 0.15)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Match score */}
          {restaurant.matchScore != null && restaurant.matchScore > 0 && (
            <MatchBar score={restaurant.matchScore} />
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex flex-col gap-2 justify-center">
        <button
          onClick={onFav}
          title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{
            background: isFav ? "var(--or)" : "var(--card)",
            border: `1px solid ${isFav ? "var(--or)" : "var(--border)"}`,
            color: isFav ? "#000" : "var(--muted-foreground)",
          }}
        >
          <HeartIcon filled={isFav} />
        </button>
        <button
          onClick={onVisit}
          title={isVisited ? "Marquer comme non visité" : "J'y suis allé !"}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 text-sm"
          style={{
            background: isVisited ? "#2d6a4f22" : "var(--card)",
            border: `1px solid ${isVisited ? "#2d6a4f" : "var(--border)"}`,
            color: isVisited ? "#2d6a4f" : "var(--muted-foreground)",
          }}
        >
          ✓
        </button>
        <button
          onClick={onDismiss}
          title="Ne plus afficher"
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>("all");

  // Charge les restaurants depuis l'historique du chat
  useEffect(() => {
    const sessionId = localStorage.getItem("sebastianSessionId");
    const userId = localStorage.getItem("sebastianUserId");
    if (!userId) { router.push("/onboarding"); return; }

    setFavorites(loadSet(LS_FAVORITES));
    setDismissed(loadSet(LS_DISMISSED));
    setVisited(loadSet(LS_VISITED));

    (async () => {
      try {
        if (!sessionId) { setLoading(false); return; }

        const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/messages`);
        if (!res.ok) throw new Error(`${res.status}`);
        const messages: Array<{ role: string; metadata?: { restaurants?: RestaurantCardData[] } }> = await res.json();

        // Dédoublonner par ID
        const seen = new Set<string>();
        const all: RestaurantCardData[] = [];
        for (const msg of messages) {
          if (msg.role !== "SEBASTIAN") continue;
          for (const r of msg.metadata?.restaurants ?? []) {
            if (!seen.has(r.id)) { seen.add(r.id); all.push(r); }
          }
        }
        setRestaurants(all);
      } catch {
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveSet(LS_FAVORITES, next);
      return next;
    });
  }, []);

  const toggleVisit = useCallback((id: string) => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveSet(LS_VISITED, next);
      return next;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(LS_DISMISSED, next);
      return next;
    });
    // Si on était sur l'onglet favoris, retirer aussi des favoris
    setFavorites((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      saveSet(LS_FAVORITES, next);
      return next;
    });
  }, []);

  const visible = restaurants.filter((r) => !dismissed.has(r.id));
  const displayed = tab === "favorites" ? visible.filter((r) => favorites.has(r.id)) : visible;
  const favCount = visible.filter((r) => favorites.has(r.id)).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-start gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <SebastianAvatar size={40} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            {loading ? "Chargement des propositions…" : restaurants.length === 0
              ? "Demandez à Sebastian pour voir des propositions ici."
              : "Mes propositions pour vous."}
          </p>
          {!loading && restaurants.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {visible.length} proposition{visible.length !== 1 ? "s" : ""}
              {favCount > 0 ? ` · ${favCount} favori${favCount !== 1 ? "s" : ""}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!loading && restaurants.length > 0 && (
        <div className="flex px-4 pt-3 gap-2 overflow-x-auto no-scrollbar">
          {([
            { key: "all",       label: "Toutes" },
            { key: "favorites", label: `❤️ Favoris${favCount > 0 ? ` (${favCount})` : ""}` },
            { key: "map",       label: "🗺️ Carte" },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: tab === key ? "var(--or)" : "var(--card)",
                color: tab === key ? "#000" : "var(--muted-foreground)",
                border: `1px solid ${tab === key ? "var(--or)" : "var(--border)"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Carte */}
      {tab === "map" && !loading && (
        <div className="flex-1 px-4 py-4" style={{ minHeight: 420 }}>
          {visible.length === 0 ? (
            <div className="flex items-center justify-center h-full py-16">
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Aucun restaurant à afficher.
              </p>
            </div>
          ) : (
            <RestaurantMap restaurants={visible} />
          )}
        </div>
      )}

      {/* Liste */}
      {tab !== "map" && <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <RestaurantCardSkeleton key={i} index={i} />)
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <SebastianAvatar size={48} />
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                Aucune proposition pour l'instant.
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Discutez avec Sebastian pour recevoir des suggestions.
              </p>
            </div>
            <button
              onClick={() => router.push("/chat")}
              className="h-11 px-6 rounded-xl text-sm font-semibold"
              style={{ background: "var(--rouge)", color: "white" }}
            >
              Parler à Sebastian
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {tab === "favorites" ? "Aucun favori pour l'instant." : "Tout a été ignoré."}
            </p>
            {tab === "favorites" && (
              <button onClick={() => setTab("all")} className="text-xs" style={{ color: "var(--or)" }}>
                Voir toutes les propositions →
              </button>
            )}
          </div>
        ) : (
          displayed.map((r, i) => (
            <SelectionCard
              key={r.id}
              restaurant={r}
              index={i}
              isFav={favorites.has(r.id)}
              isVisited={visited.has(r.id)}
              onFav={() => toggleFav(r.id)}
              onVisit={() => toggleVisit(r.id)}
              onDismiss={() => dismiss(r.id)}
            />
          ))
        )}
      </div>}
    </div>
  );
}

function MatchBar({ score }: { score: number }) {
  const color = score >= 80 ? "var(--or)" : score >= 60 ? "#f97316" : "var(--muted-foreground)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold tabular-nums" style={{ color, minWidth: 28 }}>
        {score}%
      </span>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
