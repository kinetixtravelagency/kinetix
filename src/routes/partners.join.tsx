import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Gift, Wallet, AlertCircle, Eye, EyeOff, CheckCircle2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Nav, Footer } from "@/components/site/SiteChrome";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/partners/join")({
  head: () => ({
    meta: [
      { title: "Become a Sales Partner — Kinetix" },
      { name: "description", content: "Join the Kinetix sales partner program: your own promo code, levels, client discounts and commissions." },
      { property: "og:title", content: "Become a Sales Partner — Kinetix" },
      { property: "og:description", content: "Your own promo code, levels, client discounts and commissions." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JoinPartner,
});

const COUNTRY_CODES = [
  { code: "+20", flag: "🇪🇬", nameAr: "مصر (+20)", nameEn: "Egypt (+20)" },
  { code: "+966", flag: "🇸🇦", nameAr: "السعودية (+966)", nameEn: "Saudi Arabia (+966)" },
  { code: "+971", flag: "🇦🇪", nameAr: "الإمارات (+971)", nameEn: "UAE (+971)" },
  { code: "+965", flag: "🇰🇼", nameAr: "الكويت (+965)", nameEn: "Kuwait (+965)" },
  { code: "+974", flag: "🇶🇦", nameAr: "قطر (+974)", nameEn: "Qatar (+974)" },
  { code: "+968", flag: "🇴🇲", nameAr: "عُمان (+968)", nameEn: "Oman (+968)" },
  { code: "+973", flag: "🇧🇭", nameAr: "البحرين (+973)", nameEn: "Bahrain (+973)" },
  { code: "+962", flag: "🇯🇴", nameAr: "الأردن (+962)", nameEn: "Jordan (+962)" },
  { code: "+218", flag: "🇱🇾", nameAr: "ليبيا (+218)", nameEn: "Libya (+218)" },
  { code: "+249", flag: "🇸🇩", nameAr: "السودان (+249)", nameEn: "Sudan (+249)" },
  { code: "+44", flag: "🇬🇧", nameAr: "المملكة المتحدة (+44)", nameEn: "UK (+44)" },
  { code: "+1", flag: "🇺🇸", nameAr: "أمريكا / كندا (+1)", nameEn: "USA / Canada (+1)" },
  { code: "+49", flag: "🇩🇪", nameAr: "ألمانيا (+49)", nameEn: "Germany (+49)" },
  { code: "+39", flag: "🇮🇹", nameAr: "إيطاليا (+39)", nameEn: "Italy (+39)" },
];

const EGYPTIAN_GOVERNORATES_AR = [
  "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الغربية", "المنوفية",
  "الشرقية", "الدقهلية", "كفر الشيخ", "دمياط", "بورسعيد", "الإسماعيلية",
  "السويس", "البحر الأحمر", "بني سويف", "الفيوم", "المنيا", "أسيوط",
  "سوهاج", "قنا", "الأقصر", "أسوان", "الوادي الجديد", "مطروح",
  "شمال سيناء", "جنوب سيناء",
];

const EGYPTIAN_GOVERNORATES_EN = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Gharbia", "Menofia",
  "Sharqia", "Dakahlia", "Kafr el-Sheikh", "Damietta", "Port Said", "Ismailia",
  "Suez", "Red Sea", "Beni Suef", "Fayoum", "Minya", "Asyut",
  "Sohag", "Qena", "Luxor", "Aswan", "New Valley", "Matruh",
  "North Sinai", "South Sinai",
];

const UNIVERSITIES = [
  { val: "جامعة القاهرة", labelAr: "جامعة القاهرة", labelEn: "Cairo University" },
  { val: "جامعة عين شمس", labelAr: "جامعة عين شمس", labelEn: "Ain Shams University" },
  { val: "جامعة الإسكندرية", labelAr: "جامعة الإسكندرية", labelEn: "Alexandria University" },
  { val: "جامعة حلوان", labelAr: "جامعة حلوان", labelEn: "Helwan University" },
  { val: "جامعة المنصورة", labelAr: "جامعة المنصورة", labelEn: "Mansoura University" },
  { val: "جامعة أسيوط", labelAr: "جامعة أسيوط", labelEn: "Assiut University" },
  { val: "جامعة الأزهر", labelAr: "جامعة الأزهر", labelEn: "Al-Azhar University" },
  { val: "جامعة الزقازيق", labelAr: "جامعة الزقازيق", labelEn: "Zagazig University" },
  { val: "جامعة طنطا", labelAr: "جامعة طنطا", labelEn: "Tanta University" },
  { val: "جامعة بنها", labelAr: "جامعة بنها", labelEn: "Benha University" },
  { val: "جامعة المنوفية", labelAr: "جامعة المنوفية", labelEn: "Menofia University" },
  { val: "جامعة قناة السويس", labelAr: "جامعة قناة السويس", labelEn: "Suez Canal University" },
  { val: "جامعة جنوب الوادي", labelAr: "جامعة جنوب الوادي", labelEn: "South Valley University" },
  { val: "جامعة بني سويف", labelAr: "جامعة بني سويف", labelEn: "Beni Suef University" },
  { val: "جامعة الفيوم", labelAr: "جامعة الفيوم", labelEn: "Fayoum University" },
  { val: "جامعة كفر الشيخ", labelAr: "جامعة كفر الشيخ", labelEn: "Kafr El Sheikh University" },
  { val: "جامعة سوهاج", labelAr: "جامعة سوهاج", labelEn: "Sohag University" },
  { val: "جامعة بورسعيد", labelAr: "جامعة بورسعيد", labelEn: "Port Said University" },
  { val: "جامعة دمنهور", labelAr: "جامعة دمنهور", labelEn: "Damanhour University" },
  { val: "جامعة أسوان", labelAr: "جامعة أسوان", labelEn: "Aswan University" },
  { val: "جامعة السويس", labelAr: "جامعة السويس", labelEn: "Suez University" },
  { val: "جامعة دمياط", labelAr: "جامعة دمياط", labelEn: "Damietta University" },
  { val: "جامعة مدينة السادات", labelAr: "جامعة مدينة السادات", labelEn: "University of Sadat City" },
  { val: "جامعة العريش", labelAr: "جامعة العريش", labelEn: "Arish University" },
  { val: "جامعة الوادي الجديد", labelAr: "جامعة الوادي الجديد", labelEn: "New Valley University" },
  { val: "جامعة مطروح", labelAr: "جامعة مطروح", labelEn: "Matrouh University" },
  { val: "الجامعة الأمريكية بالقاهرة (AUC)", labelAr: "الجامعة الأمريكية بالقاهرة (AUC)", labelEn: "American University in Cairo (AUC)" },
  { val: "الجامعة الألمانية بالقاهرة (GUC)", labelAr: "الجامعة الألمانية بالقاهرة (GUC)", labelEn: "German University in Cairo (GUC)" },
  { val: "الجامعة البريطانية في مصر (BUE)", labelAr: "الجامعة البريطانية في مصر (BUE)", labelEn: "British University in Egypt (BUE)" },
  { val: "جامعة مصر للعلوم والتكنولوجيا (MUST)", labelAr: "جامعة مصر للعلوم والتكنولوجيا (MUST)", labelEn: "Misr University for Science and Technology (MUST)" },
  { val: "جامعة 6 أكتوبر (O6U)", labelAr: "جامعة 6 أكتوبر (O6U)", labelEn: "October 6 University (O6U)" },
  { val: "جامعة المستقبل (FUE)", labelAr: "جامعة المستقبل (FUE)", labelEn: "Future University in Egypt (FUE)" },
  { val: "جامعة الأهرام الكندية (ACU)", labelAr: "جامعة الأهرام الكندية (ACU)", labelEn: "Ahram Canadian University (ACU)" },
  { val: "جامعة مصر الدولية (MIU)", labelAr: "جامعة مصر الدولية (MIU)", labelEn: "Misr International University (MIU)" },
  { val: "جامعة فاروس بالإسكندرية (PUA)", labelAr: "جامعة فاروس بالإسكندرية (PUA)", labelEn: "Pharos University in Alexandria (PUA)" },
  { val: "جامعة بدر بالقاهرة (BUC)", labelAr: "جامعة بدر بالقاهرة (BUC)", labelEn: "Badr University in Cairo (BUC)" },
  { val: "جامعة النيل الأهلية", labelAr: "جامعة النيل الأهلية", labelEn: "Nile University" },
  { val: "جامعة زويل للعلوم والتكنولوجيا", labelAr: "جامعة زويل للعلوم والتكنولوجيا", labelEn: "Zewail City of Science and Technology" },
  { val: "جامعة الجلالة", labelAr: "جامعة الجلالة الأهلية", labelEn: "Galala University" },
  { val: "جامعة العلمين الدولية", labelAr: "جامعة العلمين الدولية", labelEn: "Alamein International University" },
  { val: "جامعة الملك سلمان الدولية", labelAr: "جامعة الملك سلمان الدولية", labelEn: "King Salman International University" },
  { val: "جامعة المنصورة الجديدة", labelAr: "جامعة المنصورة الجديدة", labelEn: "New Mansoura University" },
  { val: "الأكاديمية العربية للعلوم والتكنولوجيا (AASTMT)", labelAr: "الأكاديمية العربية للعلوم والتكنولوجيا (AASTMT)", labelEn: "Arab Academy for Science and Technology (AASTMT)" },
  { val: "الجامعة المصرية اليابانية (E-JUST)", labelAr: "الجامعة المصرية اليابانية (E-JUST)", labelEn: "Egypt-Japan University (E-JUST)" },
  { val: "جامعة الدلتا للعلوم والتكنولوجيا", labelAr: "جامعة الدلتا للعلوم والتكنولوجيا", labelEn: "Delta University" },
  { val: "جامعة النهضة", labelAr: "جامعة النهضة (NUB)", labelEn: "Nahda University (NUB)" },
  { val: "جامعة سيناء", labelAr: "جامعة سيناء", labelEn: "Sinai University" },
  { val: "جامعة هليوبوليس", labelAr: "جامعة هليوبوليس", labelEn: "Heliopolis University" },
  { val: "جامعة الجيزة الجديدة (NGU)", labelAr: "جامعة الجيزة الجديدة (NGU)", labelEn: "New Giza University (NGU)" },
  { val: "other", labelAr: "أخرى (اكتب اسم الجامعة بالأسفل) ...", labelEn: "Other (specify below) ..." },
];

const FACULTIES = [
  { val: "كلية التجارة وإدارة الأعمال", labelAr: "كلية التجارة وإدارة الأعمال / نظم المعلومات", labelEn: "Faculty of Commerce & Business Administration" },
  { val: "كلية الهندسة", labelAr: "كلية الهندسة", labelEn: "Faculty of Engineering" },
  { val: "كلية الحاسبات والذكاء الاصطناعي", labelAr: "كلية الحاسبات والمعلومات والذكاء الاصطناعي", labelEn: "Faculty of Computers, AI & Informatics" },
  { val: "كلية الألسن واللغات والترجمة", labelAr: "كلية الألسن واللغات والترجمة", labelEn: "Faculty of Alsun, Languages & Translation" },
  { val: "كلية الإعلام والاتصال", labelAr: "كلية الإعلام والاتصال", labelEn: "Faculty of Mass Communication & Media" },
  { val: "كلية الحقوق والشريعة والقانون", labelAr: "كلية الحقوق والشريعة والقانون", labelEn: "Faculty of Law & Sharia" },
  { val: "كلية الآداب والعلوم الإنسانية", labelAr: "كلية الآداب والعلوم الإنسانية", labelEn: "Faculty of Arts & Humanities" },
  { val: "كلية الصيدلة", labelAr: "كلية الصيدلة", labelEn: "Faculty of Pharmacy" },
  { val: "كلية الطب البشري", labelAr: "كلية الطب البشري", labelEn: "Faculty of Medicine" },
  { val: "كلية طب جراحة الفم والأسنان", labelAr: "كلية طب الفم والأسنان", labelEn: "Faculty of Dentistry" },
  { val: "كلية العلاج الطبيعي", labelAr: "كلية العلاج الطبيعي", labelEn: "Faculty of Physical Therapy" },
  { val: "كلية التمريض والعلوم الصحية", labelAr: "كلية التمريض والعلوم الصحية", labelEn: "Faculty of Nursing & Health Sciences" },
  { val: "كلية الاقتصاد والعلوم السياسية", labelAr: "كلية الاقتصاد والعلوم السياسية", labelEn: "Faculty of Economics & Political Science" },
  { val: "كلية السياحة والفنادق", labelAr: "كلية السياحة والفنادق", labelEn: "Faculty of Tourism & Hotels" },
  { val: "كلية العلوم", labelAr: "كلية العلوم", labelEn: "Faculty of Science" },
  { val: "كلية التربية", labelAr: "كلية التربية", labelEn: "Faculty of Education" },
  { val: "كلية الفنون التطبيقية", labelAr: "كلية الفنون التطبيقية", labelEn: "Faculty of Applied Arts" },
  { val: "كلية الفنون الجميلة", labelAr: "كلية الفنون الجميلة", labelEn: "Faculty of Fine Arts" },
  { val: "كلية الزراعة", labelAr: "كلية الزراعة", labelEn: "Faculty of Agriculture" },
  { val: "كلية التربية الرياضية", labelAr: "كلية التربية الرياضية", labelEn: "Faculty of Physical Education" },
  { val: "كلية التربية النوعية", labelAr: "كلية التربية النوعية", labelEn: "Faculty of Specific Education" },
  { val: "كلية الخدمة الاجتماعية", labelAr: "كلية الخدمة الاجتماعية", labelEn: "Faculty of Social Work" },
  { val: "كلية الآثار", labelAr: "كلية الآثار", labelEn: "Faculty of Archaeology" },
  { val: "معهد عالي خاص / تكنولوجي", labelAr: "معهد عالي خاص / معهد تكنولوجي", labelEn: "Higher Institute / Technical Institute" },
  { val: "other", labelAr: "أخرى (اكتب اسم الكلية أو المعهد) ...", labelEn: "Other (specify below) ..." },
];

const SALES_EXPERIENCES = [
  { val: "none", labelAr: "لا توجد خبرة سابقة (مبتدئ شغوف بالتعلم)", labelEn: "No prior experience (passionate beginner)" },
  { val: "less_than_1", labelAr: "أقل من سنة في المبيعات أو خدمة العملاء", labelEn: "Less than 1 year in sales / customer support" },
  { val: "1_to_3", labelAr: "من سنة إلى 3 سنوات في المبيعات", labelEn: "1 to 3 years in sales" },
  { val: "3_to_5", labelAr: "من 3 إلى 5 سنوات في المبيعات", labelEn: "3 to 5 years in sales" },
  { val: "more_than_5", labelAr: "أكثر من 5 سنوات في المبيعات", labelEn: "More than 5 years in sales" },
  { val: "team_leader", labelAr: "مشرف مبيعات أو قائد فريق (Sales Team Leader)", labelEn: "Sales Supervisor / Team Leader" },
];

const ACADEMIC_STATUSES = [
  { val: "student", labelAr: "طالب جامعي (مقيد حالياً)", labelEn: "University Student (currently enrolled)" },
  { val: "graduate", labelAr: "خريج جامعي (حاصل على مؤهل عالي)", labelEn: "University Graduate" },
  { val: "postgraduate", labelAr: "دراسات عليا (ماجستير / دكتوراه)", labelEn: "Postgraduate (Master / PhD)" },
  { val: "highschool", labelAr: "خريج ثانوية عامة / دبلوم فني", labelEn: "High School Graduate / Technical Diploma" },
  { val: "other", labelAr: "غير ذلك", labelEn: "Other" },
];

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors ${
    hasError
      ? "border-red-500 bg-red-500/5 focus:border-red-600 focus:ring-1 focus:ring-red-500"
      : "border-input focus:border-beige focus:ring-1 focus:ring-beige/40"
  }`;

function JoinPartner() {
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const ar = lang === "ar";
  const navigate = useNavigate();

  const [f, setF] = useState({
    full_name: "",
    country_code: "+20",
    phone: "",
    gender: "",
    birth_date: "",
    governorate: "",
    academic_status: "",
    university_select: "",
    university_custom: "",
    faculty_select: "",
    faculty_custom: "",
    experience: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"error" | "success">("error");

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = (): { isValid: boolean; errors: Record<string, string>; firstError: string | null } => {
    const errs: Record<string, string> = {};

    // 1. Full name (at least 2 words, letters, >= 4 chars)
    const nameTrimmed = f.full_name.trim();
    if (!nameTrimmed) {
      errs.full_name = tr("Full name is required.", "الاسم بالكامل مطلوب (إجباري).");
    } else if (nameTrimmed.split(/\s+/).filter(Boolean).length < 2) {
      errs.full_name = tr("Please enter at least first and last name.", "يرجى كتابة الاسم ثنائي على الأقل (الأول والأخير).");
    } else if (nameTrimmed.length < 4) {
      errs.full_name = tr("Full name is too short.", "الاسم قصير جداً.");
    }

    // 2. Phone with Country Code validation
    const cleanPhone = f.phone.replace(/[\s\-]/g, "");
    if (!cleanPhone) {
      errs.phone = tr("Phone / WhatsApp number is required.", "رقم الموبايل / واتساب مطلوب (إجباري).");
    } else if (f.country_code === "+20") {
      // Egyptian mobile: 10 or 11 digits starting with 010, 011, 012, 015
      const egRegex = /^(01[0125]\d{8}|1[0125]\d{8})$/;
      const isRepeated = /^(\d)\1+$/.test(cleanPhone);
      if (!egRegex.test(cleanPhone) || isRepeated || cleanPhone === "01234567890") {
        errs.phone = tr(
          "Invalid Egyptian mobile number. Must be 11 digits starting with 010, 011, 012, or 015 (e.g. 01012345678).",
          "رقم الموبايل المصري غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015 (مثال: 01012345678)."
        );
      }
    } else {
      // Other country: digits only, 7 to 15 digits
      if (!/^\d{7,15}$/.test(cleanPhone) || /^(\d)\1+$/.test(cleanPhone)) {
        errs.phone = tr("Invalid phone number digits.", "رقم الهاتف غير صحيح. الرجاء إدخال أرقام صحيحة.");
      }
    }

    // 3. Gender
    if (!f.gender) {
      errs.gender = tr("Please select your gender.", "تحديد الجنس مطلوب (إجباري).");
    }

    // 4. Date of Birth (Age between 18 and 55)
    if (!f.birth_date) {
      errs.birth_date = tr("Date of birth is required.", "تاريخ الميلاد مطلوب (إجباري).");
    } else {
      const birth = new Date(f.birth_date).getTime();
      const age = (Date.now() - birth) / (365.25 * 24 * 3600 * 1000);
      if (isNaN(age) || age < 18 || age > 55) {
        errs.birth_date = tr("Age must be between 18 and 55 years.", "العمر يجب أن يكون بين 18 و55 سنة.");
      }
    }

    // 5. Governorate
    if (!f.governorate) {
      errs.governorate = tr("Please select your governorate.", "اختيار المحافظة مطلوب (إجباري).");
    }

    // 6. Academic Status
    if (!f.academic_status) {
      errs.academic_status = tr("Please select your academic status.", "تحديد الحالة الدراسية مطلوب (إجباري).");
    }

    // 7. University
    if (!f.university_select) {
      errs.university = tr("Please select your university.", "اختيار الجامعة مطلوب (إجباري).");
    } else if (f.university_select === "other" && !f.university_custom.trim()) {
      errs.university = tr("Please type your university name.", "يرجى كتابة اسم الجامعة في الخانة المخصصة.");
    }

    // 8. Faculty
    if (!f.faculty_select) {
      errs.faculty = tr("Please select your faculty / college.", "اختيار الكلية أو المعهد مطلوب (إجباري).");
    } else if (f.faculty_select === "other" && !f.faculty_custom.trim()) {
      errs.faculty = tr("Please type your faculty name.", "يرجى كتابة اسم الكلية أو المعهد في الخانة المخصصة.");
    }

    // 9. Sales Experience (Dropdown)
    if (!f.experience) {
      errs.experience = tr("Please select your sales experience.", "تحديد الخبرة في المبيعات مطلوب (إجباري).");
    }

    // 10. Email (strictly ends with @gmail.com)
    const em = f.email.trim().toLowerCase();
    if (!em) {
      errs.email = tr("Email address is required.", "البريد الإلكتروني مطلوب (إجباري).");
    } else if (!em.endsWith("@gmail.com")) {
      errs.email = tr(
        "Email must end with @gmail.com (e.g. name@gmail.com).",
        "البريد الإلكتروني يجب أن ينتهي بـ @gmail.com حصراً (مثال: name@gmail.com)."
      );
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(em) || em.split("@")[0].length < 3) {
      errs.email = tr("Please enter a valid Gmail address.", "يرجى كتابة عنوان بريد Gmail صحيح.");
    }

    // 11. Password (min 8 chars)
    if (!f.password) {
      errs.password = tr("Password is required.", "كلمة السر مطلوبة (إجباري).");
    } else if (f.password.length < 8) {
      errs.password = tr("Password must be at least 8 characters.", "كلمة السر يجب أن تكون 8 أحرف أو أرقام على الأقل.");
    }

    const firstKey = Object.keys(errs)[0];
    return {
      isValid: Object.keys(errs).length === 0,
      errors: errs,
      firstError: firstKey ? errs[firstKey] : null,
    };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors, firstError } = validate();
    setFieldErrors(errors);

    if (!isValid) {
      setMsg(firstError || tr("Please fix the highlighted errors.", "يرجى مراجعة الحقول المطلوبة والمميزة بالأحمر."));
      setMsgType("error");
      // Scroll to the first error smoothly
      const firstErrEl = document.querySelector("[data-has-error='true']");
      if (firstErrEl) {
        firstErrEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setBusy(true);
    setMsg(null);

    const finalUniversity = f.university_select === "other"
      ? f.university_custom.trim()
      : f.university_select;

    const finalFaculty = f.faculty_select === "other"
      ? f.faculty_custom.trim()
      : f.faculty_select;

    const cleanPhone = f.phone.replace(/[\s\-]/g, "");
    const formattedPhone = f.country_code === "+20"
      ? (cleanPhone.startsWith("0") ? `+20${cleanPhone.slice(1)}` : `+20${cleanPhone}`)
      : `${f.country_code}${cleanPhone}`;

    const expOption = SALES_EXPERIENCES.find((s) => s.val === f.experience);
    const expText = ar ? expOption?.labelAr ?? f.experience : expOption?.labelEn ?? f.experience;

    const { data, error } = await supabase.auth.signUp({
      email: f.email.trim().toLowerCase(),
      password: f.password,
      options: {
        emailRedirectTo: `${window.location.origin}/partner`,
        data: {
          intent: "partner",
          full_name: f.full_name.trim().slice(0, 120),
          phone: formattedPhone.slice(0, 40),
          gender: f.gender,
          birth_date: f.birth_date,
          governorate: f.governorate.slice(0, 80),
          university: finalUniversity.slice(0, 120),
          faculty: finalFaculty.slice(0, 120),
          academic_status: f.academic_status,
          experience: expText.slice(0, 500),
        },
      },
    });

    setBusy(false);

    if (error) {
      setMsg(error.message);
      setMsgType("error");
      return;
    }

    if (data.session) {
      navigate({ to: "/partner" });
    } else {
      setMsg(
        tr(
          "Check your email to confirm your account, then sign in — your partner portal will be ready.",
          "تم إرسال رابط التأكيد إلى بريدك الإلكتروني! افتح الإيميل وأكد الحساب، ثم سجل دخول للوصول لبوابة الشريك."
        )
      );
      setMsgType("success");
    }
  };

  const govOptions = ar ? EGYPTIAN_GOVERNORATES_AR : EGYPTIAN_GOVERNORATES_EN;

  return (
    <div className="flex min-h-screen flex-col bg-navy text-ivory">
      <Nav solid />
      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow text-beige">{tr("Sales Partner Program", "برنامج شركاء المبيعات")}</p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
              {tr("Bring clients. Level up. Earn more.", "جيب عملاء. اطلع مستوى. اكسب أكتر.")}
            </h1>
            <ul className="mt-8 space-y-4 text-ivory/80">
              <li className="flex gap-3">
                <Gift className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />
                {tr("Your own promo code and referral link", "كود خصم ورابط إحالة خاص بيك")}
              </li>
              <li className="flex gap-3">
                <Wallet className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />
                {tr(
                  "Guaranteed fixed commission starting at 9,350 EGP per client — increasing with each level",
                  "عمولة ثابتة مضمونة تبدأ من 9,350 جنيه لكل عميل ناجح — وتزيد مع كل مستوى"
                )}
              </li>
              <li className="flex gap-3">
                <Award className="h-5 w-5 shrink-0 text-beige" strokeWidth={1.5} />
                {tr(
                  "Levels from Starter to Platinum — higher level, higher commission and bigger client discounts",
                  "مستويات من مبتدئ لبلاتيني — كل ما تعلى، عمولتك تزيد وخصم عملائك يكبر"
                )}
              </li>
            </ul>

            {/* Levels Quick Breakdown */}
            <div className="mt-8 rounded-2xl border border-beige/30 bg-navy-soft/80 p-5">
              <p className="font-display font-semibold text-sm text-beige mb-3">
                {tr("Level & Fixed Commission Progression", "تدرج المستويات والعمولات الثابتة")}:
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded-xl bg-navy/60 p-2.5 border border-beige/40">
                  <p className="font-bold text-ivory">Starter / مبتدئ</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">9,350 EGP</p>
                  <p className="text-[10px] text-ivory/60">0+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Bronze / برونزي</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">10,250 EGP</p>
                  <p className="text-[10px] text-ivory/60">5+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Silver / فضي</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">11,250 EGP</p>
                  <p className="text-[10px] text-ivory/60">10+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Gold / ذهبي</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">12,500 EGP</p>
                  <p className="text-[10px] text-ivory/60">20+ clients</p>
                </div>
                <div className="rounded-xl bg-navy/60 p-2.5 border border-ivory/10">
                  <p className="font-bold text-ivory">Platinum / بلاتيني</p>
                  <p className="text-beige font-display text-sm font-bold mt-1">14,000 EGP</p>
                  <p className="text-[10px] text-ivory/60">40+ clients</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 rounded-3xl bg-ivory p-6 text-navy shadow-xl md:p-8 max-h-[92vh] overflow-y-auto" noValidate>
            <div className="sticky top-0 bg-ivory/95 backdrop-blur-sm pb-2 pt-1 border-b border-navy/10 z-10 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">{tr("Partner Registration", "تسجيل شريك جديد")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{tr("All fields marked with (*) are mandatory", "جميع الحقول المميزة بعلامة (*) إلزامية")}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-beige/20 text-navy border border-beige/40">
                {tr("Active Recruitment", "باب التسجيل مفتوح")}
              </span>
            </div>

            {/* Error / Success Banner */}
            {msg && (
              <div
                className={`flex items-start gap-2.5 rounded-2xl p-4 text-sm font-medium ${
                  msgType === "error"
                    ? "bg-red-50 text-red-900 border border-red-200"
                    : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                }`}
              >
                {msgType === "error" ? (
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{msgType === "error" ? tr("Attention required", "تنبيه في البيانات") : tr("Success", "تم بنجاح")}</p>
                  <p className="text-xs mt-0.5 leading-relaxed">{msg}</p>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div data-has-error={!!fieldErrors.full_name}>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                {tr("Full Name", "الاسم بالكامل")} <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                className={inputClass(!!fieldErrors.full_name)}
                required
                maxLength={120}
                placeholder={tr("e.g. Ahmed Mohamed Ali", "مثال: أحمد محمد علي")}
                value={f.full_name}
                onChange={(e) => {
                  setF({ ...f, full_name: e.target.value });
                  clearFieldError("full_name");
                }}
              />
              {fieldErrors.full_name && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.full_name}
                </p>
              )}
            </div>

            {/* Phone with Country Code */}
            <div data-has-error={!!fieldErrors.phone}>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                {tr("Mobile / WhatsApp Number", "رقم الموبايل / واتساب")} <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  className="rounded-xl border border-input bg-background px-3 py-3 text-sm font-medium outline-none focus:border-beige shrink-0 max-w-[145px]"
                  value={f.country_code}
                  onChange={(e) => {
                    setF({ ...f, country_code: e.target.value });
                    clearFieldError("phone");
                  }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} {ar ? `(${c.nameAr.split(" ")[0]})` : ""}
                    </option>
                  ))}
                </select>
                <div className="flex-1">
                  <input
                    className={inputClass(!!fieldErrors.phone)}
                    required
                    type="tel"
                    maxLength={20}
                    placeholder={f.country_code === "+20" ? "01012345678" : "123456789"}
                    value={f.phone}
                    onChange={(e) => {
                      setF({ ...f, phone: e.target.value });
                      clearFieldError("phone");
                    }}
                  />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {f.country_code === "+20"
                  ? tr("Egyptian number must be 11 digits starting with 010, 011, 012, or 015.", "يجب كتابة 11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015.")
                  : tr("Enter mobile number with digits only.", "أدخل رقم الهاتف بأرقام صحيحة.")}
              </p>
              {fieldErrors.phone && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Gender & Birth Date in 2 columns */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Gender */}
              <div data-has-error={!!fieldErrors.gender}>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  {tr("Gender", "الجنس")} <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  className={inputClass(!!fieldErrors.gender)}
                  required
                  value={f.gender}
                  onChange={(e) => {
                    setF({ ...f, gender: e.target.value });
                    clearFieldError("gender");
                  }}
                >
                  <option value="">{tr("-- Select Gender --", "-- اختر الجنس --")}</option>
                  <option value="male">{tr("Male", "ذكر")}</option>
                  <option value="female">{tr("Female", "أنثى")}</option>
                </select>
                {fieldErrors.gender && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fieldErrors.gender}
                  </p>
                )}
              </div>

              {/* Birth Date */}
              <div data-has-error={!!fieldErrors.birth_date}>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  {tr("Date of Birth", "تاريخ الميلاد")} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  className={inputClass(!!fieldErrors.birth_date)}
                  type="date"
                  required
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                  min={new Date(Date.now() - 55 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                  value={f.birth_date}
                  onChange={(e) => {
                    setF({ ...f, birth_date: e.target.value });
                    clearFieldError("birth_date");
                  }}
                />
                {fieldErrors.birth_date && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fieldErrors.birth_date}
                  </p>
                )}
              </div>
            </div>

            {/* Governorate & Academic Status in 2 columns */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Governorate */}
              <div data-has-error={!!fieldErrors.governorate}>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  {tr("Governorate", "المحافظة")} <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  className={inputClass(!!fieldErrors.governorate)}
                  required
                  value={f.governorate}
                  onChange={(e) => {
                    setF({ ...f, governorate: e.target.value });
                    clearFieldError("governorate");
                  }}
                >
                  <option value="">{tr("-- Select Governorate --", "-- اختر المحافظة --")}</option>
                  {govOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {fieldErrors.governorate && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fieldErrors.governorate}
                  </p>
                )}
              </div>

              {/* Academic Status */}
              <div data-has-error={!!fieldErrors.academic_status}>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  {tr("Academic Status", "الحالة الدراسية")} <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  className={inputClass(!!fieldErrors.academic_status)}
                  required
                  value={f.academic_status}
                  onChange={(e) => {
                    setF({ ...f, academic_status: e.target.value });
                    clearFieldError("academic_status");
                  }}
                >
                  <option value="">{tr("-- Select Status --", "-- اختر الحالة --")}</option>
                  {ACADEMIC_STATUSES.map((s) => (
                    <option key={s.val} value={s.val}>
                      {ar ? s.labelAr : s.labelEn}
                    </option>
                  ))}
                </select>
                {fieldErrors.academic_status && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fieldErrors.academic_status}
                  </p>
                )}
              </div>
            </div>

            {/* University Selection Dropdown + Custom Field */}
            <div data-has-error={!!fieldErrors.university} className="space-y-2">
              <label className="block text-xs font-semibold text-navy">
                {tr("University", "الجامعة")} <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                className={inputClass(!!fieldErrors.university)}
                required
                value={f.university_select}
                onChange={(e) => {
                  setF({ ...f, university_select: e.target.value });
                  clearFieldError("university");
                }}
              >
                <option value="">{tr("-- Select University --", "-- اختر الجامعة من القائمة --")}</option>
                {UNIVERSITIES.map((u) => (
                  <option key={u.val} value={u.val}>
                    {ar ? u.labelAr : u.labelEn}
                  </option>
                ))}
              </select>

              {f.university_select === "other" && (
                <div className="pt-1">
                  <input
                    className={inputClass(!!fieldErrors.university && !f.university_custom.trim())}
                    required
                    maxLength={120}
                    placeholder={tr("Type your university name here...", "اكتب اسم جامعتك هنا...")}
                    value={f.university_custom}
                    onChange={(e) => {
                      setF({ ...f, university_custom: e.target.value });
                      clearFieldError("university");
                    }}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {tr("Enter the full official name of your university.", "يرجى كتابة الاسم الرسمي للجامعة.")}
                  </p>
                </div>
              )}

              {fieldErrors.university && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.university}
                </p>
              )}
            </div>

            {/* Faculty Selection Dropdown + Custom Field */}
            <div data-has-error={!!fieldErrors.faculty} className="space-y-2">
              <label className="block text-xs font-semibold text-navy">
                {tr("Faculty / College / Institute", "الكلية / المعهد")} <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                className={inputClass(!!fieldErrors.faculty)}
                required
                value={f.faculty_select}
                onChange={(e) => {
                  setF({ ...f, faculty_select: e.target.value });
                  clearFieldError("faculty");
                }}
              >
                <option value="">{tr("-- Select Faculty / Major --", "-- اختر الكلية أو التخصص --")}</option>
                {FACULTIES.map((fac) => (
                  <option key={fac.val} value={fac.val}>
                    {ar ? fac.labelAr : fac.labelEn}
                  </option>
                ))}
              </select>

              {f.faculty_select === "other" && (
                <div className="pt-1">
                  <input
                    className={inputClass(!!fieldErrors.faculty && !f.faculty_custom.trim())}
                    required
                    maxLength={120}
                    placeholder={tr("Type your faculty or institute name here...", "اكتب اسم الكلية أو المعهد هنا...")}
                    value={f.faculty_custom}
                    onChange={(e) => {
                      setF({ ...f, faculty_custom: e.target.value });
                      clearFieldError("faculty");
                    }}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {tr("Enter the full name of your faculty or institute.", "يرجى كتابة اسم الكلية أو المعهد بالتفصيل.")}
                  </p>
                </div>
              )}

              {fieldErrors.faculty && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.faculty}
                </p>
              )}
            </div>

            {/* Sales Experience (Dropdown Menu) */}
            <div data-has-error={!!fieldErrors.experience}>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                {tr("Sales & Marketing Experience", "الخبرة في المبيعات والتسويق")} <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                className={inputClass(!!fieldErrors.experience)}
                required
                value={f.experience}
                onChange={(e) => {
                  setF({ ...f, experience: e.target.value });
                  clearFieldError("experience");
                }}
              >
                <option value="">{tr("-- Select Your Experience Level --", "-- اختر مستوى خبرتك في السيلز --")}</option>
                {SALES_EXPERIENCES.map((exp) => (
                  <option key={exp.val} value={exp.val}>
                    {ar ? exp.labelAr : exp.labelEn}
                  </option>
                ))}
              </select>
              {fieldErrors.experience && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.experience}
                </p>
              )}
            </div>

            {/* Email (Strictly @gmail.com) */}
            <div data-has-error={!!fieldErrors.email}>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                {tr("Google Email (@gmail.com only)", "البريد الإلكتروني (جيميل فقط)")} <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                className={inputClass(!!fieldErrors.email)}
                required
                type="email"
                maxLength={160}
                placeholder="example@gmail.com"
                value={f.email}
                onChange={(e) => {
                  setF({ ...f, email: e.target.value });
                  clearFieldError("email");
                }}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {tr("Must be a valid Gmail account ending with @gmail.com", "يجب أن ينتهي الإيميل بـ @gmail.com لضمان وصول الإشعارات.")}
              </p>
              {fieldErrors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password with Show/Hide Toggle */}
            <div data-has-error={!!fieldErrors.password}>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                {tr("Password (min 8 characters)", "كلمة السر (8 أحرف أو أرقام على الأقل)")} <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  className={`${inputClass(!!fieldErrors.password)} ${ar ? "pl-11" : "pr-11"}`}
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  placeholder="••••••••"
                  value={f.password}
                  onChange={(e) => {
                    setF({ ...f, password: e.target.value });
                    clearFieldError("password");
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors p-2 ${
                    ar ? "left-1.5" : "right-1.5"
                  }`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              disabled={busy}
              type="submit"
              className="w-full rounded-full bg-navy py-4 font-semibold text-ivory shadow-lg hover:bg-navy-light active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer text-base mt-2"
            >
              {busy ? tr("Creating Partner Account...", "جاري إنشاء حساب الشريك...") : tr("Join as Sales Partner", "انضم كشريك مبيعات")}
            </button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              {tr("Already a partner?", "شريك بالفعل؟")}{" "}
              <Link to="/partners/login" className="font-semibold text-navy hover:underline">
                {tr("Sign in", "سجّل دخولك الآن")}
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
