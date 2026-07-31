import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2, ShieldCheck, LogOut, Mail } from "lucide-react";

const COOLDOWN_SECONDS = 60;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, refreshProfile } = useAuth();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sentOnceRef = useRef(false);

  // Auto-redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  const sendCode = async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-login-otp");
      if (error) throw error;
      toast.success("Code envoyé par email");
      setCooldown(COOLDOWN_SECONDS);
    } catch (e: any) {
      toast.error(e?.message || "Erreur d'envoi du code");
    } finally {
      setSending(false);
    }
  };

  // Send code automatically on mount
  useEffect(() => {
    if (!loading && user && !sentOnceRef.current) {
      sentOnceRef.current = true;
      void sendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleVerify = async () => {
    if (code.length !== 6 || verifying) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-login-otp", {
        body: { code },
      });
      if (error || !data?.success) {
        throw new Error((data as any)?.error || error?.message || "Code invalide");
      }
      await refreshProfile();
      toast.success("Connexion vérifiée");
      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "Code invalide");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && !verifying) void handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const maskedEmail = user.email
    ? user.email.replace(/^(.{2})(.*)(@.+)$/, (_, a, b, c) => a + "•".repeat(Math.max(2, b.length)) + c)
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-4">
              <ShieldCheck className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Vérification de sécurité</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Pour protéger votre compte, saisissez le code à 6 chiffres envoyé à
            </p>
            <p className="text-sm font-medium mt-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {maskedEmail}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={verifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || verifying}
            className="w-full"
            size="lg"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
          </Button>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={sendCode}
              disabled={sending || cooldown > 0}
              className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
            >
              {sending
                ? "Envoi..."
                : cooldown > 0
                ? `Renvoyer (${cooldown}s)`
                : "Renvoyer le code"}
            </button>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/login", { replace: true });
              }}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Se déconnecter
            </button>
          </div>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Le code est valable 10 minutes. Vous serez ensuite reconnecté pour 5 jours sans avoir besoin de revérifier.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
