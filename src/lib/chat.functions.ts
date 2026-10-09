import { createServerFn } from "@tanstack/react-start";

export type MessageSender = "client" | "admin";

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  text: string;
  isRead: boolean;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  userId?: string | null | undefined;
  visitorId?: string | null | undefined;
  clientName: string;
  clientEmail?: string | null | undefined;
  clientPhone?: string | null | undefined;
  status: "active" | "resolved";
  flag?: "important" | "urgent" | "follow_up" | "resolved" | null | undefined;
  groupName?: string | null | undefined;
  isDeleted?: boolean | undefined;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number; // unread by admin
  unreadClientCount: number; // unread by client
  createdAt: string;
  updatedAt: string;
};

type ChatStore = {
  conversations: Record<string, ChatConversation>;
  messages: Record<string, ChatMessage[]>;
};

let memoryCache: ChatStore | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1500; // 1.5s cache for responsive polling without spamming storage

async function getStore(): Promise<ChatStore> {
  const now = Date.now();
  if (memoryCache && now - lastFetchTime < CACHE_TTL) {
    return memoryCache;
  }

  // 1. Primary: Cloud Supabase Storage (Persistent across all Vercel Lambdas)
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from("documents")
      .download("_system/chat_storage.json");

    if (data && !error) {
      const text = await data.text();
      const parsed = JSON.parse(text) as ChatStore;
      if (parsed && typeof parsed === "object" && parsed.conversations) {
        memoryCache = parsed;
        lastFetchTime = now;
        return memoryCache;
      }
    }
  } catch (err) {
    console.error("[ChatStore] Supabase storage download error:", err);
  }

  // 2. Fallback: Local filesystem (for offline / local dev)
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dataFile = path.resolve(process.cwd(), "data", "chat_storage.json");
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, "utf-8");
      memoryCache = JSON.parse(raw) as ChatStore;
      lastFetchTime = now;
      return memoryCache;
    }
  } catch {
    // Expected on Vercel read-only filesystem
  }

  if (!memoryCache) {
    memoryCache = { conversations: {}, messages: {} };
  }
  return memoryCache;
}

async function saveStore(store: ChatStore): Promise<void> {
  memoryCache = store;
  lastFetchTime = Date.now();

  const payload = JSON.stringify(store, null, 2);

  // 1. Primary: Cloud Supabase Storage (Persistent on Vercel)
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("documents")
      .upload("_system/chat_storage.json", Buffer.from(payload), {
        upsert: true,
        contentType: "application/json",
      });
    if (error) {
      console.error("[ChatStore] Supabase storage upload error:", error);
    }
  } catch (err) {
    console.error("[ChatStore] Supabase storage save failure:", err);
  }

  // 2. Best-effort local file write
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dataFile = path.resolve(process.cwd(), "data", "chat_storage.json");
    const dir = path.dirname(dataFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dataFile, payload, "utf-8");
  } catch {
    // Expected on Vercel serverless read-only filesystem
  }
}

// ─────────────────────────────────────────────────────────────
// 1. Client / Visitor Chat APIs
// ─────────────────────────────────────────────────────────────

export const getClientChat = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { conversationId?: string | undefined; visitorId?: string | undefined; userId?: string | undefined }) => d
  )
  .handler(async ({ data }) => {
    const store = await getStore();
    let conv: ChatConversation | undefined;

    if (data.conversationId && store.conversations[data.conversationId]) {
      conv = store.conversations[data.conversationId];
    } else if (data.userId) {
      conv = Object.values(store.conversations).find((c) => c.userId === data.userId);
    } else if (data.visitorId) {
      conv = Object.values(store.conversations).find((c) => c.visitorId === data.visitorId);
    }

    if (!conv) {
      return { conversation: null, messages: [] };
    }

    // Mark admin messages as read by client
    const msgs = store.messages[conv.id] ?? [];
    let updated = false;
    for (const m of msgs) {
      if (m.sender === "admin" && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
    }
    if (updated) {
      conv.unreadClientCount = 0;
      await saveStore(store);
    }

    return {
      conversation: conv,
      messages: msgs,
    };
  });

export const sendClientMessage = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      conversationId?: string | undefined;
      visitorId?: string | undefined;
      userId?: string | undefined;
      clientName?: string | undefined;
      clientEmail?: string | undefined;
      clientPhone?: string | undefined;
      text: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const text = (data.text || "").trim();
    if (!text) throw new Error("Message text is required");

    const store = await getStore();
    let conv: ChatConversation | undefined;

    if (data.conversationId && store.conversations[data.conversationId]) {
      conv = store.conversations[data.conversationId];
    } else if (data.userId) {
      conv = Object.values(store.conversations).find((c) => c.userId === data.userId);
    } else if (data.visitorId) {
      conv = Object.values(store.conversations).find((c) => c.visitorId === data.visitorId);
    }

    const now = new Date().toISOString();

    if (!conv) {
      const convId = "conv_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      conv = {
        id: convId,
        userId: data.userId ?? null,
        visitorId: data.visitorId ?? null,
        clientName: (data.clientName || "").trim() || "Visitor / زائر",
        clientEmail: (data.clientEmail || "").trim() || null,
        clientPhone: (data.clientPhone || "").trim() || null,
        status: "active",
        lastMessage: text,
        lastMessageAt: now,
        unreadCount: 1,
        unreadClientCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      store.conversations[conv.id] = conv;
      store.messages[conv.id] = [];
    } else {
      conv.lastMessage = text;
      conv.lastMessageAt = now;
      conv.status = "active";
      conv.unreadCount = (conv.unreadCount || 0) + 1;
      conv.updatedAt = now;
      if (data.clientName && !conv.clientName) conv.clientName = data.clientName;
      if (data.clientEmail) conv.clientEmail = data.clientEmail;
      if (data.clientPhone) conv.clientPhone = data.clientPhone;
    }

    const newMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
      conversationId: conv.id,
      sender: "client",
      senderName: conv.clientName || "Client",
      text,
      isRead: false,
      createdAt: now,
    };

    const clientMsgList = store.messages[conv.id] ?? [];
    clientMsgList.push(newMsg);
    store.messages[conv.id] = clientMsgList;
    await saveStore(store);

    return {
      conversationId: conv.id,
      message: newMsg,
    };
  });

