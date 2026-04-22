import {
  recommendationsApi,
  restaurantsApi,
  type MichelinTypeDTO,
  type RestaurantCardDTO,
  type RestaurantDetailDTO,
} from "@/lib/api";

export interface RestaurantCardDisplay extends RestaurantCardDTO {
  recommendationReason?: string;
}

export interface RestaurantDetailDisplay extends RestaurantDetailDTO {
  recommendationReason?: string;
}

export interface RecommendationContext {
  budget?: number;
  cuisine?: string;
  occasion?: string;
  vibe?: string;
  zone?: string;
}

interface MockRestaurant extends RestaurantDetailDisplay {
  goodFor: string[];
  vibeMatches: string[];
}

type NormalizedMichelinType = "ETOILE" | "BIB_GOURMAND" | "ETOILE_VERTE";

const mockRestaurants: MockRestaurant[] = [
  {
    id: "septime-paris",
    name: "Septime",
    cuisine: "française",
    priceRange: 3,
    michelinType: "ETOILE",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
    matchScore: 97,
    tags: ["bistronomique", "saison", "naturel", "créatif"],
    zone: "11e",
    ambiance: "branché",
    description:
      "Une table vive et très sûre, où la cuisine de saison reste précise sans devenir démonstrative. L'adresse parfaite quand tu veux impressionner sans tomber dans le cérémonial.",
    address: "80 Rue de Charonne, 75011 Paris",
    hours: {
      lun: "Fermé",
      mar: "12h-14h / 19h30-22h",
      mer: "12h-14h / 19h30-22h",
      jeu: "12h-14h / 19h30-22h",
      ven: "12h-14h / 19h30-22h",
      sam: "19h30-22h",
      dim: "Fermé",
    },
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=1200&q=80",
    ],
    recommendationReason:
      "Je l'ai gardé parce que l'assiette est nette, la salle vit bien, et le niveau reste très haut sans raideur.",
    goodFor: ["date", "amis", "business"],
    vibeMatches: ["branché", "gastro"],
  },
  {
    id: "saturne-paris",
    name: "Saturne",
    cuisine: "française",
    priceRange: 3,
    michelinType: "ETOILE_VERTE",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=1200&q=80",
    matchScore: 95,
    tags: ["durable", "circuit-court", "vin-nature", "vegan-friendly"],
    zone: "2e",
    ambiance: "branché",
    description:
      "Une adresse élégante pour qui aime la précision et les produits impeccables. Le discours durable n'est pas plaqué: il se sent vraiment dans l'assiette.",
    address: "17 Rue Notre-Dame des Victoires, 75002 Paris",
    hours: {
      lun: "Fermé",
      mar: "12h-14h / 19h30-22h",
      mer: "12h-14h / 19h30-22h",
      jeu: "12h-14h / 19h30-22h",
      ven: "12h-14h / 19h30-22h",
      sam: "Fermé",
      dim: "Fermé",
    },
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80",
    ],
    recommendationReason:
      "Je l'ai retenu pour son calme, sa cohérence et ce petit supplément d'exigence qui change vraiment la soirée.",
    goodFor: ["date", "solo", "business"],
    vibeMatches: ["branché", "gastro"],
  },
  {
    id: "pink-mamma-paris",
    name: "Pink Mamma",
    cuisine: "italienne",
    priceRange: 2,
    michelinType: "BIB_GOURMAND",
    imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=80",
    matchScore: 91,
    tags: ["rooftop", "italienne", "convivial", "vue"],
    zone: "9e",
    ambiance: "rooftop",
    description:
      "Une grande scène italienne pensée pour les soirées qui doivent avoir du rythme. C'est généreux, vivant, bien foutu, et ça coche immédiatement la case plaisir.",
    address: "20bis Rue de Douai, 75009 Paris",
    hours: {
      lun: "Fermé",
      mar: "12h-14h30 / 19h-23h",
      mer: "12h-14h30 / 19h-23h",
      jeu: "12h-14h30 / 19h-23h",
      ven: "12h-14h30 / 19h-23h30",
      sam: "12h-15h / 19h-23h30",
      dim: "12h-15h / 19h-22h30",
    },
    gallery: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
    ],
    recommendationReason:
      "Si tu veux de l'énergie, du décor et une adresse facile à aimer tout de suite, c'est celle-ci.",
    goodFor: ["amis", "brunch", "date"],
    vibeMatches: ["rooftop", "branché"],
  },
  {
    id: "sushi-b-paris",
    name: "Sushi B",
    cuisine: "japonaise",
    priceRange: 3,
    michelinType: "ETOILE",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80",
    matchScore: 94,
    tags: ["omakase", "sushi", "précision", "dégustation"],
    zone: "4e",
    ambiance: "gastro",
    description:
      "Petit comptoir, concentration maximale, gestes sans déchet. Une expérience précise et rare, idéale quand tu veux une table qui marque vraiment les esprits.",
    address: "5 Rue Rambuteau, 75004 Paris",
    hours: {
      lun: "Fermé",
      mar: "12h-14h / 19h30-22h",
      mer: "12h-14h / 19h30-22h",
      jeu: "12h-14h / 19h30-22h",
      ven: "12h-14h / 19h30-22h",
      sam: "19h30-22h",
      dim: "Fermé",
    },
    gallery: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
    ],
    recommendationReason:
      "Je l'ai glissé dans la sélection quand l'envie du moment demande plus de précision que de volume.",
    goodFor: ["date", "business", "solo"],
    vibeMatches: ["gastro", "cozy"],
  },
  {
    id: "erh-paris",
    name: "ERH",
    cuisine: "française",
    priceRange: 2,
    michelinType: "ETOILE_VERTE",
    imageUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
    matchScore: 89,
    tags: ["vegan", "végétal", "biologique", "zéro-déchet"],
    zone: "10e",
    ambiance: "branché",
    description:
      "Cuisine végétale sérieuse, graphique, lumineuse. Une très bonne option quand tu veux une table actuelle sans sacrifier l'effet waouh.",
    address: "13 Rue Maria Callas, 75010 Paris",
    hours: {
      lun: "Fermé",
      mar: "12h-14h30 / 19h30-22h",
      mer: "12h-14h30 / 19h30-22h",
      jeu: "12h-14h30 / 19h30-22h",
      ven: "12h-14h30 / 19h30-22h",
      sam: "19h30-22h",
      dim: "Fermé",
    },
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=1200&q=80",
    ],
    recommendationReason:
      "Je le garde quand tu cherches une table plus légère, plus actuelle, mais toujours très tenue.",
    goodFor: ["solo", "amis", "business"],
    vibeMatches: ["branché", "cozy"],
  },
];

