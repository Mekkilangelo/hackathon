import { Router } from "express";
import userRoutes from "./modules/user/user.routes";
// import restaurantRoutes from "./modules/restaurant/restaurant.routes";
// import chatRoutes from "./modules/chat/chat.routes";
// import recommendationRoutes from "./modules/recommendation/recommendation.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "sebastian-api", timestamp: new Date().toISOString() });
});

router.use("/users", userRoutes);
// router.use("/restaurants", restaurantRoutes);
// router.use("/chat", chatRoutes);
// router.use("/recommendations", recommendationRoutes);

export default router;
