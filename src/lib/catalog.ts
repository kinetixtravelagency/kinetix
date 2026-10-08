// Catalog mirrored from the database and Master Country & Programs Plan 2026. Bilingual EN/AR.
import bulgaria from "@/assets/pics/bulgaria.jpeg";
import luxembourg from "@/assets/pics/luxmberg.jpeg";
import armenia from "@/assets/pics/armeina.jpeg";
import russia from "@/assets/pics/russia.jpeg";
import italy from "@/assets/pics/italy.jpeg";
import slovenia from "@/assets/pics/solvenia.jpeg";
import ireland from "@/assets/pics/ireland.jpeg";

export type Track = "student" | "graduate";
export type Program = {
  slug: string;
  track: Track;
  title: string;
  titleAr: string;
  category: string;
  categoryAr: string;
  duration: string;
  price: number;
  deposit: number;
  installments: number;
  expectedSalary?: string;
  expectedSalaryAr?: string;
  workingHours?: string;
  accommodation?: string;
  accommodationAr?: string;
  requirements?: string[];
  requirementsAr?: string[];
};

export type Country = {
  slug: string;
  name: string;
  nameAr: string;
  flag: string;
  image: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  programs: Program[];
  documents: string[];
  eligibility: string[];
  timeline: { step: string; time: string }[];
};

export const MAX_INSTALLMENTS = 6;

const docs = [
  "CV in English (السيرة الذاتية)",
  "Valid passport (12+ months) (جواز سفر سارٍ)",
  "Recent passport photo (صورة شخصية حديثة)",
  "Educational certificate / Student proof (شهادة التخرج أو إثبات قيد)",
  "Medical certificate (شهادة صحية)",
  "Police clearance (صحيفة الحالة الجنائية)",
];

