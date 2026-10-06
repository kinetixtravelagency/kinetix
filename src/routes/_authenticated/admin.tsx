import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview, adminUpdateApplicationStatus, adminUpdateProgramPrice, adminUpdateApplication, adminSetDocumentStatus } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/site/SiteChrome";
import { eur } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Kinetix" }] }),
  component: Admin,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="font-display text-2xl">{(error as Error).message === "Forbidden" ? "Admins only" : "Something went wrong"}</p>
      <Link to="/dashboard" className="underline">Back to dashboard</Link>
    </div>
  ),
});

const statuses = ["submitted", "in_review", "documents", "approved", "rejected"];

function Admin() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const fetchOverview = useServerFn(getAdminOverview);
  const setStatus = useServerFn(adminUpdateApplicationStatus);
  const setPrice = useServerFn(adminUpdateProgramPrice);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin"], queryFn: fetchOverview, retry: false });
  const [tab, setTab] = useState<"overview" | "applications" | "programs" | "partners">("overview");

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">…</div>;
  if (error || !data) return <div className="flex min-h-screen flex-col items-center justify-center gap-3"><p className="font-display text-2xl">Admins only</p><Link to="/dashboard" className="underline">Back to dashboard</Link></div>;

  const tabs = [["overview", t("overview")], ["applications", t("applications")], ["programs", t("programsAdmin")], ["partners", t("partnersAdmin")]] as const;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-navy text-ivory">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <Link to="/dashboard" className="text-sm text-ivory/70 hover:text-beige">{t("dashboard")}</Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm transition-colors ${tab === k ? "bg-beige text-navy" : "text-ivory/70 hover:text-ivory"}`}>{l}</button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[[t("applications"), data.applications.length], [t("partnersAdmin"), data.partners.length], [t("countries"), data.countries.length], [t("programsAdmin"), data.programs.length]].map(([l, n]) => (
              <div key={l as string} className="rounded-3xl border border-border bg-card p-6"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-2 font-display text-4xl font-semibold">{n}</p></div>
            ))}
          </div>
        )}

        {tab === "applications" && (
          <div className="space-y-4">
            {(data.applications as any[]).map((a) => (
              <AppCard key={a.id} a={a} onChange={() => queryClient.invalidateQueries({ queryKey: ["admin"] })} statusSel={
                <select value={a.status} onChange={async (e) => { await setStatus({ data: { id: a.id, status: e.target.value } }); queryClient.invalidateQueries({ queryKey: ["admin"] }); }}
                  className="rounded-full border border-input bg-background px-3 py-1.5 text-xs">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>} />
            ))}
            {data.applications.length === 0 && <p className="p-8 text-center text-muted-foreground">—</p>}
          </div>
        )}

        {tab === "programs" && (
          <div className="overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-muted-foreground">
                <th className="p-4 text-start font-medium">{t("program")}</th><th className="p-4 text-start font-medium">{t("country")}</th>
                <th className="p-4 text-start font-medium">{t("price")}</th><th className="p-4 text-start font-medium">{t("deposit")}</th><th className="p-4 text-start font-medium">{t("installmentsLabel")}</th><th className="p-4" />
              </tr></thead>
              <tbody>
                {(data.programs as any[]).map((p) => <ProgramRow key={p.id} p={p} onSave={async (v) => { await setPrice({ data: { id: p.id, ...v } }); queryClient.invalidateQueries({ queryKey: ["admin"] }); }} />)}
              </tbody>
            </table>
          </div>
        )}

        {tab === "partners" && (
          <div className="overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-muted-foreground">
                <th className="p-4 text-start font-medium">{t("fullName")}</th><th className="p-4 text-start font-medium">{t("promoCode")}</th>
                <th className="p-4 text-start font-medium">{t("level")}</th><th className="p-4 text-start font-medium">{t("commissionRate")}</th>
              </tr></thead>
              <tbody>
                {(data.partners as any[]).map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-4">{p.profiles?.full_name ?? "—"}</td><td className="p-4 font-mono">{p.promo_code}</td>
                    <td className="p-4">{p.level}</td><td className="p-4">{p.commission_rate}%</td>
                  </tr>
                ))}
                {data.partners.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">—</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function ProgramRow({ p, onSave }: { p: any; onSave: (v: { price: number; deposit: number; max_installments: number }) => Promise<void> }) {
  const { t } = useLang();
  const [price, setPrice] = useState(p.price);
  const [deposit, setDeposit] = useState(p.deposit);
  const [inst, setInst] = useState(p.max_installments);
  const dirty = price !== p.price || deposit !== p.deposit || inst !== p.max_installments;
  const cell = "w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm";
  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-4 font-medium">{p.title_en}</td>
      <td className="p-4 text-muted-foreground">{p.countries?.name_en}</td>
      <td className="p-4"><input type="number" className={cell} value={price} onChange={(e) => setPrice(+e.target.value)} /></td>
      <td className="p-4"><input type="number" className={cell} value={deposit} onChange={(e) => setDeposit(+e.target.value)} /></td>
      <td className="p-4"><input type="number" className={cell} value={inst} onChange={(e) => setInst(+e.target.value)} /></td>
      <td className="p-4">{dirty && <button onClick={() => onSave({ price, deposit, max_installments: inst })} className="rounded-full bg-navy px-4 py-1.5 text-xs text-ivory">{t("save")}</button>}</td>
    </tr>
  );
}

