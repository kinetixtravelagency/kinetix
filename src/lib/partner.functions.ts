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
    if (!partner) return { partner: null, profile, metadata: {}, levels: enrichedLevels, withdrawals: [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getWithdrawalsStore } = await import("./withdrawals.server");
    const [leads, apps, comms, wStore, u] = await Promise.all([
      supabaseAdmin.from("leads").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("applications").select("id, status, stage, deposit_paid, created_at, full_name, phone, promo_code, payment_plan, installments, programs(track, title_en, title_ar, countries(slug, name_en, name_ar))").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("commissions").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      getWithdrawalsStore(),
      supabase.auth.getUser(),
    ]);
    const myWithdrawals = wStore.requests.filter((r) => r.partnerId === partner.id);
    return {
      partner,
      profile,
      metadata: (u.data?.user?.user_metadata ?? {}) as Record<string, any>,
      levels: enrichedLevels,
      leads: leads.data ?? [],
      applications: apps.data ?? [],
      commissions: comms.data ?? [],
      withdrawals: myWithdrawals,
    };
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

    const { triggerNotification } = await import("./notifications.functions");
    await triggerNotification({
      userId: context.userId,
      partnerId: p.id,
      title: "تم تسجيل ليد جديد",
      message: `تم تسجيل العميل (${data.full_name}) بنجاح في قائمة الليدز الخاصة بك.`,
      type: "lead",
      link: "/partner",
    });

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
    gender?: string | undefined;
    birth_date?: string | undefined;
    national_id?: string | undefined;
    governorate?: string | undefined;
    city?: string | undefined;
    academic_status?: string | undefined;
    university?: string | undefined;
    faculty?: string | undefined;
    experience_field?: string | undefined;
    bio?: string | undefined;
    experience?: string | undefined;
    payout_method?: string | undefined;
    payout_details?: string | undefined;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Update profiles table
    if (data.full_name !== undefined || data.phone !== undefined) {
      await supabase.from("profiles").update({
        ...(data.full_name !== undefined ? { full_name: data.full_name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
      }).eq("id", userId);
    }

    // 2. Update auth user_metadata for granular individual fields
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId);
    const existingMeta = u.user?.user_metadata ?? {};
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingMeta,
        ...(data.full_name !== undefined ? { full_name: data.full_name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.birth_date !== undefined ? { birth_date: data.birth_date } : {}),
        ...(data.national_id !== undefined ? { national_id: data.national_id } : {}),
        ...(data.governorate !== undefined ? { governorate: data.governorate } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.academic_status !== undefined ? { academic_status: data.academic_status } : {}),
        ...(data.university !== undefined ? { university: data.university } : {}),
        ...(data.faculty !== undefined ? { faculty: data.faculty } : {}),
        ...(data.experience_field !== undefined ? { experience_field: data.experience_field } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
      },
    });

    // 3. Update partners table
    const updates: {
      city?: string | null;
      experience?: string | null;
      payout_method?: string | null;
      payout_details?: string | null;
    } = {};

    const loc = [data.governorate, data.city].filter(Boolean).join(" - ");
    if (loc) updates.city = loc;
    else if (data.city !== undefined) updates.city = data.city ? data.city.trim() : null;

    if (data.bio !== undefined || data.experience !== undefined) {
      updates.experience = (data.bio || data.experience || "").trim() || null;
    }
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
    if (!d.payout_method?.trim() || !d.payout_details?.trim()) {
      throw new Error("يرجى إعداد وتحديد طريقة سحب صالحة وبيانات التحويل");
    }
    return {
      amount: Math.round(d.amount),
      payout_method: clip(d.payout_method, 80),
      payout_details: clip(d.payout_details, 250),
      notes: clip(d.notes, 300),
    };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { addWithdrawalRequest, getWithdrawalsStore } = await import("./withdrawals.server");
    const { triggerNotification } = await import("./notifications.functions");

    // 1. Get partner record
    const { data: partner } = await supabaseAdmin
      .from("partners")
      .select("id, promo_code, status, payout_method, payout_details, profiles(full_name)")
      .eq("user_id", userId)
      .maybeSingle();

    if (!partner) throw new Error("حساب الشريك غير موجود");
    if (partner.status !== "active") throw new Error("حساب الشريك غير مفعل أو قيد المراجعة حالياً");

    // Ensure withdrawal method is configured
    if (!data.payout_method || !data.payout_details) {
      throw new Error("يجب ضبط وسيلة سحب معتمدة واحدة على الأقل في الإعدادات قبل طلب السحب.");
    }

    // 2. Fetch pending / approved commissions
    const { data: comms } = await supabaseAdmin.from("commissions").select("id, amount, status, note").eq("partner_id", partner.id);
    const commTotal = (comms ?? []).filter((c) => c.status === "pending" || c.status === "approved").reduce((a, c) => a + c.amount, 0);

    // Also deduct any already pending/processing withdrawal requests
    const wStore = await getWithdrawalsStore();
    const lockedInWithdrawals = wStore.requests
      .filter((r) => r.partnerId === partner.id && (r.status === "pending" || r.status === "approved" || r.status === "processing"))
      .reduce((a, r) => a + r.amount, 0);

    const available = Math.max(0, commTotal - lockedInWithdrawals);

    if (available <= 0) {
      throw new Error("لا يوجد رصيد متاح للسحب حالياً (الرصيد المتاح 0 ج.م)");
    }
    if (data.amount > available) {
      throw new Error(`المبلغ المطلوب (${data.amount.toLocaleString()} ج.م) يتجاوز الرصيد القابل للصرف (${available.toLocaleString()} ج.م)`);
    }

    // 3. Create persistent withdrawal request
    const partnerName = (partner as any).profiles?.full_name || "Partner";
    const withdrawal = await addWithdrawalRequest({
      partnerId: partner.id,
      partnerCode: partner.promo_code,
      partnerName,
      amount: data.amount,
      payoutMethod: data.payout_method,
      payoutDetails: data.payout_details,
      notes: data.notes || null,
      status: "pending",
    });

    // 4. Update partner's saved payout preference
    await supabaseAdmin.from("partners").update({
      payout_method: data.payout_method,
      payout_details: data.payout_details,
    }).eq("id", partner.id);

    // 5. Send notification to partner
    await triggerNotification({
      userId,
      partnerId: partner.id,
      title: "تم تقديم طلب سحب الأرباح",
      message: `تم تسجيل طلبك لسحب مبلغ ${data.amount.toLocaleString()} ج.م عبر ${data.payout_method}. طلبك قيد المراجعة والمعالجة.`,
      type: "withdrawal",
      link: "/partner",
    });

    return { ok: true, amount: data.amount, withdrawalId: withdrawal.id };
  });

