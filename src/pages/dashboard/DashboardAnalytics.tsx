import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, ShoppingCart, CreditCard, TrendingUp, Calendar, Users, Globe, PieChart as PieChartIcon, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { subDays, startOfDay, format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from "recharts";

const DashboardAnalytics = () => {
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

  const effectivePeriod = isCustom && customDays ? (parseInt(customDays) || 1) : period;

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 500); // debounce for custom input
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

    // Unique customers & active countries
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
      };
    });
    setChartData(chart);

    // Top Products
    const prodMap: Record<string, { title: string, count: number, revenue: number }> = {};
    o.forEach((ord: any) => {
      const pId = ord.product_id;
      if (!prodMap[pId]) {
        prodMap[pId] = { title: ord.products?.title || "Produit inconnu", count: 0, revenue: 0 };
      }
      prodMap[pId].count += 1;
      prodMap[pId].revenue += Number(ord.amount || 0);
    });
    setTopProducts(Object.values(prodMap).sort((a, b) => b.count - a.count).slice(0, 5));

    // Top Customers
    const custMap: Record<string, { name: string, count: number, revenue: number }> = {};
    o.forEach((ord: any) => {
      const cId = ord.customer_id;
      if (!custMap[cId]) {
        custMap[cId] = { name: ord.customers?.name || "Client inconnu", count: 0, revenue: 0 };
      }
      custMap[cId].count += 1;
      custMap[cId].revenue += Number(ord.amount || 0);
    });
    setTopCustomers(Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

    setLoading(false);
  };

  const trafficData = (() => {
    const map: Record<string, { visits: number, conv: number, revenue: number }> = {};
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
    Object.keys(map).forEach(src => {
      const ratio = map[src].visits / totalV;
      map[src].conv = Math.round(stats.totalSales * ratio);
      map[src].revenue = stats.totalRevenue * ratio;
    });

    return Object.entries(map).map(([source, data]) => ({ source, ...data })).sort((a, b) => b.visits - a.visits);
  })();

  const countryData = (() => {
    const map: Record<string, number> = {};
    visits.forEach((v: any) => {
      const c = v.country || "Inconnu";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  const customerTypesData = (() => {
    let newCust = 0;
    let returningCust = 0;
    const custMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      custMap[o.customer_id] = (custMap[o.customer_id] || 0) + 1;
    });
    Object.values(custMap).forEach(count => {
      if (count > 1) returningCust++;
      else newCust++;
    });
    return [
      { name: "Nouveaux clients", value: newCust || 1, fill: "#f97316" },
      { name: "Clients récurrents", value: returningCust, fill: "#3b82f6" }
    ];
  })();

  const getCountryInfo = (codeOrName: string) => {
    if (!codeOrName || codeOrName === "Inconnu") return { name: "Inconnu", flag: "🌍" };
    if (codeOrName.length === 2) {
      try {
        const displayNames = new Intl.DisplayNames(['fr'], { type: 'region' });
        const name = displayNames.of(codeOrName.toUpperCase()) || codeOrName;
        const codePoints = codeOrName.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
        const flag = String.fromCodePoint(...codePoints);
        return { name, flag };
      } catch (e) {
        return { name: codeOrName, flag: "📍" };
      }
    }
    return { name: codeOrName, flag: "📍" };
  };

  const startDateLabel = format(subDays(new Date(), effectivePeriod), "dd/MM/yyyy", { locale: fr });
  const endDateLabel = format(new Date(), "dd/MM/yyyy", { locale: fr });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 max-w-[1400px] mx-auto pt-4 px-2">
        
        {/* Header & Flat Filters */}
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 mb-2">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Analytiques</h1>
            <p className="text-muted-foreground mt-1">Gérez vos performances avec précision.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-card p-1.5 border border-border rounded-2xl">
            {[
              { label: "Aujourd'hui", val: 0 },
              { label: "Hier", val: 1 },
              { label: "7J", val: 7 },
              { label: "30J", val: 30 },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => { setIsCustom(false); setPeriod(opt.val); }}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${!isCustom && period === opt.val ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {opt.label}
              </button>
            ))}
            
            <div className="relative flex items-center">
              <button
                onClick={() => setIsCustom(true)}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${isCustom ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Edit3 className="w-4 h-4" /> Custom
              </button>
              {isCustom && (
                <div className="flex items-center ml-2 mr-2">
                  <input 
                    type="number" 
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-16 h-8 text-center text-sm font-bold rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    placeholder="Jours"
                  />
                  <span className="text-xs text-muted-foreground ml-2 font-medium">jours</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Box KPI Grid - No shadow, soft solid colors, rounded-3xl */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard 
            label="Ventes" 
            value={stats.totalSales} 
            icon={ShoppingCart} 
            loading={loading} 
            colorClass="bg-orange-50/60 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/50" 
            textClass="text-orange-950 dark:text-orange-100"
            iconClass="text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/50"
          />
          <KpiCard 
            label="Chiffre d'affaires" 
            value={`${stats.totalRevenue.toLocaleString()} F`} 
            icon={CreditCard} 
            loading={loading} 
            colorClass="bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900/50" 
            textClass="text-emerald-950 dark:text-emerald-100"
            iconClass="text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/50"
          />
          <KpiCard 
            label="Acheteurs" 
            value={stats.totalCustomers} 
            icon={Users} 
            loading={loading} 
            colorClass="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/50" 
            textClass="text-blue-950 dark:text-blue-100"
            iconClass="text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/50"
          />
          <KpiCard 
            label="Pays atteints" 
            value={stats.activeCountries} 
            icon={Globe} 
            loading={loading} 
            colorClass="bg-indigo-50/60 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/50"
            textClass="text-indigo-950 dark:text-indigo-100" 
            iconClass="text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/50"
          />
          <KpiCard 
            label="Conversion" 
            value={`${stats.conversionRate}%`} 
            icon={TrendingUp} 
            loading={loading} 
            colorClass="bg-purple-50/60 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900/50" 
            textClass="text-purple-950 dark:text-purple-100"
            iconClass="text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/50"
          />
          <KpiCard 
            label="Trafic" 
            value={stats.totalVisits} 
            icon={BarChart3} 
            loading={loading} 
            colorClass="bg-rose-50/60 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50" 
            textClass="text-rose-950 dark:text-rose-100"
            iconClass="text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-900/50"
          />
        </div>

        {/* Charts & Top Products - Bento Style (rounded-3xl, clean borders) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-3xl border-2 border-border/60 bg-card p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-foreground">Performance des ventes</h3>
              <div className="flex items-center gap-2 px-3 py-1.5 h-[32px] rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{startDateLabel} - {endDateLabel}</span>
              </div>
            </div>
            {loading ? <Skeleton height={300} /> : (
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <Tooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'none' }} />
                    <Area type="monotone" dataKey="ventes" stroke="#2563eb" strokeWidth={4} fill="url(#colorVentes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          <div className="rounded-3xl border-2 border-border/60 bg-card p-6 lg:p-8 flex flex-col">
            <h3 className="text-xl font-black text-foreground mb-8">Top produits</h3>
            {loading ? <Skeleton height={300} /> : topProducts.length > 0 ? (
              <div className="space-y-5 flex-1">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        #{i + 1}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm text-foreground truncate">{p.title}</p>
                        <p className="text-xs font-medium text-muted-foreground">{p.count} vente{p.count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-black text-sm text-foreground">{p.revenue.toLocaleString()} F</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm font-medium">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {/* Insight Cards (Brutalist dark theme) */}
          <div className="rounded-3xl bg-zinc-950 p-6 lg:p-8 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <TrendingUp className="w-32 h-32" />
            </div>
            <p className="text-sm font-bold text-white/50 mb-2 uppercase tracking-widest">Analyse de conversion</p>
            <p className="text-5xl font-black mb-4 tracking-tighter">{stats.conversionRate}%</p>
            <p className="font-bold text-lg text-white/90 leading-tight">
              {stats.conversionRate === 0 ? "Aucune vente sur cette période." : stats.conversionRate < 2 ? "Trafic présent, mais faible conversion." : "Excellente performance de conversion !"}
            </p>
            <p className="text-sm font-medium text-white/60 mt-2 max-w-sm">
              {stats.conversionRate < 2 ? "Concentrez-vous sur l'amélioration de vos descriptions et visuels pour rassurer les acheteurs." : "Vos produits répondent parfaitement à la demande de votre audience."}
            </p>
          </div>

          {/* Geo Distribution */}
          <div className="rounded-3xl border-2 border-border/60 bg-card p-6 lg:p-8">
            <h3 className="text-xl font-black text-foreground mb-8">Audience mondiale</h3>
            {loading ? <Skeleton height={150} /> : countryData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {countryData.map(([country, count]) => {
                  const info = getCountryInfo(country);
                  return (
                    <div key={country} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="text-lg">{info.flag}</span>
                          <span className="text-sm font-bold text-foreground truncate">{info.name}</span>
                        </div>
                        <span className="text-sm font-black">{count}</span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full" style={{ width: `${Math.max(5, (count / (stats.totalVisits || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm font-medium">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Sources & Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-3xl border-2 border-border/60 bg-card p-6 lg:p-8 flex flex-col">
            <h3 className="text-xl font-black text-foreground mb-8">Meilleurs acheteurs</h3>
            {loading ? <Skeleton height={200} /> : topCustomers.length > 0 ? (
              <div className="space-y-4">
                {topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground font-black text-sm uppercase">
                        {c.name.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{c.name}</p>
                        <p className="text-xs font-medium text-muted-foreground">{c.count} achat{c.count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="font-black text-sm text-foreground">
                      {c.revenue.toLocaleString()} F
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm font-medium">
                Aucune donnée disponible
              </div>
            )}
          </div>
          
          <div className="lg:col-span-2 rounded-3xl border-2 border-border/60 bg-card p-6 lg:p-8 overflow-hidden flex flex-col">
            <h3 className="text-xl font-black text-foreground mb-6">Performance des sources</h3>
            {loading ? <Skeleton height={200} /> : trafficData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-4 rounded-l-xl font-bold">Source</th>
                      <th className="px-4 py-4 font-bold text-right">Visites</th>
                      <th className="px-4 py-4 font-bold text-right">Achats</th>
                      <th className="px-4 py-4 font-bold text-right">Taux</th>
                      <th className="px-4 py-4 rounded-r-xl font-bold text-right">Revenus générés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficData.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-5 font-black text-foreground">{row.source}</td>
                        <td className="px-4 py-5 text-right font-medium">{row.visits}</td>
                        <td className="px-4 py-5 text-right font-medium">{row.conv}</td>
                        <td className="px-4 py-5 text-right text-muted-foreground font-medium">
                          {row.visits > 0 ? Math.round((row.conv / row.visits) * 100) : 0}%
                        </td>
                        <td className="px-4 py-5 text-right font-black text-foreground">{row.revenue.toLocaleString()} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm font-medium">Aucune donnée disponible</div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

const KpiCard = ({ label, value, icon: Icon, loading, colorClass, textClass, iconClass }: { label: string, value: string | number, icon: any, loading: boolean, colorClass?: string, textClass?: string, iconClass?: string }) => (
  <div className={`rounded-3xl border-2 p-5 flex flex-col justify-between min-h-[150px] ${colorClass || "bg-card border-border/60"}`}>
    <div className="flex items-start justify-between">
      <p className={`text-sm font-bold ${textClass || "text-foreground"} opacity-90`}>{label}</p>
      <div className={`p-2 rounded-xl ${iconClass || "bg-muted text-foreground"}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {loading ? (
      <div className="h-10 w-24 bg-black/10 dark:bg-white/10 animate-pulse rounded-lg mt-4" />
    ) : (
      <p className={`text-3xl font-black mt-4 tracking-tighter truncate ${textClass || "text-foreground"}`} title={String(value)}>{value}</p>
    )}
  </div>
);

const Skeleton = ({ height }: { height: number }) => (
  <div className="w-full bg-muted/50 animate-pulse rounded-2xl" style={{ height: `${height}px` }} />
);

export default DashboardAnalytics;
