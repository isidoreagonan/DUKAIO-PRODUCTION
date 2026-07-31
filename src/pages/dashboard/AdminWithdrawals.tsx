import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Wallet, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  operator: string;
  phone_number: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  user_id: string;
  profile: { display_name: string | null; first_name: string | null; last_name: string | null; phone: string | null } | null;
}

const AdminWithdrawals = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email !== "isidoreagonan@gmail.com") return;
    fetchWithdrawals();
  }, [user]);

  const fetchWithdrawals = async () => {
    const { data } = await supabase.functions.invoke("admin-platform", {
      body: { action: "list_withdrawals" },
    });
    setWithdrawals(data?.withdrawals || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    const { error } = await supabase.functions.invoke("admin-platform", {
      body: { action: "update_withdrawal", withdrawalId: id, status },
    });
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(status === "completed" ? "Retrait approuvé" : "Retrait rejeté");
      fetchWithdrawals();
    }
    setProcessing(null);
  };

  const filtered = withdrawals.filter((w) => filter === "all" || w.status === filter);

  const getName = (w: Withdrawal) => {
    if (w.profile?.first_name || w.profile?.last_name) {
      return `${w.profile.last_name || ""} ${w.profile.first_name || ""}`.trim();
    }
    return w.profile?.display_name || "Inconnu";
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "outline" },
      processing: { label: "En cours", variant: "secondary" },
      completed: { label: "Complété", variant: "default" },
      rejected: { label: "Rejeté", variant: "destructive" },
      failed: { label: "Échoué", variant: "destructive" },
    };
    const s = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant} className="text-xs">{s.label}</Badge>;
  };

  if (user?.email !== "isidoreagonan@gmail.com") {
    return <DashboardLayout><div className="text-center py-20 text-muted-foreground">Accès non autorisé</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-6 w-6" /> Gestion des retraits
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{withdrawals.length} retrait(s) total</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="completed">Complétés</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
            Aucun retrait trouvé
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border/60 bg-card p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{getName(w)}</p>
                      {statusBadge(w.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {w.operator.toUpperCase()} · {w.phone_number} · {format(new Date(w.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{w.net_amount.toLocaleString()} FCFA</p>
                    <p className="text-[11px] text-muted-foreground">Frais: {w.fee} FCFA</p>
                  </div>
                  {w.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(w.id, "completed")}
                        disabled={processing === w.id}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(w.id, "rejected")}
                        disabled={processing === w.id}
                        className="gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminWithdrawals;
