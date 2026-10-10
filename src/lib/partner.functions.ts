import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { levelFor, type Level } from "./levels";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const registerPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { full_name?: string | undefined; phone?: string | undefined; city?: string | undefined; experience?: string | undefined }) => ({
    full_name: clip(d.full_name, 120), phone: clip(d.phone, 40), city: clip(d.city, 80), experience: clip(d.experience, 500),
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin.from("partners").select("id").eq("user_id", context.userId).maybeSingle();
    if (existing) return { ok: true };
    const { data: prof } = await supabaseAdmin.from("profiles").select("full_name").eq("id", context.userId).maybeSingle();
    const name = data.full_name || prof?.full_name || "PARTNER";
    const base = (name.split(/\s+/)[0] ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "KIN";
    let code = "";
    for (let i = 0; i < 6; i++) {
      const c = `KIN-${base}${Math.floor(10 + Math.random() * 90)}`;
      const { data: hit } = await supabaseAdmin.from("partners").select("id").eq("promo_code", c).maybeSingle();
      if (!hit) { code = c; break; }
    }
    if (!code) throw new Error("Could not generate code, try again");
    if (data.full_name || data.phone) {
      await supabaseAdmin.from("profiles").update({ ...(data.full_name ? { full_name: data.full_name } : {}), ...(data.phone ? { phone: data.phone } : {}) }).eq("id", context.userId);
    }
    const { error } = await supabaseAdmin.from("partners").insert({
      user_id: context.userId, promo_code: code, level: "Starter", status: "pending", active: false,
      city: data.city || null, experience: data.experience || null,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("user_roles").upsert({ user_id: context.userId, role: "partner" }, { onConflict: "user_id,role" });
    return { ok: true };
  });

export const getPartnerPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: partner }, { data: profile }, { data: levels }] = await Promise.all([
      supabase.from("partners").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("full_name, phone, avatar_url").eq("id", userId).maybeSingle(),
      supabase.from("partner_levels").select("*").order("min_leads"),
    ]);
    if (!partner) return { partner: null, profile, levels: levels ?? [] };
    const [leads, apps, comms] = await Promise.all([
      supabase.from("leads").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabase.from("applications").select("id, status, stage, deposit_paid, created_at, full_name, programs(track, countries(name_en, name_ar))").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
    ]);
    return { partner, profile, levels: levels ?? [], leads: leads.data ?? [], applications: apps.data ?? [], commissions: comms.data ?? [] };
  });

export const addLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { full_name: string; phone?: string | undefined; email?: string | undefined; country_interest?: string | undefined; track?: string | undefined; notes?: string | undefined }) => {
    const r = { full_name: clip(d.full_name, 120), phone: clip(d.phone, 40), email: clip(d.email, 160), country_interest: clip(d.country_interest, 60), track: clip(d.track, 20), notes: clip(d.notes, 500) };
    if (!r.full_name) throw new Error("Name is required");
    return r;
  })
  .handler(async ({ data, context }) => {
    const { data: p } = await context.supabase.from("partners").select("id, status").eq("user_id", context.userId).maybeSingle();
    if (!p || p.status !== "active") throw new Error("Partner account not active");
    const { error } = await context.supabase.from("leads").insert({
      partner_id: p.id, full_name: data.full_name, phone: data.phone || null, email: data.email || null,
      country_interest: data.country_interest || null, track: data.track || null, notes: data.notes || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) => {
    if (!["new", "qualified", "converted", "lost"].includes(d.status)) throw new Error("Invalid status");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("leads").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Admin ---------- */

export const getAdminSales = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = context.supabase;
    const [partners, levels, leads, apps, comms] = await Promise.all([
      s.from("partners").select("*, profiles(full_name, phone)").order("created_at", { ascending: false }),
      s.from("partner_levels").select("*").order("min_leads"),
      s.from("leads").select("partner_id, status"),
      s.from("applications").select("id, partner_id, status, full_name").not("partner_id", "is", null),
      s.from("commissions").select("*").order("created_at", { ascending: false }),
    ]);
    const lv = (levels.data ?? []) as Level[];
    const rows = (partners.data ?? []).map((p: any) => {
      const myLeads = (leads.data ?? []).filter((l) => l.partner_id === p.id).length;
      const myApps = (apps.data ?? []).filter((a) => a.partner_id === p.id);
      const myComms = (comms.data ?? []).filter((c) => c.partner_id === p.id);
      const score = myLeads + myApps.length;
      return {
        ...p, leadsCount: myLeads, appsCount: myApps.length, score,
        levelName: levelFor(lv, score).current?.name ?? "—",
        pending: myComms.filter((c) => c.status === "pending" || c.status === "approved").reduce((a, c) => a + c.amount, 0),
        paid: myComms.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0),
        applications: myApps,
      };
    });
    return { partners: rows, levels: lv, commissions: comms.data ?? [] };
  });

export const adminSetPartnerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "pending" | "active" | "suspended" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("partners").update({ status: data.status, active: data.status === "active" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAddCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { partner_id: string; amount: number; application_id?: string | undefined; note?: string | undefined }) => {
    if (!(d.amount > 0) || d.amount > 10_000_000) throw new Error("Invalid amount");
    return { ...d, amount: Math.round(d.amount), note: clip(d.note, 200) };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("commissions").insert({
      partner_id: data.partner_id, amount: data.amount, application_id: data.application_id || null, note: data.note || null, currency: "EGP",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetCommissionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "pending" | "approved" | "paid" | "cancelled" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("commissions").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; min_leads: number; commission_rate: number; client_discount: number }) => {
    if (d.min_leads < 0 || d.commission_rate < 0 || d.commission_rate > 100 || d.client_discount < 0 || d.client_discount > 50) throw new Error("Invalid values");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("partner_levels")
      .update({ min_leads: Math.round(data.min_leads), commission_rate: data.commission_rate, client_discount: data.client_discount }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
