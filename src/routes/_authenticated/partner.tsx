import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, Copy, Check, LogOut, Target, Users, TrendingUp, Wallet, Clock, Plus, FileText, DollarSign, UserCheck, Video, FileBadge, Plane, Phone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPartnerPortal, registerPartner, addLead, setLeadStatus } from "@/lib/partner.functions";
import { updateMyPayout } from "@/lib/account.functions";
import { levelFor, egp, type Level } from "@/lib/levels";
import { countries } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";
import { Nav, Footer } from "@/components/site/SiteChrome";

// Stage definitions (must match ApplicationProgressTracker)
const STAGE_EN = ["Application & Docs", "Deposit", "Pre-Interview", "Interview", "Permit & Visa", "Ready to Travel"];
const STAGE_AR = ["تقديم ومستندات", "ديبوزت", "بري انترفيو", "انترفيو", "التصريح والتأشيرة", "جاهز للسفر"];
const STAGE_ICONS = [FileText, DollarSign, UserCheck, Video, FileBadge, Plane];
const STAGE_COLORS = [
  "bg-slate-400",   // 0 - submitted
  "bg-amber-500",  // 1 - deposit
  "bg-blue-500",   // 2 - pre-interview
  "bg-violet-500", // 3 - interview
  "bg-orange-500", // 4 - permit
  "bg-emerald-500",// 5 - ready
];

