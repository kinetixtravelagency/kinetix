import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

const dict = {
  en: {
    countries: "Countries", how: "How it works", pricing: "Pricing", partners: "Partners", faq: "FAQ",
    applyNow: "Apply now", signIn: "Sign in", dashboard: "Dashboard", signOut: "Sign out",
    heroEyebrow: "International career mobility",
    heroTitle1: "Your next career move", heroTitle2: "starts here.",
    heroSub: "Explore international work opportunities, understand the costs, prepare your documents, and start your journey with Kinetix.",
    exploreCta: "Explore Opportunities", applyCta: "Start Your Application",
    statCountries: "Countries", statPrograms: "Programs", statInstallments: "Installments",
    countriesEyebrow: "Destinations", countriesTitle: "Where could your next move take you?",
    from: "From", viewPrograms: "View programs", programsWord: "programs",
    featuredEyebrow: "Featured programs", featuredTitle: "Clear programs. Clear prices.",
    howEyebrow: "How Kinetix works", howTitle: "Four steps from idea to arrival.",
    step: "Step",
    how1t: "Choose", how1d: "Explore countries and pick the program that fits your goals.",
    how2t: "Apply", how2d: "Submit your application and upload documents securely.",
    how3t: "Pay in parts", how3d: "Start with a deposit, then pay the rest in installments.",
    how4t: "Move", how4d: "We guide permits, visa and travel until you arrive.",
    whyEyebrow: "Why Kinetix", whyTitle: "Not a visa office. A mobility partner.",
    whySub: "We built Kinetix for people who want to understand every step of their move — and every euro.",
    why1t: "Full price transparency", why1d: "Every cost listed upfront. No surprise fees.",
    why2t: "Flexible installments", why2d: "Spread payments across up to six months.",
    why3t: "Secure documents", why3d: "Encrypted storage, visible only to your case team.",
    why4t: "End-to-end guidance", why4d: "One advisor from first call to first day at work.",
    pricingEyebrow: "Transparent costs & payment plans", pricingTitle: "Know the full price before you start.",
    pricingSub: "Pick a program and see exactly what you pay today and every month after.",
    programLabel: "Program", totalCost: "Total program cost", installmentsLabel: "Installments",
    dueToday: "Due today", thenMonthly: "monthly", applyProgram: "Apply for this program",
    promoTitle: "Have a promo code?", promoText: "Friends and partners of Kinetix can share codes that give you a discount on any program.",
    partnerTitle: "Turn connections into opportunities.",
    partnerText: "Become a Sales Partner, earn commission on every client and climb from Bronze to Gold.",
    becomePartner: "Become a partner",
    faqEyebrow: "FAQ", faqTitle: "Questions, answered honestly.",
    ctaEyebrow: "Start today", ctaTitle: "Ready to make your move?",
    ctaSub: "Create a free account, choose a program and submit your application in minutes.",
    footerTag: "International career mobility. Transparent costs, flexible payment plans and guidance from application to arrival.",
    explore: "Explore", legal: "Legal", terms: "Terms", privacy: "Privacy", refund: "Refund policy",
    disclaimer: "Kinetix does not guarantee employment or visa approval; final decisions rest with employers and authorities.",
    allCountries: "All countries", availablePrograms: "Available programs", requiredDocs: "Required documents",
    eligibility: "Eligibility", timeline: "Timeline", deposit: "Deposit", upToMonthly: "monthly", apply: "Apply",
    // auth
    welcome: "Welcome to Kinetix", authSub: "Sign in or create an account to apply and track your journey.",
    email: "Email", password: "Password", fullName: "Full name",
    signInBtn: "Sign in", createAccount: "Create account", needAccount: "New here? Create an account",
    haveAccount: "Already have an account? Sign in", checkEmail: "Check your email to confirm your account, then sign in.",
    // dashboard
    myApplications: "My applications", myProfile: "My profile", noApplications: "No applications yet.",
    partnerPortal: "Partner portal", adminDashboard: "Admin dashboard",
    promoCode: "Promo code", level: "Level", commissionRate: "Commission rate",
    totalEarned: "Total earned", pending: "Pending", clients: "Clients",
    payoutMethod: "Payout method", payoutDetails: "Payout details", save: "Save", saved: "Saved",
    phone: "Phone", overview: "Overview", applications: "Applications", programsAdmin: "Programs", partnersAdmin: "Partners",
    status: "Status", date: "Date", program: "Program", price: "Price", country: "Country",
    notPrepared: "This destination is being prepared", backCountries: "Back to all countries", upTo: "Up to", monthly: "monthly",
    trackStudent: "Students", trackGraduate: "Graduates", chooseTrack: "Choose your track", paymentPlan: "Payment plan",
    payFull: "Pay in full", payFullSub: "One single payment", payInst: "Installments", payInstSub: "Deposit + up to 6 months",
    dueNow: "Due now", remaining: "Remaining", months: "months", stepProgram: "Program", stepDetails: "Your details", stepDocs: "Documents",
    passport: "Passport number", birthDate: "Date of birth", education: "University / education", promoOptional: "Promo code (optional)",
    next: "Continue", back: "Back", submitApp: "Submit application", submitting: "Submitting…", upload: "Upload", replace: "Replace",
    docsHint: "PDF, JPG or PNG — up to 10 MB each. You can also add them later from your dashboard.",
    appDone: "Application submitted", appDoneSub: "Pay your deposit to start processing. Our team will contact you with payment details.",
    goDashboard: "Go to my dashboard", depositAwait: "Awaiting deposit payment", depositAwaitSub: "Your file starts moving as soon as your first payment is received.",
    progress: "Application progress", documentsWord: "Documents", docPending: "Under review", docApproved: "Approved", docRejected: "Needs re-upload",
    stage0: "Deposit", stage1: "Documents review", stage2: "Placement", stage3: "Permit processing", stage4: "Visa", stage5: "Ready to travel",
    depositPaid: "Deposit paid", plan: "Plan", track: "Track", view: "View", required: "Required",
  },
  ar: {
    countries: "الدول", how: "كيف نعمل", pricing: "الأسعار", partners: "الشركاء", faq: "الأسئلة الشائعة",
    applyNow: "قدّم الآن", signIn: "تسجيل الدخول", dashboard: "لوحتي", signOut: "تسجيل الخروج",
    heroEyebrow: "التنقّل المهني الدولي",
    heroTitle1: "خطوتك المهنية القادمة", heroTitle2: "تبدأ من هنا.",
    heroSub: "استكشف فرص العمل الدولية، وافهم التكاليف، وجهّز مستنداتك، وابدأ رحلتك مع كينتيكس.",
    exploreCta: "استكشف الفرص", applyCta: "ابدأ طلبك",
    statCountries: "دول", statPrograms: "برامج", statInstallments: "أقساط",
    countriesEyebrow: "الوجهات", countriesTitle: "إلى أين ستأخذك خطوتك القادمة؟",
    from: "ابتداءً من", viewPrograms: "عرض البرامج", programsWord: "برامج",
    featuredEyebrow: "برامج مميزة", featuredTitle: "برامج واضحة. أسعار واضحة.",
    howEyebrow: "كيف تعمل كينتيكس", howTitle: "أربع خطوات من الفكرة إلى الوصول.",
    step: "الخطوة",
    how1t: "اختر", how1d: "استكشف الدول واختر البرنامج المناسب لأهدافك.",
    how2t: "قدّم", how2d: "أرسل طلبك وارفع مستنداتك بأمان.",
    how3t: "ادفع بالتقسيط", how3d: "ابدأ بدفعة أولى، ثم ادفع الباقي على أقساط.",
    how4t: "انتقل", how4d: "نرشدك في التصاريح والتأشيرة والسفر حتى وصولك.",
    whyEyebrow: "لماذا كينتيكس", whyTitle: "لسنا مكتب تأشيرات. نحن شريك تنقّل.",
    whySub: "بنينا كينتيكس لمن يريد فهم كل خطوة في رحلته — وكل يورو فيها.",
    why1t: "شفافية كاملة في الأسعار", why1d: "كل التكاليف مذكورة مسبقاً. بلا رسوم مفاجئة.",
    why2t: "أقساط مرنة", why2d: "وزّع الدفعات على ستة أشهر كحد أقصى.",
    why3t: "مستندات آمنة", why3d: "تخزين مشفّر، لا يراه إلا فريق ملفك.",
    why4t: "مرافقة شاملة", why4d: "مستشار واحد من أول مكالمة حتى أول يوم عمل.",
    pricingEyebrow: "تكاليف شفافة وخطط دفع", pricingTitle: "اعرف السعر الكامل قبل أن تبدأ.",
    pricingSub: "اختر برنامجاً وشاهد بالضبط ما تدفعه اليوم وكل شهر بعده.",
    programLabel: "البرنامج", totalCost: "التكلفة الإجمالية", installmentsLabel: "الأقساط",
    dueToday: "يُدفع اليوم", thenMonthly: "شهرياً", applyProgram: "قدّم على هذا البرنامج",
    promoTitle: "لديك رمز ترويجي؟", promoText: "يمكن لأصدقاء وشركاء كينتيكس مشاركة رموز تمنحك خصماً على أي برنامج.",
    partnerTitle: "حوّل علاقاتك إلى فرص.",
    partnerText: "كن شريك مبيعات، واكسب عمولة عن كل عميل، وارتقِ من البرونزي إلى الذهبي.",
    becomePartner: "كن شريكاً",
    faqEyebrow: "الأسئلة الشائعة", faqTitle: "أسئلة بإجابات صادقة.",
    ctaEyebrow: "ابدأ اليوم", ctaTitle: "جاهز لخطوتك القادمة؟",
    ctaSub: "أنشئ حساباً مجانياً، اختر برنامجاً، وأرسل طلبك في دقائق.",
    footerTag: "تنقّل مهني دولي. تكاليف شفافة وخطط دفع مرنة ومرافقة من التقديم حتى الوصول.",
    explore: "استكشف", legal: "قانوني", terms: "الشروط", privacy: "الخصوصية", refund: "سياسة الاسترداد",
    disclaimer: "لا تضمن كينتيكس التوظيف أو الموافقة على التأشيرة؛ القرار النهائي لأصحاب العمل والسلطات.",
    allCountries: "كل الدول", availablePrograms: "البرامج المتاحة", requiredDocs: "المستندات المطلوبة",
    eligibility: "شروط الأهلية", timeline: "الجدول الزمني", deposit: "الدفعة الأولى", upToMonthly: "شهرياً", apply: "قدّم",
    welcome: "مرحباً بك في كينتيكس", authSub: "سجّل الدخول أو أنشئ حساباً للتقديم ومتابعة رحلتك.",
    email: "البريد الإلكتروني", password: "كلمة المرور", fullName: "الاسم الكامل",
    signInBtn: "تسجيل الدخول", createAccount: "إنشاء حساب", needAccount: "جديد هنا؟ أنشئ حساباً",
    haveAccount: "لديك حساب؟ سجّل الدخول", checkEmail: "تحقق من بريدك لتأكيد حسابك ثم سجّل الدخول.",
    myApplications: "طلباتي", myProfile: "ملفي الشخصي", noApplications: "لا توجد طلبات بعد.",
    partnerPortal: "بوابة الشريك", adminDashboard: "لوحة الإدارة",
    promoCode: "الرمز الترويجي", level: "المستوى", commissionRate: "نسبة العمولة",
    totalEarned: "إجمالي الأرباح", pending: "قيد الانتظار", clients: "العملاء",
    payoutMethod: "طريقة السحب", payoutDetails: "تفاصيل السحب", save: "حفظ", saved: "تم الحفظ",
    phone: "الهاتف", overview: "نظرة عامة", applications: "الطلبات", programsAdmin: "البرامج", partnersAdmin: "الشركاء",
    status: "الحالة", date: "التاريخ", program: "البرنامج", price: "السعر", country: "الدولة",
    notPrepared: "هذه الوجهة قيد التحضير", backCountries: "العودة إلى كل الدول", upTo: "حتى", monthly: "شهرياً",
    trackStudent: "طلاب", trackGraduate: "خريجين", chooseTrack: "اختر مسارك", paymentPlan: "طريقة الدفع",
    payFull: "دفع كامل", payFullSub: "دفعة واحدة", payInst: "تقسيط", payInstSub: "مقدم + حتى 6 شهور",
    dueNow: "المطلوب الآن", remaining: "المتبقي", months: "شهور", stepProgram: "البرنامج", stepDetails: "بياناتك", stepDocs: "المستندات",
    passport: "رقم جواز السفر", birthDate: "تاريخ الميلاد", education: "الجامعة / المؤهل", promoOptional: "كود الخصم (اختياري)",
    next: "متابعة", back: "رجوع", submitApp: "إرسال الطلب", submitting: "جارٍ الإرسال…", upload: "رفع", replace: "استبدال",
    docsHint: "PDF أو JPG أو PNG — حتى 10 ميجا للملف. ممكن تكمّلها بعدين من لوحة التحكم.",
    appDone: "تم إرسال طلبك", appDoneSub: "ادفع المقدم لبدء الإجراءات. فريقنا هيتواصل معاك بتفاصيل الدفع.",
    goDashboard: "اذهب للوحة التحكم", depositAwait: "في انتظار دفع المقدم", depositAwaitSub: "ملفك يبدأ يتحرك أول ما نستلم الدفعة الأولى.",
    progress: "مراحل الطلب", documentsWord: "المستندات", docPending: "قيد المراجعة", docApproved: "مقبول", docRejected: "يحتاج إعادة رفع",
    stage0: "المقدم", stage1: "مراجعة المستندات", stage2: "التسكين", stage3: "استخراج التصريح", stage4: "التأشيرة", stage5: "جاهز للسفر",
    depositPaid: "تم دفع المقدم", plan: "الخطة", track: "المسار", view: "عرض", required: "مطلوب",
  },
} as const;

export type TKey = keyof typeof dict.en;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string }>({
  lang: "en", setLang: () => {}, t: (k) => dict.en[k],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (localStorage.getItem("kinetix-lang") as Lang) || "en";
    setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("kinetix-lang", l); };
  return <LangContext.Provider value={{ lang, setLang, t: (k) => dict[lang][k] }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
