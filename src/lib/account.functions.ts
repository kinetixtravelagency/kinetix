import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enrichLevelsWithServerConfig, saveServerLevelCommission } from "./levels.server";

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
    const { data: u } = await supabase.auth.getUser();
    return {
      profile: profile.data,
      metadata: (u.user?.user_metadata ?? {}) as Record<string, any>,
      roles: (roles.data ?? []).map((r) => r.role),
      partner: partner.data,
      applications: applications.data ?? [],
      commissions,
      referred,
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    full_name?: string | undefined;
    phone?: string | undefined;
    gender?: string | undefined;
    birth_date?: string | undefined;
    education?: string | undefined;
    city?: string | undefined;
  }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.full_name || data.phone) {
      const { error } = await supabase
        .from("profiles")
        .update({ ...(data.full_name ? { full_name: data.full_name } : {}), ...(data.phone ? { phone: data.phone } : {}) })
        .eq("id", userId);
      if (error) throw new Error(error.message);
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId);
    const existing = u.user?.user_metadata ?? {};
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existing,
        ...(data.full_name ? { full_name: data.full_name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.birth_date ? { birth_date: data.birth_date } : {}),
        ...(data.education ? { education: data.education } : {}),
        ...(data.city ? { city: data.city } : {}),
      },
    });
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("programs")
      .update({ price: data.price, deposit: data.deposit, max_installments: data.max_installments, updated_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCreateProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    country_id: string;
    slug: string;
    track: "student" | "graduate";
    title_en: string;
    title_ar: string;
    category_en: string;
    category_ar: string;
    duration: string;
    price: number;
    deposit: number;
    max_installments: number;
    published?: boolean;
  }) => {
    if (!d.country_id) throw new Error("Country is required");
    if (!d.title_en?.trim()) throw new Error("English title is required");
    if (!d.slug?.trim()) throw new Error("Slug is required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const { data: item, error } = await supabaseAdmin.from("programs").insert({
      country_id: data.country_id,
      slug,
      track: data.track || "student",
      title_en: data.title_en.trim(),
      title_ar: data.title_ar?.trim() || data.title_en.trim(),
      category_en: data.category_en?.trim() || "General",
      category_ar: data.category_ar?.trim() || "عام",
      duration: data.duration?.trim() || "12 months",
      price: Math.max(0, Math.round(Number(data.price) || 0)),
      deposit: Math.max(0, Math.round(Number(data.deposit) || 0)),
      max_installments: Math.max(1, Math.min(12, Math.round(Number(data.max_installments) || 6))),
      published: data.published ?? true,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: item.id };
  });

