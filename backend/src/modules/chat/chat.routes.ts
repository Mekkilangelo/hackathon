import { Router } from "express";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatRepository } from "./chat.repository";
import { RestaurantRepository } from "../restaurant/restaurant.repository";
import { createLLMService } from "../../shared/llm/llm.factory";
import { prisma } from "../../shared/database/prisma";

const repo = new ChatRepository();
const restaurantRepo = new RestaurantRepository(prisma);
const service = new ChatService(repo, restaurantRepo, createLLMService());
const ctrl = new ChatController(service);

const router = Router();

// POST /api/chat/session — get or create session for a user
router.post("/session", ctrl.getOrCreateSession);

// POST /api/chat/sessions — create new session
router.post("/sessions", ctrl.createSession);

// GET /api/chat/sessions/:sessionId/messages
router.get("/sessions/:sessionId/messages", ctrl.getMessages);

// DELETE /api/chat/sessions/:sessionId
router.delete("/sessions/:sessionId", ctrl.deleteSession);

// POST /api/chat/sessions/:sessionId/messages
router.post("/sessions/:sessionId/messages", ctrl.sendMessage);

export default router;
