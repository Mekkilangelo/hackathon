"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SebastianLogo } from "@/components/layout/Header";
import QuizOption from "@/components/quiz/QuizOption";
import { onboardingApi, usersApi, type QcmAnswer, type OnboardingNextResponse } from "@/lib/api";

const TOTAL_AXES = 7;

type QuestionState = Extract<OnboardingNextResponse, { done: false }>;

export default function OnboardingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [answers, setAnswers] = useState<QcmAnswer[]>([]);
  const [current, setCurrent] = useState<QuestionState | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  // Charge la première question au montage
  useEffect(() => {
    fetchNext([]);
  }, []);

  // Focus sur l'input texte quand la question est de type "text"
  useEffect(() => {
    if (current?.type === "text") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [current]);

  async function fetchNext(history: QcmAnswer[]) {
    setLoading(true);
    setError("");
    setSelected([]);
    setTextValue("");
    try {
      const res = await onboardingApi.next(history);

      if (res.done) {
        setFinishing(true);
        const user = await usersApi.create({ name: res.profile.name });
        await usersApi.createProfile(user.id, {
          diet: res.profile.diet,
          budget: res.profile.budget,
          vibes: res.profile.vibes,
          occasions: res.profile.occasions,
          cuisines: res.profile.cuisines,
          city: res.profile.city || undefined,
        });
        localStorage.setItem("sebastianUserId", user.id);
        localStorage.setItem("sebastianUserName", res.profile.name);
        setTimeout(() => router.push("/chat"), 1600);
      } else {
        setCurrent(res);
      }
    } catch {
      setError("Sebastian est momentanément indisponible. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function canContinue(): boolean {
    if (!current) return false;
    if (current.type === "text") return textValue.trim().length >= 1;
    if (current.type === "single") return selected.length === 1;
    return selected.length >= 1;
  }

  function handleContinue() {
    if (!current || !canContinue() || loading) return;

    const answer: QcmAnswer = {
      axis: current.axis,
      question: current.question,
      answer: current.type === "text" ? textValue.trim() : current.type === "single" ? selected[0] : selected,
    };

    const next = [...answers, answer];
    setAnswers(next);
    fetchNext(next);
  }

  const progress = answers.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <SebastianLogo size={28} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Sebastian</p>
          <p className="text-xs text-muted-foreground">Votre majordome gastronomique</p>
        </div>
        {/* Progression par axes */}
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_AXES }).map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i < progress ? "var(--or)" : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-app flex-1 flex flex-col gap-6 py-4 pb-8">

        {/* État de chargement initial */}
        {loading && !current && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="animate-[spin_3s_linear_infinite] opacity-60">
              <SebastianLogo size={48} />
            </div>
            <p className="text-sm text-muted-foreground">Sebastian prépare votre questionnaire...</p>
          </div>
        )}

        {/* État final */}
        {finishing && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <SebastianLogo size={56} />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Votre profil est prêt.</p>
              <p className="text-sm text-muted-foreground mt-1">Sebastian prépare votre sélection...</p>
            </div>
          </div>
        )}

        {/* Question active */}
        {current && !finishing && (
          <>
            {/* Texte de la question */}
            <div className="flex flex-col gap-1 pt-2">
              <h2
                className="text-2xl font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {current.question}
              </h2>
              {current.subtitle && (
                <p className="text-sm text-muted-foreground">{current.subtitle}</p>
              )}
            </div>

            {/* Options QCM */}
            {(current.type === "single" || current.type === "multiple") && current.options && (
              <div className="flex flex-col gap-2">
                {current.options.map((opt) => (
                  <QuizOption
                    key={opt.value}
                    label={opt.label}
                    emoji={opt.emoji}
                    selected={selected.includes(opt.value)}
                    onClick={() => {
                      if (current.type === "single") {
                        setSelected([opt.value]);
                      } else {
                        toggle(opt.value);
                      }
                    }}
                    disabled={loading}
                  />
                ))}
              </div>
            )}

            {/* Champ texte libre */}
            {current.type === "text" && (
              <input
                ref={inputRef}
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canContinue() && handleContinue()}
                placeholder="Votre réponse..."
                disabled={loading}
                maxLength={60}
                className="w-full h-14 px-4 rounded-xl border border-border bg-card text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-40"
                style={{ "--tw-ring-color": "var(--or)" } as React.CSSProperties}
              />
            )}

            {/* Erreur */}
            {error && (
              <p className="text-sm text-center" style={{ color: "var(--rouge)" }}>
                {error}
                <button
                  onClick={() => fetchNext(answers)}
                  className="ml-2 underline text-sm"
                  style={{ color: "var(--or)" }}
                >
                  Réessayer
                </button>
              </p>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-auto pt-4">
              {answers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const prev = answers.slice(0, -1);
                    setAnswers(prev);
                    fetchNext(prev);
                  }}
                  disabled={loading}
                  className="h-12 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-foreground/20 active:scale-95 disabled:opacity-40"
                >
                  Retour
                </button>
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue() || loading}
                className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--rouge)", color: "white" }}
              >
                {loading ? "Sebastian réfléchit..." : "Continuer →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
