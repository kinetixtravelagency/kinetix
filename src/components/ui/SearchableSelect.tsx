import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  subLabel?: string | undefined;
  badge?: string | undefined;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "-- Select --",
  searchPlaceholder = "ابحث هنا... / Search...",
  disabled = false,
  className = "",
  error = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.subLabel && o.subLabel.toLowerCase().includes(q)) ||
        (o.badge && o.badge.toLowerCase().includes(q))
    );
  }, [options, query]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2 text-start text-xs transition-all shadow-xs focus:outline-none ${
          disabled
            ? "cursor-not-allowed opacity-50 bg-secondary/30 border-border"
            : isOpen
            ? "border-navy ring-1 ring-navy dark:border-beige dark:ring-beige"
            : error
            ? "border-red-500 focus:border-red-500"
            : "border-input hover:border-beige"
        }`}
      >
        <span className={`truncate flex-1 font-medium ${selectedOption ? "text-foreground" : "text-muted-foreground"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-border bg-card p-2 shadow-xl backdrop-blur animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-input bg-background ps-8 pe-7 py-1.5 text-xs text-foreground outline-none focus:border-navy dark:focus:border-beige"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute end-2 top-2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                لا توجد نتائج مطابقة / No results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-start text-xs transition-colors ${
                      isSelected
                        ? "bg-navy/10 text-navy dark:bg-beige/15 dark:text-beige font-semibold"
                        : "hover:bg-secondary/60 text-foreground"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate leading-tight">{opt.label}</p>
                      {opt.subLabel && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {opt.subLabel}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {opt.badge && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.2 text-[9px] text-muted-foreground border border-border">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-navy dark:text-beige" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
