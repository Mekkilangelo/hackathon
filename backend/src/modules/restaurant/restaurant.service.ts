import { Restaurant } from "@prisma/client";
import { RestaurantRepository } from "./restaurant.repository";
import { RestaurantFilters, RestaurantCardDTO, RestaurantDetailDTO } from "./restaurant.dto";
import { AppError } from "../../shared/middleware/error-handler";

export class RestaurantService {
  constructor(private repo: RestaurantRepository) {}

  async getAll(filters: RestaurantFilters): Promise<RestaurantCardDTO[]> {
    const restaurants = await this.repo.findAll(filters);
    return restaurants.map((r) => this.toCardDTO(r));
  }

  async getById(id: string): Promise<RestaurantDetailDTO> {
    const r = await this.repo.findById(id);
    if (!r) throw new AppError(404, "Restaurant not found");
    return this.toDetailDTO(r);
  }

  async getByIds(ids: string[]): Promise<RestaurantCardDTO[]> {
    const restaurants = await this.repo.findByIds(ids);
    return restaurants.map((r) => this.toCardDTO(r));
  }

  private toCardDTO(r: Restaurant, matchScore = 0): RestaurantCardDTO {
    return {
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      priceRange: r.priceRange,
      michelinType: r.michelinType,
      greenStar: r.greenStar,
      imageUrl: r.imageUrl,
      matchScore,
      tags: r.tags,
      zone: r.zone,
      location: r.location,
      country: r.country,
      ambiance: r.ambiance,
    };
  }

  private toDetailDTO(r: Restaurant): RestaurantDetailDTO {
    return {
      ...this.toCardDTO(r),
      michelinStars: r.michelinStars,
      description: r.description,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      hours: r.hours as Record<string, string> | null,
      gallery: r.gallery,
      websiteUrl: r.websiteUrl,
      michelinUrl: r.michelinUrl,
    };
  }
}
