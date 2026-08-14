"use client";

import { useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/madar/push-subscriptions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "idle" | "loading" | "granted" | "denied" | "unsupported";

export function NotificationBell({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") setStatus("granted");
    if (Notification.permission === "denied") setStatus("denied");
  }, []);

  const subscribe = async () => {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "idle");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("مفتاح VAPID العام غير مُعرَّف");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await savePushSubscription(subscription.toJSON());
      setStatus("granted");
    } catch (err) {
      console.error("فشل الاشتراك بالإشعارات:", err);
      setStatus("idle");
    }
  };

  if (status === "unsupported" || status === "granted") return null;

  return (
    <button
      onClick={subscribe}
      disabled={status === "loading" || status === "denied"}
      className={
        className ??
        "flex items-center gap-1.5 rounded-full border border-gold px-2.5 py-1 text-xs font-bold text-gold transition-colors hover:bg-gold hover:text-accent-foreground disabled:opacity-60"
      }
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {status === "loading"
        ? "جارٍ التفعيل..."
        : status === "denied"
          ? "الإشعارات محظورة"
          : "فعّل الإشعارات"}
    </button>
  );
}
