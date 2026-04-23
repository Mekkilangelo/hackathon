import { ChatRole, Restaurant, UserProfile } from "@prisma/client";
import { ILLMService, LLMMessage } from "../../shared/llm/llm.interface";
import { ChatRepository } from "./chat.repository";
import { RestaurantRepository } from "../restaurant/restaurant.repository";
import { buildSebastianSystemPrompt } from "./prompts/sebastian-chat.prompt";
import { prisma } from "../../shared/database/prisma";

const CUISINE_KEYWORDS: Record<string, string> = {
  japonais: "Japanese", japonaise: "Japanese", sushi: "Japanese", ramen: "Japanese",
  français: "French", française: "French", bistrot: "French", brasserie: "French",
  italien: "Italian", italienne: "Italian", pizza: "Italian", pasta: "Italian",
  indien: "Indian", indienne: "Indian",
  mexicain: "Mexican", mexicaine: "Mexican",
  asiatique: "Asian", chinois: "Chinese", thaï: "Thai", coréen: "Korean",
  méditerranéen: "Mediterranean", méditerranéenne: "Mediterranean",
};

const NON_LOCATIONS = new Set([
  "manger", "dîner", "déjeuner", "restaurant", "table", "moi", "toi", "vous",
  "lui", "elle", "nous", "eux", "soir", "midi", "coin", "moment", "france",
  "italie", "espagne", "premier", "bon",
]);

export function extractCuisineFilter(message: string): string | undefined {
  const lower = message.toLowerCase();
  for (const [keyword, cuisine] of Object.entries(CUISINE_KEYWORDS)) {
    if (lower.includes(keyword)) return cuisine;
  }
  return undefined;
}

export function extractLocationFromMessage(message: string): string | undefined {
  const match = message.match(/(?:^|\s)(?:à|a|en|au|aux|dans|sur|chez|proche\s+de|autour\s+de)\s+([A-ZÀ-Ÿa-zà-ÿ][a-zà-ÿA-ZÀ-Ÿ\-]{2,}(?:\s+[A-ZÀ-Ÿa-zà-ÿ][a-zà-ÿ]+)*)/);
  if (!match) return undefined;
  const candidate = match[1].trim();
  if (NON_LOCATIONS.has(candidate.toLowerCase())) return undefined;
  return candidate;
}

export function extractBudgetFromMessage(message: string): number | undefined {
  const lower = message.toLowerCase();
  // Signaux budget élevé
  if (/cher|luxe|luxueux|gastronomique|haute\s+gastronomie|haut\s+de\s+gamme|étoilé|grande\s+table|grand\s+restaurant|prestige|exceptionnel/.test(lower)) {
    return 3;
  }
  // Signaux budget bas
  if (/pas\s+trop?\s+cher|abordable|économique|petit\s+budget|raisonnable|pas\s+cher|bon\s+march[ée]|accessible|sympa|simple/.test(lower)) {
    return 1;
  }
  return undefined;
}

export function extractMichelinFilter(message: string): string | undefined {
  const lower = message.toLowerCase();
  if (/bib\s+gourmand/.test(lower)) return "BIB_GOURMAND";
  if (/étoile\s+verte|green\s+star|écolo|durable|bio/.test(lower)) return "ETOILE_VERTE";
  if (/étoilé|étoile\s+michelin|\d\s+étoile/.test(lower)) return "ETOILE";
  return undefined;
}

export function extractIntentFromHistory(
  messages: Array<{ role: string; content: string }>
): { budget?: number; cuisine?: string; location?: string; michelinType?: string } {
  // Scan les 4 derniers messages user du plus ancien au plus récent (le plus récent gagne)
  const userMsgs = messages.filter((m) => m.role === "USER").slice(-4);
  let budget: number | undefined;
  let cuisine: string | undefined;
  let location: string | undefined;
  let michelinType: string | undefined;

  for (const msg of userMsgs) {
    const b = extractBudgetFromMessage(msg.content);
    if (b !== undefined) budget = b;
    const c = extractCuisineFilter(msg.content);
    if (c) cuisine = c;
    const l = extractLocationFromMessage(msg.content);
    if (l) location = l;
    const m = extractMichelinFilter(msg.content);
    if (m) michelinType = m;
  }
  return { budget, cuisine, location, michelinType };
}

