import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { getStoreUrl } from "@/lib/subdomain";

// Icons for pixel providers
function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.89 2.895 2.895 0 0 1-2.892-2.89 2.895 2.895 0 0 1 2.892-2.892c.31 0 .607.051.884.144V9.421a6.305 6.305 0 0 0-.884-.063A6.338 6.338 0 0 0 3.045 15.68a6.338 6.338 0 0 0 6.337 6.338 6.338 6.338 0 0 0 6.338-6.338V8.375a8.23 8.23 0 0 0 5.069 1.748V6.686h-1.2z" />
    </svg>
  );
}

function SnapchatIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div className="grid h-5 w-5 place-items-center rounded-full bg-[#FFFC00] text-black">
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.003 2c-3.518 0-6.003 2.584-6.003 5.753 0 1.05.284 2.122.569 2.955-.548.243-1.428.69-1.428 1.547 0 .53.376.993.945 1.157-.156.495-.515 1.705-1.573 2.08-.288.102-.456.326-.456.6 0 .54.72.766 1.487.892.427.07.895.122 1.38.16.29.986 1.182 1.954 2.766 2.454.437.137.955.228 1.536.273.19.015.352.023.48.023.13 0 .29-.008.482-.023.58-.045 1.1-.136 1.536-.273 1.583-.5 2.475-1.468 2.766-2.454.484-.038.953-.09 1.38-.16.767-.126 1.487-.352 1.487-.892 0-.274-.168-.498-.456-.6-1.058-.375-1.417-1.585-1.573-2.08.57-.164.945-.627.945-1.157 0-.857-.88-1.304-1.428-1.547.285-.833.569-1.905.569-2.955C18.006 4.584 15.521 2 12.003 2z" />
      </svg>
    </div>
  );
}

function GtmIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#4285F4">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function JsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div className="grid h-5 w-5 place-items-center rounded bg-[#F7DF1E] font-black text-[10px] text-black">
      JS
    </div>
  );
}