const dayLabels: Record<string, string> = {
  lun: "Lundi",
  mar: "Mardi",
  mer: "Mercredi",
  jeu: "Jeudi",
  ven: "Vendredi",
  sam: "Samedi",
  dim: "Dimanche",
};

function normalizeMichelinType(type: MichelinTypeDTO): NormalizedMichelinType {
  switch (type) {
    case "etoile":
    case "ETOILE":
      return "ETOILE";
    case "bib-gourmand":
    case "BIB_GOURMAND":
      return "BIB_GOURMAND";
    case "etoile-verte":
    case "ETOILE_VERTE":
      return "ETOILE_VERTE";
    default:
      return "ETOILE";
  }
}

function toCardDisplay(restaurant: MockRestaurant): RestaurantCardDisplay {
  return {
    id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    priceRange: restaurant.priceRange,
    michelinType: restaurant.michelinType,
    imageUrl: restaurant.imageUrl,
    matchScore: restaurant.matchScore,
    tags: restaurant.tags,
    zone: restaurant.zone,
    ambiance: restaurant.ambiance,
    recommendationReason: restaurant.recommendationReason,
  };
}

function toDetailDisplay(restaurant: MockRestaurant): RestaurantDetailDisplay {
  return {
    id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    priceRange: restaurant.priceRange,
    michelinType: restaurant.michelinType,
    imageUrl: restaurant.imageUrl,
    matchScore: restaurant.matchScore,
    tags: restaurant.tags,
    zone: restaurant.zone,
    ambiance: restaurant.ambiance,
    description: restaurant.description,
    address: restaurant.address,
    hours: restaurant.hours,
    gallery: restaurant.gallery,
    recommendationReason: restaurant.recommendationReason,
  };
}

function normalizeCard(restaurant: RestaurantCardDTO): RestaurantCardDisplay {
  return {
    ...restaurant,
    michelinType: normalizeMichelinType(restaurant.michelinType),
  };
}

