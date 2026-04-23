import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../shared/database/prisma";
import { adminAuth } from "../../shared/middleware/admin-auth";
import { MichelinType } from "@prisma/client";

const router = Router();
router.use(adminAuth);

const RestaurantWriteSchema = z.object({
  name:         z.string().min(1),
  cuisine:      z.string().min(1),
  priceRange:   z.coerce.number().int().min(1).max(4),
  michelinType: z.nativeEnum(MichelinType),
  greenStar:    z.boolean().default(false),
  address:      z.string().min(1),
  location:     z.string().min(1),
  country:      z.string().optional(),
  zone:         z.string().optional(),
  description:  z.string().default(""),
  ambiance:     z.string().optional(),
  tags:         z.array(z.string()).default([]),
  websiteUrl:   z.string().url().optional().or(z.literal("")),
  michelinUrl:  z.string().url().optional().or(z.literal("")),
});

// GET /api/admin/restaurants?search=&page=1&limit=30
router.get("/restaurants", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = "1", limit = "30" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { cuisine: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: parseInt(limit),
        select: {
          id: true, name: true, cuisine: true, priceRange: true,
          michelinType: true, greenStar: true, location: true, country: true,
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    res.json({ restaurants, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/restaurants/:id
router.get("/restaurants/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!r) { res.status(404).json({ error: "Not found" }); return; }
    res.json(r);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/restaurants
router.post("/restaurants", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RestaurantWriteSchema.parse(req.body);
    const r = await prisma.restaurant.create({
      data: {
        ...data,
        websiteUrl: data.websiteUrl || null,
        michelinUrl: data.michelinUrl || null,
        country: data.country || null,
        zone: data.zone || null,
        ambiance: data.ambiance || null,
      },
    });
    res.status(201).json(r);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/restaurants/:id
router.put("/restaurants/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RestaurantWriteSchema.parse(req.body);
    const r = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: {
        ...data,
        websiteUrl: data.websiteUrl || null,
        michelinUrl: data.michelinUrl || null,
        country: data.country || null,
        zone: data.zone || null,
        ambiance: data.ambiance || null,
      },
    });
    res.json(r);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/restaurants/:id
router.delete("/restaurants/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.restaurant.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
