import { describe, it, expect, vi, beforeEach } from "vitest";
import { RestaurantService } from "./restaurant.service";
import { RestaurantRepository } from "./restaurant.repository";

const mockRestaurant = {
  id: "uuid-1",
  name: "Le Grand Véfour",
  cuisine: "française",
  priceRange: 3,
  michelinType: "ETOILE" as const,
  address: "17 Rue de Beaujolais, 75001 Paris",
  zone: "1er",
  description: "Joyau du Palais-Royal",
  ambiance: "gastro",
  imageUrl: "https://example.com/image.jpg",
  gallery: [],
  hours: { lun: "12h-14h" },
  tags: ["classique", "prestige"],
  createdAt: new Date(),
};

describe("RestaurantService", () => {
  let service: RestaurantService;
  let repo: RestaurantRepository;

  beforeEach(() => {
    repo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(),
    } as unknown as RestaurantRepository;

    service = new RestaurantService(repo);
  });

  describe("getAll", () => {
    it("should return restaurant cards with DTO mapping", async () => {
      vi.mocked(repo.findAll).mockResolvedValue([mockRestaurant]);

      const result = await service.getAll({});

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "uuid-1",
        name: "Le Grand Véfour",
        cuisine: "française",
        priceRange: 3,
        michelinType: "ETOILE",
        imageUrl: "https://example.com/image.jpg",
        matchScore: 0,
        tags: ["classique", "prestige"],
        zone: "1er",
        ambiance: "gastro",
      });
    });

    it("should pass filters to repository", async () => {
      vi.mocked(repo.findAll).mockResolvedValue([]);

      await service.getAll({ cuisine: "japonaise", budget: 2 });

      expect(repo.findAll).toHaveBeenCalledWith({ cuisine: "japonaise", budget: 2 });
    });
  });

  describe("getById", () => {
    it("should return detail DTO for existing restaurant", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockRestaurant);

      const result = await service.getById("uuid-1");

      expect(result.id).toBe("uuid-1");
      expect(result.description).toBe("Joyau du Palais-Royal");
      expect(result.address).toBe("17 Rue de Beaujolais, 75001 Paris");
      expect(result.gallery).toEqual([]);
    });

    it("should throw 404 for non-existing restaurant", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);

      await expect(service.getById("unknown")).rejects.toThrow("Restaurant not found");
    });
  });
});
