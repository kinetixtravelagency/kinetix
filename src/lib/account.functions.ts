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
      supabase.from("applications").select("*, programs(title_en, title_ar, price)").eq("user_id", userId).order("created_at", { ascending: false }),
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
      context.supabase.from("applications").select("*, profiles(full_name), programs(title_en, price)").order("created_at", { ascending: false }),
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
