import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Briefcase, TrendingUp, MapPin, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createApplication } from "@/lib/account.functions";
import { countries, eur, getProgram, MAX_INSTALLMENTS, type Track } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { ApplicationProgressTracker } from "@/components/site/ApplicationProgressTracker";

export const Route = createFileRoute("/_authenticated/apply")({
  validateSearch: (s: Record<string, unknown>): { program?: string | undefined } => ({ program: typeof s["program"] === "string" ? s["program"] : undefined }),
  head: () => ({ meta: [{ title: "Apply — Kinetix" }, { name: "description", content: "Apply to a Kinetix program and upload your documents." }] }),
  component: Apply,
});

const input = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-beige";

function Apply() {
  const { t, lang } = useLang();
  const ar = lang === "ar";
  const { program: initial } = Route.useSearch();
  const found = initial ? getProgram(initial) : undefined;
  const [countrySlug, setCountrySlug] = useState(found?.country.slug ?? countries[0]!.slug);
  const [track, setTrack] = useState<Track>(found?.program.track ?? "graduate");
  const [plan, setPlan] = useState<"full" | "installments">("installments");
  const [months, setMonths] = useState(MAX_INSTALLMENTS);
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ full_name: "", phone: "", passport_number: "", birth_date: "", education: "", gender: "", city: "", promo_code: "", military_status: "" });
  const [appId, setAppId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showAllPrograms, setShowAllPrograms] = useState<boolean>(!found);
  const submit = useServerFn(createApplication);

  const country = countries.find((c) => c.slug === countrySlug) ?? countries[0]!;
  const [selectedProgSlug, setSelectedProgSlug] = useState<string>(
    found?.program.slug ?? country.programs.find((p) => p.track === track)?.slug ?? country.programs[0]!.slug
  );

  // Filter programs by track and exclude duplicate generic fallbacks if specific exist
  const rawPrograms = country.programs.filter((p) => p.track === track);
  const specificPrograms = rawPrograms.filter((p) => !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate"));
  const availablePrograms = specificPrograms.length > 0 ? specificPrograms : rawPrograms;

  const program =
    country.programs.find((p) => p.slug === selectedProgSlug) ??
    availablePrograms[0] ??
    country.programs[0]!;

  const dueNow = plan === "full" ? program.price : program.deposit;
  const monthly = Math.ceil((program.price - program.deposit) / months);

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
      const notes = f.gender === "male" ? `[GENDER:male][MILITARY:${f.military_status}]` : "[GENDER:female]";
      const r = await submit({ data: { program: program.slug, payment_plan: plan, installments: plan === "full" ? 1 : months, full_name: f.full_name, phone: f.phone, passport_number: f.passport_number, birth_date: f.birth_date, education: f.education, promo_code: f.promo_code, gender: f.gender, city: f.city } });
      setAppId(r.id); setStep(2);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  const steps = [t("stepProgram"), t("stepDetails"), t("stepDocs")];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav solid />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <ol className="mb-8 grid grid-cols-3 gap-2">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-col gap-2">
                <span className={`h-1 rounded-full ${i <= step ? "bg-navy" : "bg-secondary"}`} />
                <span className={`text-xs ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{i + 1}. {s}</span>
              </li>
            ))}
          </ol>

          {/* STEP 0: Show Selected Job only if came from specific role, or selection flow */}
          {step === 0 && !showAllPrograms && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Selected Job Card */}
              <div className="rounded-3xl border-2 border-beige/40 bg-card p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl shrink-0 border border-border">
                      <img src={country.image} alt={country.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-beige" strokeWidth={1.5} />
                        {ar ? country.nameAr : country.name} {country.flag}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {ar ? program.titleAr : program.title}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAllPrograms(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:border-beige hover:text-foreground transition-colors self-start sm:self-center"
                  >
                    <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
                    {t("changeRole")}
                  </button>
                </div>

                {/* Badges row */}
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
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
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                      {t("expectedSalary")}: {ar ? (program.expectedSalaryAr ?? program.expectedSalary) : program.expectedSalary}
                    </span>
                  )}
                </div>

                {/* Working hours & accommodation preview */}
                {(program.workingHours || program.accommodation) && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground bg-secondary/40 rounded-2xl p-4">
                    {program.workingHours && <div><span className="font-semibold text-foreground">{t("workingHoursLabel")}:</span> {program.workingHours}</div>}
                    {(program.accommodation || program.accommodationAr) && <div><span className="font-semibold text-foreground">{t("accommodationLabel")}:</span> {ar ? (program.accommodationAr ?? program.accommodation) : program.accommodation}</div>}
                  </div>
                )}
              </div>

              {/* Payment plan */}
              <div>
                <label className="eyebrow text-muted-foreground">{t("paymentPlan")}</label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {([["full", t("payFull"), t("payFullSub")], ["installments", t("payInst"), t("payInstSub")]] as const).map(([k, l, sub]) => (
                    <button key={k} onClick={() => setPlan(k)} className={`rounded-2xl border p-4 text-start transition ${plan === k ? "border-navy ring-1 ring-navy bg-navy/5" : "border-border hover:border-beige"}`}>
                      <p className="font-medium">{l}</p><p className="text-xs text-muted-foreground">{sub}</p>
                    </button>
                  ))}
                </div>
                {plan === "installments" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: MAX_INSTALLMENTS - 1 }, (_, k) => k + 2).map((n) => (
                      <button key={n} onClick={() => setMonths(n)} className={`h-11 min-w-11 rounded-full border px-3 text-sm ${n === months ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{n}</button>
                    ))}
                    <span className="self-center text-xs text-muted-foreground">{t("months")}</span>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-secondary p-5">
                  <div><p className="text-xs text-muted-foreground">{t("dueNow")}</p><p className="font-display text-2xl">{eur(dueNow)}</p></div>
                  {plan === "installments"
                    ? <div><p className="text-xs text-muted-foreground">{months}× {t("thenMonthly")}</p><p className="font-display text-2xl">{eur(monthly)}</p></div>
                    : <div><p className="text-xs text-muted-foreground">{t("totalCost")}</p><p className="font-display text-2xl">{eur(program.price)}</p></div>}
                </div>
              </div>

              <button onClick={() => setStep(1)} className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-medium text-ivory hover:opacity-90 transition-opacity">
                {t("next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* STEP 0 Fallback: Full Country & Program Selector (if browsing or clicked change) */}
          {step === 0 && showAllPrograms && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {found && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAllPrograms(false)}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    {t("keepSelected")} ({ar ? found.program.titleAr : found.program.title})
                  </button>
                </div>
              )}
              <div>
                <label className="eyebrow text-muted-foreground">{t("country")}</label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {countries.map((c) => (
                    <button key={c.slug} onClick={() => {
                      setCountrySlug(c.slug);
                      const firstMatch = c.programs.find((p) => p.track === track && !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate")) ?? c.programs[0];
                      if (firstMatch) setSelectedProgSlug(firstMatch.slug);
                    }}
                      className={`relative h-20 overflow-hidden rounded-2xl text-start text-sm font-medium text-ivory ring-2 transition ${c.slug === countrySlug ? "ring-beige" : "ring-transparent opacity-80"}`}>
                      <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-t from-navy/90 to-navy/10" />
                      <span className="absolute bottom-2 start-3">{ar ? c.nameAr : c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="eyebrow text-muted-foreground">{t("chooseTrack")}</label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(["student", "graduate"] as const).map((tr) => {
                    const Icon = tr === "student" ? GraduationCap : Briefcase;
                    return (
                      <button key={tr} onClick={() => {
                        setTrack(tr);
                        const match = country.programs.find((p) => p.track === tr && !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate")) ?? country.programs.find(p => p.track === tr);
                        if (match) setSelectedProgSlug(match.slug);
                      }} className={`rounded-2xl border p-4 text-start transition ${track === tr ? "border-navy bg-navy text-ivory" : "border-border bg-card hover:border-beige"}`}>
                        <Icon className={`h-5 w-5 ${track === tr ? "text-beige" : "text-muted-foreground"}`} strokeWidth={1.5} />
                        <p className="mt-3 font-display text-lg font-semibold">{tr === "student" ? t("trackStudent") : t("trackGraduate")}</p>
                        <p className={`text-sm ${track === tr ? "text-ivory/70" : "text-muted-foreground"}`}>{country.programs.filter(p => p.track === tr && !p.slug.endsWith("-student") && !p.slug.endsWith("-graduate")).length || country.programs.filter(p => p.track === tr).length} {t("programsWord")}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Program / Job selection */}
              <div>
                <label className="eyebrow text-muted-foreground">{t("selectProgram")}</label>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {availablePrograms.map((p) => {
                    const isSelected = p.slug === program.slug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => {
                          setSelectedProgSlug(p.slug);
                          setShowAllPrograms(false);
                        }}
                        className={`rounded-2xl border p-4 text-start transition ${
                          isSelected
                            ? "border-navy bg-navy text-ivory ring-2 ring-navy/30"
                            : "border-border bg-card hover:border-beige"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm">{ar ? p.titleAr : p.title}</p>
                          <span className={`text-xs shrink-0 rounded-full px-2 py-0.5 ${isSelected ? "bg-beige text-navy font-bold" : "bg-secondary text-muted-foreground"}`}>
                            {eur(p.price)}
                          </span>
                        </div>
                        <p className={`mt-1 text-xs ${isSelected ? "text-ivory/70" : "text-muted-foreground"}`}>
                          {ar ? p.categoryAr : p.category} · {p.duration}
                        </p>
                        {(p.expectedSalary || p.expectedSalaryAr) && (
                          <p className={`mt-2 text-xs font-medium ${isSelected ? "text-emerald-300" : "text-emerald-600"}`}>
                            {t("expectedSalary")}: {ar ? (p.expectedSalaryAr ?? p.expectedSalary) : p.expectedSalary}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="eyebrow text-muted-foreground">{t("paymentPlan")}</label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {([["full", t("payFull"), t("payFullSub")], ["installments", t("payInst"), t("payInstSub")]] as const).map(([k, l, sub]) => (
                    <button key={k} onClick={() => setPlan(k)} className={`rounded-2xl border p-4 text-start transition ${plan === k ? "border-navy ring-1 ring-navy" : "border-border hover:border-beige"}`}>
                      <p className="font-medium">{l}</p><p className="text-xs text-muted-foreground">{sub}</p>
                    </button>
                  ))}
                </div>
                {plan === "installments" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: MAX_INSTALLMENTS - 1 }, (_, k) => k + 2).map((n) => (
                      <button key={n} onClick={() => setMonths(n)} className={`h-11 min-w-11 rounded-full border px-3 text-sm ${n === months ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{n}</button>
                    ))}
                    <span className="self-center text-xs text-muted-foreground">{t("months")}</span>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-secondary p-5">
                  <div><p className="text-xs text-muted-foreground">{t("dueNow")}</p><p className="font-display text-2xl">{eur(dueNow)}</p></div>
                  {plan === "installments"
                    ? <div><p className="text-xs text-muted-foreground">{months}× {t("thenMonthly")}</p><p className="font-display text-2xl">{eur(monthly)}</p></div>
                    : <div><p className="text-xs text-muted-foreground">{t("totalCost")}</p><p className="font-display text-2xl">{eur(program.price)}</p></div>}
                </div>
              </div>

              <button onClick={() => setStep(1)} className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-medium text-ivory">
                {t("next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
              </button>
            </div>
          )}


        {step === 1 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="mb-4 text-sm text-muted-foreground">{ar ? country.nameAr : country.name} · {track === "student" ? t("trackStudent") : t("trackGraduate")} · {plan === "full" ? t("payFull") : `${months} ${t("months")}`}</p>

            {/* Full Name */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "الاسم بالكامل *" : "Full Name *"}</label>
              <input className={input} placeholder={ar ? "الاسم الأول والأخير (مثل: محمد أحمد علي)" : "First & last name (e.g. Ahmed Mohamed)"} maxLength={120} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}</label>
              <input className={input} placeholder="+201234567890" type="tel" maxLength={20} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "الجنس *" : "Gender *"}</label>
              <select className={input} value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value, military_status: "" })}>
                <option value="">{ar ? "-- اختر الجنس --" : "-- Select gender --"}</option>
                <option value="male">{ar ? "ذكر" : "Male"}</option>
                <option value="female">{ar ? "أنثى" : "Female"}</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "تاريخ الميلاد *" : "Date of Birth *"}</label>
              <input className={input} type="date" max={new Date(Date.now() - 17*365.25*24*3600*1000).toISOString().slice(0,10)} min={new Date(Date.now() - 50*365.25*24*3600*1000).toISOString().slice(0,10)} value={f.birth_date} onChange={(e) => setF({ ...f, birth_date: e.target.value })} />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "المستوى التعليمي *" : "Education Level *"}</label>
              <select className={input} value={f.education} onChange={(e) => setF({ ...f, education: e.target.value })}>
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
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "مدينة الإقامة *" : "City of Residence *"}</label>
              <input className={input} placeholder={ar ? "مثال: القاهرة، الإسكندرية، الجيزة..." : "e.g. Cairo, Alexandria..."} maxLength={80} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
            </div>

            {/* Passport (optional) */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "رقم جواز السفر (اختياري)" : "Passport Number (optional)"}</label>
              <input className={input} placeholder={ar ? "سيُطلب منك لاحقاً إذا لم يكن متاحاً" : "You can add this later"} maxLength={40} value={f.passport_number} onChange={(e) => setF({ ...f, passport_number: e.target.value })} />
            </div>

            {/* Military Status — males only */}
            {f.gender === "male" && (
              <div className="rounded-2xl border-2 border-amber-400/50 bg-amber-50 p-4 dark:bg-amber-950/20">
                <label className="block text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  🪖 {ar ? "الموقف من التجنيد (مطلوب للذكور) *" : "Military Service Status (required for males) *"}
                </label>
                <select className={`${input} border-amber-300`} value={f.military_status} onChange={(e) => setF({ ...f, military_status: e.target.value })}>
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
              <label className="block text-xs text-muted-foreground mb-1">{ar ? "كود الخصم (اختياري)" : "Promo Code (optional)"}</label>
              <input className={`${input} uppercase`} placeholder={ar ? "أدخل الكود إن وجد" : "Enter promo code if you have one"} maxLength={40} value={f.promo_code} onChange={(e) => setF({ ...f, promo_code: e.target.value })} />
            </div>

            {err && <p className="mt-1 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">{err}</p>}
            <div className="flex gap-3 pt-3">
              <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-4 text-sm"><ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />{t("back")}</button>
              <button disabled={busy} onClick={onSubmit} className="flex-1 rounded-full bg-navy py-4 font-medium text-ivory disabled:opacity-50">
                {busy ? t("submitting") : t("submitApp")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && appId && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-navy p-6 text-ivory">
              <CheckCircle2 className="h-7 w-7 text-beige" strokeWidth={1.5} />
              <h1 className="mt-3 font-display text-2xl font-semibold">{t("appDone")}</h1>
              <p className="mt-2 text-sm text-ivory/70">{t("appDoneSub")}</p>
              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-beige">{eur(dueNow)}</span>
                <span className="text-sm font-medium text-ivory/80">
                  ≈ {Math.round(dueNow * 54).toLocaleString()} {ar ? "جنيه مصري" : "EGP"} ({plan === "full" ? (ar ? "دفعة واحدة بالكامل" : "Full payment") : (ar ? "المقدم المطلوب" : "Deposit required")})
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
                  price: program.price,
                  deposit: program.deposit,
                  title_en: program.title,
                  title_ar: program.titleAr,
                  countries: country,
                },
                application_documents: (docsQ.data ?? []) as any[],
              }}
              onDocChange={() => docsQ.refetch()}
            />

            <Link to="/dashboard" className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-medium text-ivory">{t("goDashboard")}</Link>
          </div>
        )}
      </div>
    </main>
    <Footer />
  </div>
  );
}