function hashSeed(seed: string): number {
  return seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function pickMockRestaurant(seed?: string): MockRestaurant {
  if (mockRestaurants.length === 1) {
    return mockRestaurants[0];
  }

  const daySeed = new Date().toISOString().slice(0, 10);
  const index = Math.abs(hashSeed(`${seed ?? "surprise"}-${daySeed}`)) % mockRestaurants.length;
  return mockRestaurants[index];
}

function normalizeDetail(restaurant: RestaurantDetailDTO): RestaurantDetailDisplay {
  return {
    ...restaurant,
    michelinType: normalizeMichelinType(restaurant.michelinType),
  };
}

function scoreRestaurant(restaurant: MockRestaurant, context: RecommendationContext): number {
  let score = restaurant.matchScore;

  if (context.budget) {
    score += restaurant.priceRange <= context.budget ? 8 : -6;
  }

  if (context.cuisine) {
    score += restaurant.cuisine === context.cuisine ? 12 : 0;
  }

  if (context.occasion) {
    score += restaurant.goodFor.includes(context.occasion) ? 12 : 0;
  }

  if (context.vibe) {
    score += restaurant.vibeMatches.includes(context.vibe) ? 10 : 0;
  }

  if (context.zone) {
    score += restaurant.zone.includes(context.zone) ? 8 : 0;
  }

  return Math.max(72, Math.min(99, score));
}

function buildIntro(context: RecommendationContext): string {
  if (context.occasion === "date") {
    return "Pour un moment à deux, j'ai retenu trois tables qui savent installer le décor sans oublier l'assiette.";
  }

  if (context.occasion === "business") {
    return "Voici trois adresses très sûres, nettes et bien tenues, pour un rendez-vous où tout doit rester solide.";
  }

  if (context.vibe === "rooftop") {
    return "Tu voulais une table avec de l'air, un peu de panache et assez de fond pour tenir toute la soirée.";
  }

  if (context.budget === 1) {
    return "Je suis resté attentif à l'addition, mais pas question de baisser le niveau de la proposition.";
  }

  return "J'ai gardé trois tables avec une vraie personnalité, assez différentes pour te laisser choisir sans te noyer.";
}

export function getMichelinMeta(type: MichelinTypeDTO) {
  const normalized = normalizeMichelinType(type);

  switch (normalized) {
    case "BIB_GOURMAND":
      return {
        label: "Bib Gourmand",
        shortLabel: "Bib",
        accent: "var(--rouge)",
        surface: "oklch(0.495 0.228 26.5 / 0.16)",
      };
    case "ETOILE_VERTE":
      return {
        label: "Étoile Verte",
        shortLabel: "Verte",
        accent: "oklch(0.75 0.15 145)",
        surface: "oklch(0.75 0.15 145 / 0.16)",
      };
    case "ETOILE":
    default:
      return {
        label: "Étoile Michelin",
        shortLabel: "Étoile",
        accent: "var(--or)",
        surface: "oklch(0.807 0.094 78 / 0.16)",
      };
  }
}

export function formatPriceRange(priceRange: number): string {
  return "€".repeat(Math.max(1, Math.min(3, priceRange)));
}

export function formatServiceHours(hours: Record<string, string>) {
  return Object.entries(hours).map(([day, slot]) => ({
    day: dayLabels[day] ?? day,
    slot,
  }));
}

export async function getEpicSixRecommendations(
  context: RecommendationContext = {},
): Promise<{ intro: string; restaurants: RestaurantCardDisplay[] }> {
  const restaurants = [...mockRestaurants]
    .map((restaurant) => ({
      restaurant,
      score: scoreRestaurant(restaurant, context),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ restaurant, score }) => ({
      ...toCardDisplay(restaurant),
      matchScore: score,
    }));

  return {
    intro: buildIntro(context),
    restaurants,
  };
}

export async function getSurpriseRestaurant(userId?: string): Promise<RestaurantCardDisplay> {
  if (userId) {
    try {
      const restaurant = await recommendationsApi.surprise(userId);
      return normalizeCard(restaurant);
    } catch {
      // Fallback mock tant que l'Epic 5 n'est pas branchée.
    }
  }

  const restaurant = pickMockRestaurant(userId);
  return {
    ...toCardDisplay(restaurant),
    matchScore: 96,
    recommendationReason:
      "Ce soir, je te propose une table qui change le rythme habituel sans perdre en tenue.",
  };
}

export async function getRestaurantDetailData(id: string): Promise<RestaurantDetailDisplay | null> {
  const mockRestaurant = mockRestaurants.find((restaurant) => restaurant.id === id);

  if (mockRestaurant) {
    return toDetailDisplay(mockRestaurant);
  }

  try {
    const restaurant = await restaurantsApi.getById(id);
    return normalizeDetail(restaurant);
  } catch {
    return null;
  }
}

export async function getRestaurantsListFallback(): Promise<RestaurantCardDisplay[]> {
  try {
    const restaurants = await restaurantsApi.list();
    return restaurants.map((restaurant) => normalizeCard(restaurant));
  } catch {
    return mockRestaurants.map((restaurant) => toCardDisplay(restaurant));
  }
}
