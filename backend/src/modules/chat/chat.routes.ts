import { Router } from "express";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatRepository } from "./chat.repository";
import { RecommendationService } from "../recommendation/recommendation.service";
import { createLLMService } from "../../shared/llm/llm.factory";

const repo = new ChatRepository();
const llm = createLLMService();
const recommender = new RecommendationService();
const service = new ChatService(repo, llm, recommender);
const controller = new ChatController(service);

const router = Router();

// POST /api/chat/sessions — créer une session + message de bienvenue
router.post("/sessions", controller.createSession);

// GET /api/chat/sessions/:sessionId/messages
router.get("/sessions/:sessionId/messages", controller.getMessages);

// POST /api/chat/sessions/:sessionId/messages — envoyer un message utilisateur
router.post("/sessions/:sessionId/messages", controller.sendMessage);

export default router;
