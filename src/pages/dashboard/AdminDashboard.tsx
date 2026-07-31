import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, DollarSign, Package, Store, Wallet, Shield, MessageCircle, TrendingUp, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  usersCount: number;
  totalRevenue: number;
  totalCommissions: number;
  productsCount: number;
  storesCount: number;
  dailySales: Record<string, number>;
  pendingWithdrawals: number;
  pendingKyc: number;
  openTickets: number;
  totalOrders: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email !== "isidoreagonan@gmail.com") return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "stats" },
      });
      if (!error && data) setStats(data);
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== "isidoreagonan@gmail.com") {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">Accès non autorisé</div>
      </DashboardLayout>
    );
  }

  const chartData = stats
    ? Object.entries(stats.dailySales)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date: date.slice(5), amount }))
    : [];

  const statCards = stats ? [
    { label: "Utilisateurs", value: stats.usersCount, icon: Users, color: "from-blue-500/20 to-blue-600/5 text-blue-600" },
    { label: "Revenu total", value: `${(stats.totalRevenue).toLocaleString()} F`, icon: TrendingUp, color: "from-green-500/20 to-green-600/5 text-green-600" },
    { label: "Commissions", value: `${(stats.totalCommissions).toLocaleString()} F`, icon: DollarSign, color: "from-purple-500/20 to-purple-600/5 text-purple-600" },
    { label: "Commandes", value: stats.totalOrders, icon: ShoppingCart, color: "from-orange-500/20 to-orange-600/5 text-orange-600" },
    { label: "Produits", value: stats.productsCount, icon: Package, color: "from-pink-500/20 to-pink-600/5 text-pink-600" },
    { label: "Boutiques", value: stats.storesCount, icon: Store, color: "from-indigo-500/20 to-indigo-600/5 text-indigo-600" },
  ] : [];

  const alertCards = stats ? [
    { label: "Retraits en attente", value: stats.pendingWithdrawals, icon: Wallet, route: "/dashboard/admin-withdrawals", color: "text-orange-600 bg-orange-500/10" },
    { label: "KYC en attente", value: stats.pendingKyc, icon: Shield, route: "/dashboard/admin-kyc", color: "text-yellow-600 bg-yellow-500/10" },
    { label: "Tickets ouverts", value: stats.openTickets, icon: MessageCircle, route: "/dashboard/admin-support", color: "text-blue-600 bg-blue-500/10" },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administration</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : stats && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className={`rounded-2xl border border-border/60 bg-gradient-to-br ${card.color} p-4`}
                >
                  <card.icon className="h-5 w-5 mb-2 opacity-70" />
                  <p className="text-xl font-bold">{card.value}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {alertCards.map((card, i) => (
                <motion.button
                  key={card.label}
                  custom={i + 6}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  onClick={() => navigate(card.route)}
                  className="rounded-2xl border border-border/60 bg-card p-4 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${card.color}`}>
                        <card.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{card.label}</span>
                    </div>
                    {card.value > 0 && (
                      <Badge variant="destructive" className="text-xs">{card.value}</Badge>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Sales Chart */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border/60 bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">Ventes des 30 derniers jours</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                        formatter={(v: number) => [`${v.toLocaleString()} FCFA`, "Ventes"]}
                      />
                      <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#adminGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
