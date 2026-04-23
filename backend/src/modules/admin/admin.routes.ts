import { Router } from "express";
import { AdminController } from "./admin.controller";
import { adminAuth } from "./admin.middleware";

const ctrl = new AdminController();
const router = Router();

// Toutes les routes admin requièrent le token
router.use(adminAuth);

router.get("/restaurants", ctrl.list);
router.post("/restaurants", ctrl.create);
router.put("/restaurants/:id", ctrl.update);
router.delete("/restaurants/:id", ctrl.remove);

export default router;
