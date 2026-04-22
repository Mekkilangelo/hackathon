import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Sebastian n&apos;a rien retrouvé ici
      </p>
      <h1
        className="text-3xl font-semibold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Cette fiche n&apos;existe pas.
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Repars des recommandations pour ouvrir une table connue du mode démo Epic 6.
      </p>
      <Link
        href="/results"
        className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white"
        style={{ background: "var(--rouge)" }}
      >
        Retour aux recommandations
      </Link>
    </div>
  );
}
