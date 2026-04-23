"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push-notifications";

export default function PushNotificationManager() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
