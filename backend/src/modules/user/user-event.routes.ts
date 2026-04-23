import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../shared/middleware/error-handler";

const router = Router({ mergeParams: true }); // hérite de :userId

const EventSchema = z.object({
  title:       z.string().min(1),
  date:        z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  isRecurring: z.boolean().default(false),
  type:        z.string().min(1),
  emoji:       z.string().default("🎉"),
});

// GET /api/users/:userId/events
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.userEvent.findMany({
      where: { userId: req.params.userId },
      orderBy: { date: "asc" },
    });
    res.json(events);
  } catch (err) { next(err); }
});

// POST /api/users/:userId/events
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = EventSchema.parse(req.body);
    const event = await prisma.userEvent.create({
      data: { ...data, userId: req.params.userId, date: new Date(data.date) },
    });
    res.status(201).json(event);
  } catch (err) { next(err); }
});

// DELETE /api/users/:userId/events/:eventId
router.delete("/:eventId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.userEvent.findUnique({ where: { id: req.params.eventId } });
    if (!event || event.userId !== req.params.userId) throw new AppError(404, "Event not found");
    await prisma.userEvent.delete({ where: { id: req.params.eventId } });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
