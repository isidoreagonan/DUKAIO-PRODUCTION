import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Palette, Settings, ExternalLink, Activity, Globe, Send, Scale, Sparkles, Store, ArrowRight, Laptop, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardProfileTab from "@/components/dashboard/DashboardProfileTab";
import DashboardAppearanceTab from "@/components/dashboard/DashboardAppearanceTab";
import DashboardAccountTab from "@/components/dashboard/DashboardAccountTab";
import DashboardPixelsTab from "@/components/dashboard/DashboardPixelsTab";
import DashboardDomainTab from "@/components/dashboard/DashboardDomainTab";
import DashboardTelegramTab from "@/components/dashboard/DashboardTelegramTab";
import DashboardLegalTab from "@/components/dashboard/DashboardLegalTab";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useSearchParams, Link } from "react-router-dom";
import { getStoreUrl } from "@/lib/subdomain";

const VALID_TABS = ["profile", "store", "appearance", "pixels", "account", "domain", "telegram", "legal"];

const DashboardSettings = () => {
  const { activeStore } = useActiveStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "profile";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Paramètres</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Gérez votre boutique, apparence et compte</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/dashboard/store-editor">
              <Button size="sm" className="gap-1.5 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Studio Boutique (Plein écran)</span>
              </Button>
            </Link>
            {activeStore?.slug && (
              <a
                href={getStoreUrl(activeStore.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visiter ma boutique
              </a>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { const next = new URLSearchParams(searchParams); next.set("tab", v); setSearchParams(next, { replace: true }); }} className="w-full">
          <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto scrollbar-none">
            <TabsTrigger value="profile" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <User className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Profil &</span> Boutique
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm text-primary font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Studio Boutique</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Palette className="h-3.5 w-3.5" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="pixels" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Pixels &</span> Tracking
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Compte &</span> KYC
            </TabsTrigger>
            <TabsTrigger value="domain" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Globe className="h-3.5 w-3.5" />
              Domaine
            </TabsTrigger>
            <TabsTrigger value="telegram" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Send className="h-3.5 w-3.5" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Scale className="h-3.5 w-3.5" />
              Mentions légales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-5">
            <DashboardProfileTab />
          </TabsContent>

          <TabsContent value="store" className="mt-5">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    Studio Plein Écran
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Personnaliser l'apparence de votre boutique
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Accédez au nouveau studio de personnalisation professionnel. Modifiez vos titres, bannières, couleurs, typographies et sections avec un aperçu interactif en direct sur Mobile, Tablette et Ordinateur.
                  </p>
                </div>
                <Link to="/dashboard/store-editor">
                  <Button size="lg" className="gap-2 font-bold bg-primary text-primary-foreground shadow-md hover:opacity-90">
                    <Sparkles className="h-4 w-4" />
                    Ouvrir le Studio Plein Écran
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <Palette className="h-4 w-4 text-blue-500" />
                    Couleurs & Polices
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Personnalisez votre palette d'accentuation, les arrondis des cadres et la typographie.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <Smartphone className="h-4 w-4 text-emerald-500" />
                    Aperçu Multi-Écrans
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visualisez instantanément le rendu sur iPhone, iPad et grand écran d'ordinateur.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <Laptop className="h-4 w-4 text-purple-500" />
                    Cadres carrés parfaits
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vos produits s'affichent avec des visuels carrés nets et les badges promotionnels.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-5">
            <DashboardProfileTab />
          </TabsContent>
          <TabsContent value="appearance" className="mt-5">
            <DashboardAppearanceTab />
          </TabsContent>
          <TabsContent value="pixels" className="mt-5">
            <DashboardPixelsTab />
          </TabsContent>
          <TabsContent value="account" className="mt-5">
            <DashboardAccountTab />
          </TabsContent>
          <TabsContent value="domain" className="mt-5">
            <DashboardDomainTab />
          </TabsContent>
          <TabsContent value="telegram" className="mt-5">
            <DashboardTelegramTab />
          </TabsContent>
          <TabsContent value="legal" className="mt-5">
            <DashboardLegalTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
