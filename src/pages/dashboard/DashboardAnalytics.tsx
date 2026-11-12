import { useEffect, useState } from "react";
import {
  BarChart3, ShoppingCart, CreditCard, TrendingUp, Calendar,
  Users, Globe, Edit3, ArrowUpRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { subDays, startOfDay, format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardAnalytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<number>(30);
  const [isCustom, setIsCustom] = useState(false);
  const [customDays, setCustomDays] = useState<string>("60");
  const [loading, setLoading] = useState(true);

  const [visits, setVisits] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalVisits: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    conversionRate: 0,
    activeCountries: 0,
  });

  const effectivePeriod = isCustom && customDays ? parseInt(customDays) || 1 : period;

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 400);
    return () => clearTimeout(timer);
  }, [user, period, isCustom, customDays]);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);
    const startDate = startOfDay(subDays(new Date(), effectivePeriod)).toISOString();

    const [visitsRes, ordersRes] = await Promise.all([
      supabase.from("store_visits").select("*").eq("store_owner_id", user.id).gte("created_at", startDate),
      supabase.from("orders").select("*, products(title), customers(name, email)").eq("store_owner_id", user.id).gte("created_at", startDate),
    ]);

    const v = visitsRes.data || [];
    const o = ordersRes.data || [];
    setVisits(v);
    setOrders(o);

    const uniqueCustomerIds = [...new Set(o.map((ord: any) => ord.customer_id))];
    const uniqueCountries = [...new Set(v.map((vis: any) => vis.country).filter(Boolean))];

    const totalRevenue = o.reduce((sum: number, ord: any) => sum + Number(ord.amount || 0), 0);
    const convRate = v.length > 0 ? Math.round((o.length / v.length) * 100) : 0;

    setStats({
      totalVisits: v.length,
      totalSales: o.length,
      totalRevenue,
      totalCustomers: uniqueCustomerIds.length,
      conversionRate: convRate,
      activeCountries: uniqueCountries.length,
    });

    // Chart data (Evolution des ventes)
    const interval = eachDayOfInterval({ start: subDays(new Date(), effectivePeriod), end: new Date() });
    const chart = interval.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      return {
        date: format(day, "dd MMM", { locale: fr }),
        ventes: o.filter((x: any) => format(new Date(x.created_at), "yyyy-MM-dd") === dayStr).length,
        chiffre: o
          .filter((x: any) => format(new Date(x.created_at), "yyyy-MM-dd") === dayStr)
          .reduce((sum: number, ord: any) => sum + Number(ord.amount || 0), 0),
      };
    });
    setChartData(chart);

    // Top Products
    const prodMap: Record<string, { title: string; count: number; revenue: number }> = {};
    o.forEach((ord: any) => {
      const pId = ord.product_id;
      if (!prodMap[pId]) {
        prodMap[pId] = { title: ord.products?.title || "Produit digital", count: 0, revenue: 0 };
      }
      prodMap[pId].count += 1;
      prodMap[pId].revenue += Number(ord.amount || 0);
    });
    setTopProducts(Object.values(prodMap).sort((a, b) => b.count - a.count).slice(0, 5));

    // Top Customers
    const custMap: Record<string, { name: string; count: number; revenue: number }> = {};
    o.forEach((ord: any) => {
      const cId = ord.customer_id;
      if (!custMap[cId]) {
        custMap[cId] = { name: ord.customers?.name || "Client", count: 0, revenue: 0 };
      }
      custMap[cId].count += 1;
      custMap[cId].revenue += Number(ord.amount || 0);
    });
    setTopCustomers(Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

    setLoading(false);
  };

  const trafficData = (() => {
    const map: Record<string, { visits: number; conv: number; revenue: number }> = {};
    visits.forEach((v: any) => {
      const ref = v.referrer || "";
      let source = "Direct";
      if (ref) {
        if (/google|bing|yahoo/i.test(ref)) source = "Recherche";
        else if (/facebook|instagram|twitter|tiktok|linkedin/i.test(ref)) source = "Social";
        else source = "Referral";
      }
      if (!map[source]) map[source] = { visits: 0, conv: 0, revenue: 0 };
      map[source].visits += 1;
    });

    const totalV = stats.totalVisits || 1;
    Object.keys(map).forEach((src) => {
      const ratio = map[src].visits / totalV;
      map[src].conv = Math.round(stats.totalSales * ratio);
      map[src].revenue = stats.totalRevenue * ratio;
    });

    return Object.entries(map)
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.visits - a.visits);
  })();

  const countryData = (() => {
    const map: Record<string, number> = {};
    visits.forEach((v: any) => {
      const c = v.country || "Inconnu";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  const getCountryInfo = (codeOrName: string) => {
    if (!codeOrName || codeOrName === "Inconnu") return { name: "Inconnu", flag: "🌍" };
    if (codeOrName.length === 2) {
      try {
        const displayNames = new Intl.DisplayNames(["fr"], { type: "region" });
        const name = displayNames.of(codeOrName.toUpperCase()) || codeOrName;
        const codePoints = codeOrName.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0));
        const flag = String.fromCodePoint(...codePoints);
        return { name, flag };
      } catch {
        return { name: codeOrName, flag: "📍" };
      }
    }
    return { name: codeOrName, flag: "📍" };
  };

  const startDateLabel = format(subDays(new Date(), effectivePeriod), "dd/MM/yyyy", { locale: fr });
  const endDateLabel = format(new Date(), "dd/MM/yyyy", { locale: fr });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-14 w-full font-sans">
        {/* Header & Flat Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Analytiques
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Performances commerciales et trafic de vos boutiques en direct.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-border bg-card self-start sm:self-auto shadow-2xs">
            {[
              { label: "Aujourd'hui", val: 0 },
              { label: "Hier", val: 1 },
              { label: "7 j", val: 7 },
              { label: "30 j", val: 30 },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => {
                  setIsCustom(false);
                  setPeriod(opt.val);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !isCustom && period === opt.val
                    ? "bg-secondary text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}

            <div className="flex items-center pl-1 border-l border-border">
              <button
                onClick={() => setIsCustom(!isCustom)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  isCustom
                    ? "bg-secondary text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="h-3 w-3" />
                <span>Personnalisé</span>
              </button>
              {isCustom && (
                <div className="flex items-center ml-1.5">
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-12 h-6 text-center text-xs font-bold rounded bg-secondary border border-border text-foreground outline-none"
                    placeholder="Jours"
                  />
                  <span className="text-[11px] text-muted-foreground ml-1 font-medium">j</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6 Metric Bento Grid: 1px fine borders, no neon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <MetricCell
            label="Ventes"
            value={stats.totalSales}
            icon={ShoppingCart}
            loading={loading}
            iconColor="text-[#1F3FA8]"
          />
          <MetricCell
            label="Chiffre d'affaires"
            value={`${stats.totalRevenue.toLocaleString("fr-FR")} F`}
            icon={CreditCard}
            loading={loading}
            iconColor="text-[#16A34A]"
          />
          <MetricCell
            label="Acheteurs"
            value={stats.totalCustomers}
            icon={Users}
            loading={loading}
            iconColor="text-[#0EA5A4]"
          />
          <MetricCell
            label="Pays atteints"
            value={stats.activeCountries}
            icon={Globe}
            loading={loading}
            iconColor="text-[#1F3FA8]"
          />
          <MetricCell
            label="Conversion"
            value={`${stats.conversionRate}%`}
            icon={TrendingUp}
            loading={loading}
            iconColor="text-[#16A34A]"
          />
          <MetricCell
            label="Visites"
            value={stats.totalVisits}
            icon={BarChart3}
            loading={loading}
            iconColor="text-[#64748B]"
          />
        </div>

        {/* Charts: Sales Evolution + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Main Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Performance des ventes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Volume de commandes sur la période
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border text-xs text-muted-foreground font-medium">
                <Calendar className="h-3 w-3" />
                <span>{startDateLabel} — {endDateLabel}</span>
              </div>
            </div>

            {loading ? (
              <div className="h-[280px] w-full flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1F3FA8" stopOpacity={0.22} />
                        <stop offset="50%" stopColor="#0EA5A4" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#16A34A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload;
                        return (
                          <div className="rounded-xl border border-border bg-card p-3 shadow-lg min-w-[130px]">
                            <p className="text-[11px] text-muted-foreground mb-1">{d?.date}</p>
                            <p className="text-sm font-bold text-foreground">{d?.ventes} commande(s)</p>
                            <p className="text-xs text-primary font-semibold mt-0.5">{Number(d?.chiffre || 0).toLocaleString("fr-FR")} F</p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventes"
                      stroke="#1F3FA8"
                      strokeWidth={2}
                      fill="url(#analyticsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-foreground">
                Top produits
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Produits générant le plus de ventes
              </p>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-3 flex-1 flex flex-col justify-start">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-xl border border-border bg-secondary/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-secondary text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-border">
                        #{i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground">{p.count} vente{p.count > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">
                      {p.revenue.toLocaleString("fr-FR")} F
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs my-auto">
                Aucune vente enregistrée sur cette période
              </div>
            )}
          </div>
        </div>

        {/* Mid Row: Conversion Insight Card + Geographic Audience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Conversion Insight Card: Clean flat container */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Analyse de conversion
              </span>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {stats.conversionRate}%
                </span>
                <span className="text-xs text-muted-foreground">
                  des visiteurs finalisent un achat
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-3 leading-snug">
                {stats.conversionRate === 0
                  ? "Aucune vente sur cette période."
                  : stats.conversionRate < 2
                  ? "Trafic présent, conversion en cours d'optimisation."
                  : "Excellente performance de conversion !"}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {stats.conversionRate < 2
                  ? "Partagez des témoignages et optimisez vos descriptions pour rassurer les visiteurs de votre boutique."
                  : "Votre proposition de valeur correspond exactement aux attentes de vos acheteurs."}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>{stats.totalSales} commande(s) validée(s)</span>
              <span>{stats.totalVisits} visite(s)</span>
            </div>
          </div>

          {/* Geo Audience Distribution */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-foreground">
                Audience géographique
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top pays d'origine de vos visiteurs
              </p>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : countryData.length > 0 ? (
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {countryData.map(([country, count]) => {
                  const info = getCountryInfo(country);
                  const pct = Math.max(4, Math.round((count / (stats.totalVisits || 1)) * 100));
                  return (
                    <div key={country} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm">{info.flag}</span>
                          <span className="font-semibold text-foreground truncate">{info.name}</span>
                        </div>
                        <span className="font-bold text-foreground">{count} visite{count > 1 ? "s" : ""} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs my-auto">
                Aucune donnée de localisation disponible
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Top Customers & Traffic Sources Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Top Customers */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-foreground">
                Meilleurs clients
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Acheteurs les plus fidèles
              </p>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : topCustomers.length > 0 ? (
              <div className="space-y-3 flex-1">
                {topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-xl border border-border bg-secondary/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-secondary text-primary font-bold text-xs flex items-center justify-center border border-border shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.count} commande{c.count > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">
                      {c.revenue.toLocaleString("fr-FR")} F
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs my-auto">
                Aucun client sur cette période
              </div>
            )}
          </div>

          {/* Traffic Sources Table */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-foreground">
                Performance des canaux de trafic
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conversion et revenus générés par source
              </p>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : trafficData.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Canal</th>
                      <th className="py-2.5 px-3 text-right">Visites</th>
                      <th className="py-2.5 px-3 text-right">Achats</th>
                      <th className="py-2.5 px-3 text-right">Conversion</th>
                      <th className="py-2.5 px-3 text-right">Revenus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trafficData.map((row, i) => (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{row.source}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-muted-foreground">{row.visits}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-foreground">{row.conv}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-muted-foreground">
                          {row.visits > 0 ? Math.round((row.conv / row.visits) * 100) : 0}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-foreground">
                          {Math.round(row.revenue).toLocaleString("fr-FR")} F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs my-auto">
                Aucune donnée de trafic disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCell({
  label,
  value,
  icon: Icon,
  loading,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: any;
  loading: boolean;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground truncate">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${iconColor} stroke-[1.75] shrink-0`} />
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-6 w-16 bg-secondary animate-pulse rounded" />
        ) : (
          <span className="text-xl font-bold text-foreground tracking-tight block truncate">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
