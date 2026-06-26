"use client";
import { useState, useCallback, useEffect } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = "Notification" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return "denied" as const;
    const perm = await Notification.requestPermission();
    setPermission(perm as NotificationPermission);
    return perm;
  }, [supported]);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!supported || permission !== "granted") return;
      return new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    },
    [supported, permission]
  );

  const notifyPriceAlert = useCallback(
    (skinName: string, price: number, marketplace: string) => {
      return notify(`Price Alert: ${skinName}`, {
        body: `Now listed at $${price.toFixed(2)} on ${marketplace}`,
        tag: `price-alert-${skinName}`,
      });
    },
    [notify]
  );

  const notifyOpportunity = useCallback(
    (skinName: string, profit: number) => {
      return notify(`New Opportunity: ${skinName}`, {
        body: `Potential profit: $${profit.toFixed(2)}`,
        tag: `opportunity-${skinName}`,
      });
    },
    [notify]
  );

  return {
    supported,
    permission,
    requestPermission,
    notify,
    notifyPriceAlert,
    notifyOpportunity,
  };
}
