"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuizStep from "@/components/quiz/QuizStep";
import QuizOption from "@/components/quiz/QuizOption";
import { usersApi } from "@/lib/api";
import { SebastianLogo } from "@/components/layout/Header";

const TOTAL_STEPS = 7;

const DIET_OPTIONS = [
  { label: "Tout mange", emoji: "🍽️", value: "tout" },
  { label: "Végétarien", emoji: "🥦", value: "vegetarien" },
  { label: "Vegan", emoji: "🌱", value: "vegan" },
  { label: "Halal", emoji: "☪️", value: "halal" },
  { label: "Sans gluten", emoji: "🌾", value: "sans-gluten" },
  { label: "Casher", emoji: "✡️", value: "casher" },
];

const VIBE_OPTIONS = [
  { label: "Cozy & intime", emoji: "🕯️", value: "cozy" },
  { label: "Branché & tendance", emoji: "✨", value: "branché" },
  { label: "Rooftop & terrasse", emoji: "🌇", value: "rooftop" },
  { label: "Street food", emoji: "🌮", value: "street-food" },
  { label: "Gastronomique", emoji: "⭐", value: "gastro" },
  { label: "Brasserie classique", emoji: "🥂", value: "brasserie" },
];

const OCCASION_OPTIONS = [
  { label: "Soirée en amoureux", emoji: "💑", value: "date" },
  { label: "Entre amis", emoji: "🎉", value: "amis" },
  { label: "Solo / déjeuner travail", emoji: "💼", value: "solo" },
  { label: "Business dinner", emoji: "🤝", value: "business" },
  { label: "Repas en famille", emoji: "👨‍👩‍👧", value: "famille" },
  { label: "Brunch du dimanche", emoji: "🥐", value: "brunch" },
];

const CUISINE_OPTIONS = [
  { label: "Française", emoji: "🇫🇷", value: "française" },
  { label: "Italienne", emoji: "🇮🇹", value: "italienne" },
  { label: "Japonaise", emoji: "🇯🇵", value: "japonaise" },
  { label: "Mexicaine", emoji: "🇲🇽", value: "mexicaine" },
  { label: "Indienne", emoji: "🇮🇳", value: "indienne" },
  { label: "Fusion / créative", emoji: "🔮", value: "fusion" },
  { label: "Méditerranéenne", emoji: "🫒", value: "méditerranéenne" },
  { label: "Asiatique", emoji: "🥢", value: "asiatique" },
];

const ZONE_OPTIONS = [
  { label: "Marais / République (3e–4e)", value: "3e-4e" },
  { label: "Saint-Germain (5e–6e)", value: "5e-6e" },
  { label: "Châtelet / Louvre (1er–2e)", value: "1er-2e" },
  { label: "Oberkampf / Nation (11e–12e)", value: "11e-12e" },
  { label: "Canal Saint-Martin (10e)", value: "10e" },
  { label: "Montmartre / Pigalle (9e–18e)", value: "9e-18e" },
  { label: "Champs-Élysées / Étoile (8e)", value: "8e" },
  { label: "Bastille / Bercy (11e–13e)", value: "11e-13e" },
  { label: "Pas de préférence", value: "all" },
];

interface QuizState {
  name: string;
  diet: string[];
  budget: number;
  vibes: string[];
  occasions: string[];
  cuisines: string[];
  zone: string;
}

