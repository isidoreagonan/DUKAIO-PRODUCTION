import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Users, TrendingUp, Smartphone, Globe, Link as LinkIcon, Monitor, Tablet, Activity, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface TrafficStats {
  totalViews: number;
  uniqueVisitors: number;
  mobileRate: number;
  conversionRate: string;
  funnel: { home: number; register: number; dashboard: number };
  dailyTraffic: Record<string, number>;
  devices: { Desktop: number; Mobile: number; Tablet: number };
  topReferrers: { name: string; count: number }[];
  topPages: { name: string; count: number }[];
  topBrowsers: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// Couleurs Dukaio
const COLORS = ["#2563EB", "#60A5FA", "#93C5FD", "#BFDBFE"];

// Helper pour convertir un code pays (ex: FR) en Emoji Drapeau et Nom complet
const getCountryFlag = (code: string) => {
  if (!code || code === "XX" || code === "undefined") return "🌍";
  const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌍";
  }
};

const getCountryName = (code: string) => {
  if (!code || code === "XX" || code === "undefined") return "Local / Inconnu";
  try {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email !== "isidoreagonan@gmail.com") return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "traffic_analytics" },
      });
      if (error) {
        console.error("Function error:", error);
        setErrorMsg("Impossible de charger les statistiques. Avez-vous déployé l'Edge Function ?");
      } else if (data?.error) {
         setErrorMsg(data.error);
      } else if (data) {
        setStats(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur inconnue");
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
    ? Object.entries(stats.dailyTraffic)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date: date.slice(5), amount }))
    : [];

  const deviceData = stats ? [
    { name: "Desktop", value: stats.devices.Desktop },
    { name: "Mobile", value: stats.devices.Mobile },
    { name: "Tablet", value: stats.devices.Tablet },
  ].filter(d => d.value > 0) : [];

  const maxFunnel = stats ? Math.max(stats.funnel.home, 1) : 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Analyse de Trafic
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Données en direct (30 derniers jours) pour dukaio.com</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-2xl border border-red-200 bg-red-50 text-red-600">
            <h3 className="font-bold mb-2">Erreur de chargement</h3>
            <p>{errorMsg}</p>
            <p className="text-sm mt-4">Astuce : Assurez-vous d'avoir exécuté <code>npx supabase functions deploy admin-platform</code></p>
          </div>
        ) : stats && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Vues de pages</span>
                </div>
                <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </motion.div>
              
              <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">Visiteurs uniques</span>
                </div>
                <p className="text-3xl font-bold">{stats.uniqueVisitors.toLocaleString()}</p>
              </motion.div>
              
              <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Smartphone className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Taux Mobile</span>
                </div>
                <p className="text-3xl font-bold">{stats.mobileRate}%</p>
              </motion.div>

              <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Conversion (Onboarding)</span>
                </div>
                <p className="text-3xl font-bold">{stats.conversionRate}%</p>
              </motion.div>
            </div>

            {/* Middle Section: Chart & Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Chart */}
              <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Trafic & Visiteurs</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#2563EB', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="amount" name="Vues" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Conversion Funnel */}
              <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Entonnoir de conversion</h3>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">Accueil</span>
                      <span className="text-primary font-bold">{stats.funnel.home} vues</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(stats.funnel.home / maxFunnel) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">Page d'Inscription</span>
                      <span className="text-primary font-bold">{stats.funnel.register} vues</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.funnel.register / maxFunnel) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">Inscrits (Dashboard)</span>
                      <span className="text-primary font-bold">{stats.funnel.dashboard} vues</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(stats.funnel.dashboard / maxFunnel) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-xs text-center text-muted-foreground">
                  Le parcours classique de l'accueil jusqu'au tableau de bord.
                </div>
              </motion.div>
            </div>

            {/* Bottom Grid: Devices, Referrers, Pages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Devices */}
              <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col items-center">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 self-start">Appareils</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deviceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 text-xs font-medium mt-2">
                  <div className="flex items-center gap-1"><Monitor className="w-3 h-3 text-[#2563EB]" /> Desktop ({stats.devices.Desktop})</div>
                  <div className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-[#60A5FA]" /> Mobile ({stats.devices.Mobile})</div>
                  <div className="flex items-center gap-1"><Tablet className="w-3 h-3 text-[#93C5FD]" /> Tablet ({stats.devices.Tablet})</div>
                </div>
              </motion.div>

              {/* Referrers */}
              <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Sources de Trafic</h3>
                <div className="space-y-4">
                  {stats.topReferrers.map((ref, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                         <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                           <LinkIcon className="w-3 h-3 text-slate-500" />
                         </div>
                         <span className="font-medium truncate max-w-[150px]">{ref.name}</span>
                      </div>
                      <span className="font-bold text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-700">{ref.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Pages */}
              <motion.div custom={8} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Pages les plus visitées</h3>
                <div className="space-y-4">
                  {stats.topPages.map((page, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                         <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                           <FileText className="w-3 h-3 text-slate-500" />
                         </div>
                         <span className="font-medium truncate max-w-[150px]">{page.name}</span>
                      </div>
                      <span className="font-bold text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-700">{page.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Browsers */}
              <motion.div custom={9} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Navigateurs</h3>
                <div className="space-y-4">
                  {stats.topBrowsers.map((b, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{b.name}</span>
                      <span className="font-bold text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-700">{b.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Countries */}
              <motion.div custom={10} initial="hidden" animate="visible" variants={cardVariants} className="rounded-2xl border border-border bg-card p-5 shadow-sm md:col-span-2">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Pays & Localisation</h3>
                <div className="grid grid-cols-2 gap-4">
                  {stats.topCountries.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">
                          {getCountryFlag(c.name)}
                        </span>
                        <span className="text-sm font-medium">{getCountryName(c.name)}</span>
                      </div>
                      <span className="font-bold text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-700">{c.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
