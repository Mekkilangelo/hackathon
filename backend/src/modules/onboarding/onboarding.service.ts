import { ILLMService } from "../../shared/llm/llm.interface";
import { buildOnboardingPrompt, QcmAnswer } from "./prompts/sebastian-onboarding.prompt";
import { locationService } from "../../shared/location/location.service";
import {
  OnboardingNextDTO,
  OnboardingNextResponse,
} from "./onboarding.dto";

const TAG_OPEN = "<QCM>";
const TAG_CLOSE = "</QCM>";

export class OnboardingService {
  constructor(private readonly llm: ILLMService) {}

  async next(dto: OnboardingNextDTO): Promise<OnboardingNextResponse> {
    const location = await locationService.detect();
    const answers = dto.answers as QcmAnswer[];

    const prompt = buildOnboardingPrompt(location, answers);

    const raw = await this.llm.chat([{ role: "system", content: prompt }]);

    return this.parseResponse(raw);
  }

  private parseResponse(text: string): OnboardingNextResponse {
    const start = text.indexOf(TAG_OPEN);
    const end = text.indexOf(TAG_CLOSE);

    if (start === -1 || end === -1) {
      console.error("[Onboarding] LLM response missing <QCM> tag:\n", text.slice(0, 500));
      throw new Error("Réponse LLM malformée — balise <QCM> manquante");
    }

    const json = text.slice(start + TAG_OPEN.length, end).trim();
    try {
      return JSON.parse(json) as OnboardingNextResponse;
    } catch (e) {
      console.error("[Onboarding] JSON parse error:", e, "\nRaw JSON:", json.slice(0, 300));
      throw new Error("Réponse LLM malformée — JSON invalide");
    }
  }
}
