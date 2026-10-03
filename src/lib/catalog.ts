// Temporary catalog, mirrored in the database (seeded). Bilingual EN/AR.
import bulgaria from "@/assets/bulgaria.jpg";
import luxembourg from "@/assets/luxembourg.jpg";
import armenia from "@/assets/armenia.jpg";
import russia from "@/assets/russia.jpg";
import italy from "@/assets/italy.jpg";

export type Program = {
  slug: string; title: string; titleAr: string; category: string; categoryAr: string;
  duration: string; price: number; deposit: number; installments: number;
};

export type Country = {
  slug: string; name: string; nameAr: string; flag: string; image: string;
  tagline: string; taglineAr: string; description: string; descriptionAr: string;
  programs: Program[]; documents: string[]; eligibility: string[];
  timeline: { step: string; time: string }[];
};

const docs = ["Valid passport (12+ months)", "Recent passport photo", "CV in English", "Medical certificate", "Police clearance"];

export const countries: Country[] = [
  {
    slug: "bulgaria", name: "Bulgaria", nameAr: "بلغاريا", flag: "🇧🇬", image: bulgaria,
    tagline: "Seasonal hospitality on the Black Sea coast", taglineAr: "عمل موسمي في الضيافة على ساحل البحر الأسود",
    description: "Hotels and resorts along the coast hire international staff every season, with accommodation support and a clear path from application to arrival.",
    descriptionAr: "توظّف الفنادق والمنتجعات على الساحل موظفين دوليين كل موسم، مع دعم للسكن ومسار واضح من التقديم حتى الوصول.",
    programs: [
      { slug: "bulgaria-seasonal", title: "Seasonal Work", titleAr: "عمل موسمي", category: "Hospitality", categoryAr: "ضيافة", duration: "4–6 months", price: 1450, deposit: 300, installments: 3 },
      { slug: "bulgaria-hotel", title: "Hotel Operations", titleAr: "عمليات الفنادق", category: "Hospitality", categoryAr: "ضيافة", duration: "12 months", price: 1850, deposit: 400, installments: 4 },
    ],
    documents: docs, eligibility: ["Age 18–45", "Basic English", "No prior visa refusals for the EU"],
    timeline: [{ step: "Application review", time: "3–5 days" }, { step: "Employer matching", time: "1–3 weeks" }, { step: "Work permit", time: "4–8 weeks" }, { step: "Visa & travel", time: "2–4 weeks" }],
  },
  {
    slug: "luxembourg", name: "Luxembourg", nameAr: "لوكسمبورغ", flag: "🇱🇺", image: luxembourg,
    tagline: "Professional roles in Europe's finance capital", taglineAr: "وظائف مهنية في عاصمة المال الأوروبية",
    description: "Skilled positions in logistics, services and business support in one of Europe's highest-paying labour markets.",
    descriptionAr: "وظائف ماهرة في الخدمات اللوجستية والخدمات ودعم الأعمال في واحدة من أعلى أسواق العمل أجراً في أوروبا.",
    programs: [{ slug: "luxembourg-skilled", title: "Skilled Work", titleAr: "عمل ماهر", category: "Professional", categoryAr: "مهني", duration: "24 months", price: 3200, deposit: 700, installments: 6 }],
    documents: [...docs, "Diplomas & certificates"], eligibility: ["Age 21–45", "Intermediate English or French", "Relevant work experience"],
    timeline: [{ step: "Profile assessment", time: "1 week" }, { step: "Interviews", time: "2–4 weeks" }, { step: "Permit processing", time: "6–10 weeks" }, { step: "Relocation", time: "2–3 weeks" }],
  },
  {
    slug: "armenia", name: "Armenia", nameAr: "أرمينيا", flag: "🇦🇲", image: armenia,
    tagline: "Fast-track work opportunities in Yerevan", taglineAr: "فرص عمل سريعة في يريفان",
    description: "A growing economy with accessible visa procedures and roles in services, construction and tech support.",
    descriptionAr: "اقتصاد نامٍ بإجراءات تأشيرة سهلة ووظائف في الخدمات والبناء والدعم التقني.",
    programs: [{ slug: "armenia-work", title: "General Work", titleAr: "عمل عام", category: "Services", categoryAr: "خدمات", duration: "12 months", price: 950, deposit: 200, installments: 3 }],
    documents: docs.slice(0, 4), eligibility: ["Age 18–50", "Basic English or Russian"],
    timeline: [{ step: "Application review", time: "2–3 days" }, { step: "Job offer", time: "1–2 weeks" }, { step: "Visa & travel", time: "2–3 weeks" }],
  },
  {
    slug: "russia", name: "Russia", nameAr: "روسيا", flag: "🇷🇺", image: russia,
    tagline: "Work and study programs in major cities", taglineAr: "برامج عمل ودراسة في المدن الكبرى",
    description: "Programs in Moscow and other major cities across manufacturing, services and university pathways.",
    descriptionAr: "برامج في موسكو ومدن كبرى أخرى في التصنيع والخدمات والمسارات الجامعية.",
    programs: [
      { slug: "russia-work", title: "Work Program", titleAr: "برنامج عمل", category: "Industry", categoryAr: "صناعة", duration: "12 months", price: 1250, deposit: 250, installments: 4 },
      { slug: "russia-study", title: "Study Pathway", titleAr: "مسار دراسي", category: "Education", categoryAr: "تعليم", duration: "1 academic year", price: 1650, deposit: 350, installments: 4 },
    ],
    documents: docs, eligibility: ["Age 18–40", "Basic Russian is a plus"],
    timeline: [{ step: "Application review", time: "3–5 days" }, { step: "Invitation letter", time: "3–5 weeks" }, { step: "Visa & travel", time: "2–3 weeks" }],
  },
  {
    slug: "italy", name: "Italy", nameAr: "إيطاليا", flag: "🇮🇹", image: italy,
    tagline: "Hospitality and culinary careers", taglineAr: "مسارات مهنية في الضيافة وفنون الطهي",
    description: "Kitchens, restaurants and agriculture across Italy recruit international talent through official quota programs.",
    descriptionAr: "توظّف المطابخ والمطاعم والزراعة في إيطاليا مواهب دولية عبر برامج الحصص الرسمية.",
    programs: [{ slug: "italy-hospitality", title: "Hospitality & Culinary", titleAr: "الضيافة وفنون الطهي", category: "Hospitality", categoryAr: "ضيافة", duration: "9 months", price: 2850, deposit: 600, installments: 6 }],
    documents: [...docs, "Experience letters"], eligibility: ["Age 20–45", "Hospitality experience preferred"],
    timeline: [{ step: "Profile assessment", time: "1 week" }, { step: "Employer matching", time: "2–6 weeks" }, { step: "Nulla osta", time: "6–12 weeks" }, { step: "Visa & travel", time: "3–4 weeks" }],
  },
];

export const fromPrice = (c: Country) => Math.min(...c.programs.map((p) => p.price));
export const eur = (n: number) => `€${n.toLocaleString("en-US")}`;
export const getCountry = (slug: string) => countries.find((c) => c.slug === slug);
