import { z } from "zod";

export const CreateSessionSchema = z.object({
  userId: z.string().uuid(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});

export type CreateSessionDTO = z.infer<typeof CreateSessionSchema>;
export type SendMessageDTO = z.infer<typeof SendMessageSchema>;

export interface RestaurantSnippet {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: string;
  imageUrl: string | null;
  matchScore: number;
  tags: string[];
  zone: string | null;
  ambiance: string | null;
}

export interface ChatMessageOutput {
  id: string;
  sessionId: string;
  role: "user" | "sebastian";
  content: string;
  metadata: { restaurants?: RestaurantSnippet[] } | null;
  createdAt: string;
}

export interface ChatSessionOutput {
  id: string;
  userId: string;
  createdAt: string;
}

// Critères extraits du bloc <RECHERCHE>
export interface SearchCriteria {
  budget?: number;
  vibes?: string[];
  cuisines?: string[];
  occasion?: string;
  zone?: string;
}
