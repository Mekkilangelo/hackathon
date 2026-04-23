import { ChatRole } from "@prisma/client";
import { prisma } from "../../shared/database/prisma";

export class ChatRepository {
  createSession(userId: string) {
    return prisma.chatSession.create({ data: { userId } });
  }

  getSessionWithUser(sessionId: string) {
    return prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { user: { include: { profile: true } } },
    });
  }

  getRecentMessages(sessionId: string, limit = 12) {
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  getAllMessages(sessionId: string) {
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  }

  saveMessage(sessionId: string, role: ChatRole, content: string, metadata?: object) {
    return prisma.chatMessage.create({
      data: { sessionId, role, content, metadata: metadata ?? undefined },
    });
  }
}
