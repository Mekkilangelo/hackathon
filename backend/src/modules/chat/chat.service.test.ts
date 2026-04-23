import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  wantsRecommendations,
  extractCuisineFilter,
  extractLocationFromMessage,
  ChatService,
} from "./chat.service";
import { ChatRepository } from "./chat.repository";
import { RestaurantRepository } from "../restaurant/restaurant.repository";
import { ILLMService } from "../../shared/llm/llm.interface";
import { ChatRole } from "@prisma/client";

// ─── wantsRecommendations ────────────────────────────────────────────────────

describe("wantsRecommendations", () => {
  it("détecte 'recommande'", () => {
    expect(wantsRecommendations("recommande-moi un restaurant")).toBe(true);
  });
  it("détecte 'manger'", () => {
    expect(wantsRecommendations("j'ai envie de manger quelque chose")).toBe(true);
  });
  it("détecte 'dîner'", () => {
    expect(wantsRecommendations("on pourrait dîner ensemble ?")).toBe(true);
  });
  it("détecte 'étoile'", () => {
    expect(wantsRecommendations("tu connais des tables étoile ?")).toBe(true);
  });
  it("ne détecte pas un message neutre", () => {
    expect(wantsRecommendations("bonjour, comment vas-tu ?")).toBe(false);
  });
  it("ne détecte pas une question sur le profil", () => {
    expect(wantsRecommendations("qui est Sebastian ?")).toBe(false);
  });
});

// ─── extractCuisineFilter ────────────────────────────────────────────────────

describe("extractCuisineFilter", () => {
  it("extrait Japanese pour 'japonais'", () => {
    expect(extractCuisineFilter("j'ai envie de japonais ce soir")).toBe("Japanese");
  });
  it("extrait Japanese pour 'sushi'", () => {
    expect(extractCuisineFilter("une bonne adresse sushi ?")).toBe("Japanese");
  });
  it("extrait French pour 'bistrot'", () => {
    expect(extractCuisineFilter("un bistrot parisien classique")).toBe("French");
  });
  it("extrait Italian pour 'pizza'", () => {
    expect(extractCuisineFilter("envie d'une pizza")).toBe("Italian");
  });
  it("extrait Mediterranean pour 'méditerranéen'", () => {
    expect(extractCuisineFilter("quelque chose de méditerranéen")).toBe("Mediterranean");
  });
  it("retourne undefined si aucune cuisine reconnue", () => {
    expect(extractCuisineFilter("surprends-moi ce soir")).toBeUndefined();
  });
});

// ─── extractLocationFromMessage ──────────────────────────────────────────────

describe("extractLocationFromMessage", () => {
  it("extrait 'Grenoble' de 'à Grenoble'", () => {
    expect(extractLocationFromMessage("recommande-moi quelque chose à Grenoble")).toBe("Grenoble");
  });
  it("extrait 'Lyon' de 'à Lyon'", () => {
    expect(extractLocationFromMessage("un restaurant à Lyon")).toBe("Lyon");
  });
  it("extrait 'Bordeaux' de 'en Bordeaux'", () => {
    expect(extractLocationFromMessage("quelque chose en Bordeaux")).toBe("Bordeaux");
  });
  it("ignore les mots blacklistés comme 'coin'", () => {
    expect(extractLocationFromMessage("dans un coin sympa")).toBeUndefined();
  });
  it("ignore 'manger'", () => {
    expect(extractLocationFromMessage("envie de manger dehors")).toBeUndefined();
  });
  it("retourne undefined si aucune localisation", () => {
    expect(extractLocationFromMessage("recommande-moi un restaurant")).toBeUndefined();
  });
});

// ─── ChatService.sendMessage ─────────────────────────────────────────────────

describe("ChatService.sendMessage", () => {
  let service: ChatService;
  let chatRepo: ChatRepository;
  let restaurantRepo: RestaurantRepository;
  let llm: ILLMService;

  const mockSession = {
    id: "session-1",
    userId: "user-1",
    createdAt: new Date(),
    user: {
      id: "user-1",
      name: "Hugo",
      email: null,
      passwordHash: null,
      createdAt: new Date(),
      profile: {
        id: "profile-1",
        userId: "user-1",
        budget: 2,
        cuisines: ["Japanese"],
        city: "Paris",
        diet: [],
        vibes: [],
        occasions: [],
        updatedAt: new Date(),
      },
    },
  };

  const mockMessage = {
    id: "msg-1",
    sessionId: "session-1",
    role: ChatRole.SEBASTIAN,
    content: "Voici ma suggestion.",
    metadata: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    chatRepo = {
      createSession: vi.fn(),
      getSessionWithUser: vi.fn(),
      getRecentMessages: vi.fn(),
      getAllMessages: vi.fn(),
      saveMessage: vi.fn(),
    } as unknown as ChatRepository;

    restaurantRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(),
    } as unknown as RestaurantRepository;

    llm = { chat: vi.fn() } as unknown as ILLMService;

    service = new ChatService(chatRepo, restaurantRepo, llm);
  });

  it("appelle le LLM et sauvegarde les deux messages", async () => {
    vi.mocked(chatRepo.getSessionWithUser).mockResolvedValue(mockSession as never);
    vi.mocked(chatRepo.getRecentMessages).mockResolvedValue([]);
    vi.mocked(llm.chat).mockResolvedValue("Bonsoir, voici ma suggestion.");
    vi.mocked(chatRepo.saveMessage).mockResolvedValue(mockMessage);
    vi.mocked(restaurantRepo.findAll).mockResolvedValue([]);

    await service.sendMessage("session-1", "bonjour");

    expect(llm.chat).toHaveBeenCalledOnce();
    expect(chatRepo.saveMessage).toHaveBeenCalledTimes(2);
  });

  it("joint des restaurants si le message demande des recommandations", async () => {
    const mockRestaurant = {
      id: "r-1", name: "Sushi Zen", cuisine: "Japanese", priceRange: 2,
      michelinType: "SELECTION", greenStar: false, address: "Paris",
      location: "Paris, France", country: "France", zone: "2e",
      description: "", ambiance: null, imageUrl: null, gallery: [],
      hours: null, tags: [], websiteUrl: null, michelinUrl: null,
      michelinStars: null, latitude: null, longitude: null,
      createdAt: new Date(),
    };

    vi.mocked(chatRepo.getSessionWithUser).mockResolvedValue(mockSession as never);
    vi.mocked(chatRepo.getRecentMessages).mockResolvedValue([]);
    vi.mocked(llm.chat).mockResolvedValue("Je vous recommande Sushi Zen.");
    vi.mocked(restaurantRepo.findAll).mockResolvedValue([mockRestaurant]);
    vi.mocked(chatRepo.saveMessage).mockResolvedValue(mockMessage);

    await service.sendMessage("session-1", "recommande-moi un restaurant japonais");

    const sebastianSaveCall = vi.mocked(chatRepo.saveMessage).mock.calls[1];
    expect(sebastianSaveCall[3]).toBeDefined();
    expect((sebastianSaveCall[3] as { restaurants: unknown[] }).restaurants).toHaveLength(1);
  });

  it("lève une erreur si la session n'existe pas", async () => {
    vi.mocked(chatRepo.getSessionWithUser).mockResolvedValue(null);

    await expect(service.sendMessage("invalid", "hello")).rejects.toThrow("Session not found");
  });
});
