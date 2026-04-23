-- AlterTable Restaurant — ajout du champ city (ville du restaurant)
-- DEFAULT 'Paris' pour ne pas casser les données existantes
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "city" TEXT NOT NULL DEFAULT 'Paris';

-- AlterTable UserProfile — remplacement de zone par city (ville souhaitée par l'utilisateur)
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "zone";

-- Index sur city pour filtrage rapide par ville
CREATE INDEX IF NOT EXISTS "restaurants_city_idx" ON "restaurants"("city");
