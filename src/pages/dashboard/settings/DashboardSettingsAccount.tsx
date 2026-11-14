import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Shield,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function DashboardSettingsAccount() {
  const { user, profile } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Mot de passe mis à jour avec succès !");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <Link
            to="/dashboard/settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Retour aux paramètres"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Sécurité & Compte
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gérez votre mot de passe, vos identifiants et la sécurité de votre compte créateur.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Account Info Card */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Informations du compte
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Adresse email</label>
                <div className="h-10 rounded-lg border border-border bg-muted/40 px-3 flex items-center font-mono text-foreground">
                  {user?.email || "Non renseigné"}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1 font-medium">Statut de sécurité</label>
                <div className="h-10 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30 px-3 flex items-center text-emerald-700 dark:text-emerald-400 gap-1.5 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Authentifié et protégé
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <form onSubmit={handleUpdatePassword} className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" /> Modifier le mot de passe
            </h2>
            <p className="text-xs text-muted-foreground">
              Choisissez un mot de passe robuste d'au moins 6 caractères pour sécuriser vos revenus et votre boutique.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Nouveau mot de passe
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Confirmer le mot de passe
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingPassword || !newPassword}
                className="h-10 font-semibold gap-2"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mise à jour…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

