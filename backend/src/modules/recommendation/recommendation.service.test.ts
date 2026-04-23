import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecommendationService } from "./recommendation.service";
import { UserRepository } from "../user/user.repository";
import { RestaurantRepository } from "../restaurant/restaurant.repository";

const mockRestaurant = {
  id: "r-1", name: "Le Bistrot", cuisine: "French", priceRange: 2,
  michelinType: "SELECTION" as const, greenStar: false,
  address: "Paris", location: "Paris, France", country: "France",
  zone: "11e", description: "", ambiance: null, imageUrl: null,
  gallery: [], hours: null, tags: [], websiteUrl: null, michelinUrl: null,
  michelinStars: null, latitude: null, longitude: null, createdAt: new Date(),
};

const mockUser = (overrides = {}) => ({
  id: "user-1", name: "Hugo", email: null, passwordHash: null, createdAt: new Date(),
  profile: {
    id: "profile-1", userId: "user-1", updatedAt: new Date(),
    budget: 2, cuisines: ["French"], city: "Paris",
    diet: [], vibes: [], occasions: [],
    ...overrides,
  },
});

describe("RecommendationService.surprise", () => {
  let service: RecommendationService;
  let userRepo: UserRepository;
  let restaurantRepo: RestaurantRepository;

  beforeEach(() => {
    userRepo = { findById: vi.fn() } as unknown as UserRepository;
    restaurantRepo = { findAll: vi.fn() } as unknown as RestaurantRepository;
    service = new RecommendationService(userRepo, restaurantRepo);
  });

  it("retourne un restaurant matchant le profil", async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(mockUser() as never);
    vi.mocked(restaurantRepo.findAll).mockResolvedValue([mockRestaurant]);

    const result = await service.surprise("user-1");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("r-1");
    expect(result!.name).toBe("Le Bistrot");
  });

  it("retourne un DTO card valide (sans champs internes)", async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(mockUser() as never);
    vi.mocked(restaurantRepo.findAll).mockResolvedValue([mockRestaurant]);

    const result = await service.surprise("user-1");

    expect(result).toMatchObject({
      id: "r-1",
      name: "Le Bistrot",
      cuisine: "French",
      priceRange: 2,
      michelinType: "SELECTION",
      greenStar: false,
      matchScore: 0,
    });
    expect(result).not.toHaveProperty("description");
    expect(result).not.toHaveProperty("address");
  });

  it("tente un fallback sans cuisine si la première recherche est vide", async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(mockUser() as never);
    vi.mocked(restaurantRepo.findAll)
      .mockResolvedValueOnce([])      // avec cuisine → vide
      .mockResolvedValueOnce([mockRestaurant]); // fallback budget+ville → trouvé

    const result = await service.surprise("user-1");

    expect(result).not.toBeNull();
    expect(restaurantRepo.findAll).toHaveBeenCalledTimes(2);
  });

  it("retourne null si aucun restaurant trouvé nulle part", async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(mockUser() as never);
    vi.mocked(restaurantRepo.findAll).mockResolvedValue([]);

    const result = await service.surprise("user-1");

    expect(result).toBeNull();
  });

  it("fonctionne sans profil utilisateur", async () => {
    const userWithoutProfile = { ...mockUser(), profile: null };
    vi.mocked(userRepo.findById).mockResolvedValue(userWithoutProfile as never);
    vi.mocked(restaurantRepo.findAll).mockResolvedValue([mockRestaurant]);

    const result = await service.surprise("user-1");
    expect(result).not.toBeNull();
  });
});
