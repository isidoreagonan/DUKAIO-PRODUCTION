import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, DollarSign, ArrowDownRight, ArrowUpRight, Mail, Phone, Globe, Calendar, Store, Box, CreditCard, Activity } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
    if (user?.email !== "isidoreagonan@gmail.com") return;
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

  const getFlagImg = (code: string | null, size = 20) => {
    if (!code) return <span>🌍</span>;
    return <img src={`https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png`} alt={code} className="rounded-sm object-cover" style={{ height: size, width: size * 1.5 }} />;
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

  if (user?.email !== "isidoreagonan@gmail.com") {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground font-medium">Accès non autorisé</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Gestion des utilisateurs
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {profiles.length} utilisateur{profiles.length > 1 ? "s" : ""} inscrit{profiles.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-white border-slate-200 shadow-sm focus-visible:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Users list */}
          <div className="lg:col-span-1 space-y-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm bg-white rounded-2xl border border-slate-100">Aucun utilisateur trouvé</div>
            ) : (
              filtered.map((p) => {
                const avatar = p.google_avatar || p.avatar_url;
                const name = p.google_name || p.display_name || (p.first_name || p.last_name ? `${p.last_name || ""} ${p.first_name || ""}`.trim() : "Sans nom");
                const initial = name.charAt(0).toUpperCase();

                return (
                  <button
                    key={p.id}
                    onClick={() => fetchUserDetails(p.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                      selectedUserId === p.id
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                        : "border-slate-100 hover:border-slate-300 hover:shadow-sm bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-sm overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {name}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{p.email || "Aucun email"}</p>
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
              <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <Users className="h-12 w-12 text-slate-300 mb-4" />
                <p className="font-medium">Sélectionnez un utilisateur pour voir ses détails complets</p>
              </div>
            ) : loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-slate-500 font-medium animate-pulse">Chargement des données...</p>
              </div>
            ) : userDetails ? (
              <div className="space-y-6">
                
                {/* Header Profile */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Activity className="h-32 w-32" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white shrink-0 overflow-hidden">
                      {userDetails.profile.google_avatar || userDetails.profile.avatar_url ? (
                        <img src={userDetails.profile.google_avatar || userDetails.profile.avatar_url || ""} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (userDetails.profile.google_name || userDetails.profile.display_name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">
                          {userDetails.profile.google_name || userDetails.profile.display_name || "Utilisateur sans nom"}
                        </h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mt-1 font-medium">
                          <Mail className="h-4 w-4" />
                          <span>{userDetails.profile.email || "Aucun email"}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium">
                        {userDetails.profile.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{userDetails.profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span className="flex items-center gap-1">{getFlagImg(userDetails.profile.country_code, 16)} {userDetails.profile.country_code || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>Inscrit le {format(new Date(userDetails.profile.created_at), "dd MMM yyyy", { locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-800">{userDetails.stats.totalSales.toLocaleString()} <span className="text-sm font-bold text-slate-400">FCFA</span></p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Ventes totales</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-800">{userDetails.stats.salesCount}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Transactions</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Store className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-800">{userDetails.stats.storesCount}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Boutiques</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Box className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-800">{userDetails.stats.productsCount}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Produits</p>
                  </div>
                </div>

                {/* Stores & Products overview */}
                {(userDetails.stores.length > 0 || userDetails.products.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Store className="h-5 w-5 text-purple-500" /> Boutiques
                      </h3>
                      {userDetails.stores.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Aucune boutique créée</p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {userDetails.stores.map((store: any) => (
                            <div key={store.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5 text-slate-300" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 truncate">{store.name}</p>
                                <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate inline-block w-full">/{store.slug}</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Box className="h-5 w-5 text-orange-500" /> Produits Récents
                      </h3>
                      {userDetails.products.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Aucun produit créé</p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {userDetails.products.slice(0, 10).map((prod: any) => (
                            <div key={prod.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                {prod.thumbnail_url ? <img src={prod.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <Box className="h-5 w-5 text-slate-300" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 truncate">{prod.title}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">{prod.price.toLocaleString()} FCFA</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Events */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-slate-800">Événements financiers</h3>
                  </div>
                  {userDetails.events.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm font-medium">
                      Aucun événement pour cet utilisateur
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {userDetails.events.map((ev, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                              ev.type === "sale"
                                ? "bg-green-100 text-green-600 border border-green-200"
                                : ev.type === "commission"
                                ? "bg-blue-100 text-blue-600 border border-blue-200"
                                : "bg-orange-100 text-orange-600 border border-orange-200"
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
                            <p className="text-sm font-bold text-slate-800">
                              {ev.type === "sale" ? "Nouvelle Vente" : ev.type === "commission" ? "Frais Dukaio" : "Retrait de fonds"}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                              {format(new Date(ev.date), "dd MMM yyyy à HH:mm", { locale: fr })}
                              {ev.detail && <span className="ml-1 text-slate-400">· {ev.detail}</span>}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`text-base font-black ${
                                ev.type === "withdrawal" ? "text-orange-600" : ev.type === "commission" ? "text-blue-600" : "text-green-600"
                              }`}
                            >
                              {ev.type === "withdrawal" || ev.type === "commission" ? "-" : "+"}
                              {ev.amount.toLocaleString()} FCFA
                            </p>
                            {ev.status && (
                              <Badge variant={ev.status === 'completed' ? 'default' : 'secondary'} className={`mt-1 text-[10px] ${ev.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}>
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
