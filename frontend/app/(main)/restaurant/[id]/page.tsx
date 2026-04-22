import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPriceRange,
  formatServiceHours,
  getMichelinMeta,
  getRestaurantDetailData,
} from "@/lib/restaurant-data";

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = await getRestaurantDetailData(id);

  if (!restaurant) {
    notFound();
  }

  const michelin = getMichelinMeta(restaurant.michelinType);
  const gallery = [restaurant.imageUrl, ...restaurant.gallery];
  const hours = formatServiceHours(restaurant.hours);
  const reservationHref = `https://www.google.com/search?q=${encodeURIComponent(
    `${restaurant.name} Paris reservation`,
  )}`;

  return (
    <div className="flex flex-col gap-6 py-4 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/results"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Retour
        </Link>
        <span
          className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: michelin.accent, background: michelin.surface }}
        >
          {michelin.label}
        </span>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-border bg-card/85 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="relative h-[320px] overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.8) 100%)",
            }}
          />

          <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm">
                {restaurant.cuisine}
              </span>
              <span className="rounded-full bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm">
                {restaurant.zone}
              </span>
              <span className="rounded-full bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm">
                {restaurant.ambiance}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h1
                  className="text-4xl font-semibold leading-none text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {restaurant.name}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/78">
                  {restaurant.address}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-white/12 px-4 py-2 text-base font-semibold text-white backdrop-blur-sm">
                {formatPriceRange(restaurant.priceRange)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-border bg-card/75 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Note Sebastian
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/88">
            {restaurant.recommendationReason ??
              "Une table choisie pour son identité claire, son exécution solide et la sensation de moment juste qu'elle sait installer."}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {restaurant.description}
          </p>
        </div>

        <div className="rounded-[24px] border border-border bg-card/75 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Détails
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Match</p>
              <p className="mt-1 font-semibold text-foreground">{restaurant.matchScore}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ambiance</p>
              <p className="mt-1 font-semibold text-foreground">{restaurant.ambiance}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quartier</p>
              <p className="mt-1 font-semibold text-foreground">{restaurant.zone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cuisine</p>
              <p className="mt-1 font-semibold text-foreground">{restaurant.cuisine}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-card/75 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Galerie</p>
            <h2
              className="mt-2 text-2xl font-semibold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Le décor compte autant que l&apos;assiette.
            </h2>
          </div>

          <a
            href={reservationHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ background: "var(--rouge)" }}
          >
            Réserver
          </a>
        </div>

        <div className="mt-5 flex snap-x gap-3 overflow-x-auto pb-1">
          {gallery.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative h-56 min-w-[240px] snap-start overflow-hidden rounded-[20px] border border-white/8"
            >
              <img
                src={image}
                alt={`${restaurant.name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-card/75 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Horaires</p>
            <h2
              className="mt-2 text-2xl font-semibold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Quand y aller
            </h2>
          </div>
          <Link
            href="/results"
            className="text-sm font-semibold transition-colors"
            style={{ color: "var(--or)" }}
          >
            Voir les autres →
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {hours.map(({ day, slot }) => (
            <div
              key={day}
              className="flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm"
            >
              <span className="font-medium text-foreground">{day}</span>
              <span className="text-right text-muted-foreground">{slot}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
