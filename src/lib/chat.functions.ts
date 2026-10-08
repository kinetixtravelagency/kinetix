import { createServerFn } from "@tanstack/react-start";
import fs from "node:fs";
import path from "node:path";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

const DATA_FILE = path.resolve(process.cwd(), "data", "chat_storage.json");

function getStore(): ChatStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading chat storage:", err);
  }
  return { conversations: {}, messages: {} };
}

function saveStore(store: ChatStore) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving chat storage:", err);
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
    const store = getStore();
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
      saveStore(store);
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

    const store = getStore();
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
    saveStore(store);

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
    const store = getStore();
    const list = Object.values(store.conversations).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
    return {
      conversations: list,
      totalUnread: list.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    };
  });

export const getAdminConversationMessages = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string }) => d)
  .handler(async ({ data }) => {
    const store = getStore();
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
      saveStore(store);
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

    const store = getStore();
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
    saveStore(store);

    return newMsg;
  });

export const setAdminChatStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { conversationId: string; status: "active" | "resolved" }) => d)
  .handler(async ({ data }) => {
    const store = getStore();
    const conv = store.conversations[data.conversationId];
    if (!conv) throw new Error("Conversation not found");
    conv.status = data.status;
    conv.updatedAt = new Date().toISOString();
    saveStore(store);
    return { ok: true, status: conv.status };
  });
