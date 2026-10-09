import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getAdminFull, adminUpdateApplicationStatus, adminUpdateProgramPrice,
  adminCreateProgram, adminUpdateProgram, adminDeleteProgram, adminSyncCatalogPrograms,
  adminUpdateApplication, adminSetDocumentStatus,
  adminManagePartner, adminAddCommission, adminSetCommission,
  adminUpdateLevel, adminUpdateCountry,
} from "@/lib/account.functions";
import { adminDeletePartner, adminSetWithdrawalStatus } from "@/lib/partner.functions";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/site/SiteChrome";
import { eur } from "@/lib/catalog";
import {
  Users, Globe, Briefcase, LayoutDashboard, Award, Wallet,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock,
  TrendingUp, Plus, Pencil, Save, X, Eye, ShieldCheck, Ban, AlertCircle, MessageSquare,
  Mail, Phone, MapPin, Calendar, Copy, Check, ExternalLink, Link2, Trash2, RefreshCw,
  Sparkles, Filter, Layers, CheckSquare, Loader2, CreditCard, BookOpen, Send, User,
} from "lucide-react";
import { AdminChatTab } from "@/components/admin/AdminChatTab";
import { AdminMaterialsTab } from "@/components/admin/AdminMaterialsTab";
import { AdminBroadcastTab } from "@/components/admin/AdminBroadcastTab";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Kinetix" }] }),
  component: Admin,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <ShieldCheck className="h-10 w-10 text-muted-foreground" strokeWidth={1} />
      <p className="font-display text-2xl">{(error as Error).message === "Forbidden" ? "Admins only" : "Something went wrong"}</p>
      <Link to="/dashboard" className="text-sm text-muted-foreground underline">Back to dashboard</Link>
    </div>
  ),
});

type Tab = "overview" | "chat" | "applications" | "programs" | "countries" | "partners" | "partner_settings" | "materials" | "broadcast";

const inp = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-beige";
const pill = "rounded-full px-3 py-1 text-xs font-medium";
const egp = (n: number) => `${Math.round(n).toLocaleString("en-US")} EGP`;

function statusColor(s: string) {
  const m: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    approved: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    in_review: "bg-blue-100 text-blue-800",
    submitted: "bg-blue-100 text-blue-800",
    documents: "bg-purple-100 text-purple-800",
    suspended: "bg-red-100 text-red-800",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-navy text-ivory",
    cancelled: "bg-gray-100 text-gray-500",
    new: "bg-sky-100 text-sky-800",
    qualified: "bg-green-100 text-green-800",
    converted: "bg-emerald-100 text-emerald-800",
    lost: "bg-gray-100 text-gray-500",
  };
  return m[s] ?? "bg-secondary text-foreground";
}

