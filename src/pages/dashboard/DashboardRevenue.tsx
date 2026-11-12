import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, Search, Calendar, ChevronLeft, ChevronRight,
  BadgeCheck, Clock, X
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product_id: string;
  payment_method: string | null;
  products: { title: string } | null;
  customers: { name: string; email: string } | null;
}

interface RevenueItem {
  id: string;
  title: string;
  detail: string;
  grossAmount: number;
  amount: number; // 95% net pour le vendeur
  commission: number; // 5% frais de plateforme DUKAIO
  date: string;
  availableAt: string;
  status: "paid" | "pending";
  isAvailable: boolean;
}

const ITEMS_PER_PAGE = 7;

export default function DashboardRevenue() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "7d" | "30d" | "year">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch only successfully completed orders (money actually paid by the buyer)
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, amount, status, created_at, product_id, payment_method, products(title), customers(name, email)")
          .eq("store_owner_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders((data as any) || []);
      } catch (err) {
        console.error("Erreur chargement revenus:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscription for completed order updates
    const channel = supabase
      .channel("revenue-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `store_owner_id=eq.${user.id}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Aggregate stats: Revenus totaux, Revenus en attente (délai 24h), Revenus payés / disponibles
  const { totalRevenue, pendingRevenue, paidRevenue } = useMemo(() => {
    const now = new Date();
    // Délai automatique de sécurité de 24 heures avant que les fonds soient retirables
    const holdCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let total = 0;
    let pending = 0;
    let paid = 0;

    orders.forEach((o) => {
      const grossAmt = Number(o.amount || 0);
      // Net vendeur : 95% après déduction des 5% de frais de plateforme DUKAIO
      const netAmt = Math.round(grossAmt * 0.95);

      total += netAmt;

      const createdAt = new Date(o.created_at);
      if (createdAt > holdCutoff) {
        // En attente : vente payée il y a moins de 24 heures
        pending += netAmt;
      } else {
        // Payé / Disponible : plus de 24h écoulées, retirable immédiatement
        paid += netAmt;
      }
    });

    return {
      totalRevenue: total,
      pendingRevenue: pending,
      paidRevenue: paid,
    };
  }, [orders]);

  // Transform completed sales into clean revenue items (95% net seller)
  const allItems: RevenueItem[] = useMemo(() => {
    const now = new Date();
    const holdCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return orders.map((o) => {
      const createdAt = new Date(o.created_at);
      const grossAmt = Number(o.amount || 0);
      const netAmt = Math.round(grossAmt * 0.95);
      const commission = grossAmt - netAmt;
      const isAvailable = createdAt <= holdCutoff;
      const status: "paid" | "pending" = isAvailable ? "paid" : "pending";

      // Date de disponibilité (created_at + 24 heures)
      const availableAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

      return {
        id: o.id,
        title: (o.products as any)?.title || "Vente produit digital",
        detail: (o.customers as any)?.name || (o.customers as any)?.email || "Client",
        grossAmount: grossAmt,
        amount: netAmt,
        commission,
        date: o.created_at,
        availableAt: availableAt.toISOString(),
        status,
        isAvailable,
      };
    });
  }, [orders]);

  // Filter items according to search, status, and period
  const filteredItems = useMemo(() => {
    let result = allItems;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.detail.toLowerCase().includes(q) ||
          String(i.amount).includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }

    // Period filter
    if (periodFilter !== "all") {
      const now = Date.now();
      const days = periodFilter === "7d" ? 7 : periodFilter === "30d" ? 30 : 365;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      result = result.filter((i) => new Date(i.date).getTime() >= cutoff);
    }

    return result;
  }, [allItems, searchTerm, statusFilter, periodFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, periodFilter]);

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 sm:space-y-8 w-full py-2">
          <Skeleton className="h-44 sm:h-52 2xl:h-64 w-full rounded-[28px] 2xl:rounded-[36px]" />
          <Skeleton className="h-11 sm:h-12 2xl:h-14 w-full rounded-2xl" />
          <Skeleton className="h-72 sm:h-96 2xl:h-[480px] w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-7 xl:space-y-8 2xl:space-y-10 w-full font-sans pb-12">
        {/* ======================================================== */}
        {/* TOP STAT CONTAINER (Responsive & Scales on Big Screens)   */}
        {/* 3 Stat Cards + "Effectuer un retrait" Button             */}
        {/* ======================================================== */}
        <div className="rounded-[24px] sm:rounded-[28px] 2xl:rounded-[36px] border border-slate-200/70 dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-[#141B26] p-4 sm:p-5 xl:p-6 2xl:p-8 shadow-2xs">
          {/* Desktop & Monitor: Horizontal Row / Mobile: Stacked Cards */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 xl:gap-5 2xl:gap-6">
            {/* Stat Cards Grid (Desktop 3 columns / Mobile stacked) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 xl:gap-4 2xl:gap-6 flex-1">
              {/* Card 1: Revenus totaux nets */}
              <div className="rounded-2xl 2xl:rounded-[24px] border border-slate-200/40 dark:border-slate-800 bg-white dark:bg-[#1A2234] p-4 sm:p-5 xl:p-6 2xl:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-center text-center sm:text-left transition-all">
                <span className="text-xs sm:text-xs xl:text-sm 2xl:text-base font-semibold text-slate-500 dark:text-slate-400 block sm:hidden mb-1">
                  Revenus totaux nets
                </span>
                <span className="text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatAmount(totalRevenue)}
                </span>
                <span className="text-xs sm:text-xs xl:text-sm 2xl:text-base font-semibold text-slate-500 dark:text-slate-400 hidden sm:block mt-1 2xl:mt-1.5">
                  Revenus totaux nets
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                  Net vendeur (-5% DUKAIO déduits)
                </span>
              </div>

              {/* Card 2: Revenus en attente (délai 24h) */}
              <div className="rounded-2xl 2xl:rounded-[24px] border border-amber-200/50 dark:border-amber-900/40 bg-[#FEFDEB] dark:bg-amber-950/25 p-4 sm:p-5 xl:p-6 2xl:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-center text-center sm:text-left transition-all">
                <span className="text-xs sm:text-xs xl:text-sm 2xl:text-base font-semibold text-amber-900/70 dark:text-amber-300/80 block sm:hidden mb-1">
                  En attente (Délai 24h)
                </span>
                <span className="text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl font-black text-slate-900 dark:text-amber-200 tracking-tight">
                  {formatAmount(pendingRevenue)}
                </span>
                <span className="text-xs sm:text-xs xl:text-sm 2xl:text-base font-semibold text-amber-900/70 dark:text-amber-300/80 hidden sm:block mt-1 2xl:mt-1.5">
                  En attente (Délai 24h)
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
                  Sécurité 24h avant déblocage
                </span>
              </div>

              {/* Card 3: Revenus disponibles */}
              <div className="rounded-2xl 2xl:rounded-[24px] border border-emerald-200/50 dark:border-emerald-900/40 bg-[#F0FDF4] dark:bg-emerald-950/25 p-4 sm:p-5 xl:p-6 2xl:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-center text-center sm:text-left transition-all">
                <span className="text-xs sm:text-xs xl:text-sm 2xl:text-base font-semibold text-emerald-900/70 dark:text-emerald-300/80 block sm:hidden mb-1">
                  Disponible au retrait
                </span>
                <span className="text-2xl sm:text-3xl xl:text-3xl 2xl:text-4xl font-black text-slate-900 dark:text-emerald-200 tracking-tight">
                  {formatAmount(paidRevenue)}
                </span>
                <span className="text-xs sm:text-xs xl:text-sm 2xl:text-base font-semibold text-emerald-900/70 dark:text-emerald-300/80 hidden sm:block mt-1 2xl:mt-1.5">
                  Disponible au retrait
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                  Prêt pour retrait Mobile Money
                </span>
              </div>
            </div>

            {/* Action Button: Effectuer un retrait */}
            <button
              onClick={() => navigate("/dashboard/wallet")}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 2xl:gap-3.5 px-6 py-4 xl:px-8 xl:py-4.5 2xl:px-10 2xl:py-5.5 rounded-2xl 2xl:rounded-[24px] bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0F172A] font-extrabold text-xs xl:text-sm 2xl:text-base tracking-tight shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Wallet className="h-4 w-4 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 stroke-[2]" />
              <span>Effectuer un retrait</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEARCH, STATUS TABS & PERIOD FILTER                      */}
        {/* Fluid responsiveness for all screen dimensions           */}
        {/* ======================================================== */}
        <div className="space-y-3 sm:space-y-3.5 2xl:space-y-4 pt-1">
          {/* Row 1: Search bar (Desktop has date range beside it) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 xl:gap-4 2xl:gap-5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 xl:left-4 2xl:left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher"
                className="w-full h-11 xl:h-12 2xl:h-14 pl-10 xl:pl-11 2xl:pl-12 pr-9 2xl:pr-11 rounded-2xl 2xl:rounded-[22px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151C2B] text-xs xl:text-sm 2xl:text-base font-medium text-foreground placeholder:text-slate-400 outline-none focus:border-primary transition-colors shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 2xl:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                </button>
              )}
            </div>

            {/* Period Selector - Desktop & Monitor placement */}
            <div className="hidden sm:block w-[240px] xl:w-[280px] 2xl:w-[340px]">
              <Select value={periodFilter} onValueChange={(v: any) => setPeriodFilter(v)}>
                <SelectTrigger className="w-full h-11 xl:h-12 2xl:h-14 rounded-2xl 2xl:rounded-[22px] border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151C2B] text-xs xl:text-sm 2xl:text-base font-semibold text-foreground shadow-2xs">
                  <Calendar className="h-4 w-4 xl:h-4.5 xl:w-4.5 2xl:h-5 2xl:w-5 mr-2 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Toutes les dates" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-border bg-card">
                  <SelectItem value="all" className="text-xs xl:text-sm font-medium cursor-pointer">
                    Toutes les dates
                  </SelectItem>
                  <SelectItem value="7d" className="text-xs xl:text-sm font-medium cursor-pointer">
                    7 derniers jours
                  </SelectItem>
                  <SelectItem value="30d" className="text-xs xl:text-sm font-medium cursor-pointer">
                    30 derniers jours
                  </SelectItem>
                  <SelectItem value="year" className="text-xs xl:text-sm font-medium cursor-pointer">
                    Cette année
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Status Filter Pills (Tout, Payé, En attente) */}
          <div className="flex items-center gap-2 xl:gap-2.5 2xl:gap-3 overflow-x-auto pb-1 select-none">
            {/* Pill: Tout */}
            <button
              onClick={() => setStatusFilter("all")}
              className={`inline-flex items-center gap-2 2xl:gap-2.5 px-3.5 py-1.5 xl:px-4.5 xl:py-2 2xl:px-5.5 2xl:py-2.5 rounded-full text-xs xl:text-sm 2xl:text-base font-semibold transition-all shrink-0 ${
                statusFilter === "all"
                  ? "bg-[#E2E8F0] dark:bg-[#263043] text-slate-900 dark:text-slate-100 shadow-2xs"
                  : "bg-[#F1F3F5] dark:bg-[#1A2234] text-slate-500 hover:text-foreground"
              }`}
            >
              <span className="h-2 w-2 2xl:h-2.5 2xl:w-2.5 rounded-full bg-slate-500" />
              <span>Tout</span>
            </button>

            {/* Pill: Disponible au retrait */}
            <button
              onClick={() => setStatusFilter("paid")}
              className={`inline-flex items-center gap-2 2xl:gap-2.5 px-3.5 py-1.5 xl:px-4.5 xl:py-2 2xl:px-5.5 2xl:py-2.5 rounded-full text-xs xl:text-sm 2xl:text-base font-semibold transition-all shrink-0 ${
                statusFilter === "paid"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
                  : "bg-emerald-50/80 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70"
              }`}
            >
              <span className="h-2 w-2 2xl:h-2.5 2xl:w-2.5 rounded-full bg-emerald-500" />
              <span>Disponible</span>
            </button>

            {/* Pill: En attente (24h) */}
            <button
              onClick={() => setStatusFilter("pending")}
              className={`inline-flex items-center gap-2 2xl:gap-2.5 px-3.5 py-1.5 xl:px-4.5 xl:py-2 2xl:px-5.5 2xl:py-2.5 rounded-full text-xs xl:text-sm 2xl:text-base font-semibold transition-all shrink-0 ${
                statusFilter === "pending"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs"
                  : "bg-amber-50/80 dark:bg-amber-950/25 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70"
              }`}
            >
              <span className="h-2 w-2 2xl:h-2.5 2xl:w-2.5 rounded-full bg-amber-500" />
              <span>En attente (24h)</span>
            </button>
          </div>

          {/* Row 3 (Mobile only): Period Selector */}
          <div className="block sm:hidden pt-0.5">
            <Select value={periodFilter} onValueChange={(v: any) => setPeriodFilter(v)}>
              <SelectTrigger className="w-full h-11 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151C2B] text-xs font-semibold text-foreground shadow-2xs">
                <Calendar className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                <SelectValue placeholder="Toutes les dates" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border-border bg-card">
                <SelectItem value="all" className="text-xs font-medium cursor-pointer">
                  Toutes les dates
                </SelectItem>
                <SelectItem value="7d" className="text-xs font-medium cursor-pointer">
                  7 derniers jours
                </SelectItem>
                <SelectItem value="30d" className="text-xs font-medium cursor-pointer">
                  30 derniers jours
                </SelectItem>
                <SelectItem value="year" className="text-xs font-medium cursor-pointer">
                  Cette année
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TRANSACTIONS TABLE (Minimalist, Open & High-End)         */}
        {/* Columns: Montant, Dû le, Statut                          */}
        {/* ======================================================== */}
        <div className="pt-2">
          {filteredItems.length === 0 ? (
            /* Empty State */
            <div className="py-16 sm:py-24 xl:py-32 2xl:py-40 px-4 text-center space-y-3 2xl:space-y-4 rounded-3xl 2xl:rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-14 w-14 xl:h-18 xl:w-18 2xl:h-22 2xl:w-22 rounded-2xl 2xl:rounded-3xl bg-secondary mx-auto flex items-center justify-center text-muted-foreground">
                <Wallet className="h-7 w-7 xl:h-9 xl:w-9 2xl:h-11 2xl:w-11 stroke-[1.5]" />
              </div>
              <p className="text-sm sm:text-base xl:text-lg 2xl:text-xl font-bold text-foreground">
                Aucun revenu trouvé
              </p>
              <p className="text-xs sm:text-sm xl:text-base 2xl:text-lg text-muted-foreground max-w-md xl:max-w-xl mx-auto">
                {searchTerm || statusFilter !== "all" || periodFilter !== "all"
                  ? "Aucun résultat ne correspond à vos filtres actuels."
                  : "Vos gains apparaîtront ici dès que vos premières ventes seront validées."}
              </p>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/90 dark:border-slate-800 text-[13px] xl:text-sm 2xl:text-base font-bold text-slate-700 dark:text-slate-300">
                    <th className="py-3.5 xl:py-4 2xl:py-5 px-3 sm:px-5 2xl:px-7">Montant net (95%)</th>
                    <th className="py-3.5 xl:py-4 2xl:py-5 px-3 sm:px-5 2xl:px-7">Disponibilité</th>
                    <th className="py-3.5 xl:py-4 2xl:py-5 px-3 sm:px-5 2xl:px-7 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs xl:text-sm 2xl:text-base font-semibold">
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1A2234]/50 transition-colors"
                    >
                      {/* Column 1: Montant net */}
                      <td className="py-4 xl:py-5 2xl:py-6 px-3 sm:px-5 2xl:px-7 text-foreground font-bold tracking-tight">
                        <div className="text-[13px] sm:text-sm xl:text-base 2xl:text-lg font-black text-slate-900 dark:text-slate-100">
                          {formatAmount(item.amount)}
                        </div>
                        <div className="text-[11px] xl:text-xs font-normal text-muted-foreground truncate max-w-[200px] sm:max-w-md xl:max-w-xl mt-0.5">
                          {item.title} · <span className="opacity-80">{formatAmount(item.grossAmount)} brut (-5% com.)</span>
                        </div>
                      </td>

                      {/* Column 2: Disponibilité */}
                      <td className="py-4 xl:py-5 2xl:py-6 px-3 sm:px-5 2xl:px-7 text-slate-600 dark:text-slate-400 font-medium text-[12px] sm:text-xs xl:text-sm 2xl:text-base">
                        {item.isAvailable ? (
                          <div>
                            <span className="block font-semibold text-foreground">
                              {format(new Date(item.date), "d MMMM yyyy", { locale: fr })}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Fonds libérés
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="block font-semibold text-foreground">
                              {format(new Date(item.availableAt), "d MMMM à HH:mm", { locale: fr })}
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              Libération sous 24h
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Statut */}
                      <td className="py-4 xl:py-5 2xl:py-6 px-3 sm:px-5 2xl:px-7 text-right">
                        {item.isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 xl:px-4 xl:py-1.5 2xl:px-5 2xl:py-2 rounded-full text-[11px] xl:text-xs 2xl:text-sm font-bold bg-[#DCFCE7] dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 ml-auto">
                            <BadgeCheck className="h-3.5 w-3.5 xl:h-4 xl:w-4 2xl:h-4.5 2xl:w-4.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Disponible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 xl:px-4 xl:py-1.5 2xl:px-5 2xl:py-2 rounded-full text-[11px] xl:text-xs 2xl:text-sm font-bold bg-[#FEF3C7] dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 ml-auto">
                            <Clock className="h-3.5 w-3.5 xl:h-4 xl:w-4 2xl:h-4.5 2xl:w-4.5 text-amber-600 dark:text-amber-400" />
                            <span>En attente (24h)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Minimalist Centered Pagination (< >) */}
              {totalPages > 1 && (
                <div className="pt-8 pb-4 flex items-center justify-center gap-6 2xl:gap-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Page précédente"
                    className="p-1.5 2xl:p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Page suivante"
                    className="p-1.5 2xl:p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
