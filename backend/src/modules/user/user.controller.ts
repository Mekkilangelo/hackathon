import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { CreateUserSchema, UserProfileSchema } from "./user.dto";

export class UserController {
  constructor(private service: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = CreateUserSchema.parse(req.body);
      const user = await this.service.createUser(dto);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  createProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = UserProfileSchema.parse(req.body);
      const profile = await this.service.createProfile(req.params.id, dto);
      res.status(201).json(profile);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = UserProfileSchema.partial().parse(req.body);
      const profile = await this.service.updateProfile(req.params.id, dto);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  };
}
