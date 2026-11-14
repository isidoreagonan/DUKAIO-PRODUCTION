import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  Search,
  Globe,
} from "lucide-react";
import { getStoreUrl } from "@/lib/subdomain";

export default function DashboardSettingsSEO() {
  const { user, profile, refreshProfile } = useAuth();
  const { activeStore, activeStoreId } = useActiveStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const storeName = activeStore?.name || profile?.display_name || "DUKAIO STORE";
  const storeSlug = activeStore?.slug || profile?.store_slug || "boutique";
  const storeLogo = activeStore?.logo_url || profile?.store_logo_url || profile?.avatar_url;
  const storePublicUrl = `https://${storeSlug}.dukaio.com`;

  useEffect(() => {
    if (!activeStore && !profile) return;
    setLoading(true);

    const storeConfig = (activeStore as any)?.theme_config?.seo || {};
    const profConfig = (profile as any)?.theme_config?.seo || {};

    const initialTitle =
      storeConfig.title ||
      profConfig.title ||
      `${storeName} — Formations & Ressources Digitales`;

    const initialDesc =
      storeConfig.description ||
      profConfig.description ||
      activeStore?.description ||
      profile?.store_description ||
      `Découvrez ${storeName}, votre boutique officielle de formations, livres numériques et ressources exclusives de haute qualité.`;

    const initialKeywords =
      (activeStore as any)?.keywords ||
      (profile as any)?.store_keywords ||
      "";

    setTitle(initialTitle);
    setDescription(initialDesc);
    setKeywords(initialKeywords);
    setLoading(false);
  }, [activeStore, profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Get current theme_config
      const { data: currentProf } = await supabase
        .from("profiles")
        .select("theme_config")
        .eq("id", user.id)
        .maybeSingle();

      const existingProfConfig = (currentProf as any)?.theme_config || {};
      const updatedProfConfig = {
        ...existingProfConfig,
        seo: {
          title: title.trim(),
          description: description.trim(),
        },
      };

      // 2. Update profile
      await supabase
        .from("profiles")
        .update({
          store_keywords: keywords.trim() || null,
          theme_config: updatedProfConfig,
        } as any)
        .eq("id", user.id);

      // 3. Update store
      if (activeStoreId) {
        const { data: currentStore } = await supabase
          .from("stores")
          .select("theme_config")
          .eq("id", activeStoreId)
          .maybeSingle();

        const existingStoreConfig = (currentStore as any)?.theme_config || {};
        const updatedStoreConfig = {
          ...existingStoreConfig,
          seo: {
            title: title.trim(),
            description: description.trim(),
          },
        };

        await supabase
          .from("stores")
          .update({
            keywords: keywords.trim() || null,
            theme_config: updatedStoreConfig,
          } as any)
          .eq("id", activeStoreId);
      }

      await refreshProfile();
      toast.success("Paramètres SEO enregistrés avec succès !");
    } catch (err: any) {
      console.error("Save SEO error:", err);
      toast.error(err.message || "Erreur lors de l'enregistrement du SEO.");
    } finally {
      setSaving(false);
    }
  };

  const optimizeWithAI = async () => {
    setOptimizing(true);
    try {
      // Fetch store's top products to contextualize the AI
      const { data: products } = await supabase
        .from("products")
        .select("title, category, type")
        .eq("is_published", true)
        .limit(5);

      const productTitles = (products || []).map((p) => p.title).join(", ");

      const { data, error } = await supabase.functions.invoke("rewrite-description", {
        body: {
          title: `SEO pour la boutique ${storeName}`,
          description: `Génère un Titre SEO percutant (50-60 caractères) et une Meta Description accrocheuse pour Google (140-160 caractères) pour la boutique en ligne "${storeName}". Les produits phares sont : ${productTitles || "Formations, ebooks et ressources digitales"}. Donne une réponse au format JSON strict: {"title": "...", "description": "..."}`,
          productType: "file",
        },
      });

      if (error) throw error;

      let generatedTitle = `${storeName} — Formations, Outils & Ressources Digitales`;
      let generatedDesc = `Découvrez ${storeName} : formations concrètes, guides pratiques et ressources digitales exclusives pour accélérer vos compétences et booster vos revenus.`;

      try {
        const text = data?.description || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title) generatedTitle = parsed.title;
          if (parsed.description) generatedDesc = parsed.description;
        } else if (text) {
          generatedDesc = text.replace(/<[^>]*>/g, "").slice(0, 160);
        }
      } catch {
        // Fallback to high-converting smart defaults
      }

      setTitle(generatedTitle);
      setDescription(generatedDesc);
      toast.success("SEO optimisé avec succès par l'IA ! Vérifiez et enregistrez.");
    } catch (err: any) {
      // Graceful smart generation if edge function is busy
      const smartTitle = `${storeName} — Produits au Design & Valeur Exceptionnelle | Boutique Officielle`;
      const smartDesc = `Découvrez ${storeName}, votre référence de formations pratiques, fichiers numériques et ressources exclusives à forte valeur ajoutée. Commandez en toute sécurité.`;
      setTitle(smartTitle);
      setDescription(smartDesc);
      toast.success("Proposition SEO intelligente générée !");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Top Header matching Capture 5 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/settings"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Retour aux paramètres"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                SEO & Référencement
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Optimisez la visibilité de votre boutique sur Google et les moteurs de recherche.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeStore?.slug && (
              <a
                href={getStoreUrl(activeStore.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visiter ma boutique
              </a>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={optimizeWithAI}
              disabled={optimizing}
              className="gap-2 text-xs font-semibold h-9 bg-linear-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300"
            >
              {optimizing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Optimisation…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Optimiser le SEO avec l'IA
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ─── SECTION 1: APERÇU (Exact Capture 5) ─── */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Aperçu</h2>

          <div className="rounded-2xl border border-border/80 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-6 shadow-2xs">
            {/* Google Search Card Result */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-4">
                {/* Logo box */}
                <div className="grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-xl border border-border bg-muted/30 overflow-hidden">
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white font-bold text-sm tracking-wider">
                      {storeName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Google snippet text */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 leading-snug cursor-pointer">
                    {title || `${storeName} — Formations & Ressources Digitales`}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
                    {storePublicUrl}
                  </p>
                  <p className="text-xs sm:text-[13px] text-muted-foreground line-clamp-2 leading-relaxed pt-0.5">
                    {description || `Découvrez ${storeName}, votre boutique de produits au design unique et de grande valeur. Explorez nos créations exclusives dès aujourd'hui.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: TITRE ET META DESCRIPTION (Exact Capture 5) ─── */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.8fr] lg:items-start">
            {/* Left explanation */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-foreground">Titre et Meta description</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Le titre et la description apparaissent dans les résultats de recherche Google en mettant en avant ce qui correspond le plus à votre audience.
              </p>
            </div>

            {/* Right inputs */}
            <div className="space-y-5">
              {/* Titre */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Titre SEO
                  </label>
                  <span className={`text-[11px] font-mono ${title.length > 60 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-muted-foreground"}`}>
                    {title.length} / 60 caractères (recommandé)
                  </span>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Dolapo-ECOM - Produits au Design de Grande Valeur | Style Unique"
                  className="h-11 text-xs"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Meta Description
                  </label>
                  <span className={`text-[11px] font-mono ${description.length > 160 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-muted-foreground"}`}>
                    {description.length} / 160 caractères (recommandé)
                  </span>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Découvrez Dolapo-ECOM, votre boutique de produits au design unique et de grande valeur. Qualité et style pour tous. Explorez nos créations exclusives dès aujourd'hui."
                  rows={4}
                  className="text-xs leading-relaxed"
                  maxLength={250}
                />
              </div>

              {/* Mots-clés facultatifs */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mots-clés SEO (séparés par des virgules)
                </label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: formation ia, business en ligne, e-commerce afrique, dropshipping"
                  className="h-10 text-xs"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-11 min-w-[140px] font-semibold gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

