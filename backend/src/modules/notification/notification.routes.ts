import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../shared/database/prisma";
import { config } from "../../config";

const router = Router();

const SubscribeSchema = z.object({
  userId: z.string(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

// GET /api/notifications/vapid-public-key
router.get("/vapid-public-key", (_req: Request, res: Response) => {
  res.json({ publicKey: config.vapid.publicKey });
});

// POST /api/notifications/subscribe
router.post("/subscribe", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, subscription } = SubscribeSchema.parse(req.body);
    const { endpoint, keys } = subscription;

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { userId, p256dh: keys.p256dh, auth: keys.auth },
      create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });

    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

// DELETE /api/notifications/unsubscribe
router.delete("/unsubscribe", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { endpoint } = z.object({ endpoint: z.string() }).parse(req.body);
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
