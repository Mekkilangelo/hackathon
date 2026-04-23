import Link from "next/link";
<<<<<<< HEAD

export interface RestaurantCardData {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: string;
  greenStar: boolean;
  zone: string | null;
  location: string;
  country: string | null;
  tags: string[];
  ambiance: string | null;
  imageUrl: string | null;
  matchScore?: number;
}

const MICHELIN_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ETOILE:      { label: "Étoile Michelin", bg: "var(--or)",           text: "#000" },
  BIB_GOURMAND:{ label: "Bib Gourmand",   bg: "var(--rouge)",         text: "#fff" },
  ETOILE_VERTE:{ label: "Étoile Verte",   bg: "#2d6a4f",              text: "#fff" },
  SELECTION:   { label: "Sélection",      bg: "var(--muted-foreground)", text: "#fff" },
};

function priceSymbol(n: number) {
  return "€".repeat(Math.min(n, 4));
}

export default function RestaurantCard({
  restaurant,
  index = 0,
}: {
  restaurant: RestaurantCardData;
  index?: number;
}) {
  const badge = MICHELIN_BADGE[restaurant.michelinType] ?? MICHELIN_BADGE.SELECTION;
  const zone = restaurant.zone ?? restaurant.location.split(",")[0];

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div
        className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.98] opacity-0"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          animation: `fadeSlideUp 0.4s ease forwards`,
          animationDelay: `${index * 80}ms`,
        }}
      >
        {/* Badge Michelin */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: badge.bg, color: badge.text }}
          >
            {restaurant.greenStar ? "🌿 " : ""}{badge.label}
          </span>
          <span className="text-sm font-bold font-mono" style={{ color: "var(--or)" }}>
            {priceSymbol(restaurant.priceRange)}
          </span>
        </div>

        {/* Nom + localisation */}
        <div>
          <h3
            className="font-bold text-base leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {restaurant.name}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {restaurant.cuisine} · {zone}
          </p>
        </div>

        {/* Tags */}
        {restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {restaurant.tags.slice(0, 4).map((tag) => (
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

        {/* Match score */}
        {restaurant.matchScore != null && restaurant.matchScore > 0 && (
          <MatchBar score={restaurant.matchScore} />
        )}

        {/* CTA */}
        <div
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: "var(--or)" }}
        >
          Voir la fiche →
=======
import type { RestaurantCardDTO } from "@/lib/api";

const MICHELIN_BADGE: Record<string, { label: string; color: string }> = {
  ETOILE: { label: "⭐ Étoilé", color: "var(--or)" },
  BIB_GOURMAND: { label: "😊 Bib Gourmand", color: "var(--rouge)" },
  ETOILE_VERTE: { label: "🌿 Étoile Verte", color: "#4caf50" },
  SELECTION: { label: "◆ Sélection", color: "var(--muted-foreground)" },
};

const PRICE_LABEL: Record<number, string> = {
  1: "€",
  2: "€€",
  3: "€€€",
  4: "€€€€",
};

interface Props {
  restaurant: RestaurantCardDTO;
}

export default function RestaurantCard({ restaurant: r }: Props) {
  const badge = MICHELIN_BADGE[r.michelinType] ?? MICHELIN_BADGE.SELECTION;

  return (
    <Link href={`/restaurant/${r.id}`} className="block active:scale-[0.98] transition-transform">
      <div
        className="rounded-2xl overflow-hidden border border-border"
        style={{ background: "var(--card)" }}
      >
        {/* Image */}
        {r.imageUrl ? (
          <div className="h-36 w-full overflow-hidden">
            <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="h-36 w-full flex items-center justify-center text-3xl"
            style={{ background: "var(--muted)" }}
          >
            🍽️
          </div>
        )}

        {/* Infos */}
        <div className="p-3 flex flex-col gap-1.5">
          {/* Nom + badge Michelin */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground leading-tight flex-1">{r.name}</h3>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
              style={{ background: badge.color + "22", color: badge.color }}
            >
              {badge.label}
            </span>
          </div>

          {/* Cuisine + Prix */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{r.cuisine}</span>
            <span>·</span>
            <span>{PRICE_LABEL[r.priceRange] ?? "€"}</span>
            {r.zone && (
              <>
                <span>·</span>
                <span>{r.zone}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {r.tags && r.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {r.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
>>>>>>> main
        </div>
      </div>
    </Link>
  );
}
<<<<<<< HEAD

function MatchBar({ score }: { score: number }) {
  const color = score >= 80 ? "var(--or)" : score >= 60 ? "#f97316" : "var(--muted-foreground)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold tabular-nums" style={{ color, minWidth: 28 }}>
        {score}%
      </span>
    </div>
  );
}
=======
>>>>>>> main
