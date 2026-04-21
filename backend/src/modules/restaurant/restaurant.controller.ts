import { Request, Response, NextFunction } from "express";
import { RestaurantService } from "./restaurant.service";
import { RestaurantFiltersSchema } from "./restaurant.dto";

export class RestaurantController {
  constructor(private service: RestaurantService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = RestaurantFiltersSchema.parse(req.query);
      const restaurants = await this.service.getAll(filters);
      res.json(restaurants);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const restaurant = await this.service.getById(req.params.id);
      res.json(restaurant);
    } catch (err) {
      next(err);
    }
  };
}
