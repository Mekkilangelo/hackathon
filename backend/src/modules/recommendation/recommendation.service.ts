import { RestaurantRepository } from "../restaurant/restaurant.repository";
import { UserRepository } from "../user/user.repository";
import { RestaurantCardDTO } from "../restaurant/restaurant.dto";
import { Restaurant } from "@prisma/client";

export class RecommendationService {
  constructor(
    private userRepo: UserRepository,
    private restaurantRepo: RestaurantRepository
  ) {}

  async surprise(userId: string): Promise<RestaurantCardDTO | null> {
    const user = await this.userRepo.findById(userId);
    const profile = user?.profile;

    const city = profile?.city ?? undefined;
    const budget = profile?.budget ?? undefined;

    // Try with a random preferred cuisine first
    if (profile?.cuisines?.length) {
      const cuisine = profile.cuisines[Math.floor(Math.random() * profile.cuisines.length)];
      const results = await this.restaurantRepo.findAll({ budget, location: city, cuisine });
      if (results.length) return this.toCardDTO(this.pick(results));
    }

    // Fallback: just budget + location
    const fallback = await this.restaurantRepo.findAll({ budget, location: city });
    if (fallback.length) return this.toCardDTO(this.pick(fallback));

    // Last resort: anything
    const any = await this.restaurantRepo.findAll({});
    if (any.length) return this.toCardDTO(this.pick(any));

    return null;
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private toCardDTO(r: Restaurant): RestaurantCardDTO {
    return {
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      priceRange: r.priceRange,
      michelinType: r.michelinType,
      greenStar: r.greenStar,
      imageUrl: r.imageUrl,
      matchScore: 0,
      tags: r.tags,
      zone: r.zone,
      location: r.location,
      country: r.country,
      ambiance: r.ambiance,
    };
  }
}
