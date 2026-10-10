import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createSupabaseFetch(supabaseKey: string) {
  return (input: any, init?: any) => {
    const headers = new Headers(init?.headers);
    if (headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: { fetch: createSupabaseFetch(key) }
});

async function seed() {
  console.log("Seeding programs from Master Plan 2026...");

  // Fetch countries
  const { data: countries, error: cErr } = await supabase.from("countries").select("id, slug");
  if (cErr || !countries) {
    console.error("Failed to fetch countries:", cErr);
    process.exit(1);
  }

  const countryMap = new Map<string, string>();
  countries.forEach(c => countryMap.set(c.slug, c.id));

  const programsData = [
    // --- BULGARIA ---
    {
      cslug: "bulgaria",
      slug: "bulgaria-student-hospitality",
      title_en: "Student Seasonal Hospitality",
      title_ar: "عمل موسمي في الضيافة للطلاب",
      category_en: "Hospitality",
      category_ar: "ضيافة",
      duration: "3–6 months",
      price: 1450,
      deposit: 300,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "bulgaria",
      slug: "bulgaria-student-resort",
      title_en: "Student Seasonal Resort Support",
      title_ar: "عمل موسمي بالمنتجعات الشاطئية للطلاب",
      category_en: "Hospitality",
      category_ar: "ضيافة",
      duration: "3–6 months",
      price: 1450,
      deposit: 300,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "bulgaria",
      slug: "bulgaria-seasonal-agriculture",
      title_en: "Seasonal Agriculture & Harvest",
      title_ar: "زراعة وحصاد موسمي",
      category_en: "Agriculture",
      category_ar: "زراعة",
      duration: "3–6 months",
      price: 1350,
      deposit: 250,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "bulgaria",
      slug: "bulgaria-hospitality-worker",
      title_en: "Hospitality & Hotel Operations",
      title_ar: "موظف فنادق ومطاعم خريجين",
      category_en: "Hospitality",
      category_ar: "ضيافة",
      duration: "12–24 months",
      price: 1850,
      deposit: 400,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "bulgaria",
      slug: "bulgaria-logistics-worker",
      title_en: "Warehouse & Logistics Assistant",
      title_ar: "مستودعات ودعم لوجستي",
      category_en: "Logistics",
      category_ar: "لوجستيات",
      duration: "12–24 months",
      price: 1800,
      deposit: 400,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "bulgaria",
      slug: "bulgaria-production-worker",
      title_en: "Manufacturing & Production Worker",
      title_ar: "عمال خطوط إنتاج وتصنيع",
      category_en: "Manufacturing",
      category_ar: "صناعة وإنتاج",
      duration: "12–24 months",
      price: 1750,
      deposit: 350,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "bulgaria",
      slug: "bulgaria-skilled-worker",
      title_en: "Skilled Trades & Technicians",
      title_ar: "مهن وحرف تخصصية وتقنية",
      category_en: "Skilled Trades",
      category_ar: "مهن ماهرة",
      duration: "12–24 months",
      price: 2100,
      deposit: 450,
      max_installments: 6,
      track: "graduate",
    },

    // --- LUXEMBOURG ---
    {
      cslug: "luxembourg",
      slug: "luxembourg-higher-education",
      title_en: "Higher Education & University Route",
      title_ar: "قبول ودراسة جامعية عليا",
      category_en: "Education",
      category_ar: "تعليم جامعي",
      duration: "Academic year",
      price: 2800,
      deposit: 600,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "luxembourg",
      slug: "luxembourg-student-parttime",
      title_en: "Student Study + Part-Time Work",
      title_ar: "دراسة + عمل جزئي مصرح",
      category_en: "Education & Work",
      category_ar: "دراسة وعمل",
      duration: "12 months",
      price: 3000,
      deposit: 650,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "luxembourg",
      slug: "luxembourg-skilled-worker",
      title_en: "Skilled Specialist & Professional",
      title_ar: "وظائف مهنية متخصصة",
      category_en: "Professional",
      category_ar: "مهني متخصص",
      duration: "24 months",
      price: 3400,
      deposit: 800,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "luxembourg",
      slug: "luxembourg-it-technology",
      title_en: "IT, Tech & Software Engineering",
      title_ar: "تكنولوجيا البرمجيات وشبكات",
      category_en: "IT & Tech",
      category_ar: "تقنية وتكنولوجيا",
      duration: "24 months",
      price: 3500,
      deposit: 800,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "luxembourg",
      slug: "luxembourg-logistics",
      title_en: "Supply Chain & Logistics Management",
      title_ar: "لوجستيات وسلاسل إمداد",
      category_en: "Logistics",
      category_ar: "لوجستيات",
      duration: "24 months",
      price: 3200,
      deposit: 700,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "luxembourg",
      slug: "luxembourg-hospitality",
      title_en: "Gastronomy & Hotel Staff",
      title_ar: "ضيافة وفنادق راقية",
      category_en: "Hospitality",
      category_ar: "ضيافة وفنادق",
      duration: "12–24 months",
      price: 3100,
      deposit: 700,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "luxembourg",
      slug: "luxembourg-finance",
      title_en: "Finance, Banking & Accounting",
      title_ar: "قطاع مالي ومحاسبي",
      category_en: "Finance",
      category_ar: "مالية ومحاسبة",
      duration: "24 months",
      price: 3600,
      deposit: 850,
      max_installments: 6,
      track: "graduate",
    },

    // --- ARMENIA ---
    {
      cslug: "armenia",
      slug: "armenia-university-student",
      title_en: "University Admission & Studies",
      title_ar: "قبول دراسي جامعي",
      category_en: "Education",
      category_ar: "تعليم",
      duration: "Academic year",
      price: 950,
      deposit: 200,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "armenia",
      slug: "armenia-it-software",
      title_en: "IT, Web & Tech Support",
      title_ar: "دعم فني وتطوير برمجيات",
      category_en: "IT",
      category_ar: "تقنية معلومات",
      duration: "12–24 months",
      price: 1300,
      deposit: 300,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "armenia",
      slug: "armenia-hospitality",
      title_en: "Hotels, Tourism & Guest Services",
      title_ar: "ضيافة وسياحة في يريفان",
      category_en: "Hospitality",
      category_ar: "سياحة وضيافة",
      duration: "12 months",
      price: 1100,
      deposit: 250,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "armenia",
      slug: "armenia-customer-support",
      title_en: "Customer Support & Operations",
      title_ar: "خدمة عملاء ودعم تشغيلي",
      category_en: "Services",
      category_ar: "خدمات",
      duration: "12 months",
      price: 1050,
      deposit: 250,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "armenia",
      slug: "armenia-manufacturing",
      title_en: "Production & Manufacturing",
      title_ar: "عمال تصنيع وإنتاج",
      category_en: "Manufacturing",
      category_ar: "صناعة",
      duration: "12 months",
      price: 1150,
      deposit: 250,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "armenia",
      slug: "armenia-logistics",
      title_en: "Logistics, Warehousing & Dispatch",
      title_ar: "توزيع وشحن لوجستي",
      category_en: "Logistics",
      category_ar: "لوجستيات",
      duration: "12 months",
      price: 1150,
      deposit: 250,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "armenia",
      slug: "armenia-technical-worker",
      title_en: "Technical & Maintenance Crafts",
      title_ar: "فنيون وصيانة",
      category_en: "Technical",
      category_ar: "فني",
      duration: "12 months",
      price: 1250,
      deposit: 300,
      max_installments: 6,
      track: "graduate",
    },

    // --- RUSSIA ---
    {
      cslug: "russia",
      slug: "russia-university-student",
      title_en: "Russian Universities Admission",
      title_ar: "قبول جامعي ودراسة روسية",
      category_en: "Education",
      category_ar: "تعليم",
      duration: "Academic year",
      price: 1200,
      deposit: 250,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "russia",
      slug: "russia-student-work",
      title_en: "Student Work Pathway",
      title_ar: "مسار العمل الطلابي",
      category_en: "Education & Work",
      category_ar: "دراسة وعمل",
      duration: "12 months",
      price: 1350,
      deposit: 300,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "russia",
      slug: "russia-manufacturing",
      title_en: "Industrial & Factory Production",
      title_ar: "عمال صناعة ومصانع",
      category_en: "Manufacturing",
      category_ar: "صناعة",
      duration: "12–24 months",
      price: 1550,
      deposit: 350,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "russia",
      slug: "russia-logistics",
      title_en: "Warehousing & Freight Logistics",
      title_ar: "مستودعات وشحن لوجستي",
      category_en: "Logistics",
      category_ar: "لوجستيات",
      duration: "12–24 months",
      price: 1500,
      deposit: 350,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "russia",
      slug: "russia-hospitality",
      title_en: "Hotels & Restaurant Service",
      title_ar: "قطاع المطاعم والضيافة",
      category_en: "Hospitality",
      category_ar: "ضيافة",
      duration: "12 months",
      price: 1450,
      deposit: 300,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "russia",
      slug: "russia-construction",
      title_en: "Construction & Site Operations",
      title_ar: "قطاع المقاولات والإنشاءات",
      category_en: "Construction",
      category_ar: "إنشاءات",
      duration: "12–24 months",
      price: 1600,
      deposit: 350,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "russia",
      slug: "russia-technical-worker",
      title_en: "Skilled Technicians & Engineering Support",
      title_ar: "فنيون وتقنيون ماهرون",
      category_en: "Technical",
      category_ar: "فني ماهر",
      duration: "12–24 months",
      price: 1700,
      deposit: 400,
      max_installments: 6,
      track: "graduate",
    },

    // --- ITALY ---
    {
      cslug: "italy",
      slug: "italy-university-student",
      title_en: "Higher Education in Italy",
      title_ar: "دراسة جامعية بإيطاليا",
      category_en: "Education",
      category_ar: "تعليم",
      duration: "Academic year",
      price: 2450,
      deposit: 500,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "italy",
      slug: "italy-seasonal-agri",
      title_en: "Seasonal Agriculture (Decreto Flussi)",
      title_ar: "زراعة موسمية - حصص رسمية",
      category_en: "Agriculture",
      category_ar: "زراعة",
      duration: "6–9 months",
      price: 2300,
      deposit: 500,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "italy",
      slug: "italy-seasonal-hospitality",
      title_en: "Seasonal Coastal & Resort Hospitality",
      title_ar: "سياحة وضيافة موسمية",
      category_en: "Hospitality",
      category_ar: "ضيافة",
      duration: "6–9 months",
      price: 2400,
      deposit: 500,
      max_installments: 6,
      track: "student",
    },
    {
      cslug: "italy",
      slug: "italy-hospitality-general",
      title_en: "Culinary & Restaurant Staff",
      title_ar: "طهاة وضيافة فندقية عامة",
      category_en: "Hospitality",
      category_ar: "مطاعم وضيافة",
      duration: "12–24 months",
      price: 2850,
      deposit: 600,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "italy",
      slug: "italy-construction",
      title_en: "Construction & Infrastructure Trades",
      title_ar: "مقاولات وإنشاءات",
      category_en: "Construction",
      category_ar: "بناء وتشييد",
      duration: "12–24 months",
      price: 2750,
      deposit: 600,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "italy",
      slug: "italy-manufacturing",
      title_en: "Manufacturing & Industrial Fabrication",
      title_ar: "قطاع التصنيع والإنتاج",
      category_en: "Manufacturing",
      category_ar: "تصنيع وإنتاج",
      duration: "12–24 months",
      price: 2700,
      deposit: 550,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "italy",
      slug: "italy-logistics",
      title_en: "Logistics, Shipping & Freight Support",
      title_ar: "لوجستيات ومستودعات وشحن",
      category_en: "Logistics",
      category_ar: "لوجستيات",
      duration: "12–24 months",
      price: 2750,
      deposit: 600,
      max_installments: 6,
      track: "graduate",
    },
    {
      cslug: "italy",
      slug: "italy-skilled-professional",
      title_en: "Skilled Engineers & Specialists",
      title_ar: "مهن هندسية وتقنية متخصصة",
      category_en: "Professional",
      category_ar: "مهني متخصص",
      duration: "24 months",
      price: 3100,
      deposit: 700,
      max_installments: 6,
      track: "graduate",
    },
  ];

  let added = 0;
  let updated = 0;

  for (const prog of programsData) {
    const countryId = countryMap.get(prog.cslug);
    if (!countryId) {
      console.warn(`Country slug ${prog.cslug} not found in DB`);
      continue;
    }

    const { data: existing } = await supabase
      .from("programs")
      .select("id")
      .eq("slug", prog.slug)
      .maybeSingle();

    if (existing) {
      const { error: uErr } = await supabase
        .from("programs")
        .update({
          country_id: countryId,
          title_en: prog.title_en,
          title_ar: prog.title_ar,
          category_en: prog.category_en,
          category_ar: prog.category_ar,
          duration: prog.duration,
          price: prog.price,
          deposit: prog.deposit,
          max_installments: prog.max_installments,
          track: prog.track,
          published: true,
        })
        .eq("id", existing.id);
      if (uErr) console.error("Error updating", prog.slug, uErr);
      else updated++;
    } else {
      const { error: iErr } = await supabase
        .from("programs")
        .insert({
          country_id: countryId,
          slug: prog.slug,
          title_en: prog.title_en,
          title_ar: prog.title_ar,
          category_en: prog.category_en,
          category_ar: prog.category_ar,
          duration: prog.duration,
          price: prog.price,
          deposit: prog.deposit,
          max_installments: prog.max_installments,
          track: prog.track,
          published: true,
        });
      if (iErr) console.error("Error inserting", prog.slug, iErr);
      else added++;
    }
  }

  console.log(`Finished seeding! Added: ${added}, Updated: ${updated}`);
}

seed();
