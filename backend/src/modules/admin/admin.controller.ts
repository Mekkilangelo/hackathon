import { Request, Response, NextFunction } from "express";
import { prisma } from "../../shared/database/prisma";
import { RestaurantWriteSchema } from "./admin.dto";
import { AppError } from "../../shared/middleware/error-handler";

export class AdminController {
  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurants = await prisma.restaurant.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          cuisine: true,
          michelinType: true,
          priceRange: true,
          zone: true,
          location: true,
          greenStar: true,
        },
      });
      res.json(restaurants);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = RestaurantWriteSchema.parse(req.body);
      const restaurant = await prisma.restaurant.create({ data });
      res.status(201).json(restaurant);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existing = await prisma.restaurant.findUnique({ where: { id } });
      if (!existing) throw new AppError(404, "Restaurant introuvable");

      const data = RestaurantWriteSchema.partial().parse(req.body);
      const updated = await prisma.restaurant.update({ where: { id }, data });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existing = await prisma.restaurant.findUnique({ where: { id } });
      if (!existing) throw new AppError(404, "Restaurant introuvable");

      await prisma.restaurant.delete({ where: { id } });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}
