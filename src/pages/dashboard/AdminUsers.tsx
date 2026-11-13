import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  Phone,
  Globe,
  Calendar,
  Store,
  Box,
  CreditCard,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { isAdminUser } from "@/lib/admin";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country_code: string | null;
  store_slug: string | null;
  created_at: string;
  email: string | null;
  google_avatar: string | null;
  google_name: string | null;
}

interface UserDetails {
  profile: UserProfile;
  stores: any[];
  products: any[];
  stats: {
    totalSales: number;
    salesCount: number;
    storesCount: number;
    productsCount: number;
    withdrawalsCount: number;
  };
  events: any[];
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isAdminUser(user?.email)) return;
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "list_users" },
      });
      if (error) throw error;
      setProfiles(data?.users || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-platform", {
        body: { action: "get_user_details", userId },
      });
      if (error) throw error;
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getFlagImg = (code: string | null, size = 16) => {
    if (!code || code.length !== 2) return <span className="text-xs">🌍</span>;
    const cleanCode = code.toLowerCase().trim();
    return (
      <img
        src={`https://flagcdn.com/w40/${cleanCode}.png`}
        alt={code}
        className="rounded-[2px] object-cover inline-block border border-border/40"
        style={{ height: size, width: size * 1.5 }}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
    );
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const name = p.display_name || p.google_name || p.first_name || p.last_name || "";
    return (
      !q ||
      name.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.store_slug?.toLowerCase().includes(q)
    );
  });

  if (!isAdminUser(user?.email)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {profiles.length} utilisateur{profiles.length > 1 ? "s" : ""} inscrit{profiles.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground shadow-2xs focus-visible:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Users list */}
          <div className="lg:col-span-1 space-y-2.5 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm bg-card rounded-2xl border border-border">
                Aucun utilisateur trouvé
              </div>
            ) : (
              filtered.map((p) => {
                const avatar = p.google_avatar || p.avatar_url;
                const name =
                  p.google_name ||
                  p.display_name ||
                  (p.first_name || p.last_name
                    ? `${p.last_name || ""} ${p.first_name || ""}`.trim()
                    : "Sans nom");
                const initial = name.charAt(0).toUpperCase();

                const isSelected = selectedUserId === p.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => fetchUserDetails(p.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground shadow-md ring-1 ring-primary/30"
                        : "border-border/80 hover:border-primary/40 hover:bg-muted/40 bg-card text-card-foreground shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 text-white font-bold text-base shadow-sm overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate leading-tight">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {p.email || "Aucun email"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* User detail + events */}
          <div className="lg:col-span-2">
            {!selectedUserId ? (
              <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-card/60 rounded-3xl border border-dashed border-border">
                <Users className="h-12 w-12 text-muted-foreground/60 mb-4" />
                <p className="font-medium text-sm">Sélectionnez un utilisateur pour voir ses détails complets</p>
              </div>
            ) : loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-32 bg-card rounded-3xl border border-border shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground font-medium animate-pulse text-sm">Chargement des données...</p>
              </div>
            ) : userDetails ? (
              <div className="space-y-6">
                {/* Header Profile */}
                <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-foreground">
                    <Activity className="h-32 w-32" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-border/50 shrink-0 overflow-hidden">
                      {userDetails.profile.google_avatar || userDetails.profile.avatar_url ? (
                        <img
                          src={userDetails.profile.google_avatar || userDetails.profile.avatar_url || ""}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (userDetails.profile.google_name || userDetails.profile.display_name || "U")
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-black text-foreground">
                          {userDetails.profile.google_name ||
                            userDetails.profile.display_name ||
                            "Utilisateur sans nom"}
                        </h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mt-1 font-medium text-sm">
                          <Mail className="h-4 w-4" />
                          <span>{userDetails.profile.email || "Aucun email"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-medium">
                        {userDetails.profile.phone && (
                          <div className="flex items-center gap-1.5 text-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/70">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{userDetails.profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/70">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="flex items-center gap-1.5">
                            {getFlagImg(userDetails.profile.country_code, 14)}{" "}
                            {userDetails.profile.country_code || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/70">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            Inscrit le{" "}
                            {format(new Date(userDetails.profile.created_at), "dd MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-card p-5 rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">
                      {userDetails.stats.totalSales.toLocaleString()}{" "}
                      <span className="text-xs font-bold text-muted-foreground">FCFA</span>
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                      Ventes totales
                    </p>
                  </div>

                  <div className="bg-card p-5 rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">{userDetails.stats.salesCount}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                      Transactions
                    </p>
                  </div>

                  <div className="bg-card p-5 rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Store className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">{userDetails.stats.storesCount}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                      Boutiques
                    </p>
                  </div>

                  <div className="bg-card p-5 rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Box className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">{userDetails.stats.productsCount}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                      Produits
                    </p>
                  </div>
                </div>

                {/* Stores & Products overview */}
                {(userDetails.stores.length > 0 || userDetails.products.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
                      <h3 className="font-bold text-foreground flex items-center gap-2 mb-4 text-base">
                        <Store className="h-5 w-5 text-purple-500" /> Boutiques
                      </h3>
                      {userDetails.stores.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Aucune boutique créée</p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {userDetails.stores.map((store: any) => (
                            <div
                              key={store.id}
                              className="flex items-center gap-3 p-3 bg-muted/40 rounded-2xl border border-border/80"
                            >
                              <div className="h-10 w-10 rounded-xl bg-background shadow-2xs border border-border flex items-center justify-center overflow-hidden shrink-0">
                                {store.logo_url ? (
                                  <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Store className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-foreground truncate">{store.name}</p>
                                <a
                                  href={`/store/${store.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline truncate inline-block w-full"
                                >
                                  /{store.slug}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
                      <h3 className="font-bold text-foreground flex items-center gap-2 mb-4 text-base">
                        <Box className="h-5 w-5 text-orange-500" /> Produits Récents
                      </h3>
                      {userDetails.products.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Aucun produit créé</p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {userDetails.products.slice(0, 10).map((prod: any) => (
                            <div
                              key={prod.id}
                              className="flex items-center gap-3 p-3 bg-muted/40 rounded-2xl border border-border/80"
                            >
                              <div className="h-10 w-10 rounded-xl bg-background shadow-2xs border border-border flex items-center justify-center overflow-hidden shrink-0">
                                {prod.thumbnail_url ? (
                                  <img src={prod.thumbnail_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Box className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-foreground truncate">{prod.title}</p>
                                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                                  {prod.price.toLocaleString()} FCFA
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Events */}
                <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">Événements financiers</h3>
                  </div>
                  {userDetails.events.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                      Aucun événement pour cet utilisateur
                    </div>
                  ) : (
                    <div className="divide-y divide-border max-h-[500px] overflow-y-auto custom-scrollbar">
                      {userDetails.events.map((ev, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                              ev.type === "sale"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : ev.type === "commission"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                            }`}
                          >
                            {ev.type === "sale" ? (
                              <ArrowUpRight className="h-5 w-5" />
                            ) : ev.type === "commission" ? (
                              <DollarSign className="h-5 w-5" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground">
                              {ev.type === "sale"
                                ? "Nouvelle Vente"
                                : ev.type === "commission"
                                ? "Frais Dukaio"
                                : "Retrait de fonds"}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                              {format(new Date(ev.date), "dd MMM yyyy à HH:mm", { locale: fr })}
                              {ev.detail && <span className="ml-1 text-muted-foreground/70">· {ev.detail}</span>}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`text-base font-black ${
                                ev.type === "withdrawal"
                                  ? "text-orange-600 dark:text-orange-400"
                                  : ev.type === "commission"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {ev.type === "withdrawal" || ev.type === "commission" ? "-" : "+"}
                              {ev.amount.toLocaleString()} FCFA
                            </p>
                            {ev.status && (
                              <Badge
                                variant={ev.status === "completed" ? "default" : "secondary"}
                                className={`mt-1 text-[10px] ${
                                  ev.status === "completed"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : ""
                                }`}
                              >
                                {ev.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
