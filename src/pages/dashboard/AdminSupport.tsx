import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { MessageCircle, Send, X, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Conversation {
  id: string;
  subject: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
}

const AdminSupport = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.email !== "isidoreagonan@gmail.com") return;
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    const { data } = await supabase.functions.invoke("admin-platform", {
      body: { action: "list_support" },
    });
    setConversations(data?.conversations || []);
    setLoading(false);
  };

  const selectConversation = async (id: string) => {
    setSelected(id);
    const { data } = await supabase.functions.invoke("admin-platform", {
      body: { action: "get_messages", conversationId: id },
    });
    setMessages(data?.messages || []);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    const { error } = await supabase.functions.invoke("admin-platform", {
      body: { action: "send_reply", conversationId: selected, content: reply.trim() },
    });
    if (error) {
      toast.error("Erreur d'envoi");
    } else {
      setReply("");
      selectConversation(selected);
    }
    setSending(false);
  };

  const closeConversation = async (id: string) => {
    await supabase.functions.invoke("admin-platform", {
      body: { action: "close_conversation", conversationId: id },
    });
    toast.success("Conversation fermée");
    fetchConversations();
    if (selected === id) setSelected(null);
  };

  const selectedConv = conversations.find((c) => c.id === selected);

  if (user?.email !== "isidoreagonan@gmail.com") {
    return <DashboardLayout><div className="text-center py-20 text-muted-foreground">Accès non autorisé</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-6 w-6" /> Support
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{conversations.filter(c => c.status === "open").length} conversation(s) ouverte(s)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          {/* Conversation list */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Chargement...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Aucune conversation</div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selected === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{c.user_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.subject}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{c.user_email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={c.status === "open" ? "default" : "secondary"} className="text-[10px]">
                        {c.status === "open" ? "Ouvert" : "Fermé"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(c.updated_at), "dd/MM HH:mm", { locale: fr })}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Sélectionnez une conversation
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedConv?.user_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedConv?.subject}</p>
                  </div>
                  {selectedConv?.status === "open" && (
                    <Button size="sm" variant="outline" onClick={() => closeConversation(selected)} className="gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Fermer
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        m.sender_type === "admin"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : m.sender_type === "ai"
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.sender_type === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {m.sender_type === "admin" ? "Admin" : m.sender_type === "ai" ? "IA" : "Utilisateur"} · {format(new Date(m.created_at), "HH:mm", { locale: fr })}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reply */}
                {selectedConv?.status === "open" && (
                  <div className="p-3 border-t border-border flex gap-2">
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Répondre..."
                      className="min-h-[44px] max-h-24 resize-none"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    />
                    <Button onClick={sendReply} disabled={sending || !reply.trim()} size="icon" className="shrink-0 self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSupport;
