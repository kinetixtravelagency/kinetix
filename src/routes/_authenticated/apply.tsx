import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Briefcase,
  TrendingUp, MapPin, RefreshCw, Check, Plane, Clock, DollarSign,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createApplication } from "@/lib/account.functions";
import {
  countries, eur, getProgram, MAX_INSTALLMENTS, type Track,
  STUDENT_DURATION_OPTIONS, GRADUATE_DURATION_OPTIONS,
  FLIGHT_PRICE_STANDARD, FLIGHT_PRICE_PREMIUM,
} from "@/lib/catalog";
import { useLang } from "@/lib/i18n";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { ApplicationProgressTracker } from "@/components/site/ApplicationProgressTracker";

export const Route = createFileRoute("/_authenticated/apply")({
  validateSearch: (s: Record<string, unknown>): { program?: string | undefined } => ({ program: typeof s["program"] === "string" ? s["program"] : undefined }),
  head: () => ({ meta: [{ title: "Apply — Kinetix" }, { name: "description", content: "Apply to a Kinetix program and upload your documents." }] }),
  component: Apply,
});

const inp = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-beige transition-colors";

function Apply() {
  const { t, lang } = useLang();
  const ar = lang === "ar";
  const { program: initial } = Route.useSearch();
  const found = initial ? getProgram(initial) : undefined;

  const [countrySlug, setCountrySlug] = useState(found?.country.slug ?? countries[0]!.slug);
  const [track, setTrack] = useState<Track>(found?.program.track ?? "graduate");
  const [plan, setPlan] = useState<"full" | "installments">("installments");
  const [months, setMonths] = useState(MAX_INSTALLMENTS);
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [flightIncluded, setFlightIncluded] = useState(false);

  const PERSIST_KEY = `kinetix_app_submitted_${initial || "default"}`;
  const persistedAppId = typeof window !== "undefined" ? localStorage.getItem(PERSIST_KEY) : null;
  const [step, setStep] = useState(persistedAppId ? 2 : 0);
  const [f, setF] = useState({ full_name: "", phone: "", passport_number: "", birth_date: "", education: "", gender: "", city: "", promo_code: "", military_status: "" });
  const [appId, setAppId] = useState<string | null>(persistedAppId);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showAllPrograms, setShowAllPrograms] = useState<boolean>(!found);
  const submit = useServerFn(createApplication);

  const country = countries.find((c) => c.slug === countrySlug) ?? countries[0]!;
  const [selectedProgSlug, setSelectedProgSlug] = useState<string>(
    found?.program.slug ?? country.programs.find((p) => p.track === track)?.slug ?? country.programs[0]!.slug
  );

  const rawPrograms = country.programs.filter((p) => p.track === track);
  const specificPrograms = rawPrograms.filter((p) => !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate"));
  const availablePrograms = specificPrograms.length > 0 ? specificPrograms : rawPrograms;

  const program =
    country.programs.find((p) => p.slug === selectedProgSlug) ??
    availablePrograms[0] ??
    country.programs[0]!;

  // Duration options based on track
  const durationOptions = program.durationOptions ?? (track === "student" ? STUDENT_DURATION_OPTIONS : GRADUATE_DURATION_OPTIONS);
  const effectiveDuration = selectedDuration || durationOptions[durationOptions.length - 1] || program.duration;

  // Flight add-on price
  const flightAddOn = flightIncluded ? (program.flightPrice ?? FLIGHT_PRICE_STANDARD) : 0;
  const totalPrice = program.price + flightAddOn;

  const dueNow = plan === "full" ? totalPrice : program.deposit;
  const monthly = Math.ceil((totalPrice - program.deposit) / months);

  const docsQ = useQuery({
    queryKey: ["app-docs", appId],
    enabled: !!appId,
    queryFn: async () => (await supabase.from("application_documents").select("id, doc_type, file_name, file_path, status").eq("application_id", appId!)).data ?? [],
  });

  const validateForm = () => {
    if (!f.full_name.trim() || f.full_name.trim().split(" ").filter(Boolean).length < 2)
      return ar ? "الرجاء إدخال الاسم بالكامل (الاسم الأول والأخير على الأقل)" : "Please enter your full name (first & last name).";
    if (!f.phone.trim() || !/^[\d\+\s\-]{8,20}$/.test(f.phone.trim()))
      return ar ? "رقم الهاتف غير صحيح — يجب أن يكون 8-20 رقماً" : "Invalid phone number (8-20 digits).";
    if (!f.gender)
      return ar ? "الرجاء تحديد الجنس" : "Please select your gender.";
    if (!f.birth_date)
      return ar ? "الرجاء إدخال تاريخ الميلاد" : "Please enter your birth date.";
    const age = (Date.now() - new Date(f.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 17 || age > 50)
      return ar ? "العمر يجب أن يكون بين 17 و50 سنة" : "Age must be between 17 and 50 years.";
    if (!f.education)
      return ar ? "الرجاء تحديد المستوى التعليمي" : "Please select your education level.";
    if (!f.city.trim() || f.city.trim().length < 2)
      return ar ? "الرجاء إدخال مدينة الإقامة" : "Please enter your city.";
    if (f.gender === "male" && !f.military_status)
      return ar ? "الرجاء تحديد الموقف من التجنيد" : "Please select your military service status.";
    return null;
  };

  const onSubmit = async () => {
    const validationErr = validateForm();
    if (validationErr) { setErr(validationErr); return; }
    setErr(null); setBusy(true);
    try {
      const r = await submit({ data: { program: program.slug, payment_plan: plan, installments: plan === "full" ? 1 : months, full_name: f.full_name, phone: f.phone, passport_number: f.passport_number, birth_date: f.birth_date, education: f.education, promo_code: f.promo_code, gender: f.gender, city: f.city } });
      localStorage.setItem(PERSIST_KEY, r.id);
      setAppId(r.id); setStep(2);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  const steps = [t("stepProgram"), t("stepDetails"), t("stepDocs")];

  // ── Payment summary card ──────────────────────────────────────────────────
  const PaymentSummary = () => (
    <div className="rounded-2xl bg-secondary/80 border border-border p-4 space-y-3">
      {/* Flight toggle */}
      {(program.flightPrice ?? 0) > 0 && (
        <button
          type="button"
          onClick={() => setFlightIncluded(!flightIncluded)}
          className={`w-full flex items-center justify-between rounded-xl border p-3 transition-all ${
            flightIncluded
              ? "border-navy bg-navy/10 text-navy"
              : "border-border bg-background hover:border-beige"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Plane className={`h-4 w-4 ${flightIncluded ? "text-navy" : "text-muted-foreground"}`} />
            {ar ? "تضمين تذكرة الطيران" : "Include Flight Ticket"}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${flightIncluded ? "bg-navy text-ivory" : "bg-secondary text-muted-foreground"}`}>
            + {eur(program.flightPrice ?? FLIGHT_PRICE_STANDARD)}
            <span className="font-normal"> ≈ {Math.round((program.flightPrice ?? FLIGHT_PRICE_STANDARD) * 54).toLocaleString()} {ar ? "ج.م" : "EGP"}</span>
          </span>
        </button>
      )}

      {/* Contract duration */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
          <Clock className="h-3.5 w-3.5" />
          {ar ? "مدة العقد" : "Contract Duration"}
        </p>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDuration(d)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                effectiveDuration === d
                  ? "border-navy bg-navy text-ivory"
                  : "border-border bg-background hover:border-beige"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Payment plan */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
          <DollarSign className="h-3.5 w-3.5" />
          {t("paymentPlan")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([ ["full", t("payFull"), t("payFullSub")], ["installments", t("payInst"), t("payInstSub")] ] as const).map(([k, l, sub]) => (
            <button key={k} onClick={() => setPlan(k)} className={`rounded-xl border p-3 text-start transition-all ${plan === k ? "border-navy bg-navy/5 ring-1 ring-navy" : "border-border bg-background hover:border-beige"}`}>
              <p className="font-semibold text-sm">{l}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
        {plan === "installments" && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {Array.from({ length: MAX_INSTALLMENTS - 1 }, (_, k) => k + 2).map((n) => (
              <button key={n} onClick={() => setMonths(n)} className={`h-9 min-w-9 rounded-full border text-sm transition-all ${n === months ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{n}</button>
            ))}
            <span className="text-xs text-muted-foreground">{t("months")}</span>
          </div>
        )}
      </div>

      {/* Due now summary */}
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-background border border-border p-4 mt-1">
        <div>
          <p className="text-xs text-muted-foreground">{t("dueNow")}</p>
          <p className="font-display text-2xl font-bold">{eur(dueNow)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">≈ {Math.round(dueNow * 54).toLocaleString()} {ar ? "ج.م" : "EGP"}</p>
        </div>
        {plan === "installments" ? (
          <div>
            <p className="text-xs text-muted-foreground">{months}× {t("thenMonthly")}</p>
            <p className="font-display text-2xl">{eur(monthly)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">≈ {Math.round(monthly * 54).toLocaleString()} {ar ? "ج.م" : "EGP"}</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground">{t("totalCost")}</p>
            <p className="font-display text-2xl">{eur(totalPrice)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">≈ {Math.round(totalPrice * 54).toLocaleString()} {ar ? "ج.م" : "EGP"}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav solid />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">

          {/* Step indicator */}
          <ol className="mb-8 grid grid-cols-3 gap-2">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-col gap-1.5">
                <span className={`h-1 rounded-full ${i <= step ? "bg-navy" : "bg-secondary"}`} />
                <span className={`text-[11px] sm:text-xs leading-tight ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{i + 1}. {s}</span>
              </li>
            ))}
          </ol>

          {/* ══ STEP 0 — Selected program view ══ */}
          {step === 0 && !showAllPrograms && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Program card */}
              <div className="rounded-3xl border-2 border-beige/40 bg-card p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl shrink-0 border border-border">
                      <img src={country.image} alt={country.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-beige shrink-0" strokeWidth={1.5} />
                        {ar ? country.nameAr : country.name} {country.flag}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                        {ar ? program.titleAr : program.title}
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllPrograms(true)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-beige transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                    <span className="hidden sm:inline">{t("changeRole")}</span>
                  </button>
                </div>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {ar ? program.categoryAr : program.category}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {program.duration}
                  </span>
                  <span className="rounded-full bg-navy/10 text-navy px-3 py-1 text-xs font-semibold">
                    {program.track === "student" ? t("trackStudent") : t("trackGraduate")}
                  </span>
                  {(program.expectedSalary || program.expectedSalaryAr) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <TrendingUp className="h-3 w-3" strokeWidth={2} />
                      {t("expectedSalary")}: {ar ? (program.expectedSalaryAr ?? program.expectedSalary) : program.expectedSalary}
                    </span>
                  )}
                </div>

                {/* Working hours & accommodation */}
                {(program.workingHours || program.accommodation) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-2xl p-3">
                    {program.workingHours && <div><span className="font-semibold text-foreground">{t("workingHoursLabel")}:</span> {program.workingHours}</div>}
                    {(program.accommodation || program.accommodationAr) && <div><span className="font-semibold text-foreground">{t("accommodationLabel")}:</span> {ar ? (program.accommodationAr ?? program.accommodation) : program.accommodation}</div>}
                  </div>
                )}
              </div>

              <PaymentSummary />

              <button onClick={() => setStep(1)} className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-semibold text-ivory hover:opacity-90 transition-opacity">
                {t("next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* ══ STEP 0 — Browse all programs ══ */}
          {step === 0 && showAllPrograms && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {found && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setShowAllPrograms(false)} className="text-xs text-muted-foreground underline hover:text-foreground">
                    {t("keepSelected")} ({ar ? found.program.titleAr : found.program.title})
                  </button>
                </div>
              )}

              {/* Country grid */}
              <div>
                <label className="eyebrow text-muted-foreground">{t("country")}</label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {countries.map((c) => (
                    <button key={c.slug} onClick={() => {
                      setCountrySlug(c.slug);
                      const firstMatch = c.programs.find((p) => p.track === track && !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate")) ?? c.programs[0];
                      if (firstMatch) setSelectedProgSlug(firstMatch.slug);
                    }}
                      className={`relative h-20 overflow-hidden rounded-2xl text-start text-sm font-medium text-ivory ring-2 transition ${c.slug === countrySlug ? "ring-beige scale-[1.02]" : "ring-transparent opacity-80 hover:opacity-100"}`}
                    >
                      <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-t from-navy/90 to-navy/10" />
                      <span className="absolute bottom-2 start-3 text-xs sm:text-sm">{ar ? c.nameAr : c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Track */}
              <div>
                <label className="eyebrow text-muted-foreground">{t("chooseTrack")}</label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(["student", "graduate"] as const).map((tr) => {
                    const Icon = tr === "student" ? GraduationCap : Briefcase;
                    const count = country.programs.filter(p => p.track === tr && !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate")).length || country.programs.filter(p => p.track === tr).length;
                    return (
                      <button key={tr} onClick={() => {
                        setTrack(tr);
                        setSelectedDuration("");
                        const match = country.programs.find((p) => p.track === tr && !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate")) ?? country.programs.find(p => p.track === tr);
                        if (match) setSelectedProgSlug(match.slug);
                      }} className={`rounded-2xl border p-4 text-start transition-all ${track === tr ? "border-navy bg-navy text-ivory" : "border-border bg-card hover:border-beige"}`}>
                        <Icon className={`h-5 w-5 ${track === tr ? "text-beige" : "text-muted-foreground"}`} strokeWidth={1.5} />
                        <p className="mt-3 font-display text-base sm:text-lg font-semibold">{tr === "student" ? t("trackStudent") : t("trackGraduate")}</p>
                        <p className={`text-xs mt-0.5 ${track === tr ? "text-ivory/70" : "text-muted-foreground"}`}>{count} {t("programsWord")}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Program selection */}
              <div>
                <label className="eyebrow text-muted-foreground">{t("selectProgram")}</label>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {availablePrograms.map((p) => {
                    const isSelected = p.slug === program.slug;
                    return (
                      <button key={p.slug} type="button"
                        onClick={() => { setSelectedProgSlug(p.slug); setShowAllPrograms(false); setSelectedDuration(""); }}
                        className={`rounded-2xl border p-4 text-start transition-all ${isSelected ? "border-navy bg-navy text-ivory ring-2 ring-navy/30" : "border-border bg-card hover:border-beige"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm leading-tight">{ar ? p.titleAr : p.title}</p>
                          <div className="text-end shrink-0">
                            <span className={`text-xs inline-block rounded-full px-2 py-0.5 font-bold ${isSelected ? "bg-beige text-navy" : "bg-secondary text-foreground"}`}>
                              {ar ? "مقدم" : "Deposit"} {eur(p.deposit)}
                            </span>
                            <span className={`text-[10px] block mt-0.5 font-medium ${isSelected ? "text-ivory/80" : "text-muted-foreground"}`}>
                              ≈ {Math.round(p.deposit * 54).toLocaleString()} {ar ? "ج.م" : "EGP"}
                            </span>
                          </div>
                        </div>
                        <p className={`mt-1.5 text-xs ${isSelected ? "text-ivory/70" : "text-muted-foreground"}`}>
                          {ar ? p.categoryAr : p.category} · {p.duration}
                        </p>
                        {(p.expectedSalary || p.expectedSalaryAr) && (
                          <p className={`mt-1.5 text-xs font-medium ${isSelected ? "text-emerald-300" : "text-emerald-600"}`}>
                            {t("expectedSalary")}: {ar ? (p.expectedSalaryAr ?? p.expectedSalary) : p.expectedSalary}
                          </p>
                        )}
                        {(p.flightPrice ?? 0) > 0 && (
                          <p className={`mt-1 text-[10px] flex items-center gap-1 ${isSelected ? "text-beige/80" : "text-muted-foreground"}`}>
                            <Plane className="h-3 w-3" />
                            {ar ? "خيار الطيران متاح" : "Flight option available"} (+{eur(p.flightPrice!)})
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <PaymentSummary />

              <button onClick={() => setStep(1)} className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-semibold text-ivory hover:opacity-90 transition-opacity">
                {t("next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* ══ STEP 1 — Personal details ══ */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-sm text-muted-foreground">
                {ar ? country.nameAr : country.name} · {track === "student" ? t("trackStudent") : t("trackGraduate")} · {effectiveDuration}
              </p>

              {/* Full Name */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "الاسم بالكامل *" : "Full Name *"}</label>
                <input className={inp} placeholder={ar ? "الاسم الأول والأخير (مثل: محمد أحمد علي)" : "First & last name (e.g. Ahmed Mohamed)"} maxLength={120} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}</label>
                <input className={inp} placeholder="+201234567890" type="tel" maxLength={20} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </div>

              {/* Gender + Birth date in a row on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "الجنس *" : "Gender *"}</label>
                  <select className={inp} value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value, military_status: "" })}>
                    <option value="">{ar ? "-- اختر الجنس --" : "-- Select gender --"}</option>
                    <option value="male">{ar ? "ذكر" : "Male"}</option>
                    <option value="female">{ar ? "أنثى" : "Female"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "تاريخ الميلاد *" : "Date of Birth *"}</label>
                  <input className={inp} type="date"
                    max={new Date(Date.now() - 17*365.25*24*3600*1000).toISOString().slice(0,10)}
                    min={new Date(Date.now() - 50*365.25*24*3600*1000).toISOString().slice(0,10)}
                    value={f.birth_date} onChange={(e) => setF({ ...f, birth_date: e.target.value })} />
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "المستوى التعليمي *" : "Education Level *"}</label>
                <select className={inp} value={f.education} onChange={(e) => setF({ ...f, education: e.target.value })}>
                  <option value="">{ar ? "-- اختر المستوى --" : "-- Select level --"}</option>
                  <option value="high_school">{ar ? "ثانوي (توجيهي / ثانوية عامة)" : "High School / Secondary"}</option>
                  <option value="diploma">{ar ? "دبلوم" : "Diploma"}</option>
                  <option value="bachelor_student">{ar ? "طالب جامعي (لم يتخرج بعد)" : "University Student (Enrolled)"}</option>
                  <option value="bachelor">{ar ? "بكالوريوس" : "Bachelor's Degree"}</option>
                  <option value="master">{ar ? "ماجستير" : "Master's Degree"}</option>
                  <option value="phd">{ar ? "دكتوراه" : "PhD"}</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "مدينة الإقامة *" : "City of Residence *"}</label>
                <input className={inp} placeholder={ar ? "مثال: القاهرة، الإسكندرية، الجيزة..." : "e.g. Cairo, Alexandria..."} maxLength={80} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
              </div>

              {/* Passport (optional) */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "رقم جواز السفر (اختياري)" : "Passport Number (optional)"}</label>
                <input className={inp} placeholder={ar ? "سيُطلب منك لاحقاً إذا لم يكن متاحاً" : "You can add this later"} maxLength={40} value={f.passport_number} onChange={(e) => setF({ ...f, passport_number: e.target.value })} />
              </div>

              {/* Military Status — males only */}
              {f.gender === "male" && (
                <div className="rounded-2xl border-2 border-amber-400/50 bg-amber-50 p-4 dark:bg-amber-950/20">
                  <label className="block text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    {ar ? "🪖 الموقف من التجنيد (مطلوب للذكور) *" : "Military Service Status (required for males) *"}
                  </label>
                  <select className={`${inp} border-amber-300`} value={f.military_status} onChange={(e) => setF({ ...f, military_status: e.target.value })}>
                    <option value="">{ar ? "-- اختر الموقف --" : "-- Select status --"}</option>
                    <option value="completed">{ar ? "أديت الخدمة العسكرية" : "Completed military service"}</option>
                    <option value="exempted">{ar ? "معفى من الخدمة" : "Exempted from service"}</option>
                    <option value="postponed">{ar ? "مؤجل (طالب)" : "Deferred (student deferral)"}</option>
                    <option value="not_required">{ar ? "لا تنطبق (أقل من سن التجنيد)" : "Not applicable (under service age)"}</option>
                  </select>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                    {ar ? "ستحتاج لرفع وثيقة الموقف من التجنيد في الخطوة التالية." : "You will need to upload your military status document in the next step."}
                  </p>
                </div>
              )}

              {/* Promo Code */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{ar ? "كود الخصم (اختياري)" : "Promo Code (optional)"}</label>
                <input className={`${inp} uppercase`} placeholder={ar ? "أدخل الكود إن وجد" : "Enter promo code if you have one"} maxLength={40} value={f.promo_code} onChange={(e) => setF({ ...f, promo_code: e.target.value })} />
              </div>

              {err && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-medium hover:bg-secondary transition-colors">
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />{t("back")}
                </button>
                <button disabled={busy} onClick={onSubmit} className="flex-1 rounded-full bg-navy py-3.5 font-semibold text-ivory disabled:opacity-50 hover:opacity-90 transition-opacity">
                  {busy ? t("submitting") : t("submitApp")}
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — Success + Documents ══ */}
          {step === 2 && appId && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-navy p-6 text-ivory">
                <CheckCircle2 className="h-7 w-7 text-beige" strokeWidth={1.5} />
                <h1 className="mt-3 font-display text-xl sm:text-2xl font-semibold">{t("appDone")}</h1>
                <p className="mt-2 text-sm text-ivory/70">{t("appDoneSub")}</p>
                <div className="mt-4 flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-beige">{eur(dueNow)}</span>
                  <span className="text-sm font-medium text-ivory/80">
                    ≈ {Math.round(dueNow * 54).toLocaleString()} {ar ? "جنيه مصري" : "EGP"}{" "}
                    ({plan === "full" ? (ar ? "دفعة واحدة بالكامل" : "Full payment") : (ar ? "المقدم المطلوب" : "Deposit required")})
                  </span>
                </div>
              </div>

              <ApplicationProgressTracker
                application={{
                  id: appId,
                  stage: 0,
                  deposit_paid: false,
                  payment_plan: plan,
                  installments: months,
                  full_name: f.full_name,
                  phone: f.phone,
                  programs: {
                    ...program,
                    price: totalPrice,
                    deposit: program.deposit,
                    title_en: program.title,
                    title_ar: program.titleAr,
                    countries: country,
                  },
                  application_documents: (docsQ.data ?? []) as any[],
                }}
                onDocChange={() => docsQ.refetch()}
              />

              <Link to="/dashboard" className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-semibold text-ivory hover:opacity-90 transition-opacity">
                {t("goDashboard")}
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
