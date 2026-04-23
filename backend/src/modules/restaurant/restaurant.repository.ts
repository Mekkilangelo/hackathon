import { PrismaClient, Restaurant } from "@prisma/client";
import { RestaurantFilters } from "./restaurant.dto";

export class RestaurantRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: RestaurantFilters = {}): Promise<Restaurant[]> {
    const where: Record<string, unknown> = {};

    if (filters.cuisine) where.cuisine = { contains: filters.cuisine, mode: "insensitive" };
    if (filters.priceMin && filters.budget) {
      where.priceRange = { gte: filters.priceMin, lte: filters.budget };
    } else if (filters.priceMin) {
      where.priceRange = { gte: filters.priceMin };
    } else if (filters.budget) {
      where.priceRange = { lte: filters.budget };
    }
    if (filters.zone) where.zone = filters.zone;
    if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
    if (filters.country) where.country = { contains: filters.country, mode: "insensitive" };
    if (filters.michelinType) where.michelinType = filters.michelinType;
    if (filters.greenStar !== undefined) where.greenStar = filters.greenStar;
    if (filters.tags) {
      where.tags = { hasSome: filters.tags.split(",").map((t: string) => t.trim()) };
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { cuisine: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return this.prisma.restaurant.findMany({ where, orderBy: { name: "asc" }, take: 100 });
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.prisma.restaurant.findUnique({ where: { id } });
  }

  async findByIds(ids: string[]): Promise<Restaurant[]> {
    return this.prisma.restaurant.findMany({ where: { id: { in: ids } } });
  }
}
