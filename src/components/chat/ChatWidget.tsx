import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  Mail,
  User,
  CheckCheck,
  Minimize2,
  ChevronDown,
} from "lucide-react";
import { getClientChat, sendClientMessage, type ChatMessage } from "@/lib/chat.functions";
import { useSession } from "@/lib/useSession";
import { useLang } from "@/lib/i18n";
import logoImg from "@/assets/pics/logo.png";

const VISITOR_KEY = "kinetix_chat_visitor_id";
const CONV_KEY = "kinetix_chat_conv_id";

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
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [needsInfo, setNeedsInfo] = useState(false);

  const fetchChat = useServerFn(getClientChat);
  const sendMsg = useServerFn(sendClientMessage);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize visitor ID & load existing conversation
  useEffect(() => {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = "v_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
      localStorage.setItem(VISITOR_KEY, vid);
    }
    setVisitorId(vid);

    const savedConv = localStorage.getItem(CONV_KEY) || "";
    if (savedConv) setConvId(savedConv);

    if (!user && !localStorage.getItem("kinetix_chat_client_name")) {
      setNeedsInfo(true);
    } else {
      setClientName(user?.user_metadata?.["full_name"] || localStorage.getItem("kinetix_chat_client_name") || "");
    }
  }, [user]);

  // Listen for open-kinetix-chat event triggered by payment request or other components
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-kinetix-chat", handleOpen);
    return () => window.removeEventListener("open-kinetix-chat", handleOpen);
  }, []);

  // Poll for messages when open, or periodically for notifications
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
          if (!isOpen && res.conversation.unreadClientCount) {
            setUnread(res.conversation.unreadClientCount);
          }
        }
      } catch (err) {
        // silent polling error
      }
    };

    poll();
    const interval = setInterval(poll, isOpen ? 3000 : 12000);
    return () => clearInterval(interval);
  }, [isOpen, convId, visitorId, user?.id]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend || busy) return;

    setBusy(true);
    try {
      const name = clientName.trim() || user?.user_metadata?.["full_name"] || (ar ? "عميل كينتيكس" : "Kinetix Client");
      const phone = clientPhone.trim() || undefined;
      const email = user?.email || undefined;

      // Save name for returning sessions
      if (name) localStorage.setItem("kinetix_chat_client_name", name);

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
      setNeedsInfo(false);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setBusy(false);
    }
  };

  const quickReplies = ar
    ? [
        "استفسار عن وظائف بلغاريا وأوروبا",
        "تفاصيل نظام الدفع والتقسيط",
        "الأوراق المطلوبة لتجهيز السيرة الذاتية",
      ]
    : [
        "Inquire about European work programs",
        "Payment & installment plans details",
        "Documents required to apply",
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
              <span className="absolute -top-1.5 -start-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
                {unread}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 end-4 z-50 flex h-[540px] max-h-[85vh] w-[370px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-navy px-5 py-4 text-ivory">
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

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-ivory/70 hover:bg-ivory/10 hover:text-ivory transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-secondary/30">
            {/* Automated Welcome Card */}
            <div className="flex gap-2.5">
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-beige text-xs font-bold">
                K
              </div>
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

            {/* Render conversation messages */}
            {messages.map((m) => {
              const isMe = m.sender === "client";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-beige text-xs font-bold">
                      K
                    </div>
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
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                        isMe ? "text-ivory/60" : "text-muted-foreground"
                      }`}
                    >
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && <CheckCheck className="h-3 w-3 text-beige" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick chips if conversation is new */}
            {messages.length === 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-medium text-muted-foreground mb-2 ps-1">
                  {ar ? "استفسارات شائعة:" : "Quick questions:"}
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickReplies.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="rounded-xl border border-border bg-card p-2 text-start text-xs text-foreground hover:border-beige hover:bg-beige/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Visitor identification prompt (if guest and no messages yet) */}
          {needsInfo && !user && messages.length === 0 && (
            <div className="border-t border-border bg-card p-3 space-y-2 text-xs">
              <p className="text-[11px] font-medium text-muted-foreground">
                {ar ? "بيانات للتواصل معك إذا انقطع الاتصال (اختياري):" : "Optional contact details:"}
              </p>
              <div className="flex gap-2">
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={ar ? "اسمك الكريم" : "Your name"}
                  className="w-1/2 rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:border-beige"
                />
                <input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder={ar ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
                  className="w-1/2 rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:border-beige"
                />
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-border bg-card p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
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
        </div>
      )}
    </>
  );
}
