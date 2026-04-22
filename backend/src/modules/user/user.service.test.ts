import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

const mockUser = {
  id: "uuid-1",
  name: "Marie",
  createdAt: new Date(),
  profile: null,
};

const mockProfile = {
  id: "profile-1",
  userId: "uuid-1",
  diet: ["vegan"],
  budget: 2,
  vibes: ["cozy"],
  occasions: ["amis"],
  cuisines: ["française"],
  zone: "11e",
  updatedAt: new Date(),
};

describe("UserService", () => {
  let service: UserService;
  let repo: UserRepository;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
      findById: vi.fn(),
      createProfile: vi.fn(),
      updateProfile: vi.fn(),
    } as unknown as UserRepository;

    service = new UserService(repo);
  });

  describe("createUser", () => {
    it("should create a user with name", async () => {
      vi.mocked(repo.create).mockResolvedValue(mockUser);

      const result = await service.createUser({ name: "Marie" });

      expect(repo.create).toHaveBeenCalledWith({ name: "Marie" });
      expect(result.name).toBe("Marie");
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);

      const result = await service.getUserById("uuid-1");
      expect(result.id).toBe("uuid-1");
    });

    it("should throw 404 when user not found", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);

      await expect(service.getUserById("unknown")).rejects.toThrow("User not found");
    });
  });

  describe("createProfile", () => {
    it("should create profile for existing user", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockUser);
      vi.mocked(repo.createProfile).mockResolvedValue(mockProfile);

      const profileData = {
        diet: ["vegan"],
        budget: 2,
        vibes: ["cozy"],
        occasions: ["amis"],
        cuisines: ["française"],
        zone: "11e",
      };

      const result = await service.createProfile("uuid-1", profileData);

      expect(repo.findById).toHaveBeenCalledWith("uuid-1");
      expect(repo.createProfile).toHaveBeenCalledWith("uuid-1", profileData);
      expect(result.diet).toEqual(["vegan"]);
    });

    it("should throw if user does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);

      await expect(
        service.createProfile("unknown", {
          diet: [],
          budget: 1,
          vibes: [],
          occasions: [],
          cuisines: [],
        }),
      ).rejects.toThrow("User not found");
    });
  });
});
