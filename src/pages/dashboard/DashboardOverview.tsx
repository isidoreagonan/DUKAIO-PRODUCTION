import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package, DollarSign, Users, Plus, TrendingUp,
  ShoppingCart, Eye, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Percent, MapPin,
  Clock, CheckCircle2, MoreHorizontal
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
    transition: { delay: i * 0.05, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0, published: 0, totalRevenue: 0, weekRevenue: 0,
    prevWeekRevenue: 0, clients: 0, totalSales: 0, weekSales: 0, visits: 0,
    avgOrderValue: 0, conversionRate: 0,
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
      
      const visits = visitsRes.data?.length || 0;
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      const conversionRate = visits > 0 ? (orders.length / visits) * 100 : 0;

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
        visits,
        avgOrderValue,
        conversionRate
      });

      // Chart data - 30 days
      const interval = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
      const chart = interval.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayOrders = orders.filter(o => format(new Date(o.created_at), "yyyy-MM-dd") === dayStr);
        const dayVisits = (visitsRes.data || []).filter((v: any) => format(new Date(v.created_at), "yyyy-MM-dd") === dayStr);
        return {
          date: format(day, "dd/MM", { locale: fr }),
          fullDate: format(day, "dd MMM yyyy", { locale: fr }),
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
        .select("id, amount, status, created_at, products(title), customers(name, email)")
        .eq("store_owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentOrders(recent || []);
    };
    fetchStats();
  }, [user]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: "Bonjour", emoji: "🌞" };
    if (h < 18) return { text: "Bon après-midi", emoji: "👋" };
    return { text: "Bonsoir", emoji: "🌙" };
  };

  const revenueChange = stats.prevWeekRevenue > 0
    ? ((stats.weekRevenue - stats.prevWeekRevenue) / stats.prevWeekRevenue) * 100
    : stats.weekRevenue > 0 ? 100 : 0;

  const kpiCards = [
    {
      label: "Volume Total",
      value: `${stats.totalRevenue.toLocaleString()} F`,
      sub: `${stats.weekRevenue.toLocaleString()} F / Semaine`,
      icon: Activity,
      change: revenueChange,
      color: "text-blue-600",
      bg: "bg-blue-600/10",
    },
    {
      label: "Ventes Réussies",
      value: stats.totalSales.toString(),
      sub: `${stats.weekSales} cette semaine`,
      icon: CheckCircle2,
      change: null,
      color: "text-emerald-600",
      bg: "bg-emerald-600/10",
    },
    {
      label: "Panier Moyen",
      value: `${Math.round(stats.avgOrderValue).toLocaleString()} F`,
      sub: "Par transaction",
      icon: CreditCard,
      change: null,
      color: "text-violet-600",
      bg: "bg-violet-600/10",
    },
    {
      label: "Clients Uniques",
      value: stats.clients.toString(),
      sub: "Au total",
      icon: Users,
      change: null,
      color: "text-amber-600",
      bg: "bg-amber-600/10",
    },
    {
      label: "Visiteurs (30J)",
      value: stats.visits.toLocaleString(),
      sub: "Trafic de la boutique",
      icon: Eye,
      change: null,
      color: "text-pink-600",
      bg: "bg-pink-600/10",
    },
    {
      label: "Taux de Succès",
      value: `${stats.conversionRate.toFixed(1)}%`,
      sub: "Taux de conversion",
      icon: Percent,
      change: null,
      color: "text-sky-600",
      bg: "bg-sky-600/10",
    },
    {
      label: "Produits Publiés",
      value: stats.published.toString(),
      sub: `Sur ${stats.products} produits`,
      icon: Package,
      change: null,
      color: "text-orange-600",
      bg: "bg-orange-600/10",
    },
    {
      label: "Utilisation Plafond",
      value: "0%",
      sub: "0 / 5 000 000 F",
      icon: Wallet,
      change: null,
      color: "text-slate-600",
      bg: "bg-slate-600/10",
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-slate-200/50 bg-white shadow-xl p-3 min-w-[140px]">
        <p className="text-xs font-semibold text-slate-800 mb-2">{payload[0]?.payload?.fullDate}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-slate-600 capitalize">{entry.dataKey}</span>
            </div>
            <span className="text-xs font-bold text-slate-900">
              {entry.dataKey === "revenue" ? `${entry.value.toLocaleString()} F` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full pb-10">
        {/* Hero Blue Glass Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full rounded-md overflow-hidden dash-hero-3d bg-white/20 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border border-white/20 text-white p-5 sm:p-7 flex flex-col justify-between min-h-[160px] group"
        >
          {/* Animated Background Elements inside Hero */}
          <div className="absolute top-0 right-0 p-10 opacity-30 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="100" fill="url(#paint0_radial)" />
              <defs>
                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(100)">
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  {getGreeting().text} <span className="capitalize">{profile?.display_name?.toLowerCase() || "Créateur"}</span> {getGreeting().emoji}
                </h1>
              </div>
              <p className="text-sm text-white/90 mt-2 font-medium max-w-xl">
                {stats.totalSales > 0 
                  ? "📈 Les premières ventes arrivent - suivez votre dynamique."
                  : "🚀 Votre boutique est configurée - ajoutez votre premier produit pour démarrer."}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap gap-2 sm:gap-3">
            <Button size="sm" className="rounded-full bg-white text-blue-600 hover:bg-slate-50 font-bold h-9 px-4 text-xs">
              <Plus className="h-4 w-4 mr-1.5" /> Nouveau produit
            </Button>
            <Button size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white font-medium h-9 px-4 text-xs backdrop-blur-sm border border-white/20">
              <ShoppingCart className="h-4 w-4 mr-1.5" /> Gérer les ventes
            </Button>
            <Button size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white font-medium h-9 px-4 text-xs backdrop-blur-sm border border-white/20">
              <BarChart3 className="h-4 w-4 mr-1.5" /> Analytiques
            </Button>
          </div>
        </motion.div>

        {/* 8 KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-lg border border-slate-200/50 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow group flex flex-col justify-between h-[110px]"
            >
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <div className={`h-7 w-7 rounded-lg ${card.bg} ${card.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <card.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-slate-500 truncate">{card.sub}</p>
                  {card.change !== null && (
                    <div className={`flex items-center text-[10px] font-bold ${
                      card.change >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}>
                      {card.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Volume des transactions</h3>
              <p className="text-xs text-slate-500">Aperçu quotidien sur les 30 derniers jours (XOF)</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Ventes (qté)</span>
              </div>
            </div>
          </div>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ventes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Top Products (Progress Bar Style) */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5">
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-900">Meilleurs produits</h3>
              <p className="text-xs text-slate-500">Répartition des encaissements (30 jours)</p>
            </div>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-900">Aucun produit</p>
                  <p className="text-xs text-slate-500">Créez votre premier produit pour générer des ventes.</p>
                </div>
              ) : (
                topProducts.map((p, i) => {
                  const maxSales = Math.max(...topProducts.map(t => t.salesTotal));
                  const percentage = maxSales > 0 ? (p.salesTotal / maxSales) * 100 : 0;
                  
                  return (
                    <div key={p.id} className="relative group cursor-pointer" onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5 px-1">
                        <span className="truncate pr-4">{p.title}</span>
                        <span className="shrink-0">{p.salesTotal.toLocaleString()} F</span>
                      </div>
                      <div className="h-8 w-full bg-slate-100 rounded-md overflow-hidden flex relative">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <span className="text-[10px] font-bold text-white mix-blend-difference">{p.salesCount} VENTES</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Recent Orders List */}
          <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900">Dernières transactions</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-medium text-blue-600 hover:text-blue-700 h-auto p-0" onClick={() => navigate("/dashboard/sales")}>
                Tout voir →
              </Button>
            </div>
            
            <div className="flex-1 space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-900">Aucune transaction</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate uppercase">
                          {order.products?.title || "Produit supprimé"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {order.customers?.name || order.customers?.email || "Client inconnu"} • {format(new Date(order.created_at), "dd MMM HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-extrabold text-emerald-600">
                        +{Number(order.amount).toLocaleString()} F
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;
