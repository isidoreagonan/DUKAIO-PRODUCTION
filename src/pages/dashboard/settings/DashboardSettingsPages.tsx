import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Info,
  Scale,
  Shield,
  Sparkles,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { getStoreUrl } from "@/lib/subdomain";

type PageKey = "about" | "privacy" | "legal" | "terms";

interface PageConfig {
  key: PageKey;
  title: string;
  description: string;
  icon: any;
  field: "description" | "privacy_policy" | "legal_notice" | "terms_of_use";
}

const PAGES: PageConfig[] = [
  {
    key: "about",
    title: "À propos",
    description: "Partagez votre histoire d'entreprise, votre mission et ce qui vous rend unique avec vos clients.",
    icon: Info,
    field: "description",
  },
  {
    key: "privacy",
    title: "Politique de confidentialité",
    description: "Expliquez comment vous collectez, utilisez et protégez les informations personnelles de vos clients.",
    icon: Shield,
    field: "privacy_policy",
  },
  {
    key: "legal",
    title: "Mentions légales",
    description: "Fournissez les informations légales sur votre entreprise, vos coordonnées et votre conformité réglementaire.",
    icon: Scale,
    field: "legal_notice",
  },
  {
    key: "terms",
    title: "Conditions d'utilisation",
    description: "Définissez les règles, droits et responsabilités pour l'utilisation de vos produits et services.",
    icon: FileText,
    field: "terms_of_use",
  },
];

