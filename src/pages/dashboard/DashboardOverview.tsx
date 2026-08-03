import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, ShoppingCart, Wallet, Package, Info, ArrowUpRight, TrendingUp, Plus, ExternalLink, ArrowRight, ShoppingBag, Store
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveStore } from "@/hooks/useActiveStore";

export const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const { activeStore } = useActiveStore();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    products: 0,
    published: 0,
    totalRevenue: 0,
    clients: 0,
    totalSales: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }).eq("creator_id", user.id),
        supabase.from("orders").select("amount, created_at, customer_id, product_id, status").eq("store_owner_id", user.id).eq("status", "completed"),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const published = products.filter((p: any) => p.is_published).length;
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);
      const uniqueClients = new Set(orders.map(o => o.customer_id)).size;

      setStats({
        products: productsRes.count || 0,
        published,
        totalRevenue,
        clients: uniqueClients,
        totalSales: orders.length,
      });

      // 30 Days Chart data
      const interval = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
      const chart = interval.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayOrders = orders.filter(o => format(new Date(o.created_at), "yyyy-MM-dd") === dayStr);
        return {
          date: format(day, "dd/MM", { locale: fr }),
          fullDate: format(day, "dd MMM yyyy", { locale: fr }),
          revenue: dayOrders.reduce((s, o) => s + Number(o.amount), 0),
          ventes: dayOrders.length,
        };
      });
      setChartData(chart);

      // Fetch Recent Orders
      const { data: recent } = await supabase
        .from("orders")
        .select("id, amount, status, created_at, products(title), customers(name, email)")
        .eq("store_owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentOrders(recent || []);

      // Top Products calculation
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
      setTopProducts(enriched.slice(0, 4));
    };
    fetchStats();
  }, [user]);

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-xl p-3 min-w-[150px]">
        <p className="text-xs font-semibold text-slate-600 mb-1">{payload[0]?.payload?.fullDate}</p>
        <p className="text-sm font-bold text-blue">
          {payload[0]?.value?.toLocaleString()} XOF
        </p>
        <p className="text-xs text-slate-500 font-medium">
          {payload[0]?.payload?.ventes} commande(s)
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-8 w-full pb-16 pt-4 px-2 sm:px-4">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue font-mono text-xs font-bold uppercase tracking-wider mb-2">
                <Store className="w-3.5 h-3.5 text-blue" />
                <span>{activeStore?.name || "Boutique Dukaio"}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-normal font-serif text-slate-900 tracking-tight">
                Bienvenue <span className="font-serif italic text-blue">{profile?.display_name || user?.email?.split("@")[0] || "Créateur"}</span> !
              </h1>
              <p className="text-sm text-slate-500 font-sans mt-1">
                Aperçu synthétique et performances en temps réel de votre activité.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              {activeStore?.slug && (
                <a
                  href={`/store/${activeStore.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  <span className="text-slate-900 font-bold">Visiter ma boutique</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 stroke-[2]" />
                </a>
              )}

              <button
                onClick={() => navigate("/dashboard/products/new")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md transition-all border border-slate-800"
              >
                <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                <span className="text-white font-bold">Nouveau produit</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards Row - Exact MakeTou Gray Border & White Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Total des clients */}
            <div className="bg-white border border-[#D0D5DD] rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 leading-snug">
                    Total des clients
                  </span>
                </div>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Nombre total de clients uniques ayant acheté dans votre boutique
                  </TooltipContent>
                </UITooltip>
              </div>

              <div className="mt-5">
                <span className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                  {stats.clients}
                </span>
              </div>
            </div>

            {/* Card 2: Total des commandes */}
            <div className="bg-white border border-[#D0D5DD] rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 leading-snug">
                    Total des commandes
                  </span>
                </div>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Nombre total de commandes payées et validées
                  </TooltipContent>
                </UITooltip>
              </div>

              <div className="mt-5">
                <span className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                  {stats.totalSales}
                </span>
              </div>
            </div>

            {/* Card 3: Revenus totaux (Brand Blue) */}
            <div className="bg-[#2563EB] border border-[#2563EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between group text-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white/90 leading-snug">
                    Revenus totaux
                  </span>
                </div>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button className="text-white/60 hover:text-white transition-colors p-1">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs bg-white text-slate-900 border-none shadow-xl">
                    Montant total cumulé de vos encaissements sur Dukaio
                  </TooltipContent>
                </UITooltip>
              </div>

              <div className="mt-5">
                <span className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  {stats.totalRevenue.toLocaleString()} XOF
                </span>
              </div>
            </div>

            {/* Card 4: Total des produits publiés */}
            <div className="bg-white border border-[#D0D5DD] rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 leading-snug">
                    Total des produits publiés
                  </span>
                </div>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Nombre de produits actuellement actifs et en ligne
                  </TooltipContent>
                </UITooltip>
              </div>

              <div className="mt-5">
                <span className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                  {stats.published}
                </span>
              </div>
            </div>

          </div>

          {/* Monthly Sales Chart Card - Exact MakeTou Gray Border & White Style */}
          <div className="bg-white border border-[#D0D5DD] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
                  Ventes mensuelles
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Évolution du volume des transactions sur les 30 derniers jours (XOF)
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <span className="px-3 py-1.5 rounded-lg bg-white shadow-xs text-slate-900 font-bold">30 jours</span>
                <span className="px-3 py-1.5 rounded-lg hover:text-slate-900 transition-colors cursor-pointer">7 jours</span>
              </div>
            </div>

            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2557D6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2557D6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2557D6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid: Recent Transactions & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Recent Orders (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  Dernières transactions
                </h3>
                <button
                  onClick={() => navigate("/dashboard/sales")}
                  className="text-xs font-bold text-blue hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Tout voir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentOrders.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {order.products?.title || "Produit numérique"}
                        </p>
                        <p className="text-xs text-slate-500 font-sans">
                          {order.customers?.name || order.customers?.email || "Acheteur anonyme"} · {format(new Date(order.created_at), "dd MMM HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-slate-900 block">
                          +{Number(order.amount).toLocaleString()} F
                        </span>
                        <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Payé
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2 my-auto">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">Aucune transaction récente</p>
                  <p className="text-xs text-slate-400">Vos prochaines ventes s'afficheront ici en direct.</p>
                </div>
              )}
            </div>

            {/* Top Products (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  Meilleurs produits
                </h3>
                <button
                  onClick={() => navigate("/dashboard/products")}
                  className="text-xs font-bold text-blue hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Gérer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((prod: any, idx: number) => (
                    <div key={prod.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue font-bold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{prod.title}</p>
                          <p className="text-[11px] text-slate-500 font-sans">{prod.salesCount} vente(s)</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 shrink-0">
                        {prod.salesTotal.toLocaleString()} F
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2 my-auto">
                  <Package className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">Aucun produit vendu</p>
                  <p className="text-xs text-slate-400">Ajoutez des produits pour voir votre top classement.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default DashboardOverview;
