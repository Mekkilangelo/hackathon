import Link from "next/link";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import { getEpicSixRecommendations } from "@/lib/restaurant-data";

interface ResultsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getFirstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isDefined(value: string | undefined): value is string {
  return value !== undefined;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const query = await searchParams;
  const budget = Number.parseInt(getFirstParam(query.budget) ?? "", 10);
  const context = {
    budget: Number.isNaN(budget) ? undefined : budget,
    cuisine: getFirstParam(query.cuisine),
    occasion: getFirstParam(query.occasion),
    vibe: getFirstParam(query.vibe),
    zone: getFirstParam(query.zone),
  };

  const { intro, restaurants } = await getEpicSixRecommendations(context);
  const activeFilters = [
    context.occasion,
    context.vibe,
    context.cuisine,
    context.zone,
    context.budget ? `${context.budget} €` : undefined,
  ].filter(isDefined);

  return (
    <div className="flex flex-col gap-6 py-5 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-border bg-card/85 px-5 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at top right, oklch(0.807 0.094 78 / 0.18), transparent 38%), radial-gradient(circle at bottom left, oklch(0.495 0.228 26.5 / 0.16), transparent 42%)",
          }}
        />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="w-fit rounded-full border border-white/10 bg-background/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Selection Sebastian
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              3 adresses
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1
              className="text-3xl font-semibold leading-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              J&apos;ai retenu les tables qui tiennent vraiment la route.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.16em] text-foreground/80"
                >
                  {filter}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {restaurants.length > 0 ? (
        <section className="flex flex-col gap-4">
          {restaurants.map((restaurant, index) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              href={`/restaurant/${restaurant.id}`}
              revealDelayMs={index * 90}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-[24px] border border-dashed border-border px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Sebastian n&apos;a rien retenu pour le moment.
          </p>
        </section>
      )}

      <section className="rounded-[24px] border border-border bg-card/70 p-5 text-sm text-muted-foreground">
        <p className="leading-relaxed">
          Les recommandations sont mockées en attendant l&apos;Epic 5. Le rendu est prêt pour
          être branché ensuite sur le vrai moteur de recommandation.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/chat"
            className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ background: "var(--rouge)" }}
          >
            Retour au chat
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-white/16"
          >
            Revenir a l&apos;accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
