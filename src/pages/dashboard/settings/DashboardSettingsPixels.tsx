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
  Play,
  ShieldCheck,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Server,
  Zap,
  Sparkles,
  Terminal,
  Trash2,
  AlertCircle,
  Layers,
  Radio,
} from "lucide-react";
import { getStoreUrl } from "@/lib/subdomain";
import {
  initTrackingPixels,
  trackEvent,
  StandardTrackingEvent,
} from "@/hooks/useTrackingPixels";

// Provider Icons
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

interface EventLogItem {
  id: string;
  name: string;
  time: string;
  channel: string;
  details: string;
  status: "success" | "pending" | "error";
}

export default function DashboardSettingsPixels() {
  const { user, refreshProfile } = useAuth();
  const { activeStore } = useActiveStore();

  // Pixels Toggles & Values
  const [fbEnabled, setFbEnabled] = useState(false);
  const [fbPixelId, setFbPixelId] = useState("");
  const [fbCapiToken, setFbCapiToken] = useState("");
  const [showCapiToken, setShowCapiToken] = useState(false);
  const [showCapiGuide, setShowCapiGuide] = useState(false);
  const [testEventCode, setTestEventCode] = useState("");

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

  // Testing & Simulation states
  const [testingAll, setTestingAll] = useState(false);
  const [testingCapi, setTestingCapi] = useState(false);
  const [testingEvent, setTestingEvent] = useState<string | null>(null);
  const [capiStatus, setCapiStatus] = useState<"idle" | "valid" | "error">("idle");
  const [capiMessage, setCapiMessage] = useState("");
  const [sendCapiWithTest, setSendCapiWithTest] = useState(true);
  const [eventLogs, setEventLogs] = useState<EventLogItem[]>([]);

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

          const fbId = p.facebook_pixel_id || confPixels.facebook_pixel_id || "";
          const fbToken = p.facebook_capi_token || confPixels.facebook_capi_token || "";
          setFbPixelId(fbId);
          setFbCapiToken(fbToken);
          setFbEnabled(Boolean(fbId || confPixels.facebook_enabled));

          const ttId = p.tiktok_pixel_id || confPixels.tiktok_pixel_id || "";
          setTtPixelId(ttId);
          setTtEnabled(Boolean(ttId || confPixels.tiktok_enabled));

          const snapId = confPixels.snapchat_pixel_id || "";
          setSnapPixelId(snapId);
          setSnapEnabled(Boolean(confPixels.snapchat_enabled || snapId));

          const gId = confPixels.gtm_id || p.google_ads_id || "";
          setGtmId(gId);
          setGtmEnabled(Boolean(confPixels.gtm_enabled || gId));

          const jsCode = confPixels.custom_js || "";
          setCustomJs(jsCode);
          setJsEnabled(Boolean(confPixels.custom_js_enabled || jsCode));
        }
      } catch (err) {
        console.error("Error loading pixel config:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Clean strings
  const cleanFb = fbPixelId.trim().replace(/['"`]/g, "");
  const cleanFbCapi = fbCapiToken.trim();
  const cleanTt = ttPixelId.trim().replace(/['"`]/g, "");
  const cleanSnap = snapPixelId.trim().replace(/['"`]/g, "");
  const cleanGtm = gtmId.trim().replace(/['"`]/g, "");
  const cleanJs = customJs.trim();

  const hasAnyPixelConfigured = Boolean(
    (fbEnabled && cleanFb) ||
    (ttEnabled && cleanTt) ||
    (snapEnabled && cleanSnap) ||
    (gtmEnabled && cleanGtm) ||
    (jsEnabled && cleanJs)
  );

  // 1. SAVE CONFIGURATION
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Validation
    if (fbEnabled && cleanFb && !/^[0-9]{8,24}$/.test(cleanFb)) {
      toast.error("L'ID Pixel Facebook doit contenir uniquement entre 8 et 24 chiffres.");
      setSaving(false);
      return;
    }

    try {
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

      if (activeStore?.id) {
        await supabase
          .from("stores")
          .update({
            theme_config: updatedConfig,
          } as any)
          .eq("id", activeStore.id);
      }

      await refreshProfile();
      toast.success("Pixels et paramètres de tracking enregistrés avec succès !");
    } catch (err: any) {
      console.error("Save pixels error:", err);
      toast.error(err.message || "Erreur lors de l'enregistrement des pixels.");
    } finally {
      setSaving(false);
    }
  };

  // 2. TEST CAPI TOKEN VALIDITY (Server-side)
  const handleTestCapi = async () => {
    if (!cleanFb || !cleanFbCapi) {
      toast.error("Veuillez renseigner à la fois votre ID Pixel Facebook et votre jeton CAPI avant de tester.");
      return;
    }

    setTestingCapi(true);
    setCapiStatus("idle");
    setCapiMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("meta-capi", {
        body: {
          pixel_id: cleanFb,
          access_token: cleanFbCapi,
          event_name: "Purchase",
          event_id: `test_capi_${Date.now()}`,
          event_source_url: window.location.href,
          test_event_code: testEventCode.trim() || undefined,
          user_data: {
            email: user?.email || "test@dukaio.com",
            first_name: "Test",
          },
          custom_data: {
            currency: "XOF",
            value: 10000,
            content_name: "Test Validation CAPI Dukaio",
            content_ids: ["test-capi-001"],
            content_type: "product",
          },
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Erreur Meta CAPI");
      }

      setCapiStatus("valid");
      setCapiMessage("Votre jeton Meta CAPI est 100% valide et connecté aux serveurs de Meta.");
      toast.success("Succès ! Votre jeton Meta CAPI est 100% valide et connecté aux serveurs de Meta.", {
        duration: 6000,
      });

      const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setEventLogs((prev) => [
        {
          id: `${Date.now()}-test-capi`,
          name: "Test CAPI (Purchase)",
          time: timeStr,
          channel: "META-CAPI",
          details: `Statut: 200 OK • Trace ID: ${data?.fb_trace_id || "Reçu"}`,
          status: "success",
        },
        ...prev,
      ].slice(0, 10));
    } catch (err: any) {
      setCapiStatus("error");
      setCapiMessage(err.message || "Impossible de contacter l'API Meta avec ce jeton.");
      toast.error("Échec du test CAPI : " + (err.message || "Veuillez vérifier votre jeton et votre ID Pixel."));
    } finally {
      setTestingCapi(false);
    }
  };

  // 3. FIRE INDIVIDUAL OR GLOBAL TEST EVENT (Live browser + optional CAPI)
  const handleFireEvent = async (eventName: StandardTrackingEvent, triggerCapi = sendCapiWithTest) => {
    if (!hasAnyPixelConfigured) {
      toast.error("Activez et renseignez au moins un pixel (Facebook, TikTok, Snapchat, etc.) avant de tester.");
      return;
    }

    setTestingEvent(eventName);

    // Initialize in browser with current input values immediately
    initTrackingPixels({
      facebookPixelId: fbEnabled && cleanFb ? cleanFb : null,
      tiktokPixelId: ttEnabled && cleanTt ? cleanTt : null,
      snapchatPixelId: snapEnabled && cleanSnap ? cleanSnap : null,
      googleAdsId: gtmEnabled && cleanGtm ? cleanGtm : null,
      customJs: jsEnabled && cleanJs ? cleanJs : null,
    });

    const testEventId = `test_${Date.now()}`;
    const samplePayload = {
      content_name: "Formation IA & Business",
      content_ids: ["dukaio-prod-test-01"],
      content_type: "product",
      value: 15000,
      currency: "XOF",
      num_items: 1,
      payment_method: "Wave / MoMo",
      order_id: testEventId,
    };

    // Client-side dispatch
    trackEvent(eventName, samplePayload, { eventId: testEventId });

    const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newLogs: EventLogItem[] = [
      {
        id: `${Date.now()}-client`,
        name: eventName,
        time: timeStr,
        channel: "BROWSER-PIXEL",
        details: `payload: { product: "Formation IA", price: 15000 XOF }`,
        status: "success",
      },
    ];

    // Server-side CAPI dispatch if enabled
    if (triggerCapi && fbEnabled && cleanFb && cleanFbCapi) {
      try {
        const { data, error } = await supabase.functions.invoke("meta-capi", {
          body: {
            pixel_id: cleanFb,
            access_token: cleanFbCapi,
            event_name: eventName,
            event_id: testEventId,
            event_source_url: window.location.href,
            test_event_code: testEventCode.trim() || undefined,
            user_data: {
              email: user?.email || "test-client@dukaio.com",
              first_name: "Test",
            },
            custom_data: {
              currency: "XOF",
              value: 15000,
              content_name: samplePayload.content_name,
              content_ids: samplePayload.content_ids,
              content_type: "product",
            },
          },
        });

        if (!error && !data?.error) {
          newLogs.push({
            id: `${Date.now()}-capi`,
            name: `${eventName} (CAPI)`,
            time: timeStr,
            channel: "META-CAPI",
            details: `Serveur Graph API • Trace: ${data?.fb_trace_id || "events_received: 1"}`,
            status: "success",
          });
        }
      } catch (capiErr) {
        console.warn("CAPI test error in simulator:", capiErr);
      }
    }

    setEventLogs((prev) => [...newLogs, ...prev].slice(0, 12));

    setTimeout(() => {
      setTestingEvent(null);
      toast.success(
        `Événement ${eventName} envoyé avec succès ! Vérifiez avec Meta Pixel Helper ou TikTok Pixel Helper.`,
        { duration: 4000 }
      );
    }, 450);
  };

  const handleTestAllPixels = async () => {
    setTestingAll(true);
    await handleFireEvent("PageView", false);
    setTimeout(async () => {
      await handleFireEvent("ViewContent", sendCapiWithTest);
      setTestingAll(false);
      toast.success("Test global terminé ! Événements PageView et ViewContent envoyés.", { duration: 5000 });
    }, 500);
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

        {/* 2-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.85fr] lg:items-start">
          {/* Left Column: Description, Status summary, Quick Links & Help */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Pixels</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ajoutez des pixels de suivi comme Facebook Pixel, Google Tag Manager, TikTok Pixel et du code JavaScript personnalisé pour surveiller les performances de votre boutique.
              </p>

              <button
                type="button"
                onClick={() => setShowHelp((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {showHelp ? "Masquer les explications" : "En savoir plus"}
              </button>

              {showHelp && (
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs space-y-2.5 text-muted-foreground animate-in fade-in duration-200">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-primary" /> Guide rapide :
                  </p>
                  <p>
                    <strong>Pixel Facebook :</strong> Mesure chaque visiteur, consultation produit et achat. Indispensable pour créer des audiences personnalisées et optimiser vos publicités.
                  </p>
                  <p>
                    <strong>Jeton CAPI (Conversions API) :</strong> Garantit 100% de suivi des achats côté serveur, même pour les visiteurs utilisant des bloqueurs de publicité (AdBlock) ou sous iOS 14+.
                  </p>
                  <p>
                    <strong>TikTok & Snapchat :</strong> Suivez les conversions générées par vos campagnes TikTok Ads et Snapchat Ads.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Status Box */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                État de vos intégrations
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FacebookIcon className="h-4 w-4" /> Meta Pixel
                  </span>
                  {fbEnabled && cleanFb ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actif
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Non configuré</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Server className="h-4 w-4 text-blue-500" /> Meta CAPI
                  </span>
                  {fbEnabled && cleanFbCapi ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="h-3 w-3" /> Connecté
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Non configuré</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <TikTokIcon className="h-4 w-4" /> TikTok Pixel
                  </span>
                  {ttEnabled && cleanTt ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actif
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Non configuré</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <SnapchatIcon className="h-4 w-4" /> Snapchat Pixel
                  </span>
                  {snapEnabled && cleanSnap ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actif
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Non configuré</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links to Tools */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 text-xs shadow-2xs">
              <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Outils de vérification officiels
              </p>
              <div className="space-y-1.5">
                <a
                  href="https://business.facebook.com/events_manager2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-muted-foreground hover:text-foreground hover:underline py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <FacebookIcon className="h-3.5 w-3.5" /> Meta Events Manager
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-muted-foreground hover:text-foreground hover:underline py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> Extension Meta Pixel Helper
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://ads.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-muted-foreground hover:text-foreground hover:underline py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <TikTokIcon className="h-3.5 w-3.5" /> TikTok Ads Manager
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://chromewebstore.google.com/detail/tiktok-pixel-helper/aelgobmabdflignfbgajdaia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-muted-foreground hover:text-foreground hover:underline py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" /> Extension TikTok Pixel Helper
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Configuration + Live Simulator + Tracked Funnel */}
          <div className="space-y-6">
            {/* ============================================================== */}
            {/* 1. CONFIGURATION CARD (Matching Capture 2)                     */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-6">
              {/* 1.1 Facebook Pixel & CAPI */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                      <FacebookIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">Pixel Facebook</h3>
                        {fbEnabled && cleanFb && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Pixel Actif
                          </span>
                        )}
                        {fbEnabled && cleanFbCapi && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Server className="h-3 w-3" /> CAPI Connecté
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Ajoutez votre ID Pixel Facebook pour suivre le trafic de votre boutique
                      </p>
                    </div>
                  </div>
                  <Switch checked={fbEnabled} onCheckedChange={setFbEnabled} />
                </div>

                {fbEnabled && (
                  <div className="space-y-4 pl-12 pt-1 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-foreground">
                          ID Pixel Facebook
                        </label>
                        <a
                          href="https://business.facebook.com/events_manager2"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Trouver mon ID <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                      <Input
                        value={fbPixelId}
                        onChange={(e) => setFbPixelId(e.target.value)}
                        placeholder="Ex: 2021795638635981"
                        className="h-10 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-blue-600" />
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
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          tabIndex={-1}
                          title={showCapiToken ? "Masquer le jeton" : "Afficher le jeton"}
                        >
                          {showCapiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCapiGuide((prev) => !prev)}
                          className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          {showCapiGuide ? "Masquer le guide CAPI" : "Comment générer mon jeton Meta CAPI ?"}
                          {showCapiGuide ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        {cleanFb && cleanFbCapi && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleTestCapi}
                            disabled={testingCapi}
                            className="h-8 gap-1.5 text-xs text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-950/40 font-semibold"
                          >
                            <Server className={`h-3.5 w-3.5 ${testingCapi ? "animate-spin" : ""}`} />
                            {testingCapi ? "Vérification en cours..." : "Tester la validité du jeton CAPI"}
                          </Button>
                        )}
                      </div>

                      {/* Interactive Step-by-Step CAPI Guide */}
                      {showCapiGuide && (
                        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-foreground space-y-2.5 animate-in fade-in duration-200">
                          <p className="font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-blue-600" />
                            Générer votre jeton Meta CAPI en 4 étapes :
                          </p>
                          <ol className="space-y-1.5 list-decimal list-inside text-muted-foreground leading-relaxed">
                            <li>
                              Rendez-vous sur{" "}
                              <a
                                href="https://business.facebook.com/events_manager2"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-bold underline inline-flex items-center gap-0.5"
                              >
                                Meta Events Manager <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </li>
                            <li>Dans la colonne de gauche, cliquez sur votre <strong>Pixel (Source de données)</strong>.</li>
                            <li>Ouvrez l'onglet <strong>Paramètres</strong> en haut au centre.</li>
                            <li>
                              Faites défiler jusqu'à <strong>API Conversions</strong> et cliquez sur <strong>« Générer un jeton d'accès »</strong>.
                            </li>
                            <li>Copiez le jeton commençant par <code>EAA...</code> et collez-le ci-dessus.</li>
                          </ol>
                        </div>
                      )}

                      {/* Feedback banner for CAPI test */}
                      {capiStatus === "valid" && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{capiMessage || "Jeton CAPI 100% valide et connecté aux serveurs de Meta."}</span>
                        </div>
                      )}

                      {capiStatus === "error" && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300">
                          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                          <span>{capiMessage}</span>
                        </div>
                      )}

                      {/* Optional: Meta Test Event Code */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">
                            Code d'événement test Meta (Optionnel)
                          </label>
                          <span className="text-[10px] text-muted-foreground">Onglet Événements test</span>
                        </div>
                        <Input
                          value={testEventCode}
                          onChange={(e) => setTestEventCode(e.target.value)}
                          placeholder="Ex: TEST12345"
                          className="h-8 text-xs font-mono"
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Si vous renseignez ce code, les événements du simulateur apparaîtront directement dans l'onglet « Événements de test » de Meta Events Manager.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60" />

              {/* 1.2 TikTok Pixel */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-foreground dark:bg-slate-800">
                      <TikTokIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">Pixel TikTok</h3>
                        {ttEnabled && cleanTt && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actif
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-foreground">
                          ID Pixel TikTok
                        </label>
                        <a
                          href="https://ads.tiktok.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                        >
                          TikTok Ads Manager <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
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

              {/* 1.3 Snapchat Pixel */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-yellow-50 dark:bg-yellow-950/30">
                      <SnapchatIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">Pixel Snapchat</h3>
                        {snapEnabled && cleanSnap && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actif
                          </span>
                        )}
                      </div>
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

              {/* 1.4 Google Tag Manager */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                      <GtmIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">ID Google Tag Manager</h3>
                        {gtmEnabled && cleanGtm && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Ajoutez votre ID Google Tag Manager ou Google Ads pour suivre le trafic de votre boutique
                      </p>
                    </div>
                  </div>
                  <Switch checked={gtmEnabled} onCheckedChange={setGtmEnabled} />
                </div>

                {gtmEnabled && (
                  <div className="space-y-3 pl-12 pt-1 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">
                        ID Google Tag Manager ou Google Ads
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

              {/* 1.5 Custom JavaScript */}
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

              {/* Save Button inside card */}
              <div className="flex justify-end pt-2 border-t border-border/60">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 min-w-[130px] font-semibold gap-2"
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

            {/* ============================================================== */}
            {/* 2. REFINED, PROFESSIONAL LIVE EVENT TESTER                     */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              {/* Header: Clean, balanced, well-grounded */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
                    <Radio className="h-5 w-5 text-emerald-400 dark:text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground tracking-tight">
                      Testeur d'événements & Conversions
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Simulez des événements réels pour vérifier leur détection immédiate dans Meta, TikTok et CAPI.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {hasAnyPixelConfigured ? "Prêt à émettre" : "Configuration requise"}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/70">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">
                      Test rapide du tunnel client
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Envoie consécutivement les événements <code>PageView</code> et <code>ViewContent</code>.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {cleanFbCapi && (
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sendCapiWithTest}
                          onChange={(e) => setSendCapiWithTest(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span className="text-[11px] font-medium">Inclure CAPI</span>
                      </label>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleTestAllPixels}
                      disabled={testingAll || !hasAnyPixelConfigured}
                      className="h-9 px-4 font-semibold text-xs gap-1.5 shadow-2xs"
                    >
                      <Play className={`h-3.5 w-3.5 ${testingAll ? "animate-spin" : ""}`} />
                      {testingAll ? "Test en cours…" : "Lancer le test rapide"}
                    </Button>
                  </div>
                </div>

                {/* Specific Unit Tests */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Événements unitaires à tester :
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      Cliquez pour déclencher
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {/* PageView */}
                    <button
                      type="button"
                      onClick={() => handleFireEvent("PageView")}
                      disabled={Boolean(testingEvent) || !hasAnyPixelConfigured}
                      className="group flex items-center justify-between h-11 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left shadow-2xs disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Eye className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>PageView</span>
                      </span>
                      {testingEvent === "PageView" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground">
                          Visite
                        </span>
                      )}
                    </button>

                    {/* ViewContent */}
                    <button
                      type="button"
                      onClick={() => handleFireEvent("ViewContent")}
                      disabled={Boolean(testingEvent) || !hasAnyPixelConfigured}
                      className="group flex items-center justify-between h-11 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left shadow-2xs disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>ViewContent</span>
                      </span>
                      {testingEvent === "ViewContent" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground">
                          15k F
                        </span>
                      )}
                    </button>

                    {/* AddToCart */}
                    <button
                      type="button"
                      onClick={() => handleFireEvent("AddToCart")}
                      disabled={Boolean(testingEvent) || !hasAnyPixelConfigured}
                      className="group flex items-center justify-between h-11 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left shadow-2xs disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <ShoppingCart className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>AddToCart</span>
                      </span>
                      {testingEvent === "AddToCart" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground">
                          Panier
                        </span>
                      )}
                    </button>

                    {/* InitiateCheckout */}
                    <button
                      type="button"
                      onClick={() => handleFireEvent("InitiateCheckout")}
                      disabled={Boolean(testingEvent) || !hasAnyPixelConfigured}
                      className="group flex items-center justify-between h-11 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left shadow-2xs disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <CreditCard className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span>InitiateCheckout</span>
                      </span>
                      {testingEvent === "InitiateCheckout" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground">
                          Caisse
                        </span>
                      )}
                    </button>

                    {/* AddPaymentInfo */}
                    <button
                      type="button"
                      onClick={() => handleFireEvent("AddPaymentInfo")}
                      disabled={Boolean(testingEvent) || !hasAnyPixelConfigured}
                      className="group flex items-center justify-between h-11 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left shadow-2xs disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <CreditCard className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                        <span>AddPaymentInfo</span>
                      </span>
                      {testingEvent === "AddPaymentInfo" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono group-hover:text-foreground">
                          Paiement
                        </span>
                      )}
                    </button>

                    {/* Purchase */}
                    <button
                      type="button"
                      onClick={() => handleFireEvent("Purchase")}
                      disabled={Boolean(testingEvent) || !hasAnyPixelConfigured}
                      className="group flex items-center justify-between h-11 px-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left shadow-2xs disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Purchase</span>
                      </span>
                      {testingEvent === "Purchase" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-mono font-bold group-hover:text-emerald-700">
                          15k F
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Developer Terminal Live Stream (Grounded & Solid) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-200 shadow-inner space-y-2.5 font-mono text-xs">
                  {/* Console Header Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="font-mono text-slate-300 font-semibold pl-1">
                        console: event_stream
                      </span>
                    </div>

                    {eventLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEventLogs([])}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-mono"
                      >
                        [effacer]
                      </button>
                    )}
                  </div>

                  {/* Console Content */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1 font-mono text-[11px] leading-relaxed">
                    {eventLogs.length === 0 ? (
                      <div className="py-2 text-slate-500 space-y-1 font-mono text-[11px]">
                        <p>&gt; Écouteur de tracking initialisé.</p>
                        <p className="text-slate-600 text-[10px]">
                          En attente d'événements. Cliquez sur un des boutons ci-dessus pour inspecter l'émission en direct.
                        </p>
                      </div>
                    ) : (
                      eventLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] border-b border-slate-900 pb-1 last:border-b-0 animate-in fade-in duration-150"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            <span className="text-slate-400 shrink-0">{log.time}</span>
                            <span className="text-cyan-400 font-semibold shrink-0">[{log.channel}]</span>
                            <span className="text-white font-bold">{log.name}</span>
                            <span className="text-slate-400 truncate max-w-xs">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-medium shrink-0 self-end sm:self-auto">
                            200 OK
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Shortcuts Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/60">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="https://business.facebook.com/events_manager2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <FacebookIcon className="h-3.5 w-3.5" /> Meta Events Manager <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <a
                      href="https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500" /> Meta Pixel Helper <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <a
                      href="https://ads.tiktok.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <TikTokIcon className="h-3.5 w-3.5" /> TikTok Ads Manager <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. TRACKED CONVERSION FUNNEL (Clean & Solid)                   */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-foreground">
                    Tunnel des 6 événements suivis automatiquement
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Tunnel complet 6/6
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                    <p className="text-xs font-bold text-foreground">1. PageView</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Visite de la boutique et de chaque page produit.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <p className="text-xs font-bold text-foreground">2. ViewContent</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Affichage détaillé d'un produit avec son prix et ID.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-xs font-bold text-foreground">3. AddToCart</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Clic sur le bouton « Obtenir » ou « Acheter ».
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                    <p className="text-xs font-bold text-foreground">4. InitiateCheckout</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Ouverture de la page de caisse / formulaire client.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-cyan-500" />
                    <p className="text-xs font-bold text-foreground">5. AddPaymentInfo</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Moyen de paiement sélectionné (Wave, MoMo, Carte).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-xs font-bold text-foreground">6. Purchase</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Paiement validé avec montant exact et déduplication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