export default function DashboardSettingsPixels() {
  const { user, refreshProfile } = useAuth();
  const { activeStore } = useActiveStore();

  // Toggles
  const [fbEnabled, setFbEnabled] = useState(false);
  const [fbPixelId, setFbPixelId] = useState("");
  const [fbCapiToken, setFbCapiToken] = useState("");
  const [showCapiToken, setShowCapiToken] = useState(false);

  const [ttEnabled, setTtEnabled] = useState(false);
  const [ttPixelId, setTtPixelId] = useState("");

  const [snapEnabled, setSnapEnabled] = useState(false);
  const [snapPixelId, setSnapPixelId] = useState("");

  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [gtmId, setGtmId] = useState("");

  const [jsEnabled, setJsEnabled] = useState(false);
  const [customJs, setCustomJs] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("facebook_pixel_id, facebook_capi_token, tiktok_pixel_id, google_ads_id, theme_config")
          .eq("id", user.id)
          .maybeSingle();

        if (prof) {
          const p = prof as any;
          const confPixels = p.theme_config?.pixels || {};

          setFbPixelId(p.facebook_pixel_id || confPixels.facebook_pixel_id || "");
          setFbCapiToken(p.facebook_capi_token || confPixels.facebook_capi_token || "");
          setFbEnabled(Boolean(p.facebook_pixel_id || confPixels.facebook_enabled));

          setTtPixelId(p.tiktok_pixel_id || confPixels.tiktok_pixel_id || "");
          setTtEnabled(Boolean(p.tiktok_pixel_id || confPixels.tiktok_enabled));

          setSnapPixelId(confPixels.snapchat_pixel_id || "");
          setSnapEnabled(Boolean(confPixels.snapchat_enabled || confPixels.snapchat_pixel_id));

          setGtmId(confPixels.gtm_id || p.google_ads_id || "");
          setGtmEnabled(Boolean(confPixels.gtm_enabled || confPixels.gtm_id || p.google_ads_id));

          setCustomJs(confPixels.custom_js || "");
          setJsEnabled(Boolean(confPixels.custom_js_enabled || confPixels.custom_js));
        }
      } catch (err) {
        console.error("Error loading pixel config:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const cleanFb = fbEnabled ? fbPixelId.trim().replace(/['"`]/g, "") : "";
    const cleanFbCapi = fbEnabled ? fbCapiToken.trim() : "";
    const cleanTt = ttEnabled ? ttPixelId.trim().replace(/['"`]/g, "") : "";
    const cleanSnap = snapEnabled ? snapPixelId.trim().replace(/['"`]/g, "") : "";
    const cleanGtm = gtmEnabled ? gtmId.trim().replace(/['"`]/g, "") : "";
    const cleanJs = jsEnabled ? customJs.trim() : "";

    // Validation
    if (cleanFb && !/^[0-9]{8,24}$/.test(cleanFb)) {
      toast.error("L'ID Pixel Facebook doit contenir uniquement entre 8 et 24 chiffres.");
      setSaving(false);
      return;
    }

    try {
      // 1. Fetch current theme_config
      const { data: currentProf } = await supabase
        .from("profiles")
        .select("theme_config")
        .eq("id", user.id)
        .maybeSingle();

      const existingConfig = (currentProf as any)?.theme_config || {};
      const updatedConfig = {
        ...existingConfig,
        pixels: {
          facebook_enabled: fbEnabled,
          facebook_pixel_id: cleanFb,
          facebook_capi_token: cleanFbCapi,
          tiktok_enabled: ttEnabled,
          tiktok_pixel_id: cleanTt,
          snapchat_enabled: snapEnabled,
          snapchat_pixel_id: cleanSnap,
          gtm_enabled: gtmEnabled,
          gtm_id: cleanGtm,
          custom_js_enabled: jsEnabled,
          custom_js: cleanJs,
        },
      };

      // 2. Update profile
      const { error: profError } = await supabase
        .from("profiles")
        .update({
          facebook_pixel_id: cleanFb || null,
          facebook_capi_token: cleanFbCapi || null,
          tiktok_pixel_id: cleanTt || null,
          google_ads_id: cleanGtm || null,
          theme_config: updatedConfig,
        } as any)
        .eq("id", user.id);

      if (profError) throw profError;

      // 3. Update store if exists
      if (activeStore?.id) {
        await supabase
          .from("stores")
          .update({
            theme_config: updatedConfig,
          } as any)
          .eq("id", activeStore.id);
      }

      await refreshProfile();
      toast.success("Pixels et scripts de suivi enregistrés avec succès !");
    } catch (err: any) {
      console.error("Save pixels error:", err);
      toast.error(err.message || "Erreur lors de l'enregistrement des pixels.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Top Header with Back button */}
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
                Pixels et Tracking
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Connectez vos pixels publicitaires pour mesurer vos conversions et votre retour sur investissement.
              </p>
            </div>
          </div>

          {activeStore?.slug && (
            <a
              href={getStoreUrl(activeStore.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visiter ma boutique
            </a>
          )}
        </div>

        {/* 2-Column Layout matching Capture 2 */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.8fr] lg:items-start">
          {/* Left Column: Title & Description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Pixels</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ajoutez des pixels de suivi comme Facebook Pixel, Google Tag Manager, TikTok Pixel et du code JavaScript personnalisé pour surveiller les performances de votre boutique.
            </p>

            <button
              type="button"
              onClick={() => setShowHelp((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              En savoir plus
            </button>

            {showHelp && (
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs space-y-2 text-muted-foreground">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary" /> Guide rapide :
                </p>
                <p>
                  <strong>Pixel Facebook :</strong> Permet de suivre les événements <code>PageView</code>, <code>ViewContent</code>, <code>InitiateCheckout</code> et <code>Purchase</code> automatiquement sur votre boutique.
                </p>
                <p>
                  <strong>Jeton CAPI (Conversions API) :</strong> Garantit 100% de suivi des achats côté serveur, même pour les visiteurs utilisant des bloqueurs de publicité (AdBlock) ou iOS 14+.
                </p>
                <p>
                  <strong>TikTok & Snapchat :</strong> Suivez les conversions générées par vos campagnes TikTok Ads et Snapchat Ads.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Cards & Controls */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-6">
              {/* 1. Facebook Pixel */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                      <FacebookIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Pixel Facebook</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Ajoutez votre ID Pixel Facebook pour suivre le trafic de votre boutique
                      </p>
                    </div>
                  </div>
                  <Switch checked={fbEnabled} onCheckedChange={setFbEnabled} />
                </div>

                {fbEnabled && (
                  <div className="space-y-3 pl-12 pt-1 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        ID Pixel Facebook
                      </label>
                      <Input
                        value={fbPixelId}
                        onChange={(e) => setFbPixelId(e.target.value)}
                        placeholder="Ex: 2021795638635981"
                        className="h-10 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label className="block text-xs font-semibold text-foreground">
                          Jeton d'API de Conversion Facebook (CAPI)
                        </label>
                        <span className="text-[10px] text-muted-foreground">Optionnel mais recommandé</span>
                      </div>
                      <div className="relative">
                        <Input
                          type={showCapiToken ? "text" : "password"}
                          value={fbCapiToken}
                          onChange={(e) => setFbCapiToken(e.target.value)}
                          placeholder="EAA..."
                          className="h-10 text-xs font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCapiToken((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showCapiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Générez votre jeton dans Meta Events Manager &gt; Paramètres &gt; API de conversions.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60" />

              {/* 2. TikTok Pixel */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-foreground dark:bg-slate-800">
                      <TikTokIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Pixel TikTok</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Ajoutez votre ID Pixel TikTok pour suivre le trafic et les conversions de votre boutique
                      </p>
                    </div>
                  </div>
                  <Switch checked={ttEnabled} onCheckedChange={setTtEnabled} />
                </div>

                {ttEnabled && (
                  <div className="space-y-3 pl-12 pt-1 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        ID Pixel TikTok
                      </label>
                      <Input
                        value={ttPixelId}
                        onChange={(e) => setTtPixelId(e.target.value)}
                        placeholder="Ex: C1234567890ABCDEFGH"
                        className="h-10 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60" />

              {/* 3. Snapchat Pixel */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-yellow-50 dark:bg-yellow-950/30">
                      <SnapchatIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Pixel Snapchat</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Ajoutez votre ID Pixel Snapchat pour suivre le trafic et les conversions de votre boutique
                      </p>
                    </div>
                  </div>
                  <Switch checked={snapEnabled} onCheckedChange={setSnapEnabled} />
                </div>

                {snapEnabled && (
                  <div className="space-y-3 pl-12 pt-1 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        ID Pixel Snapchat
                      </label>
                      <Input
                        value={snapPixelId}
                        onChange={(e) => setSnapPixelId(e.target.value)}
                        placeholder="Ex: 12345678-abcd-1234-efgh-1234567890ab"
                        className="h-10 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60" />

              {/* 4. Google Tag Manager */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                      <GtmIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">ID Google Tag Manager</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Ajoutez votre ID Google Tag Manager pour suivre le trafic de votre boutique
                      </p>
                    </div>
                  </div>
                  <Switch checked={gtmEnabled} onCheckedChange={setGtmEnabled} />
                </div>

                {gtmEnabled && (
                  <div className="space-y-3 pl-12 pt-1 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        ID Google Tag Manager
                      </label>
                      <Input
                        value={gtmId}
                        onChange={(e) => setGtmId(e.target.value)}
                        placeholder="Ex: GTM-XXXXXXX ou AW-123456789"
                        className="h-10 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60" />

              {/* 5. Custom JavaScript Code */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
                      <JsIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Code JavaScript personnalisé</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Ajoutez du code JavaScript personnalisé à votre boutique pour suivre les événements de conversion et améliorer l'expérience client.
                      </p>
                    </div>
                  </div>
                  <Switch checked={jsEnabled} onCheckedChange={setJsEnabled} />
                </div>

                {jsEnabled && (
                  <div className="space-y-3 pl-12 pt-1 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Script JavaScript (balise &lt;script&gt; ou code JS pur)
                      </label>
                      <Textarea
                        value={customJs}
                        onChange={(e) => setCustomJs(e.target.value)}
                        placeholder="<!-- Collez votre snippet ici -->"
                        rows={4}
                        className="font-mono text-xs"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Ce code sera exécuté de manière sécurisée lors du chargement de votre boutique.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
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
    </DashboardLayout>
  );
}

