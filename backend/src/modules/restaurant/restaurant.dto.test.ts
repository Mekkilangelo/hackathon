import { describe, it, expect } from "vitest";
import { RestaurantFiltersSchema } from "./restaurant.dto";

describe("RestaurantFiltersSchema", () => {
  it("accepte un objet vide", () => {
    const result = RestaurantFiltersSchema.parse({});
    expect(result).toEqual({});
  });

  it("parse budget en number depuis une string", () => {
    const result = RestaurantFiltersSchema.parse({ budget: "2" });
    expect(result.budget).toBe(2);
  });

  it("parse greenStar en boolean depuis une string", () => {
    const result = RestaurantFiltersSchema.parse({ greenStar: "true" });
    expect(result.greenStar).toBe(true);
  });

  it("accepte tous les filtres valides", () => {
    const result = RestaurantFiltersSchema.parse({
      cuisine: "French",
      budget: "3",
      location: "Paris",
      country: "France",
      michelinType: "ETOILE",
      greenStar: "false",
      search: "bistrot",
    });
    expect(result.cuisine).toBe("French");
    expect(result.budget).toBe(3);
    expect(result.michelinType).toBe("ETOILE");
    expect(result.greenStar).toBe(false);
  });

  it("rejette un budget hors plage (0)", () => {
    expect(() => RestaurantFiltersSchema.parse({ budget: "0" })).toThrow();
  });

  it("rejette un budget hors plage (5)", () => {
    expect(() => RestaurantFiltersSchema.parse({ budget: "5" })).toThrow();
  });

  it("rejette un michelinType invalide", () => {
    expect(() => RestaurantFiltersSchema.parse({ michelinType: "INCONNU" })).toThrow();
  });
});
