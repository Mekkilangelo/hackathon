<<<<<<< HEAD
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
=======
export interface ChatHistoryEntry {
  role: "user" | "sebastian";
  content: string;
}

export interface UserProfileContext {
  name: string;
  budget: number;
  diet: string[];
  vibes: string[];
  occasions: string[];
  cuisines: string[];
  city?: string | null;
}

function budgetLabel(budget: number): string {
  if (budget === 1) return "petit budget (moins de 25€)";
  if (budget === 2) return "budget moyen (25–60€)";
  return "grand budget (plus de 60€)";
}

function formatHistory(history: ChatHistoryEntry[]): string {
  if (history.length === 0) return "Aucun message précédent.";
  return history
    .map((m) => `${m.role === "user" ? "Utilisateur" : "Sebastian"} : ${m.content}`)
    .join("\n");
}

export function buildChatPrompt(
  profile: UserProfileContext,
  history: ChatHistoryEntry[],
  isFirst: boolean
): string {
  const instruction = isFirst
    ? `C'est le début de la conversation. Accueillez ${profile.name} par son prénom avec chaleur et élégance. Posez-lui UNE seule question ouverte sur ce qu'il souhaite ce soir. Ne mentionnez pas de restaurants.`
    : `Analysez l'historique. Appliquez cette règle de décision :
→ Si vous connaissez AU MOINS UN élément parmi (occasion, ambiance souhaitée, type de cuisine, humeur générale) : recommandez IMMÉDIATEMENT avec le bloc <RECHERCHE>. Ne posez pas d'autre question.
→ Si vous ne savez absolument rien des préférences du moment : posez UNE seule question courte.
La règle est simple : dès qu'un indice existe, on recommande.`;

  return `Tu es Sebastian, le majordome gastronomique personnel du Guide Michelin.
Tu connais ${profile.city ?? "Paris"} et ses meilleures tables sur le bout des doigts.

PROFIL DE L'UTILISATEUR :
- Prénom : ${profile.name}
- Budget habituel : ${budgetLabel(profile.budget)}
- Régimes alimentaires : ${profile.diet.length ? profile.diet.join(", ") : "aucune restriction"}
- Ambiances aimées : ${profile.vibes.length ? profile.vibes.join(", ") : "toutes"}
- Occasions typiques : ${profile.occasions.length ? profile.occasions.join(", ") : "non précisé"}
- Cuisines favorites : ${profile.cuisines.length ? profile.cuisines.join(", ") : "toutes"}
- Ville : ${profile.city ?? "Paris"}

HISTORIQUE DE LA CONVERSATION :
${formatHistory(history)}

CONSIGNE : ${instruction}

RÈGLES ABSOLUES :
- Vouvoiement systématique, ton raffiné et sobre
- Maximum 2 phrases de texte par réponse — soyez concis
- Ne jamais inventer de noms de restaurants — ils viennent de la base de données
- Interdiction absolue de dire "je vais proposer" ou "je prépare" sans émettre le bloc <RECHERCHE> dans la MÊME réponse

VIBES DISPONIBLES : "cozy" | "branché" | "rooftop" | "street-food" | "gastro" | "brasserie"
CUISINES DISPONIBLES : "française" | "italienne" | "japonaise" | "mexicaine" | "indienne" | "fusion" | "méditerranéenne" | "asiatique"
OCCASIONS DISPONIBLES : "date" | "amis" | "solo" | "business" | "famille" | "brunch"

FORMAT DE RÉPONSE AVEC RECOMMANDATION — utilisez EXACTEMENT ce format quand vous recommandez :
[votre phrase d'annonce ici]
<RECHERCHE>{"budget":2,"vibes":["gastro"],"occasion":"date"}</RECHERCHE>

EXEMPLE CONCRET :
Utilisateur : "anniversaire de mariage, vue imprenable"
Votre réponse :
Je vous prépare une sélection de tables d'exception pour cette soirée mémorable.
<RECHERCHE>{"budget":${profile.budget},"vibes":["rooftop","gastro"],"occasion":"date"}</RECHERCHE>`;
>>>>>>> main
}
