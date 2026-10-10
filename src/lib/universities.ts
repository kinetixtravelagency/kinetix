/**
 * Egyptian universities and their faculties.
 * Used for searchable dropdowns in the application form.
 */

export interface University {
  id: string;
  nameAr: string;
  nameEn: string;
  type: "public" | "private" | "azhar";
}

export interface Faculty {
  id: string;
  universityId: string;
  nameAr: string;
  nameEn: string;
}

export const UNIVERSITIES: University[] = [
  // Cairo governorate
  { id: "cairo", nameAr: "جامعة القاهرة", nameEn: "Cairo University", type: "public" },
  { id: "ain_shams", nameAr: "جامعة عين شمس", nameEn: "Ain Shams University", type: "public" },
  { id: "helwan", nameAr: "جامعة حلوان", nameEn: "Helwan University", type: "public" },
  { id: "azhar_cairo", nameAr: "جامعة الأزهر (القاهرة)", nameEn: "Al-Azhar University (Cairo)", type: "azhar" },
  { id: "modern_cairo", nameAr: "الجامعة الحديثة للتكنولوجيا والمعلومات", nameEn: "Modern University for Technology & Information", type: "private" },
  { id: "mtu", nameAr: "جامعة مصر للعلوم والتكنولوجيا", nameEn: "Misr University for Science & Technology", type: "private" },
  { id: "bue", nameAr: "الجامعة البريطانية في مصر", nameEn: "British University in Egypt", type: "private" },
  { id: "aua", nameAr: "الجامعة الأمريكية بالقاهرة", nameEn: "American University in Cairo", type: "private" },
  { id: "future", nameAr: "جامعة المستقبل", nameEn: "Future University in Egypt", type: "private" },
  { id: "misr_intl", nameAr: "جامعة مصر الدولية", nameEn: "Misr International University", type: "private" },

  // Alexandria
  { id: "alexandria", nameAr: "جامعة الإسكندرية", nameEn: "Alexandria University", type: "public" },
  { id: "pharos", nameAr: "جامعة فاروس بالإسكندرية", nameEn: "Pharos University in Alexandria", type: "private" },
  { id: "arab_academy", nameAr: "الأكاديمية العربية للعلوم والتكنولوجيا", nameEn: "Arab Academy for Science & Technology", type: "private" },

  // Delta & Lower Egypt
  { id: "mansoura", nameAr: "جامعة المنصورة", nameEn: "Mansoura University", type: "public" },
  { id: "zagazig", nameAr: "جامعة الزقازيق", nameEn: "Zagazig University", type: "public" },
  { id: "tanta", nameAr: "جامعة طنطا", nameEn: "Tanta University", type: "public" },
  { id: "menofia", nameAr: "جامعة المنوفية", nameEn: "Menoufia University", type: "public" },
  { id: "kafr_sheikh", nameAr: "جامعة كفر الشيخ", nameEn: "Kafrelsheikh University", type: "public" },
  { id: "damietta", nameAr: "جامعة دمياط", nameEn: "Damietta University", type: "public" },
  { id: "benha", nameAr: "جامعة بنها", nameEn: "Benha University", type: "public" },
  { id: "delta", nameAr: "جامعة الدلتا التكنولوجية", nameEn: "Delta Technological University", type: "public" },

  // Upper Egypt
  { id: "assiut", nameAr: "جامعة أسيوط", nameEn: "Assiut University", type: "public" },
  { id: "sohag", nameAr: "جامعة سوهاج", nameEn: "Sohag University", type: "public" },
  { id: "qena_sais", nameAr: "جامعة جنوب الوادي", nameEn: "South Valley University", type: "public" },
  { id: "luxor", nameAr: "جامعة الأقصر", nameEn: "Luxor University", type: "public" },
  { id: "aswan", nameAr: "جامعة أسوان", nameEn: "Aswan University", type: "public" },

  // Suez Canal & Sinai
  { id: "suez_canal", nameAr: "جامعة قناة السويس", nameEn: "Suez Canal University", type: "public" },
  { id: "suez", nameAr: "جامعة السويس", nameEn: "Suez University", type: "public" },
  { id: "north_sinai", nameAr: "جامعة شمال سيناء", nameEn: "Northern Sinai University", type: "public" },

  // West & New Cities
  { id: "beni_suef", nameAr: "جامعة بني سويف", nameEn: "Beni-Suef University", type: "public" },
  { id: "fayoum", nameAr: "جامعة الفيوم", nameEn: "Fayoum University", type: "public" },
  { id: "minia", nameAr: "جامعة المنيا", nameEn: "Minia University", type: "public" },
  { id: "new_giza", nameAr: "جامعة نيو جيزة", nameEn: "New Giza University", type: "private" },
  { id: "alamein_intl", nameAr: "جامعة العلمين الدولية", nameEn: "Alamein International University", type: "public" },

  // Engineering & Specialized
  { id: "egypt_japan", nameAr: "الجامعة المصرية اليابانية للعلوم والتكنولوجيا", nameEn: "Egypt-Japan University of S&T", type: "public" },
  { id: "nile_univ", nameAr: "جامعة النيل", nameEn: "Nile University", type: "private" },
  { id: "guc", nameAr: "الجامعة الألمانية بالقاهرة", nameEn: "German University in Cairo", type: "private" },
  { id: "french_egypt", nameAr: "الجامعة الفرنسية في مصر", nameEn: "Université Française d'Égypte", type: "private" },
  { id: "canadian_intl", nameAr: "الجامعة الكندية في مصر", nameEn: "Canadian International College", type: "private" },
  { id: "miu", nameAr: "جامعة مصر الدولية (مدينة الشروق)", nameEn: "Modern International University", type: "private" },
  { id: "htu", nameAr: "الجامعة العليا للسياحة والفندقة", nameEn: "Higher Institute for Tourism & Hotels", type: "private" },
  { id: "other", nameAr: "أخرى (كتابة اسم الجامعة يدوياً)", nameEn: "Other (Type university name manually)", type: "private" },
];

