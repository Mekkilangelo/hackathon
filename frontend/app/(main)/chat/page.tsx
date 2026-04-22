import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col justify-center py-6">
      <EmptyState
        eyebrow="Conversation en préparation"
        title="Le chat Sebastian arrive ensuite."
        description="L'Epic 7 prépare les finitions du parcours pendant que l'Epic 5 branche encore la vraie conversation IA."
        actions={
          <>
            <Link
              href="/results"
              className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              style={{ background: "var(--rouge)" }}
            >
              Voir la démo résultats
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-white/16"
            >
              Refaire mon onboarding
            </Link>
          </>
        }
      />
    </div>
  );
}
