"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatBubble from "@/components/chat/ChatBubble";
import SebastianAvatar from "@/components/chat/SebastianAvatar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Message {
  id: string;
  role: "USER" | "SEBASTIAN";
  content: string;
  metadata?: { restaurants?: unknown[] };
  createdAt: string;
}

const SUGGESTIONS = [
  "Recommande-moi un restaurant ce soir",
  "J'ai envie de japonais",
  "Quelque chose de romantique",
  "Surprise-moi !",
];

async function apiPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("sebastianUserId");
    if (!userId) { router.push("/onboarding"); return; }

    const storedSession = localStorage.getItem("sebastianSessionId");

    (async () => {
      try {
        let sid = storedSession;

        if (!sid) {
          const { sessionId: newSid } = await apiPost<{ sessionId: string }>(
            "/chat/session",
            { userId }
          );
          sid = newSid;
          localStorage.setItem("sebastianSessionId", sid);
        }

        setSessionId(sid);
        const history = await apiGet<Message[]>(`/chat/sessions/${sid}/messages`);
        setMessages(history);
        scrollToBottom();
      } catch {
        // session invalide → on en recrée une
        localStorage.removeItem("sebastianSessionId");
        router.refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [router, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || !text.trim() || sending) return;

    const userMsg: Message = {
      id: `tmp-${Date.now()}`,
      role: "USER",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    scrollToBottom();

    try {
      const visitedIds = JSON.parse(localStorage.getItem("sebastianVisited") ?? "[]") as string[];
      const reply = await apiPost<Message>(
        `/chat/sessions/${sessionId}/messages`,
        { content: text.trim(), visitedRestaurantIds: visitedIds }
      );
      setMessages((prev) => [...prev, reply]);
      scrollToBottom();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "SEBASTIAN",
          content: "Je suis momentanément indisponible. Veuillez réessayer.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [sessionId, sending, scrollToBottom]);

  const clearChat = useCallback(async () => {
    const userId = localStorage.getItem("sebastianUserId");
    if (!userId || !sessionId) return;
    try {
      await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, { method: "DELETE" });
    } catch { /* session peut déjà ne plus exister */ }
    const { sessionId: newSid } = await apiPost<{ sessionId: string }>("/chat/sessions", { userId });
    localStorage.setItem("sebastianSessionId", newSid);
    setSessionId(newSid);
    setMessages([]);
  }, [sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--or)", borderTopColor: "transparent" }}
        />
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Sebastian arrive…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Barre d'actions */}
      {messages.length > 0 && (
        <div className="flex justify-end px-4 pt-2 pb-1">
          <button
            onClick={clearChat}
            disabled={sending}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-40"
            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)", background: "var(--card)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
            Effacer
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Message d'accueil si vide */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <SebastianAvatar size={56} />
            <div>
              <p className="font-semibold text-base" style={{ fontFamily: "var(--font-display)" }}>
                Bonsoir, je suis Sebastian.
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                Votre majordome gastronomique Michelin.
                <br />Comment puis-je vous guider ce soir ?
              </p>
            </div>
            {/* Suggestions */}
            <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-sm px-4 py-2.5 rounded-xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg as Parameters<typeof ChatBubble>[0]["message"]} />
        ))}

        {/* Indicateur de frappe */}
        {sending && (
          <div className="flex gap-2.5 items-end">
            <SebastianAvatar size={30} />
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-sm"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      background: "var(--muted-foreground)",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions rapides si messages existants */}
      {messages.length > 0 && messages.length < 4 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {SUGGESTIONS.slice(0, 3).map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={sending}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: "var(--marine)",
                color: "var(--or)",
                border: "1px solid var(--or)30",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 pb-4 pt-2 flex gap-2 items-end"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Demandez à Sebastian…"
          disabled={sending}
          maxLength={500}
          className="flex-1 h-11 px-4 rounded-xl text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-40"
          style={{ "--tw-ring-color": "var(--or)" } as React.CSSProperties}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "var(--rouge)", color: "white" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
