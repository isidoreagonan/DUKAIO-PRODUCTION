import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package, DollarSign, Users, Plus, Workflow, Tag, TrendingUp,
  ExternalLink, ArrowUpRight, ShoppingCart, Eye, BarChart3,
  ArrowUp, ArrowDown, Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0, published: 0, totalRevenue: 0, weekRevenue: 0,
    prevWeekRevenue: 0, clients: 0, totalSales: 0, weekSales: 0, visits: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [productsRes, ordersRes, visitsRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }).eq("creator_id", user.id),
        supabase.from("orders").select("amount, created_at, customer_id, product_id, status").eq("store_owner_id", user.id).eq("status", "completed"),
        supabase.from("store_visits").select("created_at").eq("store_owner_id", user.id).gte("created_at", subDays(new Date(), 30).toISOString()),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const published = products.filter((p: any) => p.is_published).length;
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);

      const weekAgo = subDays(new Date(), 7);
      const twoWeeksAgo = subDays(new Date(), 14);
      const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
      const prevWeekOrders = orders.filter(o => new Date(o.created_at) >= twoWeeksAgo && new Date(o.created_at) < weekAgo);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const prevWeekRevenue = prevWeekOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      const uniqueClients = new Set(orders.map(o => o.customer_id)).size;

      setStats({
        products: productsRes.count || 0,
        published,
        totalRevenue,
        weekRevenue,
        prevWeekRevenue,
        clients: uniqueClients,
        totalSales: orders.length,
        weekSales: weekOrders.length,
        visits: visitsRes.data?.length || 0,
      });

      // Chart data - 30 days
      const interval = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
      const chart = interval.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayOrders = orders.filter(o => format(new Date(o.created_at), "yyyy-MM-dd") === dayStr);
        const dayVisits = (visitsRes.data || []).filter((v: any) => format(new Date(v.created_at), "yyyy-MM-dd") === dayStr);
        return {
          date: format(day, "dd", { locale: fr }),
          fullDate: format(day, "dd MMM", { locale: fr }),
          revenue: dayOrders.reduce((s, o) => s + Number(o.amount), 0),
          ventes: dayOrders.length,
          visites: dayVisits.length,
        };
      });
      setChartData(chart);

      // Top products
      const salesByProduct: Record<string, { total: number; count: number }> = {};
      orders.forEach(o => {
        if (!salesByProduct[o.product_id]) salesByProduct[o.product_id] = { total: 0, count: 0 };
        salesByProduct[o.product_id].total += Number(o.amount);
        salesByProduct[o.product_id].count += 1;
      });
      const enriched = products.map((p: any) => ({
        ...p,
        salesTotal: salesByProduct[p.id]?.total || 0,
        salesCount: salesByProduct[p.id]?.count || 0,
      }));
      enriched.sort((a: any, b: any) => b.salesTotal - a.salesTotal);
      setTopProducts(enriched.slice(0, 5));

      // Recent orders
      const { data: recent } = await supabase
        .from("orders")
        .select("id, amount, status, created_at, products(title), customers(name)")
        .eq("store_owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentOrders(recent || []);
    };
    fetchStats();
  }, [user]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const revenueChange = stats.prevWeekRevenue > 0
    ? Math.round(((stats.weekRevenue - stats.prevWeekRevenue) / stats.prevWeekRevenue) * 100)
    : stats.weekRevenue > 0 ? 100 : 0;

  const kpiCards = [
    {
      label: "Revenu total",
      value: `${stats.totalRevenue.toLocaleString()} F`,
      sub: `${stats.weekRevenue.toLocaleString()} F cette semaine`,
      icon: DollarSign,
      change: revenueChange,
      isHero: true,
    },
    {
      label: "Ventes totales",
      value: stats.totalSales.toString(),
      sub: `${stats.weekSales} cette semaine`,
      icon: ShoppingCart,
      change: null,
      isHero: false,
    },
    {
      label: "Visiteurs (30j)",
      value: stats.visits.toLocaleString(),
      sub: "Derniers 30 jours",
      icon: Eye,
      change: null,
      isHero: false,
    },
    {
      label: "Clients uniques",
      value: stats.clients.toString(),
      sub: `${stats.published} produits publiés`,
      icon: Users,
      change: null,
      isHero: false,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg p-3 min-w-[140px]">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">{payload[0]?.payload?.fullDate}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-muted-foreground capitalize">{entry.dataKey}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">
              {entry.dataKey === "revenue" ? `${entry.value.toLocaleString()} F` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {getGreeting()}, {profile?.display_name || "Créateur"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Vue d'ensemble de votre activité
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5 text-xs h-8 border-border/60"
              onClick={() => navigate("/dashboard/analytics")}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analytiques
            </Button>
            <Button
              size="sm"
              className="rounded-full gap-1.5 text-xs h-8"
              onClick={() => navigate("/dashboard/products/new")}
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau produit
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className={`group relative rounded-3xl p-5 sm:p-6 overflow-hidden transition-all duration-500 ${
                card.isHero
                  ? "dash-hero-3d text-white"
                  : "dash-glass dash-glow-soft"
              }`}
            >
              <div className="flex items-start justify-between mb-5 relative">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                  card.isHero
                    ? "bg-white/20 backdrop-blur-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border border-white/30"
                    : "bg-gradient-to-br from-[hsl(var(--blue-bright))] to-[hsl(var(--blue-deep))] text-white shadow-[0_8px_20px_-4px_hsl(var(--blue-bright)/0.5),inset_0_1px_0_rgba(255,255,255,0.3)]"
                }`}>
                  <card.icon className="h-5 w-5" />
                </div>
                {card.change !== null && (
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                    card.isHero
                      ? "bg-white/25 text-white border border-white/40"
                      : card.change >= 0
                        ? "bg-[hsl(var(--neon-green))]/10 text-[hsl(var(--neon-green))] border border-[hsl(var(--neon-green))]/30"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}>
                    {card.change >= 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <p className={`text-[10px] uppercase tracking-[0.18em] font-bold mb-2 ${
                card.isHero ? "text-white/80" : "text-muted-foreground"
              }`}>{card.label}</p>
              <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums leading-none dash-count-up ${
                card.isHero ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]" : "dash-gradient-text"
              }`}>{card.value}</p>
              <p className={`text-[11px] mt-2 ${
                card.isHero ? "text-white/70" : "text-muted-foreground"
              }`}>{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Revenue chart - takes 2 cols */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-2 rounded-3xl dash-glass dash-glow-soft p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Revenus & Ventes</h3>
                <p className="text-[11px] text-muted-foreground">30 derniers jours</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Revenu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Ventes</span>
                </div>
              </div>
            </div>
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="ventes" stroke="#10b981" strokeWidth={2} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Visits mini chart */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rounded-3xl dash-glass dash-glow-soft p-4 sm:p-5"
          >
            <div className="mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Visites</h3>
              <p className="text-[11px] text-muted-foreground">30 derniers jours</p>
            </div>
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="visites" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: Top Products */}
        <div className="grid grid-cols-1 gap-3">
          {/* Top Products */}
          <motion.div
            custom={6}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="rounded-3xl dash-glass dash-glow-soft"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 pb-2">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Meilleurs produits</h3>
                <p className="text-[11px] text-muted-foreground">Par chiffre d'affaires</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full text-xs h-7" onClick={() => navigate("/dashboard/products")}>
                Voir tout
              </Button>
            </div>

            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Package className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Aucun produit</p>
                  <p className="text-xs text-muted-foreground mb-3">Créez votre premier produit</p>
                  <Button size="sm" className="rounded-full gap-1.5 h-8 text-xs" onClick={() => navigate("/dashboard/products/new")}>
                    <Plus className="h-3.5 w-3.5" /> Créer
                  </Button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {topProducts.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                    >
                      <span className="text-[11px] font-bold text-muted-foreground/50 w-4 text-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {p.thumbnail_url ? (
                          <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-3.5 w-3.5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground">{p.salesCount} vente{p.salesCount > 1 ? "s" : ""}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground tabular-nums shrink-0">{p.salesTotal.toLocaleString()} F</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
