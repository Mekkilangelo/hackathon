"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usersApi, UserDTO, UserProfileDTO } from "@/lib/api";
import QuizOption from "@/components/quiz/QuizOption";
import {
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-notifications";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// ── Types événements ──────────────────────────────────────────────────────────

interface UserEvent {
  id: string;
  title: string;
  date: string;
  isRecurring: boolean;
  type: string;
  emoji: string;
}

const EVENT_TYPES = [
  { value: "MARIAGE",    label: "Anniversaire de mariage",  emoji: "💍", recurring: true  },
  { value: "FAMILLE",    label: "Anniversaire famille",     emoji: "👨‍👩‍👧", recurring: true  },
  { value: "AMI",        label: "Anniversaire d'un ami",    emoji: "🎂", recurring: true  },
  { value: "DEMANDE",    label: "Demande en mariage",       emoji: "💎", recurring: false },
  { value: "NAISSANCE",  label: "Naissance",                emoji: "👶", recurring: false },
  { value: "UNIQUE",     label: "Occasion unique",          emoji: "🌟", recurring: false },
  { value: "AUTRE",      label: "Autre",                    emoji: "🎉", recurring: false },
];

function daysUntil(dateStr: string, isRecurring: boolean): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (isRecurring) {
    target.setFullYear(today.getFullYear());
    target.setHours(0, 0, 0, 0);
    if (target < today) target.setFullYear(today.getFullYear() + 1);
  } else {
    target.setHours(0, 0, 0, 0);
  }
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function daysLabel(days: number): string {
  if (days < 0) return "passé";
  if (days === 0) return "aujourd'hui 🎉";
  if (days === 1) return "demain";
  if (days <= 7) return `dans ${days} jours`;
  if (days <= 30) return `dans ${Math.ceil(days / 7)} semaines`;
  return `dans ${Math.ceil(days / 30)} mois`;
}

// ── Options (même que onboarding) ────────────────────────────────────────────

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

const BUDGET_OPTIONS = [
  { label: "Moins de 25€", emoji: "€", value: 1 },
  { label: "25€ – 60€", emoji: "€€", value: 2 },
  { label: "Plus de 60€", emoji: "€€€", value: 3 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function labelFor(options: { label: string; value: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
      style={{ background: "var(--marine)", color: "var(--or)", border: "1px solid var(--or)30" }}
    >
      {label}
    </span>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--or)" }}>
        {title}
      </p>
      {children}
=======
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
    if (!id) {
      router.replace("/onboarding");
      return;
    }

    usersApi
      .getById(id)
      .then(setUser)
      .catch(() => {
        /* afficher état vide */
      })
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
          <h1
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {user.name}
          </h1>
          <p className="text-xs text-muted-foreground">Empreinte gastronomique personnelle</p>
        </div>
      </div>

      {/* Profil */}
      {profile ? (
        <div className="flex flex-col gap-3">
          <ProfileSection
            label="Budget"
            value={BUDGET_LABEL[profile.budget] ?? `Niveau ${profile.budget}`}
          />
          <ProfileSection label="Cuisines favorites" tags={profile.cuisines} />
          <ProfileSection label="Ambiances" tags={profile.vibes} />
          <ProfileSection label="Occasions" tags={profile.occasions} />
          {profile.diet.length > 0 && (
            <ProfileSection label="Régime alimentaire" tags={profile.diet} />
          )}
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
>>>>>>> main
    </div>
  );
}

<<<<<<< HEAD
// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [profile, setProfile] = useState<UserProfileDTO>({
    diet: [],
    budget: 2,
    vibes: [],
    occasions: [],
    cuisines: [],
    zone: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Événements ────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    type: "MARIAGE",
    title: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: true,
    emoji: "💍",
  });
  const [savingEvent, setSavingEvent] = useState(false);

  // ── Notifications push ────────────────────────────────────────────────────
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const [togglingNotif, setTogglingNotif] = useState(false);

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleToggleNotifications = async () => {
    if (!user) return;
    setTogglingNotif(true);
    try {
      if (notifPermission === "granted") {
        await unsubscribeFromPush();
        setNotifPermission("default");
      } else {
        const ok = await subscribeToPush(user.id);
        setNotifPermission(ok ? "granted" : Notification.permission);
      }
    } finally {
      setTogglingNotif(false);
    }
  };

  const fetchEvents = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/users/${userId}/events`);
      if (res.ok) setEvents(await res.json());
    } catch { /* ignore */ }
  }, []);

  const handleAddEvent = async () => {
    if (!user || !eventForm.title || !eventForm.date) return;
    setSavingEvent(true);
    try {
      const res = await fetch(`${BASE_URL}/users/${user.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventForm, date: new Date(eventForm.date).toISOString() }),
      });
      if (res.ok) {
        await fetchEvents(user.id);
        setShowEventModal(false);
        setEventForm({ type: "MARIAGE", title: "", date: new Date().toISOString().split("T")[0], isRecurring: true, emoji: "💍" });
      }
    } finally { setSavingEvent(false); }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    await fetch(`${BASE_URL}/users/${user.id}/events/${eventId}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleEventTypeChange = (type: string) => {
    const t = EVENT_TYPES.find((et) => et.value === type);
    setEventForm((f) => ({
      ...f,
      type,
      emoji: t?.emoji ?? "🎉",
      isRecurring: t?.recurring ?? false,
      title: f.title || (t?.label ?? ""),
    }));
  };

  useEffect(() => {
    const userId = localStorage.getItem("sebastianUserId");
    if (!userId) { router.push("/onboarding"); return; }
    usersApi
      .getById(userId)
      .then((u) => {
        setUser(u);
        if (u.profile) setProfile(u.profile);
        fetchEvents(userId);
      })
      .catch(() => {
        localStorage.removeItem("sebastianUserId");
        router.push("/onboarding");
      })
      .finally(() => setLoading(false));
  }, [router, fetchEvents]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      await usersApi.updateProfile(user.id, profile);
      setEditing(false);
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("sebastianUserId");
    localStorage.removeItem("sebastianUserName");
    router.push("/onboarding");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--or)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) return null;

  const zoneLabel = profile.zone && profile.zone !== "all"
    ? labelFor(ZONE_OPTIONS, profile.zone)
    : "Pas de préférence";

  const budgetLabel = BUDGET_OPTIONS.find((b) => b.value === profile.budget);

  // ── Vue lecture ──────────────────────────────────────────────────────────

  if (!editing) {
    return (
      <>
      <div className="container-app flex flex-col gap-4 py-6">
        {/* Avatar + nom */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: "var(--marine)", color: "var(--or)", border: "2px solid var(--or)" }}
          >
            {initials(user.name)}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {user.name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Membre Sebastian
            </p>
          </div>
        </div>

        {/* Sections profil */}
        <Section title="Régime alimentaire">
          <div className="flex flex-wrap gap-2">
            {profile.diet.length > 0
              ? profile.diet.map((d) => <Chip key={d} label={labelFor(DIET_OPTIONS, d)} />)
              : <Chip label="Tout mange" />}
          </div>
        </Section>

        <Section title="Budget">
          <div className="flex flex-wrap gap-2">
            {budgetLabel && (
              <Chip label={`${budgetLabel.emoji} ${budgetLabel.label}`} />
            )}
          </div>
        </Section>

        <Section title="Ambiances">
          <div className="flex flex-wrap gap-2">
            {profile.vibes.map((v) => <Chip key={v} label={labelFor(VIBE_OPTIONS, v)} />)}
          </div>
        </Section>

        <Section title="Occasions">
          <div className="flex flex-wrap gap-2">
            {profile.occasions.map((o) => <Chip key={o} label={labelFor(OCCASION_OPTIONS, o)} />)}
          </div>
        </Section>

        <Section title="Cuisines favorites">
          <div className="flex flex-wrap gap-2">
            {profile.cuisines.map((c) => <Chip key={c} label={labelFor(CUISINE_OPTIONS, c)} />)}
          </div>
        </Section>

        <Section title="Zone Paris">
          <div className="flex flex-wrap gap-2">
            <Chip label={zoneLabel} />
          </div>
        </Section>

        {/* Agenda */}
        <Section title="Mon agenda">
          <div className="flex flex-col gap-2">
            {events.length === 0 && (
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Ajoutez vos occasions importantes pour que Sebastian les prenne en compte.
              </p>
            )}
            {events.map((e) => {
              const days = daysUntil(e.date, e.isRecurring);
              const urgent = days >= 0 && days <= 7;
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{
                    background: urgent ? "oklch(0.807 0.094 78 / 0.08)" : "var(--background)",
                    border: `1px solid ${urgent ? "var(--or)" : "var(--border)"}`,
                  }}
                >
                  <span className="text-xl flex-shrink-0">{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: urgent ? "var(--or)" : "var(--muted-foreground)" }}>
                      {daysLabel(days)}{e.isRecurring ? " · récurrent" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(e.id)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => setShowEventModal(true)}
              className="w-full h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ border: "1px dashed var(--border)", color: "var(--or)" }}
            >
              + Ajouter une occasion
            </button>
          </div>
        </Section>

        {/* Notifications */}
        {notifPermission !== "denied" && (
          <button
            onClick={handleToggleNotifications}
            disabled={togglingNotif}
            className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: notifPermission === "granted" ? "var(--card)" : "var(--marine)",
              color: notifPermission === "granted" ? "var(--muted-foreground)" : "var(--or)",
              border: notifPermission === "granted" ? "1px solid var(--border)" : "none",
            }}
          >
            {togglingNotif
              ? "…"
              : notifPermission === "granted"
              ? "🔕 Désactiver les rappels"
              : "🔔 Activer les rappels d'occasions"}
          </button>
        )}
        {notifPermission === "denied" && (
          <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
            Notifications bloquées — autorisez-les dans les paramètres du navigateur.
          </p>
        )}

        {/* Actions */}
        <button
          onClick={() => setEditing(true)}
          className="w-full h-12 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: "var(--rouge)", color: "white" }}
        >
          Modifier mes préférences
        </button>

        <button
          onClick={handleReset}
          className="w-full h-10 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
        >
          Recommencer le quiz
        </button>
      </div>

      {/* Modal ajout événement */}
      {showEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: "oklch(0 0 0 / 50%)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEventModal(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
              Nouvelle occasion
            </h3>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Type</label>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleEventTypeChange(t.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all active:scale-95"
                    style={{
                      background: eventForm.type === t.value ? "var(--or)" : "var(--background)",
                      color: eventForm.type === t.value ? "#000" : "var(--foreground)",
                      border: `1px solid ${eventForm.type === t.value ? "var(--or)" : "var(--border)"}`,
                    }}
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Titre</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Anniversaire de mariage"
                className="h-10 px-3 rounded-xl text-sm border focus:outline-none"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                Date {eventForm.isRecurring ? "(jour & mois, l'année est ignorée)" : ""}
              </label>
              <input
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                className="h-10 px-3 rounded-xl text-sm border focus:outline-none"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>

            {/* Récurrent */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={eventForm.isRecurring}
                onChange={(e) => setEventForm((f) => ({ ...f, isRecurring: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Se répète chaque année</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 h-11 rounded-xl text-sm font-medium"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
              >
                Annuler
              </button>
              <button
                onClick={handleAddEvent}
                disabled={savingEvent || !eventForm.title || !eventForm.date}
                className="flex-1 h-11 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: "var(--rouge)", color: "white" }}
              >
                {savingEvent ? "…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // ── Vue édition ──────────────────────────────────────────────────────────

  return (
    <div className="container-app flex flex-col gap-4 py-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(false)}
          className="text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          ← Retour
        </button>
        <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Modifier le profil
        </h2>
      </div>

      {/* Régime */}
      <Section title="Régime alimentaire">
        <div className="flex flex-col gap-2">
          {DIET_OPTIONS.map((opt) => (
            <QuizOption
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={profile.diet.includes(opt.value)}
              onClick={() => setProfile({ ...profile, diet: toggle(profile.diet, opt.value) })}
            />
          ))}
        </div>
      </Section>

      {/* Budget */}
      <Section title="Budget">
        <div className="flex flex-col gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <QuizOption
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={profile.budget === opt.value}
              onClick={() => setProfile({ ...profile, budget: opt.value })}
            />
          ))}
        </div>
      </Section>

      {/* Ambiances */}
      <Section title="Ambiances">
        <div className="flex flex-col gap-2">
          {VIBE_OPTIONS.map((opt) => (
            <QuizOption
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={profile.vibes.includes(opt.value)}
              onClick={() => setProfile({ ...profile, vibes: toggle(profile.vibes, opt.value) })}
            />
          ))}
        </div>
      </Section>

      {/* Occasions */}
      <Section title="Occasions">
        <div className="flex flex-col gap-2">
          {OCCASION_OPTIONS.map((opt) => (
            <QuizOption
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={profile.occasions.includes(opt.value)}
              onClick={() =>
                setProfile({ ...profile, occasions: toggle(profile.occasions, opt.value) })
              }
            />
          ))}
        </div>
      </Section>

      {/* Cuisines */}
      <Section title="Cuisines favorites">
        <div className="flex flex-col gap-2">
          {CUISINE_OPTIONS.map((opt) => (
            <QuizOption
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={profile.cuisines.includes(opt.value)}
              onClick={() =>
                setProfile({ ...profile, cuisines: toggle(profile.cuisines, opt.value) })
              }
            />
          ))}
        </div>
      </Section>

      {/* Zone */}
      <Section title="Zone Paris">
        <div className="flex flex-col gap-2">
          {ZONE_OPTIONS.map((opt) => (
            <QuizOption
              key={opt.value}
              label={opt.label}
              selected={profile.zone === opt.value}
              onClick={() => setProfile({ ...profile, zone: opt.value })}
            />
          ))}
        </div>
      </Section>

      {error && (
        <p className="text-sm text-center" style={{ color: "var(--rouge)" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
        style={{ background: "var(--rouge)", color: "white" }}
      >
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>
=======
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
    <div
      className="flex flex-col gap-1.5 rounded-xl p-3 border border-border"
      style={{ background: "var(--card)" }}
    >
      <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        {label}
      </p>
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
      {tags && tags.length === 0 && (
        <p className="text-sm text-muted-foreground italic">Non précisé</p>
      )}
>>>>>>> main
    </div>
  );
}
