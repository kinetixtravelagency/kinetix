import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, Copy, LogOut, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccount, updateMyProfile, updateMyPayout } from "@/lib/account.functions";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/site/SiteChrome";
import { eur, getCountry } from "@/lib/catalog";
import { DocUploader, StageTracker } from "@/components/site/DocUploader";

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
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <div className="flex items-center gap-3 text-sm">
            {isAdmin && <Link to="/admin" className="rounded-full bg-navy px-4 py-2 text-ivory">{t("adminDashboard")}</Link>}
            <button onClick={signOut} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" strokeWidth={1.5} />{t("signOut")}</button>
          </div>
        </div>
      </header>

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
                const c = getCountry(pr?.countries?.slug ?? "");
                const due = a.payment_plan === "full" ? pr?.price : pr?.deposit;
                return (
                  <div key={a.id} className="rounded-2xl border border-border p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-semibold">{lang === "ar" ? pr?.countries?.name_ar : pr?.countries?.name_en} · {pr?.track === "student" ? t("trackStudent") : t("trackGraduate")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()} · {a.payment_plan === "full" ? t("payFull") : `${t("payInst")} ${a.installments} ${t("months")}`}</p>
                      </div>
                      {a.deposit_paid && <span className="rounded-full bg-navy px-3 py-1 text-xs text-ivory">{t("depositPaid")}</span>}
                    </div>
                    <div className="mt-5"><StageTracker stage={a.stage} depositPaid={a.deposit_paid} /></div>
                    {!a.deposit_paid && (
                      <div className="mt-5 rounded-2xl bg-beige-soft p-4 text-sm">
                        <p className="font-medium">{t("depositAwait")} — {eur(due ?? 0)}</p>
                        <p className="text-muted-foreground">{t("depositAwaitSub")}</p>
                      </div>
                    )}
                    <h3 className="mb-3 mt-5 text-sm font-medium">{t("documentsWord")}</h3>
                    <DocUploader appId={a.id} docTypes={c?.documents ?? []} existing={a.application_documents ?? []} onChange={() => queryClient.invalidateQueries({ queryKey: ["account"] })} />
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
              <h2 className="font-display text-2xl font-semibold">{t("partnerPortal")}</h2>
              <span className="inline-flex items-center gap-2 rounded-full border border-beige/50 px-4 py-1.5 text-sm text-beige"><Award className="h-4 w-4" strokeWidth={1.5} />{t("level")}: {partner.level}</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("promoCode")}</p>
                <button onClick={() => navigator.clipboard.writeText(partner.promo_code)} className="mt-1 flex items-center gap-2 font-display text-2xl text-beige">{partner.promo_code}<Copy className="h-4 w-4" strokeWidth={1.5} /></button></div>
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("commissionRate")}</p><p className="mt-1 font-display text-2xl text-beige">{partner.commission_rate}%</p></div>
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("totalEarned")}</p><p className="mt-1 font-display text-2xl text-beige">{eur(earned)}</p></div>
              <div className="rounded-2xl bg-navy-soft p-5"><p className="text-xs text-ivory/60">{t("pending")}</p><p className="mt-1 font-display text-2xl text-beige">{eur(pendingAmt)}</p></div>
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
  );
}
