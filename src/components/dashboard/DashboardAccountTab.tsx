import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, CheckCircle2, Clock, XCircle, Loader2, AlertTriangle, ExternalLink, ScanFace } from "lucide-react";

interface Verification {
  id: string;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  full_name: string | null;
  country: string | null;
  city: string | null;
  didit_session_id: string | null;
  didit_session_url: string | null;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "En cours de vérification", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  approved: { label: "Identité vérifiée", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  rejected: { label: "Vérification refusée", icon: XCircle, color: "text-destructive", bg: "bg-destructive/5 border-destructive/20" },
};

const ADMIN_EMAIL = "isidoreagonan@gmail.com";

const DashboardAccountTab = () => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => { if (user) loadVerification(); }, [user]);

  // Realtime: update KYC status instantly when Didit webhook updates the row
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
              toast.error("Vérification refusée par Didit.");
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // After Didit redirect callback, refresh verification (webhook may take a few seconds)
  useEffect(() => {
    if (searchParams.get("kyc") === "callback") {
      const status = searchParams.get("status");
      if (status === "Approved") {
        toast.success("Vérification approuvée ! Mise à jour en cours…");
      } else if (status === "Declined") {
        toast.error("Vérification refusée par Didit.");
      } else {
        toast.info("Vérification reçue, traitement en cours…");
      }
      const interval = setInterval(loadVerification, 3000);
      const timeout = setTimeout(() => clearInterval(interval), 60000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [searchParams]);

  const loadVerification = async () => {
    if (!user) return;
    const { data } = await supabase.from("identity_verifications").select("*").eq("user_id", user.id).maybeSingle();
    setVerification(data as Verification | null);
    setLoadingKyc(false);
  };

  const handleStartDidit = async () => {
    setStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke("didit-create-session", { body: {} });
      if (error) throw error;
      if (!data?.url) throw new Error("URL de vérification manquante");
      // Redirect user to Didit hosted flow
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Impossible de lancer la vérification");
      setStarting(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const st = verification ? statusConfig[verification.status] : null;
  const StatusIcon = st?.icon;
  const canRestart = !verification || verification.status === "rejected";

  return (
    <div className="max-w-2xl space-y-8">
      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Compte</h3>
        <p className="text-sm text-muted-foreground">Email : {user?.email}</p>
        <Button variant="destructive" onClick={handleSignOut}>Se déconnecter</Button>
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Vérification d'identité (KYC)</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            La vérification est requise pour effectuer des retraits. Elle est traitée automatiquement par notre partenaire
            sécurisé <span className="font-medium">Didit</span> (pièce d'identité + selfie + détection de vie).
          </p>

          {loadingKyc ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {verification && st && (
                <div className={`rounded-lg border p-4 ${st.bg}`}>
                  <div className="flex items-center gap-2">
                    {StatusIcon && <StatusIcon className={`h-5 w-5 ${st.color}`} />}
                    <span className={`text-sm font-medium ${st.color}`}>{st.label}</span>
                  </div>
                  {verification.status === "pending" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {verification.didit_session_url
                        ? "Vous pouvez reprendre la vérification si vous l'avez quittée."
                        : "Vos documents sont en cours d'examen."}
                    </p>
                  )}
                  {verification.status === "approved" && verification.full_name && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Identité confirmée : {verification.full_name}
                      {verification.country ? ` — ${verification.country}` : ""}
                    </p>
                  )}
                  {verification.status === "rejected" && verification.rejection_reason && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">Motif : {verification.rejection_reason}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Soumis le {new Date(verification.submitted_at).toLocaleDateString("fr", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              )}

              {verification?.status === "pending" && verification.didit_session_url && (
                <Button variant="outline" onClick={() => window.location.href = verification.didit_session_url!} className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Reprendre la vérification
                </Button>
              )}

              {canRestart && (
                <div className="space-y-3">
                  <ul className="text-xs text-muted-foreground space-y-1.5 pl-4 list-disc">
                    <li>Préparez une pièce d'identité valide (CNI, passeport, permis)</li>
                    <li>Activez la caméra de votre appareil pour le selfie</li>
                    <li>La vérification prend moins de 2 minutes</li>
                  </ul>
                  <Button onClick={handleStartDidit} disabled={starting} className="w-full gap-2">
                    {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanFace className="h-4 w-4" />}
                    {verification?.status === "rejected" ? "Recommencer la vérification" : "Démarrer la vérification"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Vous serez redirigé vers la plateforme sécurisée Didit, puis ramené sur votre tableau de bord.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAccountTab;
