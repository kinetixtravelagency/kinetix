import fs from "node:fs/promises";
import path from "node:path";

export type WithdrawalStatus = "pending" | "approved" | "processing" | "completed" | "rejected";

export interface WithdrawalRequest {
  id: string;
  partnerId: string;
  partnerCode: string;
  partnerName: string;
  amount: number;
  payoutMethod: string;
  payoutDetails: string;
  notes?: string | null | undefined;
  status: WithdrawalStatus;
  adminNotes?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

interface WithdrawalsStore {
  requests: WithdrawalRequest[];
}

const LOCAL_STORE_PATH = path.resolve(process.cwd(), "data", "withdrawals_storage.json");
const STORAGE_BUCKET = "documents";
const STORAGE_FILE_PATH = "_system/withdrawals_storage.json";

let memoryCache: WithdrawalsStore | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1500;

async function readLocalFile(): Promise<WithdrawalsStore | null> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.requests)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeLocalFile(store: WithdrawalsStore): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Withdrawals] Failed to write local fallback:", err);
  }
}

export async function getWithdrawalsStore(): Promise<WithdrawalsStore> {
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
      const parsed = JSON.parse(text) as WithdrawalsStore;
      if (parsed && Array.isArray(parsed.requests)) {
        memoryCache = parsed;
        lastFetchTime = now;
        await writeLocalFile(parsed);
        return memoryCache;
      }
    }
  } catch {
    // fallback
  }

  // 2. Local file
  const local = await readLocalFile();
  if (local) {
    memoryCache = local;
    lastFetchTime = now;
    return memoryCache;
  }

  // 3. Default empty
  memoryCache = { requests: [] };
  lastFetchTime = now;
  return memoryCache;
}

export async function saveWithdrawalsStore(store: WithdrawalsStore): Promise<void> {
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
    console.error("[Withdrawals] Failed to upload to Supabase storage:", err);
  }
}

export async function addWithdrawalRequest(req: Omit<WithdrawalRequest, "id" | "createdAt" | "updatedAt">): Promise<WithdrawalRequest> {
  const store = await getWithdrawalsStore();
  const created: WithdrawalRequest = {
    ...req,
    id: `wth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.requests.unshift(created);
  await saveWithdrawalsStore(store);
  return created;
}

export async function updateWithdrawalStatus(
  id: string,
  status: WithdrawalStatus,
  adminNotes?: string | null | undefined
): Promise<WithdrawalRequest | null> {
  const store = await getWithdrawalsStore();
  const req = store.requests.find((r) => r.id === id);
  if (!req) return null;

  req.status = status;
  if (adminNotes !== undefined) req.adminNotes = adminNotes;
  req.updatedAt = new Date().toISOString();

  await saveWithdrawalsStore(store);
  return req;
}
