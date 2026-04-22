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
      // Fallback si le LLM ne respecte pas le format — on relance avec un message d'erreur minimal
      throw new Error("Réponse LLM malformée — balise <QCM> manquante");
    }

    const json = text.slice(start + TAG_OPEN.length, end).trim();
    return JSON.parse(json) as OnboardingNextResponse;
  }
}
