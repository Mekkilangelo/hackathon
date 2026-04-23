import cron from "node-cron";
import webpush from "web-push";
import { prisma } from "../database/prisma";
import { config } from "../../config";

const REMIND_DAYS = [7, 3, 1];

function daysUntilEvent(date: Date, isRecurring: boolean): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);

  if (isRecurring) {
    target.setFullYear(today.getFullYear());
    target.setHours(0, 0, 0, 0);
    if (target < today) target.setFullYear(today.getFullYear() + 1);
  } else {
    target.setHours(0, 0, 0, 0);
  }

  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export async function checkAndSendReminders(): Promise<void> {
  const users = await prisma.user.findMany({
    include: {
      events: true,
      pushSubscriptions: true,
    },
  });

  for (const user of users) {
    if (user.pushSubscriptions.length === 0) continue;

    for (const event of user.events) {
      const days = daysUntilEvent(event.date, event.isRecurring);
      if (!REMIND_DAYS.includes(days)) continue;

      const dayText =
        days === 1 ? "demain" : days === 3 ? "dans 3 jours" : "dans 7 jours";

      const body =
        days === 1
          ? "C'est demain ! Avez-vous réservé votre table chez Sebastian ?"
          : days === 3
          ? "J-3 ! Sebastian peut vous trouver la table parfaite pour cette occasion."
          : "L'occasion approche. Anticipez votre réservation avec Sebastian.";

      const payload = JSON.stringify({
        title: `${event.emoji} ${event.title} — ${dayText}`,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/chat" },
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
}

export function startEventReminderScheduler(): void {
  if (!config.vapid.publicKey || !config.vapid.privateKey) {
    console.warn("⚠️  VAPID keys not set — push notifications disabled");
    return;
  }

  webpush.setVapidDetails(
    config.vapid.subject,
    config.vapid.publicKey,
    config.vapid.privateKey
  );

  // Run every day at 08:00
  cron.schedule("0 8 * * *", () => {
    checkAndSendReminders().catch(console.error);
  });

  console.log("🔔 Event reminder scheduler started (daily 08:00)");
}
