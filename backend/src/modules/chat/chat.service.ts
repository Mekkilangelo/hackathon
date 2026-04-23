import { ChatRole } from "@prisma/client";
import { ILLMService } from "../../shared/llm/llm.interface";
import { ChatRepository } from "./chat.repository";
import { buildChatPrompt, ChatHistoryEntry } from "./prompts/sebastian-chat.prompt";
import { ChatMessageOutput, ChatSessionOutput, SearchCriteria } from "./chat.dto";
import { RecommendationService } from "../recommendation/recommendation.service";
import { AppError } from "../../shared/middleware/error-handler";

const SEARCH_TAG_OPEN = "<RECHERCHE>";
const SEARCH_TAG_CLOSE = "</RECHERCHE>";

export class ChatService {
  constructor(
    private readonly repo: ChatRepository,
    private readonly llm: ILLMService,
    private readonly recommender: RecommendationService
  ) {}

  async createSession(userId: string): Promise<{ session: ChatSessionOutput; messages: ChatMessageOutput[] }> {
    const user = await this.repo.getUserWithProfile(userId);
    if (!user) throw new AppError(404, "Utilisateur introuvable");

    const session = await this.repo.createSession(userId);

    // Message de bienvenue généré automatiquement
    const profile = this.buildProfileContext(user);
    const systemPrompt = buildChatPrompt(profile, [], true);
    const raw = await this.llm.chat([{ role: "system", content: systemPrompt }]);
    const { text } = this.parseResponse(raw);

    const welcome = await this.repo.saveMessage(session.id, ChatRole.SEBASTIAN, text);

    return { session, messages: [welcome] };
  }

  async sendMessage(
    sessionId: string,
    content: string
  ): Promise<ChatMessageOutput> {
    const session = await this.repo.getSession(sessionId);
    if (!session) throw new AppError(404, "Session introuvable");

    const user = await this.repo.getUserWithProfile(session.userId);
    if (!user) throw new AppError(404, "Utilisateur introuvable");

    // Sauvegarder le message utilisateur
    await this.repo.saveMessage(sessionId, ChatRole.USER, content);

    // Récupérer l'historique complet (sans le message qu'on vient d'ajouter)
    const allMessages = await this.repo.getMessages(sessionId);
    const history: ChatHistoryEntry[] = allMessages
      .filter((m) => m.role === "user" || m.role === "sebastian")
      .map((m) => ({ role: m.role as "user" | "sebastian", content: m.content }));

    // Appel LLM
    const profile = this.buildProfileContext(user);
    const systemPrompt = buildChatPrompt(profile, history, false);
    const raw = await this.llm.chat([{ role: "system", content: systemPrompt }]);
    const { text, criteria } = this.parseResponse(raw);

    // Si Sebastian a décidé de recommander, enrichir avec les vrais restaurants
    let restaurants;
    if (criteria) {
      restaurants = await this.recommender.findTop(
        user.profile ?? undefined,
        criteria,
        3
      );
    }

    const metadata = restaurants && restaurants.length > 0 ? { restaurants } : undefined;
    return this.repo.saveMessage(sessionId, ChatRole.SEBASTIAN, text, metadata);
  }

  async getMessages(sessionId: string): Promise<ChatMessageOutput[]> {
    const session = await this.repo.getSession(sessionId);
    if (!session) throw new AppError(404, "Session introuvable");
    return this.repo.getMessages(sessionId);
  }

  private parseResponse(raw: string): { text: string; criteria?: SearchCriteria } {
    const start = raw.indexOf(SEARCH_TAG_OPEN);
    const end = raw.indexOf(SEARCH_TAG_CLOSE);

    if (start === -1 || end === -1) {
      return { text: raw.trim() };
    }

    const jsonStr = raw.slice(start + SEARCH_TAG_OPEN.length, end).trim();
    const text = (raw.slice(0, start) + raw.slice(end + SEARCH_TAG_CLOSE.length)).trim();

    try {
      const criteria = JSON.parse(jsonStr) as SearchCriteria;
      return { text, criteria };
    } catch {
      return { text };
    }
  }

  private buildProfileContext(user: { name: string; profile: { budget: number; diet: string[]; vibes: string[]; occasions: string[]; cuisines: string[]; city?: string | null } | null }) {
    return {
      name: user.name,
      budget: user.profile?.budget ?? 2,
      diet: user.profile?.diet ?? [],
      vibes: user.profile?.vibes ?? [],
      occasions: user.profile?.occasions ?? [],
      cuisines: user.profile?.cuisines ?? [],
      city: user.profile?.city,
    };
  }
}
