import { ILLMService, LLMMessage } from "./llm.interface";
import crypto from "crypto";

interface CacheEntry {
  response: string;
  timestamp: number;
}

const TTL_MS = 60 * 60 * 1000; // 1 heure

export class LLMCacheProxy implements ILLMService {
  private cache = new Map<string, CacheEntry>();

  constructor(private readonly service: ILLMService) {}

  async chat(messages: LLMMessage[]): Promise<string> {
    const key = this.buildKey(messages);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < TTL_MS) {
      return cached.response;
    }

    const response = await this.service.chat(messages);
    this.cache.set(key, { response, timestamp: Date.now() });
    return response;
  }

  private buildKey(messages: LLMMessage[]): string {
    const payload = JSON.stringify(messages);
    return crypto.createHash("sha256").update(payload).digest("hex");
  }
}
