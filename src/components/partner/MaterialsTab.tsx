import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  FileText,
  Download,
  Search,
  Building2,
  Plane,
  CreditCard,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import {
  getMaterialsContent,
  getMaterialsPdfHtml,
  type MaterialSection,
  type MaterialFAQ,
} from "@/lib/materials.functions";
import { useLang } from "@/lib/i18n";

export function MaterialsTab() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const tr = (en: string, a: string) => (ar ? a : en);

  const fetchMaterials = useServerFn(getMaterialsContent);
  const fetchPdf = useServerFn(getMaterialsPdfHtml);

  const { data, isLoading } = useQuery({
    queryKey: ["partner-materials"],
    queryFn: fetchMaterials,
  });

  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetchPdf();
      if (res?.html) {
        const printWin = window.open("", "_blank");
        if (printWin) {
          printWin.document.write(res.html);
          printWin.document.close();
          printWin.focus();
          setTimeout(() => {
            printWin.print();
          }, 400);
        }
      }
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">
        {tr("Loading materials center…", "جاري تحميل مركز المواد التدريبية…")}
      </div>
    );
  }

  const { categories, sections, faqs, version, lastUpdated } = data;

  const filteredSections = sections.filter((s: MaterialSection) => {
    const matchesCat = activeCat === "all" || s.category === activeCat;
    const matchesSearch =
      !search ||
      s.titleAr.toLowerCase().includes(search.toLowerCase()) ||
      s.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      s.contentAr.toLowerCase().includes(search.toLowerCase()) ||
      s.contentEn.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredFaqs = faqs.filter((f: MaterialFAQ) => {
    const matchesSearch =
      !search ||
      f.questionAr.toLowerCase().includes(search.toLowerCase()) ||
      f.questionEn.toLowerCase().includes(search.toLowerCase()) ||
      f.answerAr.toLowerCase().includes(search.toLowerCase()) ||
      f.answerEn.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-navy via-navy to-slate-900 p-6 sm:p-8 text-ivory shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-beige/20 px-3 py-0.5 text-xs font-bold text-beige">
                {tr("Official Materials Center", "مركز المواد التدريبية المعتمدة")}
              </span>
              <span className="text-xs text-ivory/60">
                v{version} · {new Date(lastUpdated).toLocaleDateString(ar ? "ar-EG" : "en-US")}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {tr("Partner Knowledge & Sales Center", "دليل الشريك المعتمد وبرامج كينتيكس")}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-ivory/80 leading-relaxed">
              {tr(
                "Everything you need to guide clients: travel pathways, verified contracts, installment details, and proven objection handling answers.",
                "كل ما تحتاجه لإرشاد العملاء: مسارات السفر والتدريب، تفاصيل العقود والرواتب، أنظمة الأقساط، والردود النموذجية على كافة الاعتراضات."
              )}
            </p>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-beige hover:bg-beige/90 px-5 py-3 text-sm font-bold text-navy shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            {downloadingPdf ? (
              <span className="animate-spin text-navy">⏳</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{tr("Download Official Guide (PDF)", "تحميل الدليل بصيغة PDF")}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveCat("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              activeCat === "all"
                ? "bg-navy text-ivory dark:bg-beige dark:text-navy shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tr("All Topics", "كافة الأقسام")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeCat === c.id
                  ? "bg-navy text-ivory dark:bg-beige dark:text-navy shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {ar ? c.nameAr : c.nameEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr("Search guide and FAQs…", "بحث في الدليل والأسئلة الشائعة…")}
            className="w-full rounded-full border border-input bg-card ps-9 pe-4 py-1.5 text-xs outline-none focus:border-beige transition-colors"
          />
        </div>
      </div>

      {/* Section A: Company Information and Training */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-beige" />
          <h2 className="font-display text-lg font-bold">
            {tr("Company Information & Sales Training", "معلومات الشركة والتدريب المهني")}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredSections.map((s) => (
            <div
              key={s.id}
              className="rounded-3xl border border-border bg-card p-5 shadow-xs hover:border-beige/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {categories.find((c) => c.id === s.category)?.nameAr || s.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(s.updatedAt).toLocaleDateString(ar ? "ar-EG" : "en-US")}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">
                  {ar ? s.titleAr : s.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {ar ? s.contentAr : s.contentEn}
                </p>
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="col-span-2 py-10 text-center text-muted-foreground">
              <p className="text-sm">{tr("No materials found matching your search.", "لا توجد مواد مطابقة للبحث.")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Section B: Searchable FAQ */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-beige" />
            <h2 className="font-display text-lg font-bold">
              {tr("Frequently Asked Questions (FAQ)", "الأسئلة الشائعة والأجوبة النموذجية")}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredFaqs.length} {tr("Questions", "سؤال")}
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredFaqs.map((f) => {
            const isOpen = openFaqs[f.id] ?? false;
            return (
              <div
                key={f.id}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(f.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-start hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {ar ? f.questionAr : f.questionEn}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-beige" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-border/60 bg-secondary/20 p-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-100">
                    {ar ? f.answerAr : f.answerEn}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">{tr("No FAQs match your search.", "لا توجد أسئلة شائعة مطابقة للبحث.")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
