import Link from "next/link";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: string;
  greenStar: boolean;
  zone: string | null;
  location: string;
  tags: string[];
  ambiance: string | null;
}

const MICHELIN_BADGE: Record<string, { label: string; color: string }> = {
  ETOILE: { label: "⭐", color: "var(--or)" },
  BIB_GOURMAND: { label: "😊", color: "var(--rouge)" },
  ETOILE_VERTE: { label: "🌿", color: "#4caf50" },
  SELECTION: { label: "●", color: "var(--muted-foreground)" },
};

function priceSymbol(n: number) {
  return "€".repeat(Math.min(n, 4));
}

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const badge = MICHELIN_BADGE[restaurant.michelinType] ?? MICHELIN_BADGE.SELECTION;
  const zone = restaurant.zone ?? restaurant.location.split(",")[0];

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div
        className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer transition-all active:scale-[0.98]"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{restaurant.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {restaurant.cuisine} · {zone}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {restaurant.greenStar && <span className="text-sm">🌿</span>}
            <span className="text-base leading-none">{badge.label}</span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "var(--or)" }}
            >
              {priceSymbol(restaurant.priceRange)}
            </span>
          </div>
        </div>

        {/* Tags */}
        {restaurant.tags.slice(0, 3).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--marine)",
                  color: "var(--or)",
                  border: "1px solid var(--or)20",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
