import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardDomainTab from "@/components/dashboard/DashboardDomainTab";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useActiveStore } from "@/hooks/useActiveStore";
import { getStoreUrl } from "@/lib/subdomain";

export default function DashboardSettingsDomain() {
  const { activeStore } = useActiveStore();

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6">
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
                Nom de domaine
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Connectez et personnalisez le nom de domaine de votre boutique.
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

        <DashboardDomainTab />
      </div>
    </DashboardLayout>
  );
}

