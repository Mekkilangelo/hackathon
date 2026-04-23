"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import type { RestaurantCardDTO } from "@/lib/api";
import { SebastianLogo } from "@/components/layout/Header";
import Link from "next/link";

function ResultsContent() {
  const params = useSearchParams();
  const raw = params.get("data");

  let restaurants: RestaurantCardDTO[] = [];
  if (raw) {
    try {
      restaurants = JSON.parse(decodeURIComponent(raw));
    } catch {
      // données invalides
    }
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4 text-center py-12">
        <SebastianLogo size={48} />
        <p className="text-sm text-muted-foreground">Aucune sélection disponible.</p>
        <Link
          href="/chat"
          className="text-sm font-medium underline"
          style={{ color: "var(--or)" }}
        >
          Parler à Sebastian
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* En-tête Sebastian */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <SebastianLogo size={20} />
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            La sélection de Sebastian
          </p>
        </div>
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {restaurants.length === 1
            ? "Votre table du soir"
            : `${restaurants.length} tables pour vous`}
        </h1>
      </div>

      {/* Cartes */}
      <div className="flex flex-col gap-3">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>

      {/* Lien retour */}
      <Link
        href="/chat"
        className="text-sm text-center text-muted-foreground underline"
      >
        Affiner avec Sebastian →
      </Link>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 items-center justify-center">
          <div className="animate-[spin_3s_linear_infinite] opacity-60">
            <SebastianLogo size={40} />
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
