import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft, Download, Filter, Calendar, Wallet, Clock, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product_id: string;
  payment_method: string | null;
  products: { title: string } | null;
  customers: { name: string; email: string } | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  operator: string;
  phone_number: string;
  created_at: string;
  processed_at: string | null;
}

type Transaction = {
  id: string;
  type: "sale" | "withdrawal";
  label: string;
  detail: string;
  amount: number;
  netAmount?: number;
  status: string;
  date: string;
  paymentMethod?: string | null;
};

const COMMISSION_RATE = 0.10;

const DashboardRevenue = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "sale" | "withdrawal">("all");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "7d" | "30d" | "90d">("all");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [ordersRes, withdrawalsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, amount, status, created_at, product_id, payment_method, products(title), customers(name, email)")
          .eq("store_owner_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      setOrders((ordersRes.data as any) || []);
      setWithdrawals(withdrawalsRes.data || []);
      setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel(`revenue-withdrawals-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "withdrawals", filter: `user_id=eq.${user.id}` },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce((s, o) => s + Number(o.amount), 0);

    // Maturity delay: 3 calendar days for all payments (Moneroo)
    const cutoff3d = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const maturedRevenue = completedOrders
      .filter(o => new Date(o.created_at) <= cutoff3d)
      .reduce((s, o) => s + Number(o.amount), 0);

    const pendingRevenue = completedOrders
      .filter(o => new Date(o.created_at) > cutoff3d)
      .reduce((s, o) => s + Number(o.amount), 0);
    const commission = maturedRevenue * COMMISSION_RATE;
    const pendingCommission = pendingRevenue * COMMISSION_RATE;
    const netRevenue = maturedRevenue - commission;
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "completed")
      .reduce((s, w) => s + Number(w.amount) + Number(w.fee || 0), 0);
    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === "pending" || w.status === "processing")
      .reduce((s, w) => s + Number(w.amount) + Number(w.fee || 0), 0);
    const available = netRevenue - totalWithdrawn - pendingWithdrawals;
    const pendingFunds = pendingRevenue - pendingCommission;
    return { totalRevenue, netRevenue, commission, totalWithdrawn, pendingWithdrawals, available: Math.max(0, available), pendingFunds, pendingRevenue };
  }, [orders, withdrawals]);

  const transactions = useMemo(() => {
    const items: Transaction[] = [];

    orders.forEach((o) => {
      items.push({
        id: o.id,
        type: "sale",
        label: (o.products as any)?.title || "Produit",
        detail: (o.customers as any)?.name || (o.customers as any)?.email || "Client",
        amount: Number(o.amount),
        netAmount: Number(o.amount) * (1 - COMMISSION_RATE),
        status: o.status,
        date: o.created_at,
        paymentMethod: o.payment_method,
      });
    });

    withdrawals.forEach((w) => {
      items.push({
        id: w.id,
        type: "withdrawal",
        label: `Retrait ${w.operator.toUpperCase()}`,
        detail: w.phone_number,
        amount: Number(w.amount),
        netAmount: Number(w.net_amount),
        status: w.status,
        date: w.created_at,
      });
    });

    // Filter by type
    let filtered = filterType === "all" ? items : items.filter((t) => t.type === filterType);

    // Filter by period
    if (filterPeriod !== "all") {
      const days = filterPeriod === "7d" ? 7 : filterPeriod === "30d" ? 30 : 90;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((t) => new Date(t.date) >= cutoff);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, withdrawals, filterType, filterPeriod]);

  const statusBadge = (status: string, type: "sale" | "withdrawal") => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Complété", variant: "default" },
      pending: { label: "En attente", variant: "secondary" },
      processing: { label: "Traitement", variant: "secondary" },
      failed: { label: "Échoué", variant: "destructive" },
    };
    const s = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  const transitSub = stats.pendingRevenue > 0
    ? `${formatAmount(stats.pendingRevenue)} (délai 3 jours)`
    : "Disponibles bientôt";

  const statCards = [
    { label: "Revenu net", value: formatAmount(stats.netRevenue), icon: TrendingUp, sub: "Après commission Dukaio 10%" },
    ...(stats.pendingFunds > 0 ? [{ label: "En transit", value: formatAmount(stats.pendingFunds), icon: Clock, sub: transitSub }] : []),
    { label: "Disponible retrait", value: formatAmount(stats.available), icon: ArrowUpRight, sub: stats.pendingWithdrawals > 0 ? `${formatAmount(stats.pendingWithdrawals)} en attente` : "Prêt à retirer" },
    { label: "Total retiré", value: formatAmount(stats.totalWithdrawn), icon: Download, sub: `${withdrawals.filter(w => w.status === "completed").length} retrait(s)` },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Revenus</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Suivez vos gains, commissions et retraits en détail
            </p>
          </div>
          <Link to="/dashboard/withdrawals">
            <Button className="gap-2">
              <Wallet className="h-4 w-4" />
              Demander un retrait
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s, idx) => {
            const isFirst = idx === 0;
            return (
              <div 
                key={s.label} 
                className={`rounded-2xl p-6 shadow-sm flex flex-col justify-between group ${isFirst ? 'bg-[#2563EB] border border-[#2563EB] text-white' : 'bg-white border border-[#D0D5DD]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFirst ? 'bg-white/20 text-white' : 'bg-slate-100/90 text-slate-700'}`}>
                      <s.icon className={`w-5 h-5 ${isFirst ? 'text-white' : 'text-slate-700'}`} />
                    </div>
                    <span className={`text-sm font-semibold leading-snug ${isFirst ? 'text-white/90' : 'text-slate-700'}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
                <div className="mt-5">
                  <span className={`font-sans font-bold text-3xl sm:text-4xl tracking-tight ${isFirst ? 'text-white' : 'text-slate-900'}`}>
                    {s.value}
                  </span>
                  <p className={`text-xs mt-1 ${isFirst ? 'text-white/80' : 'text-slate-500'}`}>{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transaction History */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Historique des transactions</h2>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="sale">Ventes</SelectItem>
                  <SelectItem value="withdrawal">Retraits</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as any)}>
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucune transaction trouvée</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Commencez à vendre vos produits pour voir vos transactions ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      t.type === "sale"
                        ? "bg-emerald-500/10"
                        : "bg-orange-500/10"
                    }`}
                  >
                    {t.type === "sale" ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-orange-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                      {t.type === "sale" && (
                        <span className="shrink-0" title="Mobile Money">
                          <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.detail}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        t.type === "sale" ? "text-emerald-600" : "text-orange-600"
                      }`}
                    >
                      {t.type === "sale" ? "+" : "-"}
                      {formatAmount(t.type === "sale" ? t.netAmount! : t.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "dd MMM yyyy, HH:mm", { locale: fr })}
                    </p>
                  </div>

                  <div className="shrink-0">{statusBadge(t.status, t.type)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardRevenue;
