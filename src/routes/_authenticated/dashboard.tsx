import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, Copy, Check, LogOut, Wallet, Mail, Phone, MapPin, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccount, updateMyProfile, updateMyPayout } from "@/lib/account.functions";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/useSession";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { eur, getCountry, getProgram } from "@/lib/catalog";
import { egp, defaultCommissionFor } from "@/lib/levels";
import { ApplicationProgressTracker } from "@/components/site/ApplicationProgressTracker";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kinetix" }] }),
  component: Dashboard,
});

const input = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-beige";

function Dashboard() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(updateMyProfile);
  const savePayout = useServerFn(updateMyPayout);
  const { data, isLoading } = useQuery({ queryKey: ["account"], queryFn: fetchAccount });

  const { user } = useSession();
  const [copiedRef, setCopiedRef] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<string | null>(null);
  const [payoutDetails, setPayoutDetails] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav solid />
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <p className="text-sm font-medium text-foreground">
            {account.profile?.full_name ? `${t("welcome")}, ${account.profile.full_name}` : t("dashboard")}
          </p>
          <div className="flex items-center gap-3 text-sm">
            {isAdmin && <Link to="/admin" className="rounded-full bg-navy px-3.5 py-1.5 text-xs text-ivory hover:opacity-90">{t("adminDashboard")}</Link>}
            <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />{t("signOut")}</button>
          </div>
        </div>
      </div>
      <main className="flex-1">

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-3">
        {/* Profile */}
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">{t("myProfile")}</h2>
          <div className="mt-5 space-y-3">
            <input className={input} placeholder={t("fullName")} value={name ?? account.profile?.full_name ?? ""} onChange={(e) => setName(e.target.value)} />
            <input className={input} placeholder={t("phone")} value={phone ?? account.profile?.phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
            <button onClick={async () => { await saveProfile({ data: { full_name: name ?? undefined, phone: phone ?? undefined } }); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000); }}
              className="rounded-full bg-navy px-5 py-2.5 text-sm text-ivory">{savedMsg ? t("saved") : t("save")}</button>
          </div>
        </section>

        {/* Applications */}
        <section className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">{t("myApplications")}</h2><Link to="/apply" className="rounded-full bg-navy px-4 py-2 text-xs text-ivory">+ {t("applyNow")}</Link></div>
          {account.applications.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">{t("noApplications")} <Link to="/apply" className="underline">{t("applyNow")}</Link></p>
          ) : (
            <div className="mt-5 space-y-5">
              {(account.applications as any[]).map((a) => {
                const pr = a.programs;
                const catProg = pr?.slug ? getProgram(pr.slug)?.program : undefined;
                const c = getCountry(pr?.countries?.slug ?? catProg?.countrySlug ?? "");
                const effectiveDeposit = catProg?.deposit ?? (pr?.deposit && pr.deposit <= 250 ? pr.deposit : 196);
                const effectivePrice = catProg?.price ?? pr?.price ?? 2400;
                const due = a.payment_plan === "full" ? effectivePrice : effectiveDeposit;
                const progTitle = lang === "ar" ? pr?.title_ar || catProg?.titleAr || pr?.title_en : pr?.title_en || catProg?.title;
                const countryTitle = lang === "ar" ? pr?.countries?.name_ar || c?.nameAr : pr?.countries?.name_en || c?.name;

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
                        full_name: a.full_name || account.profile?.full_name,
                        phone: a.phone || account.profile?.phone,
                      }}
                      onDocChange={() => queryClient.invalidateQueries({ queryKey: ["account"] })}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Partner portal */}
        {partner && (
          <section className="rounded-3xl bg-navy p-6 text-ivory lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-semibold">{t("partnerPortal")}</h2>
                <Link to="/partner" className="text-xs text-beige underline hover:text-ivory transition-colors">
                  {lang === "ar" ? "فتح البوابة الكاملة ←" : "Open Full Portal →"}
                </Link>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-beige/50 px-4 py-1.5 text-sm text-beige"><Award className="h-4 w-4" strokeWidth={1.5} />{t("level")}: {partner.level}</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("promoCode")}</p>
                <button onClick={() => navigator.clipboard.writeText(partner.promo_code)} className="mt-1 flex items-center gap-2 font-display text-2xl text-beige">{partner.promo_code}<Copy className="h-4 w-4" strokeWidth={1.5} /></button></div>
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("fixedCommission")}</p><p className="mt-1 font-display text-2xl text-beige">{egp(defaultCommissionFor(partner.level, 0))}</p></div>
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("totalEarned")}</p><p className="mt-1 font-display text-2xl text-beige">{egp(earned)}</p></div>
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("pending")}</p><p className="mt-1 font-display text-2xl text-beige">{egp(pendingAmt)}</p></div>
            </div>

            {/* Complete Partner Profile & Referral Details */}
            <div className="mt-6 rounded-2xl bg-navy-soft/80 p-5 border border-ivory/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ivory/10 pb-3">
                <p className="font-display font-semibold text-sm text-beige flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  {lang === "ar" ? "بيانات الشريك المسجلة ورابط الإحالة" : "Registered Partner Profile & Referral Link"}
                </p>
                <span className="rounded-full bg-navy px-3 py-1 text-xs text-ivory/80">
                  {lang === "ar" ? "الحالة: " : "Status: "}{partner.status}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                <div>
                  <span className="text-ivory/50 block text-[10px] uppercase font-semibold">{lang === "ar" ? "الاسم بالكامل" : "Full Name"}</span>
                  <span className="font-bold text-ivory text-sm">{account.profile?.full_name || "—"}</span>
                </div>
                <div>
                  <span className="text-ivory/50 block text-[10px] uppercase font-semibold">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</span>
                  <span className="font-medium text-beige">{user?.email || "—"}</span>
                </div>
                <div>
                  <span className="text-ivory/50 block text-[10px] uppercase font-semibold">{lang === "ar" ? "رقم الهاتف / واتساب" : "Phone"}</span>
                  <span className="text-ivory">{account.profile?.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-ivory/50 block text-[10px] uppercase font-semibold">{lang === "ar" ? "المدينة" : "City"}</span>
                  <span className="text-ivory">{partner.city || "—"}</span>
                </div>
              </div>

              {/* Referral Link Quick Copy */}
              <div className="pt-2">
                <span className="text-ivory/50 block text-[10px] uppercase font-semibold mb-1.5">{lang === "ar" ? "رابط الإحالة الخاص بك" : "Your Referral Link"}</span>
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
                    className="shrink-0 rounded-xl bg-beige px-4 py-2 text-xs font-semibold text-navy hover:bg-beige/90 transition-colors flex items-center gap-1.5">
                    {copiedRef ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedRef ? (lang === "ar" ? "تم النسخ" : "Copied") : (lang === "ar" ? "نسخ الرابط" : "Copy Link")}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-ivory/80"><Wallet className="h-4 w-4" strokeWidth={1.5} />{t("payoutMethod")}</h3>
                <div className="mt-3 space-y-3">
                  <input className={`${input} bg-navy-soft text-ivory placeholder:text-ivory/40`} placeholder={t("payoutMethod")} value={payoutMethod ?? partner.payout_method ?? ""} onChange={(e) => setPayoutMethod(e.target.value)} />
                  <input className={`${input} bg-navy-soft text-ivory placeholder:text-ivory/40`} placeholder={t("payoutDetails")} value={payoutDetails ?? partner.payout_details ?? ""} onChange={(e) => setPayoutDetails(e.target.value)} />
                  <button onClick={() => savePayout({ data: { payout_method: payoutMethod ?? undefined, payout_details: payoutDetails ?? undefined } })} className="rounded-full bg-beige px-5 py-2.5 text-sm font-medium text-navy">{t("save")}</button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-ivory/80">{t("clients")} ({account.referred.length})</h3>
                <div className="mt-3 divide-y divide-ivory/10 text-sm">
                  {(account.referred as any[]).slice(0, 6).map((r) => (
                    <div key={r.id} className="flex justify-between py-2.5"><span>{lang === "ar" ? r.programs?.title_ar || r.programs?.title_en : r.programs?.title_en}</span><span className="text-ivory/60">{r.status}</span></div>
                  ))}
                  {account.referred.length === 0 && <p className="py-2 text-ivory/50">—</p>}
                </div>
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

