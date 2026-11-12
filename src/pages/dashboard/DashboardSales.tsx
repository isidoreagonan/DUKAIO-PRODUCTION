import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, TrendingUp, Calendar, Package, Download, Search,
  Plus, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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

export default function DashboardSales() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, growth: "0%" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("orders")
          .select("id, amount, status, created_at, promo_code, original_amount, products(title, thumbnail_url), customers(name, email)")
          .eq("store_owner_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        const mapped: OrderWithProduct[] = (data || []).map((o: any) => ({
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
        const thisMonth = mapped
          .filter((o) => new Date(o.created_at) >= monthStart)
          .reduce((s, o) => s + o.amount, 0);
        const lastMonth = mapped
          .filter((o) => {
            const d = new Date(o.created_at);
            return d >= prevMonthStart && d < monthStart;
          })
          .reduce((s, o) => s + o.amount, 0);

        const growth =
          lastMonth > 0
            ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
            : thisMonth > 0
            ? 100
            : 0;
        setStats({ total: totalSales, thisMonth, growth: `${growth >= 0 ? "+" : ""}${growth}%` });
      } catch (err) {
        console.error("Erreur chargement ventes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const uniqueProducts = Array.from(new Set(orders.map((o) => o.product?.title).filter(Boolean)));

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = selectedProduct === "all" || o.product?.title === selectedProduct;
    return matchesSearch && matchesProduct;
  });

  const handleExportCSV = () => {
    const csvData = [
      ["Référence", "Client", "Produit", "Date", "Prix (XOF)", "Statut"],
      ...filteredOrders.map((o) => [
        o.id,
        o.customer?.name || o.customer?.email || "Anonyme",
        o.product?.title || "Produit",
        format(parseISO(o.created_at), "dd/MM/yyyy HH:mm"),
        o.amount,
        o.status,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

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
      <div className="space-y-6 w-full pb-14 font-sans">
        {/* Header: Title + CSV Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Ventes
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historique et suivi de toutes vos commandes payées.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              disabled={orders.length === 0}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold disabled:opacity-40 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Ventes totales */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Ventes totales</span>
              <ShoppingCart className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="mt-3">
              <span className="text-[26px] font-bold tracking-tight text-foreground block">
                {stats.total.toLocaleString("fr-FR")} F
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {orders.length} transaction{orders.length > 1 ? "s" : ""} payée{orders.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Ce mois */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Ce mois</span>
              <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="text-[26px] font-bold tracking-tight text-foreground block">
                {stats.thisMonth.toLocaleString("fr-FR")} F
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Volume sur le mois en cours
              </p>
            </div>
          </div>

          {/* Croissance */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Croissance</span>
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="mt-3">
              <span className="text-[26px] font-bold tracking-tight text-foreground block">
                {stats.growth}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Par rapport au mois précédent
              </p>
            </div>
          </div>
        </div>

        {/* Filters: Search + Filter by Product */}
        <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl border border-border bg-card shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par référence, nom ou email client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-lg bg-secondary/40 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="sm:w-[240px]">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg border border-border bg-secondary/40 text-xs font-medium text-foreground outline-none cursor-pointer hover:bg-secondary transition-colors"
            >
              <option value="all">Tous les produits</option>
              {uniqueProducts.map((p) => (
                <option key={p as string} value={p as string}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table or Empty State */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <h3 className="text-base font-bold text-foreground">Aucune vente enregistrée</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || selectedProduct !== "all"
                ? "Aucune transaction ne correspond à vos filtres de recherche."
                : "Partagez vos liens de produits pour réaliser votre première vente."}
            </p>
            <button
              onClick={() => navigate("/dashboard/products/new")}
              className="inline-flex items-center gap-2 h-8 px-4 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nouveau produit</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/dashboard/sales/${o.id}`)}
                      className="h-14 hover:bg-secondary/20 transition-colors cursor-pointer group"
                    >
                      <td className="py-2 px-4 font-mono text-[11px] text-muted-foreground">
                        {o.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-2 px-4 font-semibold text-foreground">
                        {o.customer?.name || o.customer?.email || "Anonyme"}
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          <div className="h-8 w-8 rounded-lg bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0">
                            {o.product?.thumbnail_url ? (
                              <img
                                src={o.product.thumbnail_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {o.product?.title || "Produit numérique"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-muted-foreground whitespace-nowrap text-[11px]">
                        {format(parseISO(o.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </td>
                      <td className="py-2 px-4 font-bold text-foreground whitespace-nowrap">
                        {o.amount.toLocaleString("fr-FR")} F
                      </td>
                      <td className="py-2 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Payé
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                          <span>Voir</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
