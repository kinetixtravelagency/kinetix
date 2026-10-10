// Temporary catalog, mirrored in the database (seeded). Bilingual EN/AR.
import bulgariaAsset from "@/assets/bulgaria.jpg.asset.json";
import luxembourgAsset from "@/assets/luxembourg.jpg.asset.json";
import armeniaAsset from "@/assets/armenia.jpg.asset.json";
import russiaAsset from "@/assets/russia.jpg.asset.json";
import italyAsset from "@/assets/italy.jpg.asset.json";
import sloveniaAsset from "@/assets/slovenia.jpg.asset.json";
import irelandAsset from "@/assets/ireland.jpg.asset.json";

const bulgaria = bulgariaAsset.url;
const luxembourg = luxembourgAsset.url;
const armenia = armeniaAsset.url;
const russia = russiaAsset.url;
const italy = italyAsset.url;
const slovenia = sloveniaAsset.url;
const ireland = irelandAsset.url;

export type Track = "student" | "graduate";
export type Program = {
  slug: string; track: Track; title: string; titleAr: string; category: string; categoryAr: string;
  duration: string; price: number; deposit: number; installments: number;
};

export type Country = {
  slug: string; name: string; nameAr: string; flag: string; image: string;
  tagline: string; taglineAr: string; description: string; descriptionAr: string;
  programs: Program[]; documents: string[]; eligibility: string[];
  timeline: { step: string; time: string }[];
};

export const MAX_INSTALLMENTS = 6;
const tracks = (c: string, sp: number, sd: number, gp: number, gd: number): Program[] => [
  { slug: `${c}-student`, track: "student", title: "Student Track", titleAr: "مسار الطلاب", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: sp, deposit: sd, installments: MAX_INSTALLMENTS },
  { slug: `${c}-graduate`, track: "graduate", title: "Graduate Track", titleAr: "مسار الخريجين", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: gp, deposit: gd, installments: MAX_INSTALLMENTS },
];

const docs = ["Valid passport (12+ months)", "Recent passport photo", "CV in English", "Medical certificate", "Police clearance"];

