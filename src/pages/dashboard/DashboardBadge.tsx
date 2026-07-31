import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Crown, Gem, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import VerifiedBadge from "@/components/VerifiedBadge";

const GRADES = [
  { grade: "standard" as const, name: "Standard", price: 1000, threshold: 100_000, icon: ShieldCheck, color: "from-sky-400 to-blue-600" },
  { grade: "pro" as const, name: "Pro", price: 1500, threshold: 500_000, icon: Crown, color: "from-amber-300 to-amber-600" },
  { grade: "premium" as const, name: "Premium", price: 3000, threshold: 1_000_000, icon: Gem, color: "from-violet-400 to-purple-700" },
];

const DashboardBadge = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [badge, setBadge] = useState<any>(null);
  const [scan, setScan] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [badgeRes, scanRes] = await Promise.all([
      supabase.from("verified_badges").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("badge_eligibility_scans").select("*").eq("user_id", user.id).order("scanned_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setBadge(badgeRes.data);
    setScan(scanRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const requestScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-badge-eligibility", {
        body: { user_id: user?.id },
      });
      if (error) throw error;
      toast.success("Analyse terminée !");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'analyse");
    } finally {
      setScanning(false);
    }
  };

  const subscribe = async () => {
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-badge", {});
      if (error) throw error;
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("URL de paiement manquante");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const revenue = Number(scan?.total_revenue || 0);
  const isEligible = scan?.is_eligible;
  const computedGrade = scan?.computed_grade as "standard" | "pro" | "premium" | null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Mon Badge Verify
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Crédibilisez votre boutique avec un badge officiel de vendeur vérifié.</p>
        </div>

        {/* Current badge status */}
        {badge && badge.status === "active" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <VerifiedBadge grade={badge.grade} size="lg" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Badge {badge.grade.toUpperCase()} actif ✨</h3>
                    <p className="text-sm text-muted-foreground">
                      Expire le {new Date(badge.expires_at).toLocaleDateString("fr-FR")}
                      {badge.granted_by_admin && " (accordé par l'administration)"}
                    </p>
                  </div>
                  {!badge.granted_by_admin && (
                    <Button onClick={subscribe} disabled={paying}>
                      {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Renouveler 1 mois"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {badge && badge.status === "pending_payment" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <CheckCircle2 className="h-10 w-10 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Vous êtes éligible au badge {badge.grade.toUpperCase()} 🎉</h3>
                  <p className="text-sm text-muted-foreground">Activez votre badge en payant l'abonnement mensuel.</p>
                </div>
                <Button size="lg" onClick={subscribe} disabled={paying} className="w-full sm:w-auto">
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : `Activer pour ${GRADES.find(g => g.grade === badge.grade)?.price} FCFA/mois`}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats / progression */}
        <Card>
          <CardHeader>
            <CardTitle>Votre progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Revenu total" value={`${revenue.toLocaleString()} FCFA`} />
              <Stat label="Ventes (30j)" value={scan?.sales_last_30d ?? 0} />
              <Stat label="Visites (30j)" value={scan?.visits_last_30d ?? 0} />
              <Stat label="Avis positifs" value={scan?.positive_reviews ?? 0} />
            </div>

            <div className="space-y-3 pt-2">
              {GRADES.map((g) => {
                const pct = Math.min(100, (revenue / g.threshold) * 100);
                const reached = revenue >= g.threshold;
                return (
                  <div key={g.grade}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium flex items-center gap-1">
                        <g.icon className="h-3 w-3" /> {g.name} • {g.price} FCFA/mois
                      </span>
                      <span className={reached ? "text-green-600 font-semibold" : "text-muted-foreground"}>
                        {revenue.toLocaleString()} / {g.threshold.toLocaleString()} FCFA
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>

            {!scan?.kyc_verified && (
              <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>La vérification d'identité (KYC) est obligatoire pour obtenir un badge.</span>
              </div>
            )}

            {scan?.ai_reasoning && (
              <div className="text-xs bg-muted p-3 rounded-lg">
                <strong>Analyse IA :</strong> {scan.ai_reasoning}
                {scan.ai_score != null && (
                  <Badge variant="outline" className="ml-2">Score: {scan.ai_score}/100</Badge>
                )}
              </div>
            )}

            <Button variant="outline" onClick={requestScan} disabled={scanning} className="w-full">
              {scanning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Lancer une analyse IA maintenant
            </Button>
          </CardContent>
        </Card>

        {/* Grades grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GRADES.map((g) => (
            <Card key={g.grade} className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${g.color}`} />
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <VerifiedBadge grade={g.grade} size="md" />
                  <h3 className="font-bold">{g.name}</h3>
                </div>
                <p className="text-2xl font-bold">{g.price} <span className="text-sm font-normal text-muted-foreground">FCFA/mois</span></p>
                <p className="text-xs text-muted-foreground">À partir de {g.threshold.toLocaleString()} FCFA de ventes</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-muted/30 rounded-lg p-3">
    <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wide">{label}</p>
    <p className="text-lg font-bold mt-1">{value}</p>
  </div>
);

export default DashboardBadge;
