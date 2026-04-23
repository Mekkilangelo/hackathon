import { z } from "zod";

// ─── Request ──────────────────────────────────────────────────────────────────

// answer peut être string, string[], ou nombre (le LLM envoie parfois 1/2/3 pour budget)
const answerValue = z
  .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
  .transform((v) => {
    if (Array.isArray(v)) return v.map(String);
    return String(v);
  });

export const QcmAnswerSchema = z.object({
  axis: z.string(),
  question: z.string(),
  answer: answerValue,
});

export const OnboardingNextSchema = z.object({
  answers: z.array(QcmAnswerSchema).max(20).default([]),
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
