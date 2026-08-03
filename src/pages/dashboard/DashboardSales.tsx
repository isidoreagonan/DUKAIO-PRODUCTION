import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ShoppingCart, TrendingUp, Calendar, Package, Tag, Download, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");

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

  const uniqueProducts = Array.from(new Set(orders.map(o => o.product?.title).filter(Boolean)));
  
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (o.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = selectedProduct === "all" || o.product?.title === selectedProduct;
    return matchesSearch && matchesProduct;
  });

  const handleExportCSV = () => {
    const csvData = [
      ["Référence", "Client", "Produit", "Date", "Prix", "Statut"],
      ...filteredOrders.map(o => [
        o.id,
        o.customer?.name || o.customer?.email || "Anonyme",
        o.product?.title || "Produit inconnu",
        format(new Date(o.created_at), "dd/MM/yyyy HH:mm"),
        o.amount,
        o.status
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ventes_dukaio_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-6xl mx-auto w-full">
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
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ventes</h1>
            <p className="text-sm text-muted-foreground mt-1">Suivez toutes vos transactions</p>
          </div>
          <Button onClick={handleExportCSV} className="bg-[#2563EB] hover:bg-blue-700 text-white gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Exporter les données
          </Button>
        </div>

        <div className="hidden md:grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Ventes totales (Brand Blue) */}
          <div className="bg-[#2563EB] border border-[#2563EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between group text-white">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90 leading-snug">
                  Ventes totales
                </span>
              </div>
            </div>
            <div className="mt-5">
              <span className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight">
                {stats.total.toLocaleString()} F
              </span>
            </div>
          </div>

          {/* Card 2: Ce mois (White with gray border) */}
          <div className="bg-white border border-[#D0D5DD] rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-sm font-semibold text-slate-700 leading-snug">
                  Ce mois
                </span>
              </div>
            </div>
            <div className="mt-5">
              <span className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                {stats.thisMonth.toLocaleString()} F
              </span>
            </div>
          </div>

          {/* Card 3: Croissance (White with gray border) */}
          <div className="bg-white border border-[#D0D5DD] rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100/90 text-slate-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-sm font-semibold text-slate-700 leading-snug">
                  Croissance
                </span>
              </div>
            </div>
            <div className="mt-5">
              <span className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                {stats.growth}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Chercher par vente ou client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-[#D0D5DD] bg-white h-11"
            />
          </div>
          <div className="sm:w-[250px]">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="rounded-xl border-[#D0D5DD] bg-white h-11 text-slate-600">
                <SelectValue placeholder="Produits..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                {uniqueProducts.map(p => (
                  <SelectItem key={p as string} value={p as string}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl bg-[#FAFAFA] p-16 text-center shadow-sm flex flex-col items-center justify-center border border-white">
            <p className="text-base font-medium text-slate-500 mb-6">Aucune vente à afficher</p>
            <Button onClick={() => navigate('/dashboard/products/new')} className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 rounded-xl h-11">
              Ajouter un produit
            </Button>
          </div>
        ) : (
          <>
            {/* ============ Desktop table ============ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="hidden md:block rounded-2xl bg-white overflow-hidden shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Référence</th>
                      <th className="text-left p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Client</th>
                      <th className="text-left p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Produits</th>
                      <th className="text-left p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} onClick={() => navigate(`/dashboard/sales/${o.id}`)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="p-4 text-slate-500 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4 text-slate-700 font-medium">{o.customer?.name || "—"}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                              {o.product?.thumbnail_url ? (
                                <img src={o.product.thumbnail_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <span className="font-medium text-slate-700 truncate max-w-[200px]">{o.product?.title || "Produit"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{format(new Date(o.created_at), "dd/MM/yyyy")}</td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900">{o.amount.toLocaleString()} XOF</span>
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
                  {filteredOrders.length}
                </span>
              </div>
              <div className="space-y-2">
                {filteredOrders.map((o, i) => (
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
