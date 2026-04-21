import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(80),
});

export const UserProfileSchema = z.object({
  diet: z.array(z.string()).default([]),
  budget: z.number().int().min(1).max(3),
  vibes: z.array(z.string()).default([]),
  occasions: z.array(z.string()).default([]),
  cuisines: z.array(z.string()).default([]),
  zone: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UserProfileDTO = z.infer<typeof UserProfileSchema>;
