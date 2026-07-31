import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Camera, X } from "lucide-react";
import { VisualSearchDialog } from "./VisualSearchDialog";

interface Props {
  variant?: "hero" | "compact";
  defaultValue?: string;
}

export const MarketplaceSearchBar = ({ variant = "hero", defaultValue = "" }: Props) => {
  const [q, setQ] = useState(defaultValue);
  const [visualOpen, setVisualOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = q.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  const isHero = variant === "hero";

  return (
    <>
      <form
        onSubmit={submit}
        className={`relative flex w-full items-center gap-1.5 rounded-2xl border border-border bg-card shadow-lg transition-all focus-within:border-primary focus-within:shadow-xl sm:rounded-full ${
          isHero ? "p-1.5 pl-4 sm:p-2 sm:pl-5" : "p-1 pl-3 sm:p-1.5 sm:pl-4"
        }`}
      >
        <Search
          className={`shrink-0 text-muted-foreground ${isHero ? "h-5 w-5" : "h-4 w-4"}`}
        />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={isHero ? "Cherchez un produit…" : "Rechercher…"}
          className={`min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none ${
            isHero ? "text-sm sm:text-base" : "text-sm"
          }`}
          enterKeyHint="search"
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setVisualOpen(true)}
          title="Recherche par image"
          aria-label="Recherche par image"
          className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary ${
            isHero ? "h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2 sm:text-sm" : "h-8 w-8"
          }`}
        >
          <Camera className={isHero ? "h-4 w-4" : "h-3.5 w-3.5"} />
          {isHero && <span className="hidden sm:inline">Image</span>}
        </button>
        <button
          type="submit"
          aria-label="Rechercher"
          className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 ${
            isHero
              ? "h-10 w-10 sm:h-auto sm:w-auto sm:px-6 sm:py-2.5 sm:text-sm"
              : "h-8 w-8 sm:h-auto sm:w-auto sm:px-4 sm:py-1.5 sm:text-xs"
          }`}
        >
          <Search className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </form>
      <VisualSearchDialog open={visualOpen} onOpenChange={setVisualOpen} />
    </>
  );
};
