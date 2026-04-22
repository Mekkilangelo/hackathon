import { PrismaClient, MichelinType } from "@prisma/client";

const prisma = new PrismaClient();

const MICHELIN_MAP: Record<string, MichelinType> = {
  "etoile": MichelinType.ETOILE,
  "bib-gourmand": MichelinType.BIB_GOURMAND,
  "etoile-verte": MichelinType.ETOILE_VERTE,
};

const restaurants = [
  // ── Étoile Michelin ──────────────────────────────────────────────────────────
  {
    name: "Le Grand Véfour",
    cuisine: "française",
    priceRange: 3,
    michelinType: "etoile",
    address: "17 Rue de Beaujolais, 75001 Paris",
    zone: "1er",
    description:
      "Joyau du Palais-Royal, ce monument gastronomique du XVIIIe siècle sublime la cuisine française classique dans un écrin de dorures et de miroirs.",
    ambiance: "gastro",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    ],
    hours: { lun: "12h-14h / 19h30-22h", mar: "12h-14h / 19h30-22h", mer: "12h-14h / 19h30-22h", jeu: "12h-14h / 19h30-22h", ven: "12h-14h / 19h30-22h", sam: "Fermé", dim: "Fermé" },
    tags: ["classique", "historique", "prestige", "dégustation"],
  },
  {
    name: "Septime",
    cuisine: "française",
    priceRange: 3,
    michelinType: "etoile",
    address: "80 Rue de Charonne, 75011 Paris",
    zone: "11e",
    description:
      "Table bistronomique de référence, Septime réinvente la cuisine de saison avec une créativité maîtrisée et des produits d'exception sourcés directement chez les producteurs.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "12h-14h / 19h30-22h", mer: "12h-14h / 19h30-22h", jeu: "12h-14h / 19h30-22h", ven: "12h-14h / 19h30-22h", sam: "19h30-22h", dim: "Fermé" },
    tags: ["bistronomique", "saison", "naturel", "créatif", "vegan-friendly"],
  },
  {
    name: "Frenchie",
    cuisine: "française",
    priceRange: 3,
    michelinType: "etoile",
    address: "5 Rue du Nil, 75002 Paris",
    zone: "2e",
    description:
      "Greg Marchand impose ici une cuisine franco-américaine décontractée et percutante, dans le quartier historique du Sentier. L'une des tables les plus difficiles à réserver de Paris.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "19h-22h30", mer: "19h-22h30", jeu: "19h-22h30", ven: "19h-22h30", sam: "19h-22h30", dim: "Fermé" },
    tags: ["franco-américain", "créatif", "incontournable", "dégustation"],
  },
  {
    name: "Le Clarence",
    cuisine: "française",
    priceRange: 3,
    michelinType: "etoile",
    address: "31 Avenue Franklin Roosevelt, 75008 Paris",
    zone: "8e",
    description:
      "Dans un hôtel particulier haussmannien, Christophe Pelé déploie une cuisine haute couture mêlant produits nobles et audace technique. Cave à vins d'exception.",
    ambiance: "gastro",
    imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "12h-14h / 19h30-22h", mer: "12h-14h / 19h30-22h", jeu: "12h-14h / 19h30-22h", ven: "12h-14h / 19h30-22h", sam: "Fermé", dim: "Fermé" },
    tags: ["haute-gastronomie", "cave", "prestige", "hôtel-particulier"],
  },
  {
    name: "Kei",
    cuisine: "fusion",
    priceRange: 3,
    michelinType: "etoile",
    address: "5 Rue Coq Héron, 75001 Paris",
    zone: "1er",
    description:
      "Le chef japonais Kei Kobayashi sublime la grande cuisine française avec une précision nippone d'exception. Une fusion élégante et unique en son genre.",
    ambiance: "gastro",
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "12h-14h / 19h30-22h", mer: "12h-14h / 19h30-22h", jeu: "12h-14h / 19h30-22h", ven: "12h-14h / 19h30-22h", sam: "19h30-22h", dim: "Fermé" },
    tags: ["franco-japonais", "précision", "fusion", "dégustation"],
  },

  // ── Bib Gourmand ─────────────────────────────────────────────────────────────
  {
    name: "Bistrot Paul Bert",
    cuisine: "française",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "18 Rue Paul Bert, 75011 Paris",
    zone: "11e",
    description:
      "Le bistrot parisien par excellence. Steak-frites mémorable, oeuf mayonnaise parfait et desserts généreux dans une salle aux miroirs patinés.",
    ambiance: "cozy",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "12h-14h30 / 19h30-23h", mer: "12h-14h30 / 19h30-23h", jeu: "12h-14h30 / 19h30-23h", ven: "12h-14h30 / 19h30-23h", sam: "12h-14h30 / 19h30-23h", dim: "Fermé" },
    tags: ["bistrot", "classique", "convivial", "viande", "vin-naturel"],
  },
  {
    name: "Le Servan",
    cuisine: "fusion",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "32 Rue Saint-Maur, 75011 Paris",
    zone: "11e",
    description:
      "Les sœurs Levha proposent une cuisine franco-asiatique ensoleillée et généreuse. Petite salle animée, ardoise qui change chaque jour.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "12h-14h30 / 19h30-22h30", mer: "12h-14h30 / 19h30-22h30", jeu: "12h-14h30 / 19h30-22h30", ven: "12h-14h30 / 19h30-22h30", sam: "19h30-22h30", dim: "Fermé" },
    tags: ["franco-asiatique", "ardoise", "convivial", "épices", "sans-gluten-friendly"],
  },
  {
    name: "Bones",
    cuisine: "fusion",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "43 Rue Godefroy Cavaignac, 75011 Paris",
    zone: "11e",
    description:
      "Cuisine du feu et des braises inspirée par les voyages du chef James Henry. Ambiance brute et chaleureuse, vins nature de grande pointure.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "Fermé", mer: "19h30-23h", jeu: "19h30-23h", ven: "19h30-23h", sam: "19h30-23h", dim: "Fermé" },
    tags: ["feu", "braises", "vin-naturel", "brut", "convivial"],
  },
  {
    name: "Clown Bar",
    cuisine: "française",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "114 Rue Amelot, 75011 Paris",
    zone: "11e",
    description:
      "Adossé au Cirque d'Hiver, ce bistrot Art Nouveau iconique brille par ses assiettes créatives et ses céramiques classées monument historique.",
    ambiance: "cozy",
    imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "Fermé", mer: "12h-14h30 / 19h30-23h", jeu: "12h-14h30 / 19h30-23h", ven: "12h-14h30 / 19h30-23h", sam: "12h-14h30 / 19h30-23h", dim: "12h-14h30" },
    tags: ["art-nouveau", "historique", "créatif", "brunch", "vegan-friendly"],
  },
  {
    name: "Chez L'Ami Louis",
    cuisine: "française",
    priceRange: 3,
    michelinType: "bib-gourmand",
    address: "32 Rue du Vertbois, 75003 Paris",
    zone: "3e",
    description:
      "Institution parisienne depuis 1924. Foie gras, poulet rôti et pommes de terre sautées font partie des légendes. Cadre inchangé depuis des décennies.",
    ambiance: "cozy",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "Fermé", mer: "12h-14h / 19h30-23h", jeu: "12h-14h / 19h30-23h", ven: "12h-14h / 19h30-23h", sam: "12h-14h / 19h30-23h", dim: "12h-14h / 19h30-23h" },
    tags: ["institution", "classique", "foie-gras", "prestige", "convivial"],
  },

  // ── Étoile Verte ─────────────────────────────────────────────────────────────
  {
    name: "Saturne",
    cuisine: "française",
    priceRange: 3,
    michelinType: "etoile-verte",
    address: "17 Rue Notre-Dame des Victoires, 75002 Paris",
    zone: "2e",
    description:
      "Pionnier de la cuisine durable à Paris, Saturne travaille en circuit ultra-court avec des producteurs biologiques. Vins nature d'anthologie.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "12h-14h / 19h30-22h", mer: "12h-14h / 19h30-22h", jeu: "12h-14h / 19h30-22h", ven: "12h-14h / 19h30-22h", sam: "Fermé", dim: "Fermé" },
    tags: ["biologique", "durable", "circuit-court", "vin-nature", "vegan-friendly"],
  },
  {
    name: "ERH",
    cuisine: "française",
    priceRange: 2,
    michelinType: "etoile-verte",
    address: "13 Rue Maria Callas, 75010 Paris",
    zone: "10e",
    description:
      "Cuisine végétale engagée dans un loft lumineux du 10e. Régis Heurtel propose des assiettes d'une beauté formelle avec zéro produit animal.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "12h-14h30 / 19h30-22h", mer: "12h-14h30 / 19h30-22h", jeu: "12h-14h30 / 19h30-22h", ven: "12h-14h30 / 19h30-22h", sam: "19h30-22h", dim: "Fermé" },
    tags: ["vegan", "végétal", "zéro-déchet", "biologique", "sans-gluten-friendly"],
  },
  {
    name: "Le Jardin des Plumes",
    cuisine: "française",
    priceRange: 3,
    michelinType: "etoile-verte",
    address: "1 Rue du Milieu, 27620 Giverny",
    zone: "Giverny",
    description:
      "À deux pas du jardin de Monet, ce restaurant propose une cuisine impressionniste inspirée du potager adjacent. Une parenthèse bucolique hors du temps.",
    ambiance: "cozy",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "Fermé", mer: "12h-14h / 19h-21h30", jeu: "12h-14h / 19h-21h30", ven: "12h-14h / 19h-21h30", sam: "12h-14h / 19h-21h30", dim: "12h-14h" },
    tags: ["nature", "potager", "bucolique", "durable", "vegan-friendly"],
  },

  // ── Street Food & Bistrots abordables ────────────────────────────────────────
  {
    name: "Ober Mamma",
    cuisine: "italienne",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "107 Boulevard Richard Lenoir, 75011 Paris",
    zone: "11e",
    description:
      "Authentique cuisine italienne dans un décor industriel chaleureux. Pizzas au feu de bois, pastas fraîches maison et Negroni d'exception.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "12h-14h30 / 19h-23h", mer: "12h-14h30 / 19h-23h", jeu: "12h-14h30 / 19h-23h", ven: "12h-14h30 / 19h-23h30", sam: "12h-15h / 19h-23h30", dim: "12h-15h / 19h-22h30" },
    tags: ["pizza", "pasta", "brunch", "convivial", "cocktails"],
  },
  {
    name: "Pink Mamma",
    cuisine: "italienne",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "20bis Rue de Douai, 75009 Paris",
    zone: "9e",
    description:
      "Cinq étages de folie italienne dans un immeuble haussmannien entièrement revisité. Rooftop fleuri, vue sur Montmartre, cuisine généreuse.",
    ambiance: "rooftop",
    imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "12h-14h30 / 19h-23h", mer: "12h-14h30 / 19h-23h", jeu: "12h-14h30 / 19h-23h", ven: "12h-14h30 / 19h-23h30", sam: "12h-15h / 19h-23h30", dim: "12h-15h / 19h-22h30" },
    tags: ["rooftop", "italienne", "brunch", "convivial", "vue"],
  },
  {
    name: "Holybelly",
    cuisine: "américaine",
    priceRange: 1,
    michelinType: "bib-gourmand",
    address: "19 Rue Lucien Sampaix, 75010 Paris",
    zone: "10e",
    description:
      "Le brunch australo-américain de référence à Paris. Pancakes légendaires, œufs parfaits et café de spécialité dans un cadre cool du canal Saint-Martin.",
    ambiance: "cozy",
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "Fermé", mer: "9h-17h", jeu: "9h-17h", ven: "9h-17h", sam: "9h-17h30", dim: "9h-17h30" },
    tags: ["brunch", "café-spécialité", "pancakes", "vegan-friendly", "sans-gluten-friendly"],
  },
  {
    name: "Yard",
    cuisine: "fusion",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "6 Rue de Mont-Louis, 75011 Paris",
    zone: "11e",
    description:
      "Une des meilleures tables du 11e arrondissement. Cuisine ouverte, ardoise créative changeant au fil des saisons et sélection de vins naturels soignée.",
    ambiance: "branché",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "19h30-23h", mer: "12h-14h30 / 19h30-23h", jeu: "12h-14h30 / 19h30-23h", ven: "12h-14h30 / 19h30-23h", sam: "12h-14h30 / 19h30-23h", dim: "Fermé" },
    tags: ["saison", "vin-naturel", "créatif", "ardoise", "convivial"],
  },
  {
    name: "Sushi B",
    cuisine: "japonaise",
    priceRange: 3,
    michelinType: "etoile",
    address: "5 Rue Rambuteau, 75004 Paris",
    zone: "4e",
    description:
      "Comptoir de 8 couverts pour une expérience omakase d'exception. Poissons importés quotidiennement du Japon, riz vinaigré avec une précision millimétrique.",
    ambiance: "gastro",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "12h-14h / 19h30-22h", mer: "12h-14h / 19h30-22h", jeu: "12h-14h / 19h30-22h", ven: "12h-14h / 19h30-22h", sam: "19h30-22h", dim: "Fermé" },
    tags: ["omakase", "japonaise", "sushi", "précision", "dégustation"],
  },
  {
    name: "Mamagoto",
    cuisine: "japonaise",
    priceRange: 1,
    michelinType: "bib-gourmand",
    address: "30 Rue René Boulanger, 75010 Paris",
    zone: "10e",
    description:
      "Gyozas maison, ramens réconfortants et izakaya moderne dans le 10e. L'adresse japonaise populaire pour dîner entre amis sans se ruiner.",
    ambiance: "street-food",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "12h-14h30 / 19h-23h", mer: "12h-14h30 / 19h-23h", jeu: "12h-14h30 / 19h-23h", ven: "12h-14h30 / 19h-23h30", sam: "12h-15h / 19h-23h30", dim: "12h-15h" },
    tags: ["ramen", "gyoza", "izakaya", "street-food", "convivial"],
  },
  {
    name: "Miznon",
    cuisine: "israélienne",
    priceRange: 1,
    michelinType: "bib-gourmand",
    address: "22 Rue des Écouffes, 75004 Paris",
    zone: "4e",
    description:
      "Le chef Eyal Shani transforme des légumes entiers rôtis en art dans ses pittas généreuses. Street food israélien devenu culte dans le Marais.",
    ambiance: "street-food",
    imageUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80",
    gallery: [],
    hours: { lun: "12h-22h", mar: "12h-22h", mer: "12h-22h", jeu: "12h-22h", ven: "12h-16h", sam: "Fermé", dim: "12h-22h" },
    tags: ["street-food", "israélienne", "végétarien", "vegan-friendly", "halal"],
  },
  {
    name: "Le Perchoir",
    cuisine: "française",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "14 Rue Crespin du Gast, 75011 Paris",
    zone: "11e",
    description:
      "Le rooftop le plus célèbre de Paris. Vue panoramique sur les toits, cocktails signature et cuisine bistrot élaborée. Réservation indispensable en été.",
    ambiance: "rooftop",
    imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    ],
    hours: { lun: "Fermé", mar: "18h-01h", mer: "18h-01h", jeu: "18h-01h", ven: "18h-02h", sam: "12h30-02h", dim: "12h30-23h" },
    tags: ["rooftop", "cocktails", "vue", "brunch", "convivial"],
  },
  {
    name: "Huitrerie Régis",
    cuisine: "française",
    priceRange: 2,
    michelinType: "bib-gourmand",
    address: "3 Rue de Montfaucon, 75006 Paris",
    zone: "6e",
    description:
      "Minuscule comptoir à huîtres de Saint-Germain-des-Prés. Les meilleures huîtres de Paris servies avec du pain beurré et un muscadet frais.",
    ambiance: "cozy",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "12h-22h30", mer: "12h-22h30", jeu: "12h-22h30", ven: "12h-23h", sam: "12h-23h", dim: "12h-22h30" },
    tags: ["fruits-de-mer", "huîtres", "classique", "intime", "saint-germain"],
  },
  {
    name: "Breizh Café",
    cuisine: "française",
    priceRange: 1,
    michelinType: "bib-gourmand",
    address: "109 Rue Vieille du Temple, 75003 Paris",
    zone: "3e",
    description:
      "La crêperie bretonne qui a tout révolutionné. Sarrasin bio, garnitures créatives et cidres artisanaux dans le Marais. File d'attente quasi permanente.",
    ambiance: "cozy",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    gallery: [],
    hours: { lun: "Fermé", mar: "11h30-23h", mer: "11h30-23h", jeu: "11h30-23h", ven: "11h30-23h30", sam: "11h-23h30", dim: "11h-23h" },
    tags: ["crêpe", "breton", "brunch", "vegan-friendly", "sans-gluten-friendly"],
  },
];

async function main() {
  console.log("🌱 Seeding restaurants...");

  await prisma.restaurant.deleteMany();

  for (const data of restaurants) {
    await prisma.restaurant.create({
      data: {
        ...data,
        michelinType: MICHELIN_MAP[data.michelinType] ?? MichelinType.BIB_GOURMAND,
      },
    });
  }

  console.log(`✅ ${restaurants.length} restaurants inserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
