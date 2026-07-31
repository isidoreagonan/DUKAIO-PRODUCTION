import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, RotateCcw, Save, Paintbrush, Type, RectangleHorizontal, MousePointerClick, LayoutGrid, ArrowUpDown, Star, ShoppingCart, Sparkles, Check, Package, ShoppingBag, ImagePlus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const BRAND_COLORS = [
  { name: "Jaune", value: "#EAB308" },
  { name: "Émeraude", value: "#10B981" },
  { name: "Orange", value: "#F97316" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Rose", value: "#EC4899" },
  { name: "Bleu", value: "#3B82F6" },
];

const FONTS = [
  { label: "Inter", value: "Inter" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Georgia", value: "Georgia" },
  { label: "Playfair Display", value: "Playfair Display" },
];

const BUTTON_ANIMATIONS = [
  { label: "Aucune", value: "none" },
  { label: "Secouer", value: "shake" },
  { label: "Pulse", value: "pulse" },
  { label: "Rebond", value: "bounce" },
];

const SORT_OPTIONS = [
  { label: "Ordre alphabétique", desc: "Vos clients verront les produits dans l'ordre alphabétique", value: "alphabetical", icon: ArrowUpDown },
  { label: "Les plus vendus en premier", desc: "Mettez en avant vos meilleures ventes pour rassurer les acheteurs", value: "best_sellers", icon: Star },
  { label: "Les plus récents en premier", desc: "Présentez vos nouveautés pour stimuler l'intérêt", value: "recent", icon: Sparkles },
  { label: "Les plus cher en premier", desc: "Valorisez vos produits haut de gamme en priorité", value: "price_desc", icon: ArrowUpDown },
  { label: "Moins cher en premier", desc: "Priorisez vos produits les plus abordables", value: "price_asc", icon: ArrowUpDown },
];

const THEMES = [
  { id: "feed", label: "Feed", desc: "Style réseau social, une colonne avec grandes cartes", image: "/images/theme-feed.png" },
  { id: "minimal", label: "Minimal", desc: "Ultra minimaliste, épuré et élégant", image: "/images/theme-minimal.png" },
  { id: "magazine", label: "Magazine", desc: "Éditorial avec produit vedette et grille mixte", image: "/images/theme-magazine.png" },
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

const DashboardAppearance = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [theme, setTheme] = useState("feed");
  const [brandColor, setBrandColor] = useState("#6366F1");
  const [font, setFont] = useState("Inter");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [buttonAnimation, setButtonAnimation] = useState("none");
  const [showFeatured, setShowFeatured] = useState(true);
  const [showBuyButton, setShowBuyButton] = useState(true);
  const [showRecommended, setShowRecommended] = useState(true);
  const [productLayout, setProductLayout] = useState("grid-2");
  const [sortOrder, setSortOrder] = useState("recent");
  const [saving, setSaving] = useState(false);
  const [realProducts, setRealProducts] = useState<RealProduct[]>([]);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadSettings();
    loadProducts();
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

  const loadSettings = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    if (data) {
      const d = data as any;
      setTheme(d.store_theme || "feed");
      setBrandColor(d.store_brand_color || "#6366F1");
      setFont(d.store_font || "Inter");
      setCornerStyle(d.store_corner_style || "rounded");
      setButtonAnimation(d.store_button_animation || "none");
      setShowFeatured(d.store_show_featured ?? true);
      setShowBuyButton(d.store_show_buy_button ?? true);
      setShowRecommended(d.store_show_recommended ?? true);
      setProductLayout(d.store_product_layout || "grid-2");
      setSortOrder(d.store_sort_order || "recent");
      setBannerUrl(d.store_banner_url || null);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      store_theme: theme,
      store_brand_color: brandColor,
      store_font: font,
      store_corner_style: cornerStyle,
      store_button_animation: buttonAnimation,
      store_show_featured: showFeatured,
      store_show_buy_button: showBuyButton,
      store_show_recommended: showRecommended,
      store_product_layout: productLayout,
      store_sort_order: sortOrder,
      store_banner_url: bannerUrl,
      updated_at: new Date().toISOString(),
    } as any).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Apparence sauvegardée !");
      refreshProfile();
    }
  };

  const handleReset = () => {
    setTheme("feed");
    setBrandColor("#6366F1");
    setFont("Inter");
    setCornerStyle("rounded");
    setButtonAnimation("none");
    setShowFeatured(true);
    setShowBuyButton(true);
    setShowRecommended(true);
    setProductLayout("grid-2");
    setSortOrder("recent");
    setBannerUrl(null);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingBanner(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/banner.${ext}`;
    const { error } = await supabase.storage.from("product-assets").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erreur lors de l'upload de la bannière");
      setUploadingBanner(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
    setBannerUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploadingBanner(false);
    toast.success("Bannière uploadée !");
  };

  const handleRemoveBanner = () => {
    setBannerUrl(null);
  };

  const storeSlug = profile?.store_slug;

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left: Settings Panel */}
        <div className="flex-1 max-w-2xl space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Paramètres de l'apparence</h1>
              <p className="text-sm text-muted-foreground mt-1">Personnalisez le look de votre boutique</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {storeSlug && (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                  Voir ma boutique
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
            <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>

          {/* Theme Selection with images */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              Thème de la boutique
            </div>
            <div className="grid grid-cols-3 gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-2 transition-all text-left overflow-hidden",
                    theme === t.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-secondary">
                    <img
                      src={t.image}
                      alt={`Thème ${t.label}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="px-1 pb-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{t.label}</span>
                      {theme === t.id && (
                        <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Banner Upload */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ImagePlus className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">Bannière de la boutique</p>
                <p className="text-xs text-muted-foreground">Image affichée en haut de votre boutique (recommandé : 1200×400)</p>
              </div>
            </div>
            {bannerUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={bannerUrl} alt="Bannière" className="w-full aspect-[3/1] object-cover" />
                <button
                  onClick={handleRemoveBanner}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/1] rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 cursor-pointer transition-colors bg-secondary/30">
                {uploadingBanner ? (
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                ) : (
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
                <p className="text-xs text-muted-foreground">La couleur principale de votre boutique</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {BRAND_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setBrandColor(c.value)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all ring-2 ring-offset-2 ring-offset-background",
                    brandColor === c.value ? "ring-foreground scale-110" : "ring-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c.value }}
                />
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
              <Type className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Police d'écriture</p>
            </div>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Corner Style */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <RectangleHorizontal className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Style des coins</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "rounded", label: "Arrondi" },
                { id: "square", label: "Carré" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCornerStyle(s.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-4 transition-all",
                    cornerStyle === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className={cn("aspect-video bg-secondary border border-border mb-3", s.id === "rounded" ? "rounded-xl" : "rounded-none")} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                    {cornerStyle === s.id && (
                      <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Button Animation */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Animation du bouton d'achat</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={buttonAnimation} onValueChange={setButtonAnimation}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUTTON_ANIMATIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline" size="sm"
                className={cn(
                  "gap-2",
                  buttonAnimation === "pulse" && "animate-pulse",
                  buttonAnimation === "bounce" && "animate-bounce"
                )}
              >
                <Eye className="h-4 w-4" /> Aperçu
              </Button>
            </div>
          </div>

          {/* Page Organization */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Organisation de la page</p>
            </div>
            <div className="space-y-3">
              <ToggleOption icon={Star} label="Afficher les produits en vedette" desc="Mettez en avant vos produits phares" checked={showFeatured} onChange={setShowFeatured} />
              <ToggleOption icon={ShoppingCart} label="Afficher le bouton d'achat" desc="Faciliter l'achat immédiat depuis la liste" checked={showBuyButton} onChange={setShowBuyButton} />
              <ToggleOption icon={Sparkles} label="Afficher les produits recommandés" desc="Augmentez vos ventes avec des suggestions" checked={showRecommended} onChange={setShowRecommended} />
            </div>
          </div>

          {/* Product Layout */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm font-semibold text-foreground">Disposition des produits</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "grid-1", label: "Un par ligne" },
                { id: "grid-2", label: "Deux par ligne" },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setProductLayout(l.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-4 transition-all",
                    productLayout === l.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className="aspect-video bg-secondary border border-border rounded-lg mb-3 flex items-center justify-center gap-2 p-3">
                    {l.id === "grid-1" ? (
                      <div className="w-full h-full rounded bg-muted-foreground/10" />
                    ) : (
                      <>
                        <div className="flex-1 h-full rounded bg-muted-foreground/10" />
                        <div className="flex-1 h-full rounded bg-muted-foreground/10" />
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{l.label}</span>
                    {productLayout === l.id && (
                      <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm font-semibold text-foreground">Ordre d'affichage</p>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortOrder(opt.value)}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left",
                    sortOrder === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                  )}
                >
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

        {/* Right: Live Preview with REAL data */}
        <div className="hidden lg:block w-[420px] shrink-0">
          <div className="sticky top-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-muted px-3 py-2 text-[10px] text-muted-foreground truncate border-b border-border flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-destructive/50" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                  <div className="h-2 w-2 rounded-full bg-green-500/50" />
                </div>
                <span>{storeSlug ? `${window.location.origin}/store/${storeSlug}` : "votre-boutique.dukaio.app"}</span>
              </div>
              <div className="h-[650px] overflow-y-auto">
                <RealStorePreview
                  theme={theme}
                  storeName={profile?.display_name || "Ma Boutique"}
                  storeDescription={(profile as any)?.store_description || ""}
                  avatarUrl={profile?.avatar_url || ""}
                  brandColor={brandColor}
                  font={font}
                  cornerStyle={cornerStyle}
                  buttonAnimation={buttonAnimation}
                  showBuyButton={showBuyButton}
                  productLayout={productLayout}
                  products={realProducts}
                  bannerUrl={bannerUrl}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
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

function RealStorePreview({ theme, storeName, storeDescription, avatarUrl, brandColor, font, cornerStyle, buttonAnimation, showBuyButton, productLayout, products, bannerUrl }: {
  theme: string; storeName: string; storeDescription: string; avatarUrl: string; brandColor: string; font: string; cornerStyle: string; buttonAnimation: string; showBuyButton: boolean; productLayout: string; products: RealProduct[]; bannerUrl: string | null;
}) {
  const radius = cornerStyle === "rounded" ? "rounded-lg" : "rounded-none";
  const cols = productLayout === "grid-1" ? "grid-cols-1" : "grid-cols-2";
  const displayProducts = products.length > 0 ? products : [
    { id: "1", title: "Ajoutez un produit", price: 0, original_price: null, thumbnail_url: null, type: "file", description: null },
  ];

  return (
    <div style={{ fontFamily: font }} className="bg-background min-h-full text-foreground">
      {/* Mini Header */}
      <div className="border-b border-border px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white overflow-hidden" style={{ backgroundColor: brandColor }}>
            {avatarUrl ? <img src={avatarUrl} className="h-full w-full object-cover" /> : storeName.charAt(0).toUpperCase()}
          </div>
          <span className={cn("font-bold text-foreground", theme === "minimal" ? "text-xs tracking-tight" : "text-[10px]")}>{storeName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-medium text-foreground" style={{ borderBottom: `1px solid ${brandColor}` }}>Produits</span>
          <span className="text-[8px] text-muted-foreground">À propos</span>
        </div>
      </div>

      {/* Banner */}
      {bannerUrl && (
        <div className="aspect-[3/1] overflow-hidden">
          <img src={bannerUrl} alt="Bannière" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Hero - varies by theme */}
      {theme === "minimal" ? (
        <div className="px-3 py-6 text-center">
          <p className="text-sm font-light tracking-tight text-foreground">{storeName}</p>
          {storeDescription && <p className="text-[8px] text-muted-foreground mt-1">{storeDescription}</p>}
        </div>
      ) : theme === "magazine" ? null : (
        <div className="px-3 py-3">
          <p className="text-[10px] font-bold text-foreground">{storeDescription || `Bienvenue chez ${storeName}`}</p>
        </div>
      )}

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="h-5 rounded-md border border-border bg-secondary flex items-center px-2">
          <span className="text-[7px] text-muted-foreground">🔍 Rechercher...</span>
        </div>
      </div>

      {/* Products - rendered per theme */}
      {theme === "feed" ? (
        <div className="px-3 pb-4 space-y-3">
          {displayProducts.slice(0, 4).map((p) => (
            <div key={p.id} className={cn("border border-border bg-card overflow-hidden", radius)}>
              <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/20" />
                )}
              </div>
              <div className="p-2 space-y-1">
                <p className="text-[9px] font-bold text-foreground" style={{ fontFamily: font }}>{p.title}</p>
                {p.description && <p className="text-[7px] text-muted-foreground line-clamp-1">{p.description}</p>}
                <p className="text-[9px] font-bold" style={{ color: brandColor }}>{p.price > 0 ? `${p.price} FCFA` : "—"}</p>
                {showBuyButton && p.price > 0 && (
                  <button
                    className={cn(
                      "w-full text-[7px] text-white py-1 font-medium",
                      cornerStyle === "rounded" ? "rounded-md" : "rounded-none",
                      buttonAnimation === "pulse" && "animate-pulse",
                      buttonAnimation === "bounce" && "animate-bounce",
                    )}
                    style={{ backgroundColor: brandColor }}
                  >
                    Acheter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : theme === "magazine" ? (
        <div className="px-3 pb-4">
          {/* Hero product */}
          {displayProducts[0] && (
            <div className={cn("relative overflow-hidden mb-3", radius)}>
              <div className="aspect-[16/7] bg-secondary relative">
                {displayProducts[0].thumbnail_url ? (
                  <img src={displayProducts[0].thumbnail_url} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}10` }}>
                    <Package className="h-10 w-10 text-muted-foreground/15" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-[10px] font-extrabold text-white">{displayProducts[0].title}</p>
                  <p className="text-[8px] font-bold text-white/90">{displayProducts[0].price > 0 ? `${displayProducts[0].price} FCFA` : ""}</p>
                </div>
              </div>
            </div>
          )}
          {/* Grid */}
          <div className="grid grid-cols-2 gap-2">
            {displayProducts.slice(1, 5).map((p, i) => (
              <div key={p.id} className={cn("border border-border bg-card overflow-hidden", radius, i === 0 && "col-span-2")}>
                <div className={cn("bg-secondary flex items-center justify-center", i === 0 ? "aspect-[2/1]" : "aspect-square")}>
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="p-1.5">
                  <p className="text-[8px] font-semibold text-foreground line-clamp-1">{p.title}</p>
                  <p className="text-[8px] font-bold" style={{ color: brandColor }}>{p.price > 0 ? `${p.price} FCFA` : "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Minimal */
        <div className={cn("px-3 pb-4 grid gap-4", cols)}>
          {displayProducts.slice(0, 6).map((p) => (
            <div key={p.id} className="group">
              <div className={cn("aspect-square bg-secondary/50 mb-2 overflow-hidden flex items-center justify-center", radius)}>
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground/15" />
                )}
              </div>
              <p className="text-[8px] font-medium text-foreground">{p.title}</p>
              <p className="text-[8px]" style={{ color: brandColor }}>{p.price > 0 ? `${p.price} FCFA` : "—"}</p>
              {showBuyButton && p.price > 0 && (
                <button className="text-[7px] underline underline-offset-2 mt-0.5" style={{ color: brandColor }}>
                  Acheter →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border py-2 text-center">
        <span className="text-[7px] text-muted-foreground">Propulsé par <span className="text-primary font-medium">Dukaio</span></span>
      </div>
    </div>
  );
}

interface RealProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  type: string;
  description: string | null;
}

export default DashboardAppearance;
