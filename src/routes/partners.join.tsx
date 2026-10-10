import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Gift, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/SiteChrome";
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

const input = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-beige";

function JoinPartner() {
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const navigate = useNavigate();
  const [f, setF] = useState({ full_name: "", phone: "", city: "", experience: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const { data, error } = await supabase.auth.signUp({
      email: f.email.trim(), password: f.password,
      options: {
        emailRedirectTo: `${window.location.origin}/partner`,
        data: { intent: "partner", full_name: f.full_name.trim().slice(0, 120), phone: f.phone.trim().slice(0, 40), city: f.city.trim().slice(0, 80), experience: f.experience.trim().slice(0, 500) },
      },
    });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    if (data.session) navigate({ to: "/partner" });
    else setMsg(tr("Check your email to confirm your account, then sign in — your partner portal will be ready.", "افتح إيميلك وأكّد الحساب، وبعدها سجّل دخول — بوابة الشريك هتكون جاهزة."));
  };

  return (
    <main className="min-h-screen bg-navy text-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2 lg:py-20">
        <div>
          <Logo />
          <p className="eyebrow mt-12 text-beige">{tr("Sales Partner Program", "برنامج شركاء المبيعات")}</p>
          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{tr("Bring clients. Level up. Earn more.", "جيب عملاء. اطلع مستوى. اكسب أكتر.")}</h1>
          <ul className="mt-8 space-y-5 text-ivory/80">
            <li className="flex gap-3"><Gift className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />{tr("Your own promo code and referral link", "كود خصم ورابط إحالة خاص بيك")}</li>
            <li className="flex gap-3"><Award className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />{tr("Levels from Starter to Platinum — higher level, bigger client discount", "مستويات من مبتدئ لبلاتيني — كل ما تعلى، خصم عملائك يكبر")}</li>
            <li className="flex gap-3"><Wallet className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />{tr("Track leads, applications and commissions live", "تابع عملائك وطلباتهم وعمولتك لحظة بلحظة")}</li>
          </ul>
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-3xl bg-ivory p-6 text-navy md:p-8">
          <h2 className="font-display text-2xl font-semibold">{tr("Partner registration", "تسجيل شريك")}</h2>
          <input className={input} required maxLength={120} placeholder={tr("Full name", "الاسم بالكامل")} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
          <input className={input} required type="tel" maxLength={40} placeholder={tr("Phone / WhatsApp", "الموبايل / واتساب")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <input className={input} maxLength={80} placeholder={tr("City", "المدينة")} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          <textarea className={input} rows={2} maxLength={500} placeholder={tr("Sales experience (optional)", "خبرتك في المبيعات (اختياري)")} value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} />
          <input className={input} required type="email" maxLength={160} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className={input} required type="password" minLength={6} placeholder={tr("Password", "كلمة السر")} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          <button disabled={busy} className="w-full rounded-full bg-navy py-3.5 font-medium text-ivory disabled:opacity-60">{tr("Join as partner", "انضم كشريك")}</button>
          <p className="text-center text-sm text-muted-foreground">{tr("Already a partner?", "شريك بالفعل؟")} <Link to="/auth" className="underline">{tr("Sign in", "سجّل دخول")}</Link></p>
        </form>
      </div>
    </main>
  );
}
