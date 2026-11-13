import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Music2,
  BarChart3,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Play,
  ShieldCheck,
  Eye,
  ShoppingCart,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import {
  initTrackingPixels,
  trackEvent,
} from "@/hooks/useTrackingPixels";

// Clean pixel strings pasted by users (strips quotes, scripts, whitespace, prefixes)
function sanitizePixelId(val: string): string {
  if (!val) return "";
  let clean = val.trim();
  // Strip quotes
  clean = clean.replace(/['"`]/g, "");
  // If user pasted full fbq('init', '12345') or similar script snippet, extract ID
  const matchFb = clean.match(/(?:init|load)\s*\(?\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
  if (matchFb && matchFb[1]) {
    clean = matchFb[1];
  }
  return clean.trim();
}

const DashboardPixelsTab = () => {
  const { user, refreshProfile } = useAuth();
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("facebook_pixel_id, tiktok_pixel_id, google_ads_id")
        .eq("id", user.id)
        .single();
      if (data) {
        const d = data as any;
        setFacebookPixelId(d.facebook_pixel_id || "");
        setTiktokPixelId(d.tiktok_pixel_id || "");
        setGoogleAdsId(d.google_ads_id || "");
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const fbClean = sanitizePixelId(facebookPixelId);
    const ttClean = sanitizePixelId(tiktokPixelId);
    const gaClean = sanitizePixelId(googleAdsId);

    // Validation
    if (fbClean && !/^[0-9]{8,24}$/.test(fbClean)) {
      toast.error("L'ID du pixel Facebook doit contenir uniquement entre 8 et 24 chiffres (ex: 123456789012345).");
      setSaving(false);
      return;
    }

    if (ttClean && !/^[a-zA-Z0-9_-]{8,32}$/.test(ttClean)) {
      toast.error("Format de l'ID TikTok Pixel invalide (ex: C1234567890ABCDEFGH).");
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          facebook_pixel_id: fbClean || null,
          tiktok_pixel_id: ttClean || null,
          google_ads_id: gaClean || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      if (error) throw error;

      setFacebookPixelId(fbClean);
      setTiktokPixelId(ttClean);
      setGoogleAdsId(gaClean);

      toast.success("Vos pixels et outils de tracking ont été enregistrés avec succès !");
      if (refreshProfile) refreshProfile();
    } catch (err: any) {
      toast.error("Erreur lors de la sauvegarde : " + (err.message || "Veuillez réessayer"));
    } finally {
      setSaving(false);
    }
  };

  const handleTestPixels = () => {
    const fbClean = sanitizePixelId(facebookPixelId);
    const ttClean = sanitizePixelId(tiktokPixelId);
    const gaClean = sanitizePixelId(googleAdsId);

    if (!fbClean && !ttClean && !gaClean) {
      toast.error("Veuillez renseigner au moins un ID de pixel avant de lancer le test.");
      return;
    }

    setTesting(true);

    // 1. Initialize with current form values
    initTrackingPixels({
      facebookPixelId: fbClean || null,
      tiktokPixelId: ttClean || null,
      googleAdsId: gaClean || null,
    });

    // 2. Dispatch simulated events
    trackEvent("PageView");
    trackEvent("ViewContent", {
      content_name: "Test Produit Dukaio",
      content_ids: ["test-product-001"],
      content_type: "product",
      value: 15000,
      currency: "XOF",
    });

    setTimeout(() => {
      setTesting(false);
      toast.success(
        "Événements de test (PageView & ViewContent) envoyés ! Ouvrez l'extension Meta Pixel Helper ou TikTok Pixel Helper pour vérifier la réception.",
        { duration: 6000 }
      );
    }, 800);
  };

  const hasAnyPixel = Boolean(facebookPixelId.trim() || tiktokPixelId.trim() || googleAdsId.trim());

  return (
    <div className="max-w-3xl space-y-8">
      {/* Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50 via-white to-amber-50/40 p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Tracking & Pixels Publicitaires</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Connectez vos pixels Meta (Facebook & Instagram), TikTok Ads et Google Ads pour mesurer vos conversions, optimiser vos publicités et tracker automatiquement vos ventes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestPixels}
              disabled={testing || !hasAnyPixel}
              className="gap-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs"
            >
              <Play className={`h-3.5 w-3.5 text-orange-500 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Test en cours..." : "Tester en direct"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tracked Events Funnel Preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Événements suivis automatiquement sur votre boutique
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Tunnel complet
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Eye className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">PageView</p>
              <p className="text-[11px] text-slate-500">Visite de la boutique & fiches</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">ViewContent</p>
              <p className="text-[11px] text-slate-500">Affichage d'un produit</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <ShoppingCart className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">AddToCart</p>
              <p className="text-[11px] text-slate-500">Clic sur « Acheter »</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <CreditCard className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">InitiateCheckout</p>
              <p className="text-[11px] text-slate-500">Arrivée sur la caisse</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <CreditCard className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">AddPaymentInfo</p>
              <p className="text-[11px] text-slate-500">Moyen de paiement choisi</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Purchase</p>
              <p className="text-[11px] text-emerald-700">Achat validé avec montant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pixels Inputs */}
      <div className="space-y-5">
        {/* Facebook / Meta Pixel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                <Facebook className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Facebook & Instagram Pixel</h3>
                  {facebookPixelId.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      Non configuré
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Trackez vos conversions de vos publicités Facebook, Instagram et Meta Ads Manager.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
              Pixel ID (15-16 chiffres)
            </label>
            <Input
              value={facebookPixelId}
              onChange={(e) => setFacebookPixelId(e.target.value)}
              placeholder="Ex: 849204918293019"
              className="font-mono text-sm bg-slate-50 focus:bg-white"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-slate-500">
              <span>
                Trouvez votre Pixel ID dans le{" "}
                <a
                  href="https://business.facebook.com/events_manager2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  Gestionnaire d'événements Meta <ExternalLink className="h-3 w-3 inline" />
                </a>
              </span>
              <a
                href="https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                Installer Meta Pixel Helper (Chrome) →
              </a>
            </div>
          </div>
        </div>

        {/* TikTok Pixel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Music2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">TikTok Pixel</h3>
                  {tiktokPixelId.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      Non configuré
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Optimisez vos campagnes TikTok Ads avec le tracking en temps réel des ajouts au panier et paiements.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
              Pixel ID TikTok
            </label>
            <Input
              value={tiktokPixelId}
              onChange={(e) => setTiktokPixelId(e.target.value)}
              placeholder="Ex: C1234567890ABCDEFGH"
              className="font-mono text-sm bg-slate-50 focus:bg-white"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-slate-500">
              <span>
                Trouvez votre ID dans{" "}
                <a
                  href="https://ads.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  TikTok Ads Manager → Assets → Events <ExternalLink className="h-3 w-3 inline" />
                </a>
              </span>
              <a
                href="https://chromewebstore.google.com/detail/tiktok-pixel-helper/aelgobmabdflignfbgajdaia обрести"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                Installer TikTok Pixel Helper →
              </a>
            </div>
          </div>
        </div>

        {/* Google Ads (gtag) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Google Ads & Google Analytics</h3>
                  {googleAdsId.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      Non configuré
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Mesurez le ROI de vos annonces Google Ads (Search, Shopping, Display, YouTube).
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
              ID de suivi / Conversion (AW- ou G-)
            </label>
            <Input
              value={googleAdsId}
              onChange={(e) => setGoogleAdsId(e.target.value)}
              placeholder="Ex: AW-982103912 ou G-ABC123DEF4"
              className="font-mono text-sm bg-slate-50 focus:bg-white"
            />
            <p className="text-xs text-slate-500 mt-2">
              Trouvez votre identifiant dans{" "}
              <a
                href="https://ads.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                Google Ads → Outils & Paramètres → Conversions <ExternalLink className="h-3 w-3 inline" />
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500">
          Les modifications prennent effet immédiatement sur tous vos liens de boutique et produits.
        </p>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer les pixels"}
        </Button>
      </div>
    </div>
  );
};

export default DashboardPixelsTab;
