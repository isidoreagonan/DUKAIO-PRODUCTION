import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Store, Phone, Globe, Upload, ImageIcon, AlertCircle, FileText, Sparkles, Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import StoreSelector from "./StoreSelector";
import { useActiveStore } from "@/hooks/useActiveStore";

const DashboardProfileTab = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { stores, activeStore, activeStoreId, setActiveStoreId, updateStore, isLoading, hasStores } = useActiveStore();
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [contact, setContact] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImproveDescription = async () => {
    const text = storeDescription.replace(/<[^>]*>/g, "").trim();
    if (!text) {
      toast.error("Ajoutez d'abord une description avant de l'améliorer");
      return;
    }
    setImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-store-description", {
        body: { description: storeDescription },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const improved = (data as any)?.improved as string;
      if (!improved) throw new Error("Réponse vide");
      setStoreDescription(improved);
      toast.success("Description réorganisée par l'IA ✨");
    } catch (err: any) {
      toast.error(err.message || "Impossible d'améliorer la description");
    } finally {
      setImproving(false);
    }
  };

  // Sync form with active store
  useEffect(() => {
    if (activeStore) {
      setStoreName(activeStore.name || "");
      setStoreSlug(activeStore.slug || "");
      setStoreDescription((activeStore as any).description || "");
      setLogoUrl(activeStore.logo_url || null);
    }
    // Contact stays on profile level
    if (profile) {
      setContact(profile.contact || "");
    }
  }, [activeStore, profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeStoreId) return;
    if (!file.type.startsWith("image/")) { toast.error("Veuillez sélectionner une image"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 2 Mo"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logos/${user.id}/${activeStoreId}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-assets").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Erreur lors de l'upload"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-assets").getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Logo uploadé !");
  };

  const handleSave = async () => {
    if (!user || !activeStoreId) return;
    if (!storeName.trim()) { toast.error("Le nom de la boutique est obligatoire"); return; }
    setSaving(true);
    
    const slug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Treat empty rich-text (e.g. "<p></p>") as null
    const descriptionTextOnly = storeDescription.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    const cleanDescription = descriptionTextOnly.length > 0 ? storeDescription.trim() : null;

    try {
      // Update store
      await updateStore.mutateAsync({
        name: storeName.trim(),
        slug: slug || activeStore?.slug,
        description: cleanDescription,
        logo_url: logoUrl,
      } as any);

      // Update contact + store_description on profile (mirror)
      await supabase.from("profiles").update({
        contact: contact.trim() || null,
        display_name: storeName.trim(),
        store_slug: slug || null,
        store_description: cleanDescription,
        store_logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      } as any).eq("id", user.id);

      toast.success("Boutique mise à jour !");
      refreshProfile();
    } catch (err: any) {
      if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
        toast.error("Ce slug est déjà utilisé");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    }
    setSaving(false);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-10 bg-muted rounded w-48" /><div className="h-32 bg-muted rounded" /></div>;
  }

  if (!hasStores) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/50">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Aucune boutique</p>
            <p className="text-xs text-muted-foreground">Créez votre première boutique dans l'onglet <a href="/dashboard/stores" className="text-primary hover:underline">Mes Boutiques</a> pour configurer votre profil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <StoreSelector stores={stores} activeStoreId={activeStoreId} onSelect={setActiveStoreId} />

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
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? "Upload..." : logoUrl ? "Changer le logo" : "Ajouter un logo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2 Mo.</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
        </div>

        {/* Store Name */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            Nom de la boutique
          </label>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Ma Super Boutique" />
        </div>

        {/* Store Description */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description de la boutique
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImproveDescription}
              disabled={improving}
              className="h-7 gap-1.5 text-xs"
            >
              {improving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Amélioration...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-primary" />
                  Améliorer avec l'IA
                </>
              )}
            </Button>
          </div>
          <RichTextEditor
            content={storeDescription}
            onChange={setStoreDescription}
            placeholder="Présentez votre boutique : liens, images, vidéos YouTube, listes, mise en forme... aussi long ou court que vous voulez."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Astuce : écrivez votre contenu, puis cliquez sur <strong>Améliorer avec l'IA</strong> pour une meilleure mise en page sans modifier le sens.
          </p>
        </div>

        {/* Store Domain / Slug */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Domaine de la boutique
          </label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-muted text-xs text-muted-foreground whitespace-nowrap">
              https://dukaio.com/store/
            </span>
            <Input className="rounded-l-none" value={storeSlug} onChange={(e) => setStoreSlug(e.target.value)} placeholder="ma-boutique" />
          </div>
          {storeSlug && (
            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Lien de votre boutique :</p>
              <a
                href={`https://dukaio.com/store/${storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                https://dukaio.com/store/{storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")}
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
          <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Ex: +229 97 00 00 00 ou email@exemple.com" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
};

export default DashboardProfileTab;
