import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import {
  getBuyerSession,
  clearBuyerSession,
  setBuyerOtpVerified,
} from "@/lib/buyerSession";

const BuyerVerifyOtp = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getBuyerSession();
    if (!session) {
      navigate("/buyer-login", { replace: true });
      return;
    }
    setEmail(session.email);
    // Auto-send first code
    sendCode(session.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendCode = async (target?: string) => {
    const addr = target || email;
    if (!addr) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-buyer-otp", {
        body: { email: addr },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      toast.success("Code envoyé à votre email");
      setSent(true);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi du code");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-buyer-otp", {
        body: { email, code: otp.trim() },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setBuyerOtpVerified();
      toast.success("Vérification réussie !");
      navigate("/mes-achats", { replace: true });
    } catch (e: any) {
      toast.error(e.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearBuyerSession();
    navigate("/buyer-login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 mb-10">
          <img src={logo} alt="Dukaio" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold text-foreground">Dukaio</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Vérification sécurisée</h1>
            <p className="text-sm text-muted-foreground">Confirmez votre identité par email</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            {sent ? "Un code à 6 chiffres a été envoyé à " : "Envoi du code à "}
            <strong className="text-foreground">{email}</strong>
          </p>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Code de vérification
            </label>
            <Input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              className="text-center text-lg tracking-widest font-mono"
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <Button className="w-full py-5 text-sm font-semibold" disabled={loading || otp.length !== 6}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Vérification…</> : "Confirmer"}
          </Button>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" /> Se déconnecter
            </button>
            <button
              type="button"
              onClick={() => sendCode()}
              disabled={sending}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              {sending ? "Envoi…" : "Renvoyer le code"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Vérification requise tous les 7 jours pour la sécurité de votre compte.
        </p>
      </motion.div>
    </div>
  );
};

export default BuyerVerifyOtp;