export const adminUpdateProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: string;
    country_id?: string;
    slug?: string;
    track?: "student" | "graduate";
    title_en?: string;
    title_ar?: string;
    category_en?: string;
    category_ar?: string;
    duration?: string;
    price?: number;
    deposit?: number;
    max_installments?: number;
    published?: boolean;
  }) => {
    if (!d.id) throw new Error("Program ID is required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: any = { updated_at: new Date().toISOString() };
    if (data.country_id) patch.country_id = data.country_id;
    if (data.slug) patch.slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (data.track) patch.track = data.track;
    if (data.title_en !== undefined) patch.title_en = data.title_en.trim();
    if (data.title_ar !== undefined) patch.title_ar = data.title_ar.trim();
    if (data.category_en !== undefined) patch.category_en = data.category_en.trim();
    if (data.category_ar !== undefined) patch.category_ar = data.category_ar.trim();
    if (data.duration !== undefined) patch.duration = data.duration.trim();
    if (data.price !== undefined) patch.price = Math.max(0, Math.round(Number(data.price) || 0));
    if (data.deposit !== undefined) patch.deposit = Math.max(0, Math.round(Number(data.deposit) || 0));
    if (data.max_installments !== undefined) patch.max_installments = Math.max(1, Math.min(12, Math.round(Number(data.max_installments) || 6)));
    if (data.published !== undefined) patch.published = data.published;

    const { error } = await supabaseAdmin.from("programs").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => {
    if (!d.id) throw new Error("ID required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("programs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSyncCatalogPrograms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { countries: catCountries } = await import("./catalog");

    let count = 0;
    for (const c of catCountries) {
      let { data: dbCountry } = await supabaseAdmin.from("countries").select("id").eq("slug", c.slug).maybeSingle();
      if (!dbCountry) {
        const { data: newC } = await supabaseAdmin.from("countries").insert({
          slug: c.slug,
          name_en: c.name,
          name_ar: c.nameAr,
          published: true,
          tagline_en: c.tagline,
          tagline_ar: c.taglineAr,
        }).select("id").single();
        dbCountry = newC;
      }
      if (!dbCountry) continue;

      for (const p of c.programs) {
        await supabaseAdmin.from("programs").upsert({
          country_id: dbCountry.id,
          slug: p.slug,
          track: p.track,
          title_en: p.title,
          title_ar: p.titleAr,
          category_en: p.category,
          category_ar: p.categoryAr,
          duration: p.duration,
          price: p.price,
          deposit: p.deposit,
          max_installments: p.installments,
          published: true,
        }, { onConflict: "slug" });
        count++;
      }
    }
    return { ok: true, count };
  });

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    program: string; payment_plan: "full" | "installments"; installments: number;
    full_name: string; phone: string; passport_number: string; birth_date?: string | undefined; education?: string | undefined; promo_code?: string | undefined; gender?: string | undefined; city?: string | undefined;
  }) => {
    if (!d.program || d.program.length > 80) throw new Error("Invalid program");
    if (d.payment_plan !== "full" && d.payment_plan !== "installments") throw new Error("Invalid plan");
    const inst = d.payment_plan === "full" ? 1 : Math.round(d.installments);
    if (inst < 1 || inst > 6) throw new Error("Invalid installments");
    const clip = (v: string | undefined, n: number) => (v ?? "").trim().slice(0, n);
    if (!clip(d.full_name, 120) || !clip(d.phone, 40)) throw new Error("Name and phone are required");
    return { ...d, installments: inst, full_name: clip(d.full_name, 120), phone: clip(d.phone, 40), passport_number: clip(d.passport_number, 40),
      education: clip(d.education, 200), promo_code: clip(d.promo_code, 40).toUpperCase(), birth_date: d.birth_date || undefined, gender: d.gender ? clip(d.gender, 10) : undefined, city: d.city ? clip(d.city, 80) : undefined };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let { data: prog, error: pe } = await supabase.from("programs").select("id").eq("slug", data.program).maybeSingle();
    if (pe) throw new Error(pe.message);

    // If program not in DB yet, try to find it in the static catalog and auto-insert it
    if (!prog) {
      const { getProgram } = await import("./catalog");
      const found = getProgram(data.program);
      if (!found) throw new Error("Program not found");

      // Use admin client to bypass RLS for program/country management
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Find or create the country record first
      const { country: cat_country, program: cat_prog } = found;
      const { data: dbCountry } = await supabaseAdmin
        .from("countries")
        .select("id")
        .eq("slug", cat_country.slug)
        .maybeSingle();

      let country_id: string | null = dbCountry?.id ?? null;
      if (!country_id) {
        const { data: newCountry } = await supabaseAdmin
          .from("countries")
          .insert({ slug: cat_country.slug, name_en: cat_country.name, name_ar: cat_country.nameAr, published: true })
          .select("id")
          .single();
        country_id = newCountry?.id ?? null;
      }

      if (!country_id) throw new Error("Could not resolve country");

      // Upsert program using admin client
      const { data: newProg, error: insertErr } = await supabaseAdmin
        .from("programs")
        .upsert({
          slug: cat_prog.slug,
          track: cat_prog.track,
          title_en: cat_prog.title,
          title_ar: cat_prog.titleAr,
          price: cat_prog.price,
          deposit: cat_prog.deposit,
          max_installments: cat_prog.installments,
          country_id,
        }, { onConflict: "slug" })
        .select("id")
        .single();

      if (insertErr || !newProg) throw new Error("Program not found and could not be created");
      prog = newProg;
    }

    let partner_id: string | null = null;
    let discount = 0;
    if (data.promo_code) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: p } = await supabaseAdmin.from("partners").select("id").eq("promo_code", data.promo_code).eq("status", "active").maybeSingle();
      partner_id = p?.id ?? null;
      if (p) {
        const [{ count: lc }, { count: ac }, { data: lv }] = await Promise.all([
          supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).eq("partner_id", p.id),
          supabaseAdmin.from("applications").select("id", { count: "exact", head: true }).eq("partner_id", p.id),
          supabaseAdmin.from("partner_levels").select("*"),
        ]);
        const { levelFor } = await import("./levels");
        discount = Number(levelFor((lv ?? []) as any, (lc ?? 0) + (ac ?? 0)).current?.client_discount ?? 0);
      }
    }
    const genderTag = data.gender ? `[GENDER:${data.gender}]` : "[GENDER:male]";
    const { data: app, error } = await supabase.from("applications").insert({
      user_id: userId, program_id: prog.id, partner_id, promo_code: data.promo_code || null,
      payment_plan: data.payment_plan, installments: data.installments, discount_percent: discount,
      full_name: data.full_name, phone: data.phone, passport_number: data.passport_number || null,
      birth_date: data.birth_date ?? null, education: data.education || null,
      notes: genderTag,
    }).select("id").single();
    if (error) throw new Error(error.message);
    await supabase.from("profiles").update({ full_name: data.full_name, phone: data.phone }).eq("id", userId);
    return { id: app.id, discount };
  });

