-- AlterTable User — ajout des champs d'authentification (nullable pour ne pas casser l'existant)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- Index unique sur email (sparse : ne s'applique qu'aux valeurs non-NULL)
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email") WHERE "email" IS NOT NULL;

-- AlterTable Restaurant — ajout des champs manquants (tous nullable)
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "michelin_stars" INTEGER;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "reservation_url" TEXT;
