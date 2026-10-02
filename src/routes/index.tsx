import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, Compass, FileCheck2, PlaneTakeoff, Wallet, ShieldCheck, Eye,
  CalendarClock, Users, Plus, Minus, Gift, MapPin,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { Reveal } from "@/components/site/Reveal";
import { countries, fromPrice, eur } from "@/lib/catalog";

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
        <p className="eyebrow animate-in fade-in slide-in-from-bottom-2 text-beige duration-700">International career mobility</p>
        <h1 className="mt-5 max-w-4xl animate-in fade-in slide-in-from-bottom-4 text-5xl font-semibold leading-[1.02] duration-1000 md:text-7xl lg:text-8xl">
          Your next career move <span className="text-beige">starts here.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg">
          Explore international work opportunities, understand the costs, prepare your documents, and start your journey with Kinetix.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a href="#countries" className="group inline-flex items-center justify-center gap-2 rounded-full bg-beige px-7 py-4 font-medium text-navy transition-transform hover:-translate-y-0.5">
            Explore Opportunities <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </a>
          <a href="#apply" className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/30 px-7 py-4 font-medium transition-colors hover:border-beige hover:text-beige">
            Start Your Application
          </a>
        </div>
        <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-ivory/15 pt-6">
          {[["5", "Countries"], ["7", "Programs"], ["6×", "Installments"]].map(([n, l]) => (
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
      <p className="eyebrow text-muted-foreground"><span className="mr-2 inline-block h-px w-6 bg-beige align-middle" />{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.05] md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}

function Countries() {
  return (
    <section id="countries" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead eyebrow="Destinations" title="Where could your next move take you?" />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c, i) => (
          <Reveal key={c.slug} delay={i * 80} className={i === 0 ? "lg:row-span-2" : ""}>
            <Link to="/countries/$slug" params={{ slug: c.slug }} className="group relative block h-full min-h-[420px] overflow-hidden rounded-2xl bg-navy text-ivory">
              <img src={c.image} alt={c.name} loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
              <div className="relative flex h-full min-h-[420px] flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-ivory/25 bg-navy/40 px-3 py-1 text-xs backdrop-blur">{c.flag} {c.programs.length} program{c.programs.length > 1 ? "s" : ""}</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.25} />
                </div>
                <div>
                  <h3 className="text-3xl font-semibold">{c.name}</h3>
                  <p className="mt-1 text-sm text-ivory/70">{c.tagline}</p>
                  <div className="mt-5 flex items-end justify-between border-t border-ivory/15 pt-4">
                    <div><p className="text-xs text-ivory/55">From</p><p className="font-display text-2xl text-beige">{eur(fromPrice(c))}</p></div>
                    <span className="text-sm text-ivory/80">View programs →</span>
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
  const all = countries.flatMap((c) => c.programs.map((p) => ({ ...p, country: c })));
  return (
    <section className="bg-secondary/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead eyebrow="Featured programs" title="Clear programs. Clear prices." />
        <div className="mt-12 divide-y divide-border border-y border-border">
          {all.map((p, i) => (
            <Reveal key={p.slug} delay={i * 40}>
              <Link to="/countries/$slug" params={{ slug: p.country.slug }} className="group grid grid-cols-[1fr_auto] items-center gap-4 py-6 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <div><p className="text-xs text-muted-foreground">{p.country.flag} {p.country.name}</p><p className="mt-1 font-display text-xl font-medium">{p.title}</p></div>
                <p className="hidden text-sm text-muted-foreground md:block">{p.category}</p>
                <p className="hidden text-sm text-muted-foreground md:block">{p.duration}</p>
                <p className="hidden font-display text-lg md:block">{eur(p.price)}</p>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" strokeWidth={1.25} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    { i: Compass, t: "Choose", d: "Explore countries and pick the program that fits your goals." },
    { i: FileCheck2, t: "Apply", d: "Submit your application and upload documents securely." },
    { i: Wallet, t: "Pay in parts", d: "Start with a deposit, then pay the rest in installments." },
    { i: PlaneTakeoff, t: "Move", d: "We guide permits, visa and travel until you arrive." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHead eyebrow="How Kinetix works" title="Four steps from idea to arrival." />
      <div className="relative mt-14 grid gap-10 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-beige md:block" />
        {steps.map(({ i: I, t, d }, n) => (
          <Reveal key={t} delay={n * 100} className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-beige bg-background"><I {...ico} /></div>
            <p className="eyebrow mt-6 text-muted-foreground">Step 0{n + 1}</p>
            <h3 className="mt-2 text-2xl font-semibold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Why() {
  const items = [
    { i: Eye, t: "Full price transparency", d: "Every cost listed upfront. No surprise fees." },
    { i: CalendarClock, t: "Flexible installments", d: "Spread payments across up to six months." },
    { i: ShieldCheck, t: "Secure documents", d: "Encrypted storage, visible only to your case team." },
    { i: MapPin, t: "End-to-end guidance", d: "One advisor from first call to first day at work." },
  ];
  return (
    <section className="bg-navy py-24 text-ivory md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <p className="eyebrow text-beige">Why Kinetix</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] md:text-5xl">Not a visa office. A mobility partner.</h2>
          <p className="mt-5 max-w-md text-ivory/65">We built Kinetix for people who want to understand every step of their move — and every euro.</p>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-2xl bg-ivory/10 sm:grid-cols-2">
          {items.map(({ i: I, t, d }) => (
            <div key={t} className="bg-navy p-7 transition-colors hover:bg-navy-soft">
              <I {...ico} className="h-6 w-6 text-beige" />
              <h3 className="mt-5 text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm text-ivory/60">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const all = countries.flatMap((c) => c.programs.map((p) => ({ ...p, country: c.name })));
  const [slug, setSlug] = useState(all[all.length - 1]!.slug);
  const p = all.find((x) => x.slug === slug)!;
  const [months, setMonths] = useState(p.installments);
  const m = Math.min(months, p.installments);
  const monthly = Math.ceil((p.price - p.deposit) / m);
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="grid gap-12 lg:grid-cols-2">
        <SectionHead eyebrow="Transparent costs & payment plans" title="Know the full price before you start." sub="Pick a program and see exactly what you pay today and every month after." />
        <Reveal className="rounded-3xl border border-border bg-card p-6 shadow-[0_30px_60px_-30px_var(--navy)] md:p-8">
          <label className="eyebrow text-muted-foreground">Program</label>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 font-medium outline-none focus:border-beige">
            {all.map((x) => <option key={x.slug} value={x.slug}>{x.country} — {x.title}</option>)}
          </select>
          <div className="mt-6 flex items-baseline justify-between"><span className="text-muted-foreground">Total program cost</span><span className="font-display text-4xl font-semibold">{eur(p.price)}</span></div>
          <p className="eyebrow mt-8 text-muted-foreground">Installments</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: p.installments }, (_, k) => k + 1).map((n) => (
              <button key={n} onClick={() => setMonths(n)} className={`h-11 w-11 rounded-full border text-sm transition-colors ${n === m ? "border-navy bg-navy text-ivory" : "border-border hover:border-beige"}`}>{n}</button>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl bg-secondary p-5">
            <div><p className="text-xs text-muted-foreground">Due today</p><p className="font-display text-2xl">{eur(p.deposit)}</p></div>
            <div><p className="text-xs text-muted-foreground">Then {m}× monthly</p><p className="font-display text-2xl">{eur(monthly)}</p></div>
          </div>
          <a href="#apply" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-navy py-4 font-medium text-ivory transition-transform hover:-translate-y-0.5">Apply for this program <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></a>
        </Reveal>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section id="partners" className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
      <div className="grid gap-5 md:grid-cols-2">
        <Reveal className="h-full rounded-3xl bg-beige-soft p-8 md:p-10">
          <Gift {...ico} />
          <h3 className="mt-6 text-3xl font-semibold">Have a promo code?</h3>
          <p className="mt-3 text-muted-foreground">Friends and partners of Kinetix can share codes that give you a discount on any program.</p>
        </Reveal>
        <Reveal delay={100} className="h-full rounded-3xl bg-navy p-8 text-ivory md:p-10">
          <Users {...ico} className="h-6 w-6 text-beige" />
          <h3 className="mt-6 text-3xl font-semibold">Turn connections into opportunities.</h3>
          <p className="mt-3 text-ivory/65">Become a Sales Partner, earn commission on every client and climb from Bronze to Gold.</p>
          <a href="#apply" className="mt-6 inline-flex items-center gap-2 text-beige">Become a partner <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></a>
        </Reveal>
      </div>
    </section>
  );
}

const faqs = [
  ["Is employment guaranteed?", "No agency can honestly guarantee it. We match you with verified employers and support every step, but final decisions rest with employers and authorities."],
  ["What is included in the price?", "Program fees cover matching, document preparation, permit processing support and pre-departure guidance. Each program lists exactly what's included."],
  ["Can I pay in installments?", "Yes. Pay a deposit to start, then split the rest into up to six monthly payments depending on the program."],
  ["What documents do I need?", "Usually a valid passport, photo, CV, medical certificate and police clearance. Each country page lists the exact requirements."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-secondary/60 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1fr_1.4fr] md:px-8">
        <SectionHead eyebrow="FAQ" title="Questions, answered honestly." />
        <div className="divide-y divide-border border-y border-border">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-6 text-left font-display text-lg font-medium">
                {q}{open === i ? <Minus className="h-5 w-5 shrink-0" strokeWidth={1.25} /> : <Plus className="h-5 w-5 shrink-0" strokeWidth={1.25} />}
              </button>
              {open === i && <p className="animate-in fade-in pb-6 text-muted-foreground">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section id="apply" className="bg-navy text-ivory">
      <div className="mx-auto max-w-7xl px-5 py-24 text-center md:px-8 md:py-32">
        <p className="eyebrow text-beige">Start today</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] md:text-6xl">Ready to make your move?</h2>
        <p className="mx-auto mt-5 max-w-lg text-ivory/65">Online applications are opening soon. Explore programs now and be first in line.</p>
        <a href="#countries" className="mt-10 inline-flex items-center gap-2 rounded-full bg-beige px-8 py-4 font-medium text-navy transition-transform hover:-translate-y-0.5">Explore Opportunities <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></a>
      </div>
    </section>
  );
}
