import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { Store, Phone, Globe, Upload, ImageIcon } from "lucide-react";
import { uploadToBunny } from "@/lib/bunnyStorage";
import { getStoreUrl } from "@/lib/subdomain";

const DashboardProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [contact, setContact] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setStoreName(profile.display_name || "");
      setStoreSlug(profile.store_slug || "");
      setContact(profile.contact || "");
      setLogoUrl((profile as any).store_logo_url || null);
    }
  }, [profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${user.id}/store-logo_${Date.now()}.${cleanExt}`;

    try {
      // Primary: Upload to Supabase Storage 'store-assets' (100GB plan)
      const { error: uploadErr } = await supabase.storage
        .from("store-assets")
        .upload(path, file, {
          upsert: true,
          contentType: file.type || "image/png",
        });

      if (!uploadErr) {
        const { data: pubData } = supabase.storage
          .from("store-assets")
          .getPublicUrl(path);
        setLogoUrl(pubData.publicUrl);
        toast.success("Logo uploadé sur Supabase !");
        return;
      }
      throw uploadErr;
    } catch (err: any) {
      // Fallback to Bunny
      try {
        const res = await uploadToBunny(file, `logos/${user.id}/store-logo.${cleanExt}`, "media");
        setLogoUrl(res.url);
        toast.success("Logo uploadé !");
      } catch (bunnyErr: any) {
        toast.error("Erreur lors de l'upload : " + (err.message || bunnyErr.message));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!storeName.trim()) {
      toast.error("Le nom de la boutique est obligatoire");
      return;
    }
    setSaving(true);

    const slug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: storeName.trim(),
      store_slug: slug || null,
      contact: contact.trim() || null,
      store_logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: "id" });

    setSaving(false);
    if (error) {
      toast.error(error.message.includes("unique") ? "Ce domaine est déjà pris" : error.message);
    } else {
      toast.success("Profil mis à jour !");
      refreshProfile();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ma Boutique</h1>
          <p className="text-sm text-muted-foreground mt-1">Configurez les informations de votre boutique</p>
        </div>

        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          {/* Store Logo */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Logo de la boutique
            </label>
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-xl border-2 border-dashed border-border bg-secondary flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Upload..." : logoUrl ? "Changer le logo" : "Ajouter un logo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2 Mo.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              Nom de la boutique
            </label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex: Ma Super Boutique"
            />
          </div>

          {/* Store Domain / Slug */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Domaine de la boutique
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-muted text-xs text-muted-foreground whitespace-nowrap">
                https://
              </span>
              <Input
                className="rounded-none border-x-0"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                placeholder="ma-boutique"
              />
              <span className="inline-flex items-center px-3 h-10 rounded-r-md border border-l-0 border-input bg-muted text-xs text-muted-foreground whitespace-nowrap">
                .dukaio.com
              </span>
            </div>
            {storeSlug && (
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Lien de votre boutique :</p>
                <a
                  href={getStoreUrl(storeSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline font-mono"
                >
                  {getStoreUrl(storeSlug)}
                </a>
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Contact (téléphone ou email)
            </label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Ex: +229 97 00 00 00 ou email@exemple.com"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfile;
