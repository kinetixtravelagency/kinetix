import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  User,
  CheckCheck,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { getClientChat, sendClientMessage, type ChatMessage } from "@/lib/chat.functions";
import { useSession } from "@/lib/useSession";
import { useLang } from "@/lib/i18n";
import logoImg from "@/assets/pics/logo.png";

const VISITOR_KEY = "kinetix_chat_visitor_id";
const CONV_KEY = "kinetix_chat_conv_id";
const CLIENT_NAME_KEY = "kinetix_chat_client_name";
const CLIENT_PHONE_KEY = "kinetix_chat_client_phone";
const INFO_DONE_KEY = "kinetix_chat_info_done";

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  // Egyptian: 11 digits starting with 01
  if (/^01[0-9]{9}$/.test(digits)) return true;
  // International with +: 8-15 digits
  if (phone.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) return true;
  return false;
}

export function ChatWidget() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(0);

  // Visitor identity
  const [visitorId, setVisitorId] = useState<string>("");
  const [convId, setConvId] = useState<string>("");

  // Info collection (step before chatting for guests)
  const [infoStep, setInfoStep] = useState<"collecting" | "done">("done");
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");

  const fetchChat = useServerFn(getClientChat);
  const sendMsg = useServerFn(sendClientMessage);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  const resolvedName = () =>
    user?.user_metadata?.["full_name"] ||
    localStorage.getItem(CLIENT_NAME_KEY) ||
    nameInput.trim() ||
    (ar ? "زائر" : "Visitor");

  const resolvedPhone = () =>
    user?.user_metadata?.["phone"] ||
    localStorage.getItem(CLIENT_PHONE_KEY) ||
    phoneInput.trim() ||
    undefined;

  // Initialize visitor ID & check if info was already collected
  useEffect(() => {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = "v_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
      localStorage.setItem(VISITOR_KEY, vid);
    }
    setVisitorId(vid);

    const savedConv = localStorage.getItem(CONV_KEY) || "";
    if (savedConv) setConvId(savedConv);

    // If user is logged in or already gave info → skip collection
    if (user || localStorage.getItem(INFO_DONE_KEY) === "yes") {
      setInfoStep("done");
    } else {
      setInfoStep("collecting");
    }
  }, [user]);

  // Listen for open-kinetix-chat event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-kinetix-chat", handleOpen);
    return () => window.removeEventListener("open-kinetix-chat", handleOpen);
  }, []);

  // Poll for messages
  useEffect(() => {
    if (!visitorId && !user?.id) return;

    const poll = async () => {
      try {
        const res = await fetchChat({
          data: {
            conversationId: convId || undefined,
            visitorId: !user?.id ? visitorId : undefined,
            userId: user?.id || undefined,
          },
        });

        if (res.conversation) {
          if (res.conversation.id !== convId) {
            setConvId(res.conversation.id);
            localStorage.setItem(CONV_KEY, res.conversation.id);
          }
          setMessages(res.messages);

          const newUnread = res.conversation.unreadClientCount ?? 0;
          if (!isOpen && newUnread > prevUnreadRef.current) {
            setUnread(newUnread);
            // Browser notification if supported and permission granted
            if ("Notification" in window && Notification.permission === "granted") {
              const lastMsg = res.messages[res.messages.length - 1];
              new Notification(ar ? "رسالة جديدة من كينتيكس 💬" : "New message from Kinetix 💬", {
                body: lastMsg?.text?.slice(0, 80) ?? "",
                icon: "/logo.png",
              });
            }
          }
          prevUnreadRef.current = newUnread;
        }
      } catch {
        // silent polling error
      }
    };

    poll();
    const interval = setInterval(poll, isOpen ? 3000 : 10000);
    return () => clearInterval(interval);
  }, [isOpen, convId, visitorId, user?.id]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      prevUnreadRef.current = 0;
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      // Request notification permission when chat first opens
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [isOpen, messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend || busy) return;

    setBusy(true);
    try {
      const name = resolvedName();
      const phone = resolvedPhone();
      const email = user?.email || undefined;

      const res = await sendMsg({
        data: {
          conversationId: convId || undefined,
          visitorId: !user?.id ? visitorId : undefined,
          userId: user?.id || undefined,
          clientName: name,
          clientPhone: phone,
          clientEmail: email,
          text: textToSend,
        },
      });

      if (res.conversationId && res.conversationId !== convId) {
        setConvId(res.conversationId);
        localStorage.setItem(CONV_KEY, res.conversationId);
      }

      setMessages((prev) => [...prev, res.message]);
      setInputText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setNameError(ar ? "الرجاء إدخال اسمك" : "Please enter your name");
      valid = false;
    } else {
      setNameError("");
    }
    if (!validatePhone(phoneInput)) {
      setPhoneError(
        ar
          ? "رقم غير صحيح — أدخل 11 رقم (مثال: 01012345678)"
          : "Invalid number — enter 11 digits (e.g. 01012345678)"
      );
      valid = false;
    } else {
      setPhoneError("");
    }
    if (!valid) return;

    localStorage.setItem(CLIENT_NAME_KEY, nameInput.trim());
    localStorage.setItem(CLIENT_PHONE_KEY, phoneInput.trim());
    localStorage.setItem(INFO_DONE_KEY, "yes");
    setInfoStep("done");
  };

  const quickReplies = ar
    ? [
        { icon: "🌍", text: "استفسار عن وظائف بلغاريا وأوروبا" },
        { icon: "💳", text: "تفاصيل نظام الدفع والتقسيط" },
        { icon: "📄", text: "الأوراق المطلوبة لتجهيز السيرة الذاتية" },
        { icon: "⏱️", text: "كم الوقت اللازم للسفر بعد التقديم؟" },
        { icon: "📞", text: "أريد التحدث مع مستشار مباشرةً" },
      ]
    : [
        { icon: "🌍", text: "Inquire about European work programs" },
        { icon: "💳", text: "Payment & installment plans details" },
        { icon: "📄", text: "Documents required to apply" },
        { icon: "⏱️", text: "How long until travel after applying?" },
        { icon: "📞", text: "I want to speak with an advisor" },
      ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 end-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            id="kinetix-live-chat-btn"
            className="group relative flex items-center gap-2.5 rounded-full bg-navy px-4 py-3.5 text-ivory shadow-2xl ring-2 ring-beige/40 transition-all hover:scale-105 hover:bg-navy-soft active:scale-95"
            aria-label="Open Live Chat"
          >
            <div className="relative">
              <MessageSquare className="h-5 w-5 text-beige" strokeWidth={2} />
              <span className="absolute -top-1 -end-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>

            <span className="font-medium text-xs sm:text-sm pe-1">
              {ar ? "تحدث مع مستشارنا" : "Chat with Advisor"}
            </span>

            {unread > 0 && (
              <span className="absolute -top-1.5 -start-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow animate-bounce">
                {unread}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 end-4 z-50 flex h-[580px] max-h-[90vh] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-navy px-5 py-4 text-ivory shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-beige/40 bg-white p-1 shadow-sm">
                <img src={logoImg} alt="Kinetix" className="h-full w-full object-contain" />
                <span className="absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight text-ivory">
                  {ar ? "فريق كينتيكس للاستشارات" : "Kinetix Support & Advisory"}
                </h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {ar ? "متاح الآن للرد المباشر" : "Online · Active now"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-ivory/70 hover:bg-ivory/10 hover:text-ivory transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {/* ── INFO COLLECTION SCREEN (guests who haven't provided info yet) ── */}
          {infoStep === "collecting" && !user ? (
            <div className="flex flex-1 flex-col overflow-y-auto">
              {/* Intro message */}
              <div className="bg-secondary/20 p-5 space-y-4">
                <div className="flex gap-2.5">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-beige text-xs font-bold">K</div>
                  <div className="max-w-[85%] rounded-2xl rounded-ss-xs border border-border bg-card p-3.5 text-xs text-foreground shadow-xs">
                    <p className="font-semibold text-navy mb-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-beige" />
                      {ar ? "مرحباً بك في كينتيكس!" : "Welcome to Kinetix!"}
                    </p>
                    <p className="leading-relaxed text-muted-foreground">
                      {ar
                        ? "قبل أن نبدأ، نحتاج اسمك ورقمك حتى يتمكن فريقنا من متابعتك حتى لو انقطع الاتصال."
                        : "Before we start, please share your name and phone so our team can follow up even if the connection drops."}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4 p-5 bg-card flex-1">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                    <User className="h-3.5 w-3.5 text-beige" />
                    {ar ? "الاسم الكريم *" : "Your Name *"}
                  </label>
                  <input
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); setNameError(""); }}
                    placeholder={ar ? "مثال: محمد أحمد" : "e.g. Ahmed Mohamed"}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-beige transition-colors"
                    maxLength={60}
                  />
                  {nameError && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
                      <AlertCircle className="h-3 w-3" /> {nameError}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                    <Phone className="h-3.5 w-3.5 text-beige" />
                    {ar ? "رقم الهاتف / واتساب * (11 رقم)" : "Phone / WhatsApp * (11 digits)"}
                  </label>
                  <input
                    value={phoneInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d+]/g, "");
                      if (val.length <= 15) setPhoneInput(val);
                      setPhoneError("");
                    }}
                    placeholder="01012345678"
                    type="tel"
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-beige transition-colors font-mono tracking-wider"
                    maxLength={15}
                  />
                  {phoneError && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
                      <AlertCircle className="h-3 w-3" /> {phoneError}
                    </p>
                  )}
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {ar ? "مثال: 01012345678 (للأرقام المصرية)" : "Example: 01012345678 (Egyptian numbers)"}
                  </p>
                </div>

                <button
                  type="submit"
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3.5 text-sm font-semibold text-ivory hover:opacity-90 transition-opacity active:scale-95"
                >
                  {ar ? "ابدأ المحادثة" : "Start Chat"}
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* ── CHAT MESSAGES AREA ── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-secondary/30">
                {/* Welcome Card */}
                <div className="flex gap-2.5">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-beige text-xs font-bold">K</div>
                  <div className="max-w-[82%] rounded-2xl rounded-ss-xs border border-border bg-card p-3.5 text-xs shadow-xs text-foreground">
                    <p className="font-semibold text-navy mb-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-beige" />
                      {ar ? "مرحباً بك في كينتيكس!" : "Welcome to Kinetix!"}
                    </p>
                    <p className="leading-relaxed text-muted-foreground">
                      {ar
                        ? "يسعدنا الإجابة عن أي استفسار يخص فرص العمل، السفر للدول الأوروبية، أو خطوات التقديم والتقسيط."
                        : "We are glad to answer all your questions regarding work opportunities in Europe, payment plans, or visa procedures."}
                    </p>
                  </div>
                </div>

                {/* Conversation messages */}
                {messages.map((m) => {
                  const isMe = m.sender === "client";
                  return (
                    <div key={m.id} className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-beige text-xs font-bold">K</div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isMe
                            ? "rounded-ee-xs bg-navy text-ivory"
                            : "rounded-ss-xs border border-border bg-card text-foreground"
                        }`}
                      >
                        {!isMe && (
                          <p className="mb-0.5 text-[10px] font-semibold text-beige">
                            {m.senderName || "Kinetix Support"}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${isMe ? "text-ivory/60" : "text-muted-foreground"}`}>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && <CheckCheck className="h-3 w-3 text-beige" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Quick reply chips (shown before any messages) */}
                {messages.length === 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-medium text-muted-foreground mb-2 ps-1">
                      {ar ? "أسئلة شائعة — اختر أو اكتب:" : "Quick questions — tap or type:"}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {quickReplies.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q.text)}
                          className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 text-start text-xs text-foreground hover:border-beige hover:bg-beige/5 transition-colors"
                        >
                          <span className="text-base leading-none">{q.icon}</span>
                          <span>{q.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="border-t border-border bg-card p-3 shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={ar ? "اكتب استفسارك هنا..." : "Type your message here..."}
                    disabled={busy}
                    className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-beige disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={busy || !inputText.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-ivory transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
