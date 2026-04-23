import { ILLMService } from "./llm.interface";
import { LLMCacheProxy } from "./llm-cache.proxy";
import { GroqService } from "./providers/groq.service";
import { OpenAIService } from "./providers/openai.service";
import { GeminiService } from "./providers/gemini.service";
import { config } from "../../config";

export function createLLMService(): ILLMService {
  let provider: ILLMService;

  switch (config.llm.provider) {
    case "openai":
      provider = new OpenAIService();
      break;
    case "gemini":
      provider = new GeminiService();
      break;
    case "groq":
    default:
      provider = new GroqService();
  }

  return new LLMCacheProxy(provider);
}
