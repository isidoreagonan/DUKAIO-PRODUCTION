import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Link2, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardAffiliation = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Affiliation</h1>
          <p className="text-sm text-muted-foreground mt-1">Développez vos ventes grâce aux affiliés</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Link2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Programme d'affiliation</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Permettez à d'autres personnes de promouvoir vos produits et gagnez plus de clients grâce au bouche-à-oreille digital.
          </p>
          <Button variant="outline" className="rounded-full" disabled>Bientôt disponible</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAffiliation;
