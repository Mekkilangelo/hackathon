"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import { SebastianLogo } from "@/components/layout/Header";
import Link from "next/link";

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = localStorage.getItem("sebastianUserId");
    const name = localStorage.getItem("sebastianUserName") ?? "";
    if (!id) {
      router.replace("/onboarding");
      return;
    }
    setUserId(id);
    setUserName(name);
  }, [router]);

  const { messages, loading, sending, error, sendMessage } = useChat(userId);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!userId) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header du chat */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0"
        style={{ background: "var(--card)" }}
      >
        <SebastianLogo size={28} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Sebastian</p>
          <p className="text-xs text-muted-foreground">
            {sending ? "Sebastian réfléchit..." : "Votre majordome gastronomique"}
          </p>
        </div>
        {/* Bouton Surprends-moi */}
        <SurprendsMoiButton userId={userId} />
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
            <div className="animate-[spin_3s_linear_infinite] opacity-60">
              <SebastianLogo size={40} />
            </div>
            <p className="text-sm text-muted-foreground">Sebastian prépare votre accueil...</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-center">
            <SebastianLogo size={40} />
            <p className="text-sm text-muted-foreground">La conversation démarre...</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Indicateur de frappe de Sebastian */}
        {sending && (
          <div className="flex gap-2 items-center">
            <SebastianLogo size={24} />
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-center" style={{ color: "var(--rouge)" }}>
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="shrink-0">
        <ChatInput onSend={sendMessage} disabled={loading || sending} />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{
            background: "var(--or)",
            animationDelay: `${i * 150}ms`,
            animationDuration: "600ms",
          }}
        />
      ))}
    </div>
  );
}

function SurprendsMoiButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSurprise() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/recommendations/surprise`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        router.push(`/restaurant/${data.id}`);
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSurprise}
      disabled={loading}
      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border transition-all active:scale-95 disabled:opacity-40"
      style={{ color: "var(--or)" }}
      title="Surprends-moi"
    >
      {loading ? "..." : "✨ Surprise"}
    </button>
  );
}