// ─────────────────────────────────────────────────────────────
// 2. Admin Chat APIs
// ─────────────────────────────────────────────────────────────

export const getAdminChats = createServerFn({ method: "GET" })
  .handler(async () => {
    const store = await getStore();
    const list = Object.values(store.conversations)
      .filter((c) => !c.isDeleted)
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return {
      conversations: list,
      totalUnread: list.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    };
  });

export const getAdminConversationMessages = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string }) => d)
  .handler(async ({ data }) => {
    const store = await getStore();
    const conv = store.conversations[data.conversationId];
    if (!conv) throw new Error("Conversation not found");

    const msgs = store.messages[data.conversationId] ?? [];
    let updated = false;
    for (const m of msgs) {
      if (m.sender === "client" && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
    }
    if (updated || conv.unreadCount > 0) {
      conv.unreadCount = 0;
      await saveStore(store);
    }

    return {
      conversation: conv,
      messages: msgs,
    };
  });

export const sendAdminReply = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string; text: string; senderName?: string | undefined }) => d)
  .handler(async ({ data }) => {
    const text = (data.text || "").trim();
    if (!text) throw new Error("Reply text is required");

    const store = await getStore();
    const conv = store.conversations[data.conversationId];
    if (!conv) throw new Error("Conversation not found");

    const now = new Date().toISOString();
    conv.lastMessage = text;
    conv.lastMessageAt = now;
    conv.updatedAt = now;
    conv.unreadClientCount = (conv.unreadClientCount || 0) + 1;

    const newMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
      conversationId: conv.id,
      sender: "admin",
      senderName: data.senderName || "Kinetix Support",
      text,
      isRead: false,
      createdAt: now,
    };

    const adminMsgList = store.messages[conv.id] ?? [];
    adminMsgList.push(newMsg);
    store.messages[conv.id] = adminMsgList;
    await saveStore(store);

    return newMsg;
  });

export const setAdminChatStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string; status: "active" | "resolved" }) => d)
  .handler(async ({ data }) => {
    const store = await getStore();
    const conv = store.conversations[data.conversationId];
    if (!conv) throw new Error("Conversation not found");
    conv.status = data.status;
    conv.updatedAt = new Date().toISOString();
    await saveStore(store);
    return { ok: true, status: conv.status };
  });

export const adminSetConversationFlag = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string; flag: "important" | "urgent" | "follow_up" | "resolved" | null }) => d)
  .handler(async ({ data }) => {
    const store = await getStore();
    const conv = store.conversations[data.conversationId];
    if (!conv) throw new Error("Conversation not found");
    conv.flag = data.flag;
    conv.updatedAt = new Date().toISOString();
    await saveStore(store);
    return { ok: true, flag: conv.flag };
  });

export const adminSetConversationGroup = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string; groupName: string | null }) => d)
  .handler(async ({ data }) => {
    const store = await getStore();
    const conv = store.conversations[data.conversationId];
    if (!conv) throw new Error("Conversation not found");
    conv.groupName = data.groupName?.trim() || null;
    conv.updatedAt = new Date().toISOString();
    await saveStore(store);
    return { ok: true, groupName: conv.groupName };
  });

export const adminDeleteConversation = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string }) => d)
  .handler(async ({ data }) => {
    const store = await getStore();
    const conv = store.conversations[data.conversationId];
    if (!conv) throw new Error("Conversation not found");
    conv.isDeleted = true;
    conv.updatedAt = new Date().toISOString();
    await saveStore(store);
    return { ok: true, conversationId: data.conversationId };
  });