function Admin() {
  const { t } = useLang();
  const qc = useQueryClient();
  const fetchAdmin = useServerFn(getAdminFull);
  const setComm = useServerFn(adminSetCommission);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-full"], queryFn: fetchAdmin, retry: false });
  const [tab, setTab] = useState<Tab>("overview");
  const refetch = () => qc.invalidateQueries({ queryKey: ["admin-full"] });

  const tabs: [Tab, string, typeof Globe][] = [
    ["overview", "Overview", LayoutDashboard],
    ["chat", "Live Chat", MessageSquare],
    ["applications", "Applications", Briefcase],
    ["programs", "Programs", TrendingUp],
    ["countries", "Countries", Globe],
    ["partners", "Partners", Users],
    ["partner_settings", "Partner Settings", Award],
    ["materials", "Materials", BookOpen],
    ["broadcast", "Broadcast", Send],
  ];

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground animate-pulse">Loading…</div>;
  if (error || !data) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="font-display text-2xl">Admins only</p>
      <Link to="/dashboard" className="text-sm underline">Back</Link>
    </div>
  );

  const d = data as any;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-navy text-ivory shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <Logo className="text-ivory" />
            <span className="hidden rounded-full bg-beige/20 px-2 py-0.5 text-xs text-beige sm:block">Admin</span>
          </div>
          <Link to="/dashboard" className="text-sm text-ivory/60 hover:text-beige">{t("dashboard")}</Link>
        </div>
        {/* Tabs */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 pb-2 scrollbar-hide">
          {tabs.map(([k, l, Icon]) => (
            <button key={k} id={`admin-tab-${k}`} onClick={() => setTab(k)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${tab === k ? "bg-beige text-navy" : "text-ivory/60 hover:text-ivory"}`}>
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />{l}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Total Applications", d.applications.length, Briefcase, "bg-blue-50 text-blue-700"],
                ["Total Partners", d.partners.length, Users, "bg-purple-50 text-purple-700"],
                ["Active Partners", d.partners.filter((p: any) => p.status === "active").length, ShieldCheck, "bg-emerald-50 text-emerald-700"],
                ["Countries", d.countries.length, Globe, "bg-amber-50 text-amber-700"],
              ].map(([l, n, Icon, cls]) => (
                <div key={l as string} className="rounded-3xl border border-border bg-card p-6">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${cls}`}>
                    {/* @ts-ignore */}
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{l as string}</p>
                  <p className="mt-1 font-display text-4xl font-semibold">{n as number}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Total Commission (Paid)", egp(d.commissions.filter((c: any) => c.status === "paid").reduce((a: number, c: any) => a + c.amount, 0))],
                ["Pending Commission", egp(d.commissions.filter((c: any) => c.status === "pending").reduce((a: number, c: any) => a + c.amount, 0))],
                ["Approved not Paid", egp(d.commissions.filter((c: any) => c.status === "approved").reduce((a: number, c: any) => a + c.amount, 0))],
              ].map(([l, v]) => (
                <div key={l} className="rounded-3xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">{l}</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-beige">{v}</p>
                </div>
              ))}
            </div>

            {/* Payout Requests from Partners */}
            {(() => {
              const payoutReqs = d.commissions.filter((c: any) =>
                (c.note?.includes("[🚨 طلب سحب") || c.note?.includes("طلب سحب")) &&
                (c.status === "pending" || c.status === "approved")
              );
              if (payoutReqs.length === 0) return null;
              return (
                <div className="rounded-3xl border-2 border-amber-500/50 bg-amber-500/10 p-6 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="h-6 w-6 text-amber-600 animate-pulse" />
                      <div>
                        <h2 className="font-display text-lg font-bold text-amber-950 dark:text-amber-200">
                          🚨 طلبات سحب أرباح جديدة من الشركاء ({payoutReqs.length})
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          شركاء مبيعات طلبوا سحب عمولاتهم — يرجى التحويل ثم تأكيد العملية
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setTab("partner_settings")} className="text-xs font-semibold text-amber-800 dark:text-amber-300 underline">
                      عرض جدول العمولات ←
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {payoutReqs.map((c: any) => (
                      <div key={c.id} className="rounded-2xl border border-amber-400/60 bg-card p-4 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{(c.partners as any)?.profiles?.full_name ?? "Partner"}</span>
                          <span className="font-mono text-base font-bold text-beige">{egp(c.amount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-secondary/50 p-2.5 rounded-xl border border-border">
                          {c.note}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                          <button
                            onClick={async () => {
                              await setComm({ data: { id: c.id, status: "paid" } });
                              refetch();
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
                          >
                            <Check className="h-3.5 w-3.5" />
                            تم التحويل (Mark Paid)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Application statuses breakdown */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Applications by Status</h2>
              <div className="flex flex-wrap gap-3">
                {["submitted", "in_review", "documents", "approved", "rejected"].map(s => {
                  const count = d.applications.filter((a: any) => a.status === s).length;
                  return <div key={s} className={`rounded-2xl px-4 py-3 ${statusColor(s)}`}>
                    <p className="text-xs opacity-70">{s}</p>
                    <p className="mt-1 font-display text-2xl font-semibold">{count}</p>
                  </div>;
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE CHAT ── */}
        {tab === "chat" && <AdminChatTab />}

        {/* ── APPLICATIONS ── */}
        {tab === "applications" && (
          <ApplicationsTab apps={d.applications} onChange={refetch} />
        )}

        {/* ── PROGRAMS ── */}
        {tab === "programs" && (
          <ProgramsTab programs={d.programs} countries={d.countries} onChange={refetch} />
        )}

        {/* ── COUNTRIES ── */}
        {tab === "countries" && (
          <CountriesTab countries={d.countries} programs={d.programs} onChange={refetch} />
        )}

        {/* ── PARTNERS ── */}
        {tab === "partners" && (
          <PartnersTab partners={d.partners} levels={d.levels} withdrawals={d.withdrawals || []} onChange={refetch} />
        )}

        {/* ── PARTNER SETTINGS (UNIFIED) ── */}
        {tab === "partner_settings" && (
          <PartnerSettingsTab levels={d.levels} commissions={d.commissions} onChange={refetch} />
        )}

        {/* ── MATERIALS ── */}
        {tab === "materials" && <AdminMaterialsTab />}

        {/* ── BROADCAST ── */}
        {tab === "broadcast" && <AdminBroadcastTab partners={d.partners || []} />}
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════
   APPLICATIONS TAB
═══════════════════════════════════════ */
function ApplicationsTab({ apps, onChange }: { apps: any[]; onChange: () => void }) {
  const setStatus = useServerFn(adminUpdateApplicationStatus);
  const upd = useServerFn(adminUpdateApplication);
  const setDoc = useServerFn(adminSetDocumentStatus);
  const [filter, setFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [exp, setExp] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<Record<string, string>>({});
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, { status?: string; stage?: number; deposit_paid?: boolean; notes?: string }>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesEditing, setNotesEditing] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const statuses = ["all", "submitted", "in_review", "documents", "approved", "rejected"];
  const stages = [
    { label: "تقديم ومستندات", labelEn: "Application & Docs", icon: "📋" },
    { label: "ديبوزت", labelEn: "Deposit", icon: "💰" },
    { label: "بري انترفيو", labelEn: "Pre-Interview", icon: "📝" },
    { label: "انترفيو", labelEn: "Interview", icon: "🎤" },
    { label: "التصريح والتأشيرة", labelEn: "Permit & Visa", icon: "🛂" },
    { label: "جاهز للسفر", labelEn: "Ready to Travel", icon: "✈️" },
  ];

  const isPaymentApp = (a: any) =>
    a.notes && (a.notes.includes("طلب دفع") || a.notes.includes("طلب سداد"));

  const paymentsCount = apps.filter(isPaymentApp).length;

  // Stage counts for quick summary
  const stageCounts = stages.map((_, i) => apps.filter(a => (a.stage ?? 0) === i).length);
  const statusCounts: Record<string, number> = {};
  statuses.slice(1).forEach(s => { statusCounts[s] = apps.filter(a => a.status === s).length; });

  const filtered = apps.filter(a => {
    const effStatus = optimisticOverrides[a.id]?.status ?? a.status;
    const effStage = optimisticOverrides[a.id]?.stage ?? (a.stage ?? 0);
    if (filter === "payments") {
      if (!isPaymentApp(a)) return false;
    } else if (filter !== "all" && effStatus !== filter) {
      return false;
    }
    if (stageFilter !== "all" && effStage !== stageFilter) return false;
    return (!search || (a.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.phone ?? "").includes(search) || (a.promo_code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.user_email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.passport_number ?? "").toLowerCase().includes(search.toLowerCase()));
  });

  const openDoc = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setOptimisticOverrides(prev => ({ ...prev, [appId]: { ...(prev[appId] || {}), status: newStatus } }));
    setUpdatingId(appId);
    try {
      await setStatus({ data: { id: appId, status: newStatus } });
      onChange();
    } catch (err: any) {
      alert("خطأ في تحديث الحالة: " + (err?.message || "خطأ"));
      setOptimisticOverrides(prev => { const c = { ...prev }; if (c[appId]) delete c[appId].status; return c; });
    } finally { setUpdatingId(null); }
  };

  const handleUpdateStage = async (appId: string, newStage: number) => {
    setOptimisticOverrides(prev => ({ ...prev, [appId]: { ...(prev[appId] || {}), stage: newStage } }));
    setUpdatingId(appId);
    try {
      await upd({ data: { id: appId, stage: newStage } });
      onChange();
    } catch (err: any) {
      alert("خطأ في تحديث المرحلة: " + (err?.message || "خطأ"));
      setOptimisticOverrides(prev => { const c = { ...prev }; if (c[appId]) delete c[appId].stage; return c; });
    } finally { setUpdatingId(null); }
  };

  const handleToggleDeposit = async (appId: string, currentDeposit: boolean) => {
    const nextVal = !currentDeposit;
    setOptimisticOverrides(prev => ({ ...prev, [appId]: { ...(prev[appId] || {}), deposit_paid: nextVal } }));
    setUpdatingId(appId);
    try {
      await upd({ data: { id: appId, deposit_paid: nextVal } });
      onChange();
    } catch (err: any) {
      alert("خطأ في تحديث الديبوزت: " + (err?.message || "خطأ"));
      setOptimisticOverrides(prev => { const c = { ...prev }; if (c[appId]) delete c[appId].deposit_paid; return c; });
    } finally { setUpdatingId(null); }
  };

  const handleSaveNotes = async (appId: string) => {
    const notes = notesDraft[appId] ?? "";
    setSavingNotes(true);
    try {
      await upd({ data: { id: appId, notes } });
      setOptimisticOverrides(prev => ({ ...prev, [appId]: { ...(prev[appId] || {}), notes } }));
      setNotesEditing(null);
      onChange();
    } catch (err: any) {
      alert("خطأ في حفظ الملاحظات: " + (err?.message || "خطأ"));
    } finally { setSavingNotes(false); }
  };

  const getDetailTab = (appId: string) => activeDetailTab[appId] ?? "overview";
  const setDetailTab = (appId: string, tab: string) =>
    setActiveDetailTab(prev => ({ ...prev, [appId]: tab }));

  return (
    <div className="space-y-5">
      {/* ── Header Stats Bar ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stages.map((s, i) => (
          <button
            key={i}
            onClick={() => setStageFilter(stageFilter === i ? "all" : i)}
            className={`group rounded-2xl border p-3 text-left transition-all ${
              stageFilter === i
                ? "border-navy bg-navy text-ivory shadow-md"
                : "border-border bg-card hover:border-beige hover:shadow-sm"
            }`}
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <p className={`text-[10px] font-semibold uppercase tracking-wider truncate ${stageFilter === i ? "text-beige" : "text-muted-foreground"}`}>{s.labelEn}</p>
            <p className={`text-2xl font-display font-bold mt-0.5 ${stageFilter === i ? "text-ivory" : "text-foreground"}`}>{stageCounts[i]}</p>
          </button>
        ))}
      </div>

      {/* ── Filters Row ── */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground outline-none focus:border-beige"
              placeholder="Search by name, phone, email, passport, promo…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground ml-auto">
            <span className="font-bold text-foreground">{filtered.length}</span> / {apps.length} applications
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                filter === s ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige text-foreground"
              }`}>
              {s === "all" ? `All (${apps.length})` : `${s} (${statusCounts[s] ?? 0})`}
            </button>
          ))}
          <button onClick={() => setFilter("payments")}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition-all ${
              filter === "payments"
                ? "bg-amber-500 text-white border-amber-600"
                : "border-amber-400/60 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
            }`}>
            <CreditCard className="h-3 w-3" />
            طلبات الدفع ({paymentsCount})
          </button>
          {stageFilter !== "all" && (
            <button onClick={() => setStageFilter("all")}
              className="flex items-center gap-1 rounded-full border border-navy/40 bg-navy/10 px-3 py-1 text-[11px] font-semibold text-navy hover:bg-navy/20">
              <X className="h-3 w-3" /> Clear Stage Filter
            </button>
          )}
        </div>
      </div>

      {/* ── Applications List ── */}
      <div className="space-y-3">
        {filtered.map(a => {
          const expanded = exp === a.id;
          const due = a.payment_plan === "full" ? a.programs?.price : a.programs?.deposit;
          const hasPaymentNote = isPaymentApp(a);
          const effStatus = optimisticOverrides[a.id]?.status ?? a.status;
          const effStage = optimisticOverrides[a.id]?.stage ?? (a.stage ?? 0);
          const effDeposit = optimisticOverrides[a.id]?.deposit_paid ?? a.deposit_paid;
          const effNotes = optimisticOverrides[a.id]?.notes ?? a.notes ?? "";
          const isBusy = updatingId === a.id;
          const detailTab = getDetailTab(a.id);
          const partnerName = a.profiles?.full_name || a.profiles?.display_name || (a.promo_code ? `Partner (${a.promo_code})` : null);

          return (
            <div key={a.id} className={`rounded-3xl border bg-card overflow-hidden transition-all ${
              hasPaymentNote ? "border-amber-400/80 shadow-md" : "border-border shadow-xs hover:shadow-sm"
            }`}>
              {/* ── Summary Row ── */}
              <button
                className="flex w-full items-start justify-between gap-4 p-5 text-start hover:bg-secondary/20 transition-colors"
                onClick={() => setExp(expanded ? null : a.id)}
              >
                <div className="min-w-0 flex-1">
                  {/* Name + badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="font-display text-base font-bold text-foreground">{a.full_name ?? a.profiles?.full_name ?? "—"}</p>
                    <span className={`${pill} ${statusColor(effStatus)}`}>{effStatus}</span>
                    {hasPaymentNote && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <CreditCard className="h-3.5 w-3.5" /> طلب دفع
                      </span>
                    )}
                    {effDeposit && <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-xs font-bold text-emerald-800">✓ Deposit Paid</span>}
                    {isBusy && <span className="text-[10px] text-amber-600 animate-pulse font-bold">جاري الحفظ…</span>}
                  </div>

                  {/* Stage progress bar */}
                  <div className="flex items-center gap-1 mb-2">
                    {stages.map((s, i) => (
                      <div key={i} className="flex-1 relative group/stage">
                        <div className={`h-1.5 rounded-full transition-all ${
                          i < effStage ? "bg-emerald-500" : i === effStage ? "bg-navy" : "bg-border"
                        }`} />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover/stage:block z-10 whitespace-nowrap rounded-lg bg-foreground px-2 py-0.5 text-[10px] text-background font-medium shadow">
                          {s.icon} {s.labelEn}
                        </div>
                      </div>
                    ))}
                    <span className="text-[10px] font-bold text-navy ml-1">{effStage}/5</span>
                  </div>

                  {/* Info line */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {a.programs?.countries?.name_en && <span>🌍 {a.programs.countries.name_en}</span>}
                    {a.programs?.track && <span>📚 {a.programs.track}</span>}
                    {a.programs?.price && <span className="font-bold text-beige">{eur(a.programs.price)}</span>}
                    {a.phone && <span>📞 {a.phone}</span>}
                    {partnerName && <span className="text-navy font-semibold">👤 {partnerName}</span>}
                    <span className="ml-auto">{new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-1 text-muted-foreground">
                  <span className="text-xs hidden sm:inline">{expanded ? "Collapse" : "Full Dossier"}</span>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* ── Expanded Detail Panel ── */}
              {expanded && (
                <div className="border-t border-border bg-secondary/5">
                  {/* Detail Tab Nav */}
                  <div className="flex gap-0.5 border-b border-border bg-background/50 px-5 pt-3 overflow-x-auto">
                    {[
                      { id: "overview", label: "Overview", icon: "📋" },
                      { id: "applicant", label: "Applicant", icon: "👤" },
                      { id: "program", label: "Program", icon: "📚" },
                      { id: "documents", label: `Documents (${(a.application_documents ?? []).length})`, icon: "📎" },
                      { id: "notes", label: "Admin Notes", icon: "✍️" },
                    ].map(t => (
                      <button key={t.id} onClick={() => setDetailTab(a.id, t.id)}
                        className={`flex items-center gap-1.5 rounded-t-xl border-b-2 px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                          detailTab === t.id
                            ? "border-navy text-navy bg-card"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}>
                        <span>{t.icon}</span> {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 space-y-5">
                    {/* ══ TAB: OVERVIEW ══ */}
                    {detailTab === "overview" && (
                      <div className="space-y-4">
                        {/* Status & Workflow Box */}
                        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/60 pb-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Application Status & Workflow</p>
                            {isBusy && <Loader2 className="h-4 w-4 animate-spin text-beige" />}
                          </div>

                          {/* Status + Deposit row */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-medium">Status:</span>
                              <select
                                value={effStatus}
                                onChange={e => handleUpdateStatus(a.id, e.target.value)}
                                disabled={isBusy}
                                className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-bold outline-none focus:border-beige disabled:opacity-50 cursor-pointer"
                              >
                                {["submitted", "in_review", "documents", "approved", "rejected"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <span className={`${pill} ${statusColor(effStatus)}`}>{effStatus}</span>
                            </div>

                            <button
                              onClick={() => handleToggleDeposit(a.id, Boolean(effDeposit))}
                              disabled={isBusy}
                              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${
                                effDeposit
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                                  : "border-beige text-foreground hover:bg-beige/10"
                              }`}
                            >
                              {effDeposit
                                ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Deposit Paid ({eur(due ?? 0)})</>
                                : <><CreditCard className="h-3.5 w-3.5" /> Mark Deposit Paid ({eur(due ?? 0)})</>}
                            </button>
                          </div>

                          {/* Stage Timeline */}
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                              Stage Progression — click to update:
                            </p>
                            <div className="relative">
                              {/* Connecting line */}
                              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-5 hidden sm:block" />
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 relative">
                                {stages.map((s, i) => {
                                  const isCurr = effStage === i;
                                  const isPast = effStage > i || (i === 1 && effDeposit);
                                  return (
                                    <button key={i} onClick={() => handleUpdateStage(a.id, i)} disabled={isBusy}
                                      className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 text-xs transition-all border disabled:opacity-50 ${
                                        isCurr
                                          ? "bg-navy text-ivory border-navy shadow-lg ring-2 ring-beige/40"
                                          : isPast
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400"
                                          : "bg-card text-muted-foreground border-border hover:border-beige hover:text-foreground"
                                      }`}>
                                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                                        isCurr ? "bg-beige text-navy" : isPast ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
                                      }`}>
                                        {isPast && !isCurr ? "✓" : s.icon}
                                      </span>
                                      <span className="font-bold text-center leading-tight">{s.labelEn}</span>
                                      <span className="text-[10px] text-center opacity-70 leading-tight">{s.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick info grid */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            { label: "Full Name", value: a.full_name ?? a.profiles?.full_name ?? "—", icon: "👤" },
                            { label: "Phone", value: a.phone ?? "—", icon: "📞", copyKey: `phone-${a.id}`, link: a.phone ? `https://wa.me/${a.phone.replace(/[^0-9]/g,"")}` : null, linkLabel: "WhatsApp" },
                            { label: "Country", value: a.programs?.countries?.name_en ?? "—", icon: "🌍" },
                            { label: "Stage", value: `${stages[effStage]?.icon} ${stages[effStage]?.labelEn}`, icon: "📍" },
                            { label: "Created", value: new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), icon: "📅" },
                            { label: "Partner", value: partnerName ?? "—", icon: "🤝" },
                            { label: "Promo Code", value: a.promo_code ? `${a.promo_code} (${a.discount_percent ?? 0}% off)` : "None", icon: "🏷" },
                            { label: "Payment", value: a.payment_plan === "full" ? "Full Payment" : `${a.installments}× Installments`, icon: "💳" },
                          ].map((item, i) => (
                            <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{item.icon} {item.label}</p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground truncate flex-1">{item.value}</p>
                                {item.copyKey && item.value !== "—" && (
                                  <button onClick={() => copyToClipboard(String(item.value), item.copyKey!)}
                                    className="text-muted-foreground hover:text-foreground transition-colors">
                                    {copied === item.copyKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                )}
                                {item.link && (
                                  <a href={item.link} target="_blank" rel="noreferrer"
                                    className="text-[10px] font-semibold text-emerald-600 underline whitespace-nowrap">
                                    {item.linkLabel}
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ══ TAB: APPLICANT ══ */}
                    {detailTab === "applicant" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-beige" /> Personal Information
                          </p>
                          {[
                            ["Full Name", a.full_name ?? a.profiles?.full_name ?? "—"],
                            ["Date of Birth", a.birth_date ?? "—"],
                            ["Passport Number", a.passport_number ?? "—"],
                            ["Education / Major", a.education ?? "—"],
                            ["Gender", a.profiles?.gender ?? "—"],
                            ["Nationality", a.profiles?.nationality ?? a.profiles?.governorate ?? "—"],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between items-start gap-2 text-xs">
                              <span className="text-muted-foreground font-medium shrink-0">{label}</span>
                              <span className="font-bold text-foreground text-right">{value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-beige" /> Contact Information
                          </p>
                          <div className="text-xs space-y-2.5">
                            <div>
                              <span className="text-muted-foreground font-medium block mb-0.5">Phone / WhatsApp</span>
                              {a.phone ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold font-mono">{a.phone}</span>
                                  <button onClick={() => copyToClipboard(a.phone, `phone2-${a.id}`)}
                                    className="text-muted-foreground hover:text-foreground">
                                    {copied === `phone2-${a.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                  <a href={`https://wa.me/${a.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-200 transition-colors">
                                    <ExternalLink className="h-2.5 w-2.5" /> WhatsApp
                                  </a>
                                </div>
                              ) : <span className="text-muted-foreground">—</span>}
                            </div>
                            <div>
                              <span className="text-muted-foreground font-medium block mb-0.5">Email Address</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold truncate">{a.user_email || a.profiles?.email || "—"}</span>
                                {(a.user_email || a.profiles?.email) && (
                                  <button onClick={() => copyToClipboard(a.user_email || a.profiles?.email, `email-${a.id}`)}
                                    className="text-muted-foreground hover:text-foreground shrink-0">
                                    {copied === `email-${a.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-medium block mb-0.5">Referral Partner</span>
                              <span className="font-bold">{partnerName ?? "Direct (no partner)"}</span>
                              {a.promo_code && <span className="ml-2 text-navy font-mono text-[11px]">🏷 {a.promo_code}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ══ TAB: PROGRAM ══ */}
                    {detailTab === "program" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-beige" /> Program & Pathway
                          </p>
                          {[
                            ["Target Country", a.programs?.countries?.name_en ?? "—"],
                            ["Program Title", a.programs?.title_en ?? "—"],
                            ["Track", a.programs?.track ?? "—"],
                            ["Duration", a.programs?.duration_months ? `${a.programs.duration_months} months` : "—"],
                            ["Pathway", a.programs?.pathway ?? "—"],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between items-start gap-2 text-xs">
                              <span className="text-muted-foreground font-medium shrink-0">{label}</span>
                              <span className="font-bold text-foreground text-right">{value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-beige" /> Payment & Financial
                          </p>
                          {[
                            ["Total Program Price", eur(a.programs?.price ?? 0)],
                            ["Deposit Required", eur(a.programs?.deposit ?? 250)],
                            ["Payment Plan", a.payment_plan === "full" ? "Full Payment" : `${a.installments}× Installments`],
                            ["Promo Code", a.promo_code ?? "None"],
                            ["Discount", a.discount_percent ? `${a.discount_percent}%` : "None"],
                            ["Deposit Status", effDeposit ? "✅ Paid" : "⏳ Pending"],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between items-start gap-2 text-xs">
                              <span className="text-muted-foreground font-medium shrink-0">{label}</span>
                              <span className="font-bold text-foreground text-right">{value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Timeline */}
                        <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-4 space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-beige" /> Application Timeline
                          </p>
                          <div className="space-y-2">
                            {[
                              { label: "Application Submitted", date: a.created_at, done: true },
                              { label: "Documents Uploaded", date: a.updated_at, done: (a.application_documents ?? []).length > 0 },
                              { label: "Deposit Paid", date: null, done: Boolean(effDeposit) },
                              { label: "Interview Scheduled", date: null, done: effStage >= 3 },
                              { label: "Visa / Permit Issued", date: null, done: effStage >= 4 },
                              { label: "Ready to Travel", date: null, done: effStage >= 5 },
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs">
                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                  item.done ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
                                }`}>
                                  {item.done ? "✓" : i + 1}
                                </div>
                                <span className={`flex-1 ${item.done ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{item.label}</span>
                                {item.date && <span className="text-muted-foreground">{new Date(item.date).toLocaleDateString("en-GB")}</span>}
                                {!item.date && !item.done && <span className="text-muted-foreground italic">pending</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ══ TAB: DOCUMENTS ══ */}
                    {detailTab === "documents" && (
                      <div className="space-y-3">
                        {(a.application_documents ?? []).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <BookOpen className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm font-medium">No documents submitted yet</p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="flex items-center justify-between bg-secondary/30 px-4 py-2.5 border-b border-border">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Submitted Documents ({a.application_documents.length})
                              </p>
                              <p className="text-[10px] text-muted-foreground">Click filename to view · Approve or Reject each document</p>
                            </div>
                            <div className="divide-y divide-border">
                              {a.application_documents.map((d: any) => (
                                <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                                  <div className="min-w-0 flex-1">
                                    <button onClick={() => openDoc(d.file_path)}
                                      className="text-start text-xs font-semibold text-foreground hover:text-navy hover:underline transition-colors">
                                      {d.doc_type}
                                    </button>
                                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{d.file_name}</p>
                                    {d.uploaded_at && (
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        Uploaded: {new Date(d.uploaded_at).toLocaleDateString("en-GB")}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`${pill} ${statusColor(d.status)}`}>{d.status}</span>
                                    <button onClick={() => openDoc(d.file_path)}
                                      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium hover:border-beige transition-colors">
                                      <ExternalLink className="h-3 w-3" /> View
                                    </button>
                                    <button
                                      onClick={async () => { await setDoc({ data: { id: d.id, status: "approved" } }); onChange(); }}
                                      className={`${pill} border transition-all ${d.status === "approved" ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" : "border-border hover:border-emerald-400 hover:bg-emerald-50"}`}>
                                      <CheckCircle2 className="inline h-3 w-3 mr-0.5" /> Approve
                                    </button>
                                    <button
                                      onClick={async () => { await setDoc({ data: { id: d.id, status: "rejected" } }); onChange(); }}
                                      className={`${pill} border transition-all ${d.status === "rejected" ? "bg-red-100 text-red-800 border-red-300 font-bold" : "border-border hover:border-red-400 hover:bg-red-50"}`}>
                                      <XCircle className="inline h-3 w-3 mr-0.5" /> Reject
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ══ TAB: ADMIN NOTES ══ */}
                    {detailTab === "notes" && (
                      <div className="space-y-4">
                        {/* Payment Request alert if applicable */}
                        {hasPaymentNote && effNotes && (
                          <div className="rounded-2xl border border-amber-400/60 bg-amber-500/10 p-4 space-y-1">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                              <CreditCard className="h-4 w-4" /> Payment Request via Chat
                            </p>
                            <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground">{effNotes}</p>
                          </div>
                        )}

                        {/* Notes Editor */}
                        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Internal Admin Notes
                            </p>
                            {notesEditing !== a.id ? (
                              <button onClick={() => {
                                setNotesEditing(a.id);
                                setNotesDraft(prev => ({ ...prev, [a.id]: effNotes }));
                              }}
                                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-beige transition-colors">
                                <Pencil className="h-3 w-3" /> {effNotes ? "Edit Notes" : "Add Notes"}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button onClick={() => setNotesEditing(null)}
                                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-beige transition-colors">
                                  Cancel
                                </button>
                                <button onClick={() => handleSaveNotes(a.id)} disabled={savingNotes}
                                  className="flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs font-bold text-ivory hover:bg-navy/90 disabled:opacity-50 transition-colors">
                                  {savingNotes ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
                                </button>
                              </div>
                            )}
                          </div>

                          {notesEditing === a.id ? (
                            <textarea
                              className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono resize-none focus:border-beige outline-none leading-relaxed"
                              rows={6}
                              placeholder="Add internal admin notes here… (e.g. payment status, special requirements, follow-up actions)"
                              value={notesDraft[a.id] ?? ""}
                              onChange={e => setNotesDraft(prev => ({ ...prev, [a.id]: e.target.value }))}
                            />
                          ) : (
                            <div className="min-h-[80px] rounded-xl border border-border/50 bg-secondary/20 p-3">
                              {effNotes ? (
                                <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground">{effNotes}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No admin notes yet. Click "Add Notes" to add internal remarks.</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="rounded-2xl border border-border bg-card p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Record History</p>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Submitted</span>
                              <span className="font-medium">{new Date(a.created_at).toLocaleString("en-GB")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Updated</span>
                              <span className="font-medium">{new Date(a.updated_at || a.created_at).toLocaleString("en-GB")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Application ID</span>
                              <button onClick={() => copyToClipboard(a.id, `appid-${a.id}`)}
                                className="flex items-center gap-1 font-mono text-[11px] hover:text-navy transition-colors">
                                {a.id.slice(0, 16)}… {copied === `appid-${a.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Layers className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No applications found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PROGRAMS TAB
═══════════════════════════════════════ */
function ProgramsTab({ programs, countries, onChange }: { programs: any[]; countries: any[]; onChange: () => void }) {
  const setPrice = useServerFn(adminUpdateProgramPrice);
  const createProg = useServerFn(adminCreateProgram);
  const updateProg = useServerFn(adminUpdateProgram);
  const deleteProg = useServerFn(adminDeleteProgram);
  const syncCatalog = useServerFn(adminSyncCatalogPrograms);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState<"all" | "student" | "graduate">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const countryNames = Array.from(new Set(programs.map((p: any) => p.countries?.name_en).filter(Boolean)));

  const filtered = programs.filter((p: any) => {
    const matchesSearch =
      !search ||
      p.title_en?.toLowerCase().includes(search.toLowerCase()) ||
      p.title_ar?.includes(search) ||
      p.category_en?.toLowerCase().includes(search.toLowerCase()) ||
      p.category_ar?.includes(search) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === "all" || p.countries?.name_en === countryFilter;
    const matchesTrack = trackFilter === "all" || p.track === trackFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" ? p.published !== false : p.published === false);
    return matchesSearch && matchesCountry && matchesTrack && matchesStatus;
  });

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncCatalog();
      setSyncMessage(`✓ Synced ${res.count} programs from master catalog.`);
      onChange();
    } catch (e: any) {
      setSyncMessage(`Failed to sync: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProg({ data: { id } });
      setDeleteConfirmId(null);
      onChange();
    } catch (e: any) {
      alert(`Could not delete program: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (p: any) => {
    const nextPublished = !(p.published !== false);
    await updateProg({ data: { id: p.id, published: nextPublished } });
    onChange();
  };

  return (
    <div className="space-y-6">
      {/* Target Deposit Guidelines Banner */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                Program & Deposit Management
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground font-normal">
                  {programs.length} Total Programs
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target Deposit Range: <strong className="text-foreground">10,000 – 12,000 EGP</strong> (≈ €185 – €222 at 54 EGP/EUR)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:border-beige transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-beige" : ""}`} />
              {syncing ? "Syncing…" : "Sync Catalog"}
            </button>
            <button
              onClick={() => {
                setSelectedProgram(null);
                setModalMode("add");
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ivory hover:opacity-90 shadow-sm transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Program
            </button>
          </div>
        </div>

        {/* Deposit Guideline Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
          <span className="text-muted-foreground font-medium">Standard Tiers:</span>
          <span className="rounded-lg bg-secondary/80 border border-border px-2.5 py-1 text-xs">
            <strong className="text-foreground">€185</strong> (≈ 9,990 EGP) <span className="text-muted-foreground opacity-80">· Lowest tier</span>
          </span>
          <span className="rounded-lg bg-secondary/80 border border-border px-2.5 py-1 text-xs">
            <strong className="text-foreground">€196</strong> (≈ 10,584 EGP) <span className="text-muted-foreground opacity-80">· Standard</span>
          </span>
          <span className="rounded-lg bg-secondary/80 border border-border px-2.5 py-1 text-xs">
            <strong className="text-foreground">€204</strong> (≈ 11,016 EGP) <span className="text-muted-foreground opacity-80">· Mid-High</span>
          </span>
          <span className="rounded-lg bg-secondary/80 border border-border px-2.5 py-1 text-xs">
            <strong className="text-foreground">€214</strong> (≈ 11,556 EGP) <span className="text-muted-foreground opacity-80">· Premium</span>
          </span>
          <span className="rounded-lg bg-secondary/80 border border-border px-2.5 py-1 text-xs">
            <strong className="text-foreground">€222</strong> (≈ 11,988 EGP) <span className="text-muted-foreground opacity-80">· Top tier</span>
          </span>
        </div>

        {syncMessage && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
            {syncMessage}
          </p>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={`${inp} max-w-64`}
            placeholder="Search programs, jobs, slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-full border border-input bg-background px-3 py-2 text-xs font-medium outline-none focus:border-beige"
          >
            <option value="all">All Countries ({countryNames.length})</option>
            {countryNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as any)}
            className="rounded-full border border-input bg-background px-3 py-2 text-xs font-medium outline-none focus:border-beige"
          >
            <option value="all">All Tracks</option>
            <option value="student">Students 🎓</option>
            <option value="graduate">Graduates 💼</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-full border border-input bg-background px-3 py-2 text-xs font-medium outline-none focus:border-beige"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Showing <strong>{filtered.length}</strong> of {programs.length} programs
        </p>
      </div>

      {/* Programs Table */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-xs text-muted-foreground">
              <th className="p-4 text-start font-semibold">Program / Job Opportunity</th>
              <th className="p-4 text-start font-semibold">Country</th>
              <th className="p-4 text-start font-semibold">Track</th>
              <th className="p-4 text-start font-semibold">Duration</th>
              <th className="p-4 text-center font-semibold">Total Price (€)</th>
              <th className="p-4 text-center font-semibold">Deposit (€)</th>
              <th className="p-4 text-center font-semibold">Max Inst.</th>
              <th className="p-4 text-center font-semibold">Status</th>
              <th className="p-4 text-end font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <ProgramRow
                key={p.id}
                p={p}
                onEdit={() => {
                  setSelectedProgram(p);
                  setModalMode("edit");
                  setModalOpen(true);
                }}
                onSavePrice={async (v) => {
                  await setPrice({ data: { id: p.id, ...v } });
                  onChange();
                }}
                onTogglePublished={() => handleTogglePublished(p)}
                onDelete={() => setDeleteConfirmId(p.id)}
                isDeleting={deletingId === p.id}
              />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No programs match the current filters or search.</p>
            <button
              onClick={() => {
                setSearch("");
                setCountryFilter("all");
                setTrackFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs text-navy dark:text-beige underline font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <ProgramModal
          mode={modalMode}
          program={selectedProgram}
          countries={countries}
          onClose={() => {
            setModalOpen(false);
            setSelectedProgram(null);
          }}
          onSave={async (formData) => {
            if (modalMode === "add") {
              await createProg({ data: formData });
            } else {
              await updateProg({ data: { id: selectedProgram.id, ...formData } });
            }
            setModalOpen(false);
            setSelectedProgram(null);
            onChange();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 dark:bg-red-950/60 p-2.5">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Delete Program</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete this program? Any applications referencing it might be affected.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={Boolean(deletingId)}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramRow({
  p,
  onEdit,
  onSavePrice,
  onTogglePublished,
  onDelete,
  isDeleting,
}: {
  p: any;
  onEdit: () => void;
  onSavePrice: (v: any) => Promise<void>;
  onTogglePublished: () => Promise<void>;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [price, setPrice] = useState(p.price);
  const [deposit, setDeposit] = useState(p.deposit);
  const [inst, setInst] = useState(p.max_installments);
  const [saving, setSaving] = useState(false);

  const dirty = price !== p.price || deposit !== p.deposit || inst !== p.max_installments;
  const cell = "w-20 rounded-lg border border-input bg-background px-2 py-1 text-xs text-center font-medium focus:border-beige outline-none";

  const depositEgp = Math.round(deposit * 54);
  const isDepositInRange = depositEgp >= 9900 && depositEgp <= 12100;
  const isPublished = p.published !== false;

  return (
    <tr className="hover:bg-secondary/20 transition-colors">
      {/* Program Details */}
      <td className="p-4 min-w-56">
        <div className="space-y-0.5">
          <p className="font-semibold text-sm text-foreground">{p.title_en}</p>
          {p.title_ar && <p className="text-xs text-muted-foreground">{p.title_ar}</p>}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground font-medium">
              {p.category_en || p.category_ar || "General"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {p.slug}
            </span>
          </div>
        </div>
      </td>

      {/* Country */}
      <td className="p-4 whitespace-nowrap">
        <span className="font-medium text-foreground text-xs block">
          {p.countries?.name_en || "—"}
        </span>
      </td>

      {/* Track */}
      <td className="p-4 whitespace-nowrap">
        <span
          className={`${pill} ${
            p.track === "student"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
          }`}
        >
          {p.track === "student" ? "Student" : "Graduate"}
        </span>
      </td>

      {/* Duration */}
      <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">
        {p.duration || "12–24 mo"}
      </td>

      {/* Price Input & EGP Preview */}
      <td className="p-4 text-center whitespace-nowrap">
        <div className="inline-flex flex-col items-center">
          <input
            type="number"
            className={cell}
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
          />
          <span className="text-[10px] text-muted-foreground mt-0.5">
            ≈ {Math.round(price * 54).toLocaleString()} EGP
          </span>
        </div>
      </td>

      {/* Deposit Input & EGP Preview */}
      <td className="p-4 text-center whitespace-nowrap">
        <div className="inline-flex flex-col items-center">
          <input
            type="number"
            className={`${cell} ${
              isDepositInRange
                ? "border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-bold"
                : ""
            }`}
            value={deposit}
            onChange={(e) => setDeposit(+e.target.value)}
          />
          <span
            className={`text-[10px] font-semibold mt-0.5 ${
              isDepositInRange
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            ≈ {depositEgp.toLocaleString()} EGP
          </span>
        </div>
      </td>

      {/* Max Installments */}
      <td className="p-4 text-center whitespace-nowrap">
        <div className="inline-flex flex-col items-center">
          <input
            type="number"
            className="w-14 rounded-lg border border-input bg-background px-2 py-1 text-xs text-center font-medium focus:border-beige outline-none"
            min={1}
            max={12}
            value={inst}
            onChange={(e) => setInst(+e.target.value)}
          />
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {inst} months
          </span>
        </div>
      </td>

      {/* Status Toggle */}
      <td className="p-4 text-center whitespace-nowrap">
        <button
          onClick={onTogglePublished}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            isPublished
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          }`}
          title="Click to toggle published / draft"
        >
          {isPublished ? "Published" : "Draft"}
        </button>
      </td>

      {/* Actions */}
      <td className="p-4 text-end whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {dirty && (
            <button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onSavePrice({ price, deposit, max_installments: inst });
                setSaving(false);
              }}
              className="flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-xs text-ivory font-semibold hover:opacity-90 disabled:opacity-60 shadow-sm"
              title="Save inline prices"
            >
              <Save className="h-3 w-3" /> Save
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-beige hover:text-foreground transition-colors"
            title="Edit full program details"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete program"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProgramModal({
  mode,
  program,
  countries,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  program?: any;
  countries: any[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [countryId, setCountryId] = useState(
    program?.country_id || countries[0]?.id || ""
  );
  const [track, setTrack] = useState<"student" | "graduate">(
    program?.track || "student"
  );
  const [titleEn, setTitleEn] = useState(program?.title_en || "");
  const [titleAr, setTitleAr] = useState(program?.title_ar || "");
  const [categoryEn, setCategoryEn] = useState(program?.category_en || "General");
  const [categoryAr, setCategoryAr] = useState(program?.category_ar || "عام");
  const [slug, setSlug] = useState(program?.slug || "");
  const [duration, setDuration] = useState(program?.duration || "12–24 months");
  const [price, setPrice] = useState(program?.price ?? 1500);
  const [deposit, setDeposit] = useState(program?.deposit ?? 196);
  const [installments, setInstallments] = useState(program?.max_installments ?? 6);
  const [published, setPublished] = useState(program?.published !== false);
  const [saving, setSaving] = useState(false);

  // Auto slug generator
  const handleAutoSlug = () => {
    const selectedCountry = countries.find((c) => c.id === countryId);
    const countryPrefix = selectedCountry?.slug || "program";
    const cleanedTitle = titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(`${countryPrefix}-${cleanedTitle || "item"}`);
  };

  const depositEgp = Math.round(deposit * 54);
  const isDepositInRange = depositEgp >= 9900 && depositEgp <= 12100;
  const monthlyEur = installments > 0 ? Math.ceil((price - deposit) / installments) : 0;
  const monthlyEgp = Math.round(monthlyEur * 54);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) return alert("English title is required.");
    if (!slug.trim()) return alert("Slug is required.");
    if (!countryId) return alert("Please select a country.");

    setSaving(true);
    try {
      await onSave({
        country_id: countryId,
        track,
        title_en: titleEn,
        title_ar: titleAr || titleEn,
        category_en: categoryEn,
        category_ar: categoryAr,
        slug,
        duration,
        price: Number(price),
        deposit: Number(deposit),
        max_installments: Number(installments),
        published,
      });
    } catch (err: any) {
      alert(`Error saving program: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-ivory">
              {mode === "add" ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {mode === "add" ? "Add New Program / Job" : "Edit Program"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {mode === "add"
                  ? "Create a new opportunity with transparent pricing & deposit"
                  : `Editing ${program?.title_en}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Country & Track Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Country *
              </label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className={inp}
                required
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en} {c.name_ar ? `(${c.name_ar})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Track / Audience *
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as any)}
                className={inp}
              >
                <option value="student">Students 🎓 (عمل موسمي / دراسة للطلاب)</option>
                <option value="graduate">Graduates 💼 (توظيف وعقود خريجين)</option>
              </select>
            </div>
          </div>

          {/* Titles in EN & AR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Program Title (English) *
              </label>
              <input
                className={inp}
                placeholder="e.g. Seasonal Hotel & Hospitality Services"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Program Title (العربية)
              </label>
              <input
                className={inp}
                placeholder="مثال: عمل موسمي في الفنادق والضيافة"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                dir="rtl"
              />
            </div>
          </div>

          {/* Categories & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Category (EN)
              </label>
              <input
                className={inp}
                placeholder="e.g. Hospitality, Logistics"
                value={categoryEn}
                onChange={(e) => setCategoryEn(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                التخصص (العربية)
              </label>
              <input
                className={inp}
                placeholder="مثال: ضيافة وفنادق"
                value={categoryAr}
                onChange={(e) => setCategoryAr(e.target.value)}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Duration
              </label>
              <input
                className={inp}
                placeholder="e.g. 3–6 months, 12–24 months"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-foreground">
                URL Identifier (Slug) *
              </label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[11px] text-navy dark:text-beige underline font-medium hover:opacity-80"
              >
                Auto-generate from title
              </button>
            </div>
            <input
              className={inp}
              placeholder="e.g. bulgaria-student-hospitality"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          {/* Financials & Deposit Target Card */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
                <Wallet className="h-4 w-4 text-beige" /> Financials & Deposit Configuration
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Exchange rate: ~54 EGP / EUR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Price */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Total Price (€) *
                </label>
                <input
                  type="number"
                  className={inp}
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(+e.target.value)}
                  required
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  ≈ {Math.round(price * 54).toLocaleString()} EGP
                </span>
              </div>

              {/* Deposit Required */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Deposit Required (€) *
                </label>
                <input
                  type="number"
                  className={`${inp} ${
                    isDepositInRange
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold"
                      : ""
                  }`}
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(+e.target.value)}
                  required
                />
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-[11px] font-bold ${
                      isDepositInRange
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    ≈ {depositEgp.toLocaleString()} EGP
                  </span>
                  {isDepositInRange ? (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      ✓ Target Range OK
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-medium">
                      Target: 10k–12k
                    </span>
                  )}
                </div>
              </div>

              {/* Installments */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Max Installments *
                </label>
                <input
                  type="number"
                  className={inp}
                  min={1}
                  max={12}
                  value={installments}
                  onChange={(e) => setInstallments(+e.target.value)}
                  required
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  {monthlyEur} €/mo (≈ {monthlyEgp.toLocaleString()} EGP)
                </span>
              </div>
            </div>

            {/* Quick Deposit Preset Chips */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Quick Deposit Presets (10,000 – 12,000 EGP Target):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  [185, "~9,990 EGP"],
                  [196, "~10,580 EGP"],
                  [204, "~11,016 EGP"],
                  [214, "~11,556 EGP"],
                  [222, "~11,988 EGP"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDeposit(Number(val))}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                      deposit === val
                        ? "bg-navy text-ivory border-navy font-bold"
                        : "bg-background border-border hover:border-beige text-foreground"
                    }`}
                  >
                    €{val} ({label})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="program-published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded-md border-input text-navy accent-navy cursor-pointer"
            />
            <label
              htmlFor="program-published"
              className="text-xs font-medium text-foreground cursor-pointer select-none"
            >
              Publish this program immediately (visible to candidates and partners)
            </label>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-xs font-semibold text-ivory hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {mode === "add" ? "Create Program" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COUNTRIES TAB
═══════════════════════════════════════ */
function CountriesTab({ countries, programs, onChange }: { countries: any[]; programs: any[]; onChange: () => void }) {
  const updCountry = useServerFn(adminUpdateCountry);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const startEdit = (c: any) => { setEditing(c.id); setForm({ ...c }); };
  const cancel = () => { setEditing(null); setForm({}); };
  const save = async () => {
    await updCountry({ data: { id: form.id, name_en: form.name_en, name_ar: form.name_ar, tagline_en: form.tagline_en, tagline_ar: form.tagline_ar, description_en: form.description_en, description_ar: form.description_ar, published: form.published, sort_order: form.sort_order } });
    cancel(); onChange();
  };

  return (
    <div className="space-y-4">
      {countries.map(c => {
        const countryPrograms = programs.filter((p: any) => p.countries?.slug === c.slug || p.country_id === c.id);
        const isEditing = editing === c.id;
        return (
          <div key={c.id} className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{c.flag}</span>
                <div>
                  {isEditing ? (
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inp} placeholder="Name (EN)" value={form.name_en ?? ""} onChange={e => setForm({ ...form, name_en: e.target.value })} />
                        <input className={inp} placeholder="الاسم (AR)" value={form.name_ar ?? ""} onChange={e => setForm({ ...form, name_ar: e.target.value })} dir="rtl" />
                        <input className={inp} placeholder="Tagline (EN)" value={form.tagline_en ?? ""} onChange={e => setForm({ ...form, tagline_en: e.target.value })} />
                        <input className={inp} placeholder="الشعار (AR)" value={form.tagline_ar ?? ""} onChange={e => setForm({ ...form, tagline_ar: e.target.value })} dir="rtl" />
                      </div>
                      <textarea className={inp} rows={2} placeholder="Description (EN)" value={form.description_en ?? ""} onChange={e => setForm({ ...form, description_en: e.target.value })} />
                      <textarea className={inp} rows={2} placeholder="الوصف (AR)" value={form.description_ar ?? ""} onChange={e => setForm({ ...form, description_ar: e.target.value })} dir="rtl" />
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={form.published ?? true} onChange={e => setForm({ ...form, published: e.target.checked })} />
                          Published
                        </label>
                        <input type="number" className="w-20 rounded-lg border border-input px-2 py-1.5 text-sm" placeholder="Order" value={form.sort_order ?? 0} onChange={e => setForm({ ...form, sort_order: +e.target.value })} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-xl font-semibold">{c.name_en}</p>
                        <span className="text-sm text-muted-foreground">/ {c.name_ar}</span>
                        <span className={`${pill} ${c.published ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>{c.published ? "Published" : "Hidden"}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{c.tagline_en}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.description_en?.slice(0, 120)}…</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {isEditing ? (
                  <>
                    <button onClick={save} className="flex items-center gap-1 rounded-full bg-navy px-4 py-2 text-xs text-ivory"><Save className="h-3 w-3" /> Save</button>
                    <button onClick={cancel} className="rounded-full border border-border px-3 py-2"><X className="h-3 w-3" /></button>
                  </>
                ) : (
                  <button onClick={() => startEdit(c)} className="flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs hover:border-beige"><Pencil className="h-3 w-3" /> Edit</button>
                )}
              </div>
            </div>
            {/* Programs in this country */}
            {countryPrograms.length > 0 && !isEditing && (
              <div className="border-t border-border px-5 pb-4">
                <p className="mt-3 text-xs font-medium text-muted-foreground">Programs ({countryPrograms.length})</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {countryPrograms.map((pr: any) => (
                    <div key={pr.id} className="rounded-2xl border border-border bg-secondary/30 px-3 py-2 text-xs">
                      <span className="font-medium">{pr.title_en}</span>
                      <span className="ml-2 text-muted-foreground">{eur(pr.price)} · dep {eur(pr.deposit)} · {pr.max_installments}× inst.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   PARTNERS TAB
═══════════════════════════════════════ */
function PartnersTab({
  partners,
  levels,
  withdrawals = [],
  onChange,
}: {
  partners: any[];
  levels: any[];
  withdrawals?: any[];
  onChange: () => void;
}) {
  const manage = useServerFn(adminManagePartner);
  const addComm = useServerFn(adminAddCommission);
  const setComm = useServerFn(adminSetCommission);
  const setWithdrawal = useServerFn(adminSetWithdrawalStatus);
  const delPartner = useServerFn(adminDeletePartner);
  const [exp, setExp] = useState<string | null>(null);
  const [commForm, setCommForm] = useState<{ amount: string; note: string }>({ amount: "", note: "" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filtered = partners.filter(p =>
    (filter === "all" || p.status === filter) &&
    (!search ||
      (p.profiles?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.promo_code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.profiles?.phone ?? "").includes(search))
  );

  const getLevel = (score: number) => {
    const sorted = [...levels].sort((a, b) => a.min_leads - b.min_leads);
    let cur = sorted[0];
    for (const l of sorted) if (score >= l.min_leads) cur = l;
    return cur;
  };
  const levelName = (score: number) => getLevel(score)?.name ?? "—";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className={`${inp} max-w-72`}
            placeholder="Search by name, email, phone, city, code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-1">
            {["all", "pending", "active", "suspended"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${
                  filter === s ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} partners registered</p>
      </div>

      {filtered.map(p => {
        const score = p.leads.length + p.apps.length;
        const expanded = exp === p.id;
        const curLevel = getLevel(score);
        const refUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${p.promo_code}` : `https://kinetix.travel/?ref=${p.promo_code}`;

        return (
          <div key={p.id} className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs transition-all">
            {/* ── Header row (Quick Overview) ── */}
            <button
              className="flex w-full items-start justify-between gap-4 p-5 text-start hover:bg-secondary/20 transition-colors"
              onClick={() => setExp(expanded ? null : p.id)}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-base font-semibold text-foreground">
                    {p.profiles?.full_name || "Partner"}
                  </span>
                  <span className={`${pill} ${statusColor(p.status)}`}>{p.status}</span>
                  <span className="rounded-full bg-navy/10 px-2.5 py-0.5 font-mono text-xs font-bold text-navy dark:bg-navy-soft dark:text-ivory">
                    {p.promo_code}
                  </span>
                  {p.city && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 text-amber-500" />
                      {p.city}
                    </span>
                  )}
                </div>

                {/* Contact & Tier quick line */}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {p.email ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Mail className="h-3.5 w-3.5 text-beige" />
                      {p.email}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60 italic">No email</span>
                  )}

                  {p.profiles?.phone && (
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <Phone className="h-3.5 w-3.5 text-emerald-500" />
                      {p.profiles.phone}
                    </span>
                  )}

                  <span>
                    Level: <strong className="text-foreground">{levelName(score)}</strong>
                  </span>
                  <span>
                    Rate: <strong className="text-beige font-semibold">{egp(curLevel?.commission_amount ?? 9350)}</strong>
                  </span>
                  <span>
                    Score: <strong>{score}</strong> ({p.leads.length} leads · {p.apps.length} apps)
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ Paid: {egp(p.total_paid)}
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    ⏳ Pending: {egp(p.total_pending)}
                  </span>
                  {p.created_at && (
                    <span className="text-muted-foreground">
                      · Registered: {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 pt-1 text-muted-foreground">
                <span className="text-xs hidden sm:inline">{expanded ? "Hide details" : "Full details"}</span>
                {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>

            {/* ── Expanded Full Partner Dossier ── */}
            {expanded && (
              <div className="border-t border-border px-5 pb-6 space-y-6 bg-secondary/15">
                {/* 1. Full Partner Data Cards */}
                <div className="pt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Card 1: Contact Details */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-beige" /> Contact Details
                    </p>
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Full Name</span>
                        <span className="font-bold text-foreground text-sm">{p.profiles?.full_name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Email Address</span>
                        {p.email ? (
                          <div className="flex items-center gap-1.5">
                            <a href={`mailto:${p.email}`} className="font-medium text-navy dark:text-beige hover:underline truncate">
                              {p.email}
                            </a>
                            <button
                              onClick={() => copyText(p.email, `em_${p.id}`)}
                              className="text-muted-foreground hover:text-foreground shrink-0"
                              title="Copy email">
                              {copiedKey === `em_${p.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Phone / WhatsApp</span>
                        {p.profiles?.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.profiles.phone}</span>
                            <a
                              href={`https://wa.me/${p.profiles.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                              WhatsApp
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">City / Location</span>
                        <span className="font-medium text-foreground">{p.city || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Partner Credentials & Referral Link */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5 text-beige" /> Partner Credentials
                    </p>
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Promo Code</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-navy dark:text-beige">{p.promo_code}</span>
                          <button
                            onClick={() => copyText(p.promo_code, `code_${p.id}`)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy code">
                            {copiedKey === `code_${p.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Referral Link</span>
                        <div className="flex items-center gap-1.5">
                          <input readOnly value={refUrl} className="w-full rounded-lg border border-input bg-background px-2 py-1 font-mono text-[11px]" />
                          <button
                            onClick={() => copyText(refUrl, `link_${p.id}`)}
                            className="rounded-lg border border-border bg-secondary p-1.5 text-muted-foreground hover:text-foreground shrink-0"
                            title="Copy referral link">
                            {copiedKey === `link_${p.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Client Discount Granted</span>
                        <span className="font-semibold text-foreground">{curLevel?.client_discount ?? 0}% off programs</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Registration Date</span>
                        <span className="text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Experience & Background */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-beige" /> Sales Experience
                    </p>
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Experience Statement</span>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {p.experience || "No prior sales experience notes submitted."}
                        </p>
                      </div>
                      <div className="pt-1">
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Partner User ID</span>
                        <span className="font-mono text-[10px] text-muted-foreground block truncate">{p.user_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Tier & Payout Settings */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-beige" /> Level & Payout Details
                    </p>
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Current Level & Rate</span>
                        <p className="text-sm font-bold text-beige">
                          {levelName(score)}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            ({egp(curLevel?.commission_amount ?? 9350)} / client)
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Payout Method</span>
                        <span className="font-medium text-foreground">{p.payout_method || "Not set yet"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Account / Wallet Info</span>
                        <span className="font-mono text-xs text-foreground">{p.payout_details || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Account Status Manager */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Change Account Status:</span>
                    <span className={`${pill} ${statusColor(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["pending", "active", "suspended"] as const).map(s => (
                      <button
                        key={s}
                        onClick={async () => {
                          await manage({ data: { id: p.id, status: s } });
                          onChange();
                        }}
                        className={`${pill} border transition-all ${
                          p.status === s
                            ? statusColor(s) + " border-transparent font-bold ring-2 ring-primary/20"
                            : "border-border hover:border-beige text-muted-foreground hover:text-foreground"
                        }`}>
                        {s === "active" ? (
                          <ShieldCheck className="inline h-3 w-3" />
                        ) : s === "suspended" ? (
                          <Ban className="inline h-3 w-3" />
                        ) : (
                          <Clock className="inline h-3 w-3" />
                        )}
                        {" "}Mark {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Leads Table */}
                {p.leads.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-beige" />
                      Client Leads ({p.leads.length})
                    </p>
                    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                            <th className="px-3 py-2 text-start">Client Name</th>
                            <th className="px-3 py-2 text-start">Phone</th>
                            <th className="px-3 py-2 text-start">Country Interest</th>
                            <th className="px-3 py-2 text-start">Track</th>
                            <th className="px-3 py-2 text-start">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.leads.map((l: any, i: number) => (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/20">
                              <td className="px-3 py-2 font-medium">{l.full_name}</td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {l.phone ? (
                                  <a href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                                    {l.phone}
                                  </a>
                                ) : "—"}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{l.country_interest || "—"}</td>
                              <td className="px-3 py-2 text-muted-foreground">{l.track || "—"}</td>
                              <td className="px-3 py-2">
                                <span className={`${pill} ${statusColor(l.status)}`}>{l.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Applications Referred Table */}
                {p.apps.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-beige" />
                      Referred Program Applications ({p.apps.length})
                    </p>
                    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                            <th className="px-3 py-2 text-start">Applicant</th>
                            <th className="px-3 py-2 text-start">Program & Country</th>
                            <th className="px-3 py-2 text-start">Stage</th>
                            <th className="px-3 py-2 text-start">Deposit</th>
                            <th className="px-3 py-2 text-start">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.apps.map((a: any) => (
                            <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                              <td className="px-3 py-2 font-medium">{a.full_name || "—"}</td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {a.programs?.countries?.name_en} · {a.programs?.title_en || a.programs?.track}
                              </td>
                              <td className="px-3 py-2">
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
                                  Stage {a.stage ?? 0}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {a.deposit_paid ? (
                                  <span className="text-emerald-600 font-semibold">✓ Paid</span>
                                ) : (
                                  <span className="text-amber-600">Pending</span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`${pill} ${statusColor(a.status)}`}>{a.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. Commissions Log & Quick Adder */}
                <div>
                  <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-beige" />
                    Commissions History & Payouts
                  </p>
                  {p.commissions.length > 0 && (
                    <div className="mb-3 overflow-x-auto rounded-2xl border border-border bg-card">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                            <th className="px-3 py-2 text-start">Amount</th>
                            <th className="px-3 py-2 text-start">Status</th>
                            <th className="px-3 py-2 text-start">Note</th>
                            <th className="px-3 py-2 text-start">Date</th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {p.commissions.map((c: any) => (
                            <tr key={c.id} className="border-b border-border last:border-0">
                              <td className="px-3 py-2 font-bold text-beige text-sm">{egp(c.amount)}</td>
                              <td className="px-3 py-2">
                                <span className={`${pill} ${statusColor(c.status)}`}>{c.status}</span>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{c.note || "—"}</td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {new Date(c.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2 text-end">
                                <select
                                  value={c.status}
                                  onChange={async e => {
                                    await setComm({ data: { id: c.id, status: e.target.value as any } });
                                    onChange();
                                  }}
                                  className="rounded-full border border-input bg-background px-2.5 py-1 text-xs outline-none">
                                  {["pending", "approved", "paid", "cancelled"].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add manual commission */}
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Issue New Commission for this Partner:</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        className={`${inp} max-w-36 font-semibold`}
                        placeholder="Amount (EGP)"
                        value={commForm.amount}
                        onChange={e => setCommForm(f => ({ ...f, amount: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCommForm(f => ({ ...f, amount: String(curLevel?.commission_amount ?? 9350) }))
                        }
                        className="rounded-full border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                        Use {levelName(score)} Rate ({egp(curLevel?.commission_amount ?? 9350)})
                      </button>
                      <input
                        className={`${inp} flex-1 min-w-44`}
                        placeholder="Commission note (e.g. Bulgaria client successful file)"
                        value={commForm.note}
                        onChange={e => setCommForm(f => ({ ...f, note: e.target.value }))}
                      />
                      <button
                        onClick={async () => {
                          if (!commForm.amount || +commForm.amount <= 0) return;
                          await addComm({
                            data: {
                              partner_id: p.id,
                              amount: +commForm.amount,
                              ...(commForm.note ? { note: commForm.note } : {}),
                            },
                          });
                          setCommForm({ amount: "", note: "" });
                          onChange();
                        }}
                        className="flex items-center gap-1 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ivory hover:bg-navy-soft shadow">
                        <Plus className="h-3.5 w-3.5" /> Issue Commission
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. Withdrawal Requests History */}
                {(() => {
                  const pWithdrawals = withdrawals.filter(
                    (w: any) => w.partner_id === p.id || w.partnerId === p.id
                  );
                  return (
                    <div>
                      <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-beige" />
                        طلبات سحب الأرباح ({pWithdrawals.length})
                      </p>
                      {pWithdrawals.length > 0 ? (
                        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                                <th className="px-3 py-2 text-start">المبلغ</th>
                                <th className="px-3 py-2 text-start">الوسيلة</th>
                                <th className="px-3 py-2 text-start">بيانات الحساب / المحفظة</th>
                                <th className="px-3 py-2 text-start">الحالة</th>
                                <th className="px-3 py-2 text-start">التاريخ</th>
                                <th className="px-3 py-2 text-end">تغيير الحالة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pWithdrawals.map((w: any) => (
                                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                                  <td className="px-3 py-2 font-bold text-beige text-sm">{egp(w.amount)}</td>
                                  <td className="px-3 py-2 font-medium">{w.payoutMethod || w.payout_method || "—"}</td>
                                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{w.payoutDetails || w.payout_details || "—"}</td>
                                  <td className="px-3 py-2">
                                    <span className={`${pill} ${statusColor(w.status)}`}>{w.status}</span>
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {new Date(w.createdAt || w.created_at || Date.now()).toLocaleDateString()}
                                  </td>
                                  <td className="px-3 py-2 text-end">
                                    <select
                                      value={w.status}
                                      onChange={async (e) => {
                                        await setWithdrawal({
                                          data: {
                                            id: w.id,
                                            status: e.target.value as any,
                                          },
                                        });
                                        onChange();
                                      }}
                                      className="rounded-full border border-input bg-background px-2.5 py-1 text-xs outline-none"
                                    >
                                      {["pending", "approved", "processing", "completed", "rejected"].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                          لا توجد طلبات سحب مقدمة من هذا الشريك حتى الآن.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 7. Partner Administration & Safe Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <div>
                    <p className="text-xs font-bold text-red-700 dark:text-red-400">إدارة حساب الشريك / الحذف والتعطيل الآمن</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      يتم فحص المعاملات المالية أولاً، وإذا وجدت سجلات يتم الأرشفة والتعطيل التلقائي لحماية السجلات المالية والمحاسبية.
                    </p>
                  </div>
                  <button
                    onClick={() => setPartnerToDelete(p)}
                    className="flex items-center gap-1.5 rounded-full border border-red-300 bg-red-100 px-3.5 py-1.5 text-xs font-bold text-red-800 hover:bg-red-200 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف / أرشفة الشريك
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <p className="py-12 text-center text-muted-foreground">No partners found</p>}

      {/* Delete Confirmation Modal */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                تأكيد حذف أو أرشفة الشريك
              </h3>
              <button onClick={() => setPartnerToDelete(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-foreground">
              هل أنت متأكد من رغبتك في حذف الشريك{" "}
              <strong>{partnerToDelete.profiles?.full_name || partnerToDelete.promo_code}</strong>؟
            </p>
            <div className="rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
              <p>• الكود: <span className="font-mono font-bold text-foreground">{partnerToDelete.promo_code}</span></p>
              <p>• العملاء المسجلين: <strong className="text-foreground">{partnerToDelete.leads?.length ?? 0}</strong></p>
              <p>• العمولات: <strong className="text-foreground">{partnerToDelete.commissions?.length ?? 0}</strong></p>
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                * في حال وجود عمولات أو تقديمات مرتبطة بالشريك، سيتم أرشفته وتعطيل كوده تلقائياً دون فقد البيانات المالية.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPartnerToDelete(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await delPartner({ data: { id: partnerToDelete.id, action: "delete" } });
                    setPartnerToDelete(null);
                    onChange();
                  } catch (err: any) {
                    alert(err.message || "حدث خطأ أثناء الحذف");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                تأكيد الإجراء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   PARTNER SETTINGS TAB (Unified Levels & Commissions)
═══════════════════════════════════════ */
function PartnerSettingsTab({ levels, commissions, onChange }: { levels: any[]; commissions: any[]; onChange: () => void }) {
  const [subTab, setSubTab] = useState<"levels" | "commissions">("levels");
  return (
    <div className="space-y-6">
      <div className="flex border-b border-border pb-3 gap-2">
        <button
          onClick={() => setSubTab("levels")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subTab === "levels"
              ? "bg-navy text-ivory shadow-xs font-bold"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4 text-beige" />
          <span>Levels & Progression Thresholds</span>
        </button>
        <button
          onClick={() => setSubTab("commissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subTab === "commissions"
              ? "bg-navy text-ivory shadow-xs font-bold"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Wallet className="h-4 w-4 text-beige" />
          <span>Commissions Rules & Global Payout Log</span>
        </button>
      </div>

      {subTab === "levels" ? (
        <LevelsTab levels={levels} onChange={onChange} />
      ) : (
        <CommissionsTab commissions={commissions} onChange={onChange} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   LEVELS TAB
═══════════════════════════════════════ */
function LevelsTab({ levels, onChange }: { levels: any[]; onChange: () => void }) {
  const updLevel = useServerFn(adminUpdateLevel);
  const [edits, setEdits] = useState<Record<string, any>>({});

  const edit = (id: string, field: string, val: any) => setEdits(e => ({ ...e, [id]: { ...(e[id] ?? {}), [field]: val } }));
  const getV = (l: any, field: string) => edits[l.id]?.[field] ?? l[field];
  const isDirty = (l: any) => !!edits[l.id] && Object.keys(edits[l.id]).some(k => edits[l.id][k] !== l[k]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-beige-soft/40 p-4 text-sm text-muted-foreground">
        <AlertCircle className="inline h-4 w-4 mr-1 text-beige" /> Changes here affect guaranteed fixed commission amounts (EGP) and client discounts for all partners at each level.
      </div>
      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-xs text-muted-foreground">
            <th className="p-4 text-start font-medium">Level</th>
            <th className="p-4 text-start font-medium">Name (AR)</th>
            <th className="p-4 text-start font-medium">Min Leads</th>
            <th className="p-4 text-start font-medium">Fixed Commission (EGP)</th>
            <th className="p-4 text-start font-medium">Client Discount %</th>
            <th className="p-4" />
          </tr></thead>
          <tbody>
            {[...levels].sort((a, b) => a.min_leads - b.min_leads).map(l => {
              const cell = "w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-center";
              return (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="p-4">
                    <input className={`${cell} w-28 text-start font-medium`} value={getV(l, "name")} onChange={e => edit(l.id, "name", e.target.value)} />
                  </td>
                  <td className="p-4">
                    <input className={`${cell} w-28 text-start`} dir="rtl" value={getV(l, "name_ar")} onChange={e => edit(l.id, "name_ar", e.target.value)} />
                  </td>
                  <td className="p-4"><input type="number" className={cell} min={0} value={getV(l, "min_leads")} onChange={e => edit(l.id, "min_leads", +e.target.value)} /></td>
                  <td className="p-4">
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="number"
                        className={`${cell} w-32 font-bold text-navy dark:text-beige`}
                        min={0}
                        step={50}
                        value={getV(l, "commission_amount") ?? 9350}
                        onChange={e => edit(l.id, "commission_amount", +e.target.value)}
                      />
                      <span className="text-xs font-semibold text-muted-foreground">EGP</span>
                    </div>
                  </td>
                  <td className="p-4"><input type="number" className={cell} min={0} max={50} step={0.5} value={getV(l, "client_discount")} onChange={e => edit(l.id, "client_discount", +e.target.value)} /></td>
                  <td className="p-4">
                    {isDirty(l) && (
                      <button onClick={async () => {
                        await updLevel({
                          data: {
                            id: l.id,
                            name: getV(l, "name"),
                            name_ar: getV(l, "name_ar"),
                            min_leads: getV(l, "min_leads"),
                            commission_rate: getV(l, "commission_rate") ?? 5,
                            commission_amount: getV(l, "commission_amount"),
                            client_discount: getV(l, "client_discount"),
                          }
                        });
                        setEdits(e => { const n = { ...e }; delete n[l.id]; return n; }); onChange();
                      }} className="flex items-center gap-1 rounded-full bg-navy px-4 py-1.5 text-xs text-ivory shadow hover:bg-navy-soft transition-colors">
                        <Save className="h-3 w-3" /> Save
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COMMISSIONS TAB
═══════════════════════════════════════ */
function CommissionsTab({ commissions, onChange }: { commissions: any[]; onChange: () => void }) {
  const setComm = useServerFn(adminSetCommission);
  const [filter, setFilter] = useState("all");
  const filtered = commissions.filter((c: any) => {
    if (filter === "all") return true;
    if (filter === "payout_requests") return Boolean(c.note?.includes("طلب سحب"));
    return c.status === filter;
  });
  const total = (s: string) => commissions.filter((c: any) => c.status === s).reduce((a: number, c: any) => a + c.amount, 0);
  const payoutReqCount = commissions.filter((c: any) => c.note?.includes("طلب سحب") && (c.status === "pending" || c.status === "approved")).length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["All Records", commissions.length + " records", "bg-secondary/60"],
          ["Pending", egp(total("pending")), "bg-amber-50"],
          ["Approved", egp(total("approved")), "bg-blue-50"],
          ["Paid", egp(total("paid")), "bg-emerald-50"],
        ].map(([l, v, cls]) => (
          <div key={l} className={`rounded-2xl p-4 ${cls}`}>
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 font-display text-xl font-semibold">{v}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {(
          [
            ["all", "All"],
            ["payout_requests", `🚨 Payout Requests (${payoutReqCount})`],
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["paid", "Paid"],
            ["cancelled", "Cancelled"],
          ] as [string, string][]
        ).map(([s, label]) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === s
                ? s === "payout_requests" ? "border-amber-500 bg-amber-500 text-white font-bold shadow-sm" : "border-navy bg-navy text-ivory"
                : s === "payout_requests" ? "border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 font-semibold" : "border-border hover:border-beige"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="p-4 text-start font-medium">Partner</th>
              <th className="p-4 text-start font-medium">Code</th>
              <th className="p-4 text-start font-medium">Amount</th>
              <th className="p-4 text-start font-medium">Note / Payout Details</th>
              <th className="p-4 text-start font-medium">Date</th>
              <th className="p-4 text-start font-medium">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c: any) => {
              const isPayoutReq = c.note?.includes("طلب سحب");
              return (
                <tr
                  key={c.id}
                  className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${
                    isPayoutReq ? "bg-amber-500/5 border-s-4 border-s-amber-500" : ""
                  }`}
                >
                  <td className="p-4 font-medium">{(c.partners as any)?.profiles?.full_name ?? "—"}</td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{(c.partners as any)?.promo_code}</td>
                  <td className="p-4 font-semibold text-beige text-base">{egp(c.amount)}</td>
                  <td className="p-4 text-xs">
                    {isPayoutReq && (
                      <span className="mb-1 inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        🚨 طلب سحب أرباح
                      </span>
                    )}
                    <p className="text-muted-foreground font-mono whitespace-pre-wrap">{c.note ?? "—"}</p>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`${pill} ${statusColor(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      {isPayoutReq && c.status !== "paid" && (
                        <button
                          onClick={async () => {
                            await setComm({ data: { id: c.id, status: "paid" } });
                            onChange();
                          }}
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-bold text-white shadow-xs transition-colors shrink-0"
                        >
                          ✓ تم التحويل
                        </button>
                      )}
                      <select
                        value={c.status}
                        onChange={async (e) => {
                          await setComm({ data: { id: c.id, status: e.target.value as any } });
                          onChange();
                        }}
                        className="rounded-full border border-input bg-background px-2 py-1 text-xs outline-none"
                      >
                        {["pending", "approved", "paid", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No commissions found</p>}
      </div>
    </div>
  );
}
