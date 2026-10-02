import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display text-lg font-semibold tracking-[0.18em] ${className}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M4 20 L12 4 L20 20" /><circle cx="12" cy="4" r="1.6" className="fill-beige stroke-beige" />
      </svg>
      KINETIX
    </Link>
  );
}

const links = [
  { href: "/#countries", label: "Countries" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#partners", label: "Partners" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-30 text-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ivory/75 md:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="transition-colors hover:text-beige">{l.label}</a>)}
        </nav>
        <a href="/#apply" className="hidden items-center gap-1.5 rounded-full border border-beige/50 px-4 py-2 text-sm transition-colors hover:bg-beige hover:text-navy md:inline-flex">
          Apply now <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </a>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
        </button>
      </div>
      {open && (
        <div className="mx-4 rounded-2xl bg-navy-soft p-5 md:hidden">
          {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-ivory/85">{l.label}</a>)}
          <a href="/#apply" className="mt-3 block rounded-full bg-beige py-3 text-center font-medium text-navy">Apply now</a>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy text-ivory/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Logo className="text-ivory" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">International career mobility. Transparent costs, flexible payment plans and guidance from application to arrival.</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-4 text-beige">Explore</p>
          {links.map((l) => <a key={l.href} href={l.href} className="block py-1.5 hover:text-beige">{l.label}</a>)}
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-4 text-beige">Legal</p>
          <p className="py-1.5">Terms</p><p className="py-1.5">Privacy</p><p className="py-1.5">Refund policy</p>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-ivory/45 md:px-8">© {new Date().getFullYear()} Kinetix. Kinetix does not guarantee employment or visa approval; final decisions rest with employers and authorities.</p>
      </div>
    </footer>
  );
}
