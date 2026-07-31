import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoreContactFormProps {
  storeOwnerId: string;
  storeName: string;
}

const StoreContactForm = ({ storeOwnerId, storeName }: StoreContactFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Adresse email invalide");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("store-contact", {
        body: {
          store_owner_id: storeOwnerId,
          sender_name: name.trim(),
          sender_email: email.trim(),
          sender_phone: phone.trim() || null,
          message: message.trim(),
        },
      });

      if (error) throw error;
      setSent(true);
      toast.success("Message envoyé avec succès !");
    } catch (err) {
      console.error("Contact error:", err);
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Message envoyé !</h3>
        <p className="text-sm text-muted-foreground">
          {storeName} recevra votre message et vous répondra bientôt.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setName(""); setEmail(""); setPhone(""); setMessage(""); }}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Nom complet *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" required />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Téléphone</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 XX XX XX XX" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Message *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message ici..."
          className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>
      <Button type="submit" disabled={sending} className="w-full gap-2">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Envoyer le message
      </Button>
    </form>
  );
};

export default StoreContactForm;
