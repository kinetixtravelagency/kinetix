import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  User,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CreditCard,
  Copy,
  Check,
  Flame,
} from "lucide-react";
import {
  getAdminChats,
  getAdminConversationMessages,
  sendAdminReply,
  setAdminChatStatus,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/chat.functions";

export function AdminChatTab() {
  const fetchChats = useServerFn(getAdminChats);
  const fetchMessages = useServerFn(getAdminConversationMessages);
  const sendReply = useServerFn(sendAdminReply);
  const setStatus = useServerFn(setAdminChatStatus);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "payments" | "resolved">("all");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Poll conversations list
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchChats();
        setConversations(res.conversations);
      } catch (err) {
        console.error("Error fetching admin chats:", err);
      }
    };
    load();
    const iv = setInterval(load, 3500);
    return () => clearInterval(iv);
  }, []);

  // Poll messages for selected conversation
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const loadMsgs = async () => {
      try {
        const res = await fetchMessages({ data: { conversationId: selectedId } });
        setMessages(res.messages);
      } catch (err) {
        console.error("Error fetching conversation messages:", err);
      }
    };

    loadMsgs();
    const iv = setInterval(loadMsgs, 2500);
    return () => clearInterval(iv);
  }, [selectedId]);

  // Scroll inner messages container only (does NOT scroll parent window/dashboard)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === selectedId);

  const handleSend = async (customText?: string) => {
    const text = (customText ?? replyText).trim();
    if (!selectedId || !text || busy) return;

    setBusy(true);
    try {
      const newMsg = await sendReply({
        data: {
          conversationId: selectedId,
          text,
          senderName: "Kinetix Admin",
        },
      });
      setMessages((prev) => [...prev, newMsg]);
      setReplyText("");
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!activeConv) return;
    const newStatus = activeConv.status === "active" ? "resolved" : "active";
    await setStatus({ data: { conversationId: activeConv.id, status: newStatus } });
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, status: newStatus } : c))
    );
  };

  const isPaymentConv = (c: ChatConversation) =>
    c.lastMessage.includes("طلب سداد") ||
    c.lastMessage.includes("💳") ||
    c.lastMessage.includes("طلب دفع");

  const paymentCount = conversations.filter(isPaymentConv).length;

  const filtered = conversations.filter((c) => {
    if (filter === "payments") {
      if (!isPaymentConv(c)) return false;
    } else if (filter !== "all" && c.status !== filter) {
      return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.clientName.toLowerCase().includes(q) ||
      (c.clientEmail && c.clientEmail.toLowerCase().includes(q)) ||
      (c.clientPhone && c.clientPhone.includes(q)) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const cannedTemplates = [
    "أهلاً بك! معك فريق كينتيكس للاستشارات، كيف يمكننا مساعدتك اليوم؟",
    "🩺 نوفر برامج توظيف معتمدة للأطباء والممرضين ومساعدي الأطباء والمهندسين في أيرلندا وإيطاليا ولوكسمبورغ مع تسهيلات في السداد والتقسيط.",
    "تم مراجعة استفسارك، يسعدنا تزويدك بكافة تفاصيل البرنامج وعقد العمل.",
    "يمكنك سداد الدفعة الأولى الآن وتقسيط الباقي حتى 6 أشهر بكل سهولة.",
    "يرجى تزويدنا برقم الهاتف / الواتساب للتواصل معك وتنسيق المقابلة.",
    "💳 بيانات إنستاباي: يرجى التحويل على معرف (kinetix@instapay) وإرسال صورة الإيصال هنا.",
    "💳 بيانات فودافون كاش: يرجى التحويل على رقم (01000000000) وإرسال سكرين شوت بالعملية.",
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid h-[700px] overflow-hidden rounded-3xl border border-border bg-card shadow-lg md:grid-cols-[340px_1fr]">
      {/* ── Left Column: Conversations List ── */}
      <div className="flex flex-col border-b border-border md:border-b-0 md:border-e md:border-border bg-secondary/20">
        {/* Search & Filters Header */}
        <div className="p-4 border-b border-border space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-beige" />
              Client Messages ({conversations.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              {conversations.filter((c) => c.status === "active").length} active
            </span>
          </div>

          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, message…"
              className="w-full rounded-full border border-input bg-background ps-9 pe-3 py-1.5 text-xs outline-none focus:border-beige"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1 font-medium capitalize transition-colors ${
                filter === "all" ? "bg-navy text-ivory" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`rounded-full px-3 py-1 font-medium capitalize transition-colors ${
                filter === "active" ? "bg-navy text-ivory" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("payments")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-bold transition-all ${
                filter === "payments"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              طلبات الدفع
              {paymentCount > 0 && (
                <span className="rounded-full bg-amber-600 px-1.5 py-0.2 text-[10px] text-white">
                  {paymentCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`rounded-full px-3 py-1 font-medium capitalize transition-colors ${
                filter === "resolved" ? "bg-navy text-ivory" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filtered.map((c) => {
            const isSelected = c.id === selectedId;
            const hasPayment = isPaymentConv(c);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full p-4 text-start transition-colors flex items-start gap-3 hover:bg-secondary/40 relative ${
                  isSelected ? "bg-secondary/60 ring-1 ring-inset ring-border" : ""
                } ${hasPayment ? "border-s-4 border-s-amber-500 bg-amber-500/[0.04]" : ""}`}
              >
                {/* Initials Avatar */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold ${
                  hasPayment ? "bg-amber-600 text-white shadow-xs" : "bg-navy text-ivory"
                }`}>
                  {hasPayment ? <CreditCard className="h-4 w-4" /> : c.clientName.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-xs truncate text-foreground flex items-center gap-1.5">
                      <span>{c.clientName}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(c.lastMessageAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {c.lastMessage}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {hasPayment && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          <CreditCard className="h-3 w-3 text-amber-600" />
                          طلب سداد 💳
                        </span>
                      )}
                      <span
                        className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${
                          c.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {c.unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {filter === "payments" ? "لا توجد طلبات سداد حالياً." : "No conversations found."}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: Chat History & Reply ── */}
      <div className="flex flex-col bg-background">
        {activeConv ? (
          <>
            {/* Conversation Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-semibold text-sm ${
                  isPaymentConv(activeConv) ? "bg-amber-600 text-white" : "bg-navy text-ivory"
                }`}>
                  {isPaymentConv(activeConv) ? <CreditCard className="h-5 w-5" /> : activeConv.clientName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      {activeConv.clientName}
                    </h3>
                    {isPaymentConv(activeConv) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        <CreditCard className="h-3 w-3 text-amber-600" />
                        طلب سداد معلق
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {activeConv.clientPhone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3 text-beige" />
                        {activeConv.clientPhone}
                      </span>
                    )}
                    {activeConv.clientEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-beige" />
                        {activeConv.clientEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {activeConv.clientPhone && (
                  <a
                    href={`https://wa.me/${activeConv.clientPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20 transition-colors"
                  >
                    WhatsApp
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <button
                  onClick={handleToggleStatus}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  {activeConv.status === "active" ? "Mark Resolved" : "Reopen Chat"}
                </button>
              </div>
            </div>

            {/* Messages Scroll Area — overscroll-contain prevents window scroll hijacking */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-secondary/15"
              style={{ overscrollBehavior: "contain" }}
            >
              {messages.map((m) => {
                const isAdmin = m.sender === "admin";
                const isPayment = m.text.includes("طلب سداد") || m.text.includes("💳 طلب سداد");

                if (isPayment) {
                  return (
                    <div key={m.id} className="flex justify-start my-2">
                      <div className="w-full max-w-[92%] sm:max-w-[80%] rounded-2xl border-2 border-amber-400 bg-card p-4 shadow-md text-foreground">
                        {/* Payment Card Header */}
                        <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/50 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                              <CreditCard className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-bold text-xs text-amber-800 dark:text-amber-300">
                                طلب سداد جديد معتمد عبر النظام
                              </p>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(m.createdAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(m.text, m.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                تم النسخ ✓
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                نسخ التفاصيل
                              </>
                            )}
                          </button>
                        </div>

                        {/* Payment Text Content */}
                        <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs leading-relaxed font-mono whitespace-pre-wrap border border-amber-200/60 dark:border-amber-900/40">
                          {m.text}
                        </div>

                        {/* Quick Action Buttons for Payment */}
                        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                          <span className="text-[10px] font-medium text-muted-foreground">إرسال بيانات التحويل:</span>
                          <button
                            type="button"
                            onClick={() => handleSend("💳 بيانات إنستاباي الخاصة بنا: kinetix@instapay - يرجى إرسال صورة إيصال التحويل فور إتمامه لتأكيد الحجز.")}
                            className="rounded-full bg-navy px-3 py-1 text-[10px] font-semibold text-ivory hover:opacity-90 transition-opacity"
                          >
                            إرسال إنستاباي
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend("💳 بيانات فودافون كاش: يرجى التحويل إلى 01000000000 وإرسال صورة رسالة التحويل هنا.")}
                            className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold text-foreground hover:border-beige transition-colors"
                          >
                            إرسال فودافون كاش
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend("💳 الحساب البنكي (CIB): EG0000000000000000000000 - باسم شركة Kinetix للاستشارات.")}
                            className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold text-foreground hover:border-beige transition-colors"
                          >
                            إرسال حساب بنكي
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex gap-2 ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-4 text-xs shadow-xs leading-relaxed ${
                        isAdmin
                          ? "rounded-ee-xs bg-navy text-ivory"
                          : "rounded-ss-xs border border-border bg-card text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className={`font-semibold text-[11px] ${isAdmin ? "text-beige" : "text-foreground"}`}>
                          {m.senderName}
                        </span>
                        <span className={`text-[10px] ${isAdmin ? "text-ivory/50" : "text-muted-foreground"}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No messages in this conversation.
                </div>
              )}
            </div>

            {/* Canned responses bar */}
            <div className="border-t border-border bg-card px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide text-xs">
              <span className="text-[10px] text-muted-foreground shrink-0">Quick reply:</span>
              {cannedTemplates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(tpl)}
                  className="shrink-0 rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] hover:border-beige hover:text-foreground transition-colors truncate max-w-[200px]"
                  title={tpl}
                >
                  {tpl}
                </button>
              ))}
            </div>

            {/* Reply Input Form */}
            <div className="border-t border-border bg-card p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type reply to client… (Press Enter to send)"
                  disabled={busy}
                  className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-xs outline-none focus:border-beige disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={busy || !replyText.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-ivory hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"
                >
                  <Send className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-muted-foreground">
              <MessageSquare className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              Select a client conversation
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Choose a message thread from the left sidebar to read questions and chat directly with clients in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
