import { PrismaClient, MichelinType } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

// ── CSV Parser (RFC 4180) ────────────────────────────────────────────────────

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let i = 0;

  while (i < content.length) {
    const row: string[] = [];

    while (i < content.length) {
      let field = "";

      if (content[i] === '"') {
        i++;
        while (i < content.length) {
          if (content[i] === '"' && content[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (content[i] === '"') {
            i++;
            break;
          } else {
            field += content[i++];
          }
        }
      } else {
        while (i < content.length && content[i] !== "," && content[i] !== "\n" && content[i] !== "\r") {
          field += content[i++];
        }
      }

      row.push(field);

      if (i < content.length && content[i] === ",") {
        i++;
      } else {
        if (i < content.length && content[i] === "\r") i++;
        if (i < content.length && content[i] === "\n") i++;
        break;
      }
    }

    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapAward(award: string, greenStar: boolean): MichelinType {
  if (award === "3 Stars" || award === "2 Stars" || award === "1 Star") return MichelinType.ETOILE;
  if (award === "Bib Gourmand") return MichelinType.BIB_GOURMAND;
  if (award === "Green Star" || (greenStar && award === "Selected Restaurants")) return MichelinType.ETOILE_VERTE;
  return MichelinType.SELECTION;
}

function mapPrice(price: string): number {
  const count = (price.match(/€/g) || []).length;
  if (count >= 1 && count <= 4) return count;
  // handle $$$$ style (USA)
  const dcount = (price.match(/\$/g) || []).length;
  if (dcount >= 1 && dcount <= 4) return dcount;
  return 2;
}

function mapZone(address: string, location: string): string | null {
  if (!location.includes("Paris")) return null;
  const match = address.match(/75(\d{3})/);
  if (!match) return null;
  const arr = parseInt(match[1], 10);
  if (arr === 1) return "1er";
  if (arr >= 2 && arr <= 20) return `${arr}e`;
  return null;
}

function extractCountry(location: string): string {
  const parts = location.split(",").map((p) => p.trim());
  return parts[parts.length - 1] || location;
}

function normalizeCuisine(cuisine: string): string {
  if (!cuisine) return "International";
  return cuisine.split(",")[0].trim();
}

const FACILITY_TAG_MAP: Record<string, string> = {
  "Terrace": "terrasse",
  "Air conditioning": "climatisé",
  "Car park": "parking",
  "Interesting wine list": "belle-carte-des-vins",
  "Counter dining": "comptoir",
  "Wheelchair access": "accessible",
  "Great view": "vue-panoramique",
  "Garden or park": "jardin",
  "Notable sake list": "saké",
  "Interesting sake list": "saké",
  "Cash only": "espèces-seulement",
};

function buildTags(facilities: string, greenStar: boolean, award: string): string[] {
  const tags: string[] = [];

  if (greenStar) tags.push("eco-responsable");
  if (award === "3 Stars") tags.push("3-étoiles");
  if (award === "2 Stars") tags.push("2-étoiles");
  if (award === "1 Star") tags.push("1-étoile");
  if (award === "Bib Gourmand") tags.push("bib-gourmand");

  for (const [fac, tag] of Object.entries(FACILITY_TAG_MAP)) {
    if (facilities.includes(fac)) tags.push(tag);
  }

  return tags;
}

function deriveAmbiance(cuisine: string, facilities: string, award: string): string {
  if (award === "3 Stars" || award === "2 Stars") return "gastro";
  if (facilities.includes("Terrace") || facilities.includes("Great view")) return "terrasse";
  if (cuisine.toLowerCase().includes("contemporary") || cuisine.toLowerCase().includes("modern")) return "branché";
  if (cuisine.toLowerCase().includes("classic") || cuisine.toLowerCase().includes("traditional")) return "cozy";
  if (award === "Bib Gourmand") return "cozy";
  return "cozy";
}

// ── Types ────────────────────────────────────────────────────────────────────

interface RestaurantInput {
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: MichelinType;
  greenStar: boolean;
  address: string;
  location: string;
  country: string;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string;
  ambiance: string;
  imageUrl: null;
  gallery: string[];
  hours: undefined;
  tags: string[];
  websiteUrl: string | null;
  michelinUrl: string | null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Parsing CSV...");
  const csvPath = "michelin_my_maps.csv";
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  // Row 0 = headers: Name,Address,Location,Price,Cuisine,Longitude,Latitude,PhoneNumber,Url,WebsiteUrl,Award,GreenStar,FacilitiesAndServices,Description
  const dataRows = rows.slice(1);

  console.log(`📊 ${dataRows.length} rows found`);

  const restaurants: RestaurantInput[] = [];

  for (const row of dataRows) {
    if (row.length < 14) continue;

    const [name, address, location, price, cuisine, longitude, latitude, , michelinUrl, websiteUrl, award, greenStarRaw, facilities, description] = row;

    if (!name || !address) continue;

    const greenStar = greenStarRaw === "1";
    const michelinType = mapAward(award, greenStar);

    restaurants.push({
      name: name.trim(),
      cuisine: normalizeCuisine(cuisine),
      priceRange: mapPrice(price),
      michelinType,
      greenStar,
      address: address.trim(),
      location: location.trim(),
      country: extractCountry(location),
      zone: mapZone(address, location),
      latitude: latitude ? parseFloat(latitude) || null : null,
      longitude: longitude ? parseFloat(longitude) || null : null,
      description: description?.trim() || "",
      ambiance: deriveAmbiance(cuisine, facilities, award),
      imageUrl: null,
      gallery: [],
      hours: undefined,
      tags: buildTags(facilities, greenStar, award),
      websiteUrl: websiteUrl?.trim() || null,
      michelinUrl: michelinUrl?.trim() || null,
    });
  }

  console.log(`✅ ${restaurants.length} restaurants parsed`);
  console.log("🗑️  Clearing existing restaurants...");
  await prisma.restaurant.deleteMany();

  console.log("💾 Inserting in batches of 500...");
  const BATCH = 500;
  for (let i = 0; i < restaurants.length; i += BATCH) {
    const batch = restaurants.slice(i, i + BATCH);
    await prisma.restaurant.createMany({ data: batch, skipDuplicates: true });
    process.stdout.write(`\r   ${Math.min(i + BATCH, restaurants.length)}/${restaurants.length}`);
  }

  console.log(`\n🎉 Done — ${restaurants.length} restaurants inserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
