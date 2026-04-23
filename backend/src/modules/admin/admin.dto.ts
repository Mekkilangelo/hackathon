import { z } from "zod";
import { MichelinType } from "@prisma/client";

export const RestaurantWriteSchema = z.object({
  name: z.string().min(1).max(120),
  cuisine: z.string().min(1).max(80),
  priceRange: z.number().int().min(1).max(4),
  michelinType: z.nativeEnum(MichelinType),
  michelinStars: z.number().int().min(1).max(3).optional().nullable(),
  greenStar: z.boolean().default(false),
  address: z.string().min(1),
  location: z.string().min(1),
  country: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  description: z.string().min(1),
  ambiance: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  gallery: z.array(z.string().url()).default([]),
  hours: z.record(z.string()).optional().nullable(),
  tags: z.array(z.string()).default([]),
  websiteUrl: z.string().url().optional().nullable(),
  michelinUrl: z.string().url().optional().nullable(),
});

export type RestaurantWriteDTO = z.infer<typeof RestaurantWriteSchema>;
