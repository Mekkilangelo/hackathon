"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SebastianLogo } from "@/components/layout/Header";
import QuizOption from "@/components/quiz/QuizOption";
import { onboardingApi, usersApi, type QcmAnswer, type OnboardingNextResponse } from "@/lib/api";

const TOTAL_AXES = 7;

const AXIS_LABELS: Record<string, string> = {
  prenom: "Votre prénom",
  nom: "Votre prénom",
  identite: "Votre prénom",
  occasion: "L'occasion",
  regime: "Régime alimentaire",
  budget: "Votre budget",
  ambiance: "L'ambiance",
  cuisine: "La cuisine",
  quartier: "Le quartier",
  ville: "La ville",
};

function getAxisLabel(axis: string): string {
  const key = axis.toLowerCase();
  for (const [k, v] of Object.entries(AXIS_LABELS)) {
    if (key.includes(k)) return v;
  }
  return axis;
}

type QuestionState = Extract<OnboardingNextResponse, { done: false }>;

type Screen = "intro" | "quiz" | "finishing";

export default function OnboardingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [screen, setScreen] = useState<Screen>("intro");
  const [answers, setAnswers] = useState<QcmAnswer[]>([]);
  const [current, setCurrent] = useState<QuestionState | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        setScreen("finishing");
        const user = await usersApi.create({ name: res.profile.name });
        await usersApi.createProfile(user.id, {
          diet: res.profile.diet,
          budget: Number(res.profile.budget),
          vibes: res.profile.vibes,
          occasions: res.profile.occasions,
          cuisines: res.profile.cuisines,
          city: res.profile.city || undefined,
        });
        localStorage.setItem("sebastianUserId", user.id);
        localStorage.setItem("sebastianUserName", res.profile.name);
        setTimeout(() => router.push("/chat"), 1800);
      } else {
        setCurrent(res);
      }
    } catch {
      setError("Sebastian est momentanément indisponible. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function startQuiz() {
    setScreen("quiz");
    fetchNext([]);
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
      answer:
        current.type === "text"
          ? textValue.trim()
          : current.type === "single"
          ? selected[0]
          : selected,
    };

    const next = [...answers, answer];
    setAnswers(next);
    fetchNext(next);
  }

  const progress = answers.length;
  const stepNumber = Math.min(progress + 1, TOTAL_AXES);

  // ── Écran d'introduction ──────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        {/* Halo de fond */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 60%, oklch(0.215 0.098 264 / 0.5) 0%, transparent 70%)",
          }}
        />

        <div className="container-app flex flex-col items-center text-center gap-8 relative z-10 px-6">
          {/* Logo animé */}
          <div className="animate-[spin_12s_linear_infinite] opacity-90">
            <SebastianLogo size={72} />
          </div>

          {/* Message de Sebastian */}
          <div className="flex flex-col gap-3">
            <h1
              className="text-3xl font-bold leading-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Bonjour, je suis Sebastian
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Votre majordome gastronomique personnel. En{" "}
              <span style={{ color: "var(--or)" }} className="font-semibold">
                7 questions
              </span>
              , je vais composer votre empreinte gastronomique pour vous suggérer les meilleures
              tables de Paris.
            </p>
          </div>

          {/* Indicateur du parcours */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {Array.from({ length: TOTAL_AXES }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--border)" }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground -mt-4">7 étapes · environ 2 minutes</p>

          {/* CTA */}
          <button
            type="button"
            onClick={startQuiz}
            className="w-full max-w-xs h-14 rounded-xl font-semibold text-base tracking-wide transition-all active:scale-95"
            style={{ background: "var(--rouge)", color: "white" }}
          >
            Commencer la découverte →
          </button>
        </div>
      </div>
    );
  }

  // ── Écran de fin ──────────────────────────────────────────────────────────────
  if (screen === "finishing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="animate-[spin_3s_linear_infinite] opacity-70">
          <SebastianLogo size={56} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Votre profil est prêt.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Sebastian prépare votre sélection...
          </p>
        </div>
      </div>
    );
  }

  // ── Écran du quiz ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header avec progression */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <SebastianLogo size={28} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Sebastian</p>
          <p className="text-xs text-muted-foreground">Votre majordome gastronomique</p>
        </div>

        {/* Progression explicite */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs font-semibold" style={{ color: "var(--or)" }}>
            {loading && !current ? "…" : `${stepNumber} / ${TOTAL_AXES}`}
          </p>
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
      </div>

      {/* Contenu principal */}
      <div className="container-app flex-1 flex flex-col gap-6 py-4 pb-8">

        {/* Chargement initial */}
        {loading && !current && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="animate-[spin_3s_linear_infinite] opacity-60">
              <SebastianLogo size={48} />
            </div>
            <p className="text-sm text-muted-foreground">Sebastian prépare votre questionnaire...</p>
          </div>
        )}

        {/* Question active */}
        {current && (
          <>
            {/* Label de l'axe courant */}
            <div className="flex items-center gap-2 pt-2">
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--or)" }}
              >
                Étape {stepNumber} · {getAxisLabel(current.axis)}
              </span>
            </div>

            {/* Texte de la question */}
            <div className="flex flex-col gap-1">
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