export interface StandardFaculty {
  id: string;
  nameAr: string;
  nameEn: string;
  years: number;
}

/** Comprehensive list of Egyptian faculties available for all universities */
export const STANDARD_FACULTIES: StandardFaculty[] = [
  { id: "eng", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering", years: 5 },
  { id: "med", nameAr: "كلية الطب البشري", nameEn: "Faculty of Medicine", years: 7 },
  { id: "dent", nameAr: "كلية طب جراحة الفم والأسنان", nameEn: "Faculty of Dentistry", years: 5 },
  { id: "pharm", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy", years: 5 },
  { id: "phys_therapy", nameAr: "كلية العلاج الطبيعي", nameEn: "Faculty of Physical Therapy", years: 5 },
  { id: "cs", nameAr: "كلية الحاسبات والمعلومات والذكاء الاصطناعي", nameEn: "Faculty of Computer Science & AI", years: 4 },
  { id: "com", nameAr: "كلية التجارة وإدارة الأعمال", nameEn: "Faculty of Commerce & Business", years: 4 },
  { id: "law", nameAr: "كلية الحقوق والشريعة والقانون", nameEn: "Faculty of Law & Sharia", years: 4 },
  { id: "arts", nameAr: "كلية الآداب والعلوم الإنسانية", nameEn: "Faculty of Arts & Humanities", years: 4 },
  { id: "alsun", nameAr: "كلية الألسن واللغات والترجمة", nameEn: "Faculty of Al-Alsun & Languages", years: 4 },
  { id: "econ", nameAr: "كلية الاقتصاد والعلوم السياسية", nameEn: "Faculty of Economics & Political Science", years: 4 },
  { id: "mass_comm", nameAr: "كلية الإعلام وتكنولوجيا الاتصال", nameEn: "Faculty of Mass Communication", years: 4 },
  { id: "sci", nameAr: "كلية العلوم", nameEn: "Faculty of Science", years: 4 },
  { id: "nursing", nameAr: "كلية التمريض", nameEn: "Faculty of Nursing", years: 4 },
  { id: "vet", nameAr: "كلية الطب البيطري", nameEn: "Faculty of Veterinary Medicine", years: 5 },
  { id: "agri", nameAr: "كلية الزراعة", nameEn: "Faculty of Agriculture", years: 4 },
  { id: "edu", nameAr: "كلية التربية", nameEn: "Faculty of Education", years: 4 },
  { id: "specific_edu", nameAr: "كلية التربية النوعية", nameEn: "Faculty of Specific Education", years: 4 },
  { id: "sports_edu", nameAr: "كلية التربية الرياضية", nameEn: "Faculty of Physical Education", years: 4 },
  { id: "fine_arts", nameAr: "كلية الفنون الجميلة", nameEn: "Faculty of Fine Arts", years: 5 },
  { id: "applied_arts", nameAr: "كلية الفنون التطبيقية", nameEn: "Faculty of Applied Arts", years: 5 },
  { id: "tourism", nameAr: "كلية السياحة والفنادق", nameEn: "Faculty of Tourism & Hotels", years: 4 },
  { id: "archaeology", nameAr: "كلية الآثار", nameEn: "Faculty of Archaeology", years: 4 },
  { id: "social_work", nameAr: "كلية الخدمة الاجتماعية", nameEn: "Faculty of Social Work", years: 4 },
  { id: "industrial_tech", nameAr: "كلية التكنولوجيا والتعليم الصناعي", nameEn: "Faculty of Industrial Technology", years: 4 },
  { id: "applied_health", nameAr: "كلية العلوم الصحية والتطبيقية", nameEn: "Faculty of Applied Health Sciences", years: 4 },
  { id: "islamic_studies", nameAr: "كلية الدراسات الإسلامية وأصول الدين", nameEn: "Faculty of Islamic Studies", years: 4 },
  { id: "higher_institute_tech", nameAr: "معهد عالي للهندسة والتكنولوجيا", nameEn: "Higher Institute of Engineering & Technology", years: 5 },
  { id: "higher_institute_comp", nameAr: "معهد عالي للحاسبات ونظم المعلومات والإدارة", nameEn: "Higher Institute of MIS & Computer Science", years: 4 },
  { id: "higher_institute_lang", nameAr: "معهد عالي للغات والإعلام والترجمة", nameEn: "Higher Institute of Languages & Media", years: 4 },
  { id: "other", nameAr: "أخرى (كتابة اسم الكلية أو المعهد يدوياً)", nameEn: "Other (Type Faculty or Institute manually)", years: 4 },
];

/**
 * Calculates academic years based on faculty:
 * - Medicine: 7 years
 * - Engineering: 5 years
 * - All other faculties: 4 years
 */
export function getFacultyYears(facultyNameOrId: string): number {
  if (!facultyNameOrId) return 4;
  const str = facultyNameOrId.toLowerCase();
  // Medicine: 7 years (excluding veterinary or dental)
  if (
    (facultyNameOrId.includes("الطب") && !facultyNameOrId.includes("البيطري") && !facultyNameOrId.includes("الأسنان")) ||
    (str.includes("medicine") && !str.includes("veterinary") && !str.includes("dental")) ||
    facultyNameOrId === "med"
  ) {
    return 7;
  }
  // Engineering: 5 years
  if (
    facultyNameOrId.includes("الهندسة") ||
    str.includes("engineering") ||
    facultyNameOrId === "eng" ||
    facultyNameOrId === "higher_institute_tech"
  ) {
    return 5;
  }
  // All other faculties: 4 years
  return 4;
}

/** Get faculties for a given university id - returns complete standardized list */
export function getFacultiesForUniversity(universityId: string): StandardFaculty[] {
  // Always return the rich standardized list so every Egyptian university has all faculties available
  return STANDARD_FACULTIES;
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
}

/** Egypt's 27 official governorates */
export const EGYPTIAN_GOVERNORATES: Governorate[] = [
  { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo" },
  { id: "giza", nameAr: "الجيزة", nameEn: "Giza" },
  { id: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria" },
  { id: "qalyubia", nameAr: "القليوبية (بنها / شبرا)", nameEn: "Qalyubia (Benha / Shubra)" },
  { id: "dakahlia", nameAr: "الدقهلية (المنصورة)", nameEn: "Dakahlia (Mansoura)" },
  { id: "sharqia", nameAr: "الشرقية (الزقازيق / العاشر)", nameEn: "Sharqia (Zagazig / 10th of Ramadan)" },
  { id: "gharbia", nameAr: "الغربية (طنطا / المحلة الكبرى)", nameEn: "Gharbia (Tanta / Mahalla)" },
  { id: "menofia", nameAr: "المنوفية (شبين الكوم / السادات)", nameEn: "Menoufia (Shebin El Koum)" },
  { id: "beheira", nameAr: "البحيرة (دمنهور)", nameEn: "Beheira (Damanhur)" },
  { id: "kafr_sheikh", nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh" },
  { id: "damietta", nameAr: "دمياط", nameEn: "Damietta" },
  { id: "port_said", nameAr: "بورسعيد", nameEn: "Port Said" },
  { id: "ismailia", nameAr: "الإسماعيلية", nameEn: "Ismailia" },
  { id: "suez", nameAr: "السويس", nameEn: "Suez" },
  { id: "fayoum", nameAr: "الفيوم", nameEn: "Fayoum" },
  { id: "beni_suef", nameAr: "بني سويف", nameEn: "Beni Suef" },
  { id: "minya", nameAr: "المنيا", nameEn: "Minya" },
  { id: "assiut", nameAr: "أسيوط", nameEn: "Assiut" },
  { id: "sohag", nameAr: "سوهاج", nameEn: "Sohag" },
  { id: "qena", nameAr: "قنا", nameEn: "Qena" },
  { id: "luxor", nameAr: "الأقصر", nameEn: "Luxor" },
  { id: "aswan", nameAr: "أسوان", nameEn: "Aswan" },
  { id: "red_sea", nameAr: "البحر الأحمر (الغردقة / الجونة)", nameEn: "Red Sea (Hurghada / El Gouna)" },
  { id: "south_sinai", nameAr: "جنوب سيناء (شرم الشيخ / دهب)", nameEn: "South Sinai (Sharm El Sheikh / Dahab)" },
  { id: "north_sinai", nameAr: "شمال سيناء (العريش)", nameEn: "North Sinai (Arish)" },
  { id: "matrouh", nameAr: "مطروح (الساحل الشمالي / العلمين)", nameEn: "Matrouh (North Coast / Alamein)" },
  { id: "new_valley", nameAr: "الوادي الجديد (الخارجة / الداخلة)", nameEn: "New Valley (Kharga)" },
];

export const EGYPTIAN_CITIES = EGYPTIAN_GOVERNORATES.map((g) => g.nameAr);
