import Link from "next/link";
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
        </div>
      </div>
    </Link>
  );
}
