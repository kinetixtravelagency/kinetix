import fs from "node:fs/promises";
import path from "node:path";

export interface MaterialSection {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  contentAr: string;
  contentEn: string;
  icon?: string;
  sortOrder: number;
  published: boolean;
  updatedAt: string;
}

export interface MaterialFAQ {
  id: string;
  category: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  sortOrder: number;
  published: boolean;
}

export interface MaterialsStore {
  version: number;
  lastUpdated: string;
  categories: { id: string; nameAr: string; nameEn: string; icon: string }[];
  sections: MaterialSection[];
  faqs: MaterialFAQ[];
}

const LOCAL_STORE_PATH = path.resolve(process.cwd(), "data", "materials_storage.json");
const STORAGE_BUCKET = "documents";
const STORAGE_FILE_PATH = "_system/materials_storage.json";

let memoryCache: MaterialsStore | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 2000;

const DEFAULT_STORE: MaterialsStore = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  categories: [
    { id: "about", nameAr: "عن الشركة والبرامج", nameEn: "About Kinetix", icon: "Building2" },
    { id: "pathways", nameAr: "مسارات السفر والتأهيل", nameEn: "Travel Pathways", icon: "Plane" },
    { id: "procedures", nameAr: "خطوات التقديم والمستندات", nameEn: "Application & Docs", icon: "FileText" },
    { id: "financial", nameAr: "نظام الدفع والأقساط", nameEn: "Payments & Installments", icon: "CreditCard" },
    { id: "sales_guide", nameAr: "دليل الشريك والاعتراضات", nameEn: "Sales & Objections", icon: "Sparkles" },
  ],
  sections: [
    {
      id: "sec_about_1",
      category: "about",
      titleAr: "من نحن وما هي رؤية كينتيكس؟",
      titleEn: "Who is Kinetix?",
      sortOrder: 1,
      published: true,
      updatedAt: new Date().toISOString(),
      contentAr: `كينتيكس (Kinetix) هي الوكالة الرائدة المعتمدة المتخصصة في تيسير السفر والتدريب والتوظيف الدولي للشباب والطلاب والمهنيين في أوروبا والدول المتقدمة. نوفر برامج رسمية ومضمونة تشمل التدريب المهني في فنادق ومطاعم 5 نجوم، والمستشفيات، والشركات التكنولوجية والهندسية، مع توفير عقود موثقة وإقامة قانونية وتأشيرات شنغن موثوقة.`,
      contentEn: `Kinetix is a leading premier agency specializing in facilitating international travel, paid internships, and professional placements across Europe. We connect students and graduates with verified 5-star hotel groups, medical centers, and tech companies, backed by legal contracts, verified Schengen permits, and dedicated on-ground support.`,
    },
    {
      id: "sec_path_students",
      category: "pathways",
      titleAr: "مسار الطلاب (Student Pathway)",
      titleEn: "Student Pathway (Internships)",
      sortOrder: 2,
      published: true,
      updatedAt: new Date().toISOString(),
      contentAr: `• مخصص لطلاب الجامعات والمعاهد المقيدين حالياً.\n• البرامج تشمل تدريباً عملياً مدفوع الأجر في اليونان، إسبانيا، إيطاليا، مالطا وفرنسا.\n• المزايا: راتب شهري يتراوح بين 700€ إلى 1200€ صافي، بالإضافة إلى سكن كامل مجاني، ووجبات يومية مجانية، وتأمين طبي شامل.\n• تصريح عمل وتأشيرة تدريب رسمية لا تؤثر على القيد الجامعي.`,
      contentEn: `• Designed for currently enrolled university and institute students.\n• Destinations include Greece, Spain, Italy, Malta, and France.\n• Benefits: Monthly stipend of 700€ to 1200€ net, plus 100% free accommodation, free duty meals, and comprehensive health insurance.\n• Official legal training visa and contract.`,
    },
    {
      id: "sec_path_graduates",
      category: "pathways",
      titleAr: "مسار الخريجين والمهنيين (Graduate Pathway)",
      titleEn: "Graduate Pathway (Full Placement)",
      sortOrder: 3,
      published: true,
      updatedAt: new Date().toISOString(),
      contentAr: `• مخصص للخريجين وأصحاب المؤهلات العليا والمتوسطة.\n• يشمل عقود عمل وتدريب وظيفي وتأهيل مهني في مجالات الضيافة، التمريض والمجال الطبي، الهندسة وتكنولوجيا المعلومات، وخدمة العملاء.\n• المزايا: رواتب تبدأ من 1,200€ وحتى 2,500€ مع مسار واضح لتجديد الإقامة أو التقديم على الإقامة الدائمة حسب لوائح دولة الاستقبال.`,
      contentEn: `• Tailored for university graduates and experienced professionals.\n• Contracts in hospitality, nursing/healthcare, engineering, IT, and customer care.\n• Monthly compensation from 1,200€ to 2,500€ with clear paths to visa renewal or residency.`,
    },
    {
      id: "sec_proc_steps",
      category: "procedures",
      titleAr: "المراحل الرسمية للتقديم من البداية للسفر",
      titleEn: "Official Application Roadmap",
      sortOrder: 4,
      published: true,
      updatedAt: new Date().toISOString(),
      contentAr: `1. تقديم الطلب ورفع المستندات: تعبئة البيانات ورفع جواز السفر، السيرة الذاتية، وإثبات القيد أو المؤهل.\n2. سداد الديبوزت (الدفعة الأولى): لتأكيد جدية التقديم وحجز المقعد في المقابلات الأوروبية.\n3. المقابلة التأهيلية الأولية (Pre-Interview): جلسة تدريبية ومراجعة مستوى اللغة الإنجليزية مع فريق كينتيكس.\n4. المقابلة الرسمية (Host Interview): مقابلة عبر الفيديو مع جهة العمل أو الفندق الأوروبي.\n5. استخراج تصريح العمل والتأشيرة: استلام العقد الموثق وبدء إجراءات السفارة.\n6. حجز الطيران والسفر: استقبال في المطار وبدء البرنامج.`,
      contentEn: `1. Application & Documents: Personal details, passport, CV, and university enrollment/degree.\n2. Deposit Payment: Confirms seat and activates interview queue.\n3. Pre-Interview Training: 1-on-1 English and interview preparation by Kinetix experts.\n4. Official Employer Interview: Video interview with the host venue in Europe.\n5. Work Permit & Schengen Visa: Legal permit processing and embassy submission.\n6. Flight & Departure: On-ground arrival coordination.`,
    },
    {
      id: "sec_fin_plans",
      category: "financial",
      titleAr: "نظام الدفع والأقساط وسياسة الاسترداد",
      titleEn: "Installment Systems & Refund Policy",
      sortOrder: 5,
      published: true,
      updatedAt: new Date().toISOString(),
      contentAr: `• لا يُطلب سداد كامل تكلفة البرنامج مقدماً أبداً.\n• نظام السداد مقسم على دفعات مريحة: دفعة مقدمة (ديبوزت) تبدأ من 250€ إلى 500€، والباقي موزع على مراحل الحصول على العقد والتأشيرة.\n• وسائل الدفع المعتمدة: إنستاباي InstaPay، فودافون كاش، محافظ المحمول الذكية، تحويل بنكي، وكروت الدفع البنكية.\n• سياسة الحماية: في حال عدم اجتياز المقابلة بعد 3 محاولات تدريبية يتم إرجاع الديبوزت كاملاً وفقاً لبنود العقد الموحد.`,
      contentEn: `• Program fees are split into manageable milestones.\n• Initial deposit starts from 250€ to 500€, with remaining balances due upon contract signing and visa approval.\n• Supported payment channels: InstaPay, Vodafone Cash, smart mobile wallets, bank wire, credit/debit cards.\n• Guarantee policy: Refundable if candidate is not matched after 3 guided interview attempts.`,
    },
    {
      id: "sec_sales_objections",
      category: "sales_guide",
      titleAr: "أهم اعتراضات العملاء وكيفية الرد الاحترافي عليها",
      titleEn: "Sales Tips & Overcoming Customer Objections",
      sortOrder: 6,
      published: true,
      updatedAt: new Date().toISOString(),
      contentAr: `• الاعتراض 1: 'هل السكن والأكل على حسابي؟'\nالرد: في أغلب برامج الطلاب والضيافة، السكن مجاني تماماً + 3 وجبات يومية مجانية، ما يعني أن الراتب بالكامل صافي للادخار.\n• الاعتراض 2: 'إنجليزيتي ضعيفة، هل سأُقبل؟'\nالرد: كينتيكس توفر جلسة Pre-Interview تدريبية مجانية لتدريبك على الأسئلة المتوقعة وكيفية اجتياز المقابلة بثقة حتى مع المستوى المتوسط (B1).\n• الاعتراض 3: 'ما الضمان لعدم ضياع أموالي؟'\nالرد: التعامل يتم بعقود رسمية موثقة ووصل استلام لكل دفعة، مع إمكانية استرداد الديبوزت لو لم يتم قبولك بعد التدريب.`,
      contentEn: `• Objection 1: 'Do I pay for living expenses?'\nAnswer: In student and hospitality placements, full room & board are provided 100% free, meaning your stipend is nearly all savings.\n• Objection 2: 'My English is not fluent.'\nAnswer: We offer personalized pre-interview coaching to prepare you specifically for the questions asked by host companies.\n• Objection 3: 'Is my deposit safe?'\nAnswer: Yes, covered by legal agreement and clear refund terms if no placement offer is secured after coaching.`,
    },
  ],
  faqs: [
    {
      id: "faq_1",
      category: "general",
      questionAr: "ما هي الدول المتاحة للسفر حالياً؟",
      questionEn: "Which countries are currently available?",
      answerAr: "اليونان، إسبانيا، إيطاليا، مالطا، فرنسا، ألمانيا، وقبرص، بالإضافة لفرص خاصة في دول الخليج.",
      answerEn: "Greece, Spain, Italy, Malta, France, Germany, Cyprus, as well as selected Gulf opportunities.",
      sortOrder: 1,
      published: true,
    },
    {
      id: "faq_2",
      category: "students",
      questionAr: "هل يحتاج الطالب إذن سفر من التجنيد؟",
      questionEn: "Do Egyptian male students need military travel permits?",
      answerAr: "نعم، يستخرج الطالب إذن سفر من إدارة التجنيد والتعبئة خلال الإجازة الصيفية بناءً على قيد الجامعة، وفريق كينتيكس يوجهك في كل خطوة.",
      answerEn: "Yes, students request a standard seasonal travel permit from the military department using their active university certificate.",
      sortOrder: 2,
      published: true,
    },
    {
      id: "faq_3",
      category: "financial",
      questionAr: "ما هي قيمة الخصم الممنوح للعميل عند استخدام كود الشريك؟",
      questionEn: "What discount does the client get when using a partner code?",
      answerAr: "يحصل العميل على خصم فوري يتراوح بين 5% إلى 15% على إجمالي رسوم البرنامج وفقاً لمستوى الشريك (Starter حتى Platinum).",
      answerEn: "Clients receive an instant 5% to 15% discount depending on the referring partner's tier.",
      sortOrder: 3,
      published: true,
    },
    {
      id: "faq_4",
      category: "financial",
      questionAr: "متى تُصرف عمولة الشريك وكيف أسحبها؟",
      questionEn: "When are commissions paid and how can I withdraw?",
      answerAr: "تتحول العمولة إلى رصيدك فور سداد العميل للدفعة الأولى (الديبوزت)، ويمكنك سحبها في أي وقت عبر زر 'طلب سحب الأرباح' واختيار إنستاباي أو محفظتك أو حسابك البنكي.",
      answerEn: "Commissions are credited as soon as your referral pays their deposit. You can withdraw anytime via InstaPay, mobile wallet, or bank transfer.",
      sortOrder: 4,
      published: true,
    },
  ],
};

