import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getAdminFull, adminUpdateApplicationStatus, adminUpdateProgramPrice,
  adminUpdateApplication, adminSetDocumentStatus,
  adminManagePartner, adminAddCommission, adminSetCommission,
  adminUpdateLevel, adminUpdateCountry,
} from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/site/SiteChrome";
import { eur } from "@/lib/catalog";
import {
  Users, Globe, Briefcase, LayoutDashboard, Award, Wallet,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock,
  TrendingUp, Plus, Pencil, Save, X, Eye, ShieldCheck, Ban, AlertCircle, MessageSquare,
  Mail, Phone, MapPin, Calendar, Copy, Check, ExternalLink, Link2,
} from "lucide-react";
import { AdminChatTab } from "@/components/admin/AdminChatTab";

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

type Tab = "overview" | "chat" | "applications" | "programs" | "countries" | "partners" | "levels" | "commissions";

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
    ["levels", "Levels", Award],
    ["commissions", "Commissions", Wallet],
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
          <ProgramsTab programs={d.programs} onChange={refetch} />
        )}

        {/* ── COUNTRIES ── */}
        {tab === "countries" && (
          <CountriesTab countries={d.countries} programs={d.programs} onChange={refetch} />
        )}

        {/* ── PARTNERS ── */}
        {tab === "partners" && (
          <PartnersTab partners={d.partners} levels={d.levels} onChange={refetch} />
        )}

        {/* ── LEVELS ── */}
        {tab === "levels" && (
          <LevelsTab levels={d.levels} onChange={refetch} />
        )}

        {/* ── COMMISSIONS ── */}
        {tab === "commissions" && (
          <CommissionsTab commissions={d.commissions} onChange={refetch} />
        )}
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
  const [search, setSearch] = useState("");
  const [exp, setExp] = useState<string | null>(null);
  const statuses = ["all", "submitted", "in_review", "documents", "approved", "rejected"];
  const stages = [
    "0: تقديم ومستندات (Application & Docs)",
    "1: ديبوزت (Deposit)",
    "2: بري انترفيو (Pre-Interview)",
    "3: انترفيو (Interview)",
    "4: التصريح والتأشيرة (Permit & Visa)",
    "5: جاهز للسفر (Ready to Travel)",
  ];

  const filtered = apps.filter(a =>
    (filter === "all" || a.status === filter) &&
    (!search || (a.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.phone ?? "").includes(search) || (a.promo_code ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  const openDoc = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input className={`${inp} max-w-64`} placeholder="Search name, phone, promo…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs ${filter === s ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} applications</p>

      {filtered.map(a => {
        const expanded = exp === a.id;
        const due = a.payment_plan === "full" ? a.programs?.price : a.programs?.deposit;
        return (
          <div key={a.id} className="rounded-3xl border border-border bg-card overflow-hidden">
            {/* Summary row */}
            <button className="flex w-full items-start justify-between gap-4 p-5 text-start" onClick={() => setExp(expanded ? null : a.id)}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-semibold">{a.full_name ?? a.profiles?.full_name ?? "—"}</p>
                  <span className={`${pill} ${statusColor(a.status)}`}>{a.status}</span>
                  {a.deposit_paid && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">✓ Deposit paid</span>}
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                    Stage {a.stage ?? 0}: {stages[a.stage ?? 0]?.split("(")[0]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.programs?.countries?.name_en} · {a.programs?.title_en || a.programs?.track} · {eur(a.programs?.price ?? 0)}
                  {a.promo_code ? ` · 🏷 ${a.promo_code} (${a.discount_percent ?? 0}% off)` : ""}
                  {" · "}{a.payment_plan === "full" ? "Full payment" : `${a.installments}× installments`}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.phone ?? ""} · {a.passport_number ?? ""} · {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </button>

            {expanded && (
              <div className="border-t border-border px-5 pb-5 space-y-4">
                {/* Visual Timeline Controls for Admin */}
                <div className="pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Stage Timeline (Click circle to update stage)</p>
                  <div className="flex flex-wrap gap-2">
                    {stages.map((st, i) => {
                      const isCurrent = (a.stage ?? 0) === i;
                      const isPassed = (a.stage ?? 0) > i || (i === 1 && a.deposit_paid);
                      return (
                        <button
                          key={i}
                          onClick={async () => { await upd({ data: { id: a.id, stage: i } }); onChange(); }}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
                            isCurrent
                              ? "bg-beige text-navy font-bold ring-2 ring-navy/30"
                              : isPassed
                              ? "bg-navy text-ivory font-medium"
                              : "border border-border bg-background text-muted-foreground hover:border-beige"
                          }`}
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
                            {isPassed && !isCurrent ? "✓" : i}
                          </span>
                          {st.split("(")[0]?.trim() ?? ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <select value={a.status} onChange={async e => { await setStatus({ data: { id: a.id, status: e.target.value } }); onChange(); }}
                    className="rounded-full border border-input bg-background px-3 py-1.5 text-xs">
                    {["submitted", "in_review", "documents", "approved", "rejected"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={async () => { await upd({ data: { id: a.id, deposit_paid: !a.deposit_paid } }); onChange(); }}
                    className={`${pill} ${a.deposit_paid ? "bg-emerald-100 text-emerald-800" : "border border-beige text-foreground"}`}>
                    {a.deposit_paid ? `✓ Deposit paid (${eur(due ?? 0)})` : `Mark deposit paid (${eur(due ?? 0)})`}
                  </button>
                </div>

                {/* Personal info */}
                <div className="grid gap-2 rounded-2xl bg-secondary/40 p-4 text-sm sm:grid-cols-3">
                  {[["Name", a.full_name], ["Phone", a.phone], ["Passport", a.passport_number], ["Birth date", a.birth_date], ["Education", a.education], ["Created", new Date(a.created_at).toLocaleString()]].map(([l, v]) => (
                    <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v ?? "—"}</p></div>
                  ))}
                </div>

                {/* Documents */}
                {(a.application_documents ?? []).length > 0 && (
                  <div className="rounded-2xl border border-border overflow-hidden">
                    <p className="border-b border-border bg-secondary/40 px-4 py-2 text-xs font-medium text-muted-foreground">Documents ({a.application_documents.length})</p>
                    {a.application_documents.map((d: any) => (
                      <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 last:border-0 text-sm">
                        <button onClick={() => openDoc(d.file_path)} className="text-start underline-offset-2 hover:underline">
                          {d.doc_type} <span className="text-xs text-muted-foreground">({d.file_name})</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className={`${pill} ${statusColor(d.status)}`}>{d.status}</span>
                          {(["approved", "rejected"] as const).map(s => (
                            <button key={s} onClick={async () => { await setDoc({ data: { id: d.id, status: s } }); onChange(); }}
                              className={`${pill} border ${d.status === s ? (s === "approved" ? "bg-emerald-100 text-emerald-800 border-transparent" : "bg-red-100 text-red-800 border-transparent") : "border-border hover:border-beige"}`}>
                              {s === "approved" ? <CheckCircle2 className="inline h-3 w-3" /> : <XCircle className="inline h-3 w-3" />} {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <p className="py-12 text-center text-muted-foreground">No applications found</p>}
    </div>
  );
}

/* ═══════════════════════════════════════
   PROGRAMS TAB
═══════════════════════════════════════ */
function ProgramsTab({ programs, onChange }: { programs: any[]; onChange: () => void }) {
  const setPrice = useServerFn(adminUpdateProgramPrice);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  const countries = Array.from(new Set(programs.map((p: any) => p.countries?.name_en).filter(Boolean)));

  const filtered = programs.filter((p: any) => {
    const matchesSearch =
      !search ||
      p.title_en?.toLowerCase().includes(search.toLowerCase()) ||
      p.title_ar?.includes(search) ||
      p.category_en?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === "all" || p.countries?.name_en === countryFilter;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <input
            className={`${inp} max-w-60`}
            placeholder="Search programs, jobs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-full border border-input bg-background px-3 py-1.5 text-xs outline-none"
          >
            <option value="all">All Countries ({programs.length})</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} programs shown</p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="p-4 text-start font-medium">Program / Job Title</th>
              <th className="p-4 text-start font-medium">Country</th>
              <th className="p-4 text-start font-medium">Track</th>
              <th className="p-4 text-start font-medium">Duration</th>
              <th className="p-4 text-start font-medium">Price (€)</th>
              <th className="p-4 text-start font-medium">Deposit (€)</th>
              <th className="p-4 text-start font-medium">Max Inst.</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <ProgramRow
                key={p.id}
                p={p}
                onSave={async (v) => {
                  await setPrice({ data: { id: p.id, ...v } });
                  onChange();
                }}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No programs matching search.</p>
        )}
      </div>
    </div>
  );
}

function ProgramRow({ p, onSave }: { p: any; onSave: (v: any) => Promise<void> }) {
  const [price, setPrice] = useState(p.price);
  const [deposit, setDeposit] = useState(p.deposit);
  const [inst, setInst] = useState(p.max_installments);
  const [saving, setSaving] = useState(false);
  const dirty = price !== p.price || deposit !== p.deposit || inst !== p.max_installments;
  const cell = "w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-center";
  return (
    <tr className="border-b border-border last:border-0 hover:bg-secondary/30">
      <td className="p-4 font-medium">{p.title_en}</td>
      <td className="p-4 text-muted-foreground">{p.countries?.name_en}</td>
      <td className="p-4"><span className={`${pill} ${p.track === "student" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>{p.track}</span></td>
      <td className="p-4"><input type="number" className={cell} value={price} onChange={e => setPrice(+e.target.value)} /></td>
      <td className="p-4"><input type="number" className={cell} value={deposit} onChange={e => setDeposit(+e.target.value)} /></td>
      <td className="p-4"><input type="number" className={cell} min={1} max={12} value={inst} onChange={e => setInst(+e.target.value)} /></td>
      <td className="p-4">
        {dirty && <button disabled={saving} onClick={async () => { setSaving(true); await onSave({ price, deposit, max_installments: inst }); setSaving(false); }}
          className="flex items-center gap-1 rounded-full bg-navy px-4 py-1.5 text-xs text-ivory disabled:opacity-60">
          <Save className="h-3 w-3" /> Save
        </button>}
      </td>
    </tr>
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
function PartnersTab({ partners, levels, onChange }: { partners: any[]; levels: any[]; onChange: () => void }) {
  const manage = useServerFn(adminManagePartner);
  const addComm = useServerFn(adminAddCommission);
  const setComm = useServerFn(adminSetCommission);
  const [exp, setExp] = useState<string | null>(null);
  const [commForm, setCommForm] = useState<{ amount: string; note: string }>({ amount: "", note: "" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <p className="py-12 text-center text-muted-foreground">No partners found</p>}
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
  const filtered = commissions.filter((c: any) => filter === "all" || c.status === filter);
  const total = (s: string) => commissions.filter((c: any) => c.status === s).reduce((a: number, c: any) => a + c.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[["All", commissions.length + " records", "bg-secondary/60"], ["Pending", egp(total("pending")), "bg-amber-50"], ["Approved", egp(total("approved")), "bg-blue-50"], ["Paid", egp(total("paid")), "bg-emerald-50"]].map(([l, v, cls]) => (
          <div key={l} className={`rounded-2xl p-4 ${cls}`}>
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 font-display text-xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      {/* Filter */}
      <div className="flex gap-1">
        {["all", "pending", "approved", "paid", "cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-xs ${filter === s ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{s}</button>
        ))}
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-xs text-muted-foreground">
            <th className="p-4 text-start font-medium">Partner</th>
            <th className="p-4 text-start font-medium">Code</th>
            <th className="p-4 text-start font-medium">Amount</th>
            <th className="p-4 text-start font-medium">Note</th>
            <th className="p-4 text-start font-medium">Date</th>
            <th className="p-4 text-start font-medium">Status</th>
            <th className="p-4" />
          </tr></thead>
          <tbody>
            {filtered.map((c: any) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-4 font-medium">{(c.partners as any)?.profiles?.full_name ?? "—"}</td>
                <td className="p-4 font-mono text-xs text-muted-foreground">{(c.partners as any)?.promo_code}</td>
                <td className="p-4 font-semibold text-beige">{egp(c.amount)}</td>
                <td className="p-4 text-muted-foreground">{c.note ?? "—"}</td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-4"><span className={`${pill} ${statusColor(c.status)}`}>{c.status}</span></td>
                <td className="p-4">
                  <select value={c.status} onChange={async e => { await setComm({ data: { id: c.id, status: e.target.value as any } }); onChange(); }}
                    className="rounded-full border border-input bg-background px-2 py-1 text-xs">
                    {["pending", "approved", "paid", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No commissions found</p>}
      </div>
    </div>
  );
}
