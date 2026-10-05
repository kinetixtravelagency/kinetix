import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, roles, partner, applications] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("partners").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("applications").select("*, programs(slug, track, title_en, title_ar, price, deposit, countries(slug, name_en, name_ar)), application_documents(*)").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    let commissions: any[] = [];
    let referred: any[] = [];
    if (partner.data) {
      const [c, r] = await Promise.all([
        supabase.from("commissions").select("*").eq("partner_id", partner.data.id).order("created_at", { ascending: false }),
        supabase.from("applications").select("id, status, created_at, programs(title_en, title_ar)").eq("partner_id", partner.data.id).order("created_at", { ascending: false }),
      ]);
      commissions = c.data ?? [];
      referred = r.data ?? [];
    }
    return {
      profile: profile.data,
      roles: (roles.data ?? []).map((r) => r.role),
      partner: partner.data,
      applications: applications.data ?? [],
      commissions,
      referred,
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { full_name?: string | undefined; phone?: string | undefined }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ full_name: data.full_name ?? null, phone: data.phone ?? null })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateMyPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { payout_method?: string | undefined; payout_details?: string | undefined }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("partners")
      .update({ payout_method: data.payout_method ?? null, payout_details: data.payout_details ?? null })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const [apps, partners, countries, programs] = await Promise.all([
      context.supabase.from("applications").select("*, profiles(full_name, phone), programs(slug, track, title_en, price, deposit, countries(name_en)), application_documents(*)").order("created_at", { ascending: false }),
      context.supabase.from("partners").select("*, profiles(full_name, phone)").order("created_at", { ascending: false }),
      context.supabase.from("countries").select("*").order("sort_order"),
      context.supabase.from("programs").select("*, countries(name_en)").order("created_at"),
    ]);
    return {
      applications: apps.data ?? [],
      partners: partners.data ?? [],
      countries: countries.data ?? [],
      programs: programs.data ?? [],
    };
  });

export const adminUpdateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("applications").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateProgramPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; price: number; deposit: number; max_installments: number }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("programs")
      .update({ price: data.price, deposit: data.deposit, max_installments: data.max_installments }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    program: string; payment_plan: "full" | "installments"; installments: number;
    full_name: string; phone: string; passport_number: string; birth_date?: string | undefined; education?: string | undefined; promo_code?: string | undefined;
  }) => {
    if (!d.program || d.program.length > 80) throw new Error("Invalid program");
    if (d.payment_plan !== "full" && d.payment_plan !== "installments") throw new Error("Invalid plan");
    const inst = d.payment_plan === "full" ? 1 : Math.round(d.installments);
    if (inst < 1 || inst > 6) throw new Error("Invalid installments");
    const clip = (v: string | undefined, n: number) => (v ?? "").trim().slice(0, n);
    if (!clip(d.full_name, 120) || !clip(d.phone, 40)) throw new Error("Name and phone are required");
    return { ...d, installments: inst, full_name: clip(d.full_name, 120), phone: clip(d.phone, 40), passport_number: clip(d.passport_number, 40),
      education: clip(d.education, 200), promo_code: clip(d.promo_code, 40).toUpperCase(), birth_date: d.birth_date || undefined };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prog, error: pe } = await supabase.from("programs").select("id").eq("slug", data.program).maybeSingle();
    if (pe || !prog) throw new Error("Program not found");
    let partner_id: string | null = null;
    if (data.promo_code) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: p } = await supabaseAdmin.from("partners").select("id").eq("promo_code", data.promo_code).eq("active", true).maybeSingle();
      partner_id = p?.id ?? null;
    }
    const { data: app, error } = await supabase.from("applications").insert({
      user_id: userId, program_id: prog.id, partner_id, promo_code: data.promo_code || null,
      payment_plan: data.payment_plan, installments: data.installments,
      full_name: data.full_name, phone: data.phone, passport_number: data.passport_number || null,
      birth_date: data.birth_date ?? null, education: data.education || null,
    }).select("id").single();
    if (error) throw new Error(error.message);
    await supabase.from("profiles").update({ full_name: data.full_name, phone: data.phone }).eq("id", userId);
    return { id: app.id };
  });

export const adminUpdateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; stage?: number | undefined; deposit_paid?: boolean | undefined }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const patch: Record<string, unknown> = {};
    if (data.stage !== undefined) patch.stage = Math.max(0, Math.min(5, data.stage));
    if (data.deposit_paid !== undefined) {
      patch.deposit_paid = data.deposit_paid;
      patch.deposit_paid_at = data.deposit_paid ? new Date().toISOString() : null;
      if (data.deposit_paid && data.stage === undefined) patch.stage = 1;
    }
    const { error } = await context.supabase.from("applications").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetDocumentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "pending" | "approved" | "rejected" }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("application_documents").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
