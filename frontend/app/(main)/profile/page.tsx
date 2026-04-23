"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi, type UserDTO } from "@/lib/api";
import { SebastianLogo } from "@/components/layout/Header";
import Link from "next/link";

const BUDGET_LABEL: Record<number, string> = {
  1: "€ — Petit budget (< 25€)",
  2: "€€ — Budget moyen (25–60€)",
  3: "€€€ — Grand budget (> 60€)",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("sebastianUserId");
    if (!id) { router.replace("/onboarding"); return; }

    usersApi.getById(id)
      .then(setUser)
      .catch(() => {/* afficher état vide */})
      .finally(() => setLoading(false));
  }, [router]);

  function handleReset() {
    localStorage.removeItem("sebastianUserId");
    localStorage.removeItem("sebastianUserName");
    router.replace("/onboarding");
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3">
        <div className="animate-[spin_3s_linear_infinite] opacity-60">
          <SebastianLogo size={40} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4 text-center py-12">
        <SebastianLogo size={48} />
        <p className="text-sm text-muted-foreground">Aucun profil trouvé.</p>
        <Link href="/onboarding" className="text-sm underline" style={{ color: "var(--or)" }}>
          Créer mon profil →
        </Link>
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <SebastianLogo size={40} />
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {user.name}
          </h1>
          <p className="text-xs text-muted-foreground">Empreinte gastronomique personnelle</p>
        </div>
      </div>

      {/* Profil */}
      {profile ? (
        <div className="flex flex-col gap-3">
          <ProfileSection label="Budget" value={BUDGET_LABEL[profile.budget] ?? `Niveau ${profile.budget}`} />
          <ProfileSection label="Cuisines favorites" tags={profile.cuisines} />
          <ProfileSection label="Ambiances" tags={profile.vibes} />
          <ProfileSection label="Occasions" tags={profile.occasions} />
          {profile.diet.length > 0 && <ProfileSection label="Régime alimentaire" tags={profile.diet} />}
          {profile.city && <ProfileSection label="Ville" value={profile.city} />}
        </div>
      ) : (
        <div
          className="rounded-xl p-4 text-sm text-muted-foreground text-center"
          style={{ background: "var(--muted)" }}
        >
          Profil gastronomique non complété.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <Link
          href="/chat"
          className="flex items-center justify-center h-12 rounded-xl font-semibold text-sm tracking-wide transition-all active:scale-95"
          style={{ background: "var(--rouge)", color: "white" }}
        >
          Parler à Sebastian →
        </Link>
        <button
          onClick={handleReset}
          className="h-10 rounded-xl text-xs font-medium text-muted-foreground border border-border transition-all active:scale-95 hover:text-foreground"
        >
          Refaire mon profil
        </button>
      </div>
    </div>
  );
}

function ProfileSection({
  label,
  value,
  tags,
}: {
  label: string;
  value?: string;
  tags?: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl p-3 border border-border" style={{ background: "var(--card)" }}>
      <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{label}</p>
      {value && <p className="text-sm text-foreground">{value}</p>}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full capitalize"
              style={{ background: "var(--muted)", color: "var(--foreground)" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {tags && tags.length === 0 && <p className="text-sm text-muted-foreground italic">Non précisé</p>}
    </div>
  );
}
