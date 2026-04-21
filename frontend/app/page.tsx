import Link from "next/link";
import { SebastianLogo } from "@/components/layout/Header";

export default function SplashPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden relative">
      {/* Halo de fond */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 60%, oklch(0.215 0.098 264 / 0.6) 0%, transparent 70%)",
        }}
      />

      <div className="container-app flex flex-col items-center text-center gap-10 relative z-10">
        {/* Logo animé */}
        <div className="animate-[spin_12s_linear_infinite] opacity-90">
          <SebastianLogo size={96} />
        </div>

        {/* Titre */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-5xl font-bold tracking-tight text-foreground leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sebastian
          </h1>
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Le Majordome Michelin
          </p>
        </div>

        {/* Tagline */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
          Découvre les meilleures tables de Paris,{" "}
          <span style={{ color: "var(--or)" }}>sélectionnées pour toi</span>.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/onboarding"
            className="flex items-center justify-center h-14 rounded-xl font-semibold text-base tracking-wide transition-all active:scale-95"
            style={{
              background: "var(--rouge)",
              color: "white",
            }}
          >
            Découvrir mes goûts
          </Link>
          <Link
            href="/chat"
            className="flex items-center justify-center h-12 rounded-xl text-sm font-medium border border-border text-muted-foreground transition-all hover:text-foreground hover:border-foreground/20 active:scale-95"
          >
            Déjà un profil ? Parler à Sebastian
          </Link>
        </div>

        {/* Michelin badge */}
        <p className="text-xs text-muted-foreground/50 tracking-widest uppercase">
          Guide Michelin · Paris · 2026
        </p>
      </div>
    </div>
  );
}
