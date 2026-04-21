import { PrismaClient, Restaurant } from "@prisma/client";
import { RestaurantFilters } from "./restaurant.dto";

export class RestaurantRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: RestaurantFilters = {}): Promise<Restaurant[]> {
    const where: Record<string, unknown> = {};

    if (filters.cuisine) where.cuisine = filters.cuisine;
    if (filters.budget) where.priceRange = { lte: filters.budget };
    if (filters.zone) where.zone = filters.zone;
    if (filters.michelinType) where.michelinType = filters.michelinType;
    if (filters.tags) {
      where.tags = { hasSome: filters.tags.split(",").map((t) => t.trim()) };
    }

    return this.prisma.restaurant.findMany({ where, orderBy: { name: "asc" } });
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.prisma.restaurant.findUnique({ where: { id } });
  }

  async findByIds(ids: string[]): Promise<Restaurant[]> {
    return this.prisma.restaurant.findMany({ where: { id: { in: ids } } });
  }
}
