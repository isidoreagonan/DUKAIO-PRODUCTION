import { useEffect, useRef, useState, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  Download,
  ExternalLink,
  Redo2,
  RotateCcw,
  Save,
  Settings2,
  Smartphone,
  Undo2,
  Upload,
  Sparkles,
  Loader2,
  Store,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EditorPanels, panelTitles, type EditorPanelId } from "@/components/editor/EditorPanels";
import { LivePreview, type PreviewDevice } from "@/components/editor/LivePreview";
import {
  createEditorHistory,
  defaultShopConfig,
  editorReducer,
  normalizeShopConfig,
  SHOP_STORAGE_KEY,
  type ShopConfig,
} from "@/lib/shopConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getStoreUrl } from "@/lib/subdomain";
import type { StorefrontProduct } from "@/components/store/StorefrontView";
import { Button } from "@/components/ui/button";

const panelOrder: EditorPanelId[] = ["content", "hero", "products", "appearance", "sections", "seo"];

export default function DashboardStoreEditor() {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();

  const [history, dispatch] = useReducer(editorReducer, undefined, () => createEditorHistory());
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [savedConfig, setSavedConfig] = useState(defaultShopConfig);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const importInput = useRef<HTMLInputElement>(null);

  const config = history.present;
  const dirty = JSON.stringify(config) !== JSON.stringify(savedConfig);

  useEffect(() => {
    if (!user) return;
    const loadStore = async () => {
      try {
        let loadedConfig: ShopConfig | null = null;
        let storeId = activeStore?.id;

        let storeData: any = null;
        if (storeId) {
          const { data } = await supabase.from("stores").select("*").eq("id", storeId).maybeSingle();
          storeData = data;
        } else {
          const { data } = await supabase.from("stores").select("*").eq("owner_id", user.id).eq("is_archived", false).maybeSingle();
          storeData = data;
        }

        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

        if (storeData?.theme_config) {
          loadedConfig = normalizeShopConfig(storeData.theme_config);
        } else if ((prof as any)?.theme_config) {
          loadedConfig = normalizeShopConfig((prof as any).theme_config);
        } else {
          loadedConfig = normalizeShopConfig({
            name: storeData?.name || (prof as any)?.display_name || "DUKAIO",
            slug: storeData?.slug || (prof as any)?.store_slug || "boutique",
            description: storeData?.description || (prof as any)?.store_description || defaultShopConfig.description,
            logo: storeData?.logo_url || (prof as any)?.store_logo_url || null,
            hero: {
              title: storeData?.name || (prof as any)?.display_name || "DUKAIO",
              height: "regular",
            },
          });
        }

        dispatch({ type: "replace", config: loadedConfig });
        setSavedConfig(loadedConfig);

        const ownerId = storeData?.owner_id || user.id;
        const { data: prods } = await supabase
          .from("products")
          .select("id, title, price, original_price, thumbnail_url, type, sales_count, category")
          .eq("creator_id", ownerId)
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (prods && prods.length > 0) {
          setProducts(prods as StorefrontProduct[]);
        }
      } catch (err) {
        console.error("Error loading store:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [user, activeStore?.id]);

  // Warn before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // Keyboard shortcuts: Ctrl+Z (Undo), Ctrl+Shift+Z / Ctrl+Y (Redo), Ctrl+S (Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a textarea or text input for standard typing, except for Ctrl+S
      const isInput = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);

      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          handleSave();
        } else if (!isInput && e.key.toLowerCase() === "z" && !e.shiftKey) {
          if (history.past.length > 0) {
            e.preventDefault();
            dispatch({ type: "undo" });
          }
        } else if (!isInput && ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y")) {
          if (history.future.length > 0) {
            e.preventDefault();
            dispatch({ type: "redo" });
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, dirty, config]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (activeStore?.id) {
        await supabase
          .from("stores")
          .update({
            theme_config: config as any,
            name: config.name,
            description: config.description,
            logo_url: config.logo || undefined,
            updated_at: new Date().toISOString(),
          } as any)
          .eq("id", activeStore.id);
      }

      await supabase
        .from("profiles")
        .update({
          theme_config: config as any,
          store_description: config.description,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      setSavedConfig(config);
      toast.success("Boutique enregistrée avec succès !");
    } catch (err: any) {
      toast.error("Erreur d'enregistrement : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const scrollToPanel = (panel: EditorPanelId) => {
    const el = document.getElementById(`reglages-${panel}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dukaio-${config.slug || "boutique"}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier exporté avec succès !");
  };

  const importConfig = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const next = normalizeShopConfig(json);
        dispatch({ type: "edit", config: next });
        toast.success("Configuration importée ! N'oubliez pas d'enregistrer.");
      } catch {
        toast.error("Fichier JSON invalide.");
      }
    };
    reader.readAsText(file);
  };

  const resetConfig = () => {
    if (confirm("Réinitialiser l'apparence par défaut ?")) {
      dispatch({ type: "edit", config: defaultShopConfig });
      toast.info("Thème réinitialisé.");
    }
  };

  const storeSlug = activeStore?.slug || config.slug || "boutique";
  const liveStoreUrl = getStoreUrl(storeSlug);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 w-full">
        {/* ─── HEADER BAR ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Boutique</h1>
              {dirty ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Modifications non enregistrées
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  À jour
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Personnalisez le design de votre boutique et visualisez vos changements en temps réel
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo / Redo */}
            <div className="flex rounded-lg border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => dispatch({ type: "undo" })}
                disabled={history.past.length === 0}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors"
                title="Annuler (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "redo" })}
                disabled={history.future.length === 0}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors"
                title="Rétablir (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            {/* View store link */}
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={liveStoreUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Voir ma boutique</span>
              </a>
            </Button>

            {/* Save Button */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-2 font-bold bg-[#18181B] dark:bg-primary text-white hover:bg-black shadow-xs"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
            </Button>
          </div>
        </div>

        {/* ─── MOBILE VIEW TOGGLE (Switch between edit panels and live preview) ─── */}
        <div className="flex items-center justify-center xl:hidden">
          <div className="grid w-full max-w-xs grid-cols-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setView("edit")}
              className={`flex h-8 items-center justify-center gap-2 rounded-md text-xs font-semibold ${
                view === "edit" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" /> Personnalisation
            </button>
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`flex h-8 items-center justify-center gap-2 rounded-md text-xs font-semibold ${
                view === "preview" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Aperçu direct
            </button>
          </div>
        </div>

        {/* ─── TWO-COLUMN WORKSPACE: EDITOR LEFT / LIVE PREVIEW RIGHT ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_520px] 2xl:grid-cols-[minmax(0,1fr)_620px] gap-6 items-start">
          {/* Left Column: Editor Panels */}
          <div className={`${view === "edit" ? "block" : "hidden"} xl:block space-y-8`}>
            {panelOrder.map((panel, index) => (
              <section key={panel} id={`reglages-${panel}`} className="scroll-mt-6">
                <div className="mb-3 flex items-start gap-3">
                  <span className="mt-0.5 w-6 shrink-0 font-mono text-[12px] font-bold text-orange-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground">
                      {panelTitles[panel].title}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{panelTitles[panel].description}</p>
                  </div>
                </div>
                <EditorPanels
                  config={config}
                  onChange={(next) => dispatch({ type: "edit", config: next })}
                  onNavigate={scrollToPanel}
                  activePanel={panel}
                />
              </section>
            ))}

            {/* Bottom Actions: Import/Export JSON */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  ref={importInput}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => importConfig(event.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => importInput.current?.click()}
                  className="gap-1.5 text-xs"
                >
                  <Upload className="h-3.5 w-3.5" /> Importer JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportConfig}
                  className="gap-1.5 text-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Exporter JSON
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetConfig}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
              </Button>
            </div>
          </div>

          {/* Right Column: Live Preview Device Frame */}
          <div
            className={`${
              view === "preview" ? "block" : "hidden"
            } xl:block sticky top-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden h-[740px] flex flex-col`}
          >
            <LivePreview
              config={config}
              device={device}
              onDeviceChange={setDevice}
              products={products}
              liveStoreUrl={liveStoreUrl}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
