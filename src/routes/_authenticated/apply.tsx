import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createApplication } from "@/lib/account.functions";
import { countries, eur, getProgram, MAX_INSTALLMENTS, type Track } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/site/SiteChrome";
import { DocUploader } from "@/components/site/DocUploader";

export const Route = createFileRoute("/_authenticated/apply")({
  validateSearch: (s: Record<string, unknown>): { program?: string | undefined } => ({ program: typeof s["program"] === "string" ? s["program"] : undefined }),
  head: () => ({ meta: [{ title: "Apply — Kinetix" }, { name: "description", content: "Apply to a Kinetix program and upload your documents." }] }),
  component: Apply,
});

const input = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-beige";

function Apply() {
  const { t, lang } = useLang();
  const ar = lang === "ar";
  const { program: initial } = Route.useSearch();
  const found = initial ? getProgram(initial) : undefined;
  const [countrySlug, setCountrySlug] = useState(found?.country.slug ?? countries[0]!.slug);
  const [track, setTrack] = useState<Track>(found?.program.track ?? "graduate");
  const [plan, setPlan] = useState<"full" | "installments">("installments");
  const [months, setMonths] = useState(MAX_INSTALLMENTS);
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ full_name: "", phone: "", passport_number: "", birth_date: "", education: "", promo_code: "" });
  const [appId, setAppId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = useServerFn(createApplication);

  const country = countries.find((c) => c.slug === countrySlug)!;
  const program = country.programs.find((p) => p.track === track) ?? country.programs[0]!;
  const dueNow = plan === "full" ? program.price : program.deposit;
  const monthly = Math.ceil((program.price - program.deposit) / months);

  const docsQ = useQuery({
    queryKey: ["app-docs", appId],
    enabled: !!appId,
    queryFn: async () => (await supabase.from("application_documents").select("id, doc_type, file_name, status").eq("application_id", appId!)).data ?? [],
  });

  const onSubmit = async () => {
    setErr(null); setBusy(true);
    try {
      const r = await submit({ data: { program: program.slug, payment_plan: plan, installments: plan === "full" ? 1 : months, ...f } });
      setAppId(r.id); setStep(2);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  const steps = [t("stepProgram"), t("stepDetails"), t("stepDocs")];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-navy text-ivory">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Logo />
          <Link to="/dashboard" className="text-sm text-ivory/70 hover:text-beige">{t("dashboard")}</Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <ol className="mb-8 grid grid-cols-3 gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-col gap-2">
              <span className={`h-1 rounded-full ${i <= step ? "bg-navy" : "bg-secondary"}`} />
              <span className={`text-xs ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{i + 1}. {s}</span>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-8">
            <div>
              <label className="eyebrow text-muted-foreground">{t("country")}</label>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {countries.map((c) => (
                  <button key={c.slug} onClick={() => setCountrySlug(c.slug)}
                    className={`relative h-20 overflow-hidden rounded-2xl text-start text-sm font-medium text-ivory ring-2 transition ${c.slug === countrySlug ? "ring-beige" : "ring-transparent opacity-80"}`}>
                    <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy/90 to-navy/10" />
                    <span className="absolute bottom-2 start-3">{ar ? c.nameAr : c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="eyebrow text-muted-foreground">{t("chooseTrack")}</label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(["student", "graduate"] as const).map((tr) => {
                  const p = country.programs.find((x) => x.track === tr)!;
                  const Icon = tr === "student" ? GraduationCap : Briefcase;
                  return (
                    <button key={tr} onClick={() => setTrack(tr)} className={`rounded-2xl border p-4 text-start transition ${track === tr ? "border-navy bg-navy text-ivory" : "border-border bg-card hover:border-beige"}`}>
                      <Icon className={`h-5 w-5 ${track === tr ? "text-beige" : "text-muted-foreground"}`} strokeWidth={1.5} />
                      <p className="mt-3 font-display text-lg font-semibold">{tr === "student" ? t("trackStudent") : t("trackGraduate")}</p>
                      <p className={`text-sm ${track === tr ? "text-ivory/70" : "text-muted-foreground"}`}>{eur(p.price)} · {p.duration}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="eyebrow text-muted-foreground">{t("paymentPlan")}</label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {([["full", t("payFull"), t("payFullSub")], ["installments", t("payInst"), t("payInstSub")]] as const).map(([k, l, sub]) => (
                  <button key={k} onClick={() => setPlan(k)} className={`rounded-2xl border p-4 text-start transition ${plan === k ? "border-navy ring-1 ring-navy" : "border-border hover:border-beige"}`}>
                    <p className="font-medium">{l}</p><p className="text-xs text-muted-foreground">{sub}</p>
                  </button>
                ))}
              </div>
              {plan === "installments" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.from({ length: MAX_INSTALLMENTS - 1 }, (_, k) => k + 2).map((n) => (
                    <button key={n} onClick={() => setMonths(n)} className={`h-11 min-w-11 rounded-full border px-3 text-sm ${n === months ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{n}</button>
                  ))}
                  <span className="self-center text-xs text-muted-foreground">{t("months")}</span>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-secondary p-5">
                <div><p className="text-xs text-muted-foreground">{t("dueNow")}</p><p className="font-display text-2xl">{eur(dueNow)}</p></div>
                {plan === "installments"
                  ? <div><p className="text-xs text-muted-foreground">{months}× {t("thenMonthly")}</p><p className="font-display text-2xl">{eur(monthly)}</p></div>
                  : <div><p className="text-xs text-muted-foreground">{t("totalCost")}</p><p className="font-display text-2xl">{eur(program.price)}</p></div>}
              </div>
            </div>

            <button onClick={() => setStep(1)} className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-medium text-ivory">
              {t("next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="mb-4 text-sm text-muted-foreground">{ar ? country.nameAr : country.name} · {track === "student" ? t("trackStudent") : t("trackGraduate")} · {plan === "full" ? t("payFull") : `${months} ${t("months")}`}</p>
            <input className={input} placeholder={`${t("fullName")} *`} maxLength={120} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
            <input className={input} placeholder={`${t("phone")} *`} type="tel" maxLength={40} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <input className={input} placeholder={t("passport")} maxLength={40} value={f.passport_number} onChange={(e) => setF({ ...f, passport_number: e.target.value })} />
            <label className="block text-xs text-muted-foreground">{t("birthDate")}
              <input className={`${input} mt-1`} type="date" value={f.birth_date} onChange={(e) => setF({ ...f, birth_date: e.target.value })} /></label>
            <input className={input} placeholder={t("education")} maxLength={200} value={f.education} onChange={(e) => setF({ ...f, education: e.target.value })} />
            <input className={`${input} uppercase`} placeholder={t("promoOptional")} maxLength={40} value={f.promo_code} onChange={(e) => setF({ ...f, promo_code: e.target.value })} />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <div className="flex gap-3 pt-3">
              <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-4 text-sm"><ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />{t("back")}</button>
              <button disabled={busy || !f.full_name.trim() || !f.phone.trim()} onClick={onSubmit} className="flex-1 rounded-full bg-navy py-4 font-medium text-ivory disabled:opacity-50">
                {busy ? t("submitting") : t("submitApp")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && appId && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-navy p-6 text-ivory">
              <CheckCircle2 className="h-7 w-7 text-beige" strokeWidth={1.5} />
              <h1 className="mt-3 font-display text-2xl font-semibold">{t("appDone")}</h1>
              <p className="mt-2 text-sm text-ivory/70">{t("appDoneSub")}</p>
              <p className="mt-4 font-display text-3xl text-beige">{eur(dueNow)}</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">{t("documentsWord")}</h2>
              <p className="mb-4 text-xs text-muted-foreground">{t("docsHint")}</p>
              <DocUploader appId={appId} docTypes={country.documents} existing={(docsQ.data ?? []) as any[]} onChange={() => docsQ.refetch()} />
            </div>
            <Link to="/dashboard" className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-4 font-medium text-ivory">{t("goDashboard")}</Link>
          </div>
        )}
      </div>
    </main>
  );
}
