import { Router } from "express";
import userRoutes from "./modules/user/user.routes";
import restaurantRoutes from "./modules/restaurant/restaurant.routes";
import onboardingRoutes from "./modules/onboarding/onboarding.routes";
import chatRoutes from "./modules/chat/chat.routes";
import recommendationRoutes from "./modules/recommendation/recommendation.routes";
import adminRoutes from "./modules/admin/admin.routes";
import notificationRoutes from "./modules/notification/notification.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "sebastian-api", timestamp: new Date().toISOString() });
});

router.use("/users", userRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/chat", chatRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);

export default router;
