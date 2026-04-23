import { UserProfile, UserEvent } from "@prisma/client";

function daysUntil(event: UserEvent): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (event.isRecurring) {
    const next = new Date(event.date);
    next.setFullYear(today.getFullYear());
    next.setHours(0, 0, 0, 0);
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return Math.round((next.getTime() - today.getTime()) / 86400000);
  }

  const target = new Date(event.date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function buildSebastianSystemPrompt(
  userName: string,
  profile: UserProfile | null,
  city: string,
  events: UserEvent[] = [],
  visitedRestaurants: string[] = []
): string {
  const profileSummary = profile
    ? `
- Budget : ${profile.budget === 1 ? "< 25€" : profile.budget === 2 ? "25-60€" : "> 60€"} par personne
- Cuisines favorites : ${profile.cuisines.join(", ") || "variées"}
- Ambiances aimées : ${profile.vibes.join(", ") || "variées"}
- Occasions typiques : ${profile.occasions.join(", ") || "variées"}
- Régime : ${profile.diet.join(", ") || "aucune restriction"}
- Ville : ${city}`
    : "Profil non renseigné.";

  const upcoming = events
    .map((e) => ({ event: e, days: daysUntil(e) }))
    .filter(({ days }) => days >= 0 && days <= 60)
    .sort((a, b) => a.days - b.days);

  const eventsSummary = upcoming.length > 0
    ? `\n\nOCCASIONS À VENIR :\n` + upcoming.map(({ event, days }) => {
        const when = days === 0 ? "aujourd'hui" : days === 1 ? "demain" : `dans ${days} jours`;
        return `- ${event.emoji} ${event.title} : ${when}`;
      }).join("\n")
    : "";

  const visitedSummary = visitedRestaurants.length > 0
    ? `\n\nRESTAURANTS DÉJÀ VISITÉS PAR ${userName.toUpperCase()} :\n` +
      visitedRestaurants.map((n) => `- ${n}`).join("\n") +
      "\n(Ne reproposez pas ces établissements sauf si on vous le demande explicitement.)"
    : "";

  return `Tu es Sebastian, le majordome gastronomique du Guide Michelin.
Tu accompagnes ${userName} dans ses choix de restaurants avec élégance, expertise et bienveillance.

PROFIL DE ${userName.toUpperCase()} :${profileSummary}${eventsSummary}${visitedSummary}

RÈGLES DE CONDUITE :
- Vouvoiement systématique, ton chaleureux et raffiné
- Réponses courtes (2-4 phrases), jamais de listes à puces
- Quand tu recommandes des restaurants, dis simplement "Je vous propose quelques adresses ci-dessous" — les fiches s'affichent automatiquement
- Tu connais le Guide Michelin par cœur : étoiles, Bib Gourmand, Étoile Verte
- Si une occasion approche dans les 7 jours, mentionne-la subtilement et propose des tables adaptées
- Réponds toujours en français`;
}