export function scoreRestaurant(r: Restaurant, profile: UserProfile | null, effectiveBudget?: number): number {
  if (!profile) return 50;
  let score = 0;

  // Budget (30 pts) — priceRange 1-4, budget 1-3 (override si spécifié dans la conversation)
  const budget = effectiveBudget ?? profile.budget;
  const budgetDiff = Math.abs(r.priceRange - budget);
  score += budgetDiff === 0 ? 30 : budgetDiff === 1 ? 18 : budgetDiff === 2 ? 8 : 0;

  // Cuisine (35 pts)
  const cuisineLower = r.cuisine.toLowerCase();
  const match = profile.cuisines.some((c) => cuisineLower.includes(c.toLowerCase()) || c.toLowerCase().includes(cuisineLower));
  if (match) score += 35;

  // Ambiance / vibes (20 pts)
  const ambianceLower = (r.ambiance ?? "").toLowerCase();
  const tagsLower = r.tags.map((t) => t.toLowerCase());
  const vibeMatch = profile.vibes.some(
    (v) => ambianceLower.includes(v.toLowerCase()) || tagsLower.some((t) => t.includes(v.toLowerCase()))
  );
  if (vibeMatch) score += 20;

  // Michelin bonus (15 pts)
  score += r.michelinType === "ETOILE" ? 15 : r.michelinType === "BIB_GOURMAND" ? 10 : r.michelinType === "ETOILE_VERTE" ? 10 : 5;

  return Math.min(score, 100);
}

export function wantsRecommendations(message: string): boolean {
  const triggers = [
    "recommande", "conseille", "propose", "restaurant", "adresse", "manger",
    "dîner", "déjeuner", "brunch", "soir", "ce soir", "bonne table", "où aller",
    "surprise", "étoile", "michelin", "bib", "envie", "faim", "table",
    "gastronomique", "cuisine", "japonais", "français", "italien", "indien",
    "mexicain", "asiatique", "méditerranéen", "cher", "abordable", "luxe",
  ];
  const lower = message.toLowerCase();
  if (triggers.some((t) => lower.includes(t))) return true;
  // Déclenchement si seulement un lieu est mentionné (changement de ville)
  if (extractLocationFromMessage(message)) return true;
  return false;
}

export class ChatService {
  constructor(
    private repo: ChatRepository,
    private restaurantRepo: RestaurantRepository,
    private llm: ILLMService
  ) {}

  async createSession(userId: string) {
    return this.repo.createSession(userId);
  }

  async getMessages(sessionId: string) {
    return this.repo.getAllMessages(sessionId);
  }