async function readLocalFile(): Promise<MaterialsStore | null> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.sections)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeLocalFile(store: MaterialsStore): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Materials] Failed to write local fallback:", err);
  }
}

export async function getMaterialsStore(): Promise<MaterialsStore> {
  const now = Date.now();
  if (memoryCache && now - lastFetchTime < CACHE_TTL) {
    return memoryCache;
  }

  // 1. Supabase Storage
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_FILE_PATH);

    if (data && !error) {
      const text = await data.text();
      const parsed = JSON.parse(text) as MaterialsStore;
      if (parsed && Array.isArray(parsed.sections)) {
        memoryCache = parsed;
        lastFetchTime = now;
        await writeLocalFile(parsed);
        return memoryCache;
      }
    }
  } catch {
    // fallback
  }

  // 2. Local file
  const local = await readLocalFile();
  if (local) {
    memoryCache = local;
    lastFetchTime = now;
    return memoryCache;
  }

  // 3. Initialize default
  memoryCache = DEFAULT_STORE;
  lastFetchTime = now;
  await saveMaterialsStore(DEFAULT_STORE);
  return memoryCache;
}

export async function saveMaterialsStore(store: MaterialsStore): Promise<void> {
  store.lastUpdated = new Date().toISOString();
  store.version = (store.version || 1) + 1;
  memoryCache = store;
  lastFetchTime = Date.now();

  await writeLocalFile(store);

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const jsonStr = JSON.stringify(store);
    const blob = new Blob([jsonStr], { type: "application/json" });

    await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_FILE_PATH, blob, {
        upsert: true,
        contentType: "application/json",
      });
  } catch (err) {
    console.error("[Materials] Failed to upload to Supabase storage:", err);
  }
}