export default function DashboardSettingsPages() {
  const { user, profile } = useAuth();
  const { activeStore, activeStoreId } = useActiveStore();

  const [activeDialog, setActiveDialog] = useState<PageConfig | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [showTags, setShowTags] = useState(false);

  // Store contents
  const [pagesContent, setPagesContent] = useState<Record<PageKey, string>>({
    about: "",
    privacy: "",
    legal: "",
    terms: "",
  });

  useEffect(() => {
    if (!activeStore) return;
    const store = activeStore as any;
    setPagesContent({
      about: store.description || "",
      privacy: store.privacy_policy || "",
      legal: store.legal_notice || "",
      terms: store.terms_of_use || "",
    });
  }, [activeStoreId, activeStore]);

  const openEditor = (page: PageConfig) => {
    setActiveDialog(page);
    setContent(pagesContent[page.key] || "");
    setShowTags(false);
  };

  const closeEditor = () => {
    setActiveDialog(null);
    setContent("");
    setShowTags(false);
  };

  const handleSave = async () => {
    if (!activeDialog || !activeStoreId) return;
    setSaving(true);
    try {
      const field = activeDialog.field;
      const { error } = await supabase
        .from("stores")
        .update({ [field]: content } as any)
        .eq("id", activeStoreId);

      if (error) throw error;

      setPagesContent((prev) => ({
        ...prev,
        [activeDialog.key]: content,
      }));

      toast.success(`Page « ${activeDialog.title} » enregistrée et publiée avec succès !`);
      closeEditor();
    } catch (err: any) {
      console.error("Save page error:", err);
      toast.error(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const insertTag = (tag: string) => {
    setContent((prev) => `${prev} ${tag}`);
    toast.info(`Tag ${tag} inséré`);
  };

  const insertTemplate = () => {
    if (!activeDialog) return;
    const storeName = activeStore?.name || profile?.display_name || "Notre Boutique";
    const contactEmail = user?.email || "contact@exemple.com";
    const currentYear = new Date().getFullYear();

    let template = "";

    switch (activeDialog.key) {
      case "about":
        template = `Bienvenue chez ${storeName} !

Nous sommes une équipe passionnée dédiée à la création et à la diffusion de ressources digitales, formations et outils pratiques de haute qualité.

Notre mission est de donner à nos apprenants et clients les compétences concrètes et les leviers indispensables pour réussir leurs projets, développer leur activité et atteindre leur plein potentiel.

Pourquoi nous faire confiance ?
- Des contenus créés par des experts praticiens du domaine.
- Un accès instantané et sécurisé après votre commande.
- Une assistance client réactive et dédiée pour vous accompagner.

Pour toute question ou demande de partenariat, contactez-nous par e-mail à : ${contactEmail}.`;
        break;

      case "privacy":
        template = `Politique de Confidentialité — ${storeName}

Dernière mise à jour : ${new Date().toLocaleDateString("fr-FR")}

La présente politique détaille la façon dont ${storeName} (« nous », « notre ») collecte, utilise et protège vos données personnelles lorsque vous visitez notre boutique ou effectuez un achat.

1. Données collectées
Lors de votre commande ou inscription, nous collectons les données suivantes :
- Adresse e-mail (nécessaire à la livraison des fichiers et accès).
- Prénom et nom (si renseignés).
- Données de transaction (montant, devise, méthode de paiement, identifiant de commande). Nous ne stockons jamais vos numéros complets de carte bancaire ou coordonnées de Mobile Money, qui sont traités de façon chiffrée par nos prestataires de paiement agréés.

2. Utilisation de vos données
Vos données sont strictement utilisées pour :
- Vous livrer vos produits digitaux et vous donner accès à l'espace acheteur.
- Vous envoyer votre reçu d'achat et vos liens de téléchargement.
- Répondre à vos demandes d'assistance.
- Respecter nos obligations comptables et légales.

3. Partage des données
Vos données personnelles ne sont jamais vendues ni louées à des tiers. Elles sont transmises uniquement aux prestataires techniques indispensables au fonctionnement du service (passerelle de paiement, hébergement sécurisé, délivrance des emails).

4. Vos droits (RGPD et lois applicables)
Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en nous écrivant à : ${contactEmail}.`;
        break;

      case "legal":
        template = `Mentions Légales — ${storeName}

En vigueur au ${new Date().toLocaleDateString("fr-FR")}

1. Éditeur de la boutique
La présente boutique en ligne « ${storeName} » est éditée par :
- Nom commercial : ${storeName}
- Contact / Assistance : ${contactEmail}

2. Hébergement de la plateforme
La boutique est propulsée et hébergée sur l'infrastructure de :
- DUKAIO / Vercel Inc. / Supabase Inc.
- Sécurisation des données via protocole HTTPS/TLS avec chiffrement 256 bits.

3. Propriété intellectuelle
L'ensemble des contenus (textes, vidéos, fichiers téléchargeables, visuels, marques) présents sur cette boutique sont la propriété exclusive de ${storeName} et de leurs auteurs respectifs. Toute reproduction, distribution ou revente non autorisée est strictement interdite et fera l'objet de poursuites judiciaires.

4. Service client
Pour toute réclamation, assistance technique ou question relative à une commande, notre service client est joignable à : ${contactEmail}.`;
        break;

      case "terms":
        template = `Conditions Générales d'Utilisation et de Vente — ${storeName}

Dernière mise à jour : ${currentYear}

1. Objet
Les présentes conditions régissent l'achat et l'utilisation des produits numériques (formations, fichiers, ebooks, licences) proposés sur la boutique ${storeName}.

2. Commande et Accès immédiat
Toute commande validée donne un accès immédiat au contenu acheté :
- Par téléchargement direct sur la page de confirmation.
- Par email contenant les liens de téléchargement ou d'accès.
- Depuis votre espace acheteur sécurisé accessible avec votre email.

3. Prix et Modalités de Paiement
Les prix sont indiqués en devise locale (FCFA, etc.) ou équivalent. Le paiement s'effectue au comptant par Mobile Money (Orange Money, MTN MoMo, Wave, Moov, etc.) ou par carte bancaire (Visa, Mastercard) via une connexion sécurisée et chiffrée.

4. Produits numériques et Droit de rétractation
Conformément aux dispositions légales relatives aux contenus numériques fournis sans support matériel et dont l'exécution commence immédiatement après le paiement, le client reconnaît et accepte expressément renoncer à son droit de rétractation une fois le lien de téléchargement ou l'accès débloqué.

5. Responsabilité et Droit applicable
${storeName} s'engage à fournir des ressources conformes à leurs descriptions. Tout litige relatif à l'interprétation ou à l'exécution des présentes sera soumis aux juridictions compétentes.`;
        break;
    }

    setContent(template);
    toast.success(`Modèle pour « ${activeDialog.title} » inséré avec succès !`);
  };

  const applyFormat = (prefix: string, suffix: string = "") => {
    setContent((prev) => `${prev}\n${prefix}Texte${suffix}\n`);
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
                Pages de la boutique
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Créez et personnalisez vos mentions légales, politique de confidentialité et conditions d'utilisation.
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

        {/* Page List matching Capture 3 */}
        <div className="space-y-3">
          {PAGES.map((page) => {
            const hasContent = Boolean(pagesContent[page.key]?.trim());
            const Icon = page.icon;

            return (
              <button
                key={page.key}
                type="button"
                onClick={() => openEditor(page)}
                className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 text-left transition-all hover:border-foreground/20 hover:bg-muted/30 hover:shadow-2xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted/80 text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed mt-0.5">
                      {page.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={hasContent ? "secondary" : "outline"}
                    className={`text-[11px] font-medium px-2.5 py-0.5 ${
                      hasContent
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "text-muted-foreground bg-muted/40"
                    }`}
                  >
                    {hasContent ? "Défini" : "Non défini"}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Editor matching Capture 4 */}
        <Dialog open={!!activeDialog} onOpenChange={(open) => !open && closeEditor()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <DialogHeader className="pb-3 border-b border-border/60">
              <DialogTitle className="text-lg font-bold text-foreground">
                {activeDialog?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-3">
              {/* Box 1: Legal Disclaimer & Template Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  Les modèles ne sont pas des conseils juridiques. En utilisant les modèles de {activeDialog?.title}, vous acceptez que vous avez lu et accepté la{" "}
                  <strong className="text-amber-600 dark:text-amber-400">clause de non-responsabilité</strong>.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={insertTemplate}
                  className="shrink-0 gap-1.5 font-semibold text-xs h-8"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Insérer un modèle
                </Button>
              </div>

              {/* Box 2: Dynamic Tags */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <strong className="text-foreground">Tags dynamiques</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Utilisez des tags dynamiques pour personnaliser votre contenu automatiquement.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTags((prev) => !prev)}
                    className="shrink-0 text-xs h-8"
                  >
                    {showTags ? "Masquer" : "Voir"}
                  </Button>
                </div>

                {showTags && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                    {[
                      { tag: "{nom_boutique}", desc: "Nom de votre boutique" },
                      { tag: "{email_contact}", desc: "Email de support" },
                      { tag: "{url_boutique}", desc: "Lien de la boutique" },
                      { tag: "{annee_actuelle}", desc: "Année en cours" },
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => insertTag(item.tag)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-mono hover:bg-muted transition-colors"
                        title={item.desc}
                      >
                        {item.tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 3: Rich Text Editor Area */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Contenu de la page
                </label>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-border border-b-0 bg-muted/40 p-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => applyFormat("## ")}
                    className="grid h-7 w-7 place-items-center rounded hover:bg-background transition-colors"
                    title="Titre 2"
                  >
                    <Heading2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("### ")}
                    className="grid h-7 w-7 place-items-center rounded hover:bg-background transition-colors"
                    title="Titre 3"
                  >
                    <Heading3 className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-4 w-px bg-border/80 mx-1" />
                  <button
                    type="button"
                    onClick={() => applyFormat("**", "**")}
                    className="grid h-7 w-7 place-items-center rounded hover:bg-background transition-colors"
                    title="Gras"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("*", "*")}
                    className="grid h-7 w-7 place-items-center rounded hover:bg-background transition-colors"
                    title="Italique"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("> ")}
                    className="grid h-7 w-7 place-items-center rounded hover:bg-background transition-colors"
                    title="Citation"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-4 w-px bg-border/80 mx-1" />
                  <button
                    type="button"
                    onClick={() => applyFormat("- ")}
                    className="grid h-7 w-7 place-items-center rounded hover:bg-background transition-colors"
                    title="Liste à puces"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("1. ")}
                    className="grid h-7 w-7 place-items-center rounded hover:bg-background transition-colors"
                    title="Liste numérotée"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Rédigez le contenu ici ou cliquez sur « Insérer un modèle » ci-dessus pour démarrer rapidement…"
                  rows={12}
                  className="rounded-t-none font-sans text-xs leading-relaxed"
                />

                <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1 px-1">
                  <span>Prend en charge le texte simple et la mise en forme Markdown.</span>
                  <span>{content.trim() ? content.trim().split(/\s+/).length : 0} mots</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditor}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="gap-2 font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Publication…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Publier
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

