import { ChatRole, ChatSession, ChatMessage } from "@prisma/client";
import { prisma } from "../../shared/database/prisma";
import { ChatMessageOutput, ChatSessionOutput, RestaurantSnippet } from "./chat.dto";

function mapRole(role: ChatRole): "user" | "sebastian" {
  return role === ChatRole.USER ? "user" : "sebastian";
}

function mapMessage(msg: ChatMessage): ChatMessageOutput {
  return {
    id: msg.id,
    sessionId: msg.sessionId,
    role: mapRole(msg.role),
    content: msg.content,
    metadata: msg.metadata as { restaurants?: RestaurantSnippet[] } | null,
    createdAt: msg.createdAt.toISOString(),
  };
}

export class ChatRepository {
  async createSession(userId: string): Promise<ChatSessionOutput> {
    const session = await prisma.chatSession.create({ data: { userId } });
    return { id: session.id, userId: session.userId, createdAt: session.createdAt.toISOString() };
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return prisma.chatSession.findUnique({ where: { id: sessionId } });
  }

  async getMessages(sessionId: string): Promise<ChatMessageOutput[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map(mapMessage);
  }

  async saveMessage(
    sessionId: string,
    role: ChatRole,
    content: string,
    metadata?: { restaurants?: RestaurantSnippet[] }
  ): Promise<ChatMessageOutput> {
    const msg = await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        metadata: metadata ?? null,
      },
    });
    return mapMessage(msg);
  }

  async getUserWithProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }
}
