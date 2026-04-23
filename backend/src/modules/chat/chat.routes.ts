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

router.post("/session", ctrl.getOrCreateSession);
router.post("/sessions", ctrl.createSession);
router.get("/sessions/:sessionId/messages", ctrl.getMessages);
router.delete("/sessions/:sessionId", ctrl.deleteSession);
router.post("/sessions/:sessionId/messages", ctrl.sendMessage);

export default router;
