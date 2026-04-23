import { Restaurant, UserProfile } from "@prisma/client";
import { prisma } from "../../shared/database/prisma";
import { RestaurantSnippet, SearchCriteria } from "../chat/chat.dto";

function scoreRestaurant(
  r: Restaurant,
  profile: UserProfile | undefined,
  criteria: SearchCriteria
): number {
  let score = 0;

  // Budget (critère contextuel prioritaire, sinon profil)
  const targetBudget = criteria.budget ?? profile?.budget ?? 2;
  if (r.priceRange <= targetBudget) score += 3;
  else if (r.priceRange === targetBudget + 1) score += 1; // légèrement au-dessus = toléré

  // Cuisine — critère contextuel
  if (criteria.cuisines?.length) {
    const match = criteria.cuisines.some((c) =>
      r.cuisine.toLowerCase().includes(c.toLowerCase())
    );
    if (match) score += 3;
  } else if (profile?.cuisines?.length) {
    const match = profile.cuisines.some((c) =>
      r.cuisine.toLowerCase().includes(c.toLowerCase())
    );
    if (match) score += 2;
  }

  // Vibe / ambiance
  const targetVibes = criteria.vibes?.length ? criteria.vibes : profile?.vibes ?? [];
  if (targetVibes.length && r.ambiance) {
    const ambianceLow = r.ambiance.toLowerCase();
    const tagMatch = targetVibes.filter(
      (v) => ambianceLow.includes(v) || r.tags.includes(v)
    ).length;
    score += tagMatch;
  }

  // Zone
  if (criteria.zone && r.zone) {
    if (r.zone.toLowerCase().includes(criteria.zone.toLowerCase())) score += 2;
  }

  // Régime alimentaire (malus si incompatible)
  if (profile?.diet?.length) {
    const noHalal = profile.diet.includes("halal") && !r.tags.includes("halal");
    const noVegan = profile.diet.includes("vegan") && !r.tags.includes("vegan");
    const noVege = profile.diet.includes("vegetarien") && !r.tags.includes("vegetarien") && !r.tags.includes("vegan");
    if (noHalal || noVegan || noVege) score -= 5;
  }

  return score;
}

function toSnippet(r: Restaurant, score: number): RestaurantSnippet {
  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    priceRange: r.priceRange,
    michelinType: r.michelinType,
    imageUrl: (r as unknown as Record<string, unknown>).imageUrl as string | null ?? null,
    matchScore: Math.max(0, score),
    tags: r.tags,
    zone: r.zone ?? null,
    ambiance: (r as unknown as Record<string, unknown>).ambiance as string | null ?? null,
  };
}

export class RecommendationService {
  async findTop(
    profile: UserProfile | undefined,
    criteria: SearchCriteria,
    limit: number
  ): Promise<RestaurantSnippet[]> {
    const restaurants = await prisma.restaurant.findMany({ take: 200 });

    const scored = restaurants
      .map((r) => ({ r, score: scoreRestaurant(r, profile, criteria) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ r, score }) => toSnippet(r, score));
  }

  async surprise(profile: UserProfile | undefined): Promise<RestaurantSnippet | null> {
    const restaurants = await prisma.restaurant.findMany({ take: 200 });

    // Sélection pondérée par affinité au profil, avec part d'aléatoire
    const scored = restaurants
      .map((r) => ({
        r,
        score: scoreRestaurant(r, profile, {}) + Math.random() * 2,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;

    // Prend aléatoirement parmi les 5 premiers
    const pool = scored.slice(0, Math.min(5, scored.length));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return toSnippet(pick.r, pick.score);
  }
}
