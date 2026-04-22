import { Router } from "express";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";
import { createLLMService } from "../../shared/llm/llm.factory";

const router = Router();
const controller = new OnboardingController(
  new OnboardingService(createLLMService())
);

// POST /api/onboarding/next
router.post("/next", controller.next);

export default router;
