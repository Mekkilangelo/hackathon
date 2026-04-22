import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RestaurantCardDisplay } from "@/lib/restaurant-data";
import { formatPriceRange, getMichelinMeta } from "@/lib/restaurant-data";

interface RestaurantCardProps {
  restaurant: RestaurantCardDisplay;
  href?: string;
  variant?: "compact" | "full";
  revealDelayMs?: number;
  className?: string;
}

export default function RestaurantCard({
  restaurant,
  href,
  variant = "full",
  revealDelayMs,
  className,
}: RestaurantCardProps) {
  const michelin = getMichelinMeta(restaurant.michelinType);
  const animated = revealDelayMs !== undefined;

  const content = (
    <article
      className={cn(
        "overflow-hidden rounded-[24px] border border-border bg-card/80 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-sm",
        animated && "opacity-0",
        className,
      )}
      style={
        animated
          ? {
              animation: "card-reveal 560ms ease-out forwards",
              animationDelay: `${revealDelayMs}ms`,
            }
          : undefined
      }
    >
      {variant === "compact" ? (
        <div className="flex gap-4 p-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px]">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="mb-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: michelin.accent, background: michelin.surface }}
                >
                  {michelin.shortLabel}
                </p>
                <h2
                  className="truncate text-lg font-semibold leading-tight text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {restaurant.name}
                </h2>
              </div>

              {restaurant.matchScore > 0 && (
                <span className="rounded-full border border-white/10 bg-background/80 px-2 py-1 text-xs font-semibold text-foreground">
                  {restaurant.matchScore}%
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {restaurant.cuisine} · {restaurant.zone} · {formatPriceRange(restaurant.priceRange)}
            </p>

            {restaurant.recommendationReason && (
              <p className="line-clamp-2 text-sm leading-relaxed text-foreground/85">
                {restaurant.recommendationReason}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="relative h-56 overflow-hidden">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.68) 100%)",
              }}
            />

            <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: michelin.accent, background: michelin.surface }}
              >
                {michelin.label}
              </span>

              {restaurant.matchScore > 0 && (
                <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  {restaurant.matchScore}% match
                </span>
              )}
            </div>

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2
                  className="text-2xl font-semibold leading-tight text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {restaurant.name}
                </h2>
                <p className="mt-1 text-sm text-white/78">
                  {restaurant.cuisine} · {restaurant.zone} · {restaurant.ambiance}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                {formatPriceRange(restaurant.priceRange)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5">
            {restaurant.recommendationReason && (
              <p className="text-sm leading-relaxed text-foreground/88">
                {restaurant.recommendationReason}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {restaurant.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Voir la fiche complète</span>
              <span className="font-semibold" style={{ color: "var(--or)" }}>
                Ouvrir →
              </span>
            </div>
          </div>
        </div>
      )}
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="group block transition-transform duration-200 active:scale-[0.99]"
    >
      {content}
    </Link>
  );
}
