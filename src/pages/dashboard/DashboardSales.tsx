import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ShoppingCart, TrendingUp, Calendar, Package, Tag, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrderWithProduct {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  promo_code: string | null;
  original_amount: number | null;
  product: { title: string; thumbnail_url: string | null } | null;
  customer: { name: string; email: string } | null;
}

const DashboardSales = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, growth: "0%" });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, amount, status, created_at, promo_code, original_amount, products(title, thumbnail_url), customers(name, email)")
        .eq("store_owner_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((o: any) => ({
        id: o.id,
        amount: Number(o.amount),
        status: o.status,
        created_at: o.created_at,
        promo_code: o.promo_code,
        original_amount: o.original_amount ? Number(o.original_amount) : null,
        product: o.products,
        customer: o.customers,
      }));

      setOrders(mapped);

      const totalSales = mapped.reduce((s, o) => s + o.amount, 0);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = mapped.filter((o) => new Date(o.created_at) >= monthStart).reduce((s, o) => s + o.amount, 0);
      const lastMonth = mapped.filter((o) => {
        const d = new Date(o.created_at);
        return d >= prevMonthStart && d < monthStart;
      }).reduce((s, o) => s + o.amount, 0);

      const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : thisMonth > 0 ? 100 : 0;
      setStats({ total: totalSales, thisMonth, growth: `${growth >= 0 ? "+" : ""}${growth}%` });
    };
    fetch();
  }, [user]);

  const statCards = [
    { label: "Ventes totales", value: `${stats.total.toLocaleString()} F`, icon: ShoppingCart, gradient: "from-primary/10 to-primary/5", iconColor: "text-primary bg-primary/15" },
    { label: "Ce mois", value: `${stats.thisMonth.toLocaleString()} F`, icon: Calendar, gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-600 bg-blue-500/15" },
    { label: "Croissance", value: stats.growth, icon: TrendingUp, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600 bg-emerald-500/15" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-6xl">
        {/* ============ Mobile premium hero ============ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-[hsl(265_60%_22%)] via-[hsl(265_70%_32%)] to-[hsl(265_75%_42%)] shadow-[0_18px_40px_-16px_hsl(265_70%_30%/0.7)]"
        >
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Ventes totales</p>
            <p className="text-4xl font-extrabold tracking-tight">
              {stats.total.toLocaleString()}
              <span className="text-xl font-bold text-accent ml-1">F</span>
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-white/60">Ce mois</p>
                <p className="text-sm font-bold mt-0.5">{stats.thisMonth.toLocaleString()} F</p>
              </div>
              <div className="flex-1 rounded-2xl bg-accent/20 backdrop-blur-sm border border-accent/30 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-accent/90">Croissance</p>
                <p className="text-sm font-bold mt-0.5 text-accent">{stats.growth}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] text-white/70">{orders.length} transaction{orders.length > 1 ? "s" : ""} confirmée{orders.length > 1 ? "s" : ""}</p>
            </div>
          </div>
        </motion.div>

        {/* ============ Desktop header + stats ============ */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-foreground">Ventes</h1>
          <p className="text-sm text-muted-foreground mt-1">Suivez toutes vos transactions</p>
        </div>

        <div className="hidden md:grid grid-cols-3 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border border-border/50 bg-gradient-to-br ${s.gradient} p-5`}
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.iconColor} mb-3`}>
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Aucune vente pour le moment</p>
            <p className="text-xs text-muted-foreground">Les ventes apparaîtront ici automatiquement.</p>
          </div>
        ) : (
          <>
            {/* ============ Desktop table ============ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="hidden md:block rounded-2xl border border-border/50 bg-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Produit</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Client</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Montant</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Promo</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} onClick={() => navigate(`/dashboard/sales/${o.id}`)} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                              {o.product?.thumbnail_url ? (
                                <img src={o.product.thumbnail_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground/40" />
                              )}
                            </div>
                            <span className="font-medium text-foreground truncate max-w-[200px]">{o.product?.title || "Produit"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{o.customer?.name || "—"}</td>
                        <td className="p-4">
                          <div>
                            <span className="font-semibold text-foreground">{o.amount.toLocaleString()} F</span>
                            {o.original_amount && o.original_amount > o.amount && (
                              <span className="block text-xs text-muted-foreground line-through">{o.original_amount.toLocaleString()} F</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {o.promo_code ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                              <Tag className="h-3 w-3" />
                              {o.promo_code}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">{format(new Date(o.created_at), "dd MMM yyyy HH:mm", { locale: fr })}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* ============ Mobile premium list ============ */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-base font-bold text-foreground">Transactions</h2>
                <span className="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {orders.length}
                </span>
              </div>
              <div className="space-y-2">
                {orders.map((o, i) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/dashboard/sales/${o.id}`)}
                    className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-3 active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-primary to-accent" />
                    <div className="flex items-center gap-3 pl-1">
                      <div className="relative h-12 w-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-border">
                        {o.product?.thumbnail_url ? (
                          <img src={o.product.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/40" />
                        )}
                        {o.promo_code && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent flex items-center justify-center ring-2 ring-card">
                            <Tag className="h-2 w-2 text-accent-foreground" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate leading-tight">
                          {o.product?.title || "Produit"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {o.customer?.name || "Client"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Payé
                          </span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(o.created_at), "dd MMM HH:mm", { locale: fr })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-extrabold text-foreground leading-none">
                          {o.amount.toLocaleString()}
                          <span className="text-[10px] font-bold text-accent ml-0.5">F</span>
                        </p>
                        {o.original_amount && o.original_amount > o.amount && (
                          <p className="text-[10px] text-muted-foreground line-through mt-1">
                            {o.original_amount.toLocaleString()} F
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSales;
