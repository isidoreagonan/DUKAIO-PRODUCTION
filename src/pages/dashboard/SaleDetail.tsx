import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Copy, Check, ShieldOff, Sparkles, Package, User as UserIcon,
  CreditCard, Globe, Clock, Mail, Phone, Tag, ExternalLink, Receipt,
  CheckCircle2, KeyRound, Hash, MapPin, Smartphone,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface OrderRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  promo_code: string | null;
  original_amount: number | null;
  payment_method: string | null;
  moneroo_transaction_id: string | null;
  pawapay_deposit_id: string | null;
  shipping_address: any;
  product_id: string;
  customer_id: string;
}

const PAYMENT_LABEL: Record<string, string> = {
  mobile_money: "Mobile Money",
  card: "Carte bancaire",
  bank_transfer: "Virement bancaire",
  wallet: "Portefeuille",
  free: "Gratuit",
};

const SaleDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !orderId) return;
    (async () => {
      const { data: o, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("store_owner_id", user.id)
        .maybeSingle();
      if (error || !o) {
        toast.error("Commande introuvable");
        navigate("/dashboard/sales");
        return;
      }
      setOrder(o as any);

      const [{ data: p }, { data: c }, { data: lic }] = await Promise.all([
        supabase.from("products").select("id, title, type, thumbnail_url, price").eq("id", o.product_id).maybeSingle(),
        supabase.from("customers").select("id, name, email, phone, created_at").eq("id", o.customer_id).maybeSingle(),
        supabase.from("licenses").select("license_key, status, max_activations, expires_at, activated_at").eq("order_id", o.id),
      ]);
      setProduct(p);
      setCustomer(c);
      setLicenses(lic || []);
      setLoading(false);
    })();
  }, [orderId, user, navigate]);

  const copy = (label: string, value?: string | null) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1200);
    toast.success("Copié");
  };

  if (loading || !order) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const txId = order.moneroo_transaction_id || order.pawapay_deposit_id || null;
  const country = order.shipping_address?.country || order.shipping_address?.country_name || null;
  const customerPhone = customer?.phone || order.shipping_address?.phone || null;
  const discount = order.original_amount && order.original_amount > order.amount
    ? order.original_amount - order.amount : 0;
  const paymentLabel = PAYMENT_LABEL[order.payment_method || ""] || order.payment_method || "—";

  const initials = (customer?.name || "?")
    .split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

  const whatsappLink = customerPhone
    ? `https://wa.me/${customerPhone.replace(/[^0-9]/g, "")}` : null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/sales")} className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <button
            onClick={() => copy("id", order.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 font-mono text-[11px] text-foreground hover:bg-secondary/70"
          >
            #SALE{shortId}
            {copiedField === "id" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </button>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white bg-gradient-to-br from-[hsl(265_60%_22%)] via-[hsl(265_70%_32%)] to-[hsl(265_75%_42%)] shadow-[0_20px_50px_-20px_hsl(265_70%_30%/0.7)]"
        >
          <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-50">
                <CheckCircle2 className="h-3 w-3" /> {order.status === "completed" ? "Payée" : order.status}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-white/70">
                <Clock className="h-3 w-3" />
                {format(new Date(order.created_at), "EEE d MMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Montant net</p>
            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {order.amount.toLocaleString("fr-FR")}
              <span className="text-xl font-bold text-accent ml-1.5">FCFA</span>
            </p>
            {discount > 0 && (
              <p className="mt-1 text-xs text-white/70">
                <span className="line-through">{order.original_amount?.toLocaleString("fr-FR")} F</span>
                <span className="ml-2 inline-flex items-center gap-1 text-accent">
                  <Tag className="h-3 w-3" /> -{discount.toLocaleString("fr-FR")} F ({order.promo_code})
                </span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm">
                    <Smartphone className="h-3.5 w-3.5" /> Contacter WhatsApp
                  </Button>
                </a>
              )}
              {customer?.email && (
                <a href={`mailto:${customer.email}`}>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-white hover:bg-white/15">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Button>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Product */}
        <Section icon={Package} title="Produit acheté">
          <Link
            to={`/dashboard/products`}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 hover:bg-secondary/40 transition-colors"
          >
            <div className="h-14 w-14 rounded-xl bg-secondary overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-border">
              {product?.thumbnail_url ? (
                <img src={product.thumbnail_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{product?.title || "Produit"}</p>
              <p className="text-[11px] text-muted-foreground capitalize">
                {product?.type === "file" ? "Fichier numérique"
                  : product?.type === "course" ? "Formation"
                  : product?.type === "license" ? "Licence" : product?.type || "—"}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Section>

        {/* Client */}
        <Section icon={UserIcon} title="Client">
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border/60">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground uppercase tracking-wide text-sm truncate">
                  {customer?.name || "Client"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Client depuis {customer?.created_at && format(new Date(customer.created_at), "MMM yyyy", { locale: fr })}
                </p>
              </div>
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-600">
                  <Smartphone className="h-4 w-4" />
                </a>
              )}
            </div>
            <KvRow label="Email" value={customer?.email} icon={Mail} onCopy={() => copy("email", customer?.email)} copied={copiedField === "email"} />
            <KvRow label="Téléphone" value={customerPhone} icon={Phone} onCopy={() => copy("phone", customerPhone)} copied={copiedField === "phone"} />
          </div>
        </Section>

        {/* Payment */}
        <Section icon={CreditCard} title="Informations de paiement">
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <KvRow label="Prix initial" value={`${(order.original_amount || order.amount).toLocaleString("fr-FR")} FCFA`} />
            <KvRow label="Réduction" value={discount > 0 ? `-${discount.toLocaleString("fr-FR")} FCFA` : "—"} highlight={discount > 0 ? "accent" : undefined} />
            <KvRow label="Montant net" value={`${order.amount.toLocaleString("fr-FR")} FCFA`} bold />
            <KvRow label="Moyen de paiement" value={paymentLabel} icon={CreditCard} />
            {txId && (
              <KvRow
                label="ID transaction" value={txId} icon={Hash} mono
                onCopy={() => copy("tx", txId)} copied={copiedField === "tx"}
              />
            )}
            <KvRow label="Date de paiement" value={format(new Date(order.created_at), "d MMM yyyy 'à' HH:mm:ss", { locale: fr })} icon={Clock} />
          </div>
        </Section>

        {/* Access */}
        <Section icon={ShieldOff} title="Accès au produit">
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <KvRow
              label="Statut d'accès"
              value={order.status === "completed" ? "Actif" : "En attente"}
              highlight={order.status === "completed" ? "emerald" : undefined}
            />
            {licenses.length > 0 && (
              <>
                <Separator />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <KeyRound className="h-3.5 w-3.5" /> Clés de licence ({licenses.length})
                  </div>
                  {licenses.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                      <code className="flex-1 text-[12px] font-mono text-foreground truncate">{l.license_key}</code>
                      <Badge variant="outline" className="text-[10px] capitalize">{l.status}</Badge>
                      <button onClick={() => copy(`lic-${i}`, l.license_key)} className="text-muted-foreground hover:text-foreground">
                        {copiedField === `lic-${i}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>

        {/* Context */}
        {(country || order.shipping_address) && (
          <Section icon={Globe} title="Contexte">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              {country && <KvRow label="Pays" value={country} icon={MapPin} />}
              <KvRow label="Source" value="Boutique en ligne" icon={Sparkles} />
            </div>
          </Section>
        )}
      </div>
    </DashboardLayout>
  );
};

const Section = ({ icon: Icon, title, children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="space-y-2"
  >
    <div className="flex items-center gap-2 px-1">
      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const KvRow = ({ label, value, icon: Icon, onCopy, copied, mono, bold, highlight }: any) => {
  if (value === undefined || value === null || value === "") value = "—";
  const colorClass =
    highlight === "emerald" ? "text-emerald-600" :
    highlight === "accent" ? "text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-md" : "";
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm text-right truncate ${bold ? "font-bold text-foreground" : "text-foreground"} ${mono ? "font-mono text-[12px]" : ""} ${colorClass}`}>
          {value}
        </span>
        {onCopy && value !== "—" && (
          <button onClick={onCopy} className="text-muted-foreground hover:text-foreground shrink-0">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default SaleDetail;
