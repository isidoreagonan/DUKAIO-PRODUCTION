import { NavLink } from "react-router-dom";
import {
  Key, DollarSign, BarChart3, BadgeCheck, Megaphone, Link2,
  Zap, Webhook, MessageCircle, HelpCircle, ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";

const groups = [
  {
    label: "Revenus & Performance",
    items: [
      { title: "Licences", desc: "Gérez vos clés produit", url: "/dashboard/licenses", icon: Key },
      { title: "Revenus", desc: "Suivi détaillé des ventes", url: "/dashboard/revenue", icon: DollarSign },
      { title: "Analytiques", desc: "Statistiques & rapports", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Croissance",
    items: [
      { title: "Badge Verify", desc: "Vérification de confiance", url: "/dashboard/badge", icon: BadgeCheck },
      { title: "Marketing", desc: "Campagnes & promotions", url: "/dashboard/marketing", icon: Megaphone },
      { title: "Affiliation", desc: "Programme de partenaires", url: "/dashboard/affiliation", icon: Link2 },
    ],
  },
  {
    label: "Automation & Support",
    items: [
      { title: "Automatisations", desc: "Flux automatiques", url: "/dashboard/automations", icon: Zap },
      { title: "Webhooks", desc: "Intégrations API", url: "/dashboard/webhooks", icon: Webhook },
      { title: "Messages", desc: "Tickets & support client", url: "/dashboard/support", icon: MessageCircle },
      { title: "Centre d'aide", desc: "Documentation & FAQ", url: "/faq", icon: HelpCircle, external: true as const },
    ],
  },
];

export default function DashboardTools() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-foreground">Outils</h1>
          <p className="text-muted-foreground mt-1">
            Tous vos outils avancés au même endroit.
          </p>
        </motion.div>

        {groups.map((g, gi) => (
          <div key={g.label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3 px-1">
              {g.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.items.map((item, i) => {
                const Inner = (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.05 + i * 0.04 }}
                    whileHover={{ y: -2 }}
                    className="group relative h-full rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.35)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/25">
                        <item.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
                return "external" in item && item.external ? (
                  <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer">{Inner}</a>
                ) : (
                  <NavLink key={item.title} to={item.url}>{Inner}</NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
