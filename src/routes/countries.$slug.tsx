import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock, FileText, Globe } from "lucide-react";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { Reveal } from "@/components/site/Reveal";
import { getCountry, eur } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/countries/$slug")({
  loader: ({ params }) => {
    const country = getCountry(params.slug);
    if (!country) throw notFound();
    return { country };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.country;
    const title = c ? `Work in ${c.name} — Kinetix` : "Country — Kinetix";
    const desc = c ? `${c.tagline}. Programs, costs, payment plans and requirements.` : "Kinetix country programs.";
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: function NotFound() {
    const { t } = useLang();
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-display text-2xl">{t("notPrepared")}</p>
        <Link to="/" className="underline">{t("backCountries")}</Link>
      </div>
    );
  },
  component: CountryPage,
});

function CountryPage() {
  const { country: c } = Route.useLoaderData();
  const { t, lang } = useLang();
  const ar = lang === "ar";
  return (
    <main>
      <Nav />
      <section className="relative isolate overflow-hidden bg-navy text-ivory">
        <img src={c.image} alt={c.name} width={1024} height={1280} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/60 to-navy/30" />
        <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 md:px-8">
          <Link to="/" hash="countries" className="mb-8 inline-flex items-center gap-2 text-sm text-ivory/70 hover:text-beige"><ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} /> {t("backCountries")}</Link>
          <p className="eyebrow flex items-center gap-2 text-beige"><Globe className="h-4 w-4" strokeWidth={1.5} />{t("countriesEyebrow")}</p>
          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">{ar ? c.nameAr : c.name}</h1>
          <p className="mt-5 max-w-xl text-lg text-ivory/75">{ar ? c.descriptionAr : c.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <p className="eyebrow text-muted-foreground">{t("availablePrograms")}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {c.programs.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} className="rounded-3xl border border-border bg-card p-7">
              <div className="flex items-start justify-between">
                <div><p className="text-xs text-muted-foreground">{p.duration}</p><h2 className="mt-2 text-3xl font-semibold">{ar ? p.titleAr : p.title}</h2></div>
                <p className="font-display text-3xl">{eur(p.price)}</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-secondary p-5 text-sm">
                <div><p className="text-muted-foreground">{t("payFull")}</p><p className="font-display text-xl">{eur(p.price)}</p></div>
                <div><p className="text-muted-foreground">{t("deposit")} + {t("upTo")} {p.installments}× </p><p className="font-display text-xl">{eur(p.deposit)} + {eur(Math.ceil((p.price - p.deposit) / p.installments))}</p></div>
              </div>
              <Link to="/apply" search={{ program: p.slug }} className="mt-6 inline-flex items-center gap-2 font-medium">{t("apply")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} /></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-3 md:px-8">
          <div>
            <p className="eyebrow text-muted-foreground">{t("requiredDocs")}</p>
            <ul className="mt-6 space-y-3">{c.documents.map((d) => <li key={d} className="flex gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.25} />{d}</li>)}</ul>
          </div>
          <div>
            <p className="eyebrow text-muted-foreground">{t("eligibility")}</p>
            <ul className="mt-6 space-y-3">{c.eligibility.map((d) => <li key={d} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.25} />{d}</li>)}</ul>
          </div>
          <div>
            <p className="eyebrow text-muted-foreground">{t("timeline")}</p>
            <ol className="mt-6 space-y-5 border-s border-dashed border-beige ps-6">
              {c.timeline.map((x) => <li key={x.step}><p className="font-medium">{x.step}</p><p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" strokeWidth={1.5} />{x.time}</p></li>)}
            </ol>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
