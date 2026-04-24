import cron from "node-cron";
import webpush from "web-push";
import { prisma } from "../database/prisma";
import { config } from "../../config";
import { MichelinType } from "@prisma/client";

const MESSAGES = [
  "Sebastian a sélectionné une table d'exception pour vous cette semaine.",
  "Votre majordome Michelin vous souffle une adresse rare.",
  "L'instant gastronomique de la semaine, selon Sebastian.",
  "Un restaurant Michelin vous attend. Sebastian a fait son choix.",
  "Sebastian a repéré une pépite pour vous cette semaine.",
];

const MICHELIN_LABEL: Record<MichelinType, string> = {
  ETOILE: "⭐ Étoilé Michelin",
  BIB_GOURMAND: "🍽️ Bib Gourmand",
  ETOILE_VERTE: "🌿 Étoile Verte",
  SELECTION: "✦ Sélection Michelin",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function sendInstantMichelin(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} } },
    include: { pushSubscriptions: true, profile: true },
  });

  for (const user of users) {
    const profile = user.profile;

    // Build filters from user profile
    const where: NonNullable<Parameters<typeof prisma.restaurant.findMany>[0]>["where"] = {};
    if (profile?.budget) where.priceRange = { lte: profile.budget };
    if (profile?.city) where.location = { contains: profile.city, mode: "insensitive" };
    if (profile?.cuisines?.length) {
      where.cuisine = { contains: pick(profile.cuisines), mode: "insensitive" };
    }

    let candidates = await prisma.restaurant.findMany({ where });

    // Fallback: any restaurant
    if (!candidates.length) {
      candidates = await prisma.restaurant.findMany({});
    }
    if (!candidates.length) continue;

    const restaurant = pick(candidates);
    const message = pick(MESSAGES);

    const payload = JSON.stringify({
      title: `✨ L'Instant Michelin — ${restaurant.name}`,
      body: `${MICHELIN_LABEL[restaurant.michelinType]} · ${restaurant.cuisine} · ${message}`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: `/restaurant/${restaurant.id}` },
    });

    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }
  }
}

export function startInstantMichelinScheduler(): void {
  if (!config.vapid.publicKey || !config.vapid.privateKey) return;

  webpush.setVapidDetails(
    config.vapid.subject,
    config.vapid.publicKey,
    config.vapid.privateKey
  );

  // Every Monday at 10:00
  cron.schedule("0 10 * * 1", () => {
    sendInstantMichelin().catch(console.error);
  });

  console.log("✨ Instant Michelin scheduler started (Mondays 10:00)");
}
