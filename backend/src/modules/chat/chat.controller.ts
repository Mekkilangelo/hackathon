import { Request, Response, NextFunction } from "express";
import { ChatService } from "./chat.service";
import { CreateSessionSchema, SendMessageSchema } from "./chat.dto";

export class ChatController {
  constructor(private readonly service: ChatService) {}

  createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = CreateSessionSchema.parse(req.body);
      const result = await this.service.createSession(userId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const { content } = SendMessageSchema.parse(req.body);
      const message = await this.service.sendMessage(sessionId, content);
      res.json(message);
    } catch (err) {
      next(err);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const messages = await this.service.getMessages(sessionId);
      res.json(messages);
    } catch (err) {
      next(err);
    }
  };
}
