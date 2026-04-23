import { Request, Response, NextFunction } from "express";
import { OnboardingService } from "./onboarding.service";
import { OnboardingNextSchema } from "./onboarding.dto";

export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  next = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = OnboardingNextSchema.parse(req.body);
      const result = await this.service.next(dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
