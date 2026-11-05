import { useState, type FormEvent } from "react";
import { DASHBOARD_PATH } from "@/dukaio-site/config";
import { createFileRoute, Link, useNavigate } from "@/dukaio-site/router";
import { toast } from "sonner";
import { supabase } from "@/dukaio-site/supabase";
import { Button } from "@/dukaio-site/ui/button";
import { Input } from "@/dukaio-site/ui/input";
import { Logo } from "@/dukaio-site/site/Logo";

export const Route = createFileRoute("/reinitialiser-mot-de-passe")({

  head: () => ({ meta: [
    { title: "Nouveau mot de passe — Dukaio" },
    { name: "description", content: "Choisissez un nouveau mot de passe pour votre compte Dukaio." },
    { property: "og:title", content: "Nouveau mot de passe — Dukaio" },
    { property: "og:description", content: "Choisissez un nouveau mot de passe Dukaio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password")), confirm = String(f.get("confirm"));
    if (password !== confirm) { toast.error("Les deux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error("Lien expiré. Demandez un nouveau lien."); return; }
    toast.success("Mot de passe modifié.");
    navigate({ to: DASHBOARD_PATH, replace: true });
  }
  return (
    <div className="flex min-h-dvh flex-col px-5">
      <div className="mx-auto flex h-20 w-full max-w-md items-center"><Link to="/"><Logo /></Link></div>
      <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 pb-20">
        <h1 className="text-3xl font-semibold">Nouveau mot de passe.</h1>
        <div><label htmlFor="password" className="auth-label">Mot de passe</label><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className="auth-input" /></div>
        <div><label htmlFor="confirm" className="auth-label">Confirmation</label><Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className="auth-input" /></div>
        <Button type="submit" disabled={busy} className="btn-primary h-12 w-full">{busy ? "Enregistrement…" : "Enregistrer"}</Button>
      </form>
    </div>
  );
}
