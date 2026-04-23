import { Request, Response, NextFunction } from "express";
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
    } catch (err) {
      next(err);
    }
  };
}
