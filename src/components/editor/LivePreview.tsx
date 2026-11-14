import { useEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { StorefrontView, type StorefrontProduct } from "@/components/store/StorefrontView";
import type { ShopConfig } from "@/lib/shopConfig";

export type PreviewDevice = "mobile" | "tablet" | "desktop";

const deviceSizes: Record<PreviewDevice, { width: number; label: string }> = {
  mobile: { width: 390, label: "Mobile" },
  tablet: { width: 768, label: "Tablette" },
  desktop: { width: 1280, label: "Ordinateur" },
};

export const defaultDemoProducts: StorefrontProduct[] = [
  {
    id: "demo-1",
    title: "TikTok Ads Mastery — Vendre avec la publicité TikTok",
    price: 5950,
    original_price: 25000,
    thumbnail_url: "/images/demo/p-tiktok.jpg",
    type: "course",
    category: "Marketing",
    sales_count: 1240,
  },
  {
    id: "demo-2",
    title: "Formation IA Vidéo — Créer et revendre des vidéos",
    price: 15000,
    original_price: null,
    thumbnail_url: "/images/demo/p-ia.jpg",
    type: "course",
    category: "Formation",
    sales_count: 860,
  },
  {
    id: "demo-3",
    title: "Guitare Facile — Apprendre à jouer pas à pas",
    price: 3900,
    original_price: 19000,
    thumbnail_url: "/images/demo/p-guitare.jpg",
    type: "file",
    category: "Ebook",
    sales_count: 532,
  },
  {
    id: "demo-4",
    title: "Business en ligne — Le guide pratique complet",
    price: 7500,
    original_price: null,
    thumbnail_url: "/images/demo/p-business.jpg",
    type: "file",
    category: "Ebook",
    sales_count: 2105,
  },
  {
    id: "demo-5",
    title: "Pack Créatives TikTok — 120 templates prêts",
    price: 9900,
    original_price: 14900,
    thumbnail_url: "/images/demo/p-tiktok.jpg",
    type: "file",
    category: "Marketing",
    sales_count: 312,
  },
  {
    id: "demo-6",
    title: "Shooting produit avec l'IA — Méthode pro",
    price: 12000,
    original_price: null,
    thumbnail_url: "/images/demo/p-ia.jpg",
    type: "course",
    category: "Formation",
    sales_count: 498,
  },
  {
    id: "demo-7",
    title: "Business en ligne — Édition revente PLR",
    price: 18000,
    original_price: 27000,
    thumbnail_url: "/images/demo/p-business.jpg",
    type: "license",
    category: "PLR",
    sales_count: 176,
  },
  {
    id: "demo-8",
    title: "Guitare Facile — Recueil de 50 morceaux",
    price: 4500,
    original_price: null,
    thumbnail_url: "/images/demo/p-guitare.jpg",
    type: "file",
    category: "Ebook",
    sales_count: 289,
  },
];

interface LivePreviewProps {
  config: ShopConfig;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  products?: StorefrontProduct[];
  liveStoreUrl?: string;
}

export function LivePreview({
  config,
  device,
  onDeviceChange,
  products = [],
  liveStoreUrl,
}: LivePreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 360, height: 680 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => setBounds({ width: stage.clientWidth, height: stage.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const deviceWidth = deviceSizes[device].width;
  const horizontalRoom = Math.max(260, bounds.width - 32);
  const scale = Math.min(1, horizontalRoom / deviceWidth);
  const outerWidth = deviceWidth * scale;
  const outerHeight = Math.max(480, bounds.height - 32);
  const chromeHeight = 36;
  const contentHeight = outerHeight - chromeHeight;

  // When previewing, if seller has 0 or 1 product, complement with demo products to preview realistic layout
  const displayProducts =
    products.length === 0
      ? defaultDemoProducts
      : products.length < 2
      ? [...products, ...defaultDemoProducts.slice(1)]
      : products;

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100/60 dark:bg-slate-900/40">
      {/* Top Device Bar */}
      <div className="grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background px-4 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="truncate text-xs font-bold text-foreground">Aperçu en direct</h2>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {deviceSizes[device].label} · Échelle {Math.round(scale * 100)} %
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex rounded-lg border border-border bg-background p-0.5 shadow-2xs">
            {[
              { id: "mobile" as const, icon: Smartphone, label: "Aperçu mobile" },
              { id: "tablet" as const, icon: Tablet, label: "Aperçu tablette" },
              { id: "desktop" as const, icon: Monitor, label: "Aperçu ordinateur" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-pressed={device === item.id}
                onClick={() => onDeviceChange(item.id)}
                className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
                  device === item.id
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {liveStoreUrl && (
            <a
              href={liveStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir la boutique en direct"
              title="Ouvrir la vraie boutique dans un nouvel onglet"
              className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div
        ref={stageRef}
        className="relative flex min-h-[480px] flex-1 items-start justify-center overflow-hidden p-4"
      >
        <div
          className={`overflow-hidden border border-foreground/15 bg-background shadow-xl transition-[width,border-radius] duration-300 ${
            device === "mobile" ? "rounded-[28px] ring-8 ring-slate-800/10" : "rounded-xl ring-4 ring-slate-800/5"
          }`}
          style={{ width: outerWidth, height: outerHeight }}
        >
          {/* Mock Browser Header (Exact Capture 3) */}
          <div className="grid h-9 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-background px-3">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="truncate rounded-full bg-muted/80 px-3 py-0.5 text-center text-[10px] font-mono text-muted-foreground">
              dukaio.com/{config.slug || "boutique"}
            </div>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>

          {/* Scaled Webview Body */}
          <div className="overflow-hidden bg-background" style={{ height: contentHeight }}>
            <div
              className="overflow-y-auto overflow-x-hidden bg-shop-bg scrollbar-thin"
              style={{
                width: deviceWidth,
                height: contentHeight / scale,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <StorefrontView
                config={config}
                products={displayProducts}
                sellerName={config.name || "DUKAIO"}
                storeSlug={config.slug || "boutique"}
                previewDevice={device}
                isCustomizerPreview
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
