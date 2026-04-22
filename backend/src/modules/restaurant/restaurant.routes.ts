import { Router } from "express";
import { prisma } from "../../shared/database/prisma";
import { RestaurantRepository } from "./restaurant.repository";
import { RestaurantService } from "./restaurant.service";
import { RestaurantController } from "./restaurant.controller";

const repo = new RestaurantRepository(prisma);
const service = new RestaurantService(repo);
const ctrl = new RestaurantController(service);

const router = Router();

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

export default router;
