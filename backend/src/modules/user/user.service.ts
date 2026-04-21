import { UserRepository } from "./user.repository";
import { CreateUserDTO, UserProfileDTO } from "./user.dto";
import { AppError } from "../../shared/middleware/error-handler";

export class UserService {
  constructor(private repo: UserRepository) {}

  async createUser(data: CreateUserDTO) {
    return this.repo.create(data);
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  async createProfile(userId: string, data: UserProfileDTO) {
    await this.getUserById(userId);
    return this.repo.createProfile(userId, data);
  }

  async updateProfile(userId: string, data: Partial<UserProfileDTO>) {
    await this.getUserById(userId);
    return this.repo.updateProfile(userId, data);
  }
}
