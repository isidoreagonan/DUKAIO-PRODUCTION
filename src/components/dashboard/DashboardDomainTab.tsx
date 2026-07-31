import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Sparkles } from "lucide-react";
import { useActiveStore } from "@/hooks/useActiveStore";

const DashboardDomainTab = () => {
  const { activeStore } = useActiveStore();

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Connecter un nom de domaine</CardTitle>
            </div>
            <Badge variant="secondary" className="gap-1.5 bg-accent/15 text-accent-foreground border-accent/30">
              <Sparkles className="h-3 w-3" />
              À venir bientôt
            </Badge>
          </div>
          <CardDescription>
            Bientôt vous pourrez connecter votre propre nom de domaine (ex: maboutique.com) à votre boutique Dukaio.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 text-center">
            <Globe className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Fonctionnalité en cours de préparation
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Nous mettons en place une infrastructure sécurisée (SSL automatique, vérification DNS) pour que vos clients puissent accéder à votre boutique via votre propre domaine.
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              En attendant, votre boutique est accessible à :{" "}
              <span className="font-medium text-foreground">
                dukaio.com/store/{activeStore?.slug || "votre-boutique"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDomainTab;
