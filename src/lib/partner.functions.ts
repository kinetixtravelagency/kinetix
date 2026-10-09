import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { levelFor, type Level } from "./levels";
import { enrichLevelsWithServerConfig, saveServerLevelCommission } from "./levels.server";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const registerPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    full_name?: string | undefined;
    phone?: string | undefined;
    city?: string | undefined;
    governorate?: string | undefined;
    university?: string | undefined;
    faculty?: string | undefined;
    gender?: string | undefined;
    birth_date?: string | undefined;
    academic_status?: string | undefined;
    experience_field?: string | undefined;
    experience?: string | undefined;
  }) => ({
    full_name: clip(d.full_name, 120),
    phone: clip(d.phone, 40),
    city: clip(d.city, 80),
    governorate: clip(d.governorate, 60),
    university: clip(d.university, 100),
    faculty: clip(d.faculty, 100),
    gender: clip(d.gender, 10),
    birth_date: clip(d.birth_date, 20),
    academic_status: clip(d.academic_status, 60),
    experience_field: clip(d.experience_field, 80),
    experience: clip(d.experience, 800),
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

    const structuredLocation = [data.governorate, data.city].filter(Boolean).join(" - ") || null;
    const structuredExp = [
      data.gender ? `الجنس: ${data.gender === "female" ? "أنثى" : "ذكر"}` : null,
      data.birth_date ? `الميلاد: ${data.birth_date}` : null,
      data.university ? `الجامعة: ${data.university}` : null,
      data.faculty ? `الكلية: ${data.faculty}` : null,
      data.academic_status ? `المرحلة: ${data.academic_status}` : null,
      data.experience_field ? `مجال الخبرة: ${data.experience_field}` : null,
      data.experience ? `نبذة: ${data.experience}` : null,
    ].filter(Boolean).join(" | ") || null;

    const { error } = await supabaseAdmin.from("partners").insert({
      user_id: context.userId, promo_code: code, level: "Starter", status: "pending", active: false,
      city: structuredLocation, experience: structuredExp,
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
    const enrichedLevels = enrichLevelsWithServerConfig(levels ?? []);
    if (!partner) return { partner: null, profile, levels: enrichedLevels };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [leads, apps, comms] = await Promise.all([
      supabaseAdmin.from("leads").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("applications").select("id, status, stage, deposit_paid, created_at, full_name, phone, promo_code, payment_plan, installments, programs(track, title_en, title_ar, countries(slug, name_en, name_ar))").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("commissions").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
    ]);
    return { partner, profile, levels: enrichedLevels, leads: leads.data ?? [], applications: apps.data ?? [], commissions: comms.data ?? [] };
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

export const updatePartnerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    full_name?: string | undefined;
    phone?: string | undefined;
    city?: string | undefined;
    experience?: string | undefined;
    payout_method?: string | undefined;
    payout_details?: string | undefined;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.full_name !== undefined || data.phone !== undefined) {
      await supabase.from("profiles").update({
        ...(data.full_name !== undefined ? { full_name: data.full_name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
      }).eq("id", userId);
    }
    const updates: {
      city?: string | null;
      experience?: string | null;
      payout_method?: string | null;
      payout_details?: string | null;
    } = {};
    if (data.city !== undefined) updates.city = data.city ? data.city.trim() : null;
    if (data.experience !== undefined) updates.experience = data.experience ? data.experience.trim() : null;
    if (data.payout_method !== undefined) updates.payout_method = data.payout_method ? data.payout_method.trim() : null;
    if (data.payout_details !== undefined) updates.payout_details = data.payout_details ? data.payout_details.trim() : null;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("partners").update(updates as any).eq("user_id", userId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const requestPartnerPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    amount: number;
    payout_method: string;
    payout_details: string;
    notes?: string | undefined;
  }) => {
    if (!(d.amount > 0)) throw new Error("المبلغ المطلوب يجب أن يكون أكبر من صفر");
    if (!d.payout_method?.trim() || !d.payout_details?.trim()) throw new Error("يرجى تحديد طريقة السحب وبيانات الحساب");
    return {
      amount: Math.round(d.amount),
      payout_method: clip(d.payout_method, 80),
      payout_details: clip(d.payout_details, 200),
      notes: clip(d.notes, 300),
    };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Get partner record
    const { data: partner } = await supabaseAdmin.from("partners").select("id, status").eq("user_id", userId).maybeSingle();
    if (!partner) throw new Error("حساب الشريك غير موجود");
    if (partner.status !== "active") throw new Error("حساب الشريك غير مفعل أو قيد المراجعة حالياً");

    // 2. Fetch pending / approved commissions
    const { data: comms } = await supabaseAdmin.from("commissions").select("id, amount, status, note").eq("partner_id", partner.id);
    const available = (comms ?? []).filter((c) => c.status === "pending" || c.status === "approved").reduce((a, c) => a + c.amount, 0);

    if (available <= 0) {
      throw new Error("لا يوجد رصيد متاح للسحب حالياً (الرصيد المتاح 0 ج.م)");
    }
    if (data.amount > available) {
      throw new Error(`المبلغ المطلوب (${data.amount.toLocaleString()} ج.م) يتجاوز الرصيد المتاح (${available.toLocaleString()} ج.م)`);
    }

    // 3. Mark pending commissions with the payout request tag
    const pendingComms = (comms ?? []).filter((c) => c.status === "pending" || c.status === "approved");
    const payoutTag = `[🚨 طلب سحب أرباح | ${data.payout_method}: ${data.payout_details}${data.notes ? ` | ملاحظة: ${data.notes}` : ""}]`;

    for (const c of pendingComms) {
      const prev = c.note || "";
      const updatedNote = prev.includes("[🚨 طلب سحب") ? `${payoutTag} ${prev.replace(/\[🚨 طلب سحب[^\]]+\]\s*/g, "")}` : `${payoutTag} ${prev}`;
      await supabaseAdmin.from("commissions").update({ note: updatedNote.trim() }).eq("id", c.id);
    }

    // 4. Update partner's saved payout preference
    await supabaseAdmin.from("partners").update({
      payout_method: data.payout_method,
      payout_details: data.payout_details,
    }).eq("id", partner.id);

    return { ok: true, amount: data.amount };
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
    const lv = enrichLevelsWithServerConfig(levels.data ?? []);
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
  .inputValidator((d: { id: string; min_leads: number; commission_rate: number; commission_amount?: number | undefined; client_discount: number }) => {
    if (d.min_leads < 0 || d.commission_rate < 0 || d.commission_rate > 100 || d.client_discount < 0 || d.client_discount > 50) throw new Error("Invalid values");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (typeof data.commission_amount === "number") {
      saveServerLevelCommission(data.id, data.commission_amount);
    }
    const { error } = await context.supabase.from("partner_levels")
      .update({ min_leads: Math.round(data.min_leads), commission_rate: data.commission_rate, client_discount: data.client_discount }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
