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
  Flag,
  Tag,
  Trash2,
  Bookmark,
  Folder,
  AlertTriangle,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import {
  getAdminChats,
  getAdminConversationMessages,
  sendAdminReply,
  setAdminChatStatus,
  adminSetConversationFlag,
  adminSetConversationGroup,
  adminDeleteConversation,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/chat.functions";

const PRESET_GROUPS = [
  "Important Customers",
  "Follow-up Needed",
  "Travel Applications",
  "Payment-related",
  "Resolved Cases",
];

const FLAGS: { id: ChatConversation["flag"]; label: string; color: string; badgeCls: string }[] = [
  { id: "urgent", label: "Urgent", color: "text-red-500", badgeCls: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-300" },
  { id: "important", label: "Important", color: "text-purple-500", badgeCls: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300" },
  { id: "follow_up", label: "Follow-up", color: "text-amber-500", badgeCls: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300" },
  { id: "resolved", label: "Resolved", color: "text-emerald-500", badgeCls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300" },
];

export function AdminChatTab() {
  const fetchChats = useServerFn(getAdminChats);
  const fetchMessages = useServerFn(getAdminConversationMessages);
  const sendReply = useServerFn(sendAdminReply);
  const setStatus = useServerFn(setAdminChatStatus);
  const setFlag = useServerFn(adminSetConversationFlag);
  const setGroup = useServerFn(adminSetConversationGroup);
  const deleteConv = useServerFn(adminDeleteConversation);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "payments" | "resolved">("all");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");
  const [selectedFlagFilter, setSelectedFlagFilter] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group modal & delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showFlagPicker, setShowFlagPicker] = useState(false);
  const [customGroupInput, setCustomGroupInput] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Poll conversations list
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchChats();
        if (res && Array.isArray(res.conversations)) {
          setConversations(res.conversations);
        }
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
        if (res && Array.isArray(res.messages)) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error("Error fetching conversation messages:", err);
      }
    };

    loadMsgs();
    const iv = setInterval(loadMsgs, 2500);
    return () => clearInterval(iv);
  }, [selectedId]);

  // Scroll inner messages container only
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
      console.error("Failed to send reply:", err);
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

  const handleSetFlag = async (flagId: ChatConversation["flag"]) => {
    if (!activeConv) return;
    await setFlag({ data: { conversationId: activeConv.id, flag: flagId ?? null } });
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, flag: flagId } : c))
    );
    setShowFlagPicker(false);
  };

  const handleSetGroup = async (groupName: string | null) => {
    if (!activeConv) return;
    await setGroup({ data: { conversationId: activeConv.id, groupName } });
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, groupName } : c))
    );
    setShowGroupPicker(false);
    setCustomGroupInput("");
  };

  const handleDeleteConversation = async () => {
    if (!activeConv) return;
    await deleteConv({ data: { conversationId: activeConv.id } });
    setConversations((prev) => prev.filter((c) => c.id !== activeConv.id));
    setSelectedId(null);
    setShowDeleteModal(false);
  };

  const isPaymentConv = (c: ChatConversation) =>
    c.lastMessage.includes("طلب سداد") ||
    c.lastMessage.includes("💳") ||
    c.lastMessage.includes("طلب دفع");

  const paymentCount = conversations.filter(isPaymentConv).length;

  const existingGroups = Array.from(
    new Set([...PRESET_GROUPS, ...conversations.map((c) => c.groupName).filter(Boolean)])
  ) as string[];

  const filtered = conversations.filter((c) => {
    if (filter === "payments") {
      if (!isPaymentConv(c)) return false;
    } else if (filter !== "all" && c.status !== filter) {
      return false;
    }

    if (selectedGroupFilter !== "all" && c.groupName !== selectedGroupFilter) {
      return false;
    }

    if (selectedFlagFilter !== "all" && c.flag !== selectedFlagFilter) {
      return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.clientName.toLowerCase().includes(q) ||
      (c.clientEmail && c.clientEmail.toLowerCase().includes(q)) ||
      (c.clientPhone && c.clientPhone.includes(q)) ||
      c.lastMessage.toLowerCase().includes(q) ||
      (c.groupName && c.groupName.toLowerCase().includes(q))
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

  return (
    <div className="grid h-[740px] overflow-hidden rounded-3xl border border-border bg-card shadow-lg md:grid-cols-[360px_1fr]">
      {/* ── Left Column: Conversations List ── */}
      <div className="flex flex-col border-b border-border md:border-b-0 md:border-e md:border-border bg-secondary/20">
        {/* Search & Filters Header */}
        <div className="p-4 border-b border-border space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-beige" />
              Live Chat ({conversations.length})
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
              placeholder="Search conversations, groups, phones…"
              className="w-full rounded-full border border-input bg-background ps-9 pe-3 py-1.5 text-xs outline-none focus:border-beige"
            />
          </div>

          {/* Quick status tabs */}
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

          {/* Group and Flag Filters */}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            {/* Group dropdown filter */}
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="flex-1 rounded-xl border border-input bg-background px-2.5 py-1 text-[11px] outline-none text-muted-foreground focus:border-beige"
            >
              <option value="all">📁 All Groups</option>
              {existingGroups.map((g) => (
                <option key={g} value={g}>
                  📁 {g}
                </option>
              ))}
            </select>

            {/* Flag filter */}
            <select
              value={selectedFlagFilter}
              onChange={(e) => setSelectedFlagFilter(e.target.value)}
              className="rounded-xl border border-input bg-background px-2.5 py-1 text-[11px] outline-none text-muted-foreground focus:border-beige"
            >
              <option value="all">🚩 All Flags</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="important">🟣 Important</option>
              <option value="follow_up">🟡 Follow-up</option>
              <option value="resolved">🟢 Resolved</option>
            </select>
          </div>
        </div>

        {/* Conversations List Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filtered.map((c) => {
            const isSelected = c.id === selectedId;
            const hasPayment = isPaymentConv(c);
            const flagObj = FLAGS.find((f) => f.id === c.flag);

            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full p-3.5 text-start transition-colors flex items-start gap-3 ${
                  isSelected
                    ? "bg-beige/15 dark:bg-beige/25 border-s-4 border-beige"
                    : "hover:bg-secondary/40"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-xs ${
                    hasPayment
                      ? "bg-amber-600 text-white"
                      : isSelected
                      ? "bg-navy text-ivory"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {hasPayment ? <CreditCard className="h-4 w-4" /> : c.clientName.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate font-semibold text-xs text-foreground">
                      {c.clientName}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(c.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {c.lastMessage}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {flagObj && (
                        <span className={`text-[10px] rounded-full px-2 py-0.2 border font-bold ${flagObj.badgeCls}`}>
                          {flagObj.label}
                        </span>
                      )}

                      {c.groupName && (
                        <span className="text-[10px] rounded-full px-2 py-0.2 bg-secondary text-muted-foreground border border-border">
                          📁 {c.groupName}
                        </span>
                      )}

                      {hasPayment && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          <CreditCard className="h-2.5 w-2.5 text-amber-600" />
                          طلب سداد
                        </span>
                      )}
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="rounded-full bg-red-600 px-2 py-0.2 text-[10px] font-bold text-white">
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
              No conversations found matching filters.
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: Chat History & Actions ── */}
      <div className="flex flex-col bg-background">
        {activeConv ? (
          <>
            {/* Conversation Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-semibold text-sm ${
                    isPaymentConv(activeConv) ? "bg-amber-600 text-white" : "bg-navy text-ivory"
                  }`}
                >
                  {isPaymentConv(activeConv) ? <CreditCard className="h-5 w-5" /> : activeConv.clientName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      {activeConv.clientName}
                    </h3>

                    {activeConv.groupName && (
                      <span className="text-[10px] rounded-full px-2 py-0.5 bg-secondary border border-border text-muted-foreground">
                        📁 {activeConv.groupName}
                      </span>
                    )}

                    {FLAGS.find((f) => f.id === activeConv.flag) && (
                      <span className={`text-[10px] rounded-full px-2 py-0.5 border font-bold ${FLAGS.find((f) => f.id === activeConv.flag)!.badgeCls}`}>
                        {FLAGS.find((f) => f.id === activeConv.flag)!.label}
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

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2">
                {/* Flag Picker Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFlagPicker(!showFlagPicker)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:border-beige transition-colors"
                  >
                    <Flag className="h-3 w-3 text-amber-500" />
                    <span>Flag</span>
                  </button>

                  {showFlagPicker && (
                    <div className="absolute end-0 mt-2 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 space-y-1">
                      {FLAGS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => handleSetFlag(f.id)}
                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-start hover:bg-secondary transition-colors"
                        >
                          <span className={`h-2 w-2 rounded-full ${f.badgeCls}`} />
                          <span>{f.label}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => handleSetFlag(null)}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors border-t border-border mt-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Clear Flag</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Group Assignment Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowGroupPicker(!showGroupPicker)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:border-beige transition-colors"
                  >
                    <Folder className="h-3 w-3 text-blue-500" />
                    <span>Group</span>
                  </button>

                  {showGroupPicker && (
                    <div className="absolute end-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 space-y-1">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                        Assign to Group
                      </p>
                      {existingGroups.map((grp) => (
                        <button
                          key={grp}
                          onClick={() => handleSetGroup(grp)}
                          className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-start hover:bg-secondary transition-colors"
                        >
                          <Folder className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{grp}</span>
                        </button>
                      ))}

                      {/* Custom group input */}
                      <div className="pt-1 border-t border-border mt-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={customGroupInput}
                            onChange={(e) => setCustomGroupInput(e.target.value)}
                            placeholder="New group name…"
                            className="w-full rounded-lg border border-input bg-background px-2 py-1 text-[11px] outline-none"
                          />
                          <button
                            disabled={!customGroupInput.trim()}
                            onClick={() => handleSetGroup(customGroupInput.trim())}
                            className="p-1 rounded-lg bg-navy text-ivory disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {activeConv.groupName && (
                        <button
                          onClick={() => handleSetGroup(null)}
                          className="flex w-full items-center gap-1 text-[11px] text-red-500 hover:bg-secondary p-1 rounded-lg mt-1"
                        >
                          <X className="h-3 w-3" /> Remove from Group
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* WhatsApp */}
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

                {/* Mark Resolved */}
                <button
                  onClick={handleToggleStatus}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  {activeConv.status === "active" ? "Mark Resolved" : "Reopen"}
                </button>

                {/* Delete Conversation */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Delete Conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
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
                        </div>

                        <div className="text-xs whitespace-pre-line leading-relaxed text-foreground font-mono bg-secondary/40 p-3 rounded-xl border border-border">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isAdmin
                          ? "bg-navy text-ivory rounded-br-xs"
                          : "bg-card border border-border text-foreground rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-muted-foreground flex items-center gap-1">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isAdmin && <CheckCheck className="h-3 w-3 text-beige inline" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Templates Bar */}
            <div className="border-t border-border bg-card p-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none">
              <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap ps-2">
                Quick:
              </span>
              {cannedTemplates.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(t)}
                  className="rounded-full bg-secondary hover:bg-beige hover:text-navy px-3 py-1 text-[11px] whitespace-nowrap text-foreground transition-all"
                >
                  {t.slice(0, 32)}…
                </button>
              ))}
            </div>

            {/* Reply Input Box */}
            <div className="p-3 border-t border-border bg-card flex items-center gap-2">
              <textarea
                rows={1}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your response to client… (Press Enter to send)"
                className="flex-1 rounded-2xl border border-input bg-background px-4 py-2 text-xs outline-none focus:border-beige resize-none leading-relaxed"
              />
              <button
                disabled={!replyText.trim() || busy}
                onClick={() => handleSend()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-navy text-ivory hover:bg-navy/90 disabled:opacity-40 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
            <p className="font-semibold text-sm text-foreground">Select a conversation to reply</p>
            <p className="text-xs opacity-70 mt-1 max-w-sm">
              Manage client inquiries, tag VIP clients, assign to groups, or review verified payment receipts.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && activeConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Delete Conversation</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete the chat history with <strong>{activeConv.clientName}</strong>? The conversation will be safely removed from the active support dashboard.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full px-4 py-2 text-xs font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
