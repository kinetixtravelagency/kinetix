import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Gift, Wallet, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/partners/join")({
  head: () => ({
    meta: [
      { title: "Become a Sales Partner — Kinetix" },
      { name: "description", content: "Join the Kinetix sales partner program: your own promo code, levels, client discounts and commissions." },
      { property: "og:title", content: "Become a Sales Partner — Kinetix" },
      { property: "og:description", content: "Your own promo code, levels, client discounts and commissions." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JoinPartner,
});

const EGYPTIAN_GOVERNORATES_AR = [
  "القاهرة", "الجيزة", "الإسكندرية", "البحرالبحر الأحمر", "الإسماعيلية", "السويس",
  "بورسعيد", "دمياط", "كفر الشيخ", "الغربية", "المنوفية", "القليوبية",
  "الشرقية", "الدقهلية", "بني سويف", "الفيوم", "المنيا", "أسيوط",
  "سوهاج", "قنا", "لوكسور", "أسوان", "البحر الأحمر", "الوادي الجديد",
  "مطروح", "شمال سيناء", "جنوب سيناء",
];

const EGYPTIAN_GOVERNORATES_EN = [
  "Cairo", "Giza", "Alexandria", "Red Sea", "Ismailia", "Suez",
  "Port Said", "Damietta", "Kafr el-Sheikh", "Gharbia", "Menofia", "Qalyubia",
  "Sharqia", "Dakahlia", "Beni Suef", "Fayoum", "Minya", "Asyut",
  "Sohag", "Qena", "Luxor", "Aswan", "Red Sea", "New Valley",
  "Matruh", "North Sinai", "South Sinai",
];

const input = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-beige";

function JoinPartner() {
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const ar = lang === "ar";
  const navigate = useNavigate();
  const [f, setF] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    gender: "",
    birth_date: "",
    governorate: "",
    university: "",
    faculty: "",
    academic_status: "",
    national_id: "",
    experience: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"error" | "success">("error");

  const validate = (): string | null => {
    if (!f.full_name.trim() || f.full_name.trim().split(" ").filter(Boolean).length < 2)
      return tr("Please enter your full name (first & last name).", "الرجاء إدخال الاسم بالكامل (الأول والأخير).");
    if (!f.phone.trim() || !/^[\d\+\s\-]{8,20}$/.test(f.phone.trim()))
      return tr("Invalid phone number (8-20 digits).", "رقم الهاتف غير صحيح.");
    if (!f.email.includes("@") || !f.email.includes("."))
      return tr("Please enter a valid email address.", "الرجاء إدخال بريد إلكتروني صحيح.");
    if (f.password.length < 8)
      return tr("Password must be at least 8 characters.", "كلمة السر يجب أن تكون 8 أحرف على الأقل.");
    if (!f.gender)
      return tr("Please select your gender.", "الرجاء تحديد الجنس.");
    if (!f.birth_date)
      return tr("Please enter your date of birth.", "الرجاء إدخال تاريخ الميلاد.");
    const age = (Date.now() - new Date(f.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 18 || age > 55)
      return tr("Age must be between 18 and 55 years.", "العمر يجب أن يكون بين 18 و55 سنة.");
    if (!f.governorate)
      return tr("Please select your governorate.", "الرجاء اختيار المحافظة.");
    if (!f.academic_status)
      return tr("Please select your academic status.", "الرجاء تحديد الحالة الدراسية.");
    if (f.national_id.trim() && !/^\d{14}$/.test(f.national_id.trim()))
      return tr("National ID must be exactly 14 digits.", "الرقم القومي يجب أن يكون 14 رقماً بالضبط.");
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setMsg(err); setMsgType("error"); return; }
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.auth.signUp({
      email: f.email.trim(), password: f.password,
      options: {
        emailRedirectTo: `${window.location.origin}/partner`,
        data: {
          intent: "partner",
          full_name: f.full_name.trim().slice(0, 120),
          phone: f.phone.trim().slice(0, 40),
          gender: f.gender,
          birth_date: f.birth_date,
          governorate: f.governorate.slice(0, 80),
          university: f.university.trim().slice(0, 120),
          faculty: f.faculty.trim().slice(0, 120),
          academic_status: f.academic_status,
          national_id: f.national_id.trim().slice(0, 14),
          experience: f.experience.trim().slice(0, 500),
        },
      },
    });
    setBusy(false);
    if (error) { setMsg(error.message); setMsgType("error"); return; }
    if (data.session) navigate({ to: "/partner" });
    else { setMsg(tr("Check your email to confirm your account, then sign in — your partner portal will be ready.", "افتح إيميلك وأكد الحساب، وبعدها سجل دخول — بوابة الشريك هتكون جاهزة."));  setMsgType("success"); }
  };

  const govOptions = ar ? EGYPTIAN_GOVERNORATES_AR : EGYPTIAN_GOVERNORATES_EN;

  return (
    <div className="flex min-h-screen flex-col bg-navy text-ivory">
      <Nav solid />
      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow text-beige">{tr("Sales Partner Program", "برنامج شركاء المبيعات")}</p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{tr("Bring clients. Level up. Earn more.", "جيب عملاء. اطلع مستوى. اكسب أكتر.")}</h1>
            <ul className="mt-8 space-y-4 text-ivory/80">
              <li className="flex gap-3"><Gift className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />{tr("Your own promo code and referral link", "كود خصم ورابط إحالة خاص بيك")}</li>
              <li className="flex gap-3"><Wallet className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />{tr("Guaranteed fixed commission starting at 9,350 EGP per client — increasing with each level", "عمولة ثابتة مضمونة تبدأ من 9,350 جنيه لكل عميل ناجح — وتزيد مع كل مستوى")}</li>
              <li className="flex gap-3"><Award className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />{tr("Levels from Starter to Platinum — higher level, higher commission and bigger client discounts", "مستويات من مبتدئ لبلاتيني — كل ما تعلى، عمولتك تزيد وخصم عملائك يكبر")}</li>
            </ul>

            {/* Levels Quick Breakdown */}
            <div className="mt-8 rounded-2xl border border-beige/30 bg-navy-soft/80 p-5">
              <p className="font-display font-semibold text-sm text-beige mb-3">{tr("Level & Fixed Commission Progression", "تدرج المستويات والعمولات الثابتة")}:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded-xl bg-navy/60 p-2.5 border border-beige/40">
                  <p className="font-bold text-ivory">Starter / مبتدئ</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">9,350 EGP</p>
                  <p className="text-[10px] text-ivory/60">0+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Bronze / برونزي</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">10,250 EGP</p>
                  <p className="text-[10px] text-ivory/60">5+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Silver / فضي</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">11,250 EGP</p>
                  <p className="text-[10px] text-ivory/60">10+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Gold / ذهبي</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">12,500 EGP</p>
                  <p className="text-[10px] text-ivory/60">20+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Platinum / بلاتيني</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">14,000 EGP</p>
                  <p className="text-[10px] text-ivory/60">40+ clients</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3 rounded-3xl bg-ivory p-6 text-navy md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl font-semibold sticky top-0 bg-ivory py-2">{tr("Partner registration", "تسجيل شريك")}</h2>

            {/* Full Name */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Full name *", "الاسم بالكامل *")}</label>
              <input className={input} required maxLength={120} placeholder={tr("First & last name", "الاسم الأول والأخير")} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Phone / WhatsApp *", "الموبايل / واتساب *")}</label>
              <input className={input} required type="tel" maxLength={20} placeholder="+201234567890" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Gender *", "الجنس *")}</label>
              <select className={input} required value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}>
                <option value="">{tr("-- Select --", "-- اختر --")}</option>
                <option value="male">{tr("Male", "ذكر")}</option>
                <option value="female">{tr("Female", "أنثى")}</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Date of Birth *", "تاريخ الميلاد *")}</label>
              <input
                className={input}
                type="date"
                required
                max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                min={new Date(Date.now() - 55 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                value={f.birth_date}
                onChange={(e) => setF({ ...f, birth_date: e.target.value })}
              />
            </div>

            {/* Governorate */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Governorate *", "المحافظة *")}</label>
              <select className={input} required value={f.governorate} onChange={(e) => setF({ ...f, governorate: e.target.value })}>
                <option value="">{tr("-- Select governorate --", "-- اختر المحافظة --")}</option>
                {govOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Academic Status */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Academic Status *", "الحالة الدراسية *")}</label>
              <select className={input} required value={f.academic_status} onChange={(e) => setF({ ...f, academic_status: e.target.value })}>
                <option value="">{tr("-- Select --", "-- اختر --")}</option>
                <option value="student">{tr("University Student (enrolled)", "طالب جامعي (مقيد)")}</option>
                <option value="graduate">{tr("University Graduate", "خريج جامعي")}</option>
                <option value="postgraduate">{tr("Postgraduate (Master / PhD)", "دراسات عليا (ماجستير / دكتوراه)")}</option>
                <option value="highschool">{tr("High School Graduate", "خريج ثانوي")}</option>
                <option value="other">{tr("Other", "غير ذلك")}</option>
              </select>
            </div>

            {/* University + Faculty */}
            {(f.academic_status === "student" || f.academic_status === "graduate" || f.academic_status === "postgraduate") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">{tr("University", "الجامعة")}</label>
                  <input className={input} maxLength={120} placeholder={tr("e.g. Cairo University", "مثال: جامعة القاهرة")} value={f.university} onChange={(e) => setF({ ...f, university: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">{tr("Faculty / College", "الكلية")}</label>
                  <input className={input} maxLength={120} placeholder={tr("e.g. Faculty of Commerce", "مثال: كلية التجارة")} value={f.faculty} onChange={(e) => setF({ ...f, faculty: e.target.value })} />
                </div>
              </div>
            )}

            {/* National ID */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("National ID (optional)", "الرقم القومي (اختياري)")}</label>
              <input className={input} maxLength={14} type="text" inputMode="numeric" placeholder="12345678901234" value={f.national_id} onChange={(e) => setF({ ...f, national_id: e.target.value.replace(/\D/g, "").slice(0, 14) })} />
              <p className="mt-1 text-[11px] text-muted-foreground">{tr("14 digits — will be verified during onboarding.", "14 رقم — سيتم التحقق منه أثناء التسجيل.")}</p>
            </div>

            {/* Sales Experience */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Sales Experience (optional)", "خبرتك في المبيعات (اختياري)")}</label>
              <textarea className={input} rows={2} maxLength={500} placeholder={tr("Briefly describe any previous sales, marketing, or client-facing work.", "صف باختصار أي خبرة في المبيعات أو التسويق.")} value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Email *</label>
              <input className={input} required type="email" maxLength={160} placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">{tr("Password (min 8 chars) *", "كلمة السر (8 أحرف على الأقل) *")}</label>
              <input className={input} required type="password" minLength={8} placeholder="••••••••" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            </div>

            {msg && (
              <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                msgType === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}>
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{msg}</span>
              </div>
            )}
            <button disabled={busy} className="w-full rounded-full bg-navy py-3.5 font-medium text-ivory disabled:opacity-60">{tr("Join as partner", "انضم كشريك")}</button>
            <p className="text-center text-sm text-muted-foreground">{tr("Already a partner?", "شريك بالفعل؟")} <Link to="/partners/login" className="underline">{tr("Sign in", "سجّل دخول")}</Link></p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