export const countries: Country[] = [
  {
    slug: "bulgaria", name: "Bulgaria", nameAr: "بلغاريا", flag: "🇧🇬", image: bulgaria,
    tagline: "Seasonal hospitality on the Black Sea coast", taglineAr: "عمل موسمي في الضيافة على ساحل البحر الأسود",
    description: "Hotels and resorts along the coast hire international staff every season, with accommodation support and a clear path from application to arrival.",
    descriptionAr: "توظّف الفنادق والمنتجعات على الساحل موظفين دوليين كل موسم، مع دعم للسكن ومسار واضح من التقديم حتى الوصول.",
    programs: tracks("bulgaria", 1450, 300, 1850, 400),
    documents: docs, eligibility: ["Age 18–45", "Basic English", "No prior visa refusals for the EU"],
    timeline: [{ step: "Application review", time: "3–5 days" }, { step: "Employer matching", time: "1–3 weeks" }, { step: "Work permit", time: "4–8 weeks" }, { step: "Visa & travel", time: "2–4 weeks" }],
  },
  {
    slug: "luxembourg", name: "Luxembourg", nameAr: "لوكسمبورغ", flag: "🇱🇺", image: luxembourg,
    tagline: "Professional roles in Europe's finance capital", taglineAr: "وظائف مهنية في عاصمة المال الأوروبية",
    description: "Skilled positions in logistics, services and business support in one of Europe's highest-paying labour markets.",
    descriptionAr: "وظائف ماهرة في الخدمات اللوجستية والخدمات ودعم الأعمال في واحدة من أعلى أسواق العمل أجراً في أوروبا.",
    programs: tracks("luxembourg", 2800, 600, 3200, 700),
    documents: [...docs, "Diplomas & certificates"], eligibility: ["Age 21–45", "Intermediate English or French", "Relevant work experience"],
    timeline: [{ step: "Profile assessment", time: "1 week" }, { step: "Interviews", time: "2–4 weeks" }, { step: "Permit processing", time: "6–10 weeks" }, { step: "Relocation", time: "2–3 weeks" }],
  },
  {
    slug: "armenia", name: "Armenia", nameAr: "أرمينيا", flag: "🇦🇲", image: armenia,
    tagline: "Fast-track work opportunities in Yerevan", taglineAr: "فرص عمل سريعة في يريفان",
    description: "A growing economy with accessible visa procedures and roles in services, construction and tech support.",
    descriptionAr: "اقتصاد نامٍ بإجراءات تأشيرة سهلة ووظائف في الخدمات والبناء والدعم التقني.",
    programs: tracks("armenia", 950, 200, 1250, 250),
    documents: docs.slice(0, 4), eligibility: ["Age 18–50", "Basic English or Russian"],
    timeline: [{ step: "Application review", time: "2–3 days" }, { step: "Job offer", time: "1–2 weeks" }, { step: "Visa & travel", time: "2–3 weeks" }],
  },
  {
    slug: "russia", name: "Russia", nameAr: "روسيا", flag: "🇷🇺", image: russia,
    tagline: "Work and study programs in major cities", taglineAr: "برامج عمل ودراسة في المدن الكبرى",
    description: "Programs in Moscow and other major cities across manufacturing, services and university pathways.",
    descriptionAr: "برامج في موسكو ومدن كبرى أخرى في التصنيع والخدمات والمسارات الجامعية.",
    programs: tracks("russia", 1200, 250, 1600, 350),
    documents: docs, eligibility: ["Age 18–40", "Basic Russian is a plus"],
    timeline: [{ step: "Application review", time: "3–5 days" }, { step: "Invitation letter", time: "3–5 weeks" }, { step: "Visa & travel", time: "2–3 weeks" }],
  },
  {
    slug: "italy", name: "Italy", nameAr: "إيطاليا", flag: "🇮🇹", image: italy,
    tagline: "Hospitality and culinary careers", taglineAr: "مسارات مهنية في الضيافة وفنون الطهي",
    description: "Kitchens, restaurants and agriculture across Italy recruit international talent through official quota programs.",
    descriptionAr: "توظّف المطابخ والمطاعم والزراعة في إيطاليا مواهب دولية عبر برامج الحصص الرسمية.",
    programs: tracks("italy", 2450, 500, 2850, 600),
    documents: [...docs, "Experience letters"], eligibility: ["Age 20–45", "Hospitality experience preferred"],
    timeline: [{ step: "Profile assessment", time: "1 week" }, { step: "Employer matching", time: "2–6 weeks" }, { step: "Nulla osta", time: "6–12 weeks" }, { step: "Visa & travel", time: "3–4 weeks" }],
  },
  {
    slug: "slovenia", name: "Slovenia", nameAr: "سلوفينيا", flag: "🇸🇮", image: slovenia,
    tagline: "EU work permits in tourism and industry", taglineAr: "تصاريح عمل أوروبية في السياحة والصناعة",
    description: "An EU member with growing demand for workers in tourism, logistics and manufacturing, and straightforward single-permit procedures.",
    descriptionAr: "دولة عضو في الاتحاد الأوروبي بطلب متزايد على العمالة في السياحة واللوجستيات والتصنيع، بإجراءات تصريح موحدة وواضحة.",
    programs: tracks("slovenia", 1450, 300, 1750, 400),
    documents: docs, eligibility: ["Age 18–45", "Basic English", "Clean criminal record"],
    timeline: [{ step: "Application review", time: "3–5 days" }, { step: "Employer matching", time: "2–4 weeks" }, { step: "Single permit", time: "4–8 weeks" }, { step: "Visa & travel", time: "2–3 weeks" }],
  },
  {
    slug: "ireland", name: "Ireland", nameAr: "أيرلندا", flag: "🇮🇪", image: ireland,
    tagline: "English-speaking careers in Europe's tech hub", taglineAr: "مسارات مهنية بالإنجليزية في مركز التقنية الأوروبي",
    description: "Critical skills and general employment permits in one of Europe's strongest job markets, with English as the working language.",
    descriptionAr: "تصاريح عمل للمهارات المطلوبة والوظائف العامة في واحدة من أقوى أسواق العمل في أوروبا، والإنجليزية هي لغة العمل.",
    programs: tracks("ireland", 2900, 600, 3400, 800),
    documents: [...docs, "Diplomas & certificates"], eligibility: ["Age 21–50", "Good English (IELTS 5+ preferred)", "Relevant work experience"],
    timeline: [{ step: "Profile assessment", time: "1 week" }, { step: "Job offer", time: "3–6 weeks" }, { step: "Permit processing", time: "6–10 weeks" }, { step: "Visa & travel", time: "3–4 weeks" }],
  },
];

export const fromPrice = (c: Country) => Math.min(...c.programs.map((p) => p.price));
export const eur = (n: number) => `€${n.toLocaleString("en-US")}`;
export const getCountry = (slug: string) => countries.find((c) => c.slug === slug);
export const getProgram = (slug: string) => {
  for (const c of countries) { const p = c.programs.find((x) => x.slug === slug); if (p) return { country: c, program: p }; }
  return undefined;
};
