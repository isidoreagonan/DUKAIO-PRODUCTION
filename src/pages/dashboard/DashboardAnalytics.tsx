import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Eye, ShoppingCart, CreditCard, TrendingUp, Calendar, Users, Globe, Monitor, Smartphone, Tablet, Link2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays, startOfDay, format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TrafficTab = "medium" | "source" | "referrer";

const DashboardAnalytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState("visits");
  const [trafficTab, setTrafficTab] = useState<TrafficTab>("medium");
  const [loading, setLoading] = useState(true);

  const [visits, setVisits] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalVisits: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    if (!user) return;
    fetchAnalytics();
  }, [user, period]);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);
    const days = parseInt(period);
    const startDate = startOfDay(subDays(new Date(), days)).toISOString();

    const [visitsRes, ordersRes, customersRes] = await Promise.all([
      supabase.from("store_visits").select("*").eq("store_owner_id", user.id).gte("created_at", startDate),
      supabase.from("orders").select("*").eq("store_owner_id", user.id).gte("created_at", startDate),
      supabase.from("orders").select("customer_id, customers(name, email)").eq("store_owner_id", user.id).gte("created_at", startDate),
    ]);

    const v = visitsRes.data || [];
    const o = ordersRes.data || [];
    setVisits(v);
    setOrders(o);

    // Unique customers
    const uniqueCustomerIds = [...new Set(o.map((ord: any) => ord.customer_id))];
    setCustomers(uniqueCustomerIds as any[]);

    const totalRevenue = o.reduce((sum: number, ord: any) => sum + Number(ord.amount || 0), 0);
    const convRate = v.length > 0 ? Math.round((o.length / v.length) * 100) : 0;

    setStats({
      totalVisits: v.length,
      totalSales: o.length,
      totalRevenue,
      totalCustomers: uniqueCustomerIds.length,
      conversionRate: convRate,
    });

    // Chart data
    const interval = eachDayOfInterval({ start: subDays(new Date(), days), end: new Date() });
    const chart = interval.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      return {
        date: format(day, "dd MMM", { locale: fr }),
        visites: v.filter((x: any) => format(new Date(x.created_at), "yyyy-MM-dd") === dayStr).length,
        ventes: o.filter((x: any) => format(new Date(x.created_at), "yyyy-MM-dd") === dayStr).length,
      };
    });
    setChartData(chart);
    setLoading(false);
  };

  // Country breakdown
  const countryData = (() => {
    const map: Record<string, number> = {};
    visits.forEach((v: any) => {
      const c = v.country || "Inconnu";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  })();

  // Device breakdown
  const deviceData = (() => {
    const map: Record<string, number> = {};
    visits.forEach((v: any) => {
      let d = v.device_type || "Inconnu";
      // Fallback: parse user_agent if device_type not set
      if (d === "Inconnu" && v.user_agent) {
        if (/Mobi|Android|iPhone/i.test(v.user_agent)) d = "Mobile";
        else if (/iPad|Tablet/i.test(v.user_agent)) d = "Tablet";
        else d = "Desktop";
      }
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();

  // Traffic sources (medium: direct, search, social, referral)
  const trafficMedium = (() => {
    const map: Record<string, number> = {};
    visits.forEach((v: any) => {
      const ref = v.referrer || "";
      let medium = "direct";
      if (ref) {
        if (/google|bing|yahoo|duckduckgo/i.test(ref)) medium = "search";
        else if (/facebook|instagram|twitter|tiktok|linkedin/i.test(ref)) medium = "social";
        else medium = "referral";
      }
      map[medium] = (map[medium] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();

  // Traffic sources (actual source domains)
  const trafficSources = (() => {
    const map: Record<string, number> = {};
    visits.forEach((v: any) => {
      const ref = v.referrer || "";
      let source = "Direct";
      if (ref) {
        try {
          source = new URL(ref).hostname;
        } catch {
          source = ref.substring(0, 40);
        }
      }
      map[source] = (map[source] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  })();

  // Referrer URLs
  const referrerUrls = (() => {
    const map: Record<string, number> = {};
    visits.forEach((v: any) => {
      const ref = v.referrer || "";
      if (!ref) return;
      map[ref] = (map[ref] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 15);
  })();

  const deviceIcon = (type: string) => {
    if (type === "Mobile") return <Smartphone className="h-4 w-4 text-muted-foreground" />;
    if (type === "Tablet") return <Tablet className="h-4 w-4 text-muted-foreground" />;
    return <Monitor className="h-4 w-4 text-muted-foreground" />;
  };

  const startDateLabel = format(subDays(new Date(), parseInt(period)), "MMMM dd, yyyy", { locale: fr });
  const endDateLabel = format(new Date(), "MMMM dd, yyyy", { locale: fr });

  const maxBarValue = (data: [string, number][]) => {
    const max = Math.max(...data.map(d => d[1]), 1);
    return max;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with date range */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytiques</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">{startDateLabel}</span>
              <span>–</span>
              <span className="capitalize">{endDateLabel}</span>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="14">14 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">3 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="summary" className="gap-2"><BarChart3 className="h-4 w-4" />Résumé</TabsTrigger>
            <TabsTrigger value="sales" className="gap-2"><CreditCard className="h-4 w-4" />Ventes</TabsTrigger>
            <TabsTrigger value="visits" className="gap-2"><Eye className="h-4 w-4" />Visites</TabsTrigger>
            <TabsTrigger value="customers" className="gap-2"><Users className="h-4 w-4" />Clients</TabsTrigger>
            <TabsTrigger value="conversion" className="gap-2"><TrendingUp className="h-4 w-4" />Taux de conversion</TabsTrigger>
          </TabsList>

          {/* SUMMARY TAB */}
          <TabsContent value="summary" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Visites", value: stats.totalVisits, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Ventes", value: stats.totalSales, icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Revenu", value: `${stats.totalRevenue.toLocaleString()} F`, icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Conversion", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((card, i) => (
                <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border bg-card p-5">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.bg} mb-3`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
                </motion.div>
              ))}
            </div>
            {/* Summary chart */}
            <ChartBlock loading={loading} chartData={chartData} dataKeys={["visites", "ventes"]} title="Aperçu global" />
          </TabsContent>

          {/* SALES TAB */}
          <TabsContent value="sales" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-3xl font-bold text-foreground">{stats.totalSales}</p>
              <p className="text-sm text-muted-foreground mt-1">Nombre total de ventes</p>
            </div>
            <ChartBlock loading={loading} chartData={chartData} dataKeys={["ventes"]} title="Ventes quotidiennes" color="#10b981" />
          </TabsContent>

          {/* VISITS TAB */}
          <TabsContent value="visits" className="space-y-6 mt-6">
            {/* Total visits */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-3xl font-bold text-foreground">{stats.totalVisits}</p>
              <p className="text-sm text-muted-foreground mt-1">Nombre total de visites</p>
            </div>

            {/* Visits chart */}
            <ChartBlock loading={loading} chartData={chartData} dataKeys={["visites"]} title="Visites quotidiennes" color="hsl(var(--primary))" gradientId="visits" />

            {/* Country + Devices side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Visites par pays</h3>
                {countryData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune donnée</p>
                ) : (
                  <div className="space-y-3">
                    {countryData.map(([country, count]) => (
                      <div key={country} className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-7 rounded-md bg-blue-100 dark:bg-blue-900/30" style={{ width: `${Math.max(10, (count / maxBarValue(countryData)) * 100)}%` }}>
                            <span className="px-2 text-sm font-medium text-foreground whitespace-nowrap">{country}</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Devices */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Appareils</h3>
                {deviceData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune donnée</p>
                ) : (
                  <div className="space-y-3">
                    {deviceData.map(([device, count]) => (
                      <div key={device} className="flex items-center gap-3">
                        {deviceIcon(device)}
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-7 rounded-md bg-blue-100 dark:bg-blue-900/30" style={{ width: `${Math.max(10, (count / maxBarValue(deviceData)) * 100)}%` }}>
                            <span className="px-2 text-sm font-medium text-foreground whitespace-nowrap">{device}</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Traffic sources section */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                {(["medium", "source", "referrer"] as TrafficTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTrafficTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      trafficTab === tab
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tab === "medium" ? "Sources de trafic (Medium)" : tab === "source" ? "Sources de trafic" : "Référents"}
                  </button>
                ))}
              </div>

              {trafficTab === "medium" && (
                <TrafficList data={trafficMedium} icon={<Link2 className="h-4 w-4 text-muted-foreground" />} />
              )}
              {trafficTab === "source" && (
                <TrafficList data={trafficSources} icon={<Globe className="h-4 w-4 text-muted-foreground" />} />
              )}
              {trafficTab === "referrer" && (
                <TrafficList data={referrerUrls} icon={<ExternalLink className="h-4 w-4 text-muted-foreground" />} />
              )}
            </div>
          </TabsContent>

          {/* CUSTOMERS TAB */}
          <TabsContent value="customers" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-3xl font-bold text-foreground">{stats.totalCustomers}</p>
              <p className="text-sm text-muted-foreground mt-1">Clients uniques sur la période</p>
            </div>
          </TabsContent>

          {/* CONVERSION TAB */}
          <TabsContent value="conversion" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-3xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">Taux de conversion (visites → ventes)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xl font-bold text-foreground">{stats.totalVisits}</p>
                <p className="text-sm text-muted-foreground">Visites</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xl font-bold text-foreground">{stats.totalSales}</p>
                <p className="text-sm text-muted-foreground">Ventes complétées</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xl font-bold text-foreground">{stats.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Clients uniques</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Reusable chart block
const ChartBlock = ({ loading, chartData, dataKeys, title, color, gradientId }: {
  loading: boolean; chartData: any[]; dataKeys: string[]; title: string; color?: string; gradientId?: string;
}) => {
  const colors = ["hsl(var(--primary))", "#10b981", "#f97316"];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              {dataKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color || colors[i]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color || colors[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
            {dataKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={color || colors[i]} fillOpacity={1} fill={`url(#grad-${key})`} strokeWidth={2} name={key.charAt(0).toUpperCase() + key.slice(1)} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Aucune donnée pour cette période</p>
        </div>
      )}
    </motion.div>
  );
};

// Reusable traffic list component
const TrafficList = ({ data, icon }: { data: [string, number][]; icon: React.ReactNode }) => {
  const max = Math.max(...data.map(d => d[1]), 1);
  return data.length === 0 ? (
    <p className="text-sm text-muted-foreground">Aucune donnée</p>
  ) : (
    <div className="space-y-3">
      {data.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          <div className="flex-1 flex items-center">
            <div className="h-7 rounded-md bg-blue-100 dark:bg-blue-900/30" style={{ width: `${Math.max(8, (count / max) * 100)}%` }}>
              <span className="px-2 text-sm font-medium text-foreground whitespace-nowrap truncate block leading-7">{label}</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-foreground tabular-nums">{count}</span>
        </div>
      ))}
    </div>
  );
};

export default DashboardAnalytics;
