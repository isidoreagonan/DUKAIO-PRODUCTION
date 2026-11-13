import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, Clock, XCircle, Loader2, AlertTriangle, ArrowRight } from "lucide-react";

interface Verification {
  id: string;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  full_name: string | null;
  country: string | null;
  city: string | null;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "En cours de vérification", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50" },
  approved: { label: "Identité vérifiée", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50" },
  rejected: { label: "Vérification refusée", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

const ADMIN_EMAIL = "isidoreagonan@gmail.com";

const DashboardAccountTab = () => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const navigate = useNavigate();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(true);

  useEffect(() => {
    if (user) loadVerification();
  }, [user]);

  // Realtime: update KYC status instantly when identity_verifications changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`identity_verifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "identity_verifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as Verification | null;
          if (row) {
            setVerification(row);
            if ((payload.new as any)?.status === "approved") {
              toast.success("✓ Identité vérifiée avec succès !");
            } else if ((payload.new as any)?.status === "rejected") {
              toast.error("Vérification refusée.");
            }
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadVerification = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("identity_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setVerification(data as Verification | null);
    setLoadingKyc(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const st = verification ? statusConfig[verification.status] : null;
  const StatusIcon = st?.icon;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Account */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Compte</h3>
        <p className="text-sm text-muted-foreground">Email : {user?.email}</p>
        <Button variant="destructive" onClick={handleSignOut} className="rounded-xl">
          Se déconnecter
        </Button>
      </div>

      {!isAdmin && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 flex items-center justify-center">
                <Shield className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Vérification d'identité (KYC)</h3>
                <p className="text-xs text-muted-foreground">Obligatoire pour débloquer vos retraits</p>
              </div>
            </div>

            {st && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.color}`}>
                {st.label}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Pour assurer la conformité financière et sécuriser vos virements vers vos comptes Mobile Money ou bancaires, vous devez renseigner vos informations d'identité et importer une pièce d'identité officielle valide.
          </p>

          {loadingKyc ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {verification && st && (
                <div className={`rounded-xl border p-4 ${st.bg} space-y-2`}>
                  <div className="flex items-center gap-2">
                    {StatusIcon && <StatusIcon className={`h-5 w-5 ${st.color}`} />}
                    <span className={`text-sm font-bold ${st.color}`}>{st.label}</span>
                  </div>

                  {verification.status === "pending" && (
                    <p className="text-xs text-muted-foreground">
                      Votre dossier a bien été soumis et est en cours d'examen par notre équipe de conformité (délai indicatif 24h à 48h).
                    </p>
                  )}

                  {verification.status === "approved" && (
                    <p className="text-xs text-muted-foreground">
                      Identité confirmée : <strong>{verification.full_name}</strong>
                    </p>
                  )}

                  {verification.status === "rejected" && verification.rejection_reason && (
                    <div className="flex items-start gap-1.5 text-xs text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>Motif du rejet : {verification.rejection_reason}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground">
                    Soumis le {new Date(verification.submitted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <ul className="text-xs text-muted-foreground space-y-1.5 pl-4 list-disc">
                  <li>Informations personnelles (Nom, prénom, date de naissance, pays, nationalité)</li>
                  <li>Pièce officielle acceptée (CNI / CIP, Passeport ou Permis de conduire)</li>
                  <li>Importation sécurisée des faces recto et verso en photo ou scan net</li>
                </ul>

                <Button
                  onClick={() => navigate("/dashboard/kyc")}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  {verification?.status === "approved"
                    ? "Consulter mes documents KYC"
                    : verification?.status === "pending"
                    ? "Suivre ma vérification KYC"
                    : verification?.status === "rejected"
                    ? "Recommencer la vérification"
                    : "Démarrer la vérification"}
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAccountTab;
