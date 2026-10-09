import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Award, Copy, Check, LogOut, Wallet, Mail, Phone, MapPin, Link2,
  User, Calendar, GraduationCap, Building2, BookOpen, ShieldCheck,
  CheckCircle2, Clock, FileText, Sparkles, CreditCard, ArrowRight,
  Settings, ExternalLink, Globe, Layers, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccount, updateMyProfile, updateMyPayout } from "@/lib/account.functions";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/useSession";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { eur, getCountry, getProgram } from "@/lib/catalog";
import { egp, defaultCommissionFor } from "@/lib/levels";
import { ApplicationProgressTracker } from "@/components/site/ApplicationProgressTracker";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard & Client Profile — Kinetix" }] }),
  component: Dashboard,
});

const input = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-beige transition-colors";

function Dashboard() {
  const { t, lang } = useLang();
  const ar = lang === "ar";
  const tr = (en: string, a: string) => (ar ? a : en);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(updateMyProfile);
  const savePayout = useServerFn(updateMyPayout);
  const { data, isLoading } = useQuery({ queryKey: ["account"], queryFn: fetchAccount });

  const { user } = useSession();
  const [activeTab, setActiveTab] = useState<"applications" | "profile" | "partner">("applications");
  const [copiedRef, setCopiedRef] = useState(false);

  // Complete Client Profile state
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [governorate, setGovernorate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [academicStatus, setAcademicStatus] = useState<string>("");
  const [university, setUniversity] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [englishLevel, setEnglishLevel] = useState<string>("");
  const [nationalId, setNationalId] = useState<string>("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [payoutMethod, setPayoutMethod] = useState<string | null>(null);
  const [payoutDetails, setPayoutDetails] = useState<string | null>(null);

  // Sync profile data
  useEffect(() => {
    if (!data) return;
    const acc = data as any;
    const meta = acc.metadata || {};
    setFullName(acc.profile?.full_name || meta.full_name || "");
    setPhoneNumber(acc.profile?.phone || meta.phone || "");
    setCity(meta.city || "");
    setGovernorate(meta.governorate || "");
    setGender(meta.gender || "");
    setBirthDate(meta.birth_date || "");
    setAcademicStatus(meta.academic_status || "");
    setUniversity(meta.university || "");
    setFaculty(meta.faculty || "");
    setEnglishLevel(meta.english_level || "");
    setNationalId(meta.national_id || "");
  }, [data]);

  if (isLoading || !data) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">…</div>;

  const account = data as any;
  const partner = account.partner;
  const isAdmin = account.roles.includes("admin");
  const earned = (account.commissions as any[]).filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const pendingAmt = (account.commissions as any[]).filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);

  const signOut = async () => {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileErr(null);
    try {
      await saveProfile({
        data: {
          full_name: fullName,
          phone: phoneNumber,
          city,
          governorate,
          gender,
          birth_date: birthDate,
          academic_status: academicStatus,
          university,
          faculty,
          english_level: englishLevel,
          national_id: nationalId,
        },
      });
      setSaveSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setProfileErr(err.message || tr("Failed to update profile", "حدث خطأ أثناء حفظ الملف الشخصي"));
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav solid />
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory text-xs font-bold">
              {fullName ? fullName.slice(0, 1).toUpperCase() : "K"}
            </div>
            <p className="text-sm font-medium text-foreground">
              {fullName ? `${t("welcome")}, ${fullName}` : t("dashboard")}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {isAdmin && <Link to="/admin" className="rounded-full bg-navy px-3.5 py-1.5 text-xs text-ivory hover:opacity-90">{t("adminDashboard")}</Link>}
            {partner && (
              <Link to="/partner" className="rounded-full bg-beige/20 text-navy dark:text-beige px-3 py-1 text-xs font-semibold hover:bg-beige/30 transition-colors">
                {tr("Partner Portal", "بوابة الشركاء")}
              </Link>
            )}
            <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />{t("signOut")}</button>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
          {/* Dashboard Tab Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("applications")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  activeTab === "applications"
                    ? "bg-navy text-ivory shadow-sm dark:bg-beige dark:text-navy"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                {tr("My Applications & Stages", "طلباتي ومراحل التقديم")}
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
                  {account.applications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  activeTab === "profile"
                    ? "bg-navy text-ivory shadow-sm dark:bg-beige dark:text-navy"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                {tr("Complete Client Profile", "الملف الشخصي الشامل")}
              </button>

              {partner && (
                <button
                  type="button"
                  onClick={() => setActiveTab("partner")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                    activeTab === "partner"
                      ? "bg-navy text-ivory shadow-sm dark:bg-beige dark:text-navy"
                      : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  {tr("Partner Portal", "بوابة الشريك")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/apply"
                className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ivory shadow-sm hover:opacity-90"
              >
                + {t("applyNow")}
              </Link>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: APPLICATIONS & TRACKER */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              {account.applications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                  <Globe className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                  <h3 className="font-display text-xl font-bold">{tr("No Active Applications Yet", "لا توجد طلبات تقديم حالية")}</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    {tr("Browse our programs across Germany, Poland, Spain, Italy and apply now to start your journey.", "تصفح برامجنا في ألمانيا، بولندا، إسبانيا، وإيطاليا وابدأ رحلتك الآن.")}
                  </p>
                  <Link
                    to="/apply"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-ivory shadow-md hover:opacity-90 transition-transform active:scale-95"
                  >
                    {tr("Explore Programs & Apply", "استكشاف البرامج والتقديم")} →
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {(account.applications as any[]).map((a) => {
                    const pr = a.programs;
                    const catEntry = pr?.slug ? getProgram(pr.slug) : undefined;
                    const catProg = catEntry?.program;
                    const c = getCountry(pr?.countries?.slug ?? catEntry?.country?.slug ?? "");
                    const effectiveDeposit = catProg?.deposit ?? (pr?.deposit && pr.deposit <= 250 ? pr.deposit : 196);
                    const effectivePrice = catProg?.price ?? pr?.price ?? 2400;
                    const due = a.payment_plan === "full" ? effectivePrice : effectiveDeposit;
                    const progTitle = ar ? pr?.title_ar || catProg?.titleAr || pr?.title_en : pr?.title_en || catProg?.title;
                    const countryTitle = ar ? pr?.countries?.name_ar || c?.nameAr : pr?.countries?.name_en || c?.name;

                    return (
                      <div key={a.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/80 pb-5">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xl">{c?.flag ?? "🌍"}</span>
                              <h3 className="font-display text-xl font-bold">
                                {countryTitle} · {progTitle}
                              </h3>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(a.created_at).toLocaleDateString()} · {a.payment_plan === "full" ? t("payFull") : `${t("payInst")} ${a.installments} ${t("months")}`}
                              {a.promo_code ? ` · 🏷 ${a.promo_code}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {a.deposit_paid ? (
                              <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                ✓ {t("depositPaid")}
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                ⏳ {t("depositAwait")} ({eur(due ?? 0)})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Circular Step Timeline + Active Stage Card + CV & Docs */}
                        <ApplicationProgressTracker
                          application={{
                            ...a,
                            full_name: a.full_name || account.profile?.full_name || fullName,
                            phone: a.phone || account.profile?.phone || phoneNumber,
                          }}
                          onDocChange={() => queryClient.invalidateQueries({ queryKey: ["account"] })}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: COMPLETE CLIENT PROFILE */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Header Summary */}
              <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-beige dark:bg-beige dark:text-navy text-xl font-bold shadow-md">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : "KI"}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {fullName || tr("Kinetix Client", "عميل كينتيكس")}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user?.email || "—"} · {tr("Registered Client Account", "حساب عميل موثق لدى Kinetix")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    {tr("Verified Account", "حساب مفعل")}
                  </span>
                </div>
              </div>

              {saveSuccess && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  {tr("Profile details updated successfully!", "تم تحديث وحفظ بيانات البروفايل بنجاح!")}
                </div>
              )}

              {profileErr && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4" />
                  {profileErr}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Card 1: Personal & Contact Information */}
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
                      <User className="h-4 w-4 text-beige" />
                      {tr("Personal & Contact Details", "البيانات الشخصية والتواصل")}
                    </h3>

                    <div className="space-y-3.5">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          {tr("Full Name (as in Passport/ID) *", "الاسم بالكامل (كما في بطاقة الهوية / جواز السفر) *")}
                        </label>
                        <input
                          required
                          className={input}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="الاسم ثلاثي أو رباعي"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">
                            {tr("Phone / WhatsApp *", "رقم الهاتف / واتساب *")}
                          </label>
                          <input
                            required
                            className={input}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="010xxxxxxxx"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">
                            {tr("Email Address", "البريد الإلكتروني")}
                          </label>
                          <input
                            readOnly
                            disabled
                            className={`${input} opacity-70 cursor-not-allowed`}
                            value={user?.email || ""}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">
                            {tr("Governorate / City", "المحافظة / المدينة")}
                          </label>
                          <input
                            className={input}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder={tr("Cairo, Alexandria...", "القاهرة، الجيزة، الإسكندرية...")}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">
                            {tr("Gender", "النوع / الجنس")}
                          </label>
                          <select
                            className={input}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <option value="">{tr("Select Gender", "اختر النوع")}</option>
                            <option value="male">{tr("Male", "ذكر")}</option>
                            <option value="female">{tr("Female", "أنثى")}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">
                            {tr("Birth Date", "تاريخ الميلاد")}
                          </label>
                          <input
                            type="date"
                            className={input}
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">
                            {tr("National ID / Passport Number", "الرقم القومي / جواز السفر")}
                          </label>
                          <input
                            className={input}
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value)}
                            placeholder="14 digits or Passport #"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Academic & Professional Information */}
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
                      <GraduationCap className="h-4 w-4 text-beige" />
                      {tr("Academic & Career Profile", "المسار الأكاديمي والتعليمي")}
                    </h3>

                    <div className="space-y-3.5">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          {tr("Academic Status", "الموقف الأكاديمي")}
                        </label>
                        <select
                          className={input}
                          value={academicStatus}
                          onChange={(e) => setAcademicStatus(e.target.value)}
                        >
                          <option value="">{tr("Select status", "اختر الحالة")}</option>
                          <option value="student">{tr("Undergraduate Student", "طالب جامعي مقيد")}</option>
                          <option value="graduate">{tr("University Graduate", "خريج جامعي")}</option>
                          <option value="postgrad">{tr("Postgraduate / Masters", "دراسات عليا / ماجستير")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          {tr("University / Institute", "الجامعة أو المعهد")}
                        </label>
                        <input
                          className={input}
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder={tr("e.g. Cairo University, Ain Shams...", "مثال: جامعة القاهرة، عين شمس...")}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          {tr("Faculty & Specialization", "الكلية والتخصص الدراسي")}
                        </label>
                        <input
                          className={input}
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          placeholder={tr("e.g. Faculty of Engineering, Medicine, Commerce...", "مثال: كلية الهندسة، التمريض، التجارة، الحاسبات...")}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          {tr("English Proficiency Level", "مستوى اللغة الإنجليزية")}
                        </label>
                        <select
                          className={input}
                          value={englishLevel}
                          onChange={(e) => setEnglishLevel(e.target.value)}
                        >
                          <option value="">{tr("Select English level", "اختر مستوى الإنجليزية")}</option>
                          <option value="A1-A2">{tr("Beginner (A1 - A2)", "مبتدئ (A1 - A2)")}</option>
                          <option value="B1">{tr("Intermediate (B1)", "متوسط (B1)")}</option>
                          <option value="B2">{tr("Upper Intermediate (B2)", "فوق المتوسط (B2)")}</option>
                          <option value="C1-C2">{tr("Advanced / Fluent (C1 - C2)", "متقدم / طليق (C1 - C2)")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Profile Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5">
                  <span className="text-xs text-muted-foreground">
                    {tr("Your information is strictly encrypted and protected according to Kinetix privacy policy.", "بياناتك مشفرة ومحمية وفق سياسة خصوصية وأمان كينتيكس المعتمدة.")}
                  </span>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3 text-sm font-bold text-ivory shadow-md hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {savingProfile ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                        {tr("Saving Changes...", "جاري الحفظ...")}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {tr("Save Profile Changes", "حفظ تعديلات البروفايل")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: PARTNER PORTAL PREVIEW (if partner) */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "partner" && partner && (
            <section className="rounded-3xl bg-navy p-6 text-ivory">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-semibold">{t("partnerPortal")}</h2>
                  <Link to="/partner" className="text-xs text-beige underline hover:text-ivory transition-colors">
                    {ar ? "فتح البوابة الكاملة ←" : "Open Full Portal →"}
                  </Link>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-beige/50 px-4 py-1.5 text-sm text-beige">
                  <Award className="h-4 w-4" strokeWidth={1.5} />
                  {t("level")}: {partner.level}
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-navy-soft p-5">
                  <p className="text-xs text-ivory/60">{t("promoCode")}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(partner.promo_code)}
                    className="mt-1 flex items-center gap-2 font-display text-2xl text-beige"
                  >
                    {partner.promo_code}
                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="rounded-2xl bg-navy-soft p-5">
                  <p className="text-xs text-ivory/60">{t("fixedCommission")}</p>
                  <p className="mt-1 font-display text-2xl text-beige">{egp(defaultCommissionFor(partner.level, 0))}</p>
                </div>
                <div className="rounded-2xl bg-navy-soft p-5">
                  <p className="text-xs text-ivory/60">{t("totalEarned")}</p>
                  <p className="mt-1 font-display text-2xl text-beige">{egp(earned)}</p>
                </div>
                <div className="rounded-2xl bg-navy-soft p-5">
                  <p className="text-xs text-ivory/60">{t("pending")}</p>
                  <p className="mt-1 font-display text-2xl text-beige">{egp(pendingAmt)}</p>
                </div>
              </div>

              {/* Referral Link Quick Copy */}
              <div className="mt-6 rounded-2xl bg-navy-soft/80 p-5 border border-ivory/10 space-y-3">
                <span className="text-ivory/70 block text-xs font-semibold">
                  {ar ? "رابط الإحالة الخاص بك" : "Your Referral Link"}
                </span>
                <div className="flex items-center gap-2 max-w-xl">
                  <input
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/?ref=${partner.promo_code}` : `https://kinetix.travel/?ref=${partner.promo_code}`}
                    className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 font-mono text-xs text-ivory outline-none"
                  />
                  <button
                    onClick={() => {
                      const link = typeof window !== "undefined" ? `${window.location.origin}/?ref=${partner.promo_code}` : `https://kinetix.travel/?ref=${partner.promo_code}`;
                      navigator.clipboard.writeText(link);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="shrink-0 rounded-xl bg-beige px-4 py-2 text-xs font-semibold text-navy hover:bg-beige/90 transition-colors flex items-center gap-1.5"
                  >
                    {copiedRef ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedRef ? (ar ? "تم النسخ" : "Copied") : (ar ? "نسخ الرابط" : "Copy Link")}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}


