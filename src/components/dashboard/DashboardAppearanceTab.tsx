import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, RotateCcw, Save, Paintbrush, Type, MousePointerClick, ArrowUpDown, Star, ShoppingCart, Sparkles, Check, Package, ImagePlus, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import StoreSelector from "./StoreSelector";
import { useActiveStore } from "@/hooks/useActiveStore";

const BRAND_COLORS = [
  { name: "Bleu", value: "#2563EB" },
  { name: "Émeraude", value: "#10B981" },
  { name: "Orange", value: "#F97316" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Rose", value: "#EC4899" },
  { name: "Jaune", value: "#EAB308" },
  { name: "Rouge", value: "#EF4444" },
];

const FONTS = [
  { label: "Inter", value: "Inter" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Georgia", value: "Georgia" },
  { label: "Playfair Display", value: "Playfair Display" },
];

const BUTTON_ANIMATIONS = [
  { label: "Aucune", value: "none" },
  { label: "Pulse", value: "pulse" },
  { label: "Rebond", value: "bounce" },
];

const SORT_OPTIONS = [
  { label: "Les plus récents en premier", desc: "Présentez vos nouveautés", value: "recent", icon: Sparkles },
  { label: "Ordre alphabétique", desc: "Produits dans l'ordre alphabétique", value: "alphabetical", icon: ArrowUpDown },
  { label: "Les plus cher en premier", desc: "Valorisez vos produits haut de gamme", value: "price_desc", icon: ArrowUpDown },
  { label: "Moins cher en premier", desc: "Priorisez vos produits les plus abordables", value: "price_asc", icon: ArrowUpDown },
];

interface RealProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  type: string;
  description: string | null;
}

const DashboardAppearanceTab = () => {
  const { user, profile } = useAuth();
  const { stores, activeStore, activeStoreId, setActiveStoreId, updateStore, isLoading, hasStores } = useActiveStore();

  const [brandColor, setBrandColor] = useState("#2563EB");
  const [font, setFont] = useState("Inter");
  const [buttonAnimation, setButtonAnimation] = useState("none");
  const [showBuyButton, setShowBuyButton] = useState(true);
  const [sortOrder, setSortOrder] = useState("recent");
  const [saving, setSaving] = useState(false);
  const [realProducts, setRealProducts] = useState<RealProduct[]>([]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (activeStore) {
      setBrandColor(activeStore.brand_color || "#2563EB");
      setFont(activeStore.font || "Inter");
      setButtonAnimation(activeStore.button_animation || "none");
      setShowBuyButton(activeStore.show_buy_button ?? true);
      setSortOrder(activeStore.sort_order || "recent");
      setBannerUrl(activeStore.banner_url || null);
    }
  }, [activeStore]);

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, title, price, original_price, thumbnail_url, type, description")
      .eq("creator_id", user!.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (data) setRealProducts(data as RealProduct[]);
  };

  const handleSave = async () => {
    if (!user || !activeStoreId) return;
    setSaving(true);
    try {
      await updateStore.mutateAsync({
        brand_color: brandColor, font,
        button_animation: buttonAnimation,
        show_buy_button: showBuyButton,
        sort_order: sortOrder, banner_url: bannerUrl,
      } as any);

      await supabase.from("profiles").update({
        store_brand_color: brandColor, store_font: font,
        store_button_animation: buttonAnimation,
        store_show_buy_button: showBuyButton,
        store_sort_order: sortOrder, store_banner_url: bannerUrl,
        updated_at: new Date().toISOString(),
      } as any).eq("id", user.id);

      toast.success("Apparence sauvegardée !");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const handleReset = () => {
    setBrandColor("#2563EB"); setFont("Inter"); setButtonAnimation("none");
    setShowBuyButton(true); setSortOrder("recent"); setBannerUrl(null);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingBanner(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/banner-${activeStoreId}.${ext}`;
    const { error } = await supabase.storage.from("product-assets").upload(path, file, { upsert: true });
    if (error) { toast.error("Erreur lors de l'upload"); setUploadingBanner(false); return; }
    const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
    setBannerUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploadingBanner(false);
    toast.success("Bannière uploadée !");
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-10 bg-muted rounded w-48" /><div className="h-32 bg-muted rounded" /></div>;
  }

  if (!hasStores) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/50">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Aucune boutique</p>
            <p className="text-xs text-muted-foreground">Créez votre première boutique dans l'onglet <a href="/dashboard/stores" className="text-primary hover:underline">Mes Boutiques</a>.</p>
          </div>
        </div>
      </div>
    );
  }

  const storeSlug = activeStore?.slug;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Settings */}
      <div className="flex-1 max-w-2xl space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <StoreSelector stores={stores} activeStoreId={activeStoreId} onSelect={setActiveStoreId} />
          {storeSlug && (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" /> Voir ma boutique
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Réinitialiser
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>

        {/* Banner */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Bannière de la boutique</p>
              <p className="text-xs text-muted-foreground">Image affichée en haut (recommandé : 1200×400)</p>
            </div>
          </div>
          {bannerUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={bannerUrl} alt="Bannière" className="w-full aspect-[3/1] object-cover" />
              <button onClick={() => setBannerUrl(null)}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 cursor-pointer transition-colors bg-secondary/30">
              {uploadingBanner ? <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" /> : (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span className="text-xs text-muted-foreground">Cliquez pour uploader une bannière</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="sr-only" disabled={uploadingBanner} />
            </label>
          )}
        </div>

        {/* Brand Color */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Paintbrush className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Couleur de votre marque</p>
              <p className="text-xs text-muted-foreground">Utilisée pour les boutons, prix et accents</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {BRAND_COLORS.map((c) => (
              <button key={c.value} onClick={() => setBrandColor(c.value)}
                className={cn("h-10 w-10 rounded-full transition-all ring-2 ring-offset-2 ring-offset-background",
                  brandColor === c.value ? "ring-foreground scale-110" : "ring-transparent hover:scale-105"
                )} style={{ backgroundColor: c.value }} />
            ))}
            <label className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors">
              <Paintbrush className="h-4 w-4 text-muted-foreground" />
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="sr-only" />
            </label>
          </div>
        </div>

        {/* Font */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="h-4 w-4 text-muted-foreground" /> <p className="text-sm font-semibold text-foreground">Police d'écriture</p>
          </div>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Button Animation */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MousePointerClick className="h-4 w-4 text-muted-foreground" /> <p className="text-sm font-semibold text-foreground">Animation du bouton d'achat</p>
          </div>
          <Select value={buttonAnimation} onValueChange={setButtonAnimation}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUTTON_ANIMATIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">Options d'affichage</p>
          <ToggleOption icon={ShoppingCart} label="Afficher le bouton d'achat" desc="Bouton « Acheter » visible sur chaque carte produit" checked={showBuyButton} onChange={setShowBuyButton} />
        </div>

        {/* Sort Order */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">Ordre d'affichage</p>
          <div className="space-y-2">
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setSortOrder(opt.value)}
                className={cn("w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left",
                  sortOrder === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                )}>
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <opt.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                {sortOrder === opt.value && (
                  <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: brandColor }}>
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="hidden lg:block w-[420px] shrink-0">
        <div className="sticky top-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-muted px-3 py-2 text-[10px] text-muted-foreground truncate border-b border-border flex items-center gap-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-destructive/50" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <div className="h-2 w-2 rounded-full bg-green-500/50" />
              </div>
              <span>{storeSlug ? `https://dukaio.com/store/${storeSlug}` : "votre-boutique.dukaio.app"}</span>
            </div>
            <div className="h-[650px] overflow-y-auto">
              <StorePreview
                storeName={activeStore?.name || profile?.display_name || "Ma Boutique"}
                storeDescription={activeStore?.description || ""}
                logoUrl={activeStore?.logo_url || profile?.avatar_url || ""}
                brandColor={brandColor}
                font={font}
                showBuyButton={showBuyButton}
                products={realProducts}
                bannerUrl={bannerUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ToggleOption({ icon: Icon, label, desc, checked, onChange }: {
  icon: any; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <Switch checked={checked} onCheckedChange={onChange} />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function StorePreview({ storeName, storeDescription, logoUrl, brandColor, font, showBuyButton, products, bannerUrl }: {
  storeName: string; storeDescription: string; logoUrl: string; brandColor: string; font: string; showBuyButton: boolean; products: RealProduct[]; bannerUrl: string | null;
}) {
  const displayProducts = products.length > 0 ? products : [
    { id: "1", title: "Exemple de produit", price: 5000, original_price: 8000, thumbnail_url: null, type: "file", description: null },
    { id: "2", title: "Autre produit", price: 3000, original_price: null, thumbnail_url: null, type: "course", description: null },
  ];

  return (
    <div style={{ fontFamily: font }} className="bg-white min-h-full text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md flex items-center justify-center text-[8px] font-bold text-white overflow-hidden" style={{ backgroundColor: brandColor }}>
            {logoUrl ? <img src={logoUrl} className="h-full w-full object-cover" /> : storeName.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-gray-900 text-[10px]">{storeName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-medium text-gray-900" style={{ borderBottom: `1px solid ${brandColor}` }}>Produits</span>
          <span className="text-[8px] text-gray-400">À propos</span>
          <span className="text-[8px] text-gray-400">Contact</span>
        </div>
      </div>

      {/* Title */}
      <div className="px-3 pt-4 pb-1">
        <p className="text-[10px] font-bold text-gray-900">{`Découvrez les produits de ${storeName}`}</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="h-5 rounded-md border border-gray-200 bg-gray-50 flex items-center px-2">
          <span className="text-[7px] text-gray-400">🔍 Rechercher…</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-3 pb-4 grid grid-cols-2 gap-3">
        {displayProducts.slice(0, 6).map((p) => {
          const disc = p.original_price && p.original_price > p.price
            ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : null;
          return (
            <div key={p.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
              <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-gray-200" />
                )}
                {disc && (
                  <span className="absolute top-1 right-1 text-[6px] font-bold px-1 py-0.5 rounded-full text-white" style={{ backgroundColor: brandColor }}>
                    {disc}% OFF
                  </span>
                )}
              </div>
              <div className="p-1.5 space-y-0.5">
                <p className="text-[8px] font-semibold text-gray-900 line-clamp-2">{p.title}</p>
                <p className="text-[7px] text-gray-400">0% (0 avis)</p>
                <div className="flex items-baseline gap-1">
                  {p.original_price && p.original_price > p.price && (
                    <span className="text-[6px] line-through text-gray-300">{p.original_price.toLocaleString()}</span>
                  )}
                  <span className="text-[8px] font-bold" style={{ color: brandColor }}>{p.price.toLocaleString()} FCFA</span>
                </div>
                {showBuyButton && (
                  <button className="w-full text-[7px] text-white py-1 font-medium rounded-md" style={{ backgroundColor: brandColor }}>
                    Acheter
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-2 text-center">
        <span className="text-[7px] text-gray-300">Propulsé par <span className="font-medium" style={{ color: brandColor }}>Dukaio</span></span>
      </div>
    </div>
  );
}

export default DashboardAppearanceTab;
