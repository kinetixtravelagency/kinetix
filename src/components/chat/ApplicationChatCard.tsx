import { Globe, GraduationCap, Briefcase, CreditCard, ExternalLink, ShieldCheck, CheckCircle2, Plane, DollarSign } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";

export interface ParsedAppMessage {
  programTitle?: string | undefined;
  countryName?: string | undefined;
  applicationId?: string | undefined;
  fullName?: string | undefined;
  phone?: string | undefined;
  amountEur?: number | undefined;
  amountEgp?: number | undefined;
  totalPriceEur?: number | undefined;
  remainingEur?: number | undefined;
  flightIncluded?: boolean | undefined;
  paymentMethod?: string | undefined;
  paymentOption?: "deposit" | "full" | undefined;
  track?: "student" | "graduate" | undefined;
}

/**
 * Normalizes Eastern Arabic / Arabic-Indic numerals (٠-٩) and Persian numerals to Western digits (0-9).
 * Also replaces Arabic thousands separators (٬) with standard comma (,).
 */
function toStandardDigits(str: string): string {
  const arabicIndic = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str
    .replace(/[٠-٩]/g, (w) => String(arabicIndic.indexOf(w)))
    .replace(/٬/g, ",")
    .replace(/٫/g, ".");
}

export function parseApplicationMessage(text: string): ParsedAppMessage | null {
  if (!text.includes("طلب سداد") && !text.includes("💳") && !text.includes("كود الطلب")) {
    return null;
  }

  // Convert any Arabic-Indic numerals so regex digit extraction succeeds universally
  const norm = toStandardDigits(text);
  const res: ParsedAppMessage = {};

  const progMatch = text.match(/•\s*(?:البرنامج|Program):\s*([^\n\r]+)/i);
  if (progMatch && progMatch[1]) {
    const rawParts = progMatch[1].split("·").map((s) => s.trim()).filter(Boolean);
    if (rawParts.length > 0) {
      res.programTitle = rawParts[0];
      if (rawParts.length > 1) {
        res.countryName = rawParts[1];
      }
    }
  }

  const idMatch = text.match(/(?:كود الطلب|Ref|ID):\s*#?([a-zA-Z0-9_-]+)/i);
  if (idMatch && idMatch[1]) res.applicationId = idMatch[1];

  const nameMatch = text.match(/•\s*(?:الاسم|Name):\s*([^\n\r]+)/i);
  if (nameMatch && nameMatch[1]) res.fullName = nameMatch[1].trim();

  const phoneMatch = text.match(/•\s*(?:الهاتف|Phone):\s*([^\n\r]+)/i);
  if (phoneMatch && phoneMatch[1]) res.phone = phoneMatch[1].trim();

  const methodMatch = text.match(/•\s*(?:وسيلة الدفع المفضلة|وسيلة الدفع|Payment Method):\s*([^\n\r]+)/i);
  if (methodMatch && methodMatch[1]) res.paymentMethod = methodMatch[1].trim();

  if (text.includes("المقدم") || text.includes("الديبوزيت") || text.includes("deposit")) {
    res.paymentOption = "deposit";
  } else if (text.includes("دفعة واحدة") || text.includes("full")) {
    res.paymentOption = "full";
  }

  if (text.includes("مشمولة ضمن البرنامج") || text.includes("تذكرة الطيران مشمولة") || text.includes("flight included")) {
    res.flightIncluded = true;
  } else if (text.includes("غير مشمولة")) {
    res.flightIncluded = false;
  }

  // Total Program Price
  const totalMatch = norm.match(/(?:إجمالي تكلفة البرنامج|Total Cost):\s*€\s*([0-9,]+)/i);
  if (totalMatch && totalMatch[1]) {
    res.totalPriceEur = parseInt(totalMatch[1].replace(/,/g, ""), 10);
  }

  // Deposit or Amount Due Now
  const dueEurMatch = norm.match(/(?:المبلغ المطلوب سداده الآن|المبلغ المطلوب|الديبوزيت المطلوب|Due|Deposit):\s*€\s*([0-9,]+)/i);
  if (dueEurMatch && dueEurMatch[1]) {
    res.amountEur = parseInt(dueEurMatch[1].replace(/,/g, ""), 10);
  } else {
    const eurMatch = norm.match(/€\s*([0-9,]+)/);
    if (eurMatch && eurMatch[1]) res.amountEur = parseInt(eurMatch[1].replace(/,/g, ""), 10);
  }

  const dueEgpMatch = norm.match(/(?:المبلغ المطلوب سداده الآن|المبلغ المطلوب|الديبوزيت المطلوب)[^\n\r]*?([0-9,]+)\s*(?:ج\.م|EGP)/i);
  if (dueEgpMatch && dueEgpMatch[1]) {
    res.amountEgp = parseInt(dueEgpMatch[1].replace(/,/g, ""), 10);
  } else {
    const egpMatch = norm.match(/([0-9,]+)\s*(?:ج\.م|EGP)/i);
    if (egpMatch && egpMatch[1]) res.amountEgp = parseInt(egpMatch[1].replace(/,/g, ""), 10);
  }

  // Remaining Installment Balance
  const remMatch = norm.match(/(?:المتبقي بالتقسيط|Remaining):\s*€\s*([0-9,]+)/i);
  if (remMatch && remMatch[1]) {
    res.remainingEur = parseInt(remMatch[1].replace(/,/g, ""), 10);
  }

  if (text.includes("طالب") || text.includes("student")) {
    res.track = "student";
  } else if (text.includes("خريج") || text.includes("graduate")) {
    res.track = "graduate";
  }

  return res;
}

export function ApplicationChatCard({
  text,
  createdAt,
  isAdmin = false,
  onOpenApp,
}: {
  text: string;
  createdAt: string;
  isAdmin?: boolean;
  onOpenApp?: (appId: string) => void;
}) {
  const { lang } = useLang();
  const ar = lang === "ar";
  const tr = (en: string, a: string) => (ar ? a : en);

  const parsed = parseApplicationMessage(text);
  if (!parsed) {
    return <p className="whitespace-pre-wrap text-xs">{text}</p>;
  }

  const eurDisplay = parsed.amountEur != null ? `€${parsed.amountEur.toLocaleString("en-US")}` : null;
  const egpDisplay = parsed.amountEgp != null ? `${parsed.amountEgp.toLocaleString("en-US")} ${tr("EGP", "ج.م")}` : null;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-sm text-foreground transition-all hover:shadow-md space-y-3">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
            <Globe className="h-3.5 w-3.5 text-beige shrink-0" strokeWidth={1.5} />
            <span className="truncate">{parsed.countryName || tr("International Program", "برنامج دولي")}</span>
            {parsed.applicationId && (
              <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                #{parsed.applicationId.slice(0, 8)}
              </span>
            )}
          </div>
          <h4 className="font-semibold text-sm leading-snug truncate text-foreground">
            {parsed.programTitle || tr("Travel & Work Program", "برنامج سفر وعمل")}
          </h4>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 shrink-0">
          <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
          {parsed.paymentOption === "full" ? tr("Full Payment", "سداد كامل") : tr("Deposit Due", "سداد الديبوزيت")}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block">{tr("Applicant", "المتقدم")}</span>
          <p className="font-medium truncate text-foreground">{parsed.fullName || tr("Client", "عميل")}</p>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground block">{tr("Category", "الفئة")}</span>
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            {parsed.track === "student" ? (
              <>
                <GraduationCap className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                {tr("Student Track", "مسار طلاب 🎓")}
              </>
            ) : (
              <>
                <Briefcase className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                {tr("Graduate Track", "مسار خريجين 💼")}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Prominent Amount Breakdown Box */}
      <div className="rounded-xl bg-secondary/60 p-3 border border-border/80 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-foreground">
            {parsed.paymentOption === "full" ? tr("Full Amount Due", "إجمالي المبلغ المطلوب:") : tr("Deposit Due Now:", "الديبوزيت المطلوب سداده الآن:")}
          </span>
          <span className="font-mono text-base font-bold text-navy dark:text-beige">
            {eurDisplay ?? (ar ? "محدد بالطلب" : "Specified in app")}
          </span>
        </div>

        {egpDisplay && (
          <p className="text-end text-xs font-semibold text-muted-foreground">
            ≈ {egpDisplay}
          </p>
        )}

        {parsed.totalPriceEur != null && (
          <div className="pt-1.5 mt-1.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{tr("Total Program Cost:", "إجمالي تكلفة البرنامج:")}</span>
            <span className="font-mono font-medium">
              €{parsed.totalPriceEur.toLocaleString("en-US")} (≈ {Math.round(parsed.totalPriceEur * 54).toLocaleString("en-US")} {tr("EGP", "ج.م")})
            </span>
          </div>
        )}

        {parsed.remainingEur != null && parsed.remainingEur > 0 && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{tr("Remaining Balance:", "المتبقي بالأقساط:")}</span>
            <span className="font-mono font-medium">
              €{parsed.remainingEur.toLocaleString("en-US")} (≈ {Math.round(parsed.remainingEur * 54).toLocaleString("en-US")} {tr("EGP", "ج.م")})
            </span>
          </div>
        )}
      </div>

      {/* Flight Badge & Payment Method */}
      <div className="space-y-1.5">
        {parsed.flightIncluded !== undefined && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg bg-secondary/50 border border-border/40">
            <Plane className="h-3 w-3 text-beige" />
            <span>
              {parsed.flightIncluded
                ? tr("Flight ticket included in program ✈️", "تذكرة الطيران مشمولة ضمن البرنامج ✈️")
                : tr("Flight ticket not included", "تذكرة الطيران غير مشمولة")}
            </span>
          </div>
        )}

        {parsed.paymentMethod && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
            <CreditCard className="h-3.5 w-3.5 text-beige shrink-0" strokeWidth={1.5} />
            <span>
              {tr("Payment Method:", "وسيلة الدفع المختارة:")} <strong className="text-foreground font-semibold">{parsed.paymentMethod}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Footer & Action */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground">
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>

        {isAdmin ? (
          parsed.applicationId && onOpenApp ? (
            <button
              type="button"
              onClick={() => onOpenApp(parsed.applicationId!)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-foreground hover:border-beige transition-colors"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              {tr("View Application", "معاينة الطلب")}
            </button>
          ) : null
        ) : (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-[11px] font-medium text-ivory hover:opacity-90 transition-opacity"
          >
            <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
            {tr("My Applications", "متابعة في لوحة التحكم")}
          </Link>
        )}
      </div>
    </div>
  );
}
