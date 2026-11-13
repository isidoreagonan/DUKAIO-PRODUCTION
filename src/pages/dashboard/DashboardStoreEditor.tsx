import { useEffect, useRef, useState, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
} from "lucide-react";
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

const panelOrder: EditorPanelId[] = ["content", "hero", "products", "appearance", "sections", "seo"];

export default function DashboardStoreEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeStore } = useActiveStore();

  const [history, dispatch] = useReducer(editorReducer, undefined, () => createEditorHistory());
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [savedConfig, setSavedConfig] = useState(defaultShopConfig);
  const [saveNotice, setSaveNotice] = useState("Prêt");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const importInput = useRef<HTMLInputElement>(null);

  const config = history.present;
  const dirty = JSON.stringify(config) !== JSON.stringify(savedConfig);

  // Load store configuration from Supabase
  useEffect(() => {
    if (!user) return;
    const loadStore = async () => {
      try {
        let loadedConfig: ShopConfig | null = null;
        let storeId = activeStore?.id;

        // 1. Fetch store from DB
        let storeData: any = null;
        if (storeId) {
          const { data } = await supabase.from("stores").select("*").eq("id", storeId).maybeSingle();
          storeData = data;
        } else {
          const { data } = await supabase.from("stores").select("*").eq("owner_id", user.id).eq("is_archived", false).maybeSingle();
          storeData = data;
        }

        // 2. Fetch profile
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

        if (storeData?.theme_config) {
          loadedConfig = normalizeShopConfig(storeData.theme_config);
        } else if ((prof as any)?.theme_config) {
          loadedConfig = normalizeShopConfig((prof as any).theme_config);
        } else {
          // Initialize defaults from existing store/profile data
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

        // 3. Fetch real products for live preview
        const ownerId = storeData?.owner_id || user.id;
        const { data: prods } = await supabase
          .from("products")
          .select("id, title, price, original_price, thumbnail_url, type, sales_count")
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

  // Save changes to Supabase
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Update store if exists
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

      // 2. Update profile
      await supabase
        .from("profiles")
        .update({
          theme_config: config as any,
          store_description: config.description,
          store_logo_url: config.logo || undefined,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      // 3. Update localStorage fallback
      try {
        localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(config));
      } catch {}

      setSavedConfig(config);
      setSaveNotice("Tous les changements sont enregistrés");
      toast.success("Boutique personnalisée et enregistrée avec succès !");
    } catch (err: any) {
      toast.error("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSave();
      }
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Warn before unload if unsaved
  useEffect(() => {
    function warnUnsaved(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnUnsaved);
    return () => window.removeEventListener("beforeunload", warnUnsaved);
  }, [dirty]);

  function scrollToPanel(panel: EditorPanelId) {
    setView("edit");
    window.requestAnimationFrame(() => {
      document.getElementById(`reglages-${panel}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${config.slug || "boutique"}-style.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Configuration exportée en fichier JSON !");
  }

  function importConfig(file?: File) {
    if (!file) return;
    void file.text().then((text) => {
      try {
        const imported = normalizeShopConfig(JSON.parse(text));
        dispatch({ type: "edit", config: imported });
        toast.info("Configuration importée — n'oubliez pas d'enregistrer.");
      } catch {
        toast.error("Ce fichier JSON n'est pas valide.");
      }
    });
  }

  function resetConfig() {
    if (!window.confirm("Réinitialiser tous les réglages de la boutique par défaut ?")) return;
    dispatch({ type: "edit", config: defaultShopConfig });
    toast.info("Réglages réinitialisés — pensez à enregistrer.");
  }

  const liveStoreUrl = getStoreUrl(config.slug || activeStore?.slug || "boutique");

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Chargement du studio boutique…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── STUDIO HEADER ─── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/settings?tab=appearance")}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              title="Retour aux paramètres"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-500 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold flex items-center gap-2">
                  Studio Boutique
                  <span className="hidden sm:inline-block text-xs font-normal text-muted-foreground">
                    ({config.name})
                  </span>
                </h1>
                <p
                  className={`mt-0.5 hidden truncate text-[11px] sm:block ${
                    dirty ? "text-orange-600 font-semibold" : "text-muted-foreground"
                  }`}
                  aria-live="polite"
                >
                  {dirty ? "● Modifications non enregistrées" : saveNotice}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Undo / Redo */}
            <div className="mr-1 hidden items-center rounded-lg border border-border p-0.5 sm:flex">
              <button
                type="button"
                aria-label="Annuler"
                title="Annuler (Ctrl+Z)"
                disabled={!history.past.length}
                onClick={() => dispatch({ type: "undo" })}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Rétablir"
                title="Rétablir (Ctrl+Shift+Z)"
                disabled={!history.future.length}
                onClick={() => dispatch({ type: "redo" })}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            {/* Export JSON */}
            <button
              type="button"
              aria-label="Exporter la configuration"
              title="Exporter le design en fichier JSON"
              onClick={exportConfig}
              className="hidden h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground md:grid"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Live Store Link */}
            <a
              href={liveStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Voir ma boutique"
              title="Ouvrir ma vraie boutique"
              className="hidden h-9 items-center gap-1.5 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground lg:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Voir en direct</span>
            </a>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-9 items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-4 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Enregistrer</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex items-center justify-center border-t border-border px-4 py-2 xl:hidden">
          <div className="grid w-full max-w-xs grid-cols-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setView("edit")}
              className={`flex h-8 items-center justify-center gap-2 rounded-md text-xs font-semibold ${
                view === "edit" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" /> Réglages
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
      </header>

      {/* ─── STUDIO MAIN BODY (TWO COLUMNS FULLSCREEN) ─── */}
      <div className="flex-1 grid xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_540px]">
        {/* Left Side: Editor Panels */}
        <main className={`${view === "edit" ? "block" : "hidden"} xl:block overflow-y-auto`}>
          <div className="mx-auto max-w-[820px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-8 border-b border-border pb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                Personnalisation Complète
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-[28px]">
                Design & Structure de la Boutique
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Tous les réglages de votre boutique sont regroupés ici. Modifiez librement les couleurs, polices,
                textes et sections : l’aperçu à droite se met à jour en temps réel.
              </p>
            </div>

            <div className="space-y-12">
              {panelOrder.map((panel, index) => (
                <section key={panel} id={`reglages-${panel}`} aria-labelledby={`titre-${panel}`} className="scroll-mt-24">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="mt-0.5 w-6 shrink-0 font-mono text-[12px] font-bold text-orange-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h2 id={`titre-${panel}`} className="text-lg font-bold tracking-tight">
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
            </div>

            {/* Bottom Tools */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 pb-12">
              <div className="flex items-center gap-2">
                <input
                  ref={importInput}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => importConfig(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => importInput.current?.click()}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted"
                >
                  <Upload className="h-3.5 w-3.5" /> Importer JSON
                </button>
                <button
                  type="button"
                  onClick={exportConfig}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" /> Exporter JSON
                </button>
              </div>
              <button
                type="button"
                onClick={resetConfig}
                className="flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser par défaut
              </button>
            </div>
          </div>
        </main>

        {/* Right Side: Sticky Live Preview Device Frame */}
        <aside
          className={`${
            view === "preview" ? "block" : "hidden"
          } h-[calc(100vh-112px)] xl:sticky xl:top-16 xl:block xl:h-[calc(100vh-64px)] xl:border-l xl:border-border`}
        >
          <LivePreview
            config={config}
            device={device}
            onDeviceChange={setDevice}
            products={products}
            liveStoreUrl={liveStoreUrl}
          />
        </aside>
      </div>

      {dirty && (
        <span className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-orange-200 bg-white/95 px-4 py-2 text-xs font-semibold text-orange-700 shadow-lg backdrop-blur-md xl:hidden">
          <Check className="h-3.5 w-3.5 text-orange-600" /> Aperçu mis à jour
        </span>
      )}
    </div>
  );
}
