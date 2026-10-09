import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getNotificationStore,
  saveNotificationStore,
  addNotification,
  type AppNotification,
} from "./notifications.server";

export type { AppNotification };

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const getMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const store = await getNotificationStore();

    // Find notifications matching this userId
    const userNotifs = store.notifications.filter((n) => n.userId === userId);
    const unreadCount = userNotifs.filter((n) => !n.isRead).length;

    return {
      notifications: userNotifs,
      unreadCount,
    };
  });

export const markNotificationAsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const store = await getNotificationStore();

    const target = store.notifications.find((n) => n.id === data.id && n.userId === userId);
    if (target) {
      target.isRead = true;
      await saveNotificationStore(store);
    }

    return { ok: true };
  });

export const markAllNotificationsAsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const store = await getNotificationStore();

    let updated = false;
    for (const n of store.notifications) {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        updated = true;
      }
    }

    if (updated) {
      await saveNotificationStore(store);
    }

    return { ok: true };
  });

export const adminSendBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    title: string;
    message: string;
    priority?: "normal" | "important" | "urgent" | undefined;
    target: "all" | string[]; // "all" or array of partner IDs
  }) => {
    if (!d.title?.trim() || !d.message?.trim()) throw new Error("العنوان ومحتوى الرسالة مطلوبان");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch partners to deliver to
    let query = supabaseAdmin.from("partners").select("id, user_id, promo_code");
    if (Array.isArray(data.target) && data.target.length > 0) {
      query = query.in("id", data.target);
    }
    const { data: partners, error } = await query;
    if (error) throw new Error(error.message);

    const store = await getNotificationStore();
    const now = new Date().toISOString();
    let sentCount = 0;

    for (const p of partners ?? []) {
      if (!p.user_id) continue;
      const notif: AppNotification = {
        id: `broadcast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: p.user_id,
        partnerId: p.id,
        title: data.priority === "urgent" ? `🚨 ${data.title}` : data.priority === "important" ? `⭐ ${data.title}` : data.title,
        message: data.message,
        type: "broadcast",
        link: "/partner",
        isRead: false,
        createdAt: now,
      };
      store.notifications.unshift(notif);
      sentCount++;
    }

    if (store.notifications.length > 500) {
      store.notifications = store.notifications.slice(0, 500);
    }

    await saveNotificationStore(store);

    return { ok: true, sentCount };
  });

// Server-side helper to trigger notifications from other functions
export async function triggerNotification(params: {
  userId: string;
  partnerId?: string | null | undefined;
  title: string;
  message: string;
  type: "lead" | "deposit" | "commission" | "withdrawal" | "broadcast" | "account";
  link?: string | null | undefined;
}) {
  try {
    await addNotification(params);
  } catch (err) {
    console.warn("[Notifications] triggerNotification failed:", err);
  }
}
