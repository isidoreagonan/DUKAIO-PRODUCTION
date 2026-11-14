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
  Store,
  Upload,
  Loader2,
  CheckCircle2,
  Instagram,
  Youtube,
  Phone,
} from "lucide-react";
import { getStoreUrl } from "@/lib/subdomain";

export default function DashboardSettingsIdentity() {
  const { user, profile, refreshProfile } = useAuth();
  const { activeStore, activeStoreId } = useActiveStore();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeStore && !profile) return;
    const store = (activeStore as any) || {};
    const prof = (profile as any) || {};
    const conf = store.theme_config || prof.theme_config || {};

    setName(store.name || prof.display_name || "");
    setSlug(store.slug || prof.store_slug || "");
    setDescription(store.description || prof.store_description || conf.description || "");
    setWhatsapp(conf.whatsapp || prof.contact || "");
    setLogoUrl(store.logo_url || prof.store_logo_url || conf.logo || "");

    const socials = conf.socials || {};
    setInstagram(socials.instagram || "");
    setTiktok(socials.tiktok || "");
    setYoutube(socials.youtube || "");
  }, [activeStore, profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/store-logo-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("store-assets")
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("store-assets")
        .getPublicUrl(path);

      setLogoUrl(urlData.publicUrl);
      toast.success("Logo téléversé !");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur de téléversement");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/--+/g, "-");

      // Check slug uniqueness if changed
      if (cleanSlug && cleanSlug !== activeStore?.slug) {
        const { data: existing } = await supabase
          .from("stores")
          .select("id")
          .eq("slug", cleanSlug)
          .neq("owner_id", user.id)
          .maybeSingle();

        if (existing) {
          toast.error("Cette adresse de boutique est déjà réservée par un autre créateur.");
          setSaving(false);
          return;
        }
      }

      // Update theme_config
      const currentConfig = (activeStore as any)?.theme_config || (profile as any)?.theme_config || {};
      const updatedConfig = {
        ...currentConfig,
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim(),
        whatsapp: whatsapp.trim(),
        logo: logoUrl || null,
        socials: {
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          youtube: youtube.trim(),
        },
      };

      // 1. Update Profile
      await supabase
        .from("profiles")
        .update({
          display_name: name.trim() || null,
          store_slug: cleanSlug || null,
          store_description: description.trim() || null,
          store_logo_url: logoUrl || null,
          theme_config: updatedConfig,
        } as any)
        .eq("id", user.id);

      // 2. Update Active Store
      if (activeStoreId) {
        await supabase
          .from("stores")
          .update({
            name: name.trim(),
            slug: cleanSlug,
            description: description.trim(),
            logo_url: logoUrl || null,
            theme_config: updatedConfig,
          } as any)
          .eq("id", activeStoreId);
      }

      await refreshProfile();
      toast.success("Identité de la boutique enregistrée !");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Top Header */}
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
                Identité de la boutique
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Définissez le nom, le logo, la description et les réseaux sociaux de votre boutique.
              </p>
            </div>
          </div>

          {slug && (
            <a
              href={getStoreUrl(slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visiter ma boutique
            </a>
          )}
        </div>

        {/* Identity Form */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-2xs space-y-6">
          {/* Logo upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-border/60 pb-6">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-border bg-muted/40 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Store className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <label className="block text-xs font-semibold text-foreground">
                Logo de la boutique
              </label>
              <p className="text-xs text-muted-foreground">
                Format carré recommandé (PNG, JPG ou WEBP, max 5 Mo).
              </p>
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Téléversement…
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" /> Changer le logo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Name & Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nom de la boutique
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: DIGITAL STORE"
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Lien de la boutique (Slug)
              </label>
              <div className="flex rounded-md shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-xs font-mono">
                  dukaio.com/
                </span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="nom-boutique"
                  className="rounded-l-none h-10 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Description de la boutique
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présentez votre univers, vos produits et ce qui rend votre offre unique…"
              rows={3}
              className="text-xs leading-relaxed"
            />
          </div>

          {/* WhatsApp Contact */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-600" /> Numéro WhatsApp de support (avec indicatif)
            </label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+225 07 00 00 00 00"
              className="h-10 text-xs"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Réseaux sociaux
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-pink-600" /> Instagram
                </label>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@votrecompte"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  TikTok
                </label>
                <Input
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@votrecompte"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Youtube className="h-3.5 w-3.5 text-red-600" /> YouTube
                </label>
                <Input
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="@votrechaine"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-border/60">
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
    </DashboardLayout>
  );
}

