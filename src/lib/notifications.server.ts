import fs from "node:fs/promises";
import path from "node:path";

export interface AppNotification {
  id: string;
  userId: string;
  partnerId?: string | null | undefined;
  title: string;
  message: string;
  type: "lead" | "deposit" | "commission" | "withdrawal" | "broadcast" | "account";
  link?: string | null | undefined;
  isRead: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: AppNotification[];
}

const LOCAL_STORE_PATH = path.resolve(process.cwd(), "data", "notifications_storage.json");
const STORAGE_BUCKET = "documents";
const STORAGE_FILE_PATH = "_system/notifications_storage.json";

let memoryCache: NotificationStore | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1500;

async function readLocalFile(): Promise<NotificationStore | null> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.notifications)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeLocalFile(store: NotificationStore): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Notifications] Failed to write local fallback:", err);
  }
}

export async function getNotificationStore(): Promise<NotificationStore> {
  const now = Date.now();
  if (memoryCache && now - lastFetchTime < CACHE_TTL) {
    return memoryCache;
  }

  // 1. Supabase Storage
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_FILE_PATH);

    if (data && !error) {
      const text = await data.text();
      const parsed = JSON.parse(text) as NotificationStore;
      if (parsed && Array.isArray(parsed.notifications)) {
        memoryCache = parsed;
        lastFetchTime = now;
        await writeLocalFile(parsed);
        return memoryCache;
      }
    }
  } catch {
    // fallback to local file
  }

  // 2. Local file
  const local = await readLocalFile();
  if (local) {
    memoryCache = local;
    lastFetchTime = now;
    return memoryCache;
  }

  // 3. Default empty store
  memoryCache = { notifications: [] };
  lastFetchTime = now;
  return memoryCache;
}

export async function saveNotificationStore(store: NotificationStore): Promise<void> {
  memoryCache = store;
  lastFetchTime = Date.now();

  await writeLocalFile(store);

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const jsonStr = JSON.stringify(store);
    const blob = new Blob([jsonStr], { type: "application/json" });

    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_FILE_PATH, blob, {
        upsert: true,
        contentType: "application/json",
      });
  } catch (err) {
    console.error("[Notifications] Failed to upload to Supabase storage:", err);
  }
}

export async function addNotification(notif: Omit<AppNotification, "id" | "createdAt" | "isRead">): Promise<AppNotification> {
  const store = await getNotificationStore();
  const created: AppNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  store.notifications.unshift(created);
  // Keep last 500 notifications max
  if (store.notifications.length > 500) {
    store.notifications = store.notifications.slice(0, 500);
  }

  await saveNotificationStore(store);
  return created;
}
