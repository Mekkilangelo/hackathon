export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ILLMService {
  chat(messages: LLMMessage[]): Promise<string>;
}
