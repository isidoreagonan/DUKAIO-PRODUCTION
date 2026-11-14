import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Check,
  ExternalLink,
  Clock,
  Inbox,
  ShoppingBag,
  AlertTriangle,
  Info,
  CheckCircle2,
  Mail,
  Zap,
  EyeOff,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  data?: any;
}

export default function NotificationBell({ className }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (data) setNotifications(data as Notification[]);
    };

    load();

    const channel = supabase
      .channel("notifications-realtime-bell")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 30));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true } as any)
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const toggleReadStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const notif = notifications.find((n) => n.id === id);
    if (!notif || !user) return;
    const newStatus = !notif.is_read;
    await supabase.from("notifications").update({ is_read: newStatus } as any).eq("id", id);
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: newStatus } : item)));
    toast.success(newStatus ? "Marqué comme non lu" : "Marqué comme lu", { duration: 1800 });
  };

  const toggleExpand = async (n: Notification) => {
    // If clicking on an unread item, mark it as read automatically
    if (!n.is_read && user) {
      await supabase.from("notifications").update({ is_read: true } as any).eq("id", n.id);
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item)));
    }
    setExpandedId((prev) => (prev === n.id ? null : n.id));
  };

  const filteredList = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "sale":
      case "order":
      case "payment":
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error":
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "contact":
      case "message":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "automation":
      case "pixel":
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationBadgeLabel = (type: string) => {
    switch (type) {
      case "sale":
      case "order":
        return "Vente";
      case "payment":
        return "Paiement";
      case "success":
        return "Succès";
      case "error":
      case "warning":
        return "Alerte";
      case "contact":
        return "Message";
      default:
        return "Info";
    }
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      {/* Top Bar Circular Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="h-8 w-8 rounded-full bg-[#F4F6F8] dark:bg-[#1E2536] border border-border/50 hover:bg-secondary flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all relative cursor-pointer"
        title="Notifications en temps réel"
      >
        <Bell className="h-4 w-4 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold shadow-xs animate-in zoom-in duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-[330px] sm:w-[390px] rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-border/70 flex items-center justify-between gap-2 bg-card">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">Tout est à jour</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 px-3.5 py-1.5 border-b border-border/50 bg-muted/20 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer",
                filter === "all"
                  ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer",
                filter === "unread"
                  ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* List of Notifications (compact height: displays ~2 items, scrolls for more) */}
          <div className="max-h-[175px] overflow-y-auto divide-y divide-border/60 scrollbar-thin">
            {filteredList.length === 0 ? (
              <div className="py-8 text-center px-4 space-y-1.5">
                <div className="h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <Inbox className="h-4 w-4 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {filter === "unread" ? "Aucune notification non lue" : "Aucune notification pour le moment"}
                </p>
                <p className="text-[10px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Vos alertes de commandes, ventes et mises à jour s'afficheront ici.
                </p>
              </div>
            ) : (
              filteredList.map((n) => {
                const isExpanded = expandedId === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => toggleExpand(n)}
                    className={cn(
                      "p-3 transition-colors cursor-pointer group hover:bg-muted/40",
                      !n.is_read ? "bg-primary/[0.04]" : "bg-card"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className="h-8 w-8 rounded-xl bg-muted/70 flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Content summary */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!n.is_read && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                            )}
                            <p className={cn("text-xs leading-snug truncate", !n.is_read ? "font-bold text-foreground" : "font-medium text-foreground")}>
                              {n.title}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                          </span>
                        </div>

                        {/* Collapsed message preview */}
                        {!isExpanded && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
                            {n.message}
                          </p>
                        )}

                        {/* Expanded full details */}
                        {isExpanded && (
                          <div className="pt-2 space-y-2 animate-in fade-in duration-200">
                            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-xs text-foreground leading-relaxed whitespace-pre-line">
                              {n.message}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border/70 font-semibold uppercase tracking-wider text-[9px]">
                                {getNotificationBadgeLabel(n.type)}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="h-3 w-3" />
                                {format(new Date(n.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-border/40">
                              {/* Toggle read/unread button */}
                              <button
                                type="button"
                                onClick={(e) => toggleReadStatus(n.id, e)}
                                className="text-[11px] font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 py-1 cursor-pointer"
                              >
                                {n.is_read ? (
                                  <>
                                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                                    <span>Marquer comme non lu</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 text-primary" />
                                    <span>Marquer comme lu</span>
                                  </>
                                )}
                              </button>

                              {n.link && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    navigate(n.link!);
                                  }}
                                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  Voir les détails <ExternalLink className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right actions: Quick unread toggle + Chevron */}
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          type="button"
                          onClick={(e) => toggleReadStatus(n.id, e)}
                          className={cn(
                            "h-6 w-6 rounded-md flex items-center justify-center transition-colors cursor-pointer",
                            n.is_read
                              ? "text-muted-foreground/60 hover:text-foreground hover:bg-muted/70"
                              : "text-primary hover:bg-primary/10"
                          )}
                          title={n.is_read ? "Marquer comme non lu" : "Marquer comme lu"}
                        >
                          {n.is_read ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          )}
                        </button>

                        <button
                          type="button"
                          className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-transform"
                          title={isExpanded ? "Replier" : "Déplier"}
                          tabIndex={-1}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with link to Automations / Settings */}
          <div className="p-3 border-t border-border/70 bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-[11px] text-muted-foreground">Alertes & automatisations</span>
            <Link
              to="/dashboard/automations"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Gérer dans Automatisations →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
