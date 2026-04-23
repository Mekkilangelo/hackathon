"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSurpriseRestaurant, type RestaurantCardDisplay } from "@/lib/restaurant-data";

export default function SurpriseFab() {
  const pathname = usePathname();
  const router = useRouter();
  const [isRolling, setIsRolling] = useState(false);
  const [preview, setPreview] = useState<RestaurantCardDisplay | null>(null);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsRolling(false);
    setPreview(null);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname]);

  if (pathname.startsWith("/restaurant/")) {
    return null;
  }

  const handleClick = async () => {
    if (isRolling || isPending) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsRolling(true);
    setPreview(null);

    try {
      const userId = window.localStorage.getItem("sebastianUserId") ?? undefined;
      const restaurant = await getSurpriseRestaurant(userId);

      setPreview(restaurant);

      timeoutRef.current = window.setTimeout(() => {
        startTransition(() => {
          router.push(`/restaurant/${restaurant.id}?source=surprise`);
        });
      }, 900);
    } catch {
      setIsRolling(false);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center">
      <div className="container-app flex flex-col items-end gap-3">
        {preview && (
          <div
            className="pointer-events-auto w-full max-w-[320px] rounded-[22px] border border-white/10 bg-card/92 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md animate-[surprise-card-in_420ms_ease-out]"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Sebastian a choisi
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <h2
                  className="text-xl font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {preview.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {preview.cuisine} · {preview.zone} · {preview.ambiance}
                </p>
              </div>
              <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground">
                {preview.matchScore}%
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/84">
              {preview.recommendationReason}
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background/80">
              <div
                className="h-full rounded-full"
                style={{
                  width: "100%",
                  background: "linear-gradient(90deg, var(--rouge), var(--or))",
                  animation: "surprise-progress 900ms linear forwards",
                }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={isRolling || isPending}
          className="pointer-events-auto inline-flex h-14 items-center gap-3 rounded-full border border-white/10 px-5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.32)] backdrop-blur-md transition-transform duration-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-90"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.495 0.228 26.5) 0%, oklch(0.56 0.19 34) 55%, oklch(0.807 0.094 78) 140%)",
          }}
          aria-label="Demander une surprise à Sebastian"
        >
          <span
            className="inline-flex size-8 items-center justify-center rounded-full bg-black/15"
            style={{
              animation: isRolling ? "surprise-spin 1s linear infinite" : undefined,
            }}
          >
            ✦
          </span>
          <span>{isRolling ? "Sebastian choisit..." : "Surprends-moi"}</span>
        </button>
      </div>
    </div>
  );
}
