import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Music2, BarChart3, Save, Info } from "lucide-react";

const DashboardPixelsTab = () => {
  const { user, refreshProfile } = useAuth();
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
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

    // Basic validation
    const fbClean = facebookPixelId.trim();
    const ttClean = tiktokPixelId.trim();
    const gaClean = googleAdsId.trim();

    if (fbClean && !/^\d{10,20}$/.test(fbClean)) {
      toast.error("L'ID du pixel Facebook doit être un nombre de 10 à 20 chiffres");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("profiles").update({
      facebook_pixel_id: fbClean || null,
      tiktok_pixel_id: ttClean || null,
      google_ads_id: gaClean || null,
      updated_at: new Date().toISOString(),
    } as any).eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Pixels sauvegardés !");
      refreshProfile();
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="font-medium text-foreground mb-1">Comment ça marche ?</p>
            <p>Ajoutez vos identifiants de pixels publicitaires ci-dessous. Les événements suivants seront automatiquement suivis sur votre boutique :</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• <strong>PageView</strong> — Quand un visiteur arrive sur votre boutique</li>
              <li>• <strong>ViewContent</strong> — Quand un visiteur voit un produit</li>
              <li>• <strong>AddToCart</strong> — Quand un visiteur clique sur "Acheter"</li>
              <li>• <strong>Purchase</strong> — Après un achat réussi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Facebook Pixel */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
            <Facebook className="h-5 w-5 text-[#1877F2]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Facebook / Meta Pixel</p>
            <p className="text-xs text-muted-foreground">Suivez les conversions de vos publicités Facebook & Instagram</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Pixel ID</label>
          <Input
            value={facebookPixelId}
            onChange={(e) => setFacebookPixelId(e.target.value)}
            placeholder="Ex: 1234567890123456"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Trouvez votre Pixel ID dans le <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Gestionnaire d'événements Meta</a>
          </p>
        </div>
      </div>

      {/* TikTok Pixel */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
            <Music2 className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">TikTok Pixel</p>
            <p className="text-xs text-muted-foreground">Suivez les conversions de vos campagnes TikTok Ads</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Pixel ID</label>
          <Input
            value={tiktokPixelId}
            onChange={(e) => setTiktokPixelId(e.target.value)}
            placeholder="Ex: CXXXXXXXXXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Trouvez votre Pixel ID dans le <a href="https://ads.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TikTok Ads Manager</a> → Assets → Events
          </p>
        </div>
      </div>

      {/* Google Ads */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-[#4285F4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Google Ads (gtag)</p>
            <p className="text-xs text-muted-foreground">Suivez les conversions de vos publicités Google</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">ID de conversion</label>
          <Input
            value={googleAdsId}
            onChange={(e) => setGoogleAdsId(e.target.value)}
            placeholder="Ex: AW-XXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Trouvez votre ID dans <a href="https://ads.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads</a> → Outils → Conversions
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto gap-2">
        <Save className="h-4 w-4" />
        {saving ? "Enregistrement..." : "Enregistrer les pixels"}
      </Button>
    </div>
  );
};

export default DashboardPixelsTab;
