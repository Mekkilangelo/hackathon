import { Router } from "express";
import { prisma } from "../../shared/database/prisma";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import eventRoutes from "./user-event.routes";

const repo = new UserRepository(prisma);
const service = new UserService(repo);
const ctrl = new UserController(service);

const router = Router();

router.post("/", ctrl.create);
router.get("/:id", ctrl.getById);
router.post("/:id/profile", ctrl.createProfile);
router.put("/:id/profile", ctrl.updateProfile);
router.use("/:userId/events", eventRoutes);

export default router;
