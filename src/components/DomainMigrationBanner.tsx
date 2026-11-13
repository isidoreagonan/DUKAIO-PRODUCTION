import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function DomainMigrationBanner() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("dukaio_brand_migration_dismissed");
      if (dismissed === "true") {
        setVisible(false);
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--banner-height", "0px");
        }
        return;
      }
      setVisible(true);
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--banner-height", "36px");
      }
    } catch {
      setVisible(false);
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--banner-height", "0px");
      }
    }
  }, [location]);

  const handleDismiss = () => {
    try {
      localStorage.setItem("dukaio_brand_migration_dismissed", "true");
    } catch {}
    setVisible(false);
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--banner-height", "0px");
    }
  };

  if (!visible) return null;

  return (
    <>
      <aside
        aria-label="Annonce officielle de changement de domaine"
        className="fixed top-0 inset-x-0 z-[60] h-9 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white text-xs px-3 sm:px-4 shadow-sm border-b border-blue-500/30 flex items-center"
      >
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3 font-medium">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 text-amber-300 shrink-0">
              <Sparkles className="h-3 w-3" />
            </span>
            <p className="truncate text-[11px] sm:text-xs">
              <span className="font-bold">Annonce officielle :</span> ECOM-REVOLT devient officiellement{" "}
              <span className="font-extrabold text-blue-200 underline decoration-blue-400">DUKAIO</span> (dukaio.com). Vos boutiques, produits et liens restent 100% actifs.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="shrink-0 text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer l'annonce"
            title="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>
      {/* Spacer to push relative content down by exactly banner height */}
      <div className="h-9 w-full" aria-hidden="true" />
    </>
  );
}
