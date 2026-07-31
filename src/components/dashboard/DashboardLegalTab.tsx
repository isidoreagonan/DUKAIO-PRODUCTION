import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Sparkles, Scale, FileText, Shield, AlertTriangle } from "lucide-react";
import { useActiveStore } from "@/hooks/useActiveStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DashboardLegalTab = () => {
  const { activeStore, activeStoreId } = useActiveStore();
  const [legalNotice, setLegalNotice] = useState("");
  const [terms, setTerms] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStore) return;
    setLegalNotice((activeStore as any).legal_notice || "");
    setTerms((activeStore as any).terms_of_use || "");
    setPrivacy((activeStore as any).privacy_policy || "");
    setDisclaimer((activeStore as any).footer_disclaimer || "");
  }, [activeStoreId]);

  const handleSave = async () => {
    if (!activeStoreId) return;
    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .update({
        legal_notice: legalNotice,
        terms_of_use: terms,
        privacy_policy: privacy,
        footer_disclaimer: disclaimer,
      } as any)
      .eq("id", activeStoreId);
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
      return;
    }
    toast.success("Mentions légales enregistrées");
  };

  const generateWithAI = async (
    type: "legal_notice" | "terms" | "privacy",
    setter: (v: string) => void
  ) => {
    if (!activeStore) return;
    setGenerating(type);
    try {
      const titles: Record<string, string> = {
        legal_notice: "Mentions légales",
        terms: "Conditions générales d'utilisation et de vente",
        privacy: "Politique de confidentialité (RGPD)",
      };
      const { data, error } = await supabase.functions.invoke("rewrite-description", {
        body: {
          title: `${titles[type]} pour ${activeStore.name}`,
          description: `Génère un document complet de "${titles[type]}" pour la boutique en ligne ${activeStore.name}. Inclus toutes les sections nécessaires (identité du vendeur, hébergeur, propriété intellectuelle, données personnelles, cookies, droits du consommateur, etc.). Format HTML avec h2, h3, p, ul, li.`,
          productType: "file",
        },
      });
      if (error) throw error;
      const html = data?.description || "";
      if (html) {
        setter(html);
        toast.success("Document généré — pensez à l'adapter à votre activité");
      }
    } catch {
      toast.error("Erreur lors de la génération");
    } finally {
      setGenerating(null);
    }
  };

  if (!activeStore) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Sélectionnez une boutique pour gérer ses mentions légales.
        </CardContent>
      </Card>
    );
  }

  const Editor = ({
    value,
    onChange,
    placeholder,
    onAI,
    aiKey,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    onAI?: () => void;
    aiKey?: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">Contenu HTML autorisé</Label>
        {onAI && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAI}
            disabled={generating === aiKey}
            className="gap-1.5 h-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generating === aiKey ? "Génération…" : "Générer avec l'IA"}
          </Button>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={14}
        className="font-mono text-xs"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-primary" />
            Mentions légales de votre boutique
          </CardTitle>
          <CardDescription>
            Ces pages s'affichent en bas de votre boutique. Personnalisez-les selon votre activité et votre pays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="legal" className="w-full">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="legal" className="gap-1.5 text-xs">
                <Scale className="h-3.5 w-3.5" /> Mentions légales
              </TabsTrigger>
              <TabsTrigger value="terms" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> CGU/CGV
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5" /> Confidentialité
              </TabsTrigger>
              <TabsTrigger value="disclaimer" className="gap-1.5 text-xs">
                <AlertTriangle className="h-3.5 w-3.5" /> Disclaimer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="legal" className="mt-4">
              <Editor
                value={legalNotice}
                onChange={setLegalNotice}
                placeholder="<h2>Mentions légales</h2><p>Éditeur du site...</p>"
                onAI={() => generateWithAI("legal_notice", setLegalNotice)}
                aiKey="legal_notice"
              />
            </TabsContent>
            <TabsContent value="terms" className="mt-4">
              <Editor
                value={terms}
                onChange={setTerms}
                placeholder="<h2>Conditions générales</h2>"
                onAI={() => generateWithAI("terms", setTerms)}
                aiKey="terms"
              />
            </TabsContent>
            <TabsContent value="privacy" className="mt-4">
              <Editor
                value={privacy}
                onChange={setPrivacy}
                placeholder="<h2>Politique de confidentialité</h2>"
                onAI={() => generateWithAI("privacy", setPrivacy)}
                aiKey="privacy"
              />
            </TabsContent>
            <TabsContent value="disclaimer" className="mt-4 space-y-3">
              <Label className="text-xs text-muted-foreground">
                Court texte d'avertissement affiché en bas de votre boutique (avant le copyright).
              </Label>
              <Textarea
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                placeholder="Ce site n'est en aucun cas affilié à Facebook ou Meta. Les informations fournies sont à titre informatif uniquement et ne constituent pas un conseil professionnel ou financier."
                rows={5}
                className="text-sm"
                maxLength={600}
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {disclaimer.length}/600
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLegalTab;
