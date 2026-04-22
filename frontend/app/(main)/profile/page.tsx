import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col justify-center py-6">
      <EmptyState
        eyebrow="Profil bientôt enrichi"
        title="Ton empreinte gastronomique sera visible ici."
        description="Le profil n'affiche pas encore toutes les réponses du quiz, mais le parcours principal est déjà prêt pour les résultats et le mode surprise."
        actions={
          <>
            <Link
              href="/results?occasion=date"
              className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              style={{ background: "var(--rouge)" }}
            >
              Explorer les tables
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-white/16"
            >
              Mettre à jour mes goûts
            </Link>
          </>
        }
      />
    </div>
  );
}
