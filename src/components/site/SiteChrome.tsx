import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Languages, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/useSession";

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

export function Nav() {
  const [open, setOpen] = useState(false);
  const { t, lang, setLang } = useLang();
  const { user } = useSession();
  const links = [
    { href: "/#countries", label: t("countries") },
    { href: "/#how", label: t("how") },
    { href: "/#pricing", label: t("pricing") },
    { href: "/#partners", label: t("partners") },
    { href: "/#faq", label: t("faq") },
  ];
  const langBtn = (
    <button onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label="Language"
      className="inline-flex items-center gap-1.5 rounded-full border border-ivory/25 px-3 py-2 text-sm transition-colors hover:border-beige hover:text-beige">
      <Languages className="h-4 w-4" strokeWidth={1.5} />{lang === "en" ? "العربية" : "EN"}
    </button>
  );
  return (
    <header className="absolute inset-x-0 top-0 z-30 text-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ivory/75 md:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="transition-colors hover:text-beige">{l.label}</a>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {langBtn}
          {user ? (
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-full bg-beige px-4 py-2 text-sm font-medium text-navy">{t("dashboard")}</Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-ivory/75 hover:text-beige">{t("signIn")}</Link>
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full border border-beige/50 px-4 py-2 text-sm transition-colors hover:bg-beige hover:text-navy">
                {t("applyNow")} <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {langBtn}
          <button onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="mx-4 rounded-2xl bg-navy-soft p-5 md:hidden">
          {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-ivory/85">{l.label}</a>)}
          <Link to={user ? "/dashboard" : "/auth"} className="mt-3 block rounded-full bg-beige py-3 text-center font-medium text-navy">
            {user ? t("dashboard") : t("applyNow")}
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-navy text-ivory/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Logo className="text-ivory" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{t("footerTag")}</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-4 text-beige">{t("explore")}</p>
          <a href="/#countries" className="block py-1.5 hover:text-beige">{t("countries")}</a>
          <a href="/#how" className="block py-1.5 hover:text-beige">{t("how")}</a>
          <a href="/#pricing" className="block py-1.5 hover:text-beige">{t("pricing")}</a>
          <a href="/#faq" className="block py-1.5 hover:text-beige">{t("faq")}</a>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-4 text-beige">{t("legal")}</p>
          <p className="py-1.5">{t("terms")}</p><p className="py-1.5">{t("privacy")}</p><p className="py-1.5">{t("refund")}</p>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-ivory/45 md:px-8">© {new Date().getFullYear()} Kinetix. {t("disclaimer")}</p>
      </div>
    </footer>
  );
}