function AppCard({ a, onChange, statusSel }: { a: any; onChange: () => void; statusSel: ReactNode }) {
  const { t } = useLang();
  const upd = useServerFn(adminUpdateApplication);
  const setDoc = useServerFn(adminSetDocumentStatus);
  const stages = [t("stage0"), t("stage1"), t("stage2"), t("stage3"), t("stage4"), t("stage5")];
  const open = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };
  const due = a.payment_plan === "full" ? a.programs?.price : a.programs?.deposit;
  return (
    <div className="rounded-3xl border border-border bg-card p-5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">{a.full_name ?? a.profiles?.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{a.phone ?? a.profiles?.phone ?? ""} · {a.passport_number ?? ""} · {a.education ?? ""}</p>
          <p className="mt-1 text-xs text-muted-foreground">{a.programs?.countries?.name_en} · {a.programs?.track} · {a.payment_plan === "full" ? t("payFull") : `${a.installments}× ${t("months")}`} · {eur(a.programs?.price ?? 0)}{a.promo_code ? ` · ${a.promo_code}` : ""}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusSel}
          <select value={a.stage} onChange={async (e) => { await upd({ data: { id: a.id, stage: +e.target.value } }); onChange(); }} className="rounded-full border border-input bg-background px-3 py-1.5 text-xs">
            {stages.map((s, i) => <option key={i} value={i}>{s}</option>)}
          </select>
          <button onClick={async () => { await upd({ data: { id: a.id, deposit_paid: !a.deposit_paid } }); onChange(); }}
            className={`rounded-full px-3 py-1.5 text-xs ${a.deposit_paid ? "bg-navy text-ivory" : "border border-beige text-foreground"}`}>
            {a.deposit_paid ? `✓ ${t("depositPaid")}` : `${t("depositPaid")}? (${eur(due ?? 0)})`}
          </button>
        </div>
      </div>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border">
        {(a.application_documents ?? []).map((d: any) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
            <button onClick={() => open(d.file_path)} className="text-start underline-offset-2 hover:underline">{d.doc_type} <span className="text-xs text-muted-foreground">({d.file_name})</span></button>
            <div className="flex gap-1">
              {(["approved", "rejected"] as const).map((s) => (
                <button key={s} onClick={async () => { await setDoc({ data: { id: d.id, status: s } }); onChange(); }}
                  className={`rounded-full px-3 py-1 text-xs ${d.status === s ? (s === "approved" ? "bg-navy text-ivory" : "bg-destructive text-destructive-foreground") : "border border-border"}`}>
                  {s === "approved" ? t("docApproved") : t("docRejected")}
                </button>
              ))}
            </div>
          </div>
        ))}
        {(a.application_documents ?? []).length === 0 && <p className="px-4 py-3 text-xs text-muted-foreground">—</p>}
      </div>
    </div>
  );
}