export const adminUpdateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; stage?: number | undefined; deposit_paid?: boolean | undefined }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const patch: { stage?: number; deposit_paid?: boolean; deposit_paid_at?: string | null } = {};
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

/* ─── Admin: Full overview with partner/commission data ─── */
export const getAdminFull = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const s = context.supabase;
    const [apps, partners, countries, programs, levels, leads, commissions] = await Promise.all([
      s.from("applications").select("*, profiles(full_name, phone), programs(slug, track, title_en, price, deposit, countries(name_en, slug)), application_documents(*)").order("created_at", { ascending: false }),
      s.from("partners").select("*, profiles(full_name, phone)").order("created_at", { ascending: false }),
      s.from("countries").select("*").order("sort_order"),
      s.from("programs").select("*, countries(name_en, slug)").order("created_at"),
      s.from("partner_levels").select("*").order("min_leads"),
      s.from("leads").select("partner_id, status, created_at, full_name, phone, country_interest, track"),
      s.from("commissions").select("*, partners(promo_code, profiles(full_name))").order("created_at", { ascending: false }),
    ]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let userEmailMap = new Map<string, string>();
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      authUsers?.users?.forEach((u: any) => {
        if (u.id && u.email) userEmailMap.set(u.id, u.email);
      });
    } catch (e) {
      console.error("Could not fetch auth users for admin:", e);
    }

    let progList = programs.data ?? [];
    if (progList.length < 20) {
      try {
        const { countries: catCountries } = await import("./catalog");
        for (const c of catCountries) {
          let { data: dbCountry } = await supabaseAdmin.from("countries").select("id").eq("slug", c.slug).maybeSingle();
          if (!dbCountry) {
            const { data: newC } = await supabaseAdmin.from("countries").insert({
              slug: c.slug, name_en: c.name, name_ar: c.nameAr, published: true,
            }).select("id").single();
            dbCountry = newC;
          }
          if (!dbCountry) continue;
          for (const p of c.programs) {
            await supabaseAdmin.from("programs").upsert({
              country_id: dbCountry.id, slug: p.slug, track: p.track,
              title_en: p.title, title_ar: p.titleAr, category_en: p.category,
              category_ar: p.categoryAr, duration: p.duration, price: p.price,
              deposit: p.deposit, max_installments: p.installments, published: true,
            }, { onConflict: "slug" });
          }
        }
        const refreshed = await supabaseAdmin.from("programs").select("*, countries(name_en, slug)").order("created_at");
        progList = refreshed.data ?? [];
      } catch (e) {
        console.error("Auto-sync programs failed:", e);
      }
    }

    // enrich partners with email/lead/app/commission counts
    const enrichedPartners = (partners.data ?? []).map((p: any) => {
      const email = userEmailMap.get(p.user_id) || null;
      const myLeads = (leads.data ?? []).filter((l: any) => l.partner_id === p.id);
      const myApps = (apps.data ?? []).filter((a: any) => a.partner_id === p.id);
      const myComms = (commissions.data ?? []).filter((c: any) => c.partner_id === p.id);
      return {
        ...p,
        email,
        leads: myLeads,
        apps: myApps,
        commissions: myComms,
        total_paid: myComms.filter((c: any) => c.status === "paid").reduce((a: number, c: any) => a + c.amount, 0),
        total_pending: myComms.filter((c: any) => c.status === "pending").reduce((a: number, c: any) => a + c.amount, 0),
      };
    });

    const enrichedApps = (apps.data ?? []).map((a: any) => ({
      ...a,
      user_email: userEmailMap.get(a.user_id) || null,
    }));

    return {
      applications: enrichedApps,
      partners: enrichedPartners,
      countries: countries.data ?? [],
      programs: progList,
      levels: enrichLevelsWithServerConfig(levels.data ?? []),
      commissions: commissions.data ?? [],
    };
  });

