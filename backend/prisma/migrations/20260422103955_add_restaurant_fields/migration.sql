/*
  Warnings:

  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MichelinType" AS ENUM ('ETOILE', 'BIB_GOURMAND', 'ETOILE_VERTE', 'SELECTION');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'SEBASTIAN');

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "ChatSession";

-- DropTable
DROP TABLE "Restaurant";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserProfile";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "diet" TEXT[],
    "budget" INTEGER NOT NULL,
    "vibes" TEXT[],
    "occasions" TEXT[],
    "cuisines" TEXT[],
    "zone" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "price_range" INTEGER NOT NULL,
    "michelin_type" "MichelinType" NOT NULL,
    "green_star" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "country" TEXT,
    "zone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "ambiance" TEXT,
    "image_url" TEXT,
    "gallery" TEXT[],
    "hours" JSONB,
    "tags" TEXT[],
    "website_url" TEXT,
    "michelin_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "restaurants_cuisine_idx" ON "restaurants"("cuisine");

-- CreateIndex
CREATE INDEX "restaurants_location_idx" ON "restaurants"("location");

-- CreateIndex
CREATE INDEX "restaurants_country_idx" ON "restaurants"("country");

-- CreateIndex
CREATE INDEX "restaurants_michelin_type_idx" ON "restaurants"("michelin_type");

-- CreateIndex
CREATE INDEX "restaurants_price_range_idx" ON "restaurants"("price_range");

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages"("session_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
