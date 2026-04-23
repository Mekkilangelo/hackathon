import { Request, Response, NextFunction } from "express";
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
    } catch (err) {
      next(err);
    }
  };
}
