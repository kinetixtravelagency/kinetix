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
];

/** Faculties map: universityId → Faculty[] */
export const FACULTIES: Faculty[] = [
  // Cairo University
  { id: "cairo_eng", universityId: "cairo", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "cairo_med", universityId: "cairo", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "cairo_pharm", universityId: "cairo", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "cairo_law", universityId: "cairo", nameAr: "كلية الحقوق", nameEn: "Faculty of Law" },
  { id: "cairo_econ", universityId: "cairo", nameAr: "كلية الاقتصاد والعلوم السياسية", nameEn: "Faculty of Economics & Political Science" },
  { id: "cairo_com", universityId: "cairo", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "cairo_arts", universityId: "cairo", nameAr: "كلية الآداب", nameEn: "Faculty of Arts" },
  { id: "cairo_sci", universityId: "cairo", nameAr: "كلية العلوم", nameEn: "Faculty of Science" },
  { id: "cairo_cs", universityId: "cairo", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science & Information" },
  { id: "cairo_agri", universityId: "cairo", nameAr: "كلية الزراعة", nameEn: "Faculty of Agriculture" },
  { id: "cairo_dent", universityId: "cairo", nameAr: "كلية طب الأسنان", nameEn: "Faculty of Dentistry" },
  { id: "cairo_vet", universityId: "cairo", nameAr: "كلية الطب البيطري", nameEn: "Faculty of Veterinary Medicine" },
  { id: "cairo_massCom", universityId: "cairo", nameAr: "كلية الإعلام", nameEn: "Faculty of Mass Communication" },
  { id: "cairo_arch", universityId: "cairo", nameAr: "كلية الفنون الجميلة", nameEn: "Faculty of Fine Arts" },
  { id: "cairo_edu", universityId: "cairo", nameAr: "كلية التربية", nameEn: "Faculty of Education" },

  // Ain Shams
  { id: "as_eng", universityId: "ain_shams", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "as_med", universityId: "ain_shams", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "as_pharm", universityId: "ain_shams", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "as_com", universityId: "ain_shams", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "as_law", universityId: "ain_shams", nameAr: "كلية الحقوق", nameEn: "Faculty of Law" },
  { id: "as_arts", universityId: "ain_shams", nameAr: "كلية الآداب", nameEn: "Faculty of Arts" },
  { id: "as_sci", universityId: "ain_shams", nameAr: "كلية العلوم", nameEn: "Faculty of Science" },
  { id: "as_cs", universityId: "ain_shams", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science & Information" },
  { id: "as_edu", universityId: "ain_shams", nameAr: "كلية التربية", nameEn: "Faculty of Education" },
  { id: "as_dent", universityId: "ain_shams", nameAr: "كلية طب الأسنان", nameEn: "Faculty of Dentistry" },
  { id: "as_lang", universityId: "ain_shams", nameAr: "كلية الألسن", nameEn: "Faculty of Language Studies" },
  { id: "as_nursing", universityId: "ain_shams", nameAr: "كلية التمريض", nameEn: "Faculty of Nursing" },

  // Alexandria
  { id: "alex_eng", universityId: "alexandria", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "alex_med", universityId: "alexandria", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "alex_com", universityId: "alexandria", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "alex_law", universityId: "alexandria", nameAr: "كلية الحقوق", nameEn: "Faculty of Law" },
  { id: "alex_arts", universityId: "alexandria", nameAr: "كلية الآداب", nameEn: "Faculty of Arts" },
  { id: "alex_sci", universityId: "alexandria", nameAr: "كلية العلوم", nameEn: "Faculty of Science" },
  { id: "alex_cs", universityId: "alexandria", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science" },
  { id: "alex_pharm", universityId: "alexandria", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "alex_dent", universityId: "alexandria", nameAr: "كلية طب الأسنان", nameEn: "Faculty of Dentistry" },
  { id: "alex_vet", universityId: "alexandria", nameAr: "كلية الطب البيطري", nameEn: "Faculty of Veterinary Medicine" },
  { id: "alex_agri", universityId: "alexandria", nameAr: "كلية الزراعة", nameEn: "Faculty of Agriculture" },
  { id: "alex_tourism", universityId: "alexandria", nameAr: "كلية السياحة والفندقة", nameEn: "Faculty of Tourism & Hotels" },

  // Mansoura
  { id: "mans_eng", universityId: "mansoura", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "mans_med", universityId: "mansoura", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "mans_pharm", universityId: "mansoura", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "mans_com", universityId: "mansoura", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "mans_cs", universityId: "mansoura", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science" },
  { id: "mans_law", universityId: "mansoura", nameAr: "كلية الحقوق", nameEn: "Faculty of Law" },
  { id: "mans_arts", universityId: "mansoura", nameAr: "كلية الآداب", nameEn: "Faculty of Arts" },
  { id: "mans_sci", universityId: "mansoura", nameAr: "كلية العلوم", nameEn: "Faculty of Science" },
  { id: "mans_dent", universityId: "mansoura", nameAr: "كلية طب الأسنان", nameEn: "Faculty of Dentistry" },

  // Zagazig
  { id: "zag_eng", universityId: "zagazig", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "zag_med", universityId: "zagazig", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "zag_com", universityId: "zagazig", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "zag_agri", universityId: "zagazig", nameAr: "كلية الزراعة", nameEn: "Faculty of Agriculture" },
  { id: "zag_sci", universityId: "zagazig", nameAr: "كلية العلوم", nameEn: "Faculty of Science" },
  { id: "zag_cs", universityId: "zagazig", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science" },
  { id: "zag_pharm", universityId: "zagazig", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },

  // Helwan
  { id: "helwan_eng", universityId: "helwan", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "helwan_com", universityId: "helwan", nameAr: "كلية التجارة والأعمال", nameEn: "Faculty of Commerce & Business" },
  { id: "helwan_arts", universityId: "helwan", nameAr: "كلية الآداب", nameEn: "Faculty of Arts" },
  { id: "helwan_fineart", universityId: "helwan", nameAr: "كلية الفنون الجميلة", nameEn: "Faculty of Fine Arts" },
  { id: "helwan_tourism", universityId: "helwan", nameAr: "كلية السياحة والفنادق", nameEn: "Faculty of Tourism & Hotels" },
  { id: "helwan_music", universityId: "helwan", nameAr: "معهد الموسيقى العربية", nameEn: "Institute of Arabic Music" },
  { id: "helwan_edu", universityId: "helwan", nameAr: "كلية التربية", nameEn: "Faculty of Education" },

  // Assiut
  { id: "ass_eng", universityId: "assiut", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "ass_med", universityId: "assiut", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "ass_pharm", universityId: "assiut", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "ass_com", universityId: "assiut", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "ass_sci", universityId: "assiut", nameAr: "كلية العلوم", nameEn: "Faculty of Science" },
  { id: "ass_agri", universityId: "assiut", nameAr: "كلية الزراعة", nameEn: "Faculty of Agriculture" },

  // Suez Canal
  { id: "sc_eng", universityId: "suez_canal", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "sc_med", universityId: "suez_canal", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "sc_com", universityId: "suez_canal", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "sc_tourism", universityId: "suez_canal", nameAr: "كلية السياحة والفنادق", nameEn: "Faculty of Tourism & Hotels" },
  { id: "sc_cs", universityId: "suez_canal", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science" },

  // GUC
  { id: "guc_eng", universityId: "guc", nameAr: "كلية الهندسة والمعلوماتية", nameEn: "Faculty of Engineering & IT" },
  { id: "guc_med", universityId: "guc", nameAr: "كلية الطب والعلوم الصحية", nameEn: "Faculty of Medicine & Health Sciences" },
  { id: "guc_bus", universityId: "guc", nameAr: "كلية إدارة الأعمال", nameEn: "Faculty of Management Technology" },
  { id: "guc_arch", universityId: "guc", nameAr: "كلية العمارة والتصميم", nameEn: "Faculty of Architecture & Design" },
  { id: "guc_pharm", universityId: "guc", nameAr: "كلية الصيدلة والبيوتكنولوجي", nameEn: "Faculty of Pharmacy & Biotechnology" },

  // BUE
  { id: "bue_eng", universityId: "bue", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "bue_bus", universityId: "bue", nameAr: "كلية إدارة الأعمال", nameEn: "Faculty of Business" },
  { id: "bue_it", universityId: "bue", nameAr: "كلية الحوسبة والتكنولوجيا الرقمية", nameEn: "Faculty of Computing & Digital Technology" },
  { id: "bue_hum", universityId: "bue", nameAr: "كلية الآداب والعلوم الإنسانية", nameEn: "Faculty of Arts & Humanities" },

  // AUC
  { id: "auc_eng", universityId: "aua", nameAr: "كلية الهندسة والعلوم التطبيقية", nameEn: "School of Engineering & Applied Science" },
  { id: "auc_bus", universityId: "aua", nameAr: "كلية إدارة الأعمال", nameEn: "School of Business" },
  { id: "auc_sss", universityId: "aua", nameAr: "كلية العلوم الإنسانية والاجتماعية", nameEn: "School of Humanities & Social Sciences" },
  { id: "auc_globalAff", universityId: "aua", nameAr: "كلية الشئون العالمية والسياسة العامة", nameEn: "School of Global Affairs & Public Policy" },

  // Other private - generic faculties
  { id: "mtu_eng", universityId: "mtu", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "mtu_bus", universityId: "mtu", nameAr: "كلية إدارة الأعمال", nameEn: "Faculty of Business" },
  { id: "mtu_dent", universityId: "mtu", nameAr: "كلية طب الأسنان", nameEn: "Faculty of Dentistry" },
  { id: "mtu_pharm", universityId: "mtu", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "mtu_cs", universityId: "mtu", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science" },

  { id: "future_eng", universityId: "future", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "future_bus", universityId: "future", nameAr: "كلية إدارة الأعمال", nameEn: "Faculty of Business Administration" },
  { id: "future_pharm", universityId: "future", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "future_cs", universityId: "future", nameAr: "كلية الحاسبات والمعلومات", nameEn: "Faculty of Computer Science" },
  { id: "future_arch", universityId: "future", nameAr: "كلية العمارة", nameEn: "Faculty of Architecture" },

  // Al-Azhar
  { id: "azhar_sharia", universityId: "azhar_cairo", nameAr: "كلية الشريعة والقانون", nameEn: "Faculty of Sharia & Law" },
  { id: "azhar_lang", universityId: "azhar_cairo", nameAr: "كلية اللغة العربية", nameEn: "Faculty of Arabic Language" },
  { id: "azhar_eng", universityId: "azhar_cairo", nameAr: "كلية الهندسة", nameEn: "Faculty of Engineering" },
  { id: "azhar_med", universityId: "azhar_cairo", nameAr: "كلية الطب", nameEn: "Faculty of Medicine" },
  { id: "azhar_pharm", universityId: "azhar_cairo", nameAr: "كلية الصيدلة", nameEn: "Faculty of Pharmacy" },
  { id: "azhar_com", universityId: "azhar_cairo", nameAr: "كلية التجارة", nameEn: "Faculty of Commerce" },
  { id: "azhar_sci", universityId: "azhar_cairo", nameAr: "كلية العلوم", nameEn: "Faculty of Science" },
  { id: "azhar_edu", universityId: "azhar_cairo", nameAr: "كلية التربية", nameEn: "Faculty of Education" },
  { id: "azhar_islamicstud", universityId: "azhar_cairo", nameAr: "كلية الدراسات الإسلامية", nameEn: "Faculty of Islamic Studies" },
];

/** Get faculties for a given university id */
export function getFacultiesForUniversity(universityId: string): Faculty[] {
  return FACULTIES.filter((f) => f.universityId === universityId);
}

export const EGYPTIAN_CITIES = [
  "القاهرة", "الإسكندرية", "الجيزة", "المنصورة", "الإسماعيلية",
  "السويس", "بورسعيد", "الزقازيق", "طنطا", "أسيوط",
  "سوهاج", "الأقصر", "أسوان", "بني سويف", "المنيا",
  "الفيوم", "دمياط", "كفر الشيخ", "بنها", "شبرا الخيمة",
  "المحلة الكبرى", "قنا", "مرسى مطروح", "شرم الشيخ", "الغردقة",
  "العريش", "الأقصر", "دسوق", "أبو زعبل", "10th of Ramadan",
  "6th of October", "New Cairo", "New Administrative Capital",
];