/* ─── Admin: Manage partner status ─── */
export const adminManagePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status?: "pending" | "active" | "suspended"; commission_rate?: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const patch: any = {};
    if (data.status) { patch.status = data.status; patch.active = data.status === "active"; }
    if (data.commission_rate !== undefined) patch.commission_rate = data.commission_rate;
    const { error } = await context.supabase.from("partners").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Admin: Add commission manually ─── */
export const adminAddCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { partner_id: string; amount: number; note?: string | undefined }) => {
    if (!(d.amount > 0)) throw new Error("Amount must be positive");
    const note = (d.note ?? "").slice(0, 200);
    return { partner_id: d.partner_id, amount: Math.round(d.amount), note };
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("commissions").insert({ partner_id: data.partner_id, amount: data.amount, note: data.note || null, currency: "EGP" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Admin: Update commission status ─── */
export const adminSetCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "pending" | "approved" | "paid" | "cancelled" }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("commissions").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Admin: Update partner level thresholds ─── */
export const adminUpdateLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; min_leads: number; commission_rate: number; commission_amount?: number | undefined; client_discount: number; name: string; name_ar: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    if (typeof data.commission_amount === "number") {
      saveServerLevelCommission(data.id, data.commission_amount);
    }
    const { error } = await context.supabase.from("partner_levels").update({ name: data.name, name_ar: data.name_ar, min_leads: data.min_leads, commission_rate: data.commission_rate, client_discount: data.client_discount }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Admin: Update country ─── */
export const adminUpdateCountry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; name_en?: string; name_ar?: string; tagline_en?: string; tagline_ar?: string; description_en?: string; description_ar?: string; published?: boolean; sort_order?: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("countries").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ─── Client: Request Payment & Support Consultation ─── */
export const requestPaymentSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      applicationId: string;
      paymentOption: "deposit" | "full";
      paymentMethod: string;
      amountEur: number;
      amountEgp: number;
      programTitle: string;
      countryName?: string | undefined;
      phone?: string | undefined;
      fullName?: string | undefined;
    }) => d
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const noteText = `[طلب دفع عبر الشات] ${data.paymentOption === "deposit" ? "المقدم" : "دفعة واحدة بالكامل"} بمبلغ €${data.amountEur} (~${data.amountEgp.toLocaleString()} EGP) بطريقة ${data.paymentMethod} - ${new Date().toLocaleString("ar-EG")}`;

    await supabaseAdmin.from("applications").update({
      payment_plan: data.paymentOption === "full" ? "full" : "installments",
      notes: noteText,
    }).eq("id", data.applicationId);

    const msgText = `💳 طلب سداد جديد (${data.paymentOption === "deposit" ? "المقدم" : "دفعة واحدة بالكامل"}):
• البرنامج: ${data.programTitle}${data.countryName ? ` · ${data.countryName}` : ""}
• المبلغ المطلوب: €${data.amountEur.toLocaleString()} (~${data.amountEgp.toLocaleString()} ج.م)
• وسيلة الدفع المفضلة: ${data.paymentMethod}
• الاسم: ${data.fullName || "عميل"}
• الهاتف: ${data.phone || "—"}
• كود الطلب: #${data.applicationId.slice(0, 8)}

أرغب في استكمال الدفع، برجاء تزويدي ببيانات التحويل عبر هذه الوسيلة وتأكيد الحجز.`;

    const { sendClientMessage } = await import("./chat.functions");
    await sendClientMessage({
      data: {
        userId,
        clientName: data.fullName || undefined,
        clientPhone: data.phone || undefined,
        text: msgText,
      },
    });

    return { ok: true, message: msgText };
  });
