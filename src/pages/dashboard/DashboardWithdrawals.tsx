import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Wallet, ArrowDownToLine, Loader2, CheckCircle2, Clock, XCircle, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  phone_number: string;
  operator: string;
  provider_code?: string | null;
  status: string;
  created_at: string;
}

const ADMIN_EMAIL = "isidoreagonan@gmail.com";

const statusConfig: Record<string, { label: string; icon: any; color: string; badgeBg: string }> = {
  pending: { label: "En attente", icon: Clock, color: "text-amber-600", badgeBg: "bg-amber-50 border-amber-200" },
  processing: { label: "Traitement", icon: Loader2, color: "text-blue-600", badgeBg: "bg-blue-50 border-blue-200" },
  completed: { label: "Payé", icon: CheckCircle2, color: "text-green-600", badgeBg: "bg-green-50 border-green-200" },
  failed: { label: "Échoué", icon: XCircle, color: "text-destructive", badgeBg: "bg-destructive/10 border-destructive/30" },
};

// Délais PawaPay en jours ouvrés selon le pays (T+min / T+max)
const payoutDelaysByCountry: Record<string, { min: number; max: number }> = {
  CMR: { min: 2, max: 3 }, KEN: { min: 2, max: 3 }, UGA: { min: 2, max: 3 },
  SLE: { min: 2, max: 3 }, TZA: { min: 2, max: 3 }, ZMB: { min: 2, max: 3 },
  GHA: { min: 4, max: 5 }, BEN: { min: 4, max: 5 }, COG: { min: 4, max: 5 },
  CIV: { min: 4, max: 5 },
  RWA: { min: 6, max: 11 }, SEN: { min: 6, max: 11 }, GAB: { min: 6, max: 11 },
  COD: { min: 6, max: 11 }, MWI: { min: 6, max: 11 },
};

// Ajoute X jours ouvrés (skip samedi/dimanche) à une date
const addBusinessDays = (date: Date, days: number) => {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
};

const getCountryFromProvider = (providerCode?: string | null): string | null => {
  if (!providerCode) return null;
  const parts = providerCode.split("_");
  return parts[parts.length - 1] || null;
};

const formatEta = (createdAt: string, status: string, providerCode?: string | null): string => {
  if (status === "completed") return "Versé sur votre compte";
  if (status === "failed") return "Retrait échoué";
  const country = getCountryFromProvider(providerCode);
  const delay = country ? payoutDelaysByCountry[country] : null;
  if (!delay) return "Délai en cours d'estimation";
  const start = new Date(createdAt);
  const minDate = addBusinessDays(start, delay.min);
  const maxDate = addBusinessDays(start, delay.max);
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  if (delay.min === delay.max) return `Estimé le ${fmt(minDate)}`;
  return `Estimé entre le ${fmt(minDate)} et le ${fmt(maxDate)}`;
};

const DashboardWithdrawals = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [pendingFunds, setPendingFunds] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, withdrawalsRes, kycRes] = await Promise.all([
      supabase.from("orders").select("amount, created_at").eq("store_owner_id", user!.id).eq("status", "completed"),
      supabase.from("withdrawals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("identity_verifications").select("status").eq("user_id", user!.id).maybeSingle(),
    ]);

    setKycStatus(isAdmin ? "approved" : (kycRes.data?.status || null));

    const now = new Date();
    const cutoff5d = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const allOrders = ordersRes.data || [];
    const sales = allOrders.reduce((s, o) => s + Number(o.amount), 0);
    const maturedSales = allOrders.filter(o => new Date(o.created_at) <= cutoff5d).reduce((s, o) => s + Number(o.amount), 0);
    const pendingSales = sales - maturedSales;
    const commission = maturedSales * 0.10;
    const gross = maturedSales - commission;
    const wds = (withdrawalsRes.data || []) as Withdrawal[];
    const withdrawn = wds.filter(w => ["pending", "processing", "completed"].includes(w.status))
      .reduce((s, w) => s + Number(w.amount) + Number(w.fee || 0), 0);

    setTotalSales(sales);
    setPendingFunds(pendingSales * 0.9);
    setTotalWithdrawn(withdrawn);
    setAvailableBalance(gross - withdrawn);
    setWithdrawals(wds);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Retraits</h1>
          <p className="text-sm text-muted-foreground mt-1">Retirez vos gains via Mobile Money</p>
        </div>

        {!isAdmin && kycStatus !== "approved" && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800 flex items-center justify-between flex-wrap gap-3">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                {!kycStatus && "Vous devez vérifier votre identité avant de pouvoir effectuer des retraits."}
                {kycStatus === "pending" && "Votre vérification d'identité est en cours d'examen."}
                {kycStatus === "rejected" && "Votre vérification a été rejetée. Veuillez soumettre de nouveaux documents."}
              </span>
              <Link to="/dashboard/settings">
                <Button size="sm" variant="outline" className="text-xs">
                  {!kycStatus ? "Vérifier mon identité" : kycStatus === "rejected" ? "Resoumettre" : "Voir le statut"}
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-1">Ventes totales</p>
            <p className="text-2xl font-bold text-foreground">{Math.floor(totalSales).toLocaleString("fr")} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground mb-1">Commission plateforme (10%)</p>
            <p className="text-2xl font-bold text-muted-foreground">{Math.floor(totalSales * 0.10).toLocaleString("fr")} <span className="text-sm font-normal">FCFA</span></p>
          </div>
          {pendingFunds > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Fonds en transit (5 jours)
              </p>
              <p className="text-2xl font-bold text-amber-600">{Math.floor(pendingFunds).toLocaleString("fr")} <span className="text-sm font-normal">FCFA</span></p>
              <p className="text-xs text-muted-foreground mt-1">Disponibles sous 5 jours après la vente</p>
            </div>
          )}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="text-xs text-muted-foreground mb-1">Solde disponible</p>
            <p className="text-2xl font-bold text-foreground">{Math.floor(availableBalance).toLocaleString("fr")} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p>
            {availableBalance < 100 && availableBalance > 0 && (
              <p className="text-xs text-orange-500 mt-1">Minimum de retrait : 100 FCFA</p>
            )}
            {availableBalance >= 100 && (
              <p className="text-xs text-muted-foreground mt-1">Déjà retiré : {Math.floor(totalWithdrawn).toLocaleString("fr")} FCFA</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="gap-2 rounded-full"
            disabled={!isAdmin && kycStatus !== "approved"}
            onClick={() => window.open("/dashboard/withdrawals/new", "_blank", "noopener,noreferrer")}
          >
            <ArrowDownToLine className="h-4 w-4" /> Retirer mes gains
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Historique des retraits</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-border bg-card">
              <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucun retrait pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((w) => {
                const cfg = statusConfig[w.status] || statusConfig.pending;
                const Icon = cfg.icon;
                const eta = formatEta(w.created_at, w.status, w.provider_code);
                return (
                  <div key={w.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{Number(w.amount).toLocaleString("fr")} FCFA</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {w.phone_number} · {new Date(w.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-[11px] text-muted-foreground/90 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {eta}
                        </p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-full border text-xs font-medium ${cfg.color} ${cfg.badgeBg}`}>
                      <Icon className={`h-3.5 w-3.5 ${w.status === 'processing' ? 'animate-spin' : ''}`} />
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardWithdrawals;