  async sendMessage(sessionId: string, userContent: string, visitedIds?: string[]) {
    const session = await this.repo.getSessionWithUser(sessionId);
    if (!session) throw new Error("Session not found");

    const { user } = session;
    const profile = user.profile;
    const city = profile?.city ?? "Paris";

    // Historique récent → messages LLM
    const history = await this.repo.getRecentMessages(sessionId, 10);
    const historyAsc = [...history].reverse();

    const events = await prisma.userEvent.findMany({ where: { userId: user.id } });

    let visitedNames: string[] = [];
    if (visitedIds?.length) {
      const visited = await prisma.restaurant.findMany({
        where: { id: { in: visitedIds } },
        select: { name: true },
      });
      visitedNames = visited.map((r) => r.name);
    }

    const systemPrompt = buildSebastianSystemPrompt(user.name, profile, city, events, visitedNames);

    // ── Requête restaurants (avant LLM pour contextualiser la réponse) ──────
    let restaurants: object[] | undefined;
    let searchNote = "";

    if (wantsRecommendations(userContent)) {
      const msgCuisine   = extractCuisineFilter(userContent);
      const msgLocation  = extractLocationFromMessage(userContent);
      const msgBudget    = extractBudgetFromMessage(userContent);
      const msgMichelin  = extractMichelinFilter(userContent);

      const histCtx = extractIntentFromHistory(
        historyAsc.map((m) => ({ role: m.role, content: m.content }))
      );

      const conversationBudget = msgBudget ?? histCtx.budget;
      const effectiveCuisine   = msgCuisine  ?? histCtx.cuisine;
      const effectiveLocation  = msgLocation ?? histCtx.location ?? city;
      const effectiveMichelin  = msgMichelin ?? histCtx.michelinType;

      const isHighBudget = conversationBudget === 3;
      const baseFilters = {
        budget:       isHighBudget ? undefined : (conversationBudget ?? profile?.budget),
        priceMin:     isHighBudget ? 3 : undefined,
        location:     effectiveLocation,
        cuisine:      effectiveCuisine,
        michelinType: effectiveMichelin as undefined,
      };

      // Fallback progressif
      let results = await this.restaurantRepo.findAll(baseFilters);

      if (!results.length && effectiveCuisine) {
        results = await this.restaurantRepo.findAll({ ...baseFilters, cuisine: undefined });
        if (results.length) searchNote = `Pas de cuisine ${effectiveCuisine} disponible à ${effectiveLocation}, voici d'autres tables sur place.`;
      }
      if (!results.length && effectiveLocation !== city) {
        results = await this.restaurantRepo.findAll({ cuisine: effectiveCuisine, budget: baseFilters.budget, priceMin: baseFilters.priceMin });
        if (results.length) searchNote = `Pas de résultat à ${effectiveLocation}, voici des suggestions depuis notre sélection générale.`;
      }
      if (!results.length) {
        results = await this.restaurantRepo.findAll({ budget: baseFilters.budget, priceMin: baseFilters.priceMin });
        if (results.length) searchNote = `Sélection élargie selon votre budget.`;
      }
      if (!results.length) {
        results = await this.restaurantRepo.findAll({});
        if (results.length) searchNote = `Voici notre sélection du moment.`;
      }

      if (results.length > 0) {
        // Exclude restaurants already shown in this conversation
        const shownIds = new Set<string>();
        for (const msg of historyAsc) {
          const meta = msg.metadata as { restaurants?: Array<{ id: string }> } | null;
          if (meta?.restaurants) meta.restaurants.forEach((r) => shownIds.add(r.id));
        }
        const fresh = results.filter((r) => !shownIds.has(r.id));
        const pool = fresh.length >= 3 ? fresh : results;

        const scored = pool
          .map((r) => ({ r, score: scoreRestaurant(r, profile, conversationBudget ?? profile?.budget) }))
          .sort((a, b) => b.score - a.score + (Math.random() - 0.5) * 10)
          .slice(0, 3);
        restaurants = scored.map(({ r, score }) => ({
          id: r.id, name: r.name, cuisine: r.cuisine, priceRange: r.priceRange,
          michelinType: r.michelinType, greenStar: r.greenStar, imageUrl: r.imageUrl,
          tags: r.tags, zone: r.zone, location: r.location, ambiance: r.ambiance,
          matchScore: score, country: r.country,
        }));
      }
    }

    // ── LLM (avec contexte sur les résultats de recherche) ───────────────────
    const llmMessages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      ...historyAsc.map((m) => ({
        role: m.role === ChatRole.USER ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      { role: "user", content: userContent },
    ];

    // Injecte une note de contexte si fallback utilisé
    if (searchNote) {
      llmMessages.push({ role: "system", content: `[Contexte recherche : ${searchNote} Adapte ta réponse en conséquence, sans mentionner les détails techniques.]` });
    }

    const sebastianText = await this.llm.chat(llmMessages);

    // Sauvegarde
    await this.repo.saveMessage(sessionId, ChatRole.USER, userContent);
    const sebastianMsg = await this.repo.saveMessage(
      sessionId,
      ChatRole.SEBASTIAN,
      sebastianText,
      restaurants ? { restaurants } : undefined
    );

    return sebastianMsg;
  }

  async deleteSession(sessionId: string) {
    return this.repo.deleteSession(sessionId);
  }

  async getOrCreateSession(userId: string): Promise<string> {
    const existing = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return existing.id;
    const session = await this.repo.createSession(userId);
    return session.id;
  }
}
