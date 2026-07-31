import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Palette, Settings, ExternalLink, Activity, Globe, Send, Scale } from "lucide-react";
import DashboardProfileTab from "@/components/dashboard/DashboardProfileTab";
import DashboardAppearanceTab from "@/components/dashboard/DashboardAppearanceTab";
import DashboardAccountTab from "@/components/dashboard/DashboardAccountTab";
import DashboardPixelsTab from "@/components/dashboard/DashboardPixelsTab";
import DashboardDomainTab from "@/components/dashboard/DashboardDomainTab";
import DashboardTelegramTab from "@/components/dashboard/DashboardTelegramTab";
import DashboardLegalTab from "@/components/dashboard/DashboardLegalTab";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useSearchParams } from "react-router-dom";

const VALID_TABS = ["profile", "appearance", "pixels", "account", "domain", "telegram", "legal"];

const DashboardSettings = () => {
  const { activeStore } = useActiveStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "profile";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Paramètres</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Gérez votre boutique, apparence et compte</p>
          </div>
          {activeStore?.slug && (
            <a
              href={`/store/${activeStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visiter ma boutique
            </a>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { const next = new URLSearchParams(searchParams); next.set("tab", v); setSearchParams(next, { replace: true }); }} className="w-full">
          <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto scrollbar-none">
            <TabsTrigger value="profile" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <User className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Profil &</span> Boutique
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