function ClientStageBar({ stage, depositPaid, ar }: { stage: number; depositPaid: boolean; ar: boolean }) {
  const effective = depositPaid && stage < 1 ? 1 : Math.max(0, Math.min(5, stage));
  const stages = ar ? STAGE_AR : STAGE_EN;
  return (
    <div className="mt-3">
      <div className="flex items-center gap-0.5">
        {stages.map((_, i) => {
          const done = i < effective;
          const current = i === effective;
          const Icon = STAGE_ICONS[i]!;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all ${
                done ? "bg-navy" : current ? STAGE_COLORS[i] : "bg-border"
              }`} />
              <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                done ? "bg-navy" : current ? STAGE_COLORS[i]! + " text-white" : "bg-border"
              }`}>
                {done ? (
                  <Check className="h-3 w-3 text-ivory" strokeWidth={2.5} />
                ) : (
                  <Icon className={`h-2.5 w-2.5 ${current ? "text-white" : "text-muted-foreground"}`} strokeWidth={2} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">{stages[0]}</p>
        <p className={`text-[10px] font-semibold ${STAGE_COLORS[effective]?.replace("bg-", "text-") || "text-muted-foreground"}`}>
          {stages[effective]}
        </p>
        <p className="text-[10px] text-muted-foreground">{stages[5]}</p>
      </div>
    </div>
  );
}

function ReferredClientsSection({ apps, comms, ar, tr, egp }: { apps: any[]; comms: any[]; ar: boolean; tr: (en: string, a: string) => string; egp: (n: number) => string }) {
  return (
    <div className="space-y-4 lg:col-span-1">
      {/* Referred Clients */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">{tr("Referred Clients", "عملائي المُحالين")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{tr("People who applied using your promo code", "الأشخاص اللي قدموا بكودك")}</p>
          </div>
          <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">{apps.length}</span>
        </div>

        {apps.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <Users className="mx-auto h-8 w-8 mb-2 opacity-30" strokeWidth={1.5} />
            <p className="text-sm">{tr("No applications yet with your promo code", "لا يوجد طلبات بكودك بعد")}</p>
          </div>
        )}

        <div className="divide-y divide-border space-y-0">
          {apps.map((a) => {
            const progTitle = ar ? (a.programs?.title_ar || a.programs?.title_en) : a.programs?.title_en;
            const country = ar ? a.programs?.countries?.name_ar : a.programs?.countries?.name_en;
            const track = a.programs?.track === "student" ? tr("Student", "طالب") : tr("Graduate", "خريج");
            const effective = a.deposit_paid && a.stage < 1 ? 1 : Math.max(0, Math.min(5, a.stage ?? 0));
            const stageLabel = ar ? STAGE_AR[effective] : STAGE_EN[effective];
            const dateStr = a.created_at ? new Date(a.created_at).toLocaleDateString(ar ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
            return (
              <div key={a.id} className="py-4 first:pt-0 last:pb-0">
                {/* Client header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{a.full_name || "—"}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {a.phone && (
                        <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                          <Phone className="h-3 w-3" strokeWidth={1.5} />{a.phone}
                        </a>
                      )}
                      {dateStr && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" strokeWidth={1.5} />{dateStr}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Stage badge */}
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${
                    effective === 5 ? "bg-emerald-500" :
                    effective === 4 ? "bg-orange-500" :
                    effective === 3 ? "bg-violet-500" :
                    effective === 2 ? "bg-blue-500" :
                    effective === 1 ? "bg-amber-500" :
                    "bg-slate-400"
                  }`}>
                    {stageLabel}
                  </span>
                </div>

                {/* Program + country */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {country && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium">{country}</span>}
                  {progTitle && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px]">{progTitle}</span>}
                  <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-[11px] font-medium text-navy">{track}</span>
                  {a.deposit_paid && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      ✓ {tr("Deposit paid", "دفع المقدم")}
                    </span>
                  )}
                </div>

                {/* Stage progress bar */}
                <ClientStageBar stage={a.stage ?? 0} depositPaid={Boolean(a.deposit_paid)} ar={ar} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Commissions */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">{tr("Commissions", "العمولات")}</h2>
        <div className="mt-3 divide-y divide-border text-sm">
          {comms.map((c) => (
            <div key={c.id} className="flex justify-between py-2.5">
              <div>
                <span className="font-semibold">{egp(c.amount)}</span>
                {c.note && <span className="ms-2 text-xs text-muted-foreground">{c.note}</span>}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${
                c.status === "paid" ? "bg-emerald-100 text-emerald-700 font-semibold" :
                c.status === "approved" ? "bg-blue-100 text-blue-700" :
                "bg-secondary text-muted-foreground"
              }`}>{c.status}</span>
            </div>
          ))}
          {comms.length === 0 && <p className="py-3 text-muted-foreground">—</p>}
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/partner")({
  head: () => ({ meta: [{ title: "Sales Partner Portal — Kinetix" }, { name: "description", content: "Track your leads, level and commissions." }] }),
  component: PartnerPortal,
});

const input = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-beige";
const leadStatuses = ["new", "qualified", "converted", "lost"] as const;

function PartnerPortal() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const tr = (en: string, a: string) => (ar ? a : en);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchPortal = useServerFn(getPartnerPortal);
  const register = useServerFn(registerPartner);
  const add = useServerFn(addLead);
  const setStatus = useServerFn(setLeadStatus);
  const savePayout = useServerFn(updateMyPayout);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["partner"], queryFn: fetchPortal });
  const tried = useRef(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [lead, setLead] = useState({ full_name: "", phone: "", email: "", country_interest: "", track: "", notes: "" });
  const [leadErr, setLeadErr] = useState<string | null>(null);
  const [payout, setPayout] = useState<{ m: string | null; d: string | null }>({ m: null, d: null });

  // Auto-complete registration for users who signed up through the partner page
  useEffect(() => {
    if (!data || data.partner || tried.current) return;
    tried.current = true;
    supabase.auth.getUser().then(async ({ data: u }) => {
      const m = (u.user?.user_metadata ?? {}) as Record<string, string>;
      if (m["intent"] === "partner") { await register({ data: { full_name: m["full_name"], phone: m["phone"], city: m["city"], experience: m["experience"] } }); refetch(); }
    });
  }, [data]);

  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); };

  if (isLoading || !data) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">…</div>;

  const header = (
    <>
      <Nav solid />
      <div className="border-b border-border bg-navy text-ivory">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-beige">
            {tr("Sales Partner Portal", "بوابة شركاء المبيعات")}
          </span>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-ivory/70 hover:text-beige"><LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />{tr("Sign out", "خروج")}</button>
        </div>
      </div>
    </>
  );

  if (!data.partner) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {header}
        <main className="flex-1">
          <div className="mx-auto max-w-md px-5 py-16 text-center">
            <h1 className="font-display text-3xl font-semibold">{tr("Become a Sales Partner", "انضم كشريك مبيعات")}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{tr("Activate your partner account to get your promo code.", "فعّل حساب الشريك عشان تاخد كود الخصم بتاعك.")}</p>
            <button onClick={async () => { await register({ data: {} }); refetch(); }} className="mt-6 rounded-full bg-navy px-8 py-3.5 text-ivory">{tr("Register as partner", "سجّل كشريك")}</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  const d = data as any;
  const p = d.partner;
  const levels = d.levels as Level[];
  const leads = d.leads as any[];
  const apps = d.applications as any[];
  const comms = d.commissions as any[];
  const score = leads.length + apps.length;
  const { current, next } = levelFor(levels, score);
  const qualified = leads.filter((l) => l.status === "qualified" || l.status === "converted").length;
  const successful = apps.filter((a) => a.status === "approved" || a.stage >= 5).length;
  const sum = (f: (c: any) => boolean) => comms.filter(f).reduce((a, c) => a + c.amount, 0);
  const paid = sum((c) => c.status === "paid");
  const pending = sum((c) => c.status === "pending" || c.status === "approved");
  const link = typeof window !== "undefined" ? `${window.location.origin}/?ref=${p.promo_code}` : "";
  const copy = (v: string) => { navigator.clipboard.writeText(v); setCopied(v); setTimeout(() => setCopied(null), 1500); };
  const lvName = (l?: Level) => (l ? (ar ? l.name_ar || l.name : l.name) : "—");
  const progressPct = next ? Math.min(100, ((score - (current?.min_leads ?? 0)) / (next.min_leads - (current?.min_leads ?? 0))) * 100) : 100;

  const stats: [string, string | number, typeof Users][] = [
    [tr("My Leads", "العملاء المحتملين"), score, Users],
    [tr("Qualified Leads", "عملاء مؤهلين"), qualified, Target],
    [tr("Applications", "الطلبات"), apps.length, TrendingUp],
    [tr("Successful", "طلبات ناجحة"), successful, Award],
    [tr("Total Commission", "إجمالي العمولة"), egp(paid + pending), Wallet],
    [tr("Pending Commission", "عمولة معلّقة"), egp(pending), Clock],
    [tr("Paid Commission", "عمولة مدفوعة"), egp(paid), Check],
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {header}
      <main className="flex-1">
      <section className="bg-navy pb-10 text-ivory">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6 pt-6">
            <div>
              <p className="eyebrow text-beige">{tr("Sales Partner", "شريك مبيعات")}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{d.profile?.full_name ?? "—"}</h1>
              <button onClick={() => copy(p.promo_code)} className="mt-3 inline-flex items-center gap-2 rounded-full border border-beige/50 px-4 py-1.5 font-mono text-beige">
                {p.promo_code} {copied === p.promo_code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-navy-soft px-5 py-3">
              <Award className="h-6 w-6 text-beige shrink-0" strokeWidth={1.5} />
              <div><p className="text-xs text-ivory/60">{tr("Level", "المستوى")}</p><p className="font-display text-xl text-beige">{lvName(current)}</p></div>
              <div className="ms-4 border-s border-ivory/10 ps-4">
                <p className="text-xs text-ivory/60">{tr("Fixed Commission", "العمولة الثابتة")}</p>
                <p className="font-display text-xl text-beige">{egp(current?.commission_amount ?? 9350)}</p>
              </div>
              <div className="ms-4 border-s border-ivory/10 ps-4"><p className="text-xs text-ivory/60">{tr("Client discount", "خصم العميل")}</p><p className="font-display text-xl">{current?.client_discount ?? 0}%</p></div>
            </div>
          </div>
          {p.status !== "active" && (
            <div className="mt-6 rounded-2xl border border-beige/40 bg-navy-soft p-4 text-sm">
              {p.status === "pending" ? tr("Your partner account is under review. Your promo code works once an admin approves it.", "حسابك قيد المراجعة. الكود هيشتغل بعد موافقة الإدارة.") : tr("Your partner account is suspended. Contact Kinetix.", "حسابك موقوف. تواصل مع Kinetix.")}
            </div>
          )}
          <div className="mt-6 rounded-2xl bg-navy-soft p-5">
            <p className="flex items-center gap-2 text-sm text-ivory/70"><Target className="h-4 w-4 text-beige" strokeWidth={1.5} />{tr("Next Level", "المستوى التالي")}</p>
            {next ? (
              <>
                <p className="mt-2 font-display text-2xl">{score} / {next.min_leads} {tr("Leads", "عميل")}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy"><div className="h-full rounded-full bg-beige transition-all" style={{ width: `${progressPct}%` }} /></div>
                <p className="mt-2 text-sm text-ivory/70">{tr(`${next.min_leads - score} more leads to unlock ${next.name} (${egp(next.commission_amount ?? 10250)} fixed commission + ${next.client_discount}% client discount)`, `باقي ${next.min_leads - score} عميل وتوصل لمستوى ${lvName(next)} (عمولة ${egp(next.commission_amount ?? 10250)} + خصم ${next.client_discount}% لعملائك)`)}</p>
              </>
            ) : <p className="mt-2 font-display text-2xl text-beige">{tr("Top level reached", "وصلت لأعلى مستوى")}</p>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {stats.map(([l, v, Icon]) => (
            <div key={l} className="rounded-2xl border border-border bg-card p-4">
              <Icon className="h-4 w-4 text-beige" strokeWidth={1.5} />
              <p className="mt-3 text-xs text-muted-foreground">{l}</p>
              <p className="mt-1 font-display text-xl font-semibold">{v}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-medium">{tr("Your referral link", "رابط الإحالة بتاعك")}</p>
          <div className="mt-2 flex gap-2">
            <input readOnly value={link} className={`${input} font-mono`} />
            <button onClick={() => copy(link)} className="shrink-0 rounded-full bg-navy px-4 text-sm text-ivory">{copied === link ? "✓" : tr("Copy", "نسخ")}</button>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">{tr("Partner Levels & Guaranteed Commission", "مستويات الشركاء والعمولة الثابتة")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tr("Every successful referred client earns you a guaranteed fixed commission in EGP that increases with every level.", "كل عميل يسجل ويدفع عبر كودك يكسبك عمولة ثابتة بالجنيه تزيد مع ارتقائك في المستويات.")}
              </p>
            </div>
            <span className="rounded-full bg-beige/20 px-3.5 py-1 text-xs font-semibold text-beige">
              {tr("Starts at 9,350 EGP", "تبدأ من 9,350 جنيه")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {levels.map((l) => {
              const isCurr = l.id === current?.id;
              const commAmt = l.commission_amount ?? 9350;
              return (
                <div key={l.id} className={`relative rounded-2xl p-4 transition-all ${isCurr ? "bg-navy text-ivory ring-2 ring-beige shadow-lg" : "bg-secondary/70"}`}>
                  {isCurr && (
                    <span className="absolute -top-2.5 end-3 rounded-full bg-beige px-2 py-0.5 text-[10px] font-bold text-navy uppercase tracking-wider">
                      {tr("Current", "مستواك")}
                    </span>
                  )}
                  <p className="font-display font-semibold text-base">{lvName(l)}</p>
                  <p className={`text-xs mt-0.5 ${isCurr ? "text-ivory/70" : "text-muted-foreground"}`}>{l.min_leads}+ {tr("leads", "عميل")}</p>
                  <div className="mt-3 space-y-1.5">
                    <div className={`rounded-xl p-2 text-center ${isCurr ? "bg-white/10" : "bg-background/80"}`}>
                      <p className={`text-[10px] uppercase font-medium ${isCurr ? "text-ivory/60" : "text-muted-foreground"}`}>{tr("Fixed Commission", "عمولة ثابتة")}</p>
                      <p className={`font-display text-base font-bold ${isCurr ? "text-beige" : "text-foreground"}`}>
                        {egp(commAmt)}
                      </p>
                    </div>
                    <p className={`text-xs text-center pt-0.5 ${isCurr ? "text-ivory/80" : "text-muted-foreground"}`}>{tr("Client Discount", "خصم العميل")} {l.client_discount}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">{tr("My Leads", "العملاء المحتملين")}</h2>
            {p.status === "active" && (
              <form className="mt-4 grid grid-cols-2 gap-2" onSubmit={async (e) => {
                e.preventDefault(); setLeadErr(null);
                try { await add({ data: lead }); setLead({ full_name: "", phone: "", email: "", country_interest: "", track: "", notes: "" }); refetch(); }
                catch (er) { setLeadErr((er as Error).message); }
              }}>
                <input className={`${input} col-span-2`} required maxLength={120} placeholder={tr("Client name *", "اسم العميل *")} value={lead.full_name} onChange={(e) => setLead({ ...lead, full_name: e.target.value })} />
                <input className={input} maxLength={40} placeholder={tr("Phone", "الهاتف")} value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                <input className={input} type="email" maxLength={160} placeholder="Email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                <select className={input} value={lead.country_interest} onChange={(e) => setLead({ ...lead, country_interest: e.target.value })}>
                  <option value="">{tr("Country", "الدولة")}</option>
                  {countries.map((c) => <option key={c.slug} value={c.slug}>{ar ? c.nameAr : c.name}</option>)}
                </select>
                <select className={input} value={lead.track} onChange={(e) => setLead({ ...lead, track: e.target.value })}>
                  <option value="">{tr("Track", "المسار")}</option>
                  <option value="student">{tr("Students", "طلاب")}</option><option value="graduate">{tr("Graduates", "خريجين")}</option>
                </select>
                {leadErr && <p className="col-span-2 text-xs text-destructive">{leadErr}</p>}
                <button className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-navy py-2.5 text-sm text-ivory"><Plus className="h-4 w-4" />{tr("Add lead", "إضافة عميل")}</button>
              </form>
            )}
            <div className="mt-4 divide-y divide-border text-sm">
              {leads.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0"><p className="truncate font-medium">{l.full_name}</p><p className="text-xs text-muted-foreground">{l.phone ?? ""} {l.country_interest ? `· ${l.country_interest}` : ""}</p></div>
                  <select value={l.status} onChange={async (e) => { await setStatus({ data: { id: l.id, status: e.target.value } }); refetch(); }} className="rounded-full border border-input bg-background px-2 py-1 text-xs">
                    {leadStatuses.map((s) => <option key={s} value={s}>{({ new: tr("New", "جديد"), qualified: tr("Qualified", "مؤهل"), converted: tr("Converted", "قدّم"), lost: tr("Lost", "مش مهتم") })[s]}</option>)}
                  </select>
                </div>
              ))}
              {leads.length === 0 && <p className="py-3 text-muted-foreground">—</p>}
            </div>
          </section>

          <ReferredClientsSection apps={apps} comms={comms} ar={ar} tr={tr} egp={egp} />
        </div>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">{tr("Payout details", "بيانات استلام العمولة")}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <input className={input} maxLength={60} placeholder={tr("Method (InstaPay, Vodafone Cash, bank)", "الطريقة (انستاباي، فودافون كاش، بنك)")} value={payout.m ?? p.payout_method ?? ""} onChange={(e) => setPayout({ ...payout, m: e.target.value })} />
            <input className={input} maxLength={200} placeholder={tr("Number / account details", "الرقم / بيانات الحساب")} value={payout.d ?? p.payout_details ?? ""} onChange={(e) => setPayout({ ...payout, d: e.target.value })} />
            <button onClick={async () => { await savePayout({ data: { payout_method: payout.m ?? undefined, payout_details: payout.d ?? undefined } }); refetch(); }} className="rounded-full bg-navy px-6 py-2.5 text-sm text-ivory">{tr("Save", "حفظ")}</button>
          </div>
        </section>
        <Link to="/dashboard" className="block text-center text-sm text-muted-foreground underline">{tr("Customer dashboard", "لوحة العميل")}</Link>
      </div>
    </main>
    <Footer />
  </div>
  );
}

