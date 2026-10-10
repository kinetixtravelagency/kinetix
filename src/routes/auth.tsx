import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/SiteChrome";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/useSession";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Kinetix" }, { name: "description", content: "Sign in or create your Kinetix account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) { navigate({ to: "/dashboard" }); return null; }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else navigate({ to: "/dashboard" });
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
      });
      setMsg(error ? error.message : t("checkEmail"));
    }
    setBusy(false);
  };

  const input = "w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-beige";

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-5 text-ivory">
      <div className="w-full max-w-md rounded-3xl bg-ivory p-8 text-navy shadow-2xl">
        <Logo />
        <h1 className="mt-6 text-3xl font-semibold">{t("welcome")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("authSub")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && <input className={input} placeholder={t("fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} required />}
          <input className={input} type="email" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          <button disabled={busy} className="w-full rounded-full bg-navy py-3.5 font-medium text-ivory disabled:opacity-60">
            {mode === "signin" ? t("signInBtn") : t("createAccount")}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-5 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
          {mode === "signin" ? t("needAccount") : t("haveAccount")}
        </button>
      </div>
    </main>
  );
}
