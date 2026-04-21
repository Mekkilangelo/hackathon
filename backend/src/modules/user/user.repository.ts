import { PrismaClient, User, UserProfile } from "@prisma/client";
import { CreateUserDTO, UserProfileDTO } from "./user.dto";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string): Promise<(User & { profile: UserProfile | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async createProfile(userId: string, data: UserProfileDTO): Promise<UserProfile> {
    return this.prisma.userProfile.create({
      data: { userId, ...data },
    });
  }

  async updateProfile(userId: string, data: Partial<UserProfileDTO>): Promise<UserProfile> {
    return this.prisma.userProfile.update({
      where: { userId },
      data,
    });
  }
}
