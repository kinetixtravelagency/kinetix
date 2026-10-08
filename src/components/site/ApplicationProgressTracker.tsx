import { useState } from "react";
import {
  Check,
  Clock,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Wallet,
  UserCheck,
  Video,
  FileBadge,
  Plane,
  Sparkles,
  CreditCard,
  Zap,
  Phone,
  MessageSquare,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { requestPaymentSupport } from "@/lib/account.functions";
import { useLang } from "@/lib/i18n";
import { eur } from "@/lib/catalog";
import {
  VodafoneLogo,
  InstaPayLogo,
  OrangeLogo,
  WePayLogo,
  EtisalatLogo,
} from "./PaymentBrandLogos";

type Doc = {
  id: string;
  doc_type: string;
  file_name: string;
  file_path: string;
  status: string;
  note?: string | null;
  created_at?: string;
};

interface ApplicationProgressTrackerProps {
  application: any;
  onDocChange?: () => void;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function ApplicationProgressTracker({ application, onDocChange }: ApplicationProgressTrackerProps) {
  const { t, lang } = useLang();
  const ar = lang === "ar";
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const stage = Number(application.stage ?? 0);
  const depositPaid = Boolean(application.deposit_paid);
  const effectiveStage = depositPaid && stage < 1 ? 1 : Math.max(0, Math.min(5, stage));

  const steps = [
    {
      id: 0,
      title: t("stage0"), // تقديم ومستندات
      sub: t("stageSub0"),
      desc: t("stageDesc0"),
      icon: FileText,
    },
    {
      id: 1,
      title: t("stage1"), // ديبوزت
      sub: t("stageSub1"),
      desc: t("stageDesc1"),
      icon: Wallet,
    },
    {
      id: 2,
      title: t("stage2"), // بري انترفيو
      sub: t("stageSub2"),
      desc: t("stageDesc2"),
      icon: UserCheck,
    },
    {
      id: 3,
      title: t("stage3"), // انترفيو
      sub: t("stageSub3"),
      desc: t("stageDesc3"),
      icon: Video,
    },
    {
      id: 4,
      title: t("stage4"), // التصريح والتأشيرة
      sub: t("stageSub4"),
      desc: t("stageDesc4"),
      icon: FileBadge,
    },
    {
      id: 5,
      title: t("stage5"), // جاهز للسفر
      sub: t("stageSub5"),
      desc: t("stageDesc5"),
      icon: Plane,
    },
  ];

  const currentStep = steps[effectiveStage] ?? steps[0]!;

  // Documents
  const docs: Doc[] = application.application_documents ?? [];
  const cvDoc = docs.find((d) =>
    d.doc_type.toLowerCase().includes("cv") ||
    d.doc_type.includes("سيرة") ||
    d.doc_type.toLowerCase().includes("resume")
  );

  // Detect gender from application notes
  const appNotes: string = application.notes ?? "";
  const isMale = appNotes.includes("[GENDER:male]") || application.gender === "male";

  const pr = application.programs;
  const depositEur = pr?.deposit ?? 500;
  const fullEur = pr?.price ?? 2400;
  const EUR_TO_EGP = 54;

  const [payOption, setPayOption] = useState<"deposit" | "full">(
    application.payment_plan === "full" ? "full" : "deposit"
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("InstaPay");
  const [requestingPay, setRequestingPay] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestErr, setRequestErr] = useState<string | null>(null);

  const requestPay = useServerFn(requestPaymentSupport);

  const selectedEur = payOption === "full" ? fullEur : depositEur;
  const selectedEgp = Math.round(selectedEur * EUR_TO_EGP);
  const depositEgp = Math.round(depositEur * EUR_TO_EGP);
  const fullEgp = Math.round(fullEur * EUR_TO_EGP);

  const paymentMethods = [
    {
      id: "InstaPay",
      name: ar ? "انستاباي" : "InstaPay",
      sub: ar ? "تحويل بنكي فوري لجميع البنوك" : "Instant bank transfer",
      badge: ar ? "تحويل لحظي" : "Instant",
      LogoComponent: InstaPayLogo,
      accent: "hover:border-purple-500",
      activeBg: "border-purple-600 bg-purple-50 text-purple-950 dark:bg-purple-950/30 dark:text-purple-200 ring-2 ring-purple-500/30 shadow-sm",
    },
    {
      id: "Vodafone Cash",
      name: ar ? "فودافون كاش" : "Vodafone Cash",
      sub: ar ? "محفظة فودافون كاش الذكية" : "Vodafone Cash wallet",
      badge: ar ? "محفظة كاش" : "Mobile Wallet",
      LogoComponent: VodafoneLogo,
      accent: "hover:border-red-500",
      activeBg: "border-red-600 bg-red-50 text-red-950 dark:bg-red-950/30 dark:text-red-200 ring-2 ring-red-500/30 shadow-sm",
    },
    {
      id: "Orange Cash",
      name: ar ? "أورنج كاش" : "Orange Cash",
      sub: ar ? "محفظة أورنج كاش الذكية" : "Orange Cash wallet",
      badge: ar ? "محفظة كاش" : "Mobile Wallet",
      LogoComponent: OrangeLogo,
      accent: "hover:border-orange-500",
      activeBg: "border-orange-600 bg-orange-50 text-orange-950 dark:bg-orange-950/30 dark:text-orange-200 ring-2 ring-orange-500/30 shadow-sm",
    },
    {
      id: "WE Pay",
      name: ar ? "وي باي" : "WE Pay",
      sub: ar ? "محفظة المصرية للاتصالات WE" : "WE Pay mobile wallet",
      badge: ar ? "محفظة كاش" : "Mobile Wallet",
      LogoComponent: WePayLogo,
      accent: "hover:border-indigo-500",
      activeBg: "border-indigo-600 bg-indigo-50 text-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-200 ring-2 ring-indigo-500/30 shadow-sm",
    },
    {
      id: "Etisalat Cash",
      name: ar ? "اتصالات كاش (e&)" : "Etisalat Cash (e&)",
      sub: ar ? "محفظة e& اتصالات كاش" : "e& cash mobile wallet",
      badge: ar ? "محفظة كاش" : "Mobile Wallet",
      LogoComponent: EtisalatLogo,
      accent: "hover:border-red-500",
      activeBg: "border-red-600 bg-red-50 text-red-950 dark:bg-red-950/30 dark:text-red-200 ring-2 ring-red-500/30 shadow-sm",
    },
  ];

  const handlePaymentRequest = async () => {
    setRequestingPay(true);
    setRequestErr(null);
    try {
      const progTitle = ar
        ? (pr?.title_ar || pr?.titleAr || pr?.title_en || pr?.title || "برنامج سفر")
        : (pr?.title_en || pr?.title || pr?.title_ar || "Program");
      const countryName = ar
        ? (pr?.countries?.name_ar || pr?.countries?.nameAr || pr?.countries?.name || "")
        : (pr?.countries?.name_en || pr?.countries?.name || pr?.countries?.name_ar || "");

      await requestPay({
        data: {
          applicationId: application.id,
          paymentOption: payOption,
          paymentMethod,
          amountEur: selectedEur,
          amountEgp: selectedEgp,
          programTitle: progTitle,
          countryName: countryName || undefined,
          phone: application.phone || undefined,
          fullName: application.full_name || undefined,
        },
      });

      setRequestSuccess(true);
      window.dispatchEvent(new CustomEvent("open-kinetix-chat"));
    } catch (e: any) {
      setRequestErr(e.message || "حدث خطأ أثناء إرسال الطلب");
    } finally {
      setRequestingPay(false);
    }
  };

  const uploadFile = async (docType: string, file: File) => {
    setErr(null);
    if (file.size > MAX_FILE_SIZE) {
      setErr(ar ? "حجم الملف يتجاوز الحد المسموح (15 ميجابايت)" : "File size exceeds 15 MB limit.");
      return;
    }
    setBusy(docType);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Please sign in");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${u.user.id}/${application.id}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error: storageErr } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type });
      if (storageErr) throw storageErr;

      // Clean up previous non-approved document of this type
      const old = docs.filter((d) => d.doc_type === docType && d.status !== "approved");
      if (old.length) {
        await supabase.from("application_documents").delete().in("id", old.map((d) => d.id));
      }

      const { error: insErr } = await supabase.from("application_documents").insert({
        application_id: application.id,
        user_id: u.user.id,
        doc_type: docType,
        file_path: path,
        file_name: file.name.slice(0, 200),
      });
      if (insErr) throw insErr;
      if (onDocChange) onDocChange();
    } catch (e: any) {
      setErr(e.message || "Failed to upload file");
    } finally {
      setBusy(null);
    }
  };

  const openSignedUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(filePath, 300);
      if (error || !data?.signedUrl) throw new Error("Could not create link");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Progress percentage for connector line
  const progressPercent = Math.min(100, Math.max(0, (effectiveStage / 5) * 100));

  return (
    <div className="space-y-6">
      {/* ─── 1. TIMELINE TRACKER (CIRCLES & PROGRESS LINE) ─── */}
      <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <p className="eyebrow flex items-center gap-2 text-beige">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            {t("progress")}
          </p>
          <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy dark:bg-ivory/10 dark:text-ivory">
            {ar ? `المرحلة ${effectiveStage + 1} من 6` : `Stage ${effectiveStage + 1} of 6`}
          </span>
        </div>

        {/* The Stepper Container with Horizontal Scroll Support on Mobile */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="relative min-w-[620px] px-6">
            {/* Background connecting bar */}
            <div className="absolute top-6 start-8 end-8 h-1 -translate-y-1/2 rounded-full bg-secondary" />

            {/* Filled active progress bar */}
            <div
              className="absolute top-6 start-8 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-navy via-beige to-emerald-600 transition-all duration-500"
              style={{
                width: `calc(${progressPercent}% - 3rem)`,
              }}
            />

            {/* 6 Step Circles */}
            <div className="relative flex justify-between">
              {steps.map((st) => {
                const isCompleted = st.id < effectiveStage || (st.id === 1 && depositPaid);
                const isActive = st.id === effectiveStage;
                const Icon = st.icon;

                return (
                  <div key={st.id} className="flex flex-col items-center text-center" style={{ width: "88px" }}>
                    {/* Circle Node */}
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-navy text-ivory shadow-md ring-4 ring-navy/15 dark:bg-emerald-600 dark:ring-emerald-500/20"
                          : isActive
                          ? "scale-110 bg-beige text-navy shadow-lg shadow-beige/30 ring-4 ring-beige/40 ring-offset-2 ring-offset-background"
                          : "border-2 border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 stroke-[2.5]" />
                      ) : isActive ? (
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      ) : (
                        <span className="text-xs font-semibold">{st.id + 1}</span>
                      )}

                      {/* Small Active Pulse Indicator */}
                      {isActive && (
                        <span className="absolute -top-1 -end-1 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-beige opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-beige" />
                        </span>
                      )}
                    </div>

                    {/* Step Title */}
                    <p
                      className={`mt-3 text-xs leading-snug transition-colors ${
                        isActive
                          ? "font-bold text-foreground"
                          : isCompleted
                          ? "font-medium text-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {st.title}
                    </p>

                    {/* Step Status Pill */}
                    <span
                      className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : isActive
                          ? "bg-amber-100 text-amber-900 font-semibold dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isCompleted
                        ? ar
                          ? "مكتمل ✓"
                          : "Done ✓"
                        : isActive
                        ? ar
                          ? "جاري الآن"
                          : "Active"
                        : ar
                        ? "قادم"
                        : "Next"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── 2. ACTIVE STAGE HIGHLIGHT DETAIL CARD ─── */}
        <div className="mt-6 rounded-2xl border border-beige/40 bg-gradient-to-br from-beige-soft/80 to-background p-5 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <currentStep.icon className="h-5 w-5 text-beige" strokeWidth={1.5} />
                {ar ? `المرحلة الحالية: ${currentStep.title}` : `Current Stage: ${currentStep.title}`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{currentStep.desc}</p>
            </div>

            {/* Stage-specific quick pill */}
            {effectiveStage === 1 && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  depositPaid
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-navy text-ivory"
                }`}
              >
                {depositPaid ? (ar ? "تم دفع الديبوزت ✓" : "Deposit Paid ✓") : (ar ? "المقدم مطلوب" : "Deposit Due")}
              </span>
            )}
          </div>

          {/* Stage specifics */}
          {effectiveStage === 0 && !depositPaid && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <span>💡</span>
              <span>
                {ar
                  ? "الخطوة الأولى: يمكنك رفع سيرتك الذاتية وتحديد طريقة سداد الدفعة الأولى أدناه لحجز مكانك وتأكيد المقابلات."
                  : "Step 1: Upload your CV and choose your payment method below to lock your spot."}
              </span>
            </div>
          )}

          {effectiveStage === 1 && !depositPaid && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <span>⏳</span>
              <span>
                {ar
                  ? "ملفك بانتظار سداد الدفعة الأولى لبدء جدولة المقابلات الرسمية مع أصحاب العمل."
                  : "Your file is awaiting payment to schedule official employer interviews."}
              </span>
            </div>
          )}

          {/* Stage 2 Pre-interview specifics */}
          {effectiveStage === 2 && (
            <div className="mt-3 text-xs text-muted-foreground">
              {ar
                ? "💡 نصيحة: تأكد من مراجعة سيرتك الذاتية أدناه وتجهيز نبذة باللغة الإنجليزية عن دراستك وخبرتك السابقة."
                : "💡 Tip: Make sure your CV is updated below and be ready to introduce yourself in English."}
            </div>
          )}
        </div>

        {/* ─── PAYMENT SELECTION & LIVE CHAT REQUEST CARD ─── */}
        {!depositPaid ? (
          <div className="mt-6 rounded-3xl border-2 border-beige/60 bg-card p-6 shadow-md transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy text-beige">
                  <CreditCard className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {ar ? "سداد الرسوم وتأكيد الحجز" : "Payment & Reservation Confirmation"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {ar
                      ? "اختر خطة السداد وطريقة الدفع واطلب تواصل خدمة العملاء في الشات فوراً"
                      : "Choose your plan & payment method, then request immediate support in live chat"}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                ⏳ {ar ? "بانتظار سداد الدفعة" : "Payment Pending"}
              </span>
            </div>

            {/* Step 1: Choose Plan (Deposit vs Full) */}
            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {ar ? "1. حدد خطة السداد المطلوبة:" : "1. Select Payment Plan:"}
              </label>

              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                {/* Deposit Option */}
                <button
                  type="button"
                  onClick={() => setPayOption("deposit")}
                  className={`relative rounded-2xl border-2 p-4 text-start transition-all ${
                    payOption === "deposit"
                      ? "border-navy bg-navy/5 shadow-sm ring-2 ring-navy/20 dark:border-beige dark:bg-beige/10"
                      : "border-border bg-card hover:border-beige"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {ar ? "المقدم (Deposit)" : "Deposit (Down payment)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ar ? "لحجز المكان وبدء المقابلات والتقديم" : "Locks spot & starts interview scheduling"}
                      </p>
                    </div>
                    {payOption === "deposit" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-foreground">
                      {eur(depositEur)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      ≈ {depositEgp.toLocaleString()} {ar ? "ج.م" : "EGP"}
                    </span>
                  </div>
                </button>

                {/* Full Payment Option */}
                <button
                  type="button"
                  onClick={() => setPayOption("full")}
                  className={`relative rounded-2xl border-2 p-4 text-start transition-all ${
                    payOption === "full"
                      ? "border-navy bg-navy/5 shadow-sm ring-2 ring-navy/20 dark:border-beige dark:bg-beige/10"
                      : "border-border bg-card hover:border-beige"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {ar ? "دفعة واحدة بالكامل (Full Payment)" : "Full Payment (100%)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ar ? "سداد إجمالي تكلفة البرنامج كاملة" : "Full program cost in single payment"}
                      </p>
                    </div>
                    {payOption === "full" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-foreground">
                      {eur(fullEur)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      ≈ {fullEgp.toLocaleString()} {ar ? "ج.م" : "EGP"}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Choose Payment Method */}
            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {ar ? "2. اختر طريقة الدفع المفضلة لديك:" : "2. Choose Payment Method:"}
              </label>

              <div className="mt-2.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {paymentMethods.map((m) => {
                  const isSelected = paymentMethod === m.id;
                  const Logo = m.LogoComponent;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`relative flex items-center gap-3.5 rounded-2xl border-2 p-3.5 text-start transition-all ${
                        isSelected
                          ? m.activeBg
                          : `border-border bg-card hover:shadow-sm ${m.accent}`
                      }`}
                    >
                      <Logo className="h-10 w-10 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sm text-foreground truncate">{m.name}</span>
                          <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                            {m.badge}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {m.sub}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold shadow-md">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Total Summary & Request Button */}
            <div className="mt-6 rounded-2xl bg-secondary/70 p-4 border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const cur = paymentMethods.find((p) => p.id === paymentMethod);
                  if (cur) {
                    const CurLogo = cur.LogoComponent;
                    return <CurLogo className="h-10 w-10 shrink-0" />;
                  }
                  return null;
                })()}
                <div>
                  <p className="text-xs text-muted-foreground">
                    {ar ? "المبلغ المحدد للسداد عبر" : "Amount to pay via"}{" "}
                    <strong className="text-foreground font-semibold">{paymentMethod}</strong>:
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-display text-2xl font-bold text-navy dark:text-beige">
                      {eur(selectedEur)}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      ({selectedEgp.toLocaleString()} {ar ? "جنيه مصري" : "EGP"})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  disabled={requestingPay}
                  onClick={handlePaymentRequest}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-ivory shadow-lg hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                >
                  {requestingPay ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {ar ? "جاري إرسال الطلب..." : "Sending Request..."}
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 text-beige" />
                      {ar ? "ريكويست تواصل والدفع في الشات" : "Request & Chat with Support"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {requestErr && (
              <p className="mt-3 text-xs text-destructive font-medium text-center">
                {requestErr}
              </p>
            )}

            {/* Success Alert */}
            {requestSuccess && (
              <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-200 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed flex-1">
                    <p className="font-bold text-sm">
                      {ar ? "✓ تم إرسال طلب الدفع بنجاح!" : "✓ Payment request sent successfully!"}
                    </p>
                    <p className="mt-1">
                      {ar
                        ? `تم تسجيل طلبك لدفع (${payOption === "deposit" ? "المقدم" : "دفعة واحدة"}) بمبلغ ${eur(selectedEur)} (~${selectedEgp.toLocaleString()} ج.م) عبر ${paymentMethod}. تم فتح شات الموقع وسيتواصل معك ممثل خدمة العملاء الآن لتزويدك برقم التحويل وتأكيد الحجز.`
                        : `Your payment request of ${eur(selectedEur)} via ${paymentMethod} has been sent. Live chat is now open for an advisor to assist you.`}
                    </p>
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-kinetix-chat"))}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {ar ? "فتح شات الموقع الآن 💬" : "Open Live Chat Now 💬"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  {ar ? "تم سداد الدفعة بنجاح ✓" : "Deposit Paid Successfully ✓"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ar ? "ملفك نشط وجاري التجهيز للمقابلات الرسمية وتصاريح السفر." : "Your application is active and moving forward."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-kinetix-chat"))}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {ar ? "محادثة الدعم" : "Chat Support"}
            </button>
          </div>
        )}
      </div>

      {/* ─── 3. DEDICATED CV & DOCUMENTS SECTION ─── */}
      <div className="space-y-4">
        {/* CV SPECIAL CARD */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <FileText className="h-5 w-5 text-beige" strokeWidth={1.5} />
                {t("cvSectionTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">{t("cvSectionSub")}</p>
            </div>

            {/* CV Status Badge */}
            {cvDoc ? (
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  cvDoc.status === "approved"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : cvDoc.status === "rejected"
                    ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400"
                }`}
              >
                {cvDoc.status === "approved" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : cvDoc.status === "rejected" ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {cvDoc.status === "approved"
                  ? t("docApproved")
                  : cvDoc.status === "rejected"
                  ? t("docRejected")
                  : t("docPending")}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                {t("cvNotUploaded")}
              </span>
            )}
          </div>

          {/* CV Action Row */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-secondary/40 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-beige">
                <FileText className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {cvDoc ? cvDoc.file_name : ar ? "السيرة الذاتية (CV في ملف PDF)" : "Resume / CV (PDF format)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cvDoc
                    ? ar
                      ? "ملف مرفوع ومتاح للمراجعة"
                      : "Uploaded and ready for employer review"
                    : ar
                    ? "صيغ مقبولة: PDF, Word, JPG — بحد أقصى 15 ميجا"
                    : "Accepted: PDF, DOC, DOCX, JPG — Max 15MB"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {cvDoc && (
                <button
                  onClick={() => openSignedUrl(cvDoc.file_path)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:border-beige"
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t("viewCvBtn")}
                </button>
              )}

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ivory hover:opacity-90">
                {busy === "CV" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
                {cvDoc ? t("replaceCvBtn") : t("uploadCvBtn")}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={busy === "CV"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile("CV in English", f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* OTHER SUPPORTING DOCUMENTS */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h4 className="font-display text-base font-semibold">{t("supportingDocs")}</h4>
          <p className="mb-4 text-xs text-muted-foreground">{t("docsHint")}</p>

          <div className="space-y-2.5">
            {[
              ar ? "جواز السفر (سارٍ لأكثر من 12 شهر)" : "Valid passport (12+ months)",
              ar ? "صورة شخصية حديثة" : "Recent passport photo",
              ar ? "الشهادة / إثبات القيد الجامعي" : "Degree / University certificate",
              ar ? "صحيفة الحالة الجنائية (فيش)" : "Police clearance",
              ar ? "شهادة صحية" : "Medical certificate",
              ...(isMale ? [ar ? "وثيقة الموقف من التجنيد 🪖" : "Military Service Status Document 🪖"] : []),
            ].map((dt) => {
              const doc = docs.find((d) => d.doc_type === dt || d.doc_type.includes(dt.slice(0, 8)));
              const isApproved = doc?.status === "approved";
              const isRejected = doc?.status === "rejected";

              return (
                <div
                  key={dt}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{dt}</p>
                      {doc ? (
                        <p
                          className={`flex items-center gap-1 text-xs ${
                            isApproved
                              ? "text-emerald-700 dark:text-emerald-400"
                              : isRejected
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isApproved ? <Check className="h-3 w-3" /> : isRejected ? <XCircle className="h-3 w-3" /> : null}
                          {isApproved ? t("docApproved") : isRejected ? t("docRejected") : t("docPending")} ·{" "}
                          <span className="truncate">{doc.file_name}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">{t("required")}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc && (
                      <button
                        onClick={() => openSignedUrl(doc.file_path)}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-beige"
                      >
                        <Eye className="h-3 w-3" />
                        {ar ? "عرض" : "View"}
                      </button>
                    )}

                    {!isApproved && (
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-beige">
                        {busy === dt ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        {doc ? t("replace") : t("upload")}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                          disabled={busy === dt}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadFile(dt, f);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {err && <p className="text-xs font-medium text-destructive">{err}</p>}
      </div>
    </div>
  );
}
