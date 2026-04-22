import { z } from "zod";

// ─── Request ──────────────────────────────────────────────────────────────────

export const QcmAnswerSchema = z.object({
  axis: z.string(),
  question: z.string(),
  answer: z.union([z.string(), z.array(z.string())]),
});

export const OnboardingNextSchema = z.object({
  answers: z.array(QcmAnswerSchema).max(20),
});

export type QcmAnswer = z.infer<typeof QcmAnswerSchema>;
export type OnboardingNextDTO = z.infer<typeof OnboardingNextSchema>;

// ─── LLM raw output ───────────────────────────────────────────────────────────

export interface QcmOption {
  label: string;
  value: string;
  emoji?: string;
}

export interface LLMQuestion {
  done: false;
  axis: string;
  question: string;
  subtitle?: string;
  type: "single" | "multiple" | "text";
  options?: QcmOption[];
}

export interface ExtractedProfile {
  name: string;
  city: string;
  diet: string[];
  budget: number;
  vibes: string[];
  occasions: string[];
  cuisines: string[];
}

export interface LLMComplete {
  done: true;
  message: string;
  profile: ExtractedProfile;
}

// ─── API response ─────────────────────────────────────────────────────────────

export type OnboardingNextResponse = LLMQuestion | LLMComplete;
