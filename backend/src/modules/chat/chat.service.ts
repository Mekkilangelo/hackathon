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
  // Match "à Lyon", "à Grenoble", "en Provence", "au Japon", "dans Lyon" etc.
  const match = message.match(/(?:^|\s)(?:à|a|en|au|aux|dans)\s+([A-ZÀ-Ÿa-zà-ÿ][a-zà-ÿA-ZÀ-Ÿ\-]{2,}(?:\s+[A-ZÀ-Ÿa-zà-ÿ][a-zà-ÿ]+)*)/);
  if (!match) return undefined;
  const candidate = match[1].trim();
  if (NON_LOCATIONS.has(candidate.toLowerCase())) return undefined;
  return candidate;
}

export function scoreRestaurant(r: Restaurant, profile: UserProfile | null): number {
  if (!profile) return 50;
  let score = 0;

  // Budget (30 pts) — priceRange 1-4, budget 1-3
  const budgetDiff = Math.abs(r.priceRange - profile.budget);
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
    "surprise", "étoile", "michelin", "bib", "envie",
  ];
  const lower = message.toLowerCase();
  return triggers.some((t) => lower.includes(t));
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

    const llmMessages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      ...historyAsc.map((m) => ({
        role: m.role === ChatRole.USER ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      { role: "user", content: userContent },
    ];

    // Appel LLM
    const sebastianText = await this.llm.chat(llmMessages);

    // Recommandations si le message le demande
    let restaurants: object[] | undefined;
    if (wantsRecommendations(userContent)) {
      const cuisine = extractCuisineFilter(userContent);
      const messageLocation = extractLocationFromMessage(userContent);
      const filters = {
        budget: profile?.budget,
        location: messageLocation ?? city,
        cuisine,
        michelinType: undefined as undefined,
      };
      const results = await this.restaurantRepo.findAll(filters);
      if (results.length > 0) {
        const scored = results
          .map((r) => ({ r, score: scoreRestaurant(r, profile) }))
          .sort((a, b) => b.score - a.score + (Math.random() - 0.5) * 10)
          .slice(0, 3);
        restaurants = scored.map(({ r, score }) => ({
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          priceRange: r.priceRange,
          michelinType: r.michelinType,
          greenStar: r.greenStar,
          imageUrl: r.imageUrl,
          tags: r.tags,
          zone: r.zone,
          location: r.location,
          ambiance: r.ambiance,
          matchScore: score,
          country: r.country,
        }));
      }
    }

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
