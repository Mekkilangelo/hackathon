import { z } from "zod";

export const RestaurantFiltersSchema = z.object({
  cuisine: z.string().optional(),
  budget: z.coerce.number().int().min(1).max(3).optional(),
  zone: z.string().optional(),
  tags: z.string().optional(),
  michelinType: z.enum(["etoile", "bib-gourmand", "etoile-verte"]).optional(),
});

export type RestaurantFilters = z.infer<typeof RestaurantFiltersSchema>;

export interface RestaurantCardDTO {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: string;
  imageUrl: string;
  matchScore: number;
  tags: string[];
  zone: string;
  ambiance: string;
}

export interface RestaurantDetailDTO extends RestaurantCardDTO {
  description: string;
  address: string;
  hours: Record<string, string>;
  gallery: string[];
}
