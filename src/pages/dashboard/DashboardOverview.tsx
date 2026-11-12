import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, Users, Copy, Check,
  Package, ShoppingBag, ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import {
  format, subDays, startOfDay, endOfDay, eachDayOfInterval,
  isWithinInterval, parseISO
} from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveStore } from "@/hooks/useActiveStore";

type ChartPeriod = 7 | 30 | 90;

export function DashboardOverview() {
  const { user, profile } = useAuth();
  const { activeStore } = useActiveStore();
  const navigate = useNavigate();

  const [periodDays, setPeriodDays] = useState<ChartPeriod>(30);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Raw data from DB
  const [availableFcfa, setAvailableFcfa] = useState<number>(0);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [rawOrders, setRawOrders] = useState<any[]>([]);

  // Fetch data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [walletRes, productsRes, ordersRes] = await Promise.all([
          supabase
            .from("user_wallets")
            .select("balance_fcfa")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("products")
            .select("id, title, price, thumbnail_url, is_published, created_at, type")
            .eq("creator_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("orders")
            .select("id, amount, status, created_at, product_id, customer_id, products(title, thumbnail_url), customers(name, email)")
            .eq("store_owner_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (walletRes.data) {
          setAvailableFcfa(Number(walletRes.data.balance_fcfa || 0));
        }
        setRawProducts(productsRes.data || []);
        setRawOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Dynamic greeting according to hour, season, and catalog products
  const greetingData = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec

    // User display name / first name
    const fullName =
      profile?.display_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Créateur";

    const firstName = fullName.trim().split(" ")[0].toUpperCase() || "CRÉATEUR";

    // Product highlight for subtitle
    const publishedProducts = rawProducts.filter((p) => p.is_published);
    const highlightProduct =
      publishedProducts.length > 0 ? publishedProducts[0].title : null;

    // Season icon & text (Northern hemisphere / general e-com calendar)
    // Spring: March (2) - May (4)
    // Summer: June (5) - August (7)
    // Autumn: September (8) - November (10)
    // Winter: December (11) - February (1)
    let seasonalIcon = "🍂";
    let seasonTheme = "cet automne";
    if (month >= 2 && month <= 4) {
      seasonalIcon = "🌸";
      seasonTheme = "ce printemps";
    } else if (month >= 5 && month <= 7) {
      seasonalIcon = "☀️";
      seasonTheme = "cet été";
    } else if (month >= 8 && month <= 10) {
      seasonalIcon = "🍂";
      seasonTheme = "cet automne";
    } else {
      seasonalIcon = "❄️";
      seasonTheme = "cet hiver";
    }

    if (hour >= 5 && hour < 9) {
      return {
        greeting: `Bonjour, ${firstName}`,
        emoji: "🌅",
        subtitle: highlightProduct
          ? `Le monde appartient à ceux qui se lèvent tôt. Prêt à travailler aujourd'hui ? Mettez en avant « ${highlightProduct} » pour capter vos premiers clients du matin.`
          : `Le monde appartient à ceux qui se lèvent tôt. Prêt à travailler aujourd'hui ? Partagez le lien de votre boutique pour lancer vos ventes.`,
      };
    } else if (hour >= 9 && hour < 12) {
      return {
        greeting: `Bonjour, ${firstName}`,
        emoji: "☀️",
        subtitle: highlightProduct
          ? `Est-ce que tu veux travailler et battre ton record aujourd'hui ? Mettez en avant « ${highlightProduct} » qui booste vos ventes.`
          : `Est-ce que tu veux travailler et battre ton record aujourd'hui ? Ajoutez vos offres digitales et faites exploser vos résultats ${seasonTheme}.`,
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        greeting: `Bon après-midi, ${firstName}`,
        emoji: seasonalIcon,
        subtitle: highlightProduct
          ? `Un bon moment pour partager votre lien. Aujourd'hui, mettez en avant « ${highlightProduct} » qui booste vos ventes.`
          : `Un bon moment pour partager votre lien. Proposez vos produits numériques à votre audience pour encaisser cet après-midi.`,
      };
    } else if (hour >= 18 && hour < 23) {
      return {
        greeting: `Bonsoir, ${firstName}`,
        emoji: "🌆",
        subtitle: highlightProduct
          ? `Les acheteurs consultent leurs réseaux ce soir. Mettez en avant « ${highlightProduct} » pour transformer vos visites en commandes.`
          : `Vos acheteurs sont connectés ce soir. Partagez votre lien de boutique pour convertir vos followers en clients fidèles.`,
      };
    } else {
      return {
        greeting: `Bonne nuit, ${firstName}`,
        emoji: "🌙",
        subtitle: `Travailler tard pour réussir c'est bien, mais repose-toi ce soir pour revenir encore plus performant demain !`,
      };
    }
  }, [user, profile, rawProducts]);

  // Copy store link to clipboard
  const handleCopyLink = () => {
    const slug = activeStore?.slug || profile?.store_slug;
    const url = slug
      ? `${window.location.origin}/store/${slug}`
      : window.location.origin;

    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien de votre boutique copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  // Stat calculations
  const {
    sevenDaysRevenue,
    totalClients,
    totalSalesCount,
    lifetimeRevenue,
    chartData,
    periodRevenue,
    topProducts,
    recentSales,
  } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    // Paid orders only for financial calculations
    const paidOrders = rawOrders.filter((o) => o.status === "completed");

    // 7 days revenue
    const last7Orders = paidOrders.filter((o) => {
      const d = parseISO(o.created_at);
      return d >= sevenDaysAgo;
    });
    const rev7 = last7Orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

    // Total lifetime revenue
    const lifeRev = paidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

    // Total unique clients (all customers who reached checkout)
    const uniqueClients = new Set(
      rawOrders.map((o) => o.customer_id).filter(Boolean)
    ).size;

    // Filter chart according to selected period (7, 30, 90 days)
    const periodStart = subDays(now, periodDays - 1);
    const ordersInPeriod = paidOrders.filter((o) => {
      const d = parseISO(o.created_at);
      return isWithinInterval(d, { start: startOfDay(periodStart), end: endOfDay(now) });
    });
    const pRev = ordersInPeriod.reduce((sum, o) => sum + Number(o.amount || 0), 0);

    const daysInterval = eachDayOfInterval({
      start: startOfDay(periodStart),
      end: endOfDay(now),
    });

    const chart = daysInterval.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = paidOrders.filter(
        (o) => format(parseISO(o.created_at), "yyyy-MM-dd") === dayStr
      );
      return {
        date: format(day, "dd/MM"),
        fullDate: format(day, "dd MMMM yyyy", { locale: fr }),
        amount: dayOrders.reduce((s, o) => s + Number(o.amount || 0), 0),
        count: dayOrders.length,
      };
    });

    // Top products calculation (from paid sales)
    const salesByProduct: Record<string, { total: number; count: number }> = {};
    paidOrders.forEach((o) => {
      const pId = o.product_id;
      if (!pId) return;
      if (!salesByProduct[pId]) salesByProduct[pId] = { total: 0, count: 0 };
      salesByProduct[pId].total += Number(o.amount || 0);
      salesByProduct[pId].count += 1;
    });

    const enriched = rawProducts.map((p) => ({
      ...p,
      salesTotal: salesByProduct[p.id]?.total || 0,
      salesCount: salesByProduct[p.id]?.count || 0,
    }));
    enriched.sort((a, b) => b.salesTotal - a.salesTotal);

    return {
      sevenDaysRevenue: rev7,
      totalClients: uniqueClients,
      totalSalesCount: paidOrders.length,
      lifetimeRevenue: lifeRev,
      chartData: chart,
      periodRevenue: pRev,
      topProducts: enriched.filter((p) => p.salesCount > 0).slice(0, 5),
      recentSales: rawOrders.slice(0, 6),
    };
  }, [rawOrders, rawProducts, periodDays]);

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-lg min-w-[150px]">
        <p className="text-[11px] font-medium text-muted-foreground mb-1">
          {d?.fullDate}
        </p>
        <p className="text-sm font-extrabold text-foreground">
          {Number(d?.amount || 0).toLocaleString("fr-FR")} F
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {d?.count || 0} commande{(d?.count || 0) > 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full pb-14 font-sans">
        {/* Top Header: Greeting + Motivational Text + Copier mon lien Button */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <span>{greetingData.greeting}</span>
              <span className="text-xl" role="img" aria-label="moment">
                {greetingData.emoji}
              </span>
            </h1>
            <p className="text-xs sm:text-[13px] text-[#475569] dark:text-[#94A3B8] font-normal leading-relaxed">
              {greetingData.subtitle}
            </p>
          </div>

          <button
            onClick={handleCopyLink}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold transition-colors shrink-0 shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Lien copié !</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copier mon lien</span>
              </>
            )}
          </button>
        </div>

        {/* Stat Cards: Solde disponible on top, 7 derniers jours & Clients side-by-side (Exact Chariow Layout) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Solde disponible (Full width on mobile/tablet: col-span-2, 1 column on desktop: lg:col-span-1) */}
          <div
            onClick={() => navigate("/dashboard/wallet?action=withdraw")}
            className="col-span-2 lg:col-span-1 rounded-2xl border border-[#E2E8F0] dark:border-[#263043] bg-[#F8FAFC]/90 dark:bg-[#151C2B] p-4 sm:p-5 cursor-pointer hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all flex flex-col justify-between shadow-2xs group"
          >
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1F3FA8] dark:text-[#4F7BEA] flex items-center justify-center shrink-0">
                  <Wallet className="h-4 w-4 stroke-[1.75]" />
                </div>
                <span className="font-semibold text-foreground">Solde disponible</span>
              </div>
              <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                Retirer →
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[26px] sm:text-[30px] font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight block">
                {availableFcfa.toLocaleString("fr-FR")} F
              </span>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-normal">
                Ce que vous pouvez retirer
              </p>
            </div>
          </div>

          {/* Card 2: 7 derniers jours (Left side: col-span-1) */}
          <div className="col-span-1 lg:col-span-1 rounded-2xl border border-[#E2E8F0] dark:border-[#263043] bg-[#F8FAFC]/90 dark:bg-[#151C2B] p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              <div className="h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="h-3.5 w-3.5 stroke-[1.75]" />
              </div>
              <span className="truncate">7 derniers jours</span>
            </div>
            <div className="mt-3">
              <span className="text-[20px] sm:text-[26px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight block truncate">
                {sevenDaysRevenue.toLocaleString("fr-FR")} F
              </span>
              <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-normal truncate">
                Ventes payées
              </p>
            </div>
          </div>

          {/* Card 3: Clients (Right side: col-span-1) */}
          <div
            onClick={() => navigate("/dashboard/clients")}
            className="col-span-1 lg:col-span-1 rounded-2xl border border-[#E2E8F0] dark:border-[#263043] bg-[#F8FAFC]/90 dark:bg-[#151C2B] p-4 sm:p-5 cursor-pointer hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all flex flex-col justify-between shadow-2xs group"
          >
            <div className="flex items-center justify-between gap-1 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Users className="h-3.5 w-3.5 stroke-[1.75]" />
                </div>
                <span className="truncate">Clients</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-[20px] sm:text-[26px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight block">
                {totalClients}
              </span>
              <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-normal truncate">
                {totalSalesCount} commande{totalSalesCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Card: Montant encaissé */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Montant encaissé
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {periodRevenue.toLocaleString("fr-FR")} F sur {periodDays === 7 ? "7 jours" : periodDays === 30 ? "30 jours" : "3 mois"}, commandes payées uniquement
              </p>
            </div>

            {/* Period Selector Tabs */}
            <div className="flex items-center p-1 rounded-xl border border-border bg-secondary/40 self-start sm:self-auto">
              <button
                onClick={() => setPeriodDays(7)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  periodDays === 7
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7 jours
              </button>
              <button
                onClick={() => setPeriodDays(30)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  periodDays === 30
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                30 jours
              </button>
              <button
                onClick={() => setPeriodDays(90)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  periodDays === 90
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                3 mois
              </button>
            </div>
          </div>

          {/* Area Chart: vert-bleu subtle gradient */}
          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dukaioChartTealBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5A4" stopOpacity={0.25} />
                    <stop offset="60%" stopColor="#1F3FA8" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.6}
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={{ stroke: "hsl(var(--border))", strokeOpacity: 0.8 }}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0EA5A4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#dukaioChartTealBlue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Two Columns: Meilleurs ventes & Activité */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Meilleurs ventes */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Meilleurs ventes
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vos produits qui rapportent le plus
                  </p>
                </div>
                <button
                  onClick={() => navigate("/dashboard/products")}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-colors"
                >
                  Mes produits
                </button>
              </div>

              {topProducts.length > 0 ? (
                <div className="space-y-2.5 mt-2">
                  {topProducts.map((prod: any, idx: number) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0">
                          {prod.thumbnail_url ? (
                            <img src={prod.thumbnail_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {prod.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {prod.salesCount} vente{prod.salesCount > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground block">
                          {Number(prod.salesTotal || 0).toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-secondary/20 py-12 px-4 text-center mt-2">
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                    Vos ventes apparaîtront ici dès la première commande payée.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Activité */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Activité
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ce qui vient de se passer.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/dashboard/sales")}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-colors"
                >
                  Toutes les ventes
                </button>
              </div>

              {recentSales.length > 0 ? (
                <div className="divide-y divide-border border-t border-border mt-2">
                  {recentSales.map((order: any) => (
                    <div key={order.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {order.products?.title || "Produit digital"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {order.customers?.name || order.customers?.email || "Client"} ·{" "}
                          {format(parseISO(order.created_at), "dd MMM à HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-foreground block">
                          {order.status === "completed"
                            ? `+${Number(order.amount).toLocaleString("fr-FR")} F`
                            : `${Number(order.amount).toLocaleString("fr-FR")} F`}
                        </span>
                        {order.status === "completed" ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.5 rounded-full">
                            Payé
                          </span>
                        ) : order.status === "pending" ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-1.5 py-0.5 rounded-full">
                            En attente
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-1.5 py-0.5 rounded-full">
                            Échoué
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-secondary/20 py-12 px-4 text-center mt-2">
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                    Vos ventes et nouveaux clients apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardOverview;