const initialState: QuizState = {
  name: "",
  diet: [],
  budget: 0,
  vibes: [],
  occasions: [],
  cuisines: [],
  zone: "",
};

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState<QuizState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canNext = (): boolean => {
    switch (step) {
      case 1: return quiz.name.trim().length >= 2;
      case 2: return quiz.diet.length > 0;
      case 3: return quiz.budget > 0;
      case 4: return quiz.vibes.length > 0;
      case 5: return quiz.occasions.length > 0;
      case 6: return quiz.cuisines.length > 0;
      case 7: return quiz.zone !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await usersApi.create({ name: quiz.name.trim() });
      await usersApi.createProfile(user.id, {
        diet: quiz.diet,
        budget: quiz.budget,
        vibes: quiz.vibes,
        occasions: quiz.occasions,
        cuisines: quiz.cuisines,
        zone: quiz.zone === "all" ? undefined : quiz.zone,
      });
      localStorage.setItem("sebastianUserId", user.id);
      localStorage.setItem("sebastianUserName", user.name);
      router.push("/chat");
    } catch {
      setError("Une erreur est survenue. Réessaie !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex justify-center pt-6 pb-2">
        <SebastianLogo size={32} />
      </div>

      <div className="container-app flex-1 flex flex-col gap-6 py-4 pb-8">
        <QuizProgress current={step} total={TOTAL_STEPS} />

        {/* Étape 1 — Prénom */}
        {step === 1 && (
          <QuizStep
            visible
            title="Comment tu t'appelles ?"
            subtitle="Sebastian se souviendra de toi."
          >
            <input
              autoFocus
              type="text"
              placeholder="Ton prénom..."
              value={quiz.name}
              onChange={(e) => setQuiz({ ...quiz, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && canNext() && handleNext()}
              className="w-full h-14 px-4 rounded-xl border border-border bg-card text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
              style={{ "--tw-ring-color": "var(--or)" } as React.CSSProperties}
              maxLength={40}
            />
          </QuizStep>
        )}

        {/* Étape 2 — Régime alimentaire */}
        {step === 2 && (
          <QuizStep
            visible
            title="Tu as des préférences alimentaires ?"
            subtitle="Plusieurs choix possibles."
          >
            <div className="flex flex-col gap-2">
              {DIET_OPTIONS.map((opt) => (
                <QuizOption
                  key={opt.value}
                  label={opt.label}
                  emoji={opt.emoji}
                  selected={quiz.diet.includes(opt.value)}
                  onClick={() => setQuiz({ ...quiz, diet: toggle(quiz.diet, opt.value) })}
                />
              ))}
            </div>
          </QuizStep>
        )}

        {/* Étape 3 — Budget */}
        {step === 3 && (
          <QuizStep
            visible
            title="Ton budget habituel ?"
            subtitle="Par personne, hors boissons."
          >
            <div className="flex flex-col gap-2">
              {[
                { label: "Moins de 25€", emoji: "€", value: 1 },
                { label: "25€ – 60€", emoji: "€€", value: 2 },
                { label: "Plus de 60€", emoji: "€€€", value: 3 },
              ].map((opt) => (
                <QuizOption
                  key={opt.value}
                  label={opt.label}
                  emoji={opt.emoji}
                  selected={quiz.budget === opt.value}
                  onClick={() => setQuiz({ ...quiz, budget: opt.value })}
                />
              ))}
            </div>
          </QuizStep>
        )}

        {/* Étape 4 — Ambiances */}
        {step === 4 && (
          <QuizStep
            visible
            title="Quelles ambiances tu aimes ?"
            subtitle="Plusieurs choix possibles."
          >
            <div className="flex flex-col gap-2">
              {VIBE_OPTIONS.map((opt) => (
                <QuizOption
                  key={opt.value}
                  label={opt.label}
                  emoji={opt.emoji}
                  selected={quiz.vibes.includes(opt.value)}
                  onClick={() => setQuiz({ ...quiz, vibes: toggle(quiz.vibes, opt.value) })}
                />
              ))}
            </div>
          </QuizStep>
        )}

        {/* Étape 5 — Occasions */}
        {step === 5 && (
          <QuizStep
            visible
            title="Pour quelles occasions tu sors ?"
            subtitle="Plusieurs choix possibles."
          >
            <div className="flex flex-col gap-2">
              {OCCASION_OPTIONS.map((opt) => (
                <QuizOption
                  key={opt.value}
                  label={opt.label}
                  emoji={opt.emoji}
                  selected={quiz.occasions.includes(opt.value)}
                  onClick={() =>
                    setQuiz({ ...quiz, occasions: toggle(quiz.occasions, opt.value) })
                  }
                />
              ))}
            </div>
          </QuizStep>
        )}

        {/* Étape 6 — Cuisines */}
        {step === 6 && (
          <QuizStep
            visible
            title="Tes cuisines favorites ?"
            subtitle="Plusieurs choix possibles."
          >
            <div className="flex flex-col gap-2">
              {CUISINE_OPTIONS.map((opt) => (
                <QuizOption
                  key={opt.value}
                  label={opt.label}
                  emoji={opt.emoji}
                  selected={quiz.cuisines.includes(opt.value)}
                  onClick={() =>
                    setQuiz({ ...quiz, cuisines: toggle(quiz.cuisines, opt.value) })
                  }
                />
              ))}
            </div>
          </QuizStep>
        )}

        {/* Étape 7 — Zone */}
        {step === 7 && (
          <QuizStep
            visible
            title={`Presque fini, ${quiz.name} !`}
            subtitle="Ton quartier de prédilection à Paris ?"
          >
            <div className="flex flex-col gap-2">
              {ZONE_OPTIONS.map((opt) => (
                <QuizOption
                  key={opt.value}
                  label={opt.label}
                  selected={quiz.zone === opt.value}
                  onClick={() => setQuiz({ ...quiz, zone: opt.value })}
                />
              ))}
            </div>
          </QuizStep>
        )}

        {/* Erreur */}
        {error && (
          <p className="text-sm text-center" style={{ color: "var(--rouge)" }}>
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-auto pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-foreground/20 active:scale-95"
            >
              Retour
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext()}
              className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--rouge)", color: "white" }}
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canNext() || loading}
              className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--rouge)", color: "white" }}
            >
              {loading ? "Sebastian prépare ton profil..." : "Rencontrer Sebastian →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
