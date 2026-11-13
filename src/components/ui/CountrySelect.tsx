import { useState, useRef, useEffect, useMemo } from "react";
import { countries, Country } from "@/data/countries";
import { ChevronDown, Search, Check } from "lucide-react";

interface CountrySelectProps {
  value: string; // Country name, e.g. "Bénin"
  onChange: (countryName: string, country: Country) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Sélectionner un pays",
  className = "",
  id,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected country
  const selectedCountry = useMemo(() => {
    return (
      countries.find(
        (c) =>
          c.name.toLowerCase() === value.toLowerCase() ||
          c.code.toLowerCase() === value.toLowerCase()
      ) || null
    );
  }, [value]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q)
    );
  }, [search]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (country: Country) => {
    onChange(country.name, country);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className="h-11 w-full rounded-xl border border-input bg-background px-3.5 flex items-center justify-between text-sm text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedCountry ? (
            <>
              <img
                src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                alt={selectedCountry.name}
                className="h-4 w-6 rounded-[3px] object-cover border border-border/60 shrink-0 shadow-2xs"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <span className="font-medium text-foreground truncate">
                {selectedCountry.name}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Styled Popover Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden">
          {/* Search Bar */}
          <div className="p-2.5 border-b border-border/60 bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher un pays..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* List of Countries */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry?.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-secondary/70 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                        alt={c.name}
                        className="h-3.5 w-5 rounded-[2px] object-cover border border-border/60 shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <span className="truncate">{c.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {c.code}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Aucun pays trouvé pour "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

