import { Router } from "express";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";

const service = new RecommendationService();
const controller = new RecommendationController(service);

const router = Router();

router.post("/surprise", controller.surprise);

export default router;
