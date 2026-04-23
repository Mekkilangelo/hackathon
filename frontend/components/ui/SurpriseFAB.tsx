"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export default function SurpriseFAB() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSurprise = async () => {
    const userId = localStorage.getItem("sebastianUserId");
    if (!userId || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/recommendations/surprise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const restaurant = await res.json();
      router.push(`/restaurant/${restaurant.id}`);
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSurprise}
      disabled={loading}
      aria-label="Surprends-moi"
      className="fixed z-40 flex items-center gap-2 px-4 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-60"
      style={{
        bottom: "80px",
        right: "16px",
        height: "44px",
        background: "var(--or)",
        color: "#000",
        fontWeight: 600,
        fontSize: "13px",
        animation: shake ? "shakeFAB 0.4s ease" : undefined,
      }}
    >
      {loading ? (
        <span
          className="w-4 h-4 rounded-full border-2 animate-spin"
          style={{ borderColor: "#000", borderTopColor: "transparent" }}
        />
      ) : (
        <SparkleIcon />
      )}
      Surprends-moi
    </button>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.26L4 10l5.91-1.74z" />
    </svg>
  );
}
