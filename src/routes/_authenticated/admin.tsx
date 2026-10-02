import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview, adminUpdateApplicationStatus, adminUpdateProgramPrice } from "@/lib/account.functions";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/site/SiteChrome";
import { eur } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Kinetix" }] }),
  component: Admin,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="font-display text-2xl">{error.message === "Forbidden" ? "Admins only" : "Something went wrong"}</p>
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
          <div className="overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th className="p-4 text-start font-medium">{t("program")}</th><th className="p-4 text-start font-medium">{t("date")}</th><th className="p-4 text-start font-medium">{t("status")}</th>
              </tr></thead>
              <tbody>
                {(data.applications as any[]).map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="p-4">{a.programs?.title_en}<span className="block text-xs text-muted-foreground">{a.profiles?.full_name ?? "—"}</span></td>
                    <td className="p-4 text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <select value={a.status} onChange={async (e) => { await setStatus({ data: { id: a.id, status: e.target.value } }); queryClient.invalidateQueries({ queryKey: ["admin"] }); }}
                        className="rounded-full border border-input bg-background px-3 py-1.5 text-xs">
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {data.applications.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">—</td></tr>}
              </tbody>
            </table>
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
