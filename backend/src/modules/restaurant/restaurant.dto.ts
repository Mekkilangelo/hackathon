import { z } from "zod";
import { MichelinType } from "@prisma/client";

export const RestaurantFiltersSchema = z.object({
  cuisine: z.string().optional(),
  budget: z.coerce.number().int().min(1).max(4).optional(),   // priceRange <= budget (max)
  priceMin: z.coerce.number().int().min(1).max(4).optional(), // priceRange >= priceMin (min)
  zone: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  tags: z.string().optional(),
  michelinType: z.nativeEnum(MichelinType).optional(),
  greenStar: z.string().transform(s => s !== "false" && s !== "0").optional(),
  search: z.string().optional(),
});

export type RestaurantFilters = z.infer<typeof RestaurantFiltersSchema>;

export interface RestaurantCardDTO {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: MichelinType;
  greenStar: boolean;
  imageUrl: string | null;
  matchScore: number;
  tags: string[];
  zone: string | null;
  location: string;
  country: string | null;
  ambiance: string | null;
}

export interface RestaurantDetailDTO extends RestaurantCardDTO {
  michelinStars: number | null;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hours: Record<string, string> | null;
  gallery: string[];
  websiteUrl: string | null;
  michelinUrl: string | null;
}
