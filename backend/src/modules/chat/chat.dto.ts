import { z } from "zod";

export const CreateSessionSchema = z.object({
  userId: z.string().uuid(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  visitedRestaurantIds: z.array(z.string()).optional(),
});

export type CreateSessionDTO = z.infer<typeof CreateSessionSchema>;
export type SendMessageDTO = z.infer<typeof SendMessageSchema>;
