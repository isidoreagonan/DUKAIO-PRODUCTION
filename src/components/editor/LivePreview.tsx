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

const defaultDemoProducts: StorefrontProduct[] = [
  {
    id: "demo-1",
    title: "Pack Automatisation Facebook Ads & IA",
    price: 15000,
    original_price: 25000,
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
    type: "course",
    category: "Formation",
    sales_count: 142,
  },
  {
    id: "demo-2",
    title: "Template E-commerce Dukaio Haute Conversion",
    price: 9000,
    original_price: 18000,
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    type: "file",
    category: "Fichier",
    sales_count: 89,
  },
  {
    id: "demo-3",
    title: "Guide Ultime Vente Digitale Afrique de l'Ouest",
    price: 5000,
    original_price: 10000,
    thumbnail_url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop",
    type: "file",
    category: "Ebook",
    sales_count: 310,
  },
  {
    id: "demo-4",
    title: "Bootcamp Closing & Vente par WhatsApp",
    price: 25000,
    original_price: 40000,
    thumbnail_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop",
    type: "course",
    category: "Formation",
    sales_count: 67,
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
  products = defaultDemoProducts,
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
          {/* Mock Browser Header */}
          <div className="grid h-9 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-background px-3">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="truncate rounded-full bg-muted/80 px-3 py-0.5 text-center text-[10px] font-mono text-muted-foreground">
              {config.slug || "boutique"}.dukaio.com
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
                products={products.length > 0 ? products : defaultDemoProducts}
                sellerName={config.name || "DUKAIO"}
                storeSlug={config.slug || "boutique"}
                isCustomizerPreview
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
