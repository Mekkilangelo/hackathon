import { Request, Response, NextFunction } from "express";
<<<<<<< HEAD
import { RecommendationService } from "./recommendation.service";
import { AppError } from "../../shared/middleware/error-handler";

export class RecommendationController {
  constructor(private service: RecommendationService) {}

  surprise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.body;
      if (!userId) throw new AppError(400, "userId required");
      const restaurant = await this.service.surprise(userId);
      if (!restaurant) throw new AppError(404, "No restaurant found");
      res.json(restaurant);
=======
import { z } from "zod";
import { RecommendationService } from "./recommendation.service";
import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../shared/middleware/error-handler";

const SurpriseSchema = z.object({ userId: z.string().uuid() });

export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  surprise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = SurpriseSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (!user) throw new AppError(404, "Utilisateur introuvable");

      const result = await this.service.surprise(user.profile ?? undefined);
      if (!result) throw new AppError(404, "Aucun restaurant disponible");

      res.json(result);
>>>>>>> main
    } catch (err) {
      next(err);
    }
  };
}