export const countries: Country[] = [
  {
    slug: "bulgaria",
    name: "Bulgaria",
    nameAr: "بلغاريا",
    flag: "🇧🇬",
    image: bulgaria,
    tagline: "Seasonal hospitality, logistics and manufacturing pathways",
    taglineAr: "عمل موسمي في الضيافة واللوجستيات والتصنيع على ساحل البحر الأسود",
    description: "Hotels, resorts, agriculture, and manufacturing along the Black Sea coast and major hubs recruit international workforce through direct seasonal and multi-year employment contracts.",
    descriptionAr: "توظّف الفنادق والمنتجعات والمصانع في بلغاريا كوادر دولية بعقود موسمية وتوظيف مباشر، مع توفير السكن ودعم إجراءات التصريح والتأشيرة.",
    programs: [
      { slug: "bulgaria-student-hospitality", track: "student", title: "Student Seasonal Hospitality", titleAr: "عمل موسمي في الضيافة للطلاب", category: "Hospitality", categoryAr: "ضيافة", duration: "3–6 months", price: 1450, deposit: 300, installments: 6, expectedSalary: "€600–€900 / month", expectedSalaryAr: "€600–€900 / شهرياً", workingHours: "8 hrs/day · 5–6 days/week", accommodation: "Provided by employer", accommodationAr: "توفرها الشركة", requirements: ["Age 18–35", "Basic English", "Student enrollment proof"], requirementsAr: ["العمر 18–35", "إنجليزية بسيطة", "إثبات قيد الدراسة"] },
      { slug: "bulgaria-student-resort", track: "student", title: "Student Seasonal Resort Support", titleAr: "عمل موسمي بالمنتجعات الشاطئية للطلاب", category: "Hospitality", categoryAr: "منتجعات", duration: "3–6 months", price: 1450, deposit: 300, installments: 6, expectedSalary: "€650–€950 / month", expectedSalaryAr: "€650–€950 / شهرياً", workingHours: "8 hrs/day · 6 days/week", accommodation: "Shared rooms at resort", accommodationAr: "غرف مشتركة في المنتجع", requirements: ["Age 18–30", "Customer service skills"], requirementsAr: ["العمر 18–30", "مهارات خدمة عملاء"] },
      { slug: "bulgaria-seasonal-agriculture", track: "student", title: "Seasonal Agriculture & Harvest", titleAr: "زراعة وحصاد موسمي", category: "Agriculture", categoryAr: "زراعة", duration: "3–6 months", price: 1350, deposit: 250, installments: 6, expectedSalary: "€500–€750 / month", expectedSalaryAr: "€500–€750 / شهرياً", workingHours: "6–10 hrs/day · seasonal", accommodation: "Farm housing included", accommodationAr: "إسكان في المزرعة مشمول", requirements: ["Age 18–45", "Physical fitness"], requirementsAr: ["العمر 18–45", "لياقة بدنية"] },
      { slug: "bulgaria-hospitality-worker", track: "graduate", title: "Hospitality & Hotel Operations", titleAr: "موظف فنادق ومطاعم خريجين", category: "Hospitality", categoryAr: "فنادق ومطاعم", duration: "12–24 months", price: 1850, deposit: 400, installments: 6, expectedSalary: "€900–€1,300 / month", expectedSalaryAr: "€900–€1,300 / شهرياً", workingHours: "8 hrs/day · 5 days/week", accommodation: "Staff accommodation available", accommodationAr: "سكن موظفين متاح", requirements: ["Age 20–40", "English or basic Bulgarian", "Hospitality experience preferred"], requirementsAr: ["العمر 20–40", "إنجليزية أو بلغارية بسيطة", "خبرة في الضيافة مفضلة"] },
      { slug: "bulgaria-logistics-worker", track: "graduate", title: "Warehouse & Logistics Assistant", titleAr: "مستودعات ودعم لوجستي", category: "Logistics", categoryAr: "لوجستيات", duration: "12–24 months", price: 1800, deposit: 400, installments: 6, expectedSalary: "€850–€1,200 / month", expectedSalaryAr: "€850–€1,200 / شهرياً", workingHours: "8 hrs/day · shift-based", accommodation: "Housing allowance provided", accommodationAr: "بدل سكن مشمول", requirements: ["Age 20–45", "Physical fitness", "Forklift license a plus"], requirementsAr: ["العمر 20–45", "لياقة بدنية", "رخصة رافعة شوكية ميزة"] },
      { slug: "bulgaria-production-worker", track: "graduate", title: "Manufacturing & Production Worker", titleAr: "عمال خطوط إنتاج وتصنيع", category: "Manufacturing", categoryAr: "تصنيع وإنتاج", duration: "12–24 months", price: 1750, deposit: 350, installments: 6, expectedSalary: "€800–€1,100 / month", expectedSalaryAr: "€800–€1,100 / شهرياً", workingHours: "8 hrs/day · shift rotation", accommodation: "Company dormitory", accommodationAr: "سكن الشركة", requirements: ["Age 20–45", "No specific experience required"], requirementsAr: ["العمر 20–45", "لا تشترط خبرة"] },
      { slug: "bulgaria-skilled-worker", track: "graduate", title: "Skilled Trades & Technicians", titleAr: "مهن وحرف تخصصية وتقنية", category: "Skilled Trades", categoryAr: "مهن وحرف ماهرة", duration: "12–24 months", price: 2100, deposit: 450, installments: 6, expectedSalary: "€1,100–€1,600 / month", expectedSalaryAr: "€1,100–€1,600 / شهرياً", workingHours: "8 hrs/day · Mon–Fri", accommodation: "Allowance or company housing", accommodationAr: "بدل سكن أو سكن الشركة", requirements: ["Age 21–45", "Technical diploma or trade certificate", "2+ yrs experience"], requirementsAr: ["العمر 21–45", "دبلوم فني أو شهادة حرفة", "خبرة سنتين أو أكثر"] },
      // Fallbacks
      { slug: "bulgaria-student", track: "student", title: "Student Track", titleAr: "مسار الطلاب العام", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: 1450, deposit: 300, installments: 6, expectedSalary: "€600–€900 / month", expectedSalaryAr: "€600–€900 / شهرياً" },
      { slug: "bulgaria-graduate", track: "graduate", title: "Graduate Track", titleAr: "مسار الخريجين العام", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: 1850, deposit: 400, installments: 6, expectedSalary: "€900–€1,300 / month", expectedSalaryAr: "€900–€1,300 / شهرياً" },
    ],
    documents: docs,
    eligibility: ["Age 18–45", "Basic English or Russian", "No prior EU visa refusals", "Valid university enrollment for student tracks"],
    timeline: [
      { step: "Application review & CV screening", time: "2–4 days" },
      { step: "Pre-interview & Employer matching", time: "1–3 weeks" },
      { step: "Work permit issuance", time: "4–8 weeks" },
      { step: "Visa issuance & departure", time: "2–4 weeks" },
    ],
  },
  {
    slug: "luxembourg",
    name: "Luxembourg",
    nameAr: "لوكسمبورغ",
    flag: "🇱🇺",
    image: luxembourg,
    tagline: "High-income professional, IT and higher education routes",
    taglineAr: "وظائف مهنية وتقنية عالية الدخل ودراسة جامعية عليا في قلب أوروبا",
    description: "Skilled positions in IT, logistics, corporate finance, and higher education in one of Europe's strongest economies with regulated work authorization procedures.",
    descriptionAr: "فرص عمل ماهرة في تكنولوجيا المعلومات واللوجستيات والمالية وقبول دراسي في لوكسمبورغ مع إجراءات رسمية معتمدة لتصريح الإقامة والعمل.",
    programs: [
      { slug: "luxembourg-higher-education", track: "student", title: "Higher Education & University Route", titleAr: "قبول ودراسة جامعية عليا", category: "Education", categoryAr: "تعليم جامعي", duration: "Academic year", price: 2800, deposit: 600, installments: 6, expectedSalary: "Part-time €700–€1,000 / month", expectedSalaryAr: "دوام جزئي €700–€1,000 / شهرياً", workingHours: "Study full-time + 20 hrs/week work", accommodation: "Student housing support", accommodationAr: "دعم سكن طلابي" },
      { slug: "luxembourg-student-parttime", track: "student", title: "Student Study + Part-Time Work", titleAr: "دراسة + عمل جزئي مصرح", category: "Education & Work", categoryAr: "دراسة وعمل", duration: "12 months", price: 3000, deposit: 650, installments: 6, expectedSalary: "€900–€1,200 / month", expectedSalaryAr: "€900–€1,200 / شهرياً", workingHours: "20 hrs/week (work) + study", accommodation: "Self-arranged or student dorms", accommodationAr: "سكن طلابي أو مستقل" },
      { slug: "luxembourg-skilled-worker", track: "graduate", title: "Skilled Specialist & Professional", titleAr: "وظائف مهنية متخصصة", category: "Professional", categoryAr: "مهني متخصص", duration: "24 months", price: 3400, deposit: 800, installments: 6, expectedSalary: "€2,500–€3,800 / month", expectedSalaryAr: "€2,500–€3,800 / شهرياً", workingHours: "40 hrs/week · Mon–Fri", accommodation: "Relocation allowance provided", accommodationAr: "بدل انتقال مشمول" },
      { slug: "luxembourg-it-technology", track: "graduate", title: "IT, Tech & Software Engineering", titleAr: "تكنولوجيا البرمجيات وشبكات", category: "IT & Tech", categoryAr: "تقنية وتكنولوجيا", duration: "24 months", price: 3500, deposit: 800, installments: 6, expectedSalary: "€3,000–€5,000 / month", expectedSalaryAr: "€3,000–€5,000 / شهرياً", workingHours: "40 hrs/week · flexible", accommodation: "Allowance negotiated with employer", accommodationAr: "بدل سكن يُحدد مع صاحب العمل" },
      { slug: "luxembourg-logistics", track: "graduate", title: "Supply Chain & Logistics Management", titleAr: "لوجستيات وسلاسل إمداد", category: "Logistics", categoryAr: "لوجستيات", duration: "24 months", price: 3200, deposit: 700, installments: 6, expectedSalary: "€2,200–€3,200 / month", expectedSalaryAr: "€2,200–€3,200 / شهرياً", workingHours: "40 hrs/week · shift rotation", accommodation: "Housing support available", accommodationAr: "دعم السكن متاح" },
      { slug: "luxembourg-hospitality", track: "graduate", title: "Gastronomy & Hotel Staff", titleAr: "ضيافة وفنادق راقية", category: "Hospitality", categoryAr: "ضيافة وفنادق", duration: "12–24 months", price: 3100, deposit: 700, installments: 6, expectedSalary: "€1,900–€2,700 / month", expectedSalaryAr: "€1,900–€2,700 / شهرياً", workingHours: "8-9 hrs/day · 5-6 days/week", accommodation: "Staff accommodation available", accommodationAr: "سكن موظفين متاح" },
      { slug: "luxembourg-finance", track: "graduate", title: "Finance, Banking & Accounting", titleAr: "قطاع مالي ومحاسبي", category: "Finance", categoryAr: "مالية ومحاسبة", duration: "24 months", price: 3600, deposit: 850, installments: 6, expectedSalary: "€3,500–€6,000 / month", expectedSalaryAr: "€3,500–€6,000 / شهرياً", workingHours: "40-45 hrs/week · Mon–Fri", accommodation: "Relocation package", accommodationAr: "باقة انتقال كاملة" },
      // Fallbacks
      { slug: "luxembourg-student", track: "student", title: "Student Track", titleAr: "مسار الطلاب العام", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: 2800, deposit: 600, installments: 6, expectedSalary: "Part-time €700–€1,000 / month", expectedSalaryAr: "دوام جزئي €700–€1,000 / شهرياً" },
      { slug: "luxembourg-graduate", track: "graduate", title: "Graduate Track", titleAr: "مسار الخريجين العام", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: 3200, deposit: 700, installments: 6, expectedSalary: "€2,200–€3,800 / month", expectedSalaryAr: "€2,200–€3,800 / شهرياً" },
    ],
    documents: [...docs, "Academic degrees & translated transcripts (الشهادات المترجمة)"],
    eligibility: ["Age 21–45", "Intermediate English or French", "Relevant academic degree or verifiable work experience"],
    timeline: [
      { step: "Profile assessment & CV refinement", time: "1 week" },
      { step: "Pre-interview & Employer selection", time: "2–4 weeks" },
      { step: "ADEM clearance & permit processing", time: "6–10 weeks" },
      { step: "Visa submission & arrival", time: "2–3 weeks" },
    ],
  },
  {
    slug: "armenia",
    name: "Armenia",
    nameAr: "أرمينيا",
    flag: "🇦🇲",
    image: armenia,
    tagline: "Fast-track work permits and student admissions in Yerevan",
    taglineAr: "فرص عمل سريعة وتصاريح إقامة مرنة وقبول جامعي في يريفان",
    description: "A fast-moving market with accessible work residency, modern electronic permit issuing, and steady demand in services, tech support, manufacturing, and hospitality.",
    descriptionAr: "اقتصاد نامٍ بإجراءات إلكترونية ميسرة وسريعة لتصاريح العمل والإقامة في مجالات الخدمات والتقنية والتصنيع والضيافة.",
    programs: [
      { slug: "armenia-university-student", track: "student", title: "University Admission & Studies", titleAr: "قبول دراسي جامعي", category: "Education", categoryAr: "تعليم جامعي", duration: "Academic year", price: 950, deposit: 200, installments: 6, expectedSalary: "Part-time ~€400 / month", expectedSalaryAr: "دوام جزئي ~€400 / شهرياً", workingHours: "Full-time study + part-time allowed", accommodation: "University dorms available", accommodationAr: "سكن جامعي متاح", requirements: ["Age 17-30", "High school diploma", "English or Russian B1"], requirementsAr: ["العمر 17-30", "شهادة ثانوية", "إنجليزية أو روسية B1"] },
      { slug: "armenia-it-software", track: "graduate", title: "IT, Web & Tech Support", titleAr: "دعم فني وتطوير برمجيات", category: "IT", categoryAr: "تقنية معلومات", duration: "12–24 months", price: 1300, deposit: 300, installments: 6, expectedSalary: "€800–€1,400 / month", expectedSalaryAr: "€800–€1,400 / شهرياً", workingHours: "40 hrs/week · remote-friendly", accommodation: "Apartment allowance negotiable", accommodationAr: "بدل شقة قابل للتفاوض" },
      { slug: "armenia-hospitality", track: "graduate", title: "Hotels, Tourism & Guest Services", titleAr: "ضيافة وسياحة في يريفان", category: "Hospitality", categoryAr: "سياحة وضيافة", duration: "12 months", price: 1100, deposit: 250, installments: 6, expectedSalary: "€500–€800 / month", expectedSalaryAr: "€500–€800 / شهرياً", workingHours: "8 hrs/day · 6 days/week", accommodation: "Staff housing available", accommodationAr: "سكن موظفين متاح" },
      { slug: "armenia-customer-support", track: "graduate", title: "Customer Support & Operations", titleAr: "خدمة عملاء ودعم تشغيلي", category: "Services", categoryAr: "خدمات", duration: "12 months", price: 1050, deposit: 250, installments: 6, expectedSalary: "€450–€700 / month", expectedSalaryAr: "€450–€700 / شهرياً", workingHours: "8 hrs/day · shift-based", accommodation: "Self-arranged (affordable local market)", accommodationAr: "مستقل (سوق محلي معقول)" },
      { slug: "armenia-manufacturing", track: "graduate", title: "Production & Manufacturing", titleAr: "عمال تصنيع وإنتاج", category: "Manufacturing", categoryAr: "صناعة", duration: "12 months", price: 1150, deposit: 250, installments: 6, expectedSalary: "€500–€750 / month", expectedSalaryAr: "€500–€750 / شهرياً", workingHours: "8 hrs/day · 5 days/week", accommodation: "Company housing or allowance", accommodationAr: "سكن الشركة أو بدل سكن" },
      { slug: "armenia-logistics", track: "graduate", title: "Logistics, Warehousing & Dispatch", titleAr: "توزيع وشحن لوجستي", category: "Logistics", categoryAr: "لوجستيات", duration: "12 months", price: 1150, deposit: 250, installments: 6, expectedSalary: "€550–€800 / month", expectedSalaryAr: "€550–€800 / شهرياً", workingHours: "8 hrs/day · shift rotation", accommodation: "Allowance or warehouse housing", accommodationAr: "بدل سكن أو سكن المستودع" },
      { slug: "armenia-technical-worker", track: "graduate", title: "Technical & Maintenance Crafts", titleAr: "فنيون وصيانة", category: "Technical", categoryAr: "فني", duration: "12 months", price: 1250, deposit: 300, installments: 6, expectedSalary: "€700–€1,000 / month", expectedSalaryAr: "€700–€1,000 / شهرياً", workingHours: "8 hrs/day · Mon–Sat", accommodation: "Company arranged", accommodationAr: "تُرتبها الشركة" },
      // Fallbacks
      { slug: "armenia-student", track: "student", title: "Student Track", titleAr: "مسار الطلاب العام", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: 950, deposit: 200, installments: 6, expectedSalary: "Part-time ~€400 / month", expectedSalaryAr: "دوام جزئي ~€400 / شهرياً" },
      { slug: "armenia-graduate", track: "graduate", title: "Graduate Track", titleAr: "مسار الخريجين العام", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: 1250, deposit: 250, installments: 6, expectedSalary: "€600–€1,000 / month", expectedSalaryAr: "€600–€1,000 / شهرياً" },
    ],
    documents: docs.slice(0, 4),
    eligibility: ["Age 18–50", "Basic English or Russian", "Valid passport"],
    timeline: [
      { step: "Application review & CV check", time: "2–3 days" },
      { step: "Pre-interview & Employer offer", time: "1–2 weeks" },
      { step: "Electronic work permit & visa", time: "2–4 weeks" },
    ],
  },
  {
    slug: "russia",
    name: "Russia",
    nameAr: "روسيا",
    flag: "🇷🇺",
    image: russia,
    tagline: "Industrial, technical, and academic opportunities in major cities",
    taglineAr: "برامج عمل صناعية وتقنية ومسارات جامعية في كبرى المدن الروسية",
    description: "Employer sponsorship pathways across industrial production, warehousing, hospitality, and university degree programs in Moscow and major regional capitals.",
    descriptionAr: "مسارات عمل بإشراف أصحاب العمل في مجالات الصناعة واللوجستيات والمطاعم إلى جانب القبول الجامعي والدراسة في موسكو وسانت بطرسبرغ.",
    programs: [
      { slug: "russia-university-student", track: "student", title: "Russian Universities Admission", titleAr: "قبول جامعي ودراسة روسية", category: "Education", categoryAr: "تعليم", duration: "Academic year", price: 1200, deposit: 250, installments: 6, expectedSalary: "Part-time ~€350 / month", expectedSalaryAr: "دوام جزئي ~€350 / شهرياً", workingHours: "Full-time study", accommodation: "University dormitory", accommodationAr: "سكن جامعي" },
      { slug: "russia-student-work", track: "student", title: "Student Work Pathway", titleAr: "مسار العمل الطلابي", category: "Education & Work", categoryAr: "دراسة وعمل", duration: "12 months", price: 1350, deposit: 300, installments: 6, expectedSalary: "€400–€650 / month", expectedSalaryAr: "€400–€650 / شهرياً", workingHours: "20 hrs/week work + study", accommodation: "Student housing or company arranged", accommodationAr: "سكن طلابي أو تُرتبه الشركة" },
      { slug: "russia-manufacturing", track: "graduate", title: "Industrial & Factory Production", titleAr: "عمال صناعة ومصانع", category: "Manufacturing", categoryAr: "صناعة", duration: "12–24 months", price: 1550, deposit: 350, installments: 6, expectedSalary: "€700–€1,100 / month", expectedSalaryAr: "€700–€1,100 / شهرياً", workingHours: "8 hrs/day · shift-based", accommodation: "Factory dormitory", accommodationAr: "سكن المصنع" },
      { slug: "russia-logistics", track: "graduate", title: "Warehousing & Freight Logistics", titleAr: "مستودعات وشحن لوجستي", category: "Logistics", categoryAr: "لوجستيات", duration: "12–24 months", price: 1500, deposit: 350, installments: 6, expectedSalary: "€650–€1,000 / month", expectedSalaryAr: "€650–€1,000 / شهرياً", workingHours: "8 hrs/day · 5-6 days/week", accommodation: "Warehouse campus housing", accommodationAr: "سكن مجمع المستودع" },
      { slug: "russia-hospitality", track: "graduate", title: "Hotels & Restaurant Service", titleAr: "قطاع المطاعم والضيافة", category: "Hospitality", categoryAr: "ضيافة", duration: "12 months", price: 1450, deposit: 300, installments: 6, expectedSalary: "€600–€900 / month", expectedSalaryAr: "€600–€900 / شهرياً", workingHours: "8-10 hrs/day · 5-6 days/week", accommodation: "Staff housing available", accommodationAr: "سكن موظفين متاح" },
      { slug: "russia-construction", track: "graduate", title: "Construction & Site Operations", titleAr: "قطاع المقاولات والإنشاءات", category: "Construction", categoryAr: "إنشاءات", duration: "12–24 months", price: 1600, deposit: 350, installments: 6, expectedSalary: "€750–€1,200 / month", expectedSalaryAr: "€750–€1,200 / شهرياً", workingHours: "10 hrs/day · 5-6 days/week", accommodation: "Site camp housing", accommodationAr: "سكن موقع البناء" },
      { slug: "russia-technical-worker", track: "graduate", title: "Skilled Technicians & Engineering Support", titleAr: "فنيون وتقنيون ماهرون", category: "Technical", categoryAr: "فني ماهر", duration: "12–24 months", price: 1700, deposit: 400, installments: 6, expectedSalary: "€900–€1,400 / month", expectedSalaryAr: "€900–€1,400 / شهرياً", workingHours: "8 hrs/day · Mon–Fri", accommodation: "Company accommodation", accommodationAr: "سكن الشركة" },
      // Fallbacks
      { slug: "russia-student", track: "student", title: "Student Track", titleAr: "مسار الطلاب العام", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: 1200, deposit: 250, installments: 6, expectedSalary: "Part-time ~€350 / month", expectedSalaryAr: "دوام جزئي ~€350 / شهرياً" },
      { slug: "russia-graduate", track: "graduate", title: "Graduate Track", titleAr: "مسار الخريجين العام", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: 1600, deposit: 350, installments: 6, expectedSalary: "€700–€1,200 / month", expectedSalaryAr: "€700–€1,200 / شهرياً" },
    ],
    documents: docs,
    eligibility: ["Age 18–45", "Basic English (Russian is a plus)", "Clean criminal record"],
    timeline: [
      { step: "Application review & CV check", time: "3–5 days" },
      { step: "Pre-interview & Employer selection", time: "2–3 weeks" },
      { step: "Official invitation letter & work permit", time: "3–5 weeks" },
      { step: "Visa stamping & departure", time: "2–3 weeks" },
    ],
  },
  {
    slug: "italy",
    name: "Italy",
    nameAr: "إيطاليا",
    flag: "🇮🇹",
    image: italy,
    tagline: "Decreto Flussi quotas in agriculture, culinary and skilled industries",
    taglineAr: "حصص رسمية (Decreto Flussi) في الزراعة والضيافة والمقاولات والتعليم",
    description: "Official quota employment and student routes across restaurants, agriculture, logistics, and skilled crafts, including nulla osta clearances and direct visa appointment guidance.",
    descriptionAr: "عقود عمل وحصص رسمية معتمدة للزراعة والضيافة والمطاعم والتشييد إلى جانب القبول الجامعي، مع استخراج تصريح النولا أوستا (Nulla Osta).",
    programs: [
      { slug: "italy-university-student", track: "student", title: "Higher Education in Italy", titleAr: "دراسة جامعية بإيطاليا", category: "Education", categoryAr: "تعليم", duration: "Academic year", price: 2450, deposit: 500, installments: 6, expectedSalary: "Part-time €600–€900 / month", expectedSalaryAr: "دوام جزئي €600–€900 / شهرياً", workingHours: "Full-time study + 20 hrs work", accommodation: "University housing or private", accommodationAr: "سكن جامعي أو خاص" },
      { slug: "italy-seasonal-agri", track: "student", title: "Seasonal Agriculture (Decreto Flussi)", titleAr: "زراعة موسمية - حصص رسمية", category: "Agriculture", categoryAr: "زراعة", duration: "6–9 months", price: 2300, deposit: 500, installments: 6, expectedSalary: "€900–€1,200 / month", expectedSalaryAr: "€900–€1,200 / شهرياً", workingHours: "8-10 hrs/day · seasonal", accommodation: "Farm accommodation included", accommodationAr: "سكن المزرعة مشمول" },
      { slug: "italy-seasonal-hospitality", track: "student", title: "Seasonal Coastal & Resort Hospitality", titleAr: "سياحة وضيافة موسمية", category: "Hospitality", categoryAr: "ضيافة", duration: "6–9 months", price: 2400, deposit: 500, installments: 6, expectedSalary: "€1,000–€1,400 / month", expectedSalaryAr: "€1,000–€1,400 / شهرياً", workingHours: "8-9 hrs/day · 6 days/week", accommodation: "Staff lodging at resort", accommodationAr: "سكن موظفين في المنتجع" },
      { slug: "italy-hospitality-general", track: "graduate", title: "Culinary & Restaurant Staff", titleAr: "طهاة وضيافة فندقية عامة", category: "Hospitality", categoryAr: "مطاعم وضيافة", duration: "12–24 months", price: 2850, deposit: 600, installments: 6, expectedSalary: "€1,300–€2,000 / month", expectedSalaryAr: "€1,300–€2,000 / شهرياً", workingHours: "8 hrs/day · split shifts", accommodation: "Staff accommodation or allowance", accommodationAr: "سكن موظفين أو بدل سكن" },
      { slug: "italy-construction", track: "graduate", title: "Construction & Infrastructure Trades", titleAr: "مقاولات وإنشاءات", category: "Construction", categoryAr: "بناء وتشييد", duration: "12–24 months", price: 2750, deposit: 600, installments: 6, expectedSalary: "€1,400–€2,200 / month", expectedSalaryAr: "€1,400–€2,200 / شهرياً", workingHours: "8-10 hrs/day · 5-6 days/week", accommodation: "Site housing or allowance", accommodationAr: "سكن موقع أو بدل سكن" },
      { slug: "italy-manufacturing", track: "graduate", title: "Manufacturing & Industrial Fabrication", titleAr: "قطاع التصنيع والإنتاج", category: "Manufacturing", categoryAr: "تصنيع وإنتاج", duration: "12–24 months", price: 2700, deposit: 550, installments: 6, expectedSalary: "€1,300–€1,900 / month", expectedSalaryAr: "€1,300–€1,900 / شهرياً", workingHours: "8 hrs/day · shift-based", accommodation: "Company or local housing", accommodationAr: "سكن الشركة أو السوق المحلي" },
      { slug: "italy-logistics", track: "graduate", title: "Logistics, Shipping & Freight Support", titleAr: "لوجستيات ومستودعات وشحن", category: "Logistics", categoryAr: "لوجستيات", duration: "12–24 months", price: 2750, deposit: 600, installments: 6, expectedSalary: "€1,300–€1,900 / month", expectedSalaryAr: "€1,300–€1,900 / شهرياً", workingHours: "8 hrs/day · shift rotation", accommodation: "Allowance provided", accommodationAr: "بدل سكن مشمول" },
      { slug: "italy-skilled-professional", track: "graduate", title: "Skilled Engineers & Specialists", titleAr: "مهن هندسية وتقنية متخصصة", category: "Professional", categoryAr: "مهني متخصص", duration: "24 months", price: 3100, deposit: 700, installments: 6, expectedSalary: "€2,200–€3,500 / month", expectedSalaryAr: "€2,200–€3,500 / شهرياً", workingHours: "40 hrs/week · Mon–Fri", accommodation: "Relocation package negotiable", accommodationAr: "باقة انتقال قابلة للتفاوض" },
      // Fallbacks
      { slug: "italy-student", track: "student", title: "Student Track", titleAr: "مسار الطلاب العام", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: 2450, deposit: 500, installments: 6, expectedSalary: "€600–€900 / month", expectedSalaryAr: "€600–€900 / شهرياً" },
      { slug: "italy-graduate", track: "graduate", title: "Graduate Track", titleAr: "مسار الخريجين العام", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: 2850, deposit: 600, installments: 6, expectedSalary: "€1,300–€2,200 / month", expectedSalaryAr: "€1,300–€2,200 / شهرياً" },
    ],
    documents: [...docs, "Work experience certificates (شهادات الخبرة)"],
    eligibility: ["Age 20–45", "Basic English or Italian", "Relevant background in hospitality, crafts or agriculture"],
    timeline: [
      { step: "CV assessment & profile review", time: "1 week" },
      { step: "Pre-interview & employer quota slot", time: "2–4 weeks" },
      { step: "Nulla Osta authorization clearance", time: "6–12 weeks" },
      { step: "Type D visa processing & departure", time: "3–4 weeks" },
    ],
  },
  {
    slug: "slovenia",
    name: "Slovenia",
    nameAr: "سلوفينيا",
    flag: "🇸🇮",
    image: slovenia,
    tagline: "EU work permits in tourism and industry",
    taglineAr: "تصاريح عمل أوروبية في السياحة والصناعة",
    description: "An EU member with growing demand for workers in tourism, logistics and manufacturing, and straightforward single-permit procedures.",
    descriptionAr: "دولة عضو في الاتحاد الأوروبي بطلب متزايد على العمالة في السياحة واللوجستيات والتصنيع، بإجراءات تصريح موحدة وواضحة.",
    programs: [
      { slug: "slovenia-student", track: "student", title: "Student Seasonal Track", titleAr: "مسار الطلاب الموسمي", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: 1450, deposit: 300, installments: 6, expectedSalary: "€700–€1,000 / month", expectedSalaryAr: "€700–€1,000 / شهرياً", workingHours: "8 hrs/day · seasonal", accommodation: "Employer-provided housing", accommodationAr: "سكن يوفره صاحب العمل" },
      { slug: "slovenia-graduate", track: "graduate", title: "Graduate & Industrial Track", titleAr: "مسار الخريجين والصناعة", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: 1750, deposit: 400, installments: 6, expectedSalary: "€1,100–€1,700 / month", expectedSalaryAr: "€1,100–€1,700 / شهرياً", workingHours: "8 hrs/day · 5 days/week", accommodation: "Company housing or allowance", accommodationAr: "سكن الشركة أو بدل سكن" },
    ],
    documents: docs,
    eligibility: ["Age 18–45", "Basic English", "Clean criminal record"],
    timeline: [
      { step: "Application review", time: "3–5 days" },
      { step: "Employer matching & interview", time: "2–4 weeks" },
      { step: "Single permit issuance", time: "4–8 weeks" },
      { step: "Visa & travel", time: "2–3 weeks" },
    ],
  },
  {
    slug: "ireland",
    name: "Ireland",
    nameAr: "أيرلندا",
    flag: "🇮🇪",
    image: ireland,
    tagline: "English-speaking careers in Europe's tech hub",
    taglineAr: "مسارات مهنية بالإنجليزية في مركز التقنية الأوروبي",
    description: "Critical skills and general employment permits in one of Europe's strongest job markets, with English as the working language.",
    descriptionAr: "تصاريح عمل للمهارات المطلوبة والوظائف العامة في واحدة من أقوى أسواق العمل في أوروبا، والإنجليزية هي لغة العمل.",
    programs: [
      { slug: "ireland-student", track: "student", title: "Student Pathway", titleAr: "مسار الطلاب والدراسة", category: "Students", categoryAr: "طلاب", duration: "3–6 months", price: 2900, deposit: 600, installments: 6, expectedSalary: "Part-time €900–€1,300 / month", expectedSalaryAr: "دوام جزئي €900–€1,300 / شهرياً", workingHours: "Full-time study + 20 hrs/week", accommodation: "Student housing or private", accommodationAr: "سكن طلابي أو خاص" },
      { slug: "ireland-graduate", track: "graduate", title: "Critical Skills & Employment", titleAr: "مسار المهارات والتوظيف", category: "Graduates", categoryAr: "خريجين", duration: "12–24 months", price: 3400, deposit: 800, installments: 6, expectedSalary: "€2,800–€5,000 / month", expectedSalaryAr: "€2,800–€5,000 / شهرياً", workingHours: "40 hrs/week · Mon–Fri", accommodation: "Relocation allowance included", accommodationAr: "بدل انتقال مشمول" },
    ],
    documents: [...docs, "Diplomas & professional degrees"],
    eligibility: ["Age 21–50", "Good English (IELTS 5+ preferred)", "Relevant work experience"],
    timeline: [
      { step: "Profile assessment & CV review", time: "1 week" },
      { step: "Interviews & Job offer", time: "3–6 weeks" },
      { step: "Employment permit processing", time: "6–10 weeks" },
      { step: "Visa & relocation", time: "3–4 weeks" },
    ],
  },
];

export const fromPrice = (c: Country) => Math.min(...c.programs.map((p) => p.price));
export const eur = (n: number) => `€${n.toLocaleString("en-US")}`;
export const getCountry = (slug: string) => countries.find((c) => c.slug === slug);
export const getProgram = (slug: string) => {
  for (const c of countries) {
    const p = c.programs.find((x) => x.slug === slug);
    if (p) return { country: c, program: p };
  }
  return undefined;
};
