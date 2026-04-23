import { Request, Response, NextFunction } from "express";
import { ChatService } from "./chat.service";
import { CreateSessionSchema, SendMessageSchema } from "./chat.dto";

export class ChatController {
  constructor(private service: ChatService) {}

  createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = CreateSessionSchema.parse(req.body);
      const session = await this.service.createSession(userId);
      res.status(201).json(session);
    } catch (err) {
      next(err);
    }
  };

  getOrCreateSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = CreateSessionSchema.parse(req.body);
      const sessionId = await this.service.getOrCreateSession(userId);
      res.json({ sessionId });
    } catch (err) {
      next(err);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await this.service.getMessages(req.params.sessionId);
      res.json(messages);
    } catch (err) {
      next(err);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content, visitedRestaurantIds } = SendMessageSchema.parse(req.body);
      const message = await this.service.sendMessage(req.params.sessionId, content, visitedRestaurantIds);
      res.json(message);
    } catch (err) {
      next(err);
    }
  };
}
