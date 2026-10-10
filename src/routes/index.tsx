import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, Compass, FileCheck2, PlaneTakeoff, Wallet, ShieldCheck, Eye,
  CalendarClock, Users, Plus, Minus, Gift, MapPin, Sparkles, Globe,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { Reveal } from "@/components/site/Reveal";
import { countries, fromPrice, fromDeposit, eur } from "@/lib/catalog";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinetix — Your next career move starts here" },
      { name: "description", content: "Explore international work programs in Bulgaria, Luxembourg, Armenia, Russia and Italy with transparent costs and flexible payment plans." },
      { property: "og:title", content: "Kinetix — International career mobility" },
      { property: "og:description", content: "Work abroad with transparent costs, installment plans and guidance from application to arrival." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ico = { strokeWidth: 1.25, className: "h-6 w-6" };

function Index() {
  return (
    <main>
      <Nav />
      <Hero />
      <Countries />
      <Featured />
      <How />
      <Why />
      <Pricing />
      <Partners />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="relative isolate overflow-hidden bg-navy text-ivory">
      <img src={hero} alt="Traveler watching planes at an airport terminal" width={1600} height={1008}
        className="absolute inset-0 -z-10 h-full w-full scale-105 object-cover object-[30%_center] opacity-55" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/80 to-navy/20" />
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden>
        <path d="M80 650 C 350 520, 520 700, 760 420 S 1080 180, 1160 140" fill="none" stroke="var(--beige)" strokeWidth="1.2" strokeDasharray="4 6" className="animate-route opacity-70" />
        {[[80, 650], [760, 420], [1160, 140]].map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r="5" fill="var(--beige)" /><circle cx={x} cy={y} r="5" fill="var(--beige)" className="animate-ping-dot" style={{ animationDelay: `${i * 0.6}s` }} /></g>
        ))}
      </svg>
      <div className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 md:px-8 md:pb-24">
        <p className="eyebrow animate-in fade-in slide-in-from-bottom-2 text-beige duration-700">{t("heroEyebrow")}</p>
        <h1 className="mt-5 max-w-4xl animate-in fade-in slide-in-from-bottom-4 text-5xl font-semibold leading-[1.02] duration-1000 md:text-7xl lg:text-8xl">
          {t("heroTitle1")} <span className="text-beige">{t("heroTitle2")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg">{t("heroSub")}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a href="#countries" className="group inline-flex items-center justify-center gap-2 rounded-full bg-beige px-7 py-4 font-medium text-navy transition-transform hover:-translate-y-0.5">
            {t("exploreCta")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" strokeWidth={1.5} />
          </a>
          <Link to="/auth" className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/30 px-7 py-4 font-medium transition-colors hover:border-beige hover:text-beige">
            {t("applyCta")}
          </Link>
        </div>
        <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-ivory/15 pt-6">
          {[["5", t("statCountries")], ["7", t("statPrograms")], ["6×", t("statInstallments")]].map(([n, l]) => (
            <div key={l}><p className="font-display text-2xl text-beige md:text-3xl">{n}</p><p className="mt-1 text-xs text-ivory/60 md:text-sm">{l}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="max-w-2xl">
      <p className="eyebrow text-muted-foreground"><span className="me-2 inline-block h-px w-6 bg-beige align-middle" />{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.05] md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}

function Countries() {
  const { t, lang } = useLang();
  return (
    <section id="countries" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead eyebrow={t("countriesEyebrow")} title={t("countriesTitle")} />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c, i) => (
          <Reveal key={c.slug} delay={i * 80} className={i === 0 ? "lg:row-span-2" : ""}>
            <Link to="/countries/$slug" params={{ slug: c.slug }} className="group relative block h-full min-h-[420px] overflow-hidden rounded-2xl bg-navy text-ivory">
              <img src={c.image} alt={c.name} loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
              <div className="relative flex h-full min-h-[420px] flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full border border-beige/40 bg-navy/40 px-3 py-1.5 text-xs font-medium text-beige backdrop-blur"><Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />{c.programs.length} {t("programsWord")}</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rtl:rotate-180" strokeWidth={1.25} />
                </div>
                <div>
                  <h3 className="text-3xl font-semibold">{lang === "ar" ? c.nameAr : c.name}</h3>
                  <p className="mt-1 text-sm text-ivory/70">{lang === "ar" ? c.taglineAr : c.tagline}</p>
                  <div className="mt-5 flex items-end justify-between border-t border-ivory/15 pt-4">
                    <div>
                      <p className="text-xs text-ivory/60">{lang === "ar" ? "المقدم يبدأ من" : "Deposit starts from"}</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-display text-2xl font-bold text-beige">{eur(fromDeposit(c))}</span>
                        <span className="text-xs font-semibold text-emerald-400">≈ {Math.round(fromDeposit(c) * 54).toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</span>
                      </div>
                      <p className="text-[11px] text-ivory/50 mt-0.5">{lang === "ar" ? "إجمالي البرنامج من" : "Total from"} {eur(fromPrice(c))}</p>
                    </div>
                    <span className="text-sm text-ivory/80 inline-flex items-center gap-1">{t("viewPrograms")} ←</span>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const { t, lang } = useLang();
  const all = countries.flatMap((c) => c.programs.map((p) => ({ ...p, country: c })));
  return (
    <section className="bg-secondary/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead eyebrow={t("featuredEyebrow")} title={t("featuredTitle")} />
        <div className="mt-12 divide-y divide-border border-y border-border">
          {all.map((p, i) => (
            <Reveal key={p.slug} delay={i * 40}>
              <Link to="/countries/$slug" params={{ slug: p.country.slug }} className="group grid grid-cols-[1fr_auto] items-center gap-4 py-6 md:grid-cols-[2fr_1fr_1fr_1.5fr_auto]">
                <div><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-beige" strokeWidth={1.5} />{lang === "ar" ? p.country.nameAr : p.country.name}</p><p className="mt-1 font-display text-xl font-medium">{lang === "ar" ? p.titleAr : p.title}</p></div>
                <p className="hidden text-sm text-muted-foreground md:block">{lang === "ar" ? p.categoryAr : p.category}</p>
                <p className="hidden text-sm text-muted-foreground md:block">{p.duration}</p>
                <div className="hidden text-end md:block">
                  <p className="text-xs text-muted-foreground">{lang === "ar" ? "المقدم" : "Deposit"}: <span className="font-display text-base font-bold text-navy dark:text-beige">{eur(p.deposit)}</span></p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">≈ {Math.round(p.deposit * 54).toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</p>
                  <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "الإجمالي" : "Total"}: {eur(p.price)}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground rtl:rotate-180 rtl:group-hover:-translate-x-1" strokeWidth={1.25} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  const { t } = useLang();
  const steps = [
    { i: Compass, t: t("how1t"), d: t("how1d") },
    { i: FileCheck2, t: t("how2t"), d: t("how2d") },
    { i: Wallet, t: t("how3t"), d: t("how3d") },
    { i: PlaneTakeoff, t: t("how4t"), d: t("how4d") },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead eyebrow={t("howEyebrow")} title={t("howTitle")} />
      <div className="relative mt-14 grid gap-10 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-beige md:block" />
        {steps.map(({ i: I, t: title, d }, n) => (
          <Reveal key={title} delay={n * 100} className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-beige bg-background"><I {...ico} /></div>
            <p className="eyebrow mt-6 text-muted-foreground">{t("step")} 0{n + 1}</p>
            <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Why() {
  const { t } = useLang();
  const items = [
    { i: Eye, t: t("why1t"), d: t("why1d") },
    { i: CalendarClock, t: t("why2t"), d: t("why2d") },
    { i: ShieldCheck, t: t("why3t"), d: t("why3d") },
    { i: MapPin, t: t("why4t"), d: t("why4d") },
  ];
  return (
    <section className="bg-navy py-24 text-ivory md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <p className="eyebrow text-beige">{t("whyEyebrow")}</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] md:text-5xl">{t("whyTitle")}</h2>
          <p className="mt-5 max-w-md text-ivory/65">{t("whySub")}</p>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-2xl bg-ivory/10 sm:grid-cols-2">
          {items.map(({ i: I, t: title, d }) => (
            <div key={title} className="bg-navy p-7 transition-colors hover:bg-navy-soft">
              <I {...ico} className="h-6 w-6 text-beige" />
              <h3 className="mt-5 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-ivory/60">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { t, lang } = useLang();
  // Display only the cheapest plan from each country
  const cheapestPerCountry = countries.map((c) => {
    const cheapest = c.programs.reduce(
      (min, cur) => (cur.price < min.price ? cur : min),
      c.programs[0]!
    );
    return {
      ...cheapest,
      countryName: lang === "ar" ? c.nameAr : c.name,
      countryFlag: c.flag,
      countrySlug: c.slug,
    };
  });

  const [slug, setSlug] = useState(cheapestPerCountry[0]!.slug);
  const p = cheapestPerCountry.find((x) => x.slug === slug) ?? cheapestPerCountry[0]!;
  const [months, setMonths] = useState(p.installments);
  const [full, setFull] = useState(false);
  const m = Math.min(months, p.installments);

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="grid gap-12 lg:grid-cols-2">
        <SectionHead eyebrow={t("pricingEyebrow")} title={t("pricingTitle")} sub={t("pricingSub")} />
        <Reveal className="rounded-3xl border border-border bg-card p-6 shadow-[0_30px_60px_-30px_var(--navy)] md:p-8">
          <div className="flex items-center justify-between">
            <label className="eyebrow text-muted-foreground">
              {lang === "ar" ? "أرخص خطة معتمدة لكل دولة" : "Cheapest Plan per Country"}
            </label>
            <span className="text-[11px] font-semibold text-beige bg-navy px-2.5 py-0.5 rounded-full">
              {lang === "ar" ? "أفضل سعر للوجهة" : "Best Value Tier"}
            </span>
          </div>
          <select
            value={slug}
            onChange={(e) => {
              const newSlug = e.target.value;
              setSlug(newSlug);
              const found = cheapestPerCountry.find((x) => x.slug === newSlug);
              if (found) setMonths(found.installments);
            }}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 font-medium outline-none focus:border-beige"
          >
            {cheapestPerCountry.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.countryFlag} {x.countryName} — {lang === "ar" ? x.titleAr : x.title} ({eur(x.price)})
              </option>
            ))}
          </select>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-muted-foreground">{t("totalCost")}</span>
            <div className="text-end">
              <span className="font-display text-4xl font-semibold">{eur(p.price)}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">≈ {Math.round(p.price * 54).toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</span>
            </div>
          </div>
          <p className="eyebrow mt-8 text-muted-foreground">{t("paymentPlan")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {([[true, t("payFull")], [false, t("payInst")]] as const).map(([v, l]) => (
              <button key={l} onClick={() => setFull(v)} className={`rounded-full border py-2.5 text-sm ${full === v ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{l}</button>
            ))}
          </div>
          {!full && <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: p.installments - 1 }, (_, k) => k + 2).map((n) => (
              <button key={n} onClick={() => setMonths(n)} className={`h-11 w-11 rounded-full border text-sm transition-colors ${n === Math.max(m, 2) ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{n}</button>
            ))}
          </div>}
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl bg-secondary p-5">
            <div>
              <p className="text-xs text-muted-foreground">{t("dueToday")}</p>
              <p className="font-display text-2xl font-bold">{eur(full ? p.price : p.deposit)}</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">≈ {Math.round((full ? p.price : p.deposit) * 54).toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</p>
            </div>
            {full ? (
              <div>
                <p className="text-xs text-muted-foreground">{t("remaining")}</p>
                <p className="font-display text-2xl">{eur(0)}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">{Math.max(m, 2)}× {t("thenMonthly")}</p>
                <p className="font-display text-2xl">{eur(Math.ceil((p.price - p.deposit) / Math.max(m, 2)))}</p>
                <p className="text-xs text-muted-foreground mt-0.5">≈ {Math.round(Math.ceil((p.price - p.deposit) / Math.max(m, 2)) * 54).toLocaleString()} {lang === "ar" ? "ج.م" : "EGP"}</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link to="/apply" search={{ program: p.slug }} className="flex items-center justify-center gap-2 rounded-full bg-navy py-4 font-medium text-ivory transition-transform hover:-translate-y-0.5">
              {t("applyProgram")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
            </Link>
            <Link to="/pricing" className="text-center text-xs font-semibold text-muted-foreground hover:text-navy transition-colors py-1">
              {lang === "ar" ? "عرض مقارنة الأسعار الشاملة لجميع الدول والبرامج ←" : "View comprehensive pricing comparison for all programs →"}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Partners() {
  const { t } = useLang();
  return (
    <section id="partners" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
      <div className="grid gap-5 md:grid-cols-2">
        <Reveal className="h-full rounded-3xl bg-beige-soft p-8 md:p-10">
          <Gift {...ico} />
          <h3 className="mt-6 text-3xl font-semibold">{t("promoTitle")}</h3>
          <p className="mt-3 text-muted-foreground">{t("promoText")}</p>
        </Reveal>
        <Reveal delay={100} className="h-full rounded-3xl bg-navy p-8 text-ivory md:p-10">
          <Users {...ico} className="h-6 w-6 text-beige" />
          <h3 className="mt-6 text-3xl font-semibold">{t("partnerTitle")}</h3>
          <p className="mt-3 text-ivory/65">{t("partnerText")}</p>
          <Link to="/partners/join" className="mt-6 inline-flex items-center gap-2 text-beige">{t("becomePartner")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

const faqs = [
  ["Is employment guaranteed?", "No agency can honestly guarantee it. We match you with verified employers and support every step, but final decisions rest with employers and authorities.",
   "هل التوظيف مضمون؟", "لا تستطيع أي جهة ضمان ذلك بصدق. نطابقك مع أصحاب عمل موثوقين وندعمك في كل خطوة، لكن القرار النهائي لأصحاب العمل والسلطات."],
  ["What is included in the price?", "Program fees cover matching, document preparation, permit processing support and pre-departure guidance. Each program lists exactly what's included.",
   "ماذا يشمل السعر؟", "تغطي رسوم البرنامج المطابقة وتجهيز المستندات ودعم إجراءات التصاريح والإرشاد قبل السفر. كل برنامج يوضح بالضبط ما يشمله."],
  ["Can I pay in installments?", "Yes. Pay a deposit to start, then split the rest into up to six monthly payments depending on the program.",
   "هل يمكنني الدفع بالتقسيط؟", "نعم. ادفع دفعة أولى للبدء، ثم قسّط الباقي حتى ست دفعات شهرية حسب البرنامج."],
  ["What documents do I need?", "Usually a valid passport, photo, CV, medical certificate and police clearance. Each country page lists the exact requirements.",
   "ما المستندات المطلوبة؟", "عادةً جواز سفر ساري وصورة وسيرة ذاتية وشهادة طبية وصحيفة جنائية. كل صفحة دولة تذكر المتطلبات بدقة."],
];

function Faq() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-secondary/60 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1fr_1.4fr] md:px-8">
        <SectionHead eyebrow={t("faqEyebrow")} title={t("faqTitle")} />
        <div className="divide-y divide-border border-y border-border">
          {faqs.map(([q, a, qAr, aAr], i) => (
            <div key={q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-6 text-start font-display text-lg font-medium">
                {lang === "ar" ? qAr : q}{open === i ? <Minus className="h-5 w-5 shrink-0" strokeWidth={1.25} /> : <Plus className="h-5 w-5 shrink-0" strokeWidth={1.25} />}
              </button>
              {open === i && <p className="animate-in fade-in pb-6 text-muted-foreground">{lang === "ar" ? aAr : a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  const { t } = useLang();
  return (
    <section id="apply" className="bg-navy text-ivory">
      <div className="mx-auto max-w-7xl px-5 py-24 text-center md:px-8 md:py-32">
        <p className="eyebrow text-beige">{t("ctaEyebrow")}</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] md:text-6xl">{t("ctaTitle")}</h2>
        <p className="mx-auto mt-5 max-w-lg text-ivory/65">{t("ctaSub")}</p>
        <Link to="/auth" className="mt-10 inline-flex items-center gap-2 rounded-full bg-beige px-8 py-4 font-medium text-navy transition-transform hover:-translate-y-0.5">
          {t("applyCta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
