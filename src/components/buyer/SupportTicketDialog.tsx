import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  productId: string;
  customerId: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
}
interface Message {
  id: string;
  sender_type: "customer" | "seller";
  content: string;
  created_at: string;
}

const SupportTicketDialog = ({ open, onOpenChange, orderId, productId, customerId }: Props) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: t } = await supabase
      .from("support_tickets")
      .select("id, subject, status")
      .eq("order_id", orderId)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .maybeSingle();
    if (t) {
      setTicket(t as Ticket);
      const { data: msgs } = await supabase
        .from("support_ticket_messages")
        .select("id, sender_type, content, created_at")
        .eq("ticket_id", (t as Ticket).id)
        .order("created_at");
      setMessages((msgs as Message[]) || []);
    } else {
      setTicket(null);
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) void load();
  }, [open, orderId]);

  const createTicket = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Sujet et message requis");
      return;
    }
    setSending(true);
    try {
      // store_owner_id pulled via product
      const { data: prod } = await supabase
        .from("products").select("creator_id").eq("id", productId).single();
      const { data: t, error } = await supabase
        .from("support_tickets")
        .insert({
          order_id: orderId,
          product_id: productId,
          customer_id: customerId,
          store_owner_id: (prod as any).creator_id,
          subject: subject.trim(),
        } as any)
        .select("id, subject, status")
        .single();
      if (error) throw error;
      const ticketRow = t as Ticket;
      await supabase.from("support_ticket_messages").insert({
        ticket_id: ticketRow.id,
        sender_type: "customer",
        sender_id: customerId,
        content: content.trim(),
      } as any);
      setTicket(ticketRow);
      setContent("");
      setSubject("");
      await load();
      toast.success("Ticket envoyé au vendeur");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!ticket || !content.trim()) return;
    setSending(true);
    const { error } = await supabase.from("support_ticket_messages").insert({
      ticket_id: ticket.id,
      sender_type: "customer",
      sender_id: customerId,
      content: content.trim(),
    } as any);
    setSending(false);
    if (error) {
      toast.error("Envoi impossible");
      return;
    }
    setContent("");
    await load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Support pour cette commande
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : ticket ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">Sujet</p>
              <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
              <p className="mt-1 text-[11px] uppercase text-muted-foreground">Statut: {ticket.status}</p>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3 text-sm ${
                    m.sender_type === "customer"
                      ? "bg-primary/10 ml-6"
                      : "bg-secondary mr-6"
                  }`}
                >
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">
                    {m.sender_type === "customer" ? "Vous" : "Vendeur"}
                  </p>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Aucun message.</p>
              )}
            </div>
            <Textarea
              placeholder="Votre réponse…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-20"
            />
            <Button onClick={sendReply} disabled={sending} className="w-full gap-2">
              <Send className="h-4 w-4" /> Envoyer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Sujet (ex: Problème de téléchargement)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Décrivez votre problème en détail…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32"
            />
            <Button onClick={createTicket} disabled={sending} className="w-full gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ouvrir un ticket
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketDialog;