export const adminSetWithdrawalStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: string;
    status: "pending" | "approved" | "processing" | "completed" | "rejected";
    admin_notes?: string | undefined;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { updateWithdrawalStatus } = await import("./withdrawals.server");
    const { triggerNotification } = await import("./notifications.functions");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const updated = await updateWithdrawalStatus(data.id, data.status, data.admin_notes);
    if (!updated) throw new Error("Withdrawal request not found");

    // If completed: mark matching commissions as paid
    if (data.status === "completed") {
      const { data: comms } = await supabaseAdmin
        .from("commissions")
        .select("id, status, amount")
        .eq("partner_id", updated.partnerId);

      let remainingToMark = updated.amount;
      for (const c of comms ?? []) {
        if (remainingToMark <= 0) break;
        if (c.status === "pending" || c.status === "approved") {
          await supabaseAdmin.from("commissions").update({ status: "paid" }).eq("id", c.id);
          remainingToMark -= c.amount;
        }
      }
    }

    // Notify partner
    const { data: partner } = await supabaseAdmin.from("partners").select("user_id").eq("id", updated.partnerId).maybeSingle();
    if (partner?.user_id) {
      const statusLabels: Record<string, string> = {
        approved: "تمت الموافقة على طلب السحب",
        processing: "طلب السحب قيد التحويل المالي",
        completed: "تم تحويل أرباحك بنجاح ✅",
        rejected: "تم رفض طلب السحب ❌",
      };
      await triggerNotification({
        userId: partner.user_id,
        partnerId: updated.partnerId,
        title: statusLabels[data.status] || "تحديث حالة طلب السحب",
        message: `تم تحديث حالة طلب سحب مبلغ ${updated.amount.toLocaleString()} ج.م إلى: ${data.status}${data.admin_notes ? ` (${data.admin_notes})` : ""}`,
        type: "withdrawal",
        link: "/partner",
      });
    }

    return { ok: true, withdrawal: updated };
  });

export const adminDeletePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; action: "suspend" | "delete" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.action === "suspend") {
      const { error } = await supabaseAdmin.from("partners").update({ status: "suspended", active: false }).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, message: "Partner suspended successfully" };
    }

    // Action === "delete" / archive:
    const [{ data: comms }, { data: apps }] = await Promise.all([
      supabaseAdmin.from("commissions").select("id").eq("partner_id", data.id),
      supabaseAdmin.from("applications").select("id").eq("partner_id", data.id),
    ]);

    if ((comms && comms.length > 0) || (apps && apps.length > 0)) {
      await supabaseAdmin.from("partners").update({
        status: "suspended",
        active: false,
        promo_code: `ARCHIVED-${Date.now().toString().slice(-6)}`,
      }).eq("id", data.id);
      return { ok: true, message: "تم تعطيل وأرشفة الشريك لحماية السجلات المالية والمحاسبية المرتبطة به." };
    }

    const { error } = await supabaseAdmin.from("partners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, message: "تم حذف الشريك بنجاح" };
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
