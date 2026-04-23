import { ILLMService, LLMMessage } from "../llm.interface";
import { config } from "../../../config";

// Gemini uses a different API format — messages are mapped to "contents"
export class GeminiService implements ILLMService {
  private get baseUrl() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${config.llm.model}:generateContent?key=${config.llm.apiKey}`;
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    // Extract system prompt and conversation separately
    const systemMsg = messages.find((m) => m.role === "system");
    const turns = messages.filter((m) => m.role !== "system");

    const contents = turns.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents };
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data = (await res.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    return data.candidates[0].content.parts[0].text;
  }
}
