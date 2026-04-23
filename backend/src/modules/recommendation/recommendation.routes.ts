import { Router } from "express";
<<<<<<< HEAD
import { prisma } from "../../shared/database/prisma";
import { UserRepository } from "../user/user.repository";
import { RestaurantRepository } from "../restaurant/restaurant.repository";
import { RecommendationService } from "./recommendation.service";
import { RecommendationController } from "./recommendation.controller";

const userRepo = new UserRepository(prisma);
const restaurantRepo = new RestaurantRepository(prisma);
const service = new RecommendationService(userRepo, restaurantRepo);
const ctrl = new RecommendationController(service);

const router = Router();

router.post("/surprise", ctrl.surprise);
=======
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";

const service = new RecommendationService();
const controller = new RecommendationController(service);

const router = Router();

router.post("/surprise", controller.surprise);
>>>>>>> main

export default router;
